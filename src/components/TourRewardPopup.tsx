import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Users, Star, Trophy, Gift, Plane, Camera, Heart } from 'lucide-react';

interface TourRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TourRewardPopup: React.FC<TourRewardPopupProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [currentTour, setCurrentTour] = useState<'kerala' | 'goa'>('kerala');

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const tours = {
    kerala: {
      title: 'Kerala Backwaters Tour',
      subtitle: 'God\'s Own Country Experience',
      location: 'Alleppey & Kumarakom, Kerala',
      duration: '5 Days / 4 Nights',
      highlights: [
        'Luxury Houseboat Stay',
        'Traditional Kerala Cuisine',
        'Ayurvedic Spa Sessions',
        'Backwater Cruise Experience',
        'Cultural Dance Performances'
      ],
      image: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg',
      color: {
        primary: 'from-green-400 to-emerald-600',
        secondary: 'from-green-500/20 to-emerald-600/20',
        accent: 'text-green-400',
        button: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
      },
      emoji: '🌴'
    },
    goa: {
      title: 'Goa Business Retreat',
      subtitle: 'Beach Paradise & Business Excellence',
      location: 'North Goa, India',
      duration: '4 Days / 3 Nights',
      highlights: [
        'Beachfront Resort Stay',
        'Business Strategy Sessions',
        'Sunset Beach Parties',
        'Water Sports Activities',
        'Networking Events'
      ],
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
      color: {
        primary: 'from-orange-400 to-red-600',
        secondary: 'from-orange-500/20 to-red-600/20',
        accent: 'text-orange-400',
        button: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
      },
      emoji: '🏖️'
    }
  };

  const selectedTour = tours[currentTour];

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
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              className={`absolute w-3 h-3 rounded-full ${
                i % 4 === 0 ? 'bg-yellow-400' :
                i % 4 === 1 ? 'bg-orange-400' :
                i % 4 === 2 ? 'bg-red-400' : 'bg-pink-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
            />
          ))}

          {/* Sparkles */}
          {[...Array(20)].map((_, i) => (
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
            className={`${isDesktop ? 'max-w-2xl w-full' : 'w-full max-w-sm mx-4'} glass-card-mobile rounded-3xl ${isDesktop ? 'p-6' : 'p-4'} relative text-center overflow-hidden max-h-[80vh] overflow-y-auto`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedTour.color.secondary} rounded-3xl animate-pulse`}></div>
            
            {/* Close Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-white/60" />
            </motion.button>

            <div className="relative z-10">
              {/* Tour Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 rounded-xl p-1 flex space-x-1">
                  {Object.entries(tours).map(([key, tour]) => (
                    <motion.button
                      key={key}
                      onClick={() => setCurrentTour(key as 'kerala' | 'goa')}
                      className={`${isDesktop ? 'px-4 py-2' : 'px-2 py-1'} rounded-lg ${isDesktop ? 'text-sm' : 'text-xs'} font-semibold transition-all ${
                        currentTour === key 
                          ? `bg-gradient-to-r ${tour.color.primary} text-white` 
                          : 'text-white/70 hover:text-white'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tour.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTour}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Tour Image */}
                  <div className={`relative ${isDesktop ? 'mb-4' : 'mb-3'} rounded-2xl overflow-hidden`}>
                    <img 
                      src={selectedTour.image} 
                      alt={selectedTour.title}
                      className={`w-full ${isDesktop ? 'h-32' : 'h-24'} object-cover`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className={`absolute ${isDesktop ? 'bottom-2 left-3' : 'bottom-1 left-2'} text-left`}>
                      <div className={`text-white font-bold ${isDesktop ? 'text-lg' : 'text-sm'}`}>{selectedTour.title}</div>
                      <div className={`text-white/80 ${isDesktop ? 'text-xs' : 'text-2xs'}`}>{selectedTour.subtitle}</div>
                    </div>
                  </div>

                  {/* Congratulations */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${isDesktop ? 'text-2xl' : 'text-lg'} font-bold text-white ${isDesktop ? 'mb-3' : 'mb-2'}`}
                  >
                    🎉 Congratulations! 🎉
                  </motion.h2>

                  {/* Tour Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`bg-gradient-to-r ${selectedTour.color.secondary} rounded-2xl ${isDesktop ? 'p-4 mb-4' : 'p-3 mb-3'} border border-white/20`}
                  >
                    <h3 className={`${isDesktop ? 'text-lg' : 'text-base'} font-bold text-white ${isDesktop ? 'mb-3' : 'mb-2'}`}>
                      You've Qualified for {selectedTour.title}!
                    </h3>
                    
                    <div className={`grid grid-cols-2 gap-2 ${isDesktop ? 'mb-3' : 'mb-2'}`}>
                      <div className="flex items-center space-x-2">
                        <MapPin className={`h-4 w-4 ${selectedTour.color.accent}`} />
                        <span className={`text-white/90 ${isDesktop ? 'text-xs' : 'text-2xs'}`}>{selectedTour.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className={`h-4 w-4 ${selectedTour.color.accent}`} />
                        <span className={`text-white/90 ${isDesktop ? 'text-xs' : 'text-2xs'}`}>{selectedTour.duration}</span>
                      </div>
                    </div>

                    <div className="text-left">
                      <h4 className={`text-white font-semibold ${isDesktop ? 'mb-2' : 'mb-1'} flex items-center space-x-2`}>
                        <Star className={`h-4 w-4 ${selectedTour.color.accent}`} />
                        <span className={`${isDesktop ? 'text-sm' : 'text-xs'}`}>Tour Highlights:</span>
                      </h4>
                      <ul className={`${isDesktop ? 'space-y-1' : 'space-y-0.5'}`}>
                        {selectedTour.highlights.map((highlight, index) => (
                          <motion.li
                            key={highlight}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`flex items-center space-x-2 text-white/80 ${isDesktop ? 'text-xs' : 'text-2xs'}`}
                          >
                            <div className={`w-2 h-2 bg-gradient-to-r ${selectedTour.color.primary} rounded-full`}></div>
                            <span>{highlight}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* Achievement Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className={`flex justify-center ${isDesktop ? 'space-x-3 mb-4' : 'space-x-2 mb-3'}`}
                  >
                    {[
                      { icon: Trophy, label: 'Excellence', color: 'from-yellow-400 to-amber-600' },
                      { icon: Users, label: 'Leadership', color: 'from-blue-400 to-blue-600' },
                      { icon: Heart, label: 'Community', color: 'from-pink-400 to-pink-600' },
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
                        className={`${isDesktop ? 'w-10 h-10' : 'w-8 h-8'} bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center`}
                      >
                        <badge.icon className={`${isDesktop ? 'h-5 w-5' : 'h-4 w-4'} text-white`} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Special Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className={isDesktop ? 'mb-4' : 'mb-3'}
                  >
                    <p className={`text-white/90 ${isDesktop ? 'text-xs' : 'text-2xs'} leading-relaxed`}>
                      Your exceptional performance and dedication to the INOUT NETWORK community has earned you this exclusive {selectedTour.title.toLowerCase()} experience. 
                      Join fellow top performers for an unforgettable journey combining business excellence with cultural exploration.
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    className="space-y-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className={`w-full ${isDesktop ? 'py-3' : 'py-2'} bg-gradient-to-r ${selectedTour.color.button} text-white font-bold rounded-2xl transition-all shadow-lg`}
                    >
                      Amazing! Thank You 🙏
                    </motion.button>
                    
                    <div className={`text-white/60 ${isDesktop ? 'text-2xs' : 'text-2xs'}`}>
                      More details will be shared via email soon
                    </div>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${selectedTour.color.button} rounded-full`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourRewardPopup;