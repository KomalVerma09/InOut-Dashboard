import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface DepositTransaction {
  date: string;
  order_id: string;
  amount: string;
  transaction: string;
  isUnlocked: boolean;
  remaining_time: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export interface ReferralTransaction {
  date: string;
  latestDepo: string;
  tagName: string;
  active_status: boolean;
  userWalletBase58: string;
  transaction: string;
}

export interface RewardTransaction {
  date: string;
  amount: string;
  level: string;
  from_user: string;
  reward_type: string;
}

export interface WithdrawalTransaction {
  date: string;
  amount: string;
  transaction: string;
}

export interface HistoryData {
  deposits?: DepositTransaction[];
  deposits_count?: string;
  referrals?: ReferralTransaction[];
  referrals_count?: string;
  rewards?: RewardTransaction[];
  rewards_count?: string;
  withdrawals?: WithdrawalTransaction[];
  withdrawals_count?: string;
}

export interface HistoryState {
  data: HistoryData | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export const useHistory = () => {
  const { address } = useAccount();
  const [historyState, setHistoryState] = useState<HistoryState>({
    data: null,
    isLoading: false,
    error: null,
    totalCount: 0
  });

  // Fetch history data
  const fetchHistory = async (
    type: 'deposits' | 'withdrawals' | 'referrals' | 'rewards' | 'all' = 'all',
    page: number = 1,
    limit: number = 10
  ) => {
    if (!address) {
      setHistoryState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setHistoryState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const url = `https://theorion.network/apis/index.php?action=getHistory&address=${address.toLowerCase()}&type=${type}&page=${page}&limit=${limit}`;
      
      console.log('🔍 Fetching history data:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 History API Response:', data);
      
      if (data.status === 'success') {
        // Calculate total count based on type
        let totalCount = 0;
        if (type === 'all') {
          totalCount = Object.keys(data.data).reduce((sum, key) => {
            if (key.endsWith('_count')) {
              return sum + parseInt(data.data[key] || '0');
            }
            return sum;
          }, 0);
        } else {
          const countKey = `${type}_count`;
          totalCount = parseInt(data.data[countKey] || '0');
        }
        
        setHistoryState({
          data: data.data,
          isLoading: false,
          error: null,
          totalCount
        });
      } else {
        throw new Error(data.message || 'Failed to fetch history');
      }
    } catch (error: any) {
      console.error('❌ Error fetching history:', error);
      setHistoryState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch history data'
      }));
    }
  };

  // Get filtered transactions by type
  const getTransactionsByType = (type: 'deposits' | 'withdrawals' | 'referrals' | 'rewards') => {
    if (!historyState.data) return [];
    return historyState.data[type] || [];
  };

  // Get transaction count by type
  const getCountByType = (type: 'deposits' | 'withdrawals' | 'referrals' | 'rewards') => {
    if (!historyState.data) return 0;
    const countKey = `${type}_count` as keyof HistoryData;
    return parseInt(historyState.data[countKey] as string || '0');
  };

  // Search transactions
  const searchTransactions = (
    transactions: any[],
    searchTerm: string
  ) => {
    if (!searchTerm) return transactions;

    const searchLower = searchTerm.toLowerCase();
    return transactions.filter(tx => {
      return (
        tx.transaction?.toLowerCase().includes(searchLower) ||
        tx.amount?.toLowerCase().includes(searchLower) ||
        tx.reward_type?.toLowerCase().includes(searchLower) ||
        tx.tagName?.toLowerCase().includes(searchLower) ||
        tx.userWalletBase58?.toLowerCase().includes(searchLower) ||
        tx.order_id?.toLowerCase().includes(searchLower)
      );
    });
  };

  // Format amount for display
  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    if (type === 'withdrawals') {
      return `-$${num.toFixed(2)}`;
    }
    return `+$${num.toFixed(2)}`;
  };

  // Get transaction title
  const getTransactionTitle = (transaction: any, type: string) => {
    switch (type) {
      case 'deposits': return `Deposit #${transaction.order_id}`;
      case 'withdrawals': return 'Withdrawal';
      case 'referrals': return transaction.tagName || 'Referral User';
      case 'rewards': return transaction.reward_type;
      default: return 'Transaction';
    }
  };

  // Get transaction subtitle
  const getTransactionSubtitle = (transaction: any, type: string) => {
    switch (type) {
      case 'deposits': 
        return transaction.isUnlocked ? 'Unlocked' : 
          `Locked - ${transaction.remaining_time.days}d ${transaction.remaining_time.hours}h remaining`;
      case 'withdrawals': return 'Completed';
      case 'referrals': 
        return `${transaction.userWalletBase58.slice(0, 6)}...${transaction.userWalletBase58.slice(-4)}`;
      case 'rewards': 
        return `Level ${transaction.level} • From ${transaction.from_user.slice(0, 6)}...${transaction.from_user.slice(-4)}`;
      default: return '';
    }
  };

  // Auto-fetch when address changes
  useEffect(() => {
    if (address) {
      fetchHistory();
    }
  }, [address]);

  return {
    ...historyState,
    fetchHistory,
    getTransactionsByType,
    getCountByType,
    searchTransactions,
    formatAmount,
    getTransactionTitle,
    getTransactionSubtitle,
  };
};