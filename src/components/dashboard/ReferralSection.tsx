import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Users, Share2, Gift, Crown } from 'lucide-react';
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
    setTimeout(() => setIsCopied(false), 2000);
  };

  const validateWalletAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

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
      setThirdPartyRegistrationStage({ stage: 'sending', message: 'Sending transaction...', progress: 40 });
      const txHash = await writeContractAsync({
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'regThirdParty',
        args: [walletAddress, address],
        gas: 1000000n,
        gasPrice: parseGwei('35'),
      });
      setThirdPartyRegistrationStage({ stage: 'confirming', message: 'Confirming...', progress: 70, txHash });
      const receipt = await new Promise((resolve, reject) => {
        const check = async () => {
          try {
            const r = await config.publicClient.getTransactionReceipt({ hash: txHash });
            if (r) resolve(r); else setTimeout(check, 2000);
          } catch (err) { reject(err); }
        };
        check();
      });
      if (receipt && receipt.status === 'success') {
        setThirdPartyRegistrationStage({ stage: 'success', message: 'Registered!', progress: 100, txHash });
        setWalletAddress('');
        setShowRegistrationPopup(false);
        toast.success('Registration successful!');
      } else {
        setThirdPartyRegistrationStage({ stage: 'error', message: 'Transaction failed', progress: 0, txHash });
      }
    } catch (error: any) {
      setThirdPartyRegistrationStage({ stage: 'error', message: error.message || 'Registration failed', progress: 0 });
    }
  };

  const resetThirdPartyRegistration = () => {
    setThirdPartyRegistrationStage({ stage: 'idle', message: '', progress: 0 });
    setWalletAddress('');
    setShowRegistrationPopup(false);
  };

  // NEW LOOK: Grid layout card with side-by-side structure
  return (
    <div className="relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift">
      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT: Info and benefits */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-indigo-300 font-orbitron">Copy and Share your referral link</h2>
          <p className="text-white/60 text-sm md:text-base">Invite users with your link and grow your network.</p>

          

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-indigo-900/30 border border-indigo-700/30 text-center">
              <Gift className="mx-auto mb-1 text-indigo-300" />
              <div className="text-white font-bold">5%</div>
              <div className="text-indigo-400/70 text-xs">Commission</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-900/30 border border-indigo-700/30 text-center">
              <Users className="mx-auto mb-1 text-indigo-300" />
              <div className="text-white font-bold">{totalTeam}</div>
              <div className="text-indigo-400/70 text-xs">Total Team</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-900/30 border border-indigo-700/30 text-center">
              <Crown className="mx-auto mb-1 text-indigo-300" />
              <div className="text-white font-bold">{directTeam}</div>
              <div className="text-indigo-400/70 text-xs">Direct Team</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Referral link + actions */}
        <div className="flex-1 space-y-4">
          <div className='text-center'>
            {hasTagName && tagName && (
            <div className="inline-block px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40">
              <span className="text-indigo-300 font-semibold font">Tag: {tagName}</span>
            </div>
          )}
          </div>
          <div className="bg-black/30 border border-indigo-600/30 rounded-2xl p-4">
            <label className="text-xs text-white/50 uppercase tracking-wide">Referral Link</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-white text-sm font-mono truncate focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={copyReferralLink}
                className={`p-2 rounded-lg transition ${isCopied ? 'bg-green-500/80' : 'bg-indigo-600/70 hover:bg-indigo-600 text-white'}`}
              >
                {isCopied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRegistrationPopup(true)}
            className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white shadow-lg"
          >
            Register New User
          </motion.button>
        </div>
      </div>

      {/* Registration Popup */}
      {showRegistrationPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowRegistrationPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-indigo-800 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-indigo-300 mb-4 text-center">Third Party Registration</h3>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet (0x...)"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-indigo-700/40 text-white placeholder-white/40 font-mono mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegistrationPopup(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >Cancel</button>
              <button
                onClick={handleRegisterThirdParty}
                disabled={!walletAddress || !validateWalletAddress(walletAddress)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-600 disabled:opacity-50 text-white font-semibold"
              >Register</button>
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
    </div>
  );
};

export default ReferralSection;
