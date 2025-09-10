import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target } from 'lucide-react';
import CountUpNumber from '../CountUpNumber';

interface GrowthPotentialSectionProps {
  data: {
    selfGrowth: number;
    frozenProfit: number;
    userTPR: number;
  };
}

const GrowthPotentialSection: React.FC<GrowthPotentialSectionProps> = ({ data }) => {
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

  // Using PortfolioSection's colors
  return (
    <div className="relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift ">
    <motion.div
      initial="hidden"
      animate="visible"
      
      variants={itemVariants}
    >
      {/* Background overlay animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-indigo-900/20 to-black/20 pointer-events-none rounded-3xl"></div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Growth Potential */}
        <div className="bg-indigo-900/30 rounded-2xl p-6 border border-indigo-700/30 flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500/70 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg font-orbitron">Growth Potential</h3>
          </div>
          <div className="text-white font-bold text-2xl mb-2">
            $<CountUpNumber end={data.selfGrowth} duration={2} decimals={2} /> / $<CountUpNumber end={data.frozenProfit} duration={2} decimals={2} />
          </div>
          <div className="text-indigo-400/80 text-xs">Self Growth / Frozen Profit</div>
        </div>

        {/* Remaining Earning Potential */}
        <div className="bg-indigo-900/30 rounded-2xl p-6 border border-indigo-700/30 flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500/70 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg font-orbitron">Remaining Potential</h3>
          </div>
          <div className="text-white font-bold text-2xl">
            $<CountUpNumber end={data.userTPR} duration={2} decimals={2} />
          </div>
          <div className="text-indigo-400/80 text-xs">Remaining TPR</div>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default GrowthPotentialSection;
