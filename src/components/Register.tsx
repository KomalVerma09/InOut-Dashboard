import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';
import { useRegistration } from '../hooks/useRegistration';
import Alert from './ui/Alert';
import TransactionProgress from './ui/TransactionProgress';
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
  Rocket
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

  // Auto-fill referral from URL invite parameter on component mount
  useEffect(() => {
    const inviteParam = inviteCode || searchParams.get('invite');
    
    if (inviteParam && validateReferralAddress(inviteParam)) {
      console.log('✅ Valid invite parameter found:', inviteParam);
      setReferralCode(inviteParam);
      
      // Validate the referral and show welcome if valid
      validateAndShowWelcome(inviteParam);
      
    } else {
      console.log('❌ No valid invite parameter found in Register component');
    }
  }, [inviteCode, searchParams, validateReferralAddress]);

  // Function to validate referral and show welcome screen
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
  // Handle referral input change
  const handleReferralChange = async (value: string) => {
    setReferralCode(value);
    
    // Clear previous validation
    setReferralValidation(null);
    
    // Only validate if we have a value and it looks like an address
    if (value && value.length >= 42) {
      // Check format first
      if (!validateReferralFormat(value)) {
        setReferralValidation({
          isValid: false,
          message: 'Invalid address format. Must start with 0x and be 42 characters long.',
          isChecking: false
        });
        return;
      }
      
      // Show checking status
      setReferralValidation({
        isValid: false,
        message: 'Checking referral validity...',
        isChecking: true
      });
      
      try {
        // Check if referral exists and is active
        const isValid = await validateReferralExists(value);
        
        setReferralValidation({
          isValid,
          message: isValid 
            ? 'Valid referral address found! Ready for registration.' 
            : 'Referral address not found or inactive. Please check the address.',
          isChecking: false
        });
        
        // Show welcome screen if referral is valid
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

    // If no referral provided, prompt user
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

    // Validate referral format
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
          message: 'Welcome to ORION NETWORK! You can now login.',
          isVisible: true
        });
        
        // Auto redirect to login after success
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
      
      {/* Animated Welcome Overlay for Invite Links */}
      {showWelcome && welcomeData && welcomeData.isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 "
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`${isDesktop ? 'max-w-2xl ' : 'max-w-sm max-h-[95vh]'} w-full text-center space-y-6 rounded-3xl 
                   overflow-y-auto 
                  scrollbar-hide`}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                  animate={{
                    x: [0, Math.random() * 100, 0],
                    y: [0, Math.random() * 100, 0],
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>

            <div className={`${isDesktop ? 'glass-card p-12 rounded-3xl' : 'glass-card-mobile p-8 rounded-2xl'} backdrop-blur-xl relative overflow-hidden`}>
              {/* Main Logo with Animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className={`mx-auto ${isDesktop ? 'w-32 h-20' : 'w-20 h-20'} flex items-center justify-center mb-8`}
              >
                <img 
                  src="https://theorion.network/assets/img/orion-dark.png" 
                  alt="ORION NETWORK" 
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Welcome Message */}
              <motion.h1 
                className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-white mb-4`}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🎉 Congratulations! 🎉
              </motion.h1>
              
              <motion.p 
                className={`${isDesktop ? 'text-xl' : 'text-lg'} text-white/90 font-semibold mb-4`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                You're about to join a <span className="gradient-text">SKYROCKET</span> business!
              </motion.p>
              
              <motion.div 
                className={`${isDesktop ? 'text-base' : 'text-sm'} text-white/80 space-y-2 mb-6`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p>🚀 Welcome to the future of <strong>Financial Freedom</strong></p>
                <p>💎 Join thousands of successful investors</p>
                <p>⭐ Your journey to <strong>Passive Income</strong> starts here!</p>
              </motion.div>

              {/* Features */}
              <motion.div 
                className={`grid ${isDesktop ? 'grid-cols-3 gap-4' : 'grid-cols-2 gap-2'} mb-6`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {[
                  { icon: TrendingUp, title: 'Daily Returns', desc: '0.5% Daily', color: 'from-green-400 to-green-600' },
                  { icon: Users, title: 'Team Building', desc: 'Referral Rewards', color: 'from-blue-400 to-blue-600' },
                  { icon: Crown, title: 'VIP Status', desc: 'Exclusive Benefits', color: 'from-yellow-400 to-yellow-600' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    <p className="text-white/60 text-xs">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Referral Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="p-4 bg-green-500/20 border border-green-400/30 rounded-2xl mb-4"
              >
                <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Valid Invitation Detected!</span>
                </div>
                <p className="text-white/80 text-sm">
                  Referral: {welcomeData.referralAddress.slice(0, 6)}...{welcomeData.referralAddress.slice(-4)}
                </p>
              </motion.div>

              {/* Continue Button */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWelcome(false)}
                  className="w-full py-4 px-6 rounded-2xl text-white font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all shadow-xl flex items-center justify-center space-x-3"
                >
                  <span>Continue to Registration</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.p>

            </div>
          </motion.div>
        </motion.div>
      )}
      
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
            Join ORION
          </motion.h1>
          <motion.p 
            className={`${isDesktop ? 'text-xl' : 'text-lg'} text-white/70 mb-2`}
            variants={itemVariants}
          >
            Create your <span className="gradient-text font-semibold">ORION NETWORK</span> account
          </motion.p>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-blue-400"
            variants={itemVariants}
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm">Secure • Decentralized • Profitable</span>
            <Shield className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          variants={itemVariants}
          className={`${isDesktop ? 'glass-card p-8 rounded-3xl' : 'glass-card-mobile p-6 rounded-2xl'} backdrop-blur-xl`}
        >
          <div className="space-y-6">
            {/* Referral Code Input */}
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-2">
                <label className="text-sm font-medium text-white/80 flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Referral Address</span>
                </label>
              </div>
              <input
              className='p-4 bg-white/5 rounded-2xl border border-white/10 text-white/70 w-[100%]'
                type="text"
                value={referralCode}
                onChange={(e) => handleReferralChange(e.target.value)}
                src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                placeholder="Enter referral address"
                disabled={isLoading}
              />
            </motion.div>

            {/* Referral Validation Status */}
            {referralCode && referralValidation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  referralValidation.isValid 
                    ? 'bg-green-500/20 border-green-400/30 text-green-400'
                    : 'bg-red-500/20 border-red-400/30 text-red-400'
                }`}
              >
                {referralValidation.isValid ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span>{referralValidation.message}</span>
              </motion.div>
            )}

            {/* Register Button */}
            <motion.button
              whileHover={isDesktop ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={isLoading || (registrationStage.stage !== 'idle' && registrationStage.stage !== 'error')}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold ${isDesktop ? 'premium-button' : 'mobile-button'} transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading || (registrationStage.stage !== 'idle' && registrationStage.stage !== 'error') ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Wallet className="h-6 w-6" />
                  <span>{isConnected ? 'Register' : 'Connect Wallet'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Switch to Login */}
            <motion.div 
              className="text-center pt-4 border-t border-white/10"
              variants={itemVariants}
            >
              <span className="text-white/60 text-sm">Already have an account? </span>
              <motion.button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </div>
    </>
  );
};

export default Register;