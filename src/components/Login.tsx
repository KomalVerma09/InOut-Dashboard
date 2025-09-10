import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useChainId } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { readContract } from 'wagmi/actions';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import { useAuth } from '../contexts/AuthContext';
import Alert from './ui/Alert';
import { 
  Wallet, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Zap,
  Globe,
  Star,
  Gift,
  Trophy,
  Heart,
  UserCheck,
  Copy
} from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { 
    validateUser, 
    isLoading, 
    isRegistered, 
    user,
    isAuthenticated,
    isWrongNetwork
  } = useAuth();
  
  const isWrongNetworkLocal = isConnected && chainId !== polygon.id;
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [referralInfo, setReferralInfo] = useState<{
    address: string;
    isLoading: boolean;
  } | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });
  const [previousAddress, setPreviousAddress] = useState<string | undefined>();

  // Fetch referral information when user is registered
  const fetchReferralInfo = async (userAddress: string) => {
    try {
      setReferralInfo({ address: '', isLoading: true });
      
      console.log('🔍 FETCHING REFERRAL INFO FOR:', userAddress);
      
      // Get referral from affiliate contract
      const affiliateData = await readContract(config, {
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'affiliateUser',
        args: [userAddress],
      });
      
      console.log('📊 AFFILIATE DATA:', affiliateData);
      
      let referralAddress;
      if (Array.isArray(affiliateData)) {
        referralAddress = affiliateData[0];
      } else if (affiliateData && typeof affiliateData === 'object') {
        referralAddress = affiliateData.referral;
      }
      
      console.log('👤 REFERRAL ADDRESS:', referralAddress);
      
      if (referralAddress && referralAddress !== '0x0000000000000000000000000000000000000000') {
        setReferralInfo({ 
          address: referralAddress, 
          isLoading: false 
        });
      } else {
        setReferralInfo(null);
      }
    } catch (error) {
      console.error('❌ Error fetching referral info:', error);
      setReferralInfo(null);
    }
  };

  // Auto-continue to dashboard if already authenticated
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track wallet address changes and show notifications
  React.useEffect(() => {
    if (isAuthenticated && !isWrongNetworkLocal) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isWrongNetworkLocal, navigate]);

  // Track wallet address changes and show notifications
  React.useEffect(() => {
    if (address && address !== previousAddress && previousAddress) {
      console.log('🔄 WALLET CHANGED:', { from: previousAddress, to: address });
      
      setAlert({
        type: 'info',
        title: 'Wallet Changed',
        message: `Switched to ${address.slice(0, 6)}...${address.slice(-4)}. Checking registration...`,
        isVisible: true
      });
    }
    setPreviousAddress(address);
  }, [address, previousAddress]);

  // Show registration status updates
  React.useEffect(() => {
    if (isConnected && !isLoading && isRegistered !== null) {
      if (isRegistered === true) {
        // Fetch referral info when user is registered
        if (address) {
          fetchReferralInfo(address);
        }
        
        // Fetch referral info when user is registered
        if (address) {
          fetchReferralInfo(address);
        }
        
        setAlert({
          type: 'success',
          title: 'Account Verified',
          message: 'This wallet is registered and ready to login!',
          isVisible: true
        });
      } else if (isRegistered === false) {
        setReferralInfo(null);
        setReferralInfo(null);
        setAlert({
          type: 'warning',
          title: 'Account Not Found',
          message: 'This wallet is not registered. Please register first.',
          isVisible: true
        });
      }
    }
  }, [isConnected, isLoading, isRegistered, address]);

  // Handle login button click
  const handleLogin = async () => {
    if (window.triggerHaptic) window.triggerHaptic('medium');
    
    console.log('🔄 LOGIN BUTTON CLICKED');
    
    try {
      const success = await validateUser();
      
      if (success) {
        console.log('✅ LOGIN SUCCESSFUL - User is registered');
        setAlert({
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back to ORION NETWORK',
          isVisible: true
        });
        
        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        console.log('❌ LOGIN FAILED - User not registered');
        setAlert({
          type: 'warning',
          title: 'Account Not Registered',
          message: 'Please register your account first to continue',
          isVisible: true
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Login Failed',
        message: 'An error occurred during login. Please try again.',
        isVisible: true
      });
    }
  };

  const handleWalletConnect = () => {
    if (window.triggerHaptic) window.triggerHaptic('medium');
    
    if (isWrongNetwork) {
      setAlert({
        type: 'error',
        title: 'Wrong Network',
        message: 'Please switch to Polygon network to continue',
        isVisible: true
      });
    } else {
      open();
    }
  };

  const handleSwitchNetwork = () => {
    try {
      open({ view: 'Networks' });
    } catch (error) {
      console.error('❌ Error opening network switcher:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
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

  // If not connected, show wallet connection interface
  if (!isConnected) {
    return (
      <>
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
        />
        
      <div className={`min-h-screen ${isDesktop ? 'desktop-bg' : 'mobile-bg'} flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${isDesktop ? 'max-w-lg' : 'max-w-md'} w-full space-y-8`}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className={`mx-auto ${isDesktop ? 'w-32 h-20' : 'w-20 h-20'} flex items-center justify-center mb-8`}
            >
              <img 
                src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                alt="INOUT NETWORK" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <motion.h1 
              className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-3`}
              variants={itemVariants}
            >
              Connect Your Wallet
            </motion.h1>
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-white/70 mb-2`}
              variants={itemVariants}
            >
              Securely connect to access <span className="gradient-text font-semibold">ORION NETWORK</span>
            </motion.p>
            <motion.div 
              className="flex items-center justify-center space-x-2 text-blue-400"
              variants={itemVariants}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">300+ Wallets Supported</span>
              <Globe className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className={`${isDesktop ? 'glass-card p-8 rounded-3xl' : 'glass-card-mobile p-6 rounded-2xl'} backdrop-blur-xl space-y-6`}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-4">
                <div className={`${isDesktop ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center`}>
                  <Shield className={`${isDesktop ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure Connection</h3>
                  <p className="text-sm text-white/70">Your keys, your crypto - always secure</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`${isDesktop ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center`}>
                  <Zap className={`${isDesktop ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Polygon Network</h3>
                  <p className="text-sm text-white/70">Fast & low-cost transactions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`${isDesktop ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center`}>
                  <Wallet className={`${isDesktop ? 'h-6 w-6' : 'h-5 w-5'} text-white`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Multi-Wallet Support</h3>
                  <p className="text-sm text-white/70">MetaMask, Trust, Coinbase & more</p>
                </div>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <motion.button
              whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={handleWalletConnect}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold ${isDesktop ? 'premium-button' : 'mobile-button'} transition-all duration-300 shadow-xl flex items-center justify-center space-x-3`}
            >
              <Wallet className="h-6 w-6" />
              <span>Connect Wallet</span>
            </motion.button>
          </motion.div>

          {/* Supported Wallets */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-white/60 text-sm mb-4">Popular wallets supported:</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { 
                  name: 'MetaMask', 
                  emoji: '🦊',
                  logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
                },
                { name: 'Trust', emoji: '🛡️' },
                { name: 'TokenPocket', emoji: '💼' },
                { name: 'WalletConnect', emoji: '🔗' },
              ].map((wallet) => (
                <motion.div 
                  key={wallet.name} 
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    {wallet.name === 'MetaMask' ? (
                      <img 
                        src={wallet.logo} 
                        alt="MetaMask" 
                        className="w-8 h-8"
                      />
                    ) : (
                      <span className="text-xl">{wallet.emoji}</span>
                    )}
                  </div>
                  <span className="text-xs text-white/60">{wallet.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Switch to Register */}
          <motion.div 
            className="text-center pt-4 border-t border-white/10"
            variants={itemVariants}
          >
            <span className="text-white/60 text-sm">Don't have an account? </span>
            <motion.button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      </>
    );
  }

  // If connected but wrong network, show network switch interface
  if (isConnected && isWrongNetworkLocal) {
    return (
      <>
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
        />
        
      <div className={`min-h-screen ${isDesktop ? 'desktop-bg' : 'mobile-bg'} flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${isDesktop ? 'max-w-lg' : 'max-w-md'} w-full space-y-8`}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className={`mx-auto ${isDesktop ? 'w-32 h-20' : 'w-20 h-20'} flex items-center justify-center mb-8`}
            >
              
              <img 
                src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                alt="INOUT NETWORK" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <motion.h1 
              className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-3`}
              variants={itemVariants}
            >
              Wrong Network
            </motion.h1>
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-white/70 mb-2`}
              variants={itemVariants}
            >
              Please switch to <span className="gradient-text font-semibold">Polygon Network</span>
            </motion.p>
          </motion.div>

          {/* Network Switch Card */}
          <motion.div
            variants={itemVariants}
            className={`${isDesktop ? 'glass-card p-8 rounded-3xl' : 'glass-card-mobile p-6 rounded-2xl'} backdrop-blur-xl space-y-6`}
          >
            {/* Wrong Network Warning */}
            <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-500/20 p-4 rounded-2xl border border-red-400/30">
              <AlertTriangle className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Wrong Network!</div>
                <div className="text-sm">Please switch to Polygon</div>
              </div>
            </div>

            {/* Connected Wallet Info */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-white/70 text-sm mb-1">Connected Wallet</div>
              <div className="text-white font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <div className="text-red-400 text-sm mt-1">
                Current Network: {chainId === 1 ? 'Ethereum' : chainId === 56 ? 'BSC' : `Chain ${chainId}`}
              </div>
            </div>

            {/* Switch Network Button */}
            <motion.button
              whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwitchNetwork}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-xl flex items-center justify-center space-x-3`}
            >
              <Zap className="h-6 w-6" />
              <span>Switch to Polygon Network</span>
            </motion.button>

            {/* Manual Network Switch Instructions */}
            <div className="text-center text-sm text-white/60">
              <p>Or manually switch in your wallet:</p>
              <div className="mt-2 p-3 bg-white/5 rounded-xl text-left">
                <div className="font-mono text-xs space-y-1">
                  <div><strong>Network Name:</strong> Polygon</div>
                  <div><strong>RPC URL:</strong> https://polygon-rpc.com</div>
                  <div><strong>Chain ID:</strong> 137</div>
                  <div><strong>Symbol:</strong> MATIC</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Switch to Register */}
          <motion.div 
            className="text-center pt-4 border-t border-white/10"
            variants={itemVariants}
          >
            <span className="text-white/60 text-sm">Don't have an account? </span>
            <motion.button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      </>
    );
  }

  // If connected and on correct network, show login interface
  return (
    <>
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
      />
      
    <div className={`min-h-screen ${isDesktop ? 'desktop-bg' : 'mobile-bg'} flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`${isDesktop ? 'max-w-lg' : 'max-w-md'} w-full space-y-8`}
      >
        {/* Logo and Header */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={`mx-auto ${isDesktop ? 'w-32 h-20' : 'w-20 h-20'} flex items-center justify-center mb-8`}
          >
            <img 
              src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
              alt="INOUT NETWORK" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.h1 
            className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-3`}
            variants={itemVariants}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className={`${isDesktop ? 'text-xl' : 'text-lg'} text-white/70 mb-2`}
            variants={itemVariants}
          >
            Sign in to <span className="gradient-text font-semibold">ORION NETWORK</span>
          </motion.p>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-blue-400"
            variants={itemVariants}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Web3 Financial Platform</span>
            <CheckCircle className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={itemVariants}
          className={`${isDesktop ? 'glass-card p-8 rounded-3xl' : 'glass-card-mobile p-6 rounded-2xl'} backdrop-blur-xl`}
        >
          <div className="space-y-6">
            {/* Validation Status */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  isLoading ? 'bg-blue-500/20 border-blue-400/30 text-blue-400' :
                  isRegistered === true ? 'bg-green-500/20 border-green-400/30 text-green-400' :
                  isRegistered === false ? 'bg-orange-500/20 border-orange-400/30 text-orange-400' :
                  'bg-gray-500/20 border-gray-400/30 text-gray-400'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                    />
                    <span>Checking registration status...</span>
                  </>
                ) : isRegistered === true ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Account verified! Ready to login.</span>
                  </>
                ) : isRegistered === false ? (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span>Account not registered. Please register first.</span>
                  </>
                ) : (
                  <>
                    <span>Ready to check registration status</span>
                  </>
                )}
              </motion.div>
            )}

            {/* User Info (if connected) */}
            {user && isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <div className="text-white/70 text-sm mb-1">Connected Wallet</div>
                <div className="text-white font-mono text-sm">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </div>
              </motion.div>
            )}
            
            {/* Referral Gratitude Section */}
            {referralInfo && !referralInfo.isLoading && isRegistered === true && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 animate-gradient rounded-2xl"></div>
                
                {/* Floating hearts animation */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-pink-400 opacity-60"
                    animate={{
                      y: [0, -20, 0],
                      x: [0, Math.sin(i) * 10, 0],
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${10 + (i % 2) * 20}%`
                    }}
                  >
                    <Heart className="h-3 w-3 fill-current" />
                  </motion.div>
                ))}
                
                <div className="relative z-10 p-6 rounded-2xl border border-gradient-to-r from-pink-400/30 to-purple-400/30">
                  <div className="text-center">
                    {/* Celebration Header */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-4xl mb-3"
                    >
                      🎉✨🙏
                    </motion.div>
                    
                    <motion.h3 
                      className="text-lg font-bold text-white mb-2"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Welcome to the ORION Family! 🚀
                    </motion.h3>
                    
                    <p className="text-white/80 text-sm mb-4">
                      You joined through an amazing mentor who believes in your success! 💫
                    </p>
                    
                    {/* Referral Info Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white/70 text-xs">Your Mentor</div>
                          <div className="text-white font-mono text-sm font-bold">
                            {referralInfo.address.slice(0, 8)}...{referralInfo.address.slice(-6)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-yellow-400 text-sm font-semibold mb-1"
                        >
                          🌟 Thank you for trusting us! 🌟
                        </motion.div>
                        <p className="text-white/60 text-xs">
                          Together, we'll build your financial freedom! 💎
                        </p>
                      </div>
                    </motion.div>
                    
                    {/* Gratitude Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 text-center"
                    >
                      <div className="text-2xl mb-2">🤝💖</div>
                      <p className="text-white/70 text-xs italic">
                        "Success is sweeter when shared with those who believed in you first"
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Loading referral info */}
            {referralInfo?.isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30 flex items-center space-x-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                />
                <span className="text-blue-400 text-sm">Loading your mentor info...</span>
              </motion.div>
            )}
            
            {/* Debug Info */}
            {isConnected && process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-500/20 rounded-xl border border-gray-400/30 text-xs"
              >
                <div className="text-white/70 mb-1">Debug Info:</div>
                <div className="text-white/60 space-y-1">
                  <div>Connected: {isConnected ? '✅' : '❌'}</div>
                  <div>Registered: {isRegistered === true ? '✅' : isRegistered === false ? '❌' : '⏳'}</div>
                  <div>Loading: {isLoading ? '⏳' : '✅'}</div>
                  <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!isConnected ? (
              <motion.button
                whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={handleWalletConnect}
                className={`w-full py-4 px-6 rounded-2xl text-white font-semibold ${isDesktop ? 'premium-button' : 'mobile-button'} transition-all duration-300 shadow-xl flex items-center justify-center space-x-3`}
              >
                <Wallet className="h-6 w-6" />
                <span>Connect Wallet</span>
              </motion.button>
            ) : (
              // Show appropriate button based on registration status
              isRegistered === true ? (
                <motion.button
                  whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    console.log('✅ PROCEEDING TO DASHBOARD - User is registered');
                    navigate('/dashboard');
                  }}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50`}
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>Proceed to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              ) : isRegistered === false ? (
                <div className="space-y-3">
                  <motion.button
                    whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSwitchToRegister}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-xl flex items-center justify-center space-x-3`}
                  >
                    <span>Register New Account</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              ) : (
                // Default login button when registration status is unknown
                <motion.button
                  whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50`}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Wallet className="h-6 w-6" />
                      <span>Login</span>
                    </>
                  )}
                </motion.button>
              )
            )}

            {/* Additional Check Registration Button for registered users */}
            {isConnected && isRegistered === false && (
              <motion.button
                whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-2xl text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                <span>Check Registration Again</span>
              </motion.button>
            )}

            {/* Features */}
            <motion.div 
              className="grid grid-cols-1 gap-3"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-white/80 text-sm">Secure Web3 Authentication</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span className="text-white/80 text-sm">No Passwords Required</span>
              </div>
            </motion.div>

            {/* Switch to Register */}
            <motion.div 
              className="text-center pt-4 border-t border-white/10"
              variants={itemVariants}
            >
              <span className="text-white/60 text-sm">Don't have an account? </span>
              <motion.button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/60 text-xs">Secured by Web3 Technology</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default Login;