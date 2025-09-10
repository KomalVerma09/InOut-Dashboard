import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { parseUnits, formatUnits } from 'viem';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import toast from 'react-hot-toast';
import { X, CreditCard, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface TransactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  availableWithdrawal: number;
  refetch: () => void;
}

const TransactionPopup: React.FC<TransactionPopupProps> = ({ 
  isOpen, 
  onClose, 
  availableWithdrawal,
  refetch 
}) => {
  const [step, setStep] = useState<'input' | 'validating' | 'confirming' | 'pending' | 'success' | 'error'>('input');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash,
    },
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTransaction = async () => {
    const baseAmount = parseFloat(amount) || 0;
    
    if (!baseAmount || baseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (baseAmount <= 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setStep('validating');
      setErrorMessage('');

      // Check INOUT balance (must be >= 10)
      const orionBalance = await readContract(config, {
        address: CONTRACTS.ORION_TOKEN.address,
        abi: CONTRACTS.ORION_TOKEN.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      
      const orionBalanceFormatted = orionBalance ? parseFloat(formatUnits(BigInt(orionBalance.toString()), 18)) : 0;
      
      if (orionBalanceFormatted < 10) {
        setStep('error');
        setErrorMessage(`Insufficient INOUT balance (${orionBalanceFormatted.toFixed(2)}). You need at least 10 INOUT tokens to proceed.`);
        return;
      }

      if (baseAmount > availableWithdrawal) {
        setStep('error');
        setErrorMessage('Amount exceeds available withdrawal balance');
        return;
      }

      setStep('confirming');
      
      // Convert amount to Wei (6 decimals for USDT)
      const amountWei = parseUnits(baseAmount.toString(), 6);
      
      // Call harvestStaking function
      const hash = await writeContractAsync({
        address: CONTRACTS.ORION_STAKING.address,
        abi: CONTRACTS.ORION_STAKING.abi,
        functionName: 'harvestStakeing',
        args: [amountWei, true], // amount in Wei, typePay=true for USDT
        gas: 1000000n,
      });

      setTxHash(hash);
      setStep('pending');
      toast.success('Transaction submitted! Waiting for confirmation...');
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      setStep('error');
      
      if (error.message?.includes('User rejected')) {
        setErrorMessage('Transaction was rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        setErrorMessage('Insufficient funds for gas fees');
      } else {
        setErrorMessage(error.message || 'Transaction failed');
      }
      
      toast.error('Transaction failed');
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (step === 'pending' && isSuccess) {
      setStep('success');
      toast.success('Withdrawal successful!');
      refetch();
    } else if (step === 'pending' && isError) {
      setStep('error');
      setErrorMessage('Transaction failed on blockchain');
      toast.error('Transaction failed');
    }
  }, [isSuccess, isError, step, refetch]);

  const resetAndClose = () => {
    setStep('input');
    setAmount('');
    setTxHash('');
    setErrorMessage('');
    onClose();
  };

  const getExplorerUrl = (hash: string) => {
    return `https://polygonscan.com/tx/${hash}`;
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: isDesktop ? 0 : 100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: isDesktop ? 0 : 100,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={resetAndClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`${isDesktop ? 'max-w-md w-full' : 'w-full max-w-sm'} bg-gray-800 rounded-3xl p-6 relative`}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={resetAndClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-white/60" />
            </motion.button>

            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Withdraw Funds</h3>
                    <p className="text-white/70 text-sm">Enter the amount you want to withdraw (min $10)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="10"
                        step="0.01"
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-400 transition-all"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-white/60 text-sm">USDT</span>
                      </div>
                    </div>

                    <div className="text-center text-sm text-white/60">
                      Available: ${availableWithdrawal?.toFixed(2) || '0.00'}
                    </div>

                    <div className="flex space-x-2">
                      {[50, 100, 500].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset.toString())}
                          disabled={preset > availableWithdrawal}
                          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-all"
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTransaction}
                      disabled={!amount || Number(amount) <= 10 || Number(amount) > availableWithdrawal}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <span>Withdraw Funds</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {(step === 'validating' || step === 'confirming') && (
                <motion.div
                  key="validating"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step === 'validating' ? 'Validating Request' : 'Confirm in Wallet'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {step === 'validating' 
                      ? 'Checking balance and withdrawal limits...' 
                      : 'Please confirm the transaction in your wallet'
                    }
                  </p>
                  <div className="mt-4 text-blue-400 font-mono text-lg">${amount} USDT</div>
                </motion.div>
              )}

              {step === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Transaction Pending</h3>
                  <p className="text-white/70 text-sm mb-4">Waiting for blockchain confirmation...</p>
                  <div className="text-yellow-400 font-mono text-lg mb-4">${amount} USDT</div>
                  
                  {txHash && (
                    <a
                      href={getExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
                    >
                      <span>View on PolygonScan</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Withdrawal Successful!</h3>
                  <p className="text-white/70 text-sm mb-4">Your withdrawal has been processed successfully</p>
                  <div className="text-green-400 font-mono text-lg mb-6">${amount} USDT</div>
                  
                  {txHash && (
                    <a
                      href={getExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-400 text-sm transition-all mb-4"
                    >
                      <span>View Transaction</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetAndClose}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-2xl transition-all"
                  >
                    Done
                  </motion.button>
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <AlertCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Withdrawal Failed</h3>
                  <p className="text-white/70 text-sm mb-4">{errorMessage || 'Something went wrong. Please try again.'}</p>
                  
                  {txHash && (
                    <a
                      href={getExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 text-sm transition-all mb-4"
                    >
                      <span>View Transaction</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('input')}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all"
                    >
                      Try Again
                    </motion.button>
                    <button
                      onClick={resetAndClose}
                      className="w-full py-3 text-white/70 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
//comment
export default TransactionPopup;