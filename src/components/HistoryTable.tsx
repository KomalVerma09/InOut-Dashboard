import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  ArrowLeft, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Calendar,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Users,
  Gift,
  Wallet,
  Download
} from 'lucide-react';

interface HistoryTableProps {
  onBack: () => void;
  onViewTeamHistory?: () => void;
}

interface DepositTransaction {
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

interface ReferralTransaction {
  date: string;
  latestDepo: string;
  tagName: string;
  active_status: boolean;
  userWalletBase58: string;
  transaction: string;
}

interface RewardTransaction {
  date: string;
  amount: string;
  level: string;
  from_user: string;
  reward_type: string;
}

interface WithdrawalTransaction {
  date: string;
  amount: string;
  transaction: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    deposits?: DepositTransaction[];
    deposits_count?: string;
    referrals?: ReferralTransaction[];
    referrals_count?: string;
    rewards?: RewardTransaction[];
    rewards_count?: string;
    withdrawals?: WithdrawalTransaction[];
    withdrawals_count?: string;
  };
}

const HistoryTable: React.FC<HistoryTableProps> = ({ onBack, onViewTeamHistory }) => {
  const { address } = useAccount();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'deposits' | 'withdrawals' | 'referrals' | 'rewards'>('deposits');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data from API
  const fetchHistoryData = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const url = `https://theorion.network/apis/index.php?action=getHistory&address=${address}&type=${filterType}&page=${currentPage}&limit=${limit}`;
      
      console.log('🔍 Fetching history data:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      
      console.log('📊 API Response:', data);
      
      if (data.status === 'success') {
        setApiData(data);
        
        // Set total count based on type
        const count = data.data[`${filterType}_count` as keyof typeof data.data] as string;
        setTotalCount(parseInt(count || '0'));
      } else {
        console.error('API Error:', data.message);
        setApiData(null);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      
      // Show user-friendly error message
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🌐 Network error: Server may be unreachable or CORS issue');
      } else if (error instanceof SyntaxError) {
        console.error('📄 Invalid JSON response from server');
      }
      
      setApiData(null);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchHistoryData();
  }, [address, filterType, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // Get filtered transactions based on search
  const getFilteredTransactions = () => {
    if (!apiData?.data) return [];

    let transactions: any[] = [];
    
    switch (filterType) {
      case 'deposits':
        transactions = apiData.data.deposits || [];
        break;
      case 'withdrawals':
        transactions = apiData.data.withdrawals || [];
        break;
      case 'referrals':
        transactions = apiData.data.referrals || [];
        break;
      case 'rewards':
        transactions = apiData.data.rewards || [];
        break;
    }

    if (!searchTerm) return transactions;

    return transactions.filter(tx => {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.transaction?.toLowerCase().includes(searchLower) ||
        tx.amount?.toLowerCase().includes(searchLower) ||
        tx.reward_type?.toLowerCase().includes(searchLower) ||
        tx.tagName?.toLowerCase().includes(searchLower) ||
        tx.userWalletBase58?.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / limit);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const getTypeIcon = (type: string, transaction: any) => {
    switch (type) {
      case 'deposits': return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'withdrawals': return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'referrals': return <Users className="h-4 w-4 text-blue-400" />;
      case 'rewards': 
        if (transaction.reward_type?.includes('Growth')) return <TrendingUp className="h-4 w-4 text-purple-400" />;
        if (transaction.reward_type?.includes('Affilate')) return <Users className="h-4 w-4 text-blue-400" />;
        if (transaction.reward_type?.includes('Team')) return <Gift className="h-4 w-4 text-orange-400" />;
        return <Gift className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (transaction: any) => {
    if (filterType === 'deposits') {
      return transaction.isUnlocked ? 
        <CheckCircle className="h-4 w-4 text-green-400" /> : 
        <Clock className="h-4 w-4 text-yellow-400" />;
    }
    if (filterType === 'referrals') {
      return transaction.active_status ? 
        <CheckCircle className="h-4 w-4 text-green-400" /> : 
        <XCircle className="h-4 w-4 text-red-400" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposits': return 'from-green-400/20 to-green-600/20 border-green-400/30';
      case 'withdrawals': return 'from-red-400/20 to-red-600/20 border-red-400/30';
      case 'referrals': return 'from-blue-400/20 to-blue-600/20 border-blue-400/30';
      case 'rewards': return 'from-purple-400/20 to-purple-600/20 border-purple-400/30';
      default: return 'from-gray-400/20 to-gray-600/20 border-gray-400/30';
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount);
    if (type === 'withdrawals' || type === 'deposits') {
      return `${type === 'withdrawals' ? '-' : '+'}$${num.toFixed(2)}`;
    }
    return `+$${num.toFixed(2)}`;
  };

  const getTransactionTitle = (transaction: any) => {
    switch (filterType) {
      case 'deposits': return `Deposit #${transaction.order_id}`;
      case 'withdrawals': return 'Withdrawal';
      case 'referrals': return transaction.tagName || 'Referral User';
      case 'rewards': return transaction.reward_type;
      default: return 'Transaction';
    }
  };

  const getTransactionSubtitle = (transaction: any) => {
    switch (filterType) {
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

  // Mobile Layout
  return (
    <div className={`min-h-screen ${isDesktop ? 'desktop-bg' : 'mobile-bg'} ${isDesktop ? '' : 'pt-20 pb-20'}`}>
      <div className={`space-y-6 ${isDesktop ? 'max-w-4xl mx-auto p-8' : 'px-4 py-6'}`}>

        {/* Header */}
        <div className={`flex items-center justify-between ${isDesktop ? 'mb-8' : 'mb-6'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className={`${isDesktop ? 'p-4 glass-card rounded-2xl' : 'p-3 glass-card-mobile rounded-2xl'} text-white hover:bg-white/10 transition-all`}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <h2 className={`${isDesktop ? 'text-2xl' : 'text-xl'} font-bold text-white`}>Transaction History</h2>
          <div className="w-12"></div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className={`w-full pl-12 pr-4 ${isDesktop ? 'py-4 text-base' : 'py-3 text-sm'} bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all`}
          />
        </div>

        {/* Filter Tabs - Mobile Optimized */}
        {!isDesktop ? (
          <div className="space-y-3">
            {/* Filter Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-white"
            >
              <div className="flex items-center space-x-3">
                {getTypeIcon(filterType, {})}
                <span className="font-semibold capitalize">{filterType}</span>
              </div>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Filter className="h-5 w-5 text-white/60" />
              </motion.div>
            </motion.button>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { key: 'deposits', label: 'Deposits', icon: ArrowDownLeft, color: 'from-green-400 to-green-600' },
                  { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, color: 'from-red-400 to-red-600' },
                  { key: 'referrals', label: 'Referrals', icon: Users, color: 'from-blue-400 to-blue-600' },
                  { key: 'rewards', label: 'Rewards', icon: Gift, color: 'from-purple-400 to-purple-600' },
                  { key: 'team', label: 'Team', icon: Users, color: 'from-orange-400 to-orange-600' },
                ].map((type) => (
                  <motion.button
                    key={type.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (type.key === 'team') {
                        console.log('📱 MOBILE: Team button clicked, calling onViewTeamHistory');
                        onViewTeamHistory?.();
                        setShowFilters(false);
                      } else {
                        setFilterType(type.key as any);
                        setShowFilters(false);
                      }
                    }}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-xl font-semibold transition-all ${
                      filterType === type.key
                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <type.icon className="h-5 w-5" />
                    <span className="text-sm">{type.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          /* Desktop: Original horizontal tabs */
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'deposits', label: 'Deposits', icon: ArrowDownLeft },
              { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
              { key: 'referrals', label: 'Referrals', icon: Users },
              { key: 'rewards', label: 'Rewards', icon: Gift },
              { key: 'team', label: 'Team', icon: Users },
            ].map((type) => (
              <motion.button
                key={type.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (type.key === 'team') {
                    console.log('🖥️ DESKTOP: Team button clicked, calling onViewTeamHistory');
                    onViewTeamHistory?.();
                  } else {
                    setFilterType(type.key as any);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  filterType === type.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span>{type.label}</span>
              </motion.button>
            ))}
          </div>
        )}
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Showing {startItem}-{endItem} of {totalCount} {filterType}
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Transactions List */}
        {!isLoading && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={`${transaction.transaction || transaction.order_id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTransaction(transaction)}
                  className={`${isDesktop ? 'glass-card rounded-2xl p-6' : 'glass-card-mobile rounded-xl p-4'} cursor-pointer hover:bg-white/10 transition-all ${
                    isDesktop ? 'hover:scale-[1.02]' : ''
                  }`}
                >
                  <div className={`flex items-center ${isDesktop ? 'space-x-4' : 'space-x-3'}`}>
                    {/* Type Icon */}
                    <div className={`${isDesktop ? 'w-14 h-14' : 'w-10 h-10'} bg-gradient-to-br ${getTypeColor(filterType)} rounded-xl flex items-center justify-center border flex-shrink-0`}>
                      {getTypeIcon(filterType, transaction)}
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center justify-between ${isDesktop ? 'mb-1' : 'mb-0.5'}`}>
                        <h3 className={`text-white font-semibold ${isDesktop ? 'text-lg' : 'text-sm'} truncate pr-2`}>
                          {getTransactionTitle(transaction)}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getStatusIcon(transaction)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-white/70 ${isDesktop ? 'text-base' : 'text-xs'}`}>
                            {transaction.date}
                          </div>
                          <div className={`text-white/50 ${isDesktop ? 'text-sm' : 'text-2xs'} truncate max-w-[120px]`}>
                            {getTransactionSubtitle(transaction)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`${isDesktop ? 'text-xl' : 'text-base'} font-bold ${
                            filterType === 'withdrawals' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {formatAmount(transaction.amount || transaction.latestDepo, filterType)}
                          </div>
                          <div className={`text-white/60 ${isDesktop ? 'text-base' : 'text-xs'}`}>
                            USDT
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* More Options */}
                    {isDesktop && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-white/40" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTransactions.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-white font-semibold mb-2">No transactions found</h3>
                <p className="text-white/60 text-sm">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !isDesktop && (
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Prev</span>
            </motion.button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl">
              <span className="text-white text-sm font-semibold">
                {currentPage} / {totalPages}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}

        {/* Desktop Pagination */}
        {totalPages > 1 && isDesktop && (
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <motion.button
                    key={pageNum}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-end justify-center p-4"
              onClick={() => setSelectedTransaction(null)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${isDesktop ? 'max-w-md w-full' : 'w-full max-w-sm mx-4'} glass-card-mobile rounded-3xl p-6 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`${isDesktop ? 'text-xl' : 'text-lg'} font-bold text-white`}>
                    {getTransactionTitle(selectedTransaction)}
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-white/60" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Amount</span>
                    <span className="text-white font-semibold text-right">
                      {formatAmount(selectedTransaction.amount || selectedTransaction.latestDepo, filterType)} USDT
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Date</span>
                    <span className="text-white font-semibold text-right">
                      {selectedTransaction.date}
                    </span>
                  </div>
                  
                  {selectedTransaction.transaction && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Transaction Hash</span>
                      <span className="text-white font-mono text-xs text-right">
                        {selectedTransaction.transaction.slice(0, 10)}...{selectedTransaction.transaction.slice(-8)}
                      </span>
                    </div>
                  )}
                  
                  {filterType === 'referrals' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/70">User Address</span>
                        <span className="text-white font-mono text-xs text-right">
                          {selectedTransaction.userWalletBase58.slice(0, 6)}...{selectedTransaction.userWalletBase58.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status</span>
                        <span className={`font-semibold text-right ${selectedTransaction.active_status ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedTransaction.active_status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {filterType === 'rewards' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/70">Reward Type</span>
                        <span className="text-white font-semibold text-right text-xs">
                          {selectedTransaction.reward_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Level</span>
                        <span className="text-white font-semibold text-right">
                          {selectedTransaction.level}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {filterType === 'deposits' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/70">Order ID</span>
                        <span className="text-white font-semibold text-right">
                          #{selectedTransaction.order_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status</span>
                        <span className={`font-semibold text-right ${selectedTransaction.isUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                          {selectedTransaction.isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      {!selectedTransaction.isUnlocked && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Remaining Time</span>
                          <span className="text-white font-semibold text-right">
                            {selectedTransaction.remaining_time.days}d {selectedTransaction.remaining_time.hours}h
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selectedTransaction.transaction && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`https://polygonscan.com/tx/${selectedTransaction.transaction}`, '_blank')}
                    className={`w-full ${isDesktop ? 'py-3' : 'py-2'} bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2`}
                  >
                    <span className={isDesktop ? 'text-base' : 'text-sm'}>View on Explorer</span>
                    <ExternalLink className="h-4 w-4" />
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default HistoryTable;