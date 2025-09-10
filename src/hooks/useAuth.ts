import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { readContract } from 'wagmi/actions';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';

export interface User {
  id: string;
  walletAddress: string;
  referralAddress?: string;
  referralCode?: string;
  totalTeam?: number;
  directTeam?: number;
  isRegistered: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRegistered: boolean | null; // null = unknown, true = registered, false = not registered
}

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isRegistered: null
  });

  const isWrongNetwork = isConnected && chainId !== polygon.id;

  // Session management (10 minutes)
  const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  const SESSION_KEY = 'inout-session';

  const setSession = () => {
    const sessionData = {
      address,
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  };

  const getSession = () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  // Check if user is registered
  const validateUser = async (): Promise<boolean> => {
    if (!address || !isConnected || isWrongNetwork) {
      console.log('🔍 VALIDATION SKIPPED - Missing requirements:', {
        address: !!address,
        isConnected,
        isWrongNetwork,
      });
      setAuthState(prev => ({ ...prev, isRegistered: false }));
      return false;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      console.log('🔍 VALIDATING USER:', address);
      
      // Call affiliate contract
      const affiliateData = await readContract(config, {
        address: CONTRACTS.AFFILIATE_CONTRACT.address,
        abi: CONTRACTS.AFFILIATE_CONTRACT.abi,
        functionName: 'affiliateUser',
        args: [address],
      });
      
      console.log('📊 RAW CONTRACT RESPONSE:', affiliateData);
      
      // Parse response
      let referralAddress, regIndex, joinedStatus;
      if (Array.isArray(affiliateData)) {
        referralAddress = affiliateData[0];
        regIndex = affiliateData[1];
        joinedStatus = affiliateData[2];
      } else if (affiliateData && typeof affiliateData === 'object') {
        referralAddress = affiliateData.referral;
        regIndex = affiliateData.regIndex;
        joinedStatus = affiliateData.joined;
      }
      
      console.log('📋 PARSED DATA:', {
        referralAddress,
        regIndex: regIndex?.toString(),
        joinedStatus,
        joinedType: typeof joinedStatus
      });
      
      // Determine registration status
      const isRegistered = joinedStatus === true || joinedStatus === 'true' || joinedStatus == 1;
      
      console.log('🔍 REGISTRATION CHECK:', {
        finalDecision: isRegistered ? 'REGISTERED ✅' : 'NOT REGISTERED ❌'
      });
      
      if (isRegistered) {
        // Get additional user data
        try {
          const stakingData = await readContract(config, {
            address: CONTRACTS.ORION_STAKING.address,
            abi: CONTRACTS.ORION_STAKING.abi,
            functionName: 'userInfos',
            args: [address],
          });
          
          const userData: User = {
            id: address,
            walletAddress: address,
            referralAddress: referralAddress,
            referralCode: address.slice(-6).toUpperCase(),
            totalTeam: stakingData?.totalTeam ? Number(stakingData.totalTeam) : 0,
            directTeam: 1,
            isRegistered: true,
          };
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            isRegistered: true
          });
          
          setSession(); // Set session on successful login
          return true;
          
        } catch (stakingError) {
          console.log('⚠️ Could not fetch staking data, using basic user data');
          
          const basicUserData: User = {
            id: address,
            walletAddress: address,
            referralAddress: referralAddress,
            referralCode: address.slice(-6).toUpperCase(),
            totalTeam: 0,
            directTeam: 1,
            isRegistered: true,
          };
          
          setAuthState({
            user: basicUserData,
            isAuthenticated: true,
            isLoading: false,
            isRegistered: true
          });
          
          setSession();
          return true;
        }
      } else {
        setAuthState({
          user: {
            id: address,
            walletAddress: address,
            isRegistered: false,
          },
          isAuthenticated: false,
          isLoading: false,
          isRegistered: false
        });
        return false;
      }
      
    } catch (error) {
      console.error('❌ VALIDATION ERROR:', error);
      setAuthState({
        user: {
          id: address || '',
          walletAddress: address || '',
          isRegistered: false,
        },
        isAuthenticated: false,
        isLoading: false,
        isRegistered: false
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 LOGOUT INITIATED');
    
    clearSession();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isRegistered: null
    });
    
    // Clear all storage
    localStorage.removeItem('orion-user');
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.cache');
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.recentConnectorId');
    sessionStorage.clear();
    
    console.log('✅ LOGOUT COMPLETED - Storage cleared');
  };

  // Check session on mount and periodically
  useEffect(() => {
    const session = getSession();
    if (session && session.address === address && isConnected) {
      // Session is valid, validate user
      validateUser();
    }

    // Set up session check interval
    const interval = setInterval(() => {
      const currentSession = getSession();
      if (!currentSession && authState.isAuthenticated) {
        // Session expired, logout
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [address, isConnected]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      console.log('🔌 WALLET DISCONNECTED - Clearing auth state');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isRegistered: null
      });
      clearSession();
    }
  }, [isConnected]);

  // Auto-validate when wallet address changes
  useEffect(() => {
    if (address && isConnected && !isWrongNetwork) {
      console.log('🔄 WALLET ADDRESS CHANGED - Auto-validating:', address);
      
      // Clear previous state first
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isRegistered: null,
        isLoading: true
      }));
      
      // Auto-validate the new address
      validateUser();
    }
  }, [address]); // Only trigger when address changes

  return {
    ...authState,
    validateUser,
    logout,
    isWrongNetwork
  };
};