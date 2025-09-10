import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { parseUnits, parseGwei } from 'viem';
import { useAccount, useWriteContract, useChainId } from 'wagmi';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';
import { polygon } from 'wagmi/chains';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { ArrowUpDown, DollarSign, ArrowLeft, Settings, Info, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { div } from 'framer-motion/client';

interface SwapComponentProps {
  onBack?: () => void;
}

const SwapComponent: React.FC<SwapComponentProps> = ({ onBack }) => {
  const { orionBalance, usdtBalance, refetchBalances, isRefreshing, lastUpdated } = useWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { theme } = useTheme();
  const { data: dashboardData, refetch: refetchDashboard } = useDashboardData();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState<'USDT' | 'INOUT'>('USDT');
  const [toToken, setToToken] = useState<'USDT' | 'INOUT'>('INOUT');
  const [slippage, setSlippage] = useState(5.0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [swapStage, setSwapStage] = useState<{
    stage: 'idle' | 'approving' | 'swapping' | 'confirming' | 'success' | 'error';
    message: string;
    txHash?: string;
    progress: number;
  }>({
    stage: 'idle',
    message: '',
    progress: 0
  });

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get real-time token price from contract data
  const tokenPrice = (dashboardData?.tokenPrice) || 0.278105; // Price in USDT per INOUT
  const exchangeRate = 1 / tokenPrice; // INOUT per USDT

  // Calculate slippage and deduction based on token direction
  const getSlippageAndDeduction = (fromTokenType: string) => {
    if (fromTokenType === 'USDT') {
      return { slippage: 5.0, deduction: 5.0 }; // 5% for USDT to INOUT
    } else {
      return { slippage: 10.0, deduction: 10.0 }; // 10% for INOUT to USDT
    }
  };

  // Update slippage when token direction changes
  React.useEffect(() => {
    const { slippage: newSlippage } = getSlippageAndDeduction(fromToken);
    setSlippage(newSlippage);
  }, [fromToken]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-900',
          card: 'bg-white border-gray-200',
          input: 'bg-gray-50 border-gray-300 text-gray-900',
          button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        };
      case 'dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          card: 'bg-gray-800 border-gray-700',
          input: 'bg-gray-700 border-gray-600 text-white',
          button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
          text: 'text-gray-900',
          card: 'bg-white/80 border-blue-200',
          input: 'bg-white/60 border-blue-200 text-gray-900',
          button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const amount = Number(value);
      const { deduction } = getSlippageAndDeduction(fromToken);
      
      if (fromToken === 'USDT') {
        // USDT to INOUT: amount * exchangeRate with 5% deduction
        const totalTokens = amount * exchangeRate;
        console.log("totalTokens:", totalTokens);
        
        const deductionAmount = totalTokens * (deduction / 100);
        const finalAmount = totalTokens - deductionAmount;
        setToAmount(finalAmount.toFixed(4));
      } else {
        // INOUT to USDT: amount * tokenPrice with 10% deduction
        const totalUsdt = amount * tokenPrice;
        console.log("totalUsdt:", totalUsdt);
        
        const deductionAmount = totalUsdt * (deduction / 100);
        const finalAmount = totalUsdt - deductionAmount;
        setToAmount(finalAmount.toFixed(4));
      }
    } else {
      setToAmount('');
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    handleFromAmountChange(toAmount);
  };

  // Main swap handler - determines which function to call
  const handleSwap = async () => {
    // Check if user is on Polygon network
    if (chainId !== polygon.id) {
      toast.error('Please switch to Polygon network to perform swaps');
      return;
    }

    if (!fromAmount || Number(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    const availableBalance = fromToken === 'INOUT' ? usdtBalance : orionBalance;
    if (Number(fromAmount) > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSwapping(true);
    
    try {
      if (fromToken === 'USDT') {
        // USDT to INOUT: Use mint function
        await buyToken();
      } else {
        // INOUT to USDT: Use burn function
        await sellToken();
      }
    } catch (error: any) {
      console.error('Swap error:', error);
      setSwapStage({
        stage: 'error',
        message: error?.message || 'Swap failed',
        progress: 0
      });
      toast.error(error?.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  // Buy Token (USDT → INOUT) - Using mint function
  const buyToken = async () => {
    const depositval = parseFloat(fromAmount) || 0;
    const approvalAmount = parseUnits(depositval.toString(), 6); // USDT has 6 decimals
    
    console.log('💰 BUY TOKEN - Amount:', depositval, 'Wei:', approvalAmount.toString());
    
    try {
      // Stage 1: Check and approve USDT allowance
      setSwapStage({
        stage: 'approving',
        message: 'Checking USDT allowance...',
        progress: 25
      });
      
      const currentAllowance = await readContract(config, {
        address: CONTRACTS.USDT_TOKEN.address,
        abi: CONTRACTS.USDT_TOKEN.abi,
        functionName: 'allowance',
        args: [address, CONTRACTS.ORION_TOKEN.address],
      });
      
      console.log('📊 Current USDT allowance:', currentAllowance?.toString());
      
      if (!currentAllowance || BigInt(currentAllowance.toString()) < approvalAmount) {
        setSwapStage({
          stage: 'approving',
          message: 'Approving USDT spending...',
          progress: 35
        });

        const approveTx = await writeContractAsync({
          address: CONTRACTS.USDT_TOKEN.address,
          abi: CONTRACTS.USDT_TOKEN.abi,
          functionName: 'approve',
          args: [CONTRACTS.ORION_TOKEN.address, approvalAmount],
          gas: 100000n,
          gasPrice: parseGwei('35'),
        });
        
        console.log('✅ USDT Approval transaction:', approveTx);
        
        // Wait for approval confirmation
        setSwapStage({
          stage: 'approving',
          message: 'Waiting for approval confirmation...',
          progress: 45
        });

        await waitForTransactionReceipt(config, { hash: approveTx });
        console.log('✅ USDT Approval confirmed');
      }
      
      // Stage 2: Mint INOUT tokens
      setSwapStage({
        stage: 'swapping',
        message: 'Minting INOUT tokens...',
        progress: 60
      });
      
      const mintTx = await writeContractAsync({
        address: CONTRACTS.ORION_TOKEN.address,
        abi: CONTRACTS.ORION_TOKEN.abi,
        functionName: 'mint',
        args: [approvalAmount],
        gas: 300000n,
        gasPrice: parseGwei('35'),
      });
      
      console.log('✅ INOUT Mint transaction:', mintTx);
      
      // Stage 3: Confirming
      setSwapStage({
        stage: 'confirming',
        message: 'Waiting for blockchain confirmation...',
        progress: 80,
        txHash: mintTx
      });
      
      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, { hash: mintTx });
      
      if (receipt.status === 'success') {
        setSwapStage({
          stage: 'success',
          message: 'Swap successful!',
          progress: 100,
          txHash: mintTx
        });
        
        toast.success(`Successfully swapped ${fromAmount} USDT for INOUT tokens!`);
        
        // Refresh balances and dashboard data after successful swap
        try {
          console.log('🔄 Refreshing balances after successful mint...');
          await Promise.all([
            refetchBalances(),
            refetchDashboard()
          ]);
          console.log('✅ Balances and dashboard data refreshed');
        } catch (refreshError) {
          console.error('⚠️ Error refreshing data after swap:', refreshError);
          // Don't throw error, just log it as swap was successful
        }
        
        // Reset form
        setFromAmount('');
        setToAmount('');
        
        // Auto-close success after 3 seconds
        setTimeout(() => {
          setSwapStage({ stage: 'idle', message: '', progress: 0 });
        }, 3000);
        
      } else {
        throw new Error('Transaction failed on blockchain');
      }
      
    } catch (error: any) {
      console.error('❌ Buy token error:', error);
      
      // Handle specific error types
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (error?.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas fees');
      } else {
        throw new Error(error?.message || 'Buy transaction failed');
      }
    }
  };
  
  // Sell Token (INOUT → USDT) - Using burn function
  const sellToken = async () => {
    const depositval = parseFloat(fromAmount) || 0;
    const approvalAmount = parseUnits(depositval.toString(), 18); // INOUT has 18 decimals
    
    console.log('🔥 SELL TOKEN - Amount:', depositval, 'Wei:', approvalAmount.toString());
    
    try {
      // Stage 1: Check and approve INOUT allowance (for burn function)
      setSwapStage({
        stage: 'approving',
        message: 'Checking INOUT allowance...',
        progress: 25
      });
      
      const currentAllowance = await readContract(config, {
        address: CONTRACTS.ORION_TOKEN.address,
        abi: CONTRACTS.ORION_TOKEN.abi,
        functionName: 'allowance',
        args: [address, CONTRACTS.ORION_TOKEN.address],
      });
      
      console.log('📊 Current INOUT allowance:', currentAllowance?.toString());
      
      if (!currentAllowance || BigInt(currentAllowance.toString()) < approvalAmount) {
        setSwapStage({
          stage: 'approving',
          message: 'Approving INOUT spending...',
          progress: 35
        });

        const approveTx = await writeContractAsync({
          address: CONTRACTS.ORION_TOKEN.address,
          abi: CONTRACTS.ORION_TOKEN.abi,
          functionName: 'approve',
          args: [CONTRACTS.ORION_TOKEN.address, approvalAmount],
          gas: 100000n,
          gasPrice: parseGwei('35'),
        });
        
        console.log('✅ INOUT Approval transaction:', approveTx);
        
        // Wait for approval confirmation
        setSwapStage({
          stage: 'approving',
          message: 'Waiting for approval confirmation...',
          progress: 45
        });

        await config.publicClient.waitForTransactionReceipt({ hash: approveTx });
        console.log('✅ INOUT Approval confirmed');
      }
      
      // Stage 2: Burn INOUT tokens
      setSwapStage({
        stage: 'swapping',
        message: 'Burning INOUT tokens...',
        progress: 60
      });
      
      const burnTx = await writeContractAsync({
        address: CONTRACTS.ORION_TOKEN.address,
        abi: CONTRACTS.ORION_TOKEN.abi,
        functionName: 'burn',
        args: [approvalAmount],
        gas: 300000n,
        gasPrice: parseGwei('35'),
      });
      
      console.log('✅ INOUT Burn transaction:', burnTx);
      
      // Stage 3: Confirming
      setSwapStage({
        stage: 'confirming',
        message: 'Waiting for blockchain confirmation...',
        progress: 80,
        txHash: burnTx
      });
      
      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, { hash: burnTx });
      
      if (receipt.status === 'success') {
        setSwapStage({
          stage: 'success',
          message: 'Swap successful!',
          progress: 100,
          txHash: burnTx
        });
        
        toast.success(`Successfully swapped ${fromAmount} INOUT for USDT!`);
        
        // Refresh balances and dashboard data after successful swap
        try {
          console.log('🔄 Refreshing balances after successful burn...');
          await Promise.all([
            refetchBalances(),
            refetchDashboard()
          ]);
          console.log('✅ Balances and dashboard data refreshed');
        } catch (refreshError) {
          console.error('⚠️ Error refreshing data after swap:', refreshError);
          // Don't throw error, just log it as swap was successful
        }
        
        // Reset form
        setFromAmount('');
        setToAmount('');
        
        // Auto-close success after 3 seconds
        setTimeout(() => {
          setSwapStage({ stage: 'idle', message: '', progress: 0 });
        }, 3000);
        
      } else {
        throw new Error('Transaction failed on blockchain');
      }
      
    } catch (error: any) {
      console.error('❌ Sell token error:', error);
      
      // Handle specific error types
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (error?.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas fees');
      } else {
        throw new Error(error?.message || 'Sell transaction failed');
      }
    }
  };

  const getMaxBalance = () => {
    return fromToken === 'USDT' ? usdtBalance : orionBalance;
  };

  // Reset swap state
  const resetSwapState = () => {
    setSwapStage({ stage: 'idle', message: '', progress: 0 });
    setIsSwapping(false);
  };

  return (
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDesktop ? 'max-w-2xl mx-auto p-8' : 'px-4 py-24'}`}
    >
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
        <h2 className={`${isDesktop ? 'text-2xl' : 'text-xl'} font-bold text-white font-orbitron`}>Swap</h2>
        <motion.button
          whileHover={{ rotate: 90 }}
          className={`${isDesktop ? 'p-4 glass-card rounded-2xl' : 'p-3 glass-card-mobile rounded-2xl'} text-white hover:bg-white/10 transition-all`}
        >
          <Settings className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Swap Card */}
      <div className={`relative p-6 md:p-10 rounded-3xl border border-indigo-800/20 shadow-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift `}>
        {/* From Token */}
        <div className="space-y-4">
          <div className={`${isDesktop ? 'p-6' : 'p-4'} rounded-xl border bg-white/5 border-white/10 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">From</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70">
                  Balance: {getMaxBalance().toFixed(2)}
                </span>
                {isRefreshing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border border-white/40 border-t-blue-400 rounded-full "
                  />
                )}
              </div>
            </div>
            <div className="grid xs:flex grid-cols-1 xxs:grid-cols-3 xxs:grid-cols-2 items-center gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.00"
                className={`flex-1 bg-transparent ${isDesktop ? 'text-3xl' : 'text-2xl'} font-bold text-white focus:outline-none xxs:col-span-2 `}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setFromToken(fromToken === 'USDT' ? 'INOUT' : 'USDT')}
                className="flex items-center px-4 xxs:px-1 xs:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-lg font-orbitron"
              >
                {fromToken === 'USDT' ? (
                  <div className='h-5 w-5'><DollarSign className="h-5 w-5" /></div>
                  
                ) : (
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full font-orbitron"></div>
                  </div>
                )}
                <span>{fromToken}</span>
              </motion.button>
            </div>
            <button
              onClick={() => handleFromAmountChange(getMaxBalance().toString())}
              className="text-blue-500 hover:text-blue-400 text-sm mt-2 font-semibold"
            >
              MAX
            </button>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapTokens}
              className="p-3 rounded-full glass-card border-2 border-white/20 text-white transition-all shadow-lg"
            >
              <ArrowUpDown className="h-5 w-5" />
            </motion.button>
          </div>

          {/* To Token */}
          <div className={`${isDesktop ? 'p-6' : 'p-4'} rounded-xl border bg-white/5 border-white/10 backdrop-blur-sm`}>
            <div className="grid xs:flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">To</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70 ">
                  Balance: {(toToken === 'USDT' ? usdtBalance : orionBalance).toFixed(2)}
                </span>
                {lastUpdated && (
                  <span className="text-xs text-green-400">
                    Updated {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago
                  </span>
                )}
              </div>
            </div>
            <div className="grid xs:flex grid-cols-1 xxs:grid-cols-3 xxs:grid-cols-2 items-center gap-3">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.00"
                className={`flex-1 bg-transparent ${isDesktop ? 'text-3xl' : 'text-2xl'} font-bold text-white focus:outline-none xxs:col-span-2`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setToToken(toToken === 'USDT' ? 'INOUT' : 'USDT')}
                className="flex items-center px-4 xxs:px-1 xs:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-lg font-orbitron"
              >
                {toToken === 'USDT' ? (
                  <DollarSign className="h-5 w-5" />
                ) : (
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                )}
                <span>{toToken}</span>
              </motion.button>
            </div>
          </div>

          {/* Exchange Rate Info */}
          {fromAmount && toAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white font-semibold">Exchange Details</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-white/60">Rate</div>
                  <div className="text-white">
                    1 {fromToken} = {fromToken === 'USDT' ? exchangeRate.toFixed(4) : tokenPrice.toFixed(6)} {toToken}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Slippage</div>
                  <div className="text-yellow-400">{slippage}%</div>
                </div>
              </div>
              
              {fromAmount && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">You get approximately:</span>
                    <span className="text-green-400 font-semibold">{toAmount} {toToken}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-white/60">Deduction ({slippage}%):</span>
                    <span className="text-red-400">
                      {fromToken === 'USDT' 
                        ? ((Number(fromAmount) * exchangeRate * slippage) / 100).toFixed(4)
                        : ((Number(fromAmount) * tokenPrice * slippage) / 100).toFixed(4)
                      } {toToken}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Slippage Settings */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white font-orbitron">Slippage Tolerance</span>
              <span className="text-sm text-white">{slippage}%</span>
            </div>
            <div className="text-xs text-white/60 mb-2">
              {fromToken === 'USDT' ? 'USDT → INOUT: 5% deduction' : 'INOUT → USDT: 10% deduction'}
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xs text-white/80">
                Slippage is automatically set based on token pair direction and cannot be modified.
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSwap}
            disabled={isSwapping || !fromAmount || Number(fromAmount) <= 0 || swapStage.stage !== 'idle'}
            className="w-full py-4 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-orbitron"
          >
            {isSwapping || swapStage.stage !== 'idle' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto font-orbitron"
              />
            ) : (
              'Swap Tokens'
            )}
          </motion.button>
          
          {/* Transaction Progress */}
          {swapStage.stage !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-semibold">
                  {swapStage.stage === 'approving' && '🔐 Approving...'}
                  {swapStage.stage === 'swapping' && '🔄 Swapping...'}
                  {swapStage.stage === 'confirming' && '⏳ Confirming...'}
                  {swapStage.stage === 'success' && '✅ Success!'}
                  {swapStage.stage === 'error' && '❌ Failed'}
                </span>
                <span className="text-white/60 text-sm">{swapStage.progress}%</span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${swapStage.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-2 rounded-full ${
                    swapStage.stage === 'success' ? 'bg-green-500' :
                    swapStage.stage === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                />
              </div>
              
              <p className="text-white/70 text-xs">{swapStage.message}</p>
              
              {swapStage.txHash && (
                <a
                  href={`https://polygonscan.com/tx/${swapStage.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 mt-2 text-blue-400 hover:text-blue-300 text-xs"
                >
                  <span>View on PolygonScan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {/* Error state with retry button */}
              {swapStage.stage === 'error' && (
                <div className="mt-3 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSwap}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-lg transition-all text-sm"
                  >
                    Try Again
                  </motion.button>
                  <button
                    onClick={resetSwapState}
                    className="w-full py-2 text-white/70 hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwapComponent;