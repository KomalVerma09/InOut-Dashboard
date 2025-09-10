import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Gift, Award, Crown, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'gift' | 'award' | 'crown' | 'zap';
  baseColor: string;
  exitMessage: string;
}

interface AchievementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: Achievement;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ 
  isOpen, 
  onClose, 
  achievement 
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'gift': return Gift;
      case 'award': return Award;
      case 'crown': return Crown;
      case 'zap': return Zap;
      default: return Trophy;
    }
  };

  const getColorClasses = (baseColor: string) => {
    switch (baseColor.toLowerCase()) {
      case 'orange':
        return {
          iconBg: 'from-orange-400 to-orange-600',
          cardBg: 'from-orange-400/20 via-orange-500/20 to-red-400/20',
          buttonBg: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
          confetti: ['bg-orange-400', 'bg-red-400', 'bg-yellow-400', 'bg-pink-400']
        };
      case 'blue':
        return {
          iconBg: 'from-blue-400 to-blue-600',
          cardBg: 'from-blue-400/20 via-blue-500/20 to-cyan-400/20',
          buttonBg: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
          confetti: ['bg-blue-400', 'bg-cyan-400', 'bg-indigo-400', 'bg-purple-400']
        };
      case 'green':
        return {
          iconBg: 'from-green-400 to-green-600',
          cardBg: 'from-green-400/20 via-green-500/20 to-emerald-400/20',
          buttonBg: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
          confetti: ['bg-green-400', 'bg-emerald-400', 'bg-teal-400', 'bg-lime-400']
        };
      case 'purple':
        return {
          iconBg: 'from-purple-400 to-purple-600',
          cardBg: 'from-purple-400/20 via-purple-500/20 to-pink-400/20',
          buttonBg: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
          confetti: ['bg-purple-400', 'bg-pink-400', 'bg-violet-400', 'bg-fuchsia-400']
        };
      case 'gold':
        return {
          iconBg: 'from-yellow-400 to-amber-600',
          cardBg: 'from-yellow-400/20 via-amber-500/20 to-orange-400/20',
          buttonBg: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
          confetti: ['bg-yellow-400', 'bg-amber-400', 'bg-orange-400', 'bg-red-400']
        };
      default:
        return {
          iconBg: 'from-orange-400 to-orange-600',
          cardBg: 'from-orange-400/20 via-orange-500/20 to-red-400/20',
          buttonBg: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
          confetti: ['bg-orange-400', 'bg-red-400', 'bg-yellow-400', 'bg-pink-400']
        };
    }
  };

  if (!achievement) return null;

  const IconComponent = getIcon(achievement.icon);
  const colors = getColorClasses(achievement.baseColor);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      rotate: -10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.5,
      rotate: 10,
      transition: {
        duration: 0.3
      }
    }
  };

  const confettiVariants = {
    hidden: { opacity: 0, y: -100, rotate: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: [0, 100, 200],
      rotate: [0, 180, 360],
      transition: {
        duration: 3,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        delay: i * 0.2,
        repeat: Infinity,
        repeatDelay: 1
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4 overflow-hidden"
          onClick={onClose}
        >
          {/* Confetti Animation */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              className={`absolute w-3 h-3 ${colors.confetti[i % colors.confetti.length]} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
            />
          ))}

          {/* Sparkles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              custom={i}
              variants={sparkleVariants}
              initial="hidden"
              animate="visible"
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            >
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </motion.div>
          ))}

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`${isDesktop ? 'max-w-lg w-full' : 'w-full max-w-sm'} glass-card-mobile rounded-3xl p-8 relative text-center overflow-hidden`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.cardBg} rounded-3xl animate-pulse`}></div>
            
            {/* Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-white/60" />
            </motion.button>

            <div className="relative z-10">
              {/* Main Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className={`w-24 h-24 bg-gradient-to-br ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}
              >
                <IconComponent className="h-12 w-12 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-4"
              >
                🎉 Congratulations! 🎉
              </motion.h2>

              {/* Achievement Title */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-bold text-white mb-4"
              >
                {achievement.title}
              </motion.h3>

              {/* Achievement Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`bg-gradient-to-r ${colors.cardBg} rounded-2xl p-6 mb-6 border border-white/20`}
              >
                <p className="text-white/90 text-sm leading-relaxed">
                  {achievement.description}
                </p>
              </motion.div>

              {/* Achievement Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex justify-center space-x-4 mb-6"
              >
                {[
                  { icon: Star, label: 'Excellence', color: 'from-blue-400 to-blue-600' },
                  { icon: Award, label: 'Achievement', color: 'from-purple-400 to-purple-600' },
                  { icon: Crown, label: 'Elite', color: 'from-yellow-400 to-amber-600' },
                ].map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 1.2 + index * 0.1,
                      type: "spring",
                      stiffness: 300
                    }}
                    className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center`}
                  >
                    <badge.icon className="h-6 w-6 text-white" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Exit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`w-full py-4 bg-gradient-to-r ${colors.buttonBg} text-white font-bold rounded-2xl transition-all shadow-lg`}
                >
                  {achievement.exitMessage}
                </motion.button>
              </motion.div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 8, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colors.buttonBg} rounded-full`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;