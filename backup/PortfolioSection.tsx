import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart3, Zap, Trophy, Wallet, ArrowRight, TrendingUp, Target, Gem } from 'lucide-react';
import CountUpNumber from '../CountUpNumber';
import TransactionPopup from '../TransactionPopup';

interface PortfolioSectionProps {
  data: {
    currentPortfolio: number;
    totalTeamStakes: number;
    powerStakes: number;
    totalRewardStakes: number;
    availableWithdrawal: number;
  };
  isDesktop: boolean;
  refetch: () => void;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ data, isDesktop, refetch }) => {
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);

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
    // Mobile: Full-width portfolio cards
    return (
      <>
        <div className="space-y-4 px-4">
          {/* Current Portfolio - Full Width */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/30 shadow-2xl "
          >
            {/* Animated background */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-2xl p-5 border border-blue-400/40 backdrop-blur-sm">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-blue-400 text-lg font-bold uppercase tracking-wide">Current Portfolio</span>
                      <div className="text-blue-400/80 text-sm">+ 0.50% daily returns</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-3xl">
                      $<CountUpNumber end={data.currentPortfolio} duration={2} decimals={2} delay={1.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Stakes - Full Width */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-green-600/20 via-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-6 border border-green-400/30 shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-teal-400/20 to-green-600/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-green-500/30 to-emerald-600/30 rounded-2xl p-5 border border-green-400/40 backdrop-blur-sm ">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4 '>
                      <span className="text-green-400 text-lg font-bold uppercase tracking-wide">Team Stakes</span>
                      <div className="text-green-400/80 text-sm">Community investments</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-3xl">
                      $<CountUpNumber end={data.totalTeamStakes} duration={2} decimals={2} delay={1.7} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Power Stakes - Full Width */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30 shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-pink-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-purple-500/30 to-pink-600/30 rounded-2xl p-5 border border-purple-400/40 backdrop-blur-sm">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-purple-400 text-lg font-bold uppercase tracking-wide">Power Stakes</span>
                      <div className="text-purple-400/80 text-sm">High yield investments</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-3xl">
                      $<CountUpNumber end={data.powerStakes} duration={2} decimals={2} delay={1.9} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reward Stakes - Full Width */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl p-6 border border-cyan-400/30 shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl p-5 border border-cyan-400/40 backdrop-blur-sm">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 items-center justify-between">
                  <div className="grid grid-cols-1 xs:grid-cols-5 items-center xs:gap-3 col-span-2">
                    <div className='flex justify-center mb-4 xs:mb-0'>
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    </div>
                    <div className='xs:col-span-4'>
                      <span className="text-cyan-400 text-lg font-bold uppercase tracking-wide">Reward Stakes</span>
                      <div className="text-cyan-400/80 text-sm">Bonus investments</div>
                    </div>
                  </div>
                  <div className="xs:text-right">
                    <div className="text-white font-bold text-3xl">
                      $<CountUpNumber end={data.totalRewardStakes} duration={2} decimals={2} delay={2.1} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Available Withdrawal - Full Width with Action */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-600/30 via-green-600/30 to-emerald-700/30 backdrop-blur-xl rounded-3xl p-6 border border-emerald-400/40 shadow-2xl"
          >
            {/* Animated background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-green-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/30 to-emerald-600/30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-1 xs:grid-cols-7 items-center justify-between xs:gap-3">
                <div className='flex justify-center items-center pb-5 xs:pb-0'>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                </div>

                  <div className='grid grid-cols-4 col-span-5 xs:col-span-6'>
                <div className="flex items-center col-span-3">
                  
                  <div className=''>
                    <div className="text-emerald-400 text-sm font-bold uppercase tracking-wide mb-1">Available Withdrawal</div>
                    <div className="text-white font-bold text-3xl">
                      $<CountUpNumber end={data.availableWithdrawal} duration={2} decimals={2} delay={2.3} />
                    </div>
                    <div className="text-emerald-400/80 text-sm">Ready to withdraw</div>
                  </div>
                </div>
                
                <div className='flex justify-end items-center w-full'>
                  <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTransactionPopup(true)}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-2xl text-white transition-all shadow-xl flex items-center justify-center"
                >
                  <ArrowRight className="h-7 w-7" />
                </motion.button>
                </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <TransactionPopup
          isOpen={showTransactionPopup}
          onClose={() => setShowTransactionPopup(false)}
          availableWithdrawal={data.availableWithdrawal}
          refetch={refetch}
        />
      </>
    );
  }

  // Desktop: Enhanced grid layout with rich backgrounds
  return (
    <>
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden card-cosmic hover-lift backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30 shadow-2xl group hover:shadow-3xl transition-all duration-500"
        whileHover={{ y: -8 }}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-indigo-600/20 rounded-full blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 animate-gradient"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-xl">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white font-orbitron">Portfolio & Growth</h3>
              <p className="text-purple-400/80 text-lg">Your investment overview and potential</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Current Portfolio */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-2xl p-6 border border-blue-400/40 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-blue-400" />
                  <span className="text-blue-400 text-sm font-semibold">PORTFOLIO</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  $<CountUpNumber end={data.currentPortfolio} duration={2} decimals={2} delay={1.5} />
                </div>
                <div className="text-blue-400 text-sm">CURRENT PORTFOLIO</div>
                <div className="text-orange-400 text-xs mt-1">+ 0.50 % A Day</div>
              </div>
            </div>

            {/* Team Stakes */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500/30 to-green-700/30 rounded-2xl p-6 border border-green-400/40 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">TEAM</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  $<CountUpNumber end={data.totalTeamStakes} duration={2} decimals={2} delay={1.7} />
                </div>
                <div className="text-green-400 text-sm">TEAM STAKES</div>
                <div className="text-green-400 text-xs mt-1">Active stakes</div>
              </div>
            </div>

            {/* Power Stakes */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-2xl p-6 border border-purple-400/40 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/30 to-purple-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                  <span className="text-purple-400 text-sm font-semibold">POWER</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  $<CountUpNumber end={data.powerStakes} duration={2} decimals={2} delay={1.9} />
                </div>
                <div className="text-purple-400 text-sm">POWER STAKES</div>
                <div className="text-purple-400 text-xs mt-1">High yield</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Reward Stakes */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/30 to-cyan-700/30 rounded-2xl p-6 border border-cyan-400/40 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-cyan-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <Trophy className="h-6 w-6 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-semibold">REWARD</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  $<CountUpNumber end={data.totalRewardStakes} duration={2} decimals={2} delay={2.1} />
                </div>
                <div className="text-cyan-400 text-sm">REWARD STAKES</div>
                <div className="text-cyan-400 text-xs mt-1">Bonus rewards</div>
              </div>
            </div>

            {/* Available Withdrawal - Enhanced */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600/40 to-green-800/40 rounded-2xl p-6 border border-emerald-400/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/30 to-green-600/30 rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Wallet className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="text-emerald-400 text-sm font-semibold mb-1">AVAILABLE WITHDRAWAL</div>
                    <div className="text-4xl font-bold text-white">
                      $<CountUpNumber end={data.availableWithdrawal} duration={2} decimals={2} delay={2.3} />
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTransactionPopup(true)}
                  className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full text-white transition-all shadow-xl"
                >
                  <ArrowRight className="h-7 w-7" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <TransactionPopup
        isOpen={showTransactionPopup}
        onClose={() => setShowTransactionPopup(false)}
        availableWithdrawal={data.availableWithdrawal}
        refetch={refetch}
      />
    </>
  );
};

export default PortfolioSection;