import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { useDashboardData } from '../hooks/useDashboardData';
import CountUpNumber from './CountUpNumber';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits, parseGwei } from 'viem';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../config/web3Config';
import { CONTRACTS } from '../contracts';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Wallet,
  DollarSign,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StakeComponentProps {
  onBack?: () => void;
}

const StakeComponent: React.FC<StakeComponentProps> = ({ onBack }) => {
  const { orionBalance, usdtBalance, refetchBalances } = useWallet();
  const { address } = useAccount();
  const { data: processedData, refetch } = useDashboardData();
  const [depositInUSDT, setDepositInUSDT] = useState('');
  const [depositInToken, setDepositInToken] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const { writeContractAsync } = useWriteContract();

  // Calculate growth rate
  const calculateGrowth = (amount: number): number => {
    if (amount >= 10000) return 0.75;
    if (amount >= 5000) return 0.65;
    if (amount >= 1000) return 0.55;
    return 0.5;
  };

  // Slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const depositAmount = (usdtBalance * value) / 100;
    setDepositInUSDT(depositAmount.toFixed(2));
    const tokenPrice = processedData?.tokenPrice || 0.278105;
    const tokenAmount = depositAmount / tokenPrice;
    const finalTokenAmount = tokenAmount - tokenAmount * 0.05;
    setDepositInToken(finalTokenAmount.toFixed(6));
  };

  // Input change
  const updateValues = (field: 'usdt' | 'token', value: string) => {
    const tokenPrice = processedData?.tokenPrice || 0.278105;
    if (field === 'usdt') {
      const usdt = parseFloat(value) || 0;
      const token = usdt / tokenPrice;
      const final = token - token * 0.05;
      setDepositInUSDT(value);
      setDepositInToken(final.toFixed(6));
      setSliderValue(usdtBalance > 0 ? Math.min((usdt / usdtBalance) * 100, 100) : 0);
    } else {
      const token = parseFloat(value) || 0;
      const usdt = token * tokenPrice;
      setDepositInToken(value);
      setDepositInUSDT(usdt.toFixed(2));
      setSliderValue(usdtBalance > 0 ? Math.min((usdt / usdtBalance) * 100, 100) : 0);
    }
  };

  // Handle staking
  const handleStakingRequest = async () => {
    const baseAmount = parseFloat(depositInUSDT) || 0;
    if (!baseAmount || baseAmount <= 0) return toast.error('Enter valid amount');
    if (baseAmount > usdtBalance) return toast.error('Insufficient USDT balance');
    if (!address) return toast.error('Wallet not connected');

    setIsStaking(true);
    try {
      const usdtAmountWei = parseUnits(baseAmount.toString(), 6);

      // Allowance check
      const currentAllowance = await readContract(config, {
        address: CONTRACTS.USDT_TOKEN.address,
        abi: CONTRACTS.USDT_TOKEN.abi,
        functionName: 'allowance',
        args: [address, CONTRACTS.ORION_STAKING.address],
      });

      if (!currentAllowance || BigInt(currentAllowance.toString()) < usdtAmountWei) {
        const approveTx = await writeContractAsync({
          address: CONTRACTS.USDT_TOKEN.address,
          abi: CONTRACTS.USDT_TOKEN.abi,
          functionName: 'approve',
          args: [CONTRACTS.ORION_STAKING.address, usdtAmountWei],
          gas: 100000n,
          gasPrice: parseGwei('35'),
        });
        await waitForTransactionReceipt(config, { hash: approveTx });
      }

      // Stake
      const txHash = await writeContractAsync({
        address: CONTRACTS.ORION_STAKING.address,
        abi: CONTRACTS.ORION_STAKING.abi,
        functionName: 'depositStake',
        args: [usdtAmountWei, address],
        gas: 1000000n,
        gasPrice: parseGwei('35'),
      });
      const receipt = await waitForTransactionReceipt(config, { hash: txHash });

      if (receipt.status === 'success') {
        toast.success(`Successfully staked ${baseAmount} USDT!`);
        setDepositInUSDT('');
        setDepositInToken('');
        setSliderValue(0);
        await Promise.all([refetch(), refetchBalances()]);
      } else toast.error('Transaction failed');
    } catch (e: any) {
      toast.error(e?.message || 'Staking request failed');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto space-y-8 p-6 md:p-10 border border-indigo-800/20 shadow-2xl rounded-3xl bg-gradient-to-br from-gray-900 via-indigo-950 to-black hover-lift"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </motion.button>
        <h2 className="text-2xl font-bold text-white font-orbitron">Power Stakes</h2>
        <div />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-indigo-800/20 bg-white/5 backdrop-blur-lg">
          <div className="text-white/70 text-sm">Available Withdrawal</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-green-400">
              $ {processedData?.availableWithdrawal || 0}
            </span>
            <Download className="h-6 w-6 text-green-300" />
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-indigo-800/20 bg-white/5 backdrop-blur-lg">
          <div className="text-white/70 text-sm">Current Portfolio</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-pink-400">
              $ {processedData?.currentPortfolio || 0}
            </span>
            <TrendingUp className="h-6 w-6 text-pink-300" />
          </div>
        </div>
      </div>

      {/* Growth Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-indigo-800/20 bg-white/5 backdrop-blur-lg">
          <div className="text-white/70 text-sm mb-1">Total Growths Potential</div>
          <div className="text-lg font-bold text-white">
            $ {(processedData?.selfGrowth || 0).toFixed(2)} / ${(processedData?.frozenProfit || 0).toFixed(2)}
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-indigo-800/20 bg-white/5 backdrop-blur-lg">
          <div className="text-white/70 text-sm mb-1">Remain Earning Potential</div>
          <div className="text-lg font-bold text-white">
            $ {(processedData?.userTPR || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Stake Form */}
      <div className="p-8 rounded-3xl border border-indigo-800/20 bg-white/5 backdrop-blur-lg space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-orbitron">ORION STAKE DEPOSIT</h3>
            <p className="text-sm text-white/70">Stake tokens & earn daily returns</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-indigo-800/20 bg-white/5">
            <div className="text-xs text-white/70">ORION BALANCE</div>
            <div className="text-white font-bold">
              <CountUpNumber end={orionBalance || 0} decimals={6} duration={2.5} />
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-indigo-800/20 bg-white/5">
            <div className="text-xs text-white/70">USDT BALANCE</div>
            <div className="text-white font-bold">
              <CountUpNumber end={usdtBalance || 0} decimals={2} duration={2.5} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={depositInUSDT}
            onChange={(e) => updateValues('usdt', e.target.value)}
            placeholder="USDT Amount"
            className="p-4 rounded-2xl border border-indigo-800/20 bg-transparent text-white font-bold focus:outline-none"
          />
          <input
            type="number"
            value={depositInToken}
            onChange={(e) => updateValues('token', e.target.value)}
            placeholder="Token Amount"
            className="p-4 rounded-2xl border border-indigo-800/20 bg-transparent text-white font-bold focus:outline-none"
          />
        </div>

        {/* Growth + Saving */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white text-lg font-bold">
              <CountUpNumber end={calculateGrowth(parseFloat(depositInUSDT) || 0)} decimals={2} suffix=" %" />
            </div>
            <div className="text-xs text-white/70">/daily return</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Instant Saving</div>
            <div className="text-white font-bold">
              $ {((parseFloat(depositInUSDT) || 0) * 0.05).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Slider */}
        <div>
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>Deposit Amount</span>
            <span>{sliderValue.toFixed(0)}% (${((usdtBalance * sliderValue) / 100).toFixed(2)})</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sliderValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isStaking}
          onClick={handleStakingRequest}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg disabled:opacity-50 font-orbitron"
        >
          {isStaking ? 'Processing...' : 'Stake Now'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StakeComponent;
