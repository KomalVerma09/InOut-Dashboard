import { useMemo, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import { formatEther, formatUnits } from 'viem';

interface ContractData {
  userInfo?: any[];
  userStakes?: any[];
  userRewards?: any[];
  directs?: string[];
  harvestPotential?: any[];
  affiliateData?: any[];
  userRealTimeInfo?: any[];
  userRewardInfo?: any[];
  getreserves?: any[];
  balanceOf?: bigint;
}

export const useDashboardData = () => {
  const { address } = useAccount();
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rewardCriteria = [500e6, 2500e6, 12500e6, 62500e6, 312500e6, 1562500e6];
  

  // Fetch contract data
  const fetchContractData = async () => {
    if (!address) return;

    const isInitialLoad = !contractData;
    setIsLoading(isInitialLoad);
    setIsRefreshing(!isInitialLoad);

    try {
      console.log('🔍 FETCHING CONTRACT DATA FOR:', address);

      // Fetch all contract data in parallel
      const [
        userInfo,
        userStakes,
        userRewards,
        directs,
        harvestPotential,
        affiliateData,
        userRealTimeInfo,
        userRewardInfo,
        getreserves,
        balanceOf,
      ] = await Promise.all([
        // User info from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'userInfos',
          args: [address],
        }).catch(err => {
          console.error('Error fetching userInfos:', err);
          return null;
        }),

        // User stakes from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'userStakes',
          args: [address],
        }).catch(err => {
          console.error('Error fetching userStakes:', err);
          return null;
        }),

        // User rewards from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'userRewards',
          args: [address],
        }).catch(err => {
          console.error('Error fetching userRewards:', err);
          return null;
        }),

        // Direct addresses from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'directAddress',
          args: [address],
        }).catch(err => {
          console.error('Error fetching directAddress:', err);
          return [];
        }),

        // Harvest potential from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'harvestPotential',
          args: [address],
        }).catch(err => {
          console.error('Error fetching harvestPotential:', err);
          return null;
        }),

        // Affiliate data
        readContract(config, {
          address: CONTRACTS.AFFILIATE_CONTRACT.address,
          abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
          functionName: 'affiliateUser',
          args: [address],
        }).catch(err => {
          console.error('Error fetching affiliateUser:', err);
          return null;
        }),

        // User real time info from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'userRealTimeInfo',
          args: [address],
        }).catch(err => {
          console.error('Error fetching userRealTimeInfo:', err);
          return null;
        }),

        // User reward info from staking contract
        readContract(config, {
          address: CONTRACTS.ORION_STAKING.address,
          abi: CONTRACTS.ORION_STAKING.abi,
          functionName: 'userRewardInfo',
          args: [address],
        }).catch(err => {
          console.error('Error fetching userRewardInfo:', err);
          return null;
        }),

        // Add this just after getReserves call
        readContract(config, {
          address: CONTRACTS.ORION_TOKEN.address,
          abi: CONTRACTS.ORION_TOKEN.abi,
          functionName: 'getReserves',
        }).catch(err => {
          console.error('Error fetching getReserves:', err);
          return null;
        }),

        // balanceOf
        readContract(config, {
          address: CONTRACTS.ORION_TOKEN.address,
          abi: CONTRACTS.ORION_TOKEN.abi,
          functionName: 'balanceOf',
          args: [address],
        }).catch(err => {
          console.error('Error fetching balanceOf:', err);
          return null;
        }),
      ]);

      console.log('📊 CONTRACT DATA FETCHED:', {
        userInfo,
        userStakes,
        userRewards,
        directs,
        harvestPotential,
        affiliateData,
        userRealTimeInfo,
        userRewardInfo,
        getreserves,
        balanceOf,
      });

      setContractData({
        userInfo,
        userStakes,
        userRewards,
        directs,
        harvestPotential,
        affiliateData,
        userRealTimeInfo,
        userRewardInfo,
        getreserves,
        balanceOf
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ ERROR FETCHING CONTRACT DATA:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data on mount and when address changes
  useEffect(() => {
    if (address) {
      fetchContractData();

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchContractData, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const processedData = useMemo(() => {
    if (!contractData) {
      return {
        // Return empty/zero values when no contract data
        totalTeam: 0,
        totalWithdrawn: 0,
        frozenWallet: 0,
        totalLaps: 0,
        directTeam: 0,
        airdrop: 0,

        // Additional stats
        totalDeposits: 0,
        totalTeamStakes: 0,
        totalRewardStakes: 0,
        powerStakes: 0,
        otherStakes: 0,

        // Current Portfolio
        currentPortfolio: 0,
        dailyReturn: 0.50, // Fixed percentage

        // Available Withdrawal
        availableWithdrawal: 0,

        // Growth Potential
        userTPR: 0,
        potentialGrowth: 0,
        selfGrowth: 0,
        frozenProfit: 0,
        remainingEarning: 0,

        // Earning Portfolio
        totalProfit: 0,
        earnings: {
          stakeProfit: 0,
          affiliateProfit: 0,
          teamGrowth: 0,
          rewardsProfit: 0,
          coreClubProfit: 0,
          redeemTopup: 0,
        },

        // orion_token
        _reserve0: 0,
        _reserve1: 0,
        tokenPrice: 0,

        // ORION Balance and Staking
        orinBalance: 0,
        orinInUsdt: 0,
        stakeTokenValue: 0,
        instantSaving: 0,
        totalPotential: 0,

        // Open Level indicator
        openLevel: 0,

        // Real-time info
        activeDirect: 0,
        directStake: 0,
        totTeam: 0,
        othStake: 0,
        totalStake: 0,
        rewCount: 0,



        // Reward info
        levelRewardStakes: [0, 0, 0, 0, 0, 0],
      
        // Add default reward objects
        rewardStake: 0,
        rewardObjects: [],
        userRank: 'RUNRUP',
      };
    }

    const {
      userInfo,
      userStakes,
      userRewards,
      directs,
      harvestPotential,
      userRealTimeInfo,
      userRewardInfo,
      getreserves,
      balanceOf
    } = contractData;

    // Helper function to convert Wei to number
    const fromWei = (value: any, decimals: number = 6): number => {
      if (!value) return 0;
      try {
        return parseFloat(formatUnits(value, decimals));
      } catch (error) {
        console.error('Error converting from Wei:', error);
        return 0;
      }
    };



    // Helper function to safely get number from contract data
    const safeNumber = (value: any): number => {
      if (!value) return 0;
      try {
        return Number(value);
      } catch (error) {
        console.error('Error converting to number:', error);
        return 0;
      }
    };


    
    // Calculate total profit from all earning categories
    const calculateTotalProfit = () => {
      const stakeProfit = fromWei(userRewards?.[1]) || 0;
      const affiliateProfit = fromWei(userRewards?.[2]) || 0;
      const teamGrowth = fromWei(userRewards?.[3]) || 0;
      const rewardsProfit = fromWei(userRewards?.[5]) || 0;
      const coreClubProfit = fromWei(userRewards?.[4]) || 0;
      const redeemTopup = fromWei(userRewards?.[8]) || 0;

      return stakeProfit + affiliateProfit + teamGrowth + rewardsProfit + coreClubProfit + redeemTopup;
    };


// Adapted createRrewardObject function
    const createRrewardObject = (openLevel: number, levelStack: any[]) => {
      let userRankname = '';
      let rewardTarget = 0;
      let rewradfill = 0;
      let rewardFillPer = 0;
      let rewaedPenPer = 0;

      if (openLevel === 0) {
        userRankname = 'STAR';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      } else if (openLevel === 1) {
        userRankname = 'GOLD';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      } else if (openLevel === 2) {
        userRankname = 'PLATINUM';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      } else if (openLevel === 3) {
        userRankname = 'RUBY';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      } else if (openLevel === 4) {
        userRankname = 'DIAMOND';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      } else if (openLevel === 5) {
        userRankname = 'CROWN DIAMOND';
        rewardTarget = rewardCriteria[openLevel];
        rewradfill = fromWei(levelStack[openLevel]);
      }

      if (rewradfill > 0) {
        rewardFillPer = (rewradfill * 100) / rewardTarget;
        rewaedPenPer = 100 - rewardFillPer;
      }

      return {
        userRank: userRankname,
        reTarget: parseInt((rewardTarget / 1e6).toString()) || 0,
        reFill: parseInt((rewradfill / 1e6).toString()) || 0,
        reFillPer: parseInt(rewardFillPer.toString()) || 0,
        rePenPer: parseInt(rewaedPenPer.toString()) || 0,
      };
    };

    // Process reward data
    let rewardStake = 0;
    let userRank = 'RUNRUP';
    const rewardObjects = [];

    if (userRewardInfo) {
      for (let i = 0; i < userRewardInfo.length; i++) {
        if (fromWei(userRewardInfo[i]) > 0) {
          rewardStake += parseInt(fromWei(userRewardInfo[i]).toString());
        }

        const rewardObject = createRrewardObject(i, userRewardInfo);
        rewardObjects.push(rewardObject);

        // Update userRank if target is met
        if (
          rewardObject.reTarget === rewardObject.reFill &&
          rewardObject.reTarget > 0
        ) {
          userRank = rewardObject.userRank;
        }
      }
    }

    const tokenPrice= (() => {
        if (!getreserves || !getreserves[0] || !getreserves[1]) return 0;
        
        const totalSupply = parseFloat(formatUnits(BigInt(getreserves[0].toString()), 18)); // ORION has 18 decimals
        const totalUsdt = parseFloat(formatUnits(BigInt(getreserves[1].toString()), 6)); // USDT has 6 decimals

        console.log(totalSupply);
        console.log(totalUsdt);
        
        if (totalSupply === 0) return 0;
        
        // Calculate token price: totalUsdt / totalSupply
        const tokenPrice = totalUsdt / totalSupply;

        console.log(tokenPrice);
        
        console.log('💰 TOKEN PRICE CALCULATION:', {
          totalSupply,
          totalUsdt,
          tokenPrice,
          formattedPrice: tokenPrice.toFixed(6)
        });
        
        return tokenPrice; // Return as number (e.g., 0.357044)
      })();

      const orinBalance = balanceOf ? parseFloat(formatUnits(balanceOf, 18)) : 0;
      const orinInUsdt = (orinBalance * tokenPrice);
      console.log("orinInUsdt",orinInUsdt)



    return {
      // Top stats from contract data
      totalTeam: userInfo ? safeNumber(userInfo[2]) : 0,
      totalWithdrawn: fromWei(userRewards?.[11]) || 0, // totalWithdrwan (index 11)
      frozenWallet: (() => {
        // Calculate: (frozenBuket - (frozenProfit + lapsReward)) / 1e6
        const frozenBuket = fromWei(userRewards?.[7]) || 0; // frozenBuket (index 7)
        const frozenProfit = fromWei(harvestPotential?.[4]) || 0; // frozenProfit from harvestPotential
        const lapsReward = fromWei(harvestPotential?.[5]) || 0; // lapsReward from harvestPotential
        return frozenBuket - (frozenProfit + lapsReward);
      })(),
      totalLaps: fromWei(userRewards?.[8]) || 0, // lapsFrozen (index 8)
      directTeam: directs ? directs.length : 0,
      airdrop: fromWei(userRewards?.[0]) || 0,

      // Additional stats from contract
      totalDeposits: fromWei(userStakes?.[0]) || 0,
      totalTeamStakes: fromWei(userInfo?.[3]) || 0, // teamStake
      totalRewardStakes: fromWei(userStakes?.[1]) || 0, // rewardStake
      powerStakes: fromWei(userStakes?.[2]) || 0, // matureStake from userStakes
      otherStakes: 0, // Not available in contract

      // Current Portfolio
      currentPortfolio: fromWei(userStakes?.[0]) || 0, // totalStake
      dailyReturn: 0.50, // Fixed percentage

      // Available Withdrawal
      availableWithdrawal: fromWei(harvestPotential?.[0]) || 0,

      // Growth Potential
      userTPR: fromWei(harvestPotential?.[1]) || 0,
      potentialGrowth: fromWei(harvestPotential?.[2]) || 0,
      selfGrowth: fromWei(harvestPotential?.[3]) || 0,
      frozenProfit: fromWei(harvestPotential?.[4]) || 0,

      // Earning Portfolio
      totalProfit: calculateTotalProfit() || 0,
      earnings: {
        stakeProfit: fromWei(userRewards?.[1]) || 0,
        affiliateProfit: fromWei(userRewards?.[2]) || 0,
        teamGrowth: fromWei(userRewards?.[3]) || 0,
        rewardsProfit: fromWei(userRewards?.[5]) || 0,
        coreClubProfit: fromWei(userRewards?.[4]) || 0,
        redeemTopup: fromWei(userRewards?.[8]) || 0,
      },


      // Open Level indicator
      openLevel: userInfo ? safeNumber(userInfo[5]) : 0, // userLevels

      // Real-time info from userRealTimeInfo
      activeDirect: userRealTimeInfo ? safeNumber(userRealTimeInfo) : 0,
      directStake: userRealTimeInfo ? fromWei(userRealTimeInfo[1]) : 0,
      totTeam: userRealTimeInfo ? safeNumber(userRealTimeInfo[2]) : 0,
      othStake: userRealTimeInfo ? fromWei(userRealTimeInfo[3]) : 0,
      totalStake: userRealTimeInfo ? fromWei(userRealTimeInfo[4]) : 0,
      rewCount: userRealTimeInfo ? safeNumber(userRealTimeInfo[5]) : 0,

      // Token price calculation from getReserves
      tokenPrice,

      // ORION Balance and Staking
      orinBalance,
      orinInUsdt,
      stakeTokenValue: fromWei(userStakes?.[1]) || 0,
      instantSaving: 0, // Not available in current contract
      totalPotential: fromWei(harvestPotential?.[5]) || 0,


      // Reward info from userRewardInfo
      levelRewardStakes: userRewardInfo ? userRewardInfo.map((stake: any) => fromWei(stake)) : [0, 0, 0, 0, 0, 0],

      // Integrated reward processing
      rewardStake,
      rewardObjects,
      userRank,
    };
  }, [contractData]);

  return {
    data: processedData,
    isLoading,
    isRefreshing,
    lastUpdated,
    refetch: fetchContractData,
    contractData
  };
};