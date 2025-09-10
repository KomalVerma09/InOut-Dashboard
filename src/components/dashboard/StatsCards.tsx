import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Zap, Gift, Lock, Star } from 'lucide-react';
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
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift">
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* surprise */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
          onClick={onSurpriseClick}
        >
          {/* Sparkles on hover */}
          <div className="absolute opacity-100 transition-opacity duration-500">
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

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-600/60">
              <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              ><Gift className="text-white" />
              </motion.div>

            </div>
            <div>
              <div className="text-white font-bold">Surprise Waiting</div>
              <div className="text-indigo-400/70 text-xs">Click to discover</div>
            </div>
          </div>
          <div className="">
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
        </motion.div>

                {/* Deposits */}
                <motion.div
                  variants={itemVariants}
                  className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600/60">
                    <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

                      <ArrowDownLeft className="text-white" />
              </motion.div>
                    </div>
                    <div>
                      <div className="text-white font-bold">Total Deposits</div>
                      <div className="text-indigo-400/70 text-xs">All time</div>
                    </div>
                  </div>
                  <div className="text-white font-bold text-xl">
                    $<CountUpNumber end={data.totalDeposits} duration={2} decimals={2} />
                  </div>
                </motion.div>

        {/* Withdrawn */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <ArrowUpRight className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Total Withdrawn</div>
              <div className="text-indigo-400/70 text-xs">All time</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            $<CountUpNumber end={data.totalWithdrawn} duration={2} decimals={2} />
          </div>
        </motion.div>

        {/* Frozen Wallet */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <Lock className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Frozen Wallet</div>
              <div className="text-indigo-400/70 text-xs">Locked funds</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            $<CountUpNumber end={data.frozenWallet} duration={2} decimals={2} />
          </div>
        </motion.div>

        {/* Total Laps */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <DollarSign className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Total Laps</div>
              <div className="text-indigo-400/70 text-xs">Progress cycles</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            <CountUpNumber end={data.totalLaps} duration={2} decimals={2} />
          </div>
        </motion.div>

        {/* airdrop card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between cursor-pointer hover:bg-indigo-800/40 transition"

        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <Gift className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Airdrop</div>
              <div className="text-indigo-400/70 text-xs">Click to claim</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            $<CountUpNumber end={data.airdrop} duration={2} decimals={2} />
          </div>
        </motion.div>

        {/* Reward Stakes */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <Star className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Reward Stakes</div>
              <div className="text-indigo-400/70 text-xs">Your rewards</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            $<CountUpNumber end={data.totalRewardStakes} duration={2} decimals={2} />
          </div>
        </motion.div>

        

        {/* Other Stakes */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-600/60">
            <motion.div
                className="w-10 h-10  rounded-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >

              <Zap className="text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-bold">Other Stakes</div>
              <div className="text-indigo-400/70 text-xs">Additional</div>
            </div>
          </div>
          <div className="text-white font-bold text-xl">
            $<CountUpNumber end={data.otherStakes} duration={2} decimals={2} />
          </div>
        </motion.div>

        

        
      </div>
    </div>
  );
};

export default StatsCards;
