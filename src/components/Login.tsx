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
import Tilt from 'react-parallax-tilt';
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
  Copy,
  ChevronLeft,
  ChevronRight
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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch referral information when user is registered
  const fetchReferralInfo = async (userAddress: string) => {
    try {
      setReferralInfo({ address: '', isLoading: true });
      
      console.log('🔍 FETCHING REFERRAL INFO FOR:', userAddress);
      
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

  const [currentIndex, setCurrentIndex] = React.useState(0);
  
    const nextSlide = () =>
      setCurrentIndex((prev) => (prev + 1) % features.length);
    const prevSlide = () =>
      setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    

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

  React.useEffect(() => {
    if (isConnected && !isLoading && isRegistered !== null) {
      if (isRegistered === true) {
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
        setAlert({
          type: 'warning',
          title: 'Account Not Found',
          message: 'This wallet is not registered. Please register first.',
          isVisible: true
        });
      }
    }
  }, [isConnected, isLoading, isRegistered, address]);

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
          message: 'Welcome back to INOUT NETWORK',
          isVisible: true
        });
        
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

  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const features = [
    {
      icon: <Shield className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'Secure Connection',
      description: 'Your keys, your crypto - always secure'
    },
    {
      icon: <Zap className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'Polygon Network',
      description: 'Fast & low-cost transactions'
    },
    {
      icon: <Wallet className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'Multi-Wallet Support',
      description: 'MetaMask, Trust, Coinbase & more'
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
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
        
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${isDesktop ? 'max-w-xl' : 'max-w-md'} w-full space-y-8 border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black rounded-2xl p-6`}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.img
              src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png"
              alt="INOUT NETWORK"
              className={`w-28 mx-auto`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <motion.h1 
              className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-indigo-100 mb-3 font-orbitron`}
              variants={itemVariants}
            >
              Connect Your Wallet
            </motion.h1>
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-indigo-200/70 mb-2`}
              variants={itemVariants}
            >
              Securely connect to access <span className="font-semibold text-indigo-400">INOUT NETWORK</span>
            </motion.p>
            <motion.div 
              className="flex items-center justify-center space-x-2 text-indigo-300"
              variants={itemVariants}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">300+ Wallets Supported</span>
              <Globe className="h-4 w-4" />
            </motion.div>
          </motion.div>

          <div className="relative w-full max-w-[95%] sm:max-w-xl">
                  {/* Prev Button */}
                  <motion.button
                  whileHover={isDesktop ? {boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                    onClick={prevSlide}
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 bg-white/10 hover:bg-indigo-800 rounded-full z-10 border border-indigo-800/20" 
                    
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
          
                  <motion.div
                    key={currentIndex}
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 0.9, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
                      <div className="bg-white/10 backdrop-blur-lg border border-indigo-800/20 rounded-2xl p-6 sm:p-8 shadow-2xl w-full sm:w-[550px] text-center">
                        <div className="flex justify-center mb-4">
                          {features[currentIndex].icon}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-orbitron">
                          {features[currentIndex].title}
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm ">
                          {features[currentIndex].description}
                        </p>
                      </div>
                    </Tilt>
                  </motion.div>
          
                  {/* Next Button */}
                  <motion.button
                  whileHover={isDesktop ? {boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                    onClick={nextSlide}
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 bg-white/10 hover:bg-indigo-800 rounded-full z-10 border border-indigo-800/20"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

          

          {/* Supported Wallets */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-indigo-200/60 text-sm mb-4">Popular wallets supported:</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { 
                  name: 'MetaMask', 
                  emoji: '🦊',
                  logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
                },
                { name: 'Trust', emoji: '🔐' },
                { name: 'TokenPocket', emoji: '📲' },
                { name: 'WalletConnect', emoji: '🌐' },
              ].map((wallet) => (
                <motion.button
                            key={wallet.name}
                            whileHover={{ scale: 1.05, }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => open()}
                            className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-lg border border-indigo-800/20 rounded-xl p-3 sm:p-4 text-white hover:bg-white/5 transition"
                          >
                            <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">
                              {wallet.emoji}
                            </span>
                            <span className="text-xs sm:text-sm md:flex hidden ">{wallet.name}</span>
                          </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Connect Wallet Button */}
          <motion.button
            whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={handleWalletConnect}
            className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-indigo-700 hover:bg-indigo-800 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 glow-effect`}
            style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
          >
            <Wallet className="h-6 w-6" />
            <span className="font-orbitron">Connect Wallet</span>
          </motion.button>

          {/* Switch to Register */}
          <motion.div 
            className="text-center pt-4 border-t border-indigo-800/20"
            variants={itemVariants}
          >
            <span className="text-indigo-200/60 text-sm">Don't have an account? </span>
            <motion.button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
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
        
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${isDesktop ? 'max-w-lg' : 'max-w-md'} w-full space-y-8 border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black rounded-2xl p-6`}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.img
              src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png"
              alt="INOUT NETWORK"
              className={`w-28 mx-auto`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <motion.h1 
              className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-indigo-100 mb-3`}
              variants={itemVariants}
            >
              Wrong Network
            </motion.h1>
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-indigo-200/70 mb-2`}
              variants={itemVariants}
            >
              Please switch to <span className="font-semibold text-indigo-400">Polygon Network</span>
            </motion.p>
          </motion.div>

          {/* Network Switch Card */}
          <Tilt
            tiltMaxAngleX={15}
            tiltMaxAngleY={15}
            perspective={1000}
            scale={1.02}
            transitionSpeed={2000}
            glareEnable={true}
            glareMaxOpacity={0.2}
            glareColor="#ffffff"
            glarePosition="all"
          >
            <motion.div
              variants={itemVariants}
              className={`${isDesktop ? 'p-8' : 'p-6'} bg-indigo-900/30 backdrop-blur-xl border border-indigo-800/20 rounded-xl shadow-2xl`}
            >
              {/* Wrong Network Warning */}
              <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-500/20 p-4 rounded-xl border border-red-400/30">
                <AlertTriangle className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Wrong Network!</div>
                  <div className="text-sm">Please switch to Polygon</div>
                </div>
              </div>

              {/* Connected Wallet Info */}
              <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-800/20 mt-4">
                <div className="text-indigo-200/70 text-sm mb-1">Connected Wallet</div>
                <div className="text-indigo-100 font-mono text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div className="text-red-400 text-sm mt-1">
                  Current Network: {chainId === 1 ? 'Ethereum' : chainId === 56 ? 'BSC' : `Chain ${chainId}`}
                </div>
              </div>

              {/* Switch Network Button */}
              <motion.button
                whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={handleSwitchNetwork}
                className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-indigo-700 hover:bg-indigo-800 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 mt-4 glow-effect`}
                style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
              >
                <Zap className="h-6 w-6" />
                <span>Switch to Polygon Network</span>
              </motion.button>

              {/* Manual Network Switch Instructions */}
              <div className="text-center text-sm text-indigo-200/60 mt-4">
                <p>Or manually switch in your wallet:</p>
                <div className="mt-2 p-3 bg-indigo-900/20 rounded-xl text-left">
                  <div className="font-mono text-xs space-y-1 text-indigo-200">
                    <div><strong>Network Name:</strong> Polygon</div>
                    <div><strong>RPC URL:</strong> https://polygon-rpc.com</div>
                    <div><strong>Chain ID:</strong> 137</div>
                    <div><strong>Symbol:</strong> MATIC</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Tilt>

          {/* Switch to Register */}
          <motion.div 
            className="text-center pt-4 border-t border-indigo-800/20"
            variants={itemVariants}
          >
            <span className="text-indigo-200/60 text-sm">Don't have an account? </span>
            <motion.button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
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
      
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex items-center justify-center ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`${isDesktop ? 'max-w-lg' : 'max-w-md'} w-full space-y-8 border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black rounded-2xl p-6`}
      >
        {/* Logo and Header */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.img
              src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png"
              alt="INOUT NETWORK"
              className={`w-28 mx-auto`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          
          <motion.h1 
            className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-indigo-100 mb-3 font-orbitron`}
            variants={itemVariants}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className={`${isDesktop ? 'text-xl' : 'text-lg'} text-indigo-200/70 mb-2`}
            variants={itemVariants}
          >
            Sign in to <span className="font-semibold text-indigo-400">INOUT NETWORK</span>
          </motion.p>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-indigo-300"
            variants={itemVariants}
          >
            <Star className="h-4 w-4" />
            <span className="text-sm">Web3 Financial Platform</span>
            <Star className="h-4 w-4" />
            
          </motion.div>
        </motion.div>

        {/* Login Form */}
        
          <motion.div
            variants={itemVariants}
            className={``}
          >
            <div className="space-y-6">
              {/* Validation Status */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border flex items-center space-x-3 ${
                    isLoading ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' :
                    isRegistered === true ? 'bg-green-600/20 border-green-500/30 text-green-400' :
                    isRegistered === false ? 'bg-orange-600/20 border-orange-500/30 text-orange-400' :
                    'bg-gray-600/20 border-gray-500/30 text-gray-400'
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
                  className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-800/20"
                >
                  <div className="text-indigo-200/70 text-sm mb-1">Connected Wallet</div>
                  <div className="text-indigo-100 font-mono text-sm">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </div>
                </motion.div>
              )}
              
              {/* Referral Gratitude Section */}
              {referralInfo && !referralInfo.isLoading && isRegistered === true && (
                <Tilt
                  tiltMaxAngleX={15}
                  tiltMaxAngleY={15}
                  perspective={1000}
                  scale={1.02}
                  transitionSpeed={2000}
                  glareEnable={true}
                  glareMaxOpacity={0.2}
                  glareColor="#ffffff"
                  glarePosition="all"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    className="relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 animate-gradient rounded-xl"></div>
                    
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-indigo-400 opacity-60"
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
                    
                    <div className="relative z-10 p-6 rounded-xl border border-indigo-600/30">
                      <div className="text-center">
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
                          className="text-lg font-bold text-indigo-100 mb-2"
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #3b82f6 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          Welcome to the INOUT Family! 🚀
                        </motion.h3>
                        
                        <p className="text-indigo-200/80 text-sm mb-4">
                          You joined through an amazing mentor who believes in your success! 💫
                        </p>
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-800/20 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-indigo-100" />
                            </div>
                            <div>
                              <div className="text-indigo-200/70 text-xs">Your Mentor</div>
                              <div className="text-indigo-100 font-mono text-sm font-bold">
                                {referralInfo.address.slice(0, 8)}...{referralInfo.address.slice(-6)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-indigo-300 text-sm font-semibold mb-1"
                            >
                              🌟 Thank you for trusting us! 🌟
                            </motion.div>
                            <p className="text-indigo-200/60 text-xs">
                              Together, we'll build your financial freedom! 💎
                            </p>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-4 text-center"
                        >
                          <div className="text-2xl mb-2">🤝💖</div>
                          <p className="text-indigo-200/70 text-xs italic">
                            "Success is sweeter when shared with those who believed in you first"
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              )}
              
              {/* Loading referral info */}
              {referralInfo?.isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center space-x-3"
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
                  className="p-3 bg-gray-600/20 rounded-xl border border-gray-500/30 text-xs"
                >
                  <div className="text-indigo-200/70 mb-1">Debug Info:</div>
                  <div className="text-indigo-200/60 space-y-1">
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
                  whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWalletConnect}
                  className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-indigo-700 hover:bg-indigo-800 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 glow-effect`}
                  style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
                >
                  <Wallet className="h-6 w-6" />
                  <span className='font-orbitron'>Connect Wallet</span>
                </motion.button>
              ) : (
                isRegistered === true ? (
                  <motion.button
                    whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log('✅ PROCEEDING TO DASHBOARD - User is registered');
                      navigate('/dashboard');
                    }}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 glow-effect`}
                    style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Proceed to Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                ) : isRegistered === false ? (
                  <div className="space-y-3">
                    <motion.button
                      whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                      whileTap={{ scale: 0.95 }}
                      onClick={onSwitchToRegister}
                      className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 glow-effect`}
                      style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
                    >
                      <span className='font-orbitron'>Register New Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-indigo-700 hover:bg-indigo-800 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 glow-effect`}
                    style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-indigo-100 border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Wallet className="h-6 w-6" />
                        <span className='font-orbitron'>Login</span>
                      </>
                    )}
                  </motion.button>
                )
              )}

              {/* Additional Check Registration Button for registered users */}
              {isConnected && isRegistered === false && (
                <motion.button
                  whileHover={isDesktop ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-xl text-indigo-200/70 hover:text-indigo-100 border border-indigo-800/20 hover:border-indigo-700/40 transition-all duration-200 flex items-center justify-center space-x-2`}
                >
                  <span className=''>Check Registration Again</span>
                </motion.button>
              )}

              {/* Features Slider */}
              <motion.div 
                className="relative overflow-hidden"
                variants={itemVariants}
              >
                <div className="relative">
                  
                    <motion.div
                      key={currentSlide}
                      variants={slideVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.5 }}
                      className={`${isDesktop ? 'p-8' : 'p-6'} bg-indigo-900/30 backdrop-blur-xl border border-indigo-800/20 rounded-xl shadow-2xl`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${isDesktop ? 'w-16 h-16' : 'w-12 h-12'} bg-indigo-600 rounded-xl flex items-center justify-center`}>
                          {features[currentSlide].icon}
                        </div>
                        <div>
                          <h3 className="text-indigo-100 font-semibold text-lg font-orbitron">{features[currentSlide].title}</h3>
                          <p className="text-sm text-indigo-200/70">{features[currentSlide].description}</p>
                        </div>
                      </div>
                    </motion.div>
                  <div className="flex justify-between mt-4 px-1 pb-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePrevSlide}
                      className="p-2 bg-indigo-800/50 rounded-full text-indigo-300 hover:bg-indigo-700/50"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleNextSlide}
                      className="p-2 bg-indigo-800/50 rounded-full text-indigo-300 hover:bg-indigo-700/50"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Switch to Register */}
              <motion.div 
                className="text-center pt-4 border-t border-indigo-800/20"
                variants={itemVariants}
              >
                <span className="text-indigo-200/60 text-sm">Don't have an account? </span>
                <motion.button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        {/* </Tilt> */}

        {/* Security Badge */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-900/20 rounded-full border border-indigo-800/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-indigo-200/60 text-xs">Secured by Web3 Technology</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
};

export default Login;