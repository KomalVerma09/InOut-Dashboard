import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet, TrendingUp, Gift, Download, ArrowUpRight, ArrowDownLeft, DollarSign, Star, Lock, Zap, Target, UserPlus, Sparkles } from 'lucide-react';
import CountUpNumber from '../CountUpNumber';

interface StatsCardsProps {
  data: {
    totalDeposits: number;
    totalRewardStakes: number;
    frozenWallet: number;
    totalLaps: number;
    otherStakes: number;
    airdrop: number;
    totalWithdrawn: number;
  };
  isDesktop: boolean;
  onSurpriseClick: () => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({ data, isDesktop, onSurpriseClick }) => {
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
    // Mobile: Full-width cards with optimized design
    return (
      <div className="space-y-4 px-4">
        {/* Financial Overview Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden card-cosmic hover-lift backdrop-blur-xl rounded-3xl p-6 border border-emerald-400/40 shadow-2xl group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl font-orbitron">Financial Overview</h3>
                <p className="text-emerald-400/80 text-sm">Your complete financial summary</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Deposits */}
              <div className="bg-gradient-to-r from-green-500/40 to-emerald-600/40 rounded-2xl p-5 border border-green-400/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <ArrowDownLeft className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-green-300 text-sm font-bold uppercase tracking-wide">Total Deposits</span>
                      <div className="text-green-300/80 text-xs">All time deposits</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-2xl">
                      $<CountUpNumber end={data.totalDeposits} duration={2} decimals={2} delay={0.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-gradient-to-r from-red-500/40 to-pink-600/40 rounded-2xl p-5 border border-red-400/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-red-300 text-sm font-bold uppercase tracking-wide">Total Withdrawn</span>
                      <div className="text-red-300/80 text-xs">All time withdrawals</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-2xl">
                      $<CountUpNumber end={data.totalWithdrawn} duration={2} decimals={2} delay={0.7} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team & Network Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden card-cosmic hover-lift backdrop-blur-xl rounded-3xl p-6 border border-blue-400/40 shadow-2xl group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
          
          <div className="relative z-10">
            {/* Surprise Waiting Card - Clickable */}
            <motion.button
              onClick={onSurpriseClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left touch-manipulation"
            >
              <div className="bg-gradient-to-r from-blue-500/40 to-purple-600/40 rounded-2xl p-5 border border-blue-400/50 backdrop-blur-sm group/card relative overflow-hidden">
                {/* Floating surprise elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400/60"
                    animate={{
                      y: [0, -10, 0],
                      x: [0, Math.sin(i) * 8, 0],
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.4
                    }}
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${10 + (i % 2) * 20}%`
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      🎁
                    </motion.div>
                    <div>
                      <span className="text-yellow-300 text-sm font-bold uppercase tracking-wide">Surprise Waiting</span>
                      <div className="text-yellow-300/80 text-xs relative ">
                        Click to discover
                        {/* Sparkle animation */}
                        <motion.div
                          className="absolute -top-1 -right-2 "
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                        >
                          ✨
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      className="text-white font-bold text-2xl"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      🎉
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Other Stakes */}
            <div className="bg-gradient-to-r from-purple-500/40 to-pink-600/40 rounded-2xl p-5 border border-purple-400/50 backdrop-blur-sm group/card">
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                  <div className='flex justify-center mb-4 xs:mb-0'>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  </div>
                  <div className='xs:col-span-4'>
                    <span className="text-purple-300 text-sm font-bold uppercase tracking-wide">Other Stakes</span>
                    <div className="text-purple-300/80 text-xs relative">
                      Additional investments
                      {/* Lightning animation on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-purple-400"
                            style={{
                              left: `${i * 15}px`,
                              top: `${i * 3}px`
                            }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          >
                            <Zap className="h-2 w-2 fill-current" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="xs:text-right">
                  <div className="text-white font-bold text-2xl">
                    $<CountUpNumber end={data.otherStakes} duration={2} decimals={2} delay={1.1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rewards & Bonuses Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-br from-yellow-600/30 via-orange-600/30 to-red-600/30 backdrop-blur-xl rounded-3xl p-6 border border-yellow-400/40 shadow-2xl group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-xl">
                <motion.button
                  onClick={onSurpriseClick}
                  whileTap={{ scale: 0.9 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    🎁
                  </motion.div>
                </motion.button>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl font-orbitron">Rewards & Bonuses</h3>
                <p className="text-yellow-400/80 text-sm">Your earned rewards</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* AirDrop */}
              <motion.button
                onClick={onSurpriseClick}
                whileTap={{ scale: 0.98 }}
               className="w-full text-left touch-manipulation active:bg-blue-500/10"
               onTouchStart={() => console.log('🎁 Touch started on surprise card')}
               onTouchEnd={() => console.log('🎁 Touch ended on surprise card')}
               style={{ WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.3)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        🎁
                      </motion.div>
                    </div>
                    <div>
                      <span className="text-yellow-300 text-sm font-bold uppercase tracking-wide">Surprise Waiting</span>
                      <div className="text-yellow-300/80 text-xs relative">
                        Click to discover
                        {/* Gift animation on hover */}
                        <motion.div
                          className="absolute top-0 right-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                          animate={{
                            y: [0, -2, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                        >
                          <Gift className="h-2 w-2 text-yellow-400" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-2xl">
                      🎉
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Frozen Wallet */}
              <div className="bg-gradient-to-r from-purple-500/40 to-pink-600/40 rounded-2xl p-5 border border-purple-400/50 backdrop-blur-sm group/card">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-purple-300 text-sm font-bold uppercase tracking-wide">Other Stakes</span>
                      <div className="text-orange-300/80 text-xs relative">
                        Additional investments
                        {/* Lock animation on hover */}
                        <motion.div
                          className="absolute top-0 right-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                          animate={{
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity
                          }}
                        >
                          <Lock className="h-2 w-2 text-orange-400" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-2xl">
                      $<CountUpNumber end={data.otherStakes} duration={2} decimals={2} delay={1.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Laps Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-br from-cyan-600/30 via-blue-600/30 to-indigo-600/30 backdrop-blur-xl rounded-3xl p-6 border border-cyan-400/40 shadow-2xl group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-gradient-to-r from-cyan-500/40 to-blue-600/40 rounded-2xl p-5 border border-cyan-400/50 backdrop-blur-sm group/card">
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                  <div className='flex justify-center mb-4 xs:mb-0'>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  </div>
                  <div className='xs:col-span-4'>
                    <span className="text-cyan-300 text-lg font-bold uppercase tracking-wide">Total Laps</span>
                    <div className="text-cyan-300/80 text-sm relative">
                      Performance cycles
                      {/* Wave animation on hover */}
                      <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                        <svg className="w-full h-2" viewBox="0 0 100 10">
                          <motion.path
                            d="M0,5 Q25,2 50,5 T100,5"
                            stroke="rgba(6, 182, 212, 0.6)"
                            strokeWidth="1"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="xs:text-right">
                  <div className="text-white font-bold text-3xl">
                    $<CountUpNumber end={data.totalLaps} duration={2} decimals={2} delay={0.9} />
                  </div>
                  <div className="text-cyan-300/80 text-sm">Completed cycles</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop: Enhanced individual cards with optimized animations
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          title: 'Surprise Waiting',
          value: 0,
          icon: Sparkles,
          color: 'from-yellow-400 to-orange-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-yellow-400/30',
          delay: 0.5,
          decimals: 0,
          description: 'Click to discover',
          captionAnimation: 'surprise',
          isClickable: true
        },
        {
          title: 'Total Withdrawn',
          value: data.totalWithdrawn,
          icon: Download,
          color: 'from-emerald-400 to-emerald-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-emerald-400/30',
          delay: 0.7,
          decimals: 2,
          prefix: '$',
          description: 'Total withdrawals',
          captionAnimation: 'withdrawal'
        },
        {
          title: 'Frozen Wallet',
          value: data.frozenWallet,
          icon: Wallet,
          color: 'from-orange-400 to-orange-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-orange-400/30',
          delay: 0.9,
          decimals: 2,
          prefix: '$',
          description: 'Locked funds',
          captionAnimation: 'lock'
        },
        {
          title: 'Total Laps',
          value: data.totalLaps,
          icon: TrendingUp,
          color: 'from-red-400 to-red-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-red-400/30',
          delay: 1.1,
          decimals: 2,
          prefix: '$',
          description: 'Performance cycles',
          captionAnimation: 'performance'
        },
        {
          title: 'AirDrop',
          value: data.airdrop,
          icon: Gift,
          color: 'from-yellow-400 to-yellow-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-yellow-400/30',
          delay: 1.3,
          decimals: 2,
          prefix: '$',
          description: 'Bonus rewards',
          captionAnimation: 'gift'
        },
        {
          title: 'Other Stakes',
          value: data.otherStakes,
          icon: Zap,
          color: 'from-purple-400 to-purple-600',
          bgGradient: 'card-cosmic hover-lift',
          borderColor: 'border-purple-400/30',
          delay: 1.5,
          decimals: 2,
          prefix: '$',
          description: 'Additional investments',
          captionAnimation: 'lightning'
        }
      ].map((stat, index) => {
        const CardComponent = stat.isClickable ? motion.button : motion.div;
        
        return (
          <CardComponent
            key={stat.title}
            variants={itemVariants}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-3xl p-8 border ${stat.borderColor} shadow-2xl group ${stat.isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={stat.isClickable ? { scale: 0.98 } : {}}
            onClick={stat.isClickable ? onSurpriseClick : undefined}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>
            
            {/* Subtle background glow */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-all duration-500`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                  {stat.isClickable ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      🎁
                    </motion.div>
                  ) : (
                    <stat.icon className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors duration-300">
                    {stat.description}
                    
                    {/* Caption-specific animations */}
                    {stat.captionAnimation === 'surprise' && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-yellow-400"
                            style={{
                              left: `${i * 8}px`,
                              top: `${i * 4}px`
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          >
                            ✨
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {stat.captionAnimation === 'lock' && (
                      <motion.div
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                        animate={{
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      >
                        <Lock className="h-3 w-3 text-orange-400" />
                      </motion.div>
                    )}
                    
                    {stat.captionAnimation === 'performance' && (
                      <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <svg className="w-full h-2" viewBox="0 0 100 10">
                          <motion.path
                            d="M0,5 Q25,2 50,5 T100,5"
                            stroke="rgba(239, 68, 68, 0.6)"
                            strokeWidth="1"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </svg>
                      </div>
                    )}
                    
                    {stat.captionAnimation === 'gift' && (
                      <motion.div
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        animate={{
                          y: [0, -2, 0],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      >
                        <Gift className="h-3 w-3 text-yellow-400" />
                      </motion.div>
                    )}
                    
                    {stat.captionAnimation === 'withdrawal' && (
                      <motion.div
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        animate={{
                          y: [0, -2, 0],
                          x: [0, 2, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      >
                        <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      </motion.div>
                    )}
                    
                    {stat.captionAnimation === 'lightning' && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute text-purple-400"
                            style={{
                              left: `${i * 10}px`,
                              top: `${i * 6}px`
                            }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          >
                            <Zap className="h-2 w-2 fill-current" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-4xl font-bold text-white mb-3 group-hover:text-shadow-lg transition-all duration-300">
                {stat.isClickable ? (
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="text-6xl"
                  >
                    🎉
                  </motion.div>
                ) : (
                  <CountUpNumber
                    end={stat.value}
                    duration={2.5}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    delay={stat.delay}
                    className="font-bold"
                  />
                )}
              </div>
              
              <div className="text-white/80 text-lg font-semibold group-hover:text-white transition-colors duration-300">
                {stat.title}
              </div>
              
              {/* Simple progress indicator */}
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stat.isClickable ? "100%" : `${Math.min((stat.value / 1000) * 100, 100)}%` }}
                  transition={{ 
                    delay: stat.delay + 0.5, 
                    duration: 1.5, 
                    ease: "easeOut"
                  }}
                  className={`h-2 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-300 ${stat.isClickable ? 'animate-pulse' : ''}`}
                />
              </div>
            </div>
          </CardComponent>
        );
      })}
    </div>
  );
};

export default StatsCards;