import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import { parseGwei } from 'viem';

export interface RegistrationStage {
  stage: 'idle' | 'validating' | 'checking-referral' | 'sending' | 'confirming' | 'success' | 'error';
  message: string;
  txHash?: string;
  progress: number;
}

export const useRegistration = () => {
  const { address } = useAccount();
  const [registrationStage, setRegistrationStage] = useState<RegistrationStage>({
    stage: 'idle',
    message: '',
    progress: 0
  });

  const { writeContractAsync } = useWriteContract();

  // Validate referral address format
  const validateReferralFormat = (referralAddress: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(referralAddress.trim());
  };

  // Check if referral exists and is active
  const validateReferralExists = async (referralAddress: string): Promise<boolean> => {
    try {
      console.log('🔍 VALIDATING REFERRAL EXISTS:', referralAddress);
      
      // First check affiliate contract
      const affiliateData = await readContract(config, {
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'affiliateUser',
        args: [referralAddress],
      });
      
      console.log('📊 AFFILIATE CONTRACT DATA:', {
        rawData: affiliateData,
        type: typeof affiliateData,
        isArray: Array.isArray(affiliateData)
      });
      
      // Check if user is registered in affiliate contract
      let joinedStatus;
      if (Array.isArray(affiliateData)) {
        console.log('📋 PARSING ARRAY DATA:', {
          referral: affiliateData[0],
          regIndex: affiliateData[1]?.toString(),
          joined: affiliateData[2],
          joinedType: typeof affiliateData[2]
        });
        joinedStatus = affiliateData[2];
      } else if (affiliateData && typeof affiliateData === 'object') {
        console.log('📋 PARSING OBJECT DATA:', {
          referral: affiliateData.referral,
          regIndex: affiliateData.regIndex?.toString(),
          joined: affiliateData.joined,
          joinedType: typeof affiliateData.joined
        });
        joinedStatus = affiliateData.joined;
      }
      
      const isRegistered = joinedStatus === true || joinedStatus === 'true' || joinedStatus == 1;
      console.log('✅ AFFILIATE REGISTRATION CHECK:', {
        joinedStatus,
        joinedType: typeof joinedStatus,
        isRegistered
      });
      
      if (!isRegistered) {
        console.log('❌ REFERRAL NOT REGISTERED IN AFFILIATE CONTRACT');
        return false;
      }
      
      // Now check staking contract for activity
      const stakingInfo = await readContract(config, {
        address: CONTRACTS.ORION_STAKING.address,
        abi: CONTRACTS.ORION_STAKING.abi,
        functionName: 'userInfos',
        args: [referralAddress],
      });

      console.log('📊 STAKING CONTRACT DATA:', {
        rawData: stakingInfo,
        type: typeof stakingInfo,
        isArray: Array.isArray(stakingInfo)
      });

      // Check if referral has made at least one stake (lastStake > 0)
      let lastStake = 0n;
      if (Array.isArray(stakingInfo)) {
        console.log('📋 PARSING STAKING ARRAY DATA:', {
          referral: stakingInfo[0],
          lastDircetStaker: stakingInfo[1],
          totalTeam: stakingInfo[2]?.toString(),
          teamStake: stakingInfo[3]?.toString(),
          lastStake: stakingInfo[4]?.toString(),
          userLevels: stakingInfo[5]?.toString(),
          growthRate: stakingInfo[6]?.toString(),
          activeStakeCount: stakingInfo[7]?.toString(),
          coreClub: stakingInfo[8],
          joined: stakingInfo[9]
        });
        lastStake = stakingInfo[4] || 0n;
      } else if (stakingInfo && typeof stakingInfo === 'object') {
        console.log('📋 PARSING STAKING OBJECT DATA:', {
          referral: stakingInfo.referral,
          lastDircetStaker: stakingInfo.lastDircetStaker,
          totalTeam: stakingInfo.totalTeam?.toString(),
          teamStake: stakingInfo.teamStake?.toString(),
          lastStake: stakingInfo.lastStake?.toString(),
          userLevels: stakingInfo.userLevels?.toString(),
          growthRate: stakingInfo.growthRate?.toString(),
          activeStakeCount: stakingInfo.activeStakeCount?.toString(),
          coreClub: stakingInfo.coreClub,
          joined: stakingInfo.joined
        });
        lastStake = stakingInfo.lastStake || 0n;
      }
      
      const isActive = lastStake > 0n;

      console.log('✅ FINAL REFERRAL VALIDATION:', {
        isRegistered,
        lastStakeValue: lastStake.toString(),
        isActive,
        finalResult: isRegistered && isActive ? 'VALID ✅' : 'INVALID ❌'
      });

      return isRegistered && isActive;
    } catch (error) {
      console.error('❌ ERROR VALIDATING REFERRAL:', {
        address: referralAddress,
        error: error.message || error,
        stack: error.stack
      });
      return false;
    }
  };

  // Check if user is already registered
  const checkUserRegistration = async (userAddress: string): Promise<boolean> => {
    try {
      const affiliateData = await readContract(config, {
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'affiliateUser',
        args: [userAddress],
      });

      const joinedStatus = Array.isArray(affiliateData) ? affiliateData[2] : affiliateData?.joined;
      return joinedStatus === true || joinedStatus === 'true' || joinedStatus == 1;
    } catch (error) {
      console.error('❌ Error checking registration:', error);
      return false;
    }
  };

  // Main registration function
  const registerUser = async (referralAddress: string): Promise<boolean> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Stage 1: Validate user not already registered
      setRegistrationStage({
        stage: 'validating',
        message: 'Checking if user is already registered...',
        progress: 10
      });

      const isAlreadyRegistered = await checkUserRegistration(address);
      if (isAlreadyRegistered) {
        setRegistrationStage({
          stage: 'error',
          message: 'User is already registered',
          progress: 0
        });
        return false;
      }

      // Stage 2: Validate referral format
      setRegistrationStage({
        stage: 'validating',
        message: 'Validating referral address format...',
        progress: 20
      });

      if (!validateReferralFormat(referralAddress)) {
        setRegistrationStage({
          stage: 'error',
          message: 'Invalid referral address format',
          progress: 0
        });
        return false;
      }

      // Stage 3: Check if referral exists and is active
      setRegistrationStage({
        stage: 'checking-referral',
        message: 'Checking referral validity...',
        progress: 30
      });

      const isReferralValid = await validateReferralExists(referralAddress);
      if (!isReferralValid) {
        setRegistrationStage({
          stage: 'error',
          message: 'Referral address is not active or does not exist',
          progress: 0
        });
        return false;
      }

      // Stage 4: Send registration transaction
      setRegistrationStage({
        stage: 'sending',
        message: 'Sending registration transaction...',
        progress: 50
      });

      const txHash = await writeContractAsync({
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'regUser',
        args: [referralAddress],
        gas: 1000000n,
        gasPrice: parseGwei('35'), // 35 gwei
      });

      console.log('📝 Registration transaction sent:', txHash);

      // Stage 5: Wait for confirmation
      setRegistrationStage({
        stage: 'confirming',
        message: 'Waiting for transaction confirmation...',
        progress: 75,
        txHash
      });

      // Wait for transaction receipt
      const receipt = await new Promise((resolve, reject) => {
        const checkReceipt = async () => {
          try {
            const receipt = await config.publicClient.getTransactionReceipt({ hash: txHash });
            if (receipt) {
              resolve(receipt);
            } else {
              setTimeout(checkReceipt, 2000); // Check every 2 seconds
            }
          } catch (error) {
            reject(error);
          }
        };
        checkReceipt();
      });

      // Stage 6: Check transaction status
      if (receipt && receipt.status === 'success') {
        setRegistrationStage({
          stage: 'success',
          message: 'Registration successful!',
          progress: 100,
          txHash
        });
        return true;
      } else {
        setRegistrationStage({
          stage: 'error',
          message: 'Transaction failed',
          progress: 0,
          txHash
        });
        return false;
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      setRegistrationStage({
        stage: 'error',
        message: error.message || 'Registration failed',
        progress: 0
      });
      return false;
    }
  };

  const resetRegistration = () => {
    setRegistrationStage({
      stage: 'idle',
      message: '',
      progress: 0
    });
  };

  return {
    registrationStage,
    registerUser,
    resetRegistration,
    validateReferralFormat,
    validateReferralExists,
    checkUserRegistration
  };
};