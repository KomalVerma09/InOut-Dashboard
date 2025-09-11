import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';
import { useRegistration } from '../hooks/useRegistration';
import Alert from './ui/Alert';
import TransactionProgress from './ui/TransactionProgress';
import Tilt from 'react-parallax-tilt';
import { 
  ArrowRight, 
  Users, 
  Sparkles, 
  Shield, 
  Wallet, 
  Gift, 
  Star, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Crown,
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean;
    message: string;
    isChecking: boolean;
  } | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    referralAddress: string;
    isValid: boolean;
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
  const [currentSlide, setCurrentSlide] = useState(0);

  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { 
    getReferralFromUrl, 
    validateReferralAddress
  } = useAuth();
  
  const {
    registrationStage,
    registerUser,
    resetRegistration,
    validateReferralFormat,
    validateReferralExists
  } = useRegistration();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const inviteParam = inviteCode || searchParams.get('invite');
    
    if (inviteParam && validateReferralAddress(inviteParam)) {
      console.log('✅ Valid invite parameter found:', inviteParam);
      setReferralCode(inviteParam);
      validateAndShowWelcome(inviteParam);
    } else {
      console.log('❌ No valid invite parameter found in Register component');
    }
  }, [inviteCode, searchParams, validateReferralAddress]);

  const validateAndShowWelcome = async (referralAddress: string) => {
    try {
      console.log('🔍 Validating referral for welcome screen:', referralAddress);
      const isValid = await validateReferralExists(referralAddress);
      
      if (isValid) {
        console.log('✅ Referral is valid, showing welcome screen');
        setWelcomeData({
          referralAddress,
          isValid: true
        });
        setShowWelcome(true);
      } else {
        console.log('❌ Referral is not valid, no welcome screen');
      }
    } catch (error) {
      console.error('❌ Error validating referral for welcome:', error);
    }
  };

  const handleReferralChange = async (value: string) => {
    setReferralCode(value);
    setReferralValidation(null);
    
    if (value && value.length >= 42) {
      if (!validateReferralFormat(value)) {
        setReferralValidation({
          isValid: false,
          message: 'Invalid address format. Must start with 0x and be 42 characters long.',
          isChecking: false
        });
        return;
      }
      
      setReferralValidation({
        isValid: false,
        message: 'Checking referral validity...',
        isChecking: true
      });
      
      try {
        const isValid = await validateReferralExists(value);
        
        setReferralValidation({
          isValid,
          message: isValid 
            ? 'Valid referral address found! Ready for registration.' 
            : 'Referral address not found or inactive. Please check the address.',
          isChecking: false
        });
        
        if (isValid) {
          setWelcomeData({
            referralAddress: value,
            isValid: true
          });
          setShowWelcome(true);
        }
      } catch (error) {
        setReferralValidation({
          isValid: false,
          message: 'Error checking referral. Please try again.',
          isChecking: false
        });
      }
    }
  };

  const handleConnectWallet = () => {
    if (window.triggerHaptic) window.triggerHaptic('medium');
    open();
  };

  const handleRegister = async () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }

    setIsLoading(true);
    let finalReferral = referralCode;

    if (!finalReferral) {
      setIsLoading(false);
      setAlert({
        type: 'warning',
        title: 'Referral Required',
        message: 'Please enter a referral wallet address to continue',
        isVisible: true
      });
      return;
    }

    if (!validateReferralFormat(finalReferral)) {
      setIsLoading(false);
      setAlert({
        type: 'error',
        title: 'Invalid Address',
        message: 'Please enter a valid wallet address starting with 0x',
        isVisible: true
      });
      return;
    }

    if (window.triggerHaptic) window.triggerHaptic('medium');
    
    try {
      const success = await registerUser(finalReferral);
      if (success) {
        setAlert({
          type: 'success',
          title: 'Registration Successful!',
          message: 'Welcome to INOUT NETWORK! You can now login.',
          isVisible: true
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({
        type: 'error',
        title: 'Registration Failed',
        message: (error as any)?.message || 'An error occurred during registration',
        isVisible: true
      });
    } finally {
      setIsLoading(false);
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
      icon: <TrendingUp className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'Daily Returns',
      description: 'Earn up to 0.5% daily on your investments'
    },
    {
      icon: <Users className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'Team Building',
      description: 'Grow your network, earn more rewards'
    },
    {
      icon: <Crown className={`${isDesktop ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-100`} />,
      title: 'VIP Status',
      description: 'Unlock exclusive benefits and perks'
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <>
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
      />
      
      <TransactionProgress
        stage={registrationStage}
        isVisible={registrationStage.stage !== 'idle'}
        onClose={() => {
          resetRegistration();
          if (registrationStage.stage === 'success') {
            navigate('/login');
          }
        }}
      />
      
      {/* Animated Welcome Overlay */}
      {showWelcome && welcomeData && welcomeData.isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-indigo-950/90 to-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${isDesktop ? 'max-w-3xl' : 'max-w-sm max-h-[95vh]'} w-full text-center space-y-6 border border-indigo-800/20 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl shadow-2xl p-8 overflow-y-auto scrollbar-hide`}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-indigo-400/30 rounded-full"
                  animate={{
                    x: [0, Math.random() * 100 - 50, 0],
                    y: [0, Math.random() * 100 - 50, 0],
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 1.5
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>

            {/* Logo */}
            <motion.img
                          src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png"
                          alt="INOUT NETWORK"
                          className={`w-28 mx-auto`}
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />

            {/* Welcome Message */}
            <motion.h1 
              className={`${isDesktop ? 'text-5xl' : 'text-3xl'} font-bold font-orbitron mb-4`}
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
              Welcome to INOUT NETWORK!
            </motion.h1>
            
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-indigo-200/90 font-semibold mb-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              You're one step away from financial freedom! 🚀
            </motion.p>

            {/* Features Carousel */}
            <div className="relative w-full max-w-[95%] sm:max-w-xl">
              {/* Prev Button */}
              <motion.button
                whileHover={isDesktop ? { scale: 1.1, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevSlide}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 bg-white/10 hover:bg-indigo-800 rounded-full z-10 border border-indigo-800/20"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>

              <motion.div
                key={currentSlide}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05}>
                  <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-md border border-indigo-700/30 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="flex justify-center mb-4">
                      {features[currentSlide].icon}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-indigo-100 mb-2 font-orbitron">
                      {features[currentSlide].title}
                    </h2>
                    <p className="text-indigo-200/80 text-xs sm:text-sm">
                      {features[currentSlide].description}
                    </p>
                  </div>
                </Tilt>
              </motion.div>

              {/* Next Button */}
              <motion.button
                whileHover={isDesktop ? { scale: 1.1, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextSlide}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 bg-white/10 hover:bg-indigo-800 rounded-full z-10 border border-indigo-800/20"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </div>

            {/* Referral Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-green-700/20 border border-green-600/30 rounded-2xl"
            >
              <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Valid Invitation</span>
              </div>
              <p className="text-indigo-200/80 text-sm font-mono">
                Mentor: {welcomeData.referralAddress.slice(0, 6)}...{welcomeData.referralAddress.slice(-4)}
              </p>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWelcome(false)}
              className="w-full py-4 px-6 rounded-2xl text-indigo-100 font-bold bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 transition-all shadow-lg flex items-center justify-center space-x-3 glow-effect"
              style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
            >
              <Rocket className="h-6 w-6" />
              <span className="font-orbitron">Join the Network</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${isDesktop ? 'max-w-xl' : 'max-w-md'} w-full space-y-8 border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900/80 to-indigo-950/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl`}
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
              Join INOUT NETWORK
            </motion.h1>
            <motion.p 
              className={`${isDesktop ? 'text-xl' : 'text-lg'} text-indigo-200/70 mb-2`}
              variants={itemVariants}
            >
              Start your journey to <span className="font-semibold text-indigo-400">financial freedom</span>
            </motion.p>
            <motion.div 
              className="flex items-center justify-center space-x-2 text-indigo-300"
              variants={itemVariants}
            >
              <Star className="h-4 w-4" />
              <span className="text-sm">Decentralized • Secure • Rewarding</span>
              <Star className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Registration Form */}
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-md border border-indigo-700/30 rounded-2xl p-6 sm:p-8 shadow-xl"
            >
              <div className="space-y-6">
                {/* Referral Input */}
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-indigo-100 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Referral Address</span>
                    </label>
                    {referralCode && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setReferralCode('')}
                        className="text-indigo-400 text-xs hover:text-indigo-300"
                      >
                        Clear
                      </motion.button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => handleReferralChange(e.target.value)}
                    placeholder="Enter referral address (0x...)"
                    disabled={isLoading}
                    className="w-full p-4 bg-white/5 rounded-xl border border-indigo-700/30 text-indigo-100 placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                  />
                </motion.div>

                {/* Referral Validation */}
                {referralCode && referralValidation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-center space-x-3 ${
                      referralValidation.isValid 
                        ? 'bg-green-700/20 border-green-600/30 text-green-400'
                        : 'bg-red-700/20 border-red-600/30 text-red-400'
                    }`}
                  >
                    {referralValidation.isChecking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : referralValidation.isValid ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <span className="text-sm">{referralValidation.message}</span>
                  </motion.div>
                )}

                {/* Register Button */}
                <motion.button
                  whileHover={isDesktop ? { scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegister}
                  disabled={isLoading || (registrationStage.stage !== 'idle' && registrationStage.stage !== 'error')}
                  className={`w-full py-4 px-6 rounded-xl text-indigo-100 font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed glow-effect font-orbitron`}
                  style={{ boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }}
                >
                  {isLoading || (registrationStage.stage !== 'idle' && registrationStage.stage !== 'error') ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-indigo-100 border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Wallet className="h-6 w-6" />
                      <span>{isConnected ? 'Register Now' : 'Connect Wallet'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </motion.button>

                {/* Switch to Login */}
                <motion.div 
                  className="text-center pt-4 border-t border-indigo-700/30"
                  variants={itemVariants}
                >
                  <span className="text-indigo-200/60 text-sm">Already have an account? </span>
                  <motion.button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign in
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </Tilt>

          {/* Security Badge */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-800/20 rounded-full border border-indigo-700/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-indigo-200/60 text-xs">Secured by Web3 Technology</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;