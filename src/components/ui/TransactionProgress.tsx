import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { RegistrationStage } from '../../hooks/useRegistration';

interface TransactionProgressProps {
  stage: RegistrationStage;
  isVisible: boolean;
  onClose: () => void;
}

const TransactionProgress: React.FC<TransactionProgressProps> = ({
  stage,
  isVisible,
  onClose
}) => {
  const getStageConfig = () => {
    switch (stage.stage) {
      case 'validating':
      case 'checking-referral':
      case 'sending':
      case 'confirming':
        return {
          icon: Loader,
          color: 'text-blue-400',
          bgColor: 'from-blue-500/20 to-blue-600/20',
          borderColor: 'border-blue-400/30',
          animate: true
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'from-green-500/20 to-green-600/20',
          borderColor: 'border-green-400/30',
          animate: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'from-red-500/20 to-red-600/20',
          borderColor: 'border-red-400/30',
          animate: false
        };
      default:
        return {
          icon: Loader,
          color: 'text-gray-400',
          bgColor: 'from-gray-500/20 to-gray-600/20',
          borderColor: 'border-gray-400/30',
          animate: false
        };
    }
  };

  const config = getStageConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && (stage.stage === 'success' || stage.stage === 'error')) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-gradient-to-br ${config.bgColor} backdrop-blur-xl border ${config.borderColor} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full bg-white/10 flex items-center justify-center ${config.color}`}>
                {config.animate ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <IconComponent className="h-10 w-10" />
                  </motion.div>
                ) : (
                  <IconComponent className="h-10 w-10" />
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white text-center mb-4">
              {stage.stage === 'validating' && 'Validating Registration'}
              {stage.stage === 'checking-referral' && 'Checking Referral'}
              {stage.stage === 'sending' && 'Sending Transaction'}
              {stage.stage === 'confirming' && 'Confirming Transaction'}
              {stage.stage === 'success' && 'Registration Successful!'}
              {stage.stage === 'error' && 'Registration Failed'}
            </h3>

            {/* Message */}
            <p className="text-white/80 text-center mb-6">
              {stage.message}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Progress</span>
                <span>{stage.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-2 bg-gradient-to-r ${config.bgColor.replace('/20', '/80')} rounded-full`}
                />
              </div>
            </div>

            {/* Transaction Hash */}
            {stage.txHash && (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-white/70 mb-2">Transaction Hash:</div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs text-white/90 font-mono flex-1 truncate">
                    {stage.txHash}
                  </code>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={`https://polygonscan.com/tx/${stage.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </motion.a>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(stage.stage === 'success' || stage.stage === 'error') && (
              <div className="space-y-3">
                {stage.stage === 'success' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-2xl transition-all"
                  >
                    Continue to Dashboard
                  </motion.button>
                )}
                
                {stage.stage === 'error' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold rounded-2xl transition-all"
                  >
                    Try Again
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionProgress;