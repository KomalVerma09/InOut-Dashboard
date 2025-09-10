import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Users, Gift, Crown, RefreshCw } from 'lucide-react';
import CountUpNumber from '../CountUpNumber';

interface EarningPortfolioSectionProps {
  data: {
    totalProfit: number;
    earnings: {
      stakeProfit: number;
      affiliateProfit: number;
      teamGrowth: number;
      rewardsProfit: number;
      coreClubProfit: number;
      redeemTopup: number;
    };
  };
  isDesktop: boolean;
}

const EarningPortfolioSection: React.FC<EarningPortfolioSectionProps> = ({ data, isDesktop }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const totalEarnings = data.totalProfit;
  const getPercentage = (amount: number): number => (totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0);

  const earningCategories = [
    { label: 'Stake Profit', amount: data.earnings.stakeProfit, solidColor: '#10b981', icon: TrendingUp, delay: 0.5 },
    { label: 'Affiliate Profit', amount: data.earnings.affiliateProfit, solidColor: '#eab308', icon: Users, delay: 0.7 },
    { label: 'Team Growth', amount: data.earnings.teamGrowth, solidColor: '#f97316', icon: Users, delay: 0.9 },
    { label: 'Rewards Profit', amount: data.earnings.rewardsProfit, solidColor: '#a855f7', icon: Gift, delay: 1.1 },
    { label: 'Core Club Profit', amount: data.earnings.coreClubProfit, solidColor: '#ec4899', icon: Crown, delay: 1.3 },
    { label: 'Redeem Topup', amount: data.earnings.redeemTopup, solidColor: '#3b82f6', icon: RefreshCw, delay: 1.5 },
  ];

  const radius = isDesktop ? 100 : 80;
  const circumference = 2 * Math.PI * radius;

  const createCircleChart = () => {
    let currentAngle = 0;
    return earningCategories.map((category) => {
      const percentage = getPercentage(category.amount);
      if (percentage === 0) return null;

      const strokeDasharray = (percentage / 100) * circumference;
      const strokeDashoffset = circumference - strokeDasharray;
      const rotation = currentAngle;
      currentAngle += (percentage / 100) * 360;

      return (
        <motion.circle
          key={category.label}
          cx={radius + 20}
          cy={radius + 20}
          r={radius}
          fill="none"
          stroke={category.solidColor}
          strokeWidth={isDesktop ? 14 : 10}
          strokeDasharray={`${strokeDasharray} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(${rotation} ${radius + 20} ${radius + 20})`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
          transition={{ delay: category.delay, duration: 1.5, ease: 'easeOut' }}
          onMouseEnter={() => setHoveredSegment(category.label)}
          onMouseLeave={() => setHoveredSegment(null)}
          className="cursor-pointer hover:opacity-80 transition-all"
          style={{
            filter: hoveredSegment === category.label ? `drop-shadow(0 0 12px ${category.solidColor})` : 'none',
          }}
        />
      );
    }).filter(Boolean);
  };

  return (
    <div className="relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 md:gap-16 items-center">
        {/* LEFT: Circular chart */}
        <div className="relative flex-shrink-0">
          <svg width={radius * 2 + 40} height={radius * 2 + 40} className="transform -rotate-90">
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={isDesktop ? 14 : 10}
            />
            {createCircleChart()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-slate-800/80 backdrop-blur-sm rounded-full w-32 h-32 md:w-40 md:h-40 flex items-center justify-center border border-white/20">
              <div>
                <div className="text-white font-bold text-xl md:text-2xl">
                  $<CountUpNumber end={data.totalProfit} duration={2} decimals={2} />
                </div>
                <div className="text-white/60 text-xs md:text-sm">Total Profit</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Cards */}
        <div className="grid grid-cols-1  sm:grid-cols-2 gap-4 md:gap-6 w-full">
          {earningCategories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: category.delay }}
                className="relative overflow-hidden rounded-2xl p-4 md:p-5 backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(category.label)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{
                  background: `linear-gradient(135deg, ${category.solidColor}20, ${category.solidColor}10)`,
                  borderColor: `${category.solidColor}40`,
                }}
              >
                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-20 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${category.solidColor}40, transparent 70%)` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-white" />
                    <span className="text-white font-bold text-sm md:text-base">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg md:text-xl">
                      $<CountUpNumber end={category.amount} duration={2} decimals={2} />
                    </div>
                    <div className="text-white/50 text-xs md:text-sm">
                      {getPercentage(category.amount).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(category.amount)}%` }}
                    transition={{ delay: category.delay + 0.5, duration: 1 }}
                    className="h-1 rounded-full"
                    style={{ backgroundColor: category.solidColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredSegment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold border border-white/20 backdrop-blur-sm shadow-xl pointer-events-none"
        >
          <div className="text-center">
            <div className="font-bold">{hoveredSegment}</div>
            <div className="text-xs text-white/70">
              ${earningCategories.find(c => c.label === hoveredSegment)?.amount.toFixed(2)} (
              {getPercentage(earningCategories.find(c => c.label === hoveredSegment)?.amount || 0).toFixed(1)}%)
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
};

export default EarningPortfolioSection;

