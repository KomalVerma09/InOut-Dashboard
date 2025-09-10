import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'from-green-500/20 to-green-600/20',
          borderColor: 'border-green-400/30',
          textColor: 'text-green-400',
          iconColor: 'text-green-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'from-yellow-500/20 to-orange-600/20',
          borderColor: 'border-yellow-400/30',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-400'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'from-red-500/20 to-red-600/20',
          borderColor: 'border-red-400/30',
          textColor: 'text-red-400',
          iconColor: 'text-red-400'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'from-blue-500/20 to-blue-600/20',
          borderColor: 'border-blue-400/30',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-400'
        };
    }
  };

  const config = getAlertConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] max-w-md w-full mx-4"
        >
          <div className={`bg-gradient-to-r ${config.bgColor} backdrop-blur-xl border ${config.borderColor} rounded-2xl p-4 shadow-2xl`}>
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
                  {title}
                </h3>
                <p className="text-sm text-white/80">
                  {message}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white/60" />
              </motion.button>
            </div>
            
            {/* Progress bar for auto-close */}
            {autoClose && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.bgColor.replace('/20', '/60')} rounded-b-2xl`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;