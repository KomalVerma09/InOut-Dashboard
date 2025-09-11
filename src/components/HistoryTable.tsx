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

  
  // 🔒 Scroll lock effect
  useEffect(() => {
    if (selectedTransaction) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedTransaction]);

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

  // Updated Layout with Table in Container
  return (
    <div className={`min-h-screen  ${isDesktop ? '' : 'pt-16 pb-24'}`}>
      <div className={` max-w-3xl mx-auto space-y-8 p-6 md:p-10 border border-indigo-800/20 shadow-2xl rounded-3xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black`}>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onBack}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </motion.button>
            <h2 className="text-3xl font-extrabold text-indigo-200 tracking-wide">History Overview</h2>
          </div>
          <div className="text-indigo-400 text-sm font-medium">
            {startItem}-{endItem} of {totalCount} Entries • Page {currentPage}/{totalPages}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter entries..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800/30 border border-indigo-800/20 rounded-full text-indigo-200 placeholder-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-2xl"
          />
        </div>

        {/* Filter Tabs */}
        {!isDesktop ? (
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between py-3 px-5 bg-gray-800/40 border border-indigo-800/20 rounded-full text-indigo-200 shadow-2xl"
            >
              <span className="font-medium capitalize flex items-center gap-2">
                {getTypeIcon(filterType, {})}
                {filterType}
              </span>
              <motion.div
                animate={{ rotate: showFilters ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Filter className="h-5 w-5 text-indigo-400" />
              </motion.div>
            </motion.button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap gap-3 justify-center"
              >
                {[
                  { key: 'deposits', label: 'Deposits', icon: ArrowDownLeft, color: 'bg-green-700 hover:bg-green-600' },
                  { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, color: 'bg-red-700 hover:bg-red-600' },
                  { key: 'referrals', label: 'Referrals', icon: Users, color: 'bg-blue-700 hover:bg-blue-600' },
                  { key: 'rewards', label: 'Rewards', icon: Gift, color: 'bg-purple-700 hover:bg-purple-600' },
                  { key: 'team', label: 'Team', icon: Users, color: 'bg-orange-700 hover:bg-orange-600' },
                ].map((type) => (
                  <motion.button
                    key={type.key}
                    whileTap={{ scale: 0.92 }}
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
                    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium text-white transition-colors ${
                      filterType === type.key ? `${type.color} shadow-2xl` : 'bg-gray-800/30 hover:bg-indigo-800/30 border border-indigo-800/20'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
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
                className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-medium transition-colors ${
                  filterType === type.key
                    ? 'bg-indigo-600 text-white shadow-2xl'
                    : 'bg-gray-800/50 text-indigo-300 hover:bg-indigo-800/30 border border-indigo-800/20'
                }`}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Transactions List in Container */}
        {!isLoading && (
          <div className="bg-gray-800/30 border border-indigo-800/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800/50 text-indigo-300 text-left text-sm">
                    <th className="py-3 px-4 rounded-tl-xl">Type</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={`${transaction.transaction || transaction.order_id || index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="bg-gray-800/20 hover:bg-indigo-800/20 cursor-pointer transition-colors border-b border-indigo-800/20"
                      >
                        <td className="py-4 px-4">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr ${getTypeColor(filterType)}`}>
                            {getTypeIcon(filterType, transaction)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-indigo-200 font-medium">{getTransactionTitle(transaction)}</td>
                        <td className="py-4 px-4 text-indigo-400">{transaction.date}</td>
                        <td className="py-4 px-4 text-indigo-500 text-sm">{getTransactionSubtitle(transaction)}</td>
                        <td className={`py-4 px-4 font-bold ${filterType === 'withdrawals' ? 'text-red-400' : 'text-green-400'}`}>
                          {formatAmount(transaction.amount || transaction.latestDepo, filterType)}
                        </td>
                        <td className="py-4 px-4">{getStatusIcon(transaction)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredTransactions.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-gray-800/20 rounded-b-xl"
                >
                  <Search className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                  <h3 className="text-indigo-200 font-medium mb-1">No entries available</h3>
                  <p className="text-indigo-400 text-sm">Modify search or filters to see results</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2 bg-gray-800/50 hover:bg-indigo-800/30 disabled:opacity-40 rounded-full text-indigo-300 transition-colors border border-indigo-800/20 shadow-2xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </motion.button>

            {!isDesktop ? (
              <div className="px-5 py-2 bg-gray-800/50 rounded-full text-indigo-200 font-medium border border-indigo-800/20 shadow-2xl">
                {currentPage} / {totalPages}
              </div>
            ) : (
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <motion.button
                      key={pageNum}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-2xl'
                          : 'bg-gray-800/50 text-indigo-300 hover:bg-indigo-800/30 border border-indigo-800/20'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2 bg-gray-800/50 hover:bg-indigo-800/30 disabled:opacity-40 rounded-full text-indigo-300 transition-colors border border-indigo-800/20 shadow-2xl"
            >
              Next
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
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedTransaction(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${isDesktop ? 'w-full max-w-lg' : 'w-full'} bg-gray-900/90 border border-indigo-800/20 rounded-3xl p-8 space-y-6 shadow-2xl`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-indigo-200">
                    {getTransactionTitle(selectedTransaction)}
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-indigo-800/30 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-indigo-400" />
                  </motion.button>
                </div>

                <div className="space-y-5 text-sm">
                  <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                    <span className="text-indigo-400">Amount</span>
                    <span className="text-indigo-200 font-medium">
                      {formatAmount(selectedTransaction.amount || selectedTransaction.latestDepo, filterType)} USDT
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                    <span className="text-indigo-400">Date</span>
                    <span className="text-indigo-200 font-medium">
                      {selectedTransaction.date}
                    </span>
                  </div>
                  
                  {selectedTransaction.transaction && (
                    <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                      <span className="text-indigo-400">Transaction Hash</span>
                      <span className="text-indigo-200 font-mono text-xs">
                        {selectedTransaction.transaction.slice(0, 10)}...{selectedTransaction.transaction.slice(-8)}
                      </span>
                    </div>
                  )}
                  
                  {filterType === 'referrals' && (
                    <>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">User Address</span>
                        <span className="text-indigo-200 font-mono text-xs">
                          {selectedTransaction.userWalletBase58.slice(0, 6)}...{selectedTransaction.userWalletBase58.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">Status</span>
                        <span className={`font-medium ${selectedTransaction.active_status ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedTransaction.active_status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {filterType === 'rewards' && (
                    <>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">Reward Type</span>
                        <span className="text-indigo-200 font-medium text-xs">
                          {selectedTransaction.reward_type}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">Level</span>
                        <span className="text-indigo-200 font-medium">
                          {selectedTransaction.level}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {filterType === 'deposits' && (
                    <>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">Order ID</span>
                        <span className="text-indigo-200 font-medium">
                          #{selectedTransaction.order_id}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                        <span className="text-indigo-400">Status</span>
                        <span className={`font-medium ${selectedTransaction.isUnlocked ? 'text-green-400' : 'text-yellow-400'}`}>
                          {selectedTransaction.isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      {!selectedTransaction.isUnlocked && (
                        <div className="flex justify-between border-b border-indigo-800/20 pb-2">
                          <span className="text-indigo-400">Remaining Time</span>
                          <span className="text-indigo-200 font-medium">
                            {selectedTransaction.remaining_time.days}d {selectedTransaction.remaining_time.hours}h
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selectedTransaction.transaction && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open(`https://polygonscan.com/tx/${selectedTransaction.transaction}`, '_blank')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 shadow-2xl"
                  >
                    View on Explorer
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