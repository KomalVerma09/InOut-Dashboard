import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown, Gem, Sparkles } from 'lucide-react';
import CountUpNumber from '../CountUpNumber';

interface RewardMilestoneSectionProps {
  data: {
    rewardObjects: Array<{
      userRank: string;
      reTarget: number;
      reFill: number;
      reFillPer: number;
      rePenPer: number;
    }>;
    userRank: string;
  };
  isDesktop: boolean;
}

const RewardMilestoneSection: React.FC<RewardMilestoneSectionProps> = ({ data, isDesktop }) => {
  const [hoveredRank, setHoveredRank] = useState<string | null>(null);

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 15 }
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'STAR': return Star;
      case 'GOLD': return Award;
      case 'PLATINUM': return Trophy;
      case 'RUBY': return Gem;
      case 'DIAMOND': return Crown;
      case 'CROWN DIAMOND': return Sparkles;
      default: return Star;
    }
  };

  const getRankGradient = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'STAR': return 'from-yellow-400 to-yellow-600';
      case 'GOLD': return 'from-yellow-500 to-amber-600';
      case 'PLATINUM': return 'from-gray-300 to-gray-500';
      case 'RUBY': return 'from-red-400 to-red-600';
      case 'DIAMOND': return 'from-blue-400 to-blue-600';
      case 'CROWN DIAMOND': return 'from-purple-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRankTextColor = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'STAR': return 'text-yellow-400';
      case 'GOLD': return 'text-yellow-500';
      case 'PLATINUM': return 'text-gray-300';
      case 'RUBY': return 'text-red-400';
      case 'DIAMOND': return 'text-blue-400';
      case 'CROWN DIAMOND': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Mobile & Desktop unified design
  return (
    <div className={`relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift 
      }`}>
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      
    >
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-400/20 blur-3xl "></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500/30 to-green-400/20 blur-3xl"></div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl font-orbitron">Reward Milestone</h3>
            <p className="text-white/60 text-sm">Your journey to success</p>
          </div>
        </div>

        {/* Current Rank */}
        <div className="text-center mb-6">
          <div className="text-lg font-bold text-white">
            Current Rank: <span className={getRankTextColor(data.userRank)}>{data.userRank}</span>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {data.rewardObjects.map((reward, idx) => {
            const RankIcon = getRankIcon(reward.userRank);
            const isCompleted = reward.reFillPer >= 100;
            const isInProgress = reward.reFillPer > 0 && reward.reFillPer < 100;

            return (
              <motion.div
                key={reward.userRank + idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, type: 'spring', stiffness: 180 }}
                className={`relative rounded-3xl p-5 cursor-pointer border border-white/10 backdrop-blur-sm overflow-hidden ${
                  isCompleted 
                    ? 'bg-green-500/20 border-green-400/30' 
                    : isInProgress 
                      ? 'bg-blue-500/20 border-blue-400/30'
                      : 'bg-white/5'
                }`}
                onMouseEnter={() => setHoveredRank(reward.userRank)}
                onMouseLeave={() => setHoveredRank(null)}
              >
                {/* Rank & Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRankGradient(reward.userRank)} rounded-xl flex items-center justify-center shadow-lg`}>
                      <RankIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-bold ${getRankTextColor(reward.userRank)}`}>{reward.userRank}</div>
                      <div className="text-white/50 text-xs">
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Locked'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm">
                      $<CountUpNumber end={reward.reFill} duration={1.5} delay={0.5 + idx * 0.1} />
                    </div>
                    <div className="text-white/50 text-xs">/ ${reward.reTarget.toLocaleString()}</div>
                  </div>
                </div>

                {/* Horizontal progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(reward.reFillPer, 100)}%` }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 1.2, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${
                      isCompleted 
                        ? 'bg-green-400' 
                        : isInProgress 
                          ? 'bg-blue-400' 
                          : 'bg-gray-500'
                    }`}
                  />
                </div>

                {/* Tooltip on hover */}
                {hoveredRank === reward.userRank && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-white/20 shadow-lg"
                  >
                    Progress: {reward.reFillPer}%
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default RewardMilestoneSection;
