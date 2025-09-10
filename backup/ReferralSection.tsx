import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Users, Share2, ExternalLink, Sparkles, Gift, Crown } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { CONTRACTS } from '../../contracts';
import { parseGwei } from 'viem';
import { config } from '../../config/web3Config';
import toast from 'react-hot-toast';
import { RegistrationStage } from '../../hooks/useRegistration';
import TransactionProgress from '../ui/TransactionProgress';

interface ReferralSectionProps {
  isDesktop: boolean;
  registrationStage: RegistrationStage;
  resetRegistration: () => void;
  tagName: string;
  hasTagName: boolean;
  tokenPrice: number;
  totalTeam: number;
  directTeam: number;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ 
  isDesktop, 
  registrationStage, 
  resetRegistration,
  tagName,
  hasTagName,
  tokenPrice,
  totalTeam,
  directTeam
}) => {
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const { writeContractAsync } = useWriteContract();
  const [isCopied, setIsCopied] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [thirdPartyRegistrationStage, setThirdPartyRegistrationStage] = useState<RegistrationStage>({
    stage: 'idle',
    message: '',
    progress: 0
  });

  const referralLink = `${window.location.origin}/register/invite/${address}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    if (window.triggerHaptic) window.triggerHaptic('light');
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const validateWalletAddress = (addr: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(addr);
  };

  const handleRegisterThirdParty = async () => {
    if (!walletAddress || !validateWalletAddress(walletAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    if (!address) {
      toast.error('Your wallet is not connected');
      return;
    }

    try {
      // Stage 1: Validating
      setThirdPartyRegistrationStage({
        stage: 'validating',
        message: 'Validating wallet address...',
        progress: 20
      });

      // Stage 2: Sending transaction
      setThirdPartyRegistrationStage({
        stage: 'sending',
        message: 'Sending registration transaction...',
        progress: 50
      });
      
      // Call regThirdParty function
      const txHash = await writeContractAsync({
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'regThirdParty',
        args: [walletAddress, address], // user, referral
        gas: 1000000n,
        gasPrice: parseGwei('35'),
      });

      console.log('✅ Third party registration transaction sent:', txHash);
      
      // Stage 3: Confirming
      setThirdPartyRegistrationStage({
        stage: 'confirming',
        message: 'Waiting for blockchain confirmation...',
        progress: 75,
        txHash
      });
      
      // Wait for transaction confirmation
      const receipt = await new Promise((resolve, reject) => {
        const checkReceipt = async () => {
          try {
            const receipt = await config.publicClient.getTransactionReceipt({ hash: txHash });
            if (receipt) {
              resolve(receipt);
            } else {
              setTimeout(checkReceipt, 2000);
            }
          } catch (error) {
            reject(error);
          }
        };
        checkReceipt();
      });

      if (receipt && receipt.status === 'success') {
        // Stage 4: Success
        setThirdPartyRegistrationStage({
          stage: 'success',
          message: 'Third party registration successful!',
          progress: 100,
          txHash
        });
        
        setWalletAddress('');
        setShowRegistrationPopup(false);
        toast.success('Registration successful!');
      } else {
        setThirdPartyRegistrationStage({
          stage: 'error',
          message: 'Transaction failed on blockchain',
          progress: 0,
          txHash
        });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setThirdPartyRegistrationStage({
        stage: 'error',
        message: error.message || 'Registration failed',
        progress: 0
      });
    }
  };

  const resetThirdPartyRegistration = () => {
    setThirdPartyRegistrationStage({
      stage: 'idle',
      message: '',
      progress: 0
    });
    setWalletAddress('');
    setShowRegistrationPopup(false);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (!isDesktop) {
    // Mobile: Full-width premium referral card
    return (
      <>
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden card-cosmic hover-lift backdrop-blur-xl rounded-3xl p-6 border border-indigo-400/30 shadow-2xl mx-4"
      >

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
              <Share2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl font-orbitron">Share & Earn</h3>
              <p className="text-indigo-400/80 text-sm">Invite friends to join ORION</p>
            </div>
          </div>

          {/* Tag Name Display */}
          {hasTagName && tagName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-2xl px-6 py-3 border border-blue-400/40">
                <span className="text-blue-400 text-lg font-bold">{tagName}</span>
              </div>
            </motion.div>
          )}

          {/* Referral Benefits */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-bold text-sm">5%</div>
              <div className="text-green-400/80 text-xs">Commission</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-bold text-sm">{totalTeam || 0}</div>
              <div className="text-blue-400/80 text-xs">Total Team</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-bold text-sm">{directTeam || 0}</div>
              <div className="text-yellow-400/80 text-xs">Direct Team</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 backdrop-blur-sm mb-4">
            <div className="text-white/70 text-xs mb-2 uppercase tracking-wide">Your Referral Link</div>
            <div className="text-white text-sm font-mono break-all leading-relaxed">
              {referralLink}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyReferralLink}
              className={`flex-1 py-4 px-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                isCopied 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>Copy Link</span>
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegistrationPopup(true)}
              className="px-4 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <span className="text-sm">Register</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Registration Popup for Mobile */}
      {showRegistrationPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={() => setShowRegistrationPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${isDesktop ? 'max-w-md w-full' : 'w-full max-w-sm'} bg-gray-800 rounded-3xl p-6 relative`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Register Third Party</h3>
              <p className="text-white/70 text-sm">Enter wallet address to register under your referral</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all font-mono text-sm"
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRegistrationPopup(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegisterThirdParty}
                  disabled={!walletAddress || !validateWalletAddress(walletAddress)}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all disabled:opacity-50"
                >
                  Register
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction Progress Modal */}
      <TransactionProgress
        stage={thirdPartyRegistrationStage}
        isVisible={thirdPartyRegistrationStage.stage !== 'idle'}
        onClose={resetThirdPartyRegistration}
      />
      </>
    );
  }

  // Desktop: Enhanced design with rich backgrounds
  return (
    <>
    <motion.div
      variants={itemVariants}
      className="card-cosmic p-8 hover-lift"
      whileHover={{ y: -8 }}
    >
      {/* Animated background elements */}
      {/* <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-gradient"></div> */}

      {/* Floating sparkles */}
      {/* {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400/30"
          animate={{
            y: [0, -15, 0],
            x: [0, Math.sin(i) * 8, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 3 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.3
          }}
          style={{
            left: `${5 + i * 8}%`,
            top: `${5 + (i % 3) * 25}%`
          }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      ))} */}

      <div className="relative z-10 ">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-xl">
            <Share2 className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white font-orbitron">Copy and Share your referral link</h3>
            <p className="text-indigo-400/80 text-lg">Invite friends and earn rewards</p>
          </div>
        </div>

        {/* Referral Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-4 border border-green-400/30 flex gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center ">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">5%</div>
            <div className="text-green-400/80 text-sm">Direct Commission</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-400/30 flex gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center ">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{totalTeam}</div>
            <div className="text-blue-400/80 text-sm">Total Team</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl p-4 border border-yellow-400/30 flex gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{directTeam}</div>
            <div className="text-yellow-400/80 text-sm">Direct Team</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full bg-transparent text-white text-sm font-mono focus:outline-none"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyReferralLink}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-lg ${
              isCopied 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
            }`}
          >
            {isCopied ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <Copy className="h-6 w-6" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRegistrationPopup(true)}
            className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all shadow-lg disabled:opacity-50"
          >
            Register User
          </motion.button>
        </div>
      </div>

      {/* Registration Popup for Desktop */}
      {showRegistrationPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={() => setShowRegistrationPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-gray-800 rounded-3xl p-8 relative"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Register Third Party</h3>
              <p className="text-white/70">Enter wallet address to register under your referral</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all font-mono"
                />
              </div>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRegistrationPopup(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegisterThirdParty}
                  disabled={!walletAddress || !validateWalletAddress(walletAddress)}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all disabled:opacity-50"
                >
                  Register
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction Progress Modal for Desktop */}
      <TransactionProgress
        stage={thirdPartyRegistrationStage}
        isVisible={thirdPartyRegistrationStage.stage !== 'idle'}
        onClose={resetThirdPartyRegistration}
      />
    </motion.div>
    </>
  );
};

export default ReferralSection;