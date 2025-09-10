import React, { useState,useEffect  } from 'react';
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

    useEffect(() => {
    if (showTransactionPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // cleanup
    };
  }, [showTransactionPopup]);


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

  const items = [
    { icon: Clock, value: data.currentPortfolio, label: 'Current Portfolio', subtitle: '+0.50% daily returns' },
    { icon: BarChart3, value: data.totalTeamStakes, label: 'Team Stakes', subtitle: 'Community investments' },
    { icon: Zap, value: data.powerStakes, label: 'Power Stakes', subtitle: 'High yield investments' },
    { icon: Trophy, value: data.totalRewardStakes, label: 'Reward Stakes', subtitle: 'Bonus investments' },
    { icon: Wallet, value: data.availableWithdrawal, label: 'Available Withdrawal', subtitle: '', button: true },
  ];


  // Desktop: Enhanced grid layout with rich backgrounds
  // Desktop-only design for PortfolioSection.tsx


  return (
    <div className="relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black overflow-hidden">
      <h2 className="text-2xl md:text-4xl font-bold text-indigo-300 font-orbitron mb-6">
        Portfolio Dashboard
      </h2>
      <p className="text-white/60 text-sm md:text-base mb-8">
        Track your portfolio, team, stakes, and available withdrawals.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const yOffset = idx % 2 === 0 ? '-10px' : '10px'; // stagger vertical
          const xOffset = idx % 3 === 0 ? '-5px' : idx % 3 === 1 ? '0px' : '5px'; // slight horizontal shift
          return (
            <motion.div
              key={idx}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="relative flex flex-col items-center text-center min-w-[180px] px-6 py-6 rounded-2xl bg-indigo-900/30 border border-indigo-700/30"
              style={{ transform: `translate(${xOffset}, ${yOffset})` }}
            >
              {/* Icon floating above card */}
              <div className="mb-3 -mt-10 bg-indigo-500/70 w-12 h-12 flex items-center justify-center rounded-full">
                <Icon className="h-6 w-6 text-white" />
              </div>

              <div className="text-white font-bold text-xl">
                $<CountUpNumber end={item.value} duration={2} decimals={2} />
              </div>
              <div className="text-indigo-400/70 text-sm">{item.label}</div>
              {item.subtitle && <div className="text-indigo-300 text-xs mt-1">{item.subtitle}</div>}

              {item.button && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTransactionPopup(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600/70 hover:bg-indigo-600 text-white rounded-xl shadow"
                >
                  <ArrowRight className="h-5 w-5 inline-block" />
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      <TransactionPopup
        isOpen={showTransactionPopup}
        onClose={() => setShowTransactionPopup(false)}
        availableWithdrawal={data.availableWithdrawal}
        refetch={refetch}
      />
    </div>
  );

};

export default PortfolioSection;