import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface RewardData {
  qualified: boolean;
  rewardType?: string;
  title?: string;
  description?: string;
  icon?: 'trophy' | 'star' | 'gift' | 'award' | 'crown' | 'zap';
  baseColor?: string;
  exitMessage?: string;
}

export const useRewardChecker = () => {
  const { address } = useAccount();
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkRewardQualification = async () => {
    if (!address || lastChecked === address) return;

    setIsLoading(true);
    
    try {
      console.log('🎁 Checking reward qualification for:', address);
      
      const formData = new FormData();
      formData.append('eth_address', address);
      
      const response = await fetch('https://theorion.network/apis/index.php?action=checkRewardQualification', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log('🎁 Reward API Response:', data);
      
      if (data.status === 'success' && data.qualified) {
        // Map different reward types to achievements
        const achievement = mapRewardToAchievement(data);
        setRewardData(achievement);
        setLastChecked(address);
      } else {
        setRewardData({ qualified: false });
      }
      
    } catch (error) {
      console.error('❌ Error checking reward qualification:', error);
      setRewardData({ qualified: false });
    } finally {
      setIsLoading(false);
    }
  };

  const mapRewardToAchievement = (data: any): RewardData => {
    // Default GOA Business Sponsorship achievement
    if (data.rewardType === 'goa_sponsorship' || !data.rewardType) {
      return {
        qualified: true,
        rewardType: 'goa_sponsorship',
        title: 'GOA Business Sponsorship',
        description: 'Selected for the exclusive GOA business tour and sponsorship program for exceptional deal closure performance and outstanding client relationship management. Join strategic business meetings to discuss company growth and new project launches.',
        icon: 'trophy',
        baseColor: 'orange',
        exitMessage: 'Thank You'
      };
    }
    
    // Add more reward types as needed
    switch (data.rewardType) {
      case 'top_performer':
        return {
          qualified: true,
          rewardType: 'top_performer',
          title: 'Top Performer Award',
          description: 'Congratulations on achieving exceptional performance metrics and leading the team in sales excellence. Your dedication and hard work have earned you this prestigious recognition.',
          icon: 'star',
          baseColor: 'gold',
          exitMessage: 'Keep It Up!'
        };
        
      case 'milestone_achievement':
        return {
          qualified: true,
          rewardType: 'milestone_achievement',
          title: 'Milestone Achievement',
          description: 'You have successfully reached a significant milestone in your journey with INOUT NETWORK. This achievement reflects your commitment and progress towards financial freedom.',
          icon: 'award',
          baseColor: 'blue',
          exitMessage: 'Well Done!'
        };
        
      case 'leadership_excellence':
        return {
          qualified: true,
          rewardType: 'leadership_excellence',
          title: 'Leadership Excellence',
          description: 'Your outstanding leadership skills and ability to guide your team to success have been recognized. You are setting an example for others to follow.',
          icon: 'crown',
          baseColor: 'purple',
          exitMessage: 'Lead On!'
        };
        
      default:
        return {
          qualified: true,
          rewardType: data.rewardType,
          title: data.title || 'Special Achievement',
          description: data.description || 'You have earned a special recognition for your outstanding performance.',
          icon: data.icon || 'gift',
          baseColor: data.baseColor || 'green',
          exitMessage: data.exitMessage || 'Congratulations!'
        };
    }
  };

  // Auto-check when address changes
  useEffect(() => {
    if (address && address !== lastChecked) {
      // Add a small delay to avoid too frequent API calls
      const timer = setTimeout(() => {
        checkRewardQualification();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [address, lastChecked]);

  const resetReward = () => {
    setRewardData(null);
  };

  return {
    rewardData,
    isLoading,
    checkRewardQualification,
    resetReward
  };
};