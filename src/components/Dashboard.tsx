import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { MoreHorizontal } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRewardChecker } from '../hooks/useRewardChecker';
import { useRegistration } from '../hooks/useRegistration';
import { useTagName } from '../hooks/useTagName';
import HistoryTable from './HistoryTable';
import AchievementPopup from './AchievementPopup';
import TransactionProgress from './ui/TransactionProgress';
import Alert from './ui/Alert';
import SwapComponent from './SwapComponent';
import StakeComponent from './StakeComponent';
import TeamHistory from './TeamHistory';
import TagNamePopup from './TagNamePopup';
import TourRewardPopup from './TourRewardPopup';

// Dashboard Components
// import MobileBottomNav from './dashboard/MobileBottomNav';
import StatsCards from './dashboard/StatsCards';
import ReferralSection from './dashboard/ReferralSection';
import PortfolioSection from './dashboard/PortfolioSection';
import GrowthPotentialSection from './dashboard/GrowthPotentialSection';
import EarningPortfolioSection from './dashboard/EarningPortfolioSection';
import RewardMilestoneSection from './dashboard/RewardMilestoneSection';

interface DashboardProps {
  activeTab: 'home' | 'swap' | 'stake' | 'history';
  onTabChange: (tab: 'home' | 'swap' | 'stake' | 'history') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, onTabChange }) => {
  const { address } = useAccount();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [showTourReward, setShowTourReward] = useState(false);
  const [showTeamHistory, setShowTeamHistory] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });

  // Hooks
  const { data: processedData, isLoading: contractLoading, refetch } = useDashboardData();
  const { rewardData, resetReward } = useRewardChecker();
  const { registrationStage, resetRegistration } = useRegistration();
  const { tagName, hasTagName, showTagNamePopup, setShowTagNamePopup, setTagName } = useTagName();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 30-second countdown with auto data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, refresh data and reset to 30
          console.log('🔄 Auto-refreshing dashboard data...');
          setIsRefreshingData(true);
          
          refetch().then(() => {
            setIsRefreshingData(false);
            console.log('✅ Dashboard data refreshed');
          }).catch(() => {
            setIsRefreshingData(false);
            console.log('❌ Dashboard data refresh failed');
          });
          
          return 30; // Reset countdown to 30 seconds
        }
        return prev - 1; // Decrease countdown by 1 second
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [refetch]);

  // Reset countdown when user manually refreshes
  const handleManualRefresh = () => {
    setIsRefreshingData(true);
    setCountdown(30); // Reset countdown
    
    refetch().then(() => {
      setIsRefreshingData(false);
      console.log('✅ Manual refresh completed');
    }).catch(() => {
      setIsRefreshingData(false);
      console.log('❌ Manual refresh failed');
    });
  };

  const handleSurpriseClick = () => {
    setShowTourReward(true);
    if (window.triggerHaptic) window.triggerHaptic('medium');
  };

  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
    if (window.triggerHaptic) window.triggerHaptic('medium');
  };

  const handleTeamHistoryBack = () => {
    setShowTeamHistory(false);
  };

  const handleTabChangeInternal = (tab: 'home' | 'swap' | 'stake' | 'history') => {
    onTabChange(tab);
    // Reset team history when switching to history tab
    if (tab === 'history') {
      setShowTeamHistory(false);
    }
  };

  // Get display text for countdown
  const getCountdownText = () => {
    if (isRefreshingData) {
      return 'Refreshing data...';
    }
    return `Data updates in ${countdown}s`;
  };

  // Get countdown color based on time remaining
  const getCountdownColor = () => {
    if (isRefreshingData) return 'text-blue-400';
    if (countdown <= 5) return 'text-red-400';
    if (countdown <= 10) return 'text-yellow-400';
    return 'text-green-400';
    };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

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

  // Show swap component
  if (activeTab === 'swap') {
    return <SwapComponent onBack={() => onTabChange('home')} />;
  }

  // Show stake component
  if (activeTab === 'stake') {
    return <StakeComponent onBack={() => onTabChange('home')} />;
  }

  // Show history component
  if (activeTab === 'history') {
    if (showTeamHistory) {
      return <TeamHistory onBack={handleTeamHistoryBack} />;
    }
    return <HistoryTable onBack={() => onTabChange('home')} onViewTeamHistory={() => {
      console.log('🔄 SWITCHING TO TEAM HISTORY');
      setShowTeamHistory(true);
    }} />;
  }
  // Mobile Layout
  if (!isDesktop) {
    return (
      <>
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
        />

        <AchievementPopup
          isOpen={!!rewardData?.qualified}
          onClose={resetReward}
          achievement={rewardData?.qualified ? {
            id: rewardData.rewardType || 'default',
            title: rewardData.title || 'Achievement Unlocked',
            description: rewardData.description || 'Congratulations on your achievement!',
            icon: rewardData.icon || 'trophy',
            baseColor: rewardData.baseColor || 'orange',
            exitMessage: rewardData.exitMessage || 'Thank You'
          } : undefined}
        />

        <TransactionProgress
          stage={registrationStage}
          isVisible={registrationStage.stage !== 'idle'}
          onClose={() => {
            resetRegistration();
            if (registrationStage.stage === 'success') {
              refetch();
            }
          }}
        />

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-20">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* Welcome Section */}
              <motion.div variants={itemVariants} className="text-center px-4 py-4">
                <motion.h1 
                  className="text-3xl sm:text-6xl md:text-8xl font-orbitron font-black text-white mb-8 text-glow leading-tight"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                >
                  Welcome to INOUT NETWORK
                </motion.h1>
                <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{getCountdownText()}</span>
                </div>
              
              {/* Mobile INOUT Price Display */}
              {!isDesktop && processedData?.tokenPrice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl px-4 py-2 border border-green-400/30 inline-block"
                >
                  <div className="text-center">
                    <div className="text-white text-sm font-bold">
                      1 ORIN = ${(processedData?.tokenPrice || 0).toFixed(6)}
                    </div>
                    <div className="text-green-400 text-xs">Current Price</div>
                  </div>
                </motion.div>
              )}
              </motion.div>

              {/* Referral Section - Moved to top */}
              <ReferralSection 
                isDesktop={false} 
                registrationStage={registrationStage}
                resetRegistration={resetRegistration}
                tagName={tagName}
                hasTagName={hasTagName}
                tokenPrice={processedData?.tokenPrice || 0}
                totalTeam={processedData?.totalTeam || 0}
                directTeam={processedData?.directTeam || 0}
              />

              {/* Stats Cards */}
              <StatsCards data={processedData} isDesktop={false} onSurpriseClick={handleSurpriseClick} />

              {/* Portfolio Section */}
              <PortfolioSection 
                data={processedData} 
                isDesktop={false} 
                refetch={refetch}
              />

              {/* Growth Potential Section */}
              <GrowthPotentialSection 
                data={processedData} 
                isDesktop={false} 
              />

              {/* Earning Portfolio Section */}
              <EarningPortfolioSection 
                data={processedData} 
                isDesktop={false} 
              />

              {/* Reward Milestone Section */}
              <RewardMilestoneSection 
                data={processedData} 
                isDesktop={false} 
              />
            </motion.div>
          
          {/* Mobile Bottom Navigation */}
          {/* <MobileBottomNav 
            activeTab={activeTab}
            onTabChange={handleTabChangeInternal}
            showMoreMenu={showMoreMenu}
            onMoreMenuToggle={handleMoreMenuToggle}
            onHistoryClick={() => onTabChange('history')}
          /> */}
        </div>
      </>
    );
  }

  // Desktop Layout
  return (
    <>
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
      />

      <AchievementPopup
        isOpen={!!rewardData?.qualified}
        onClose={resetReward}
        achievement={rewardData?.qualified ? {
          id: rewardData.rewardType || 'default',
          title: rewardData.title || 'Achievement Unlocked',
          description: rewardData.description || 'Congratulations on your achievement!',
          icon: rewardData.icon || 'trophy',
          baseColor: rewardData.baseColor || 'orange',
          exitMessage: rewardData.exitMessage || 'Thank You'
        } : undefined}
      />

      <TransactionProgress
        stage={registrationStage}
        isVisible={registrationStage.stage !== 'idle'}
        onClose={() => {
          resetRegistration();
          if (registrationStage.stage === 'success') {
            refetch();
          }
        }}
      />

      <TagNamePopup
        isOpen={showTagNamePopup}
        onClose={() => {}} // Disabled - user must set tag name
        onSubmit={setTagName}
      />


      <div className="min-h-screen desktop-bg overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
              {/* INOUT Price Display */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center space-x-2 mb-6"
              >
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-lg">
                  1 INOUT : {(processedData?.tokenPrice || 0).toFixed(6)}
                </span>
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-orbitron font-black text-white mb-8 text-glow leading-tight">
                Welcome to <span className="gradient-text">INOUT NETWORK</span>
              </h1>
              <p className="text-xl text-white/70 mb-6">Your gateway to decentralized financial freedom</p>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <motion.button
                  onClick={handleManualRefresh}
                  className={`${getCountdownColor()} hover:text-white transition-colors cursor-pointer`}
                  whileTap={{ scale: 0.95 }}
                >
                  {getCountdownText()}
                </motion.button>
              </div>
            </motion.div>

            {/* Referral Section - Moved to top */}
            <ReferralSection 
              isDesktop={true} 
              registrationStage={registrationStage}
              resetRegistration={resetRegistration}
              tagName={tagName}
              hasTagName={hasTagName}
              tokenPrice={processedData?.tokenPrice || 0}
              totalTeam={processedData?.totalTeam || 0}
              directTeam={processedData?.directTeam || 0}
            />

            {/* Stats Cards */}
            <StatsCards 
              data={processedData} 
              isDesktop={true} 
              onSurpriseClick={() => {
                console.log('🎁 Desktop surprise click triggered');
                handleSurpriseClick();
              }} 
            />

            {/* Portfolio Section */}
            <PortfolioSection 
              data={processedData} 
              isDesktop={true} 
              refetch={refetch}
            />

            {/* Growth Potential Section */}
            <GrowthPotentialSection 
              data={processedData} 
              isDesktop={true} 
            />

            {/* Earning Portfolio Section */}
            <EarningPortfolioSection 
              data={processedData} 
              isDesktop={true} 
            />

            {/* Reward Milestone Section */}
            <RewardMilestoneSection 
              data={processedData} 
              isDesktop={true} 
            />
          </motion.div>
        </div>
      </div>

      <TourRewardPopup
        isOpen={showTourReward}
        onClose={() => setShowTourReward(false)}
      />
    </>
  );
};

export default Dashboard;