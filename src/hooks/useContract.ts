// Contract Hook - Unified contract interaction
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CONTRACTS, ContractName } from '../contracts';
import { getGasEstimate, GasSpeed } from '../utils/gasManager';

// Contract read hook
export const useContractRead = <T = any>(
  contractName: ContractName,
  functionName: string,
  args?: any[],
  options?: {
    enabled?: boolean;
    watch?: boolean;
  }
) => {
  const contract = CONTRACTS[contractName];
  
  return useReadContract({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    chainId: contract.chainId,
    query: {
      enabled: options?.enabled ?? true,
      refetchInterval: options?.watch ? 5000 : false,
    },
  });
};

// Contract write hook with gas management
export const useContractWrite = (
  contractName: ContractName,
  gasSpeed: GasSpeed = 'STANDARD'
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  
  const contract = CONTRACTS[contractName];
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const writeAsync = async (
    functionName: string,
    args: any[] = [],
    options?: {
      value?: bigint;
      gasSpeed?: GasSpeed;
      onSuccess?: (hash: `0x${string}`) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    try {
      setIsLoading(true);
      
      // Get gas estimate
      const operationType = getOperationType(functionName);
      const gasConfig = getGasEstimate(operationType, options?.gasSpeed || gasSpeed);
      
      // Show gas estimate to user
      toast.loading(
        `Estimated gas: ${(Number(gasConfig.estimatedCost) / 1e18).toFixed(6)} MATIC`,
        { duration: 2000 }
      );
      
      // Execute transaction
      const result = await writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
        value: options?.value,
        gas: gasConfig.gasLimit,
        maxFeePerGas: gasConfig.maxFeePerGas,
        maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
      });
      
      setTxHash(result);
      
      toast.success('Transaction submitted!');
      options?.onSuccess?.(result);
      
      return result;
    } catch (error) {
      console.error('Contract write error:', error);
      toast.error('Transaction failed');
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    writeAsync,
    isLoading: isLoading || isPending,
    isConfirming,
    isSuccess,
    txHash,
    error,
  };
};

// Helper function to map function names to gas operation types
const getOperationType = (functionName: string): keyof typeof import('../utils/gasManager').POLYGON_GAS_CONFIG.GAS_LIMITS => {
  const operationMap: Record<string, keyof typeof import('../utils/gasManager').POLYGON_GAS_CONFIG.GAS_LIMITS> = {
    'transfer': 'ERC20_TRANSFER',
    'approve': 'ERC20_APPROVE',
    'swapTokens': 'SWAP',
    'stake': 'STAKE',
    'unstake': 'UNSTAKE',
    'claimRewards': 'CLAIM_REWARDS',
    'registerReferral': 'REFERRAL_REGISTER',
    'claimAirdrop': 'AIRDROP_CLAIM',
  };
  
  return operationMap[functionName] || 'ERC20_TRANSFER';
};

// Multi-contract read hook
export const useMultiContractRead = (
  calls: Array<{
    contractName: ContractName;
    functionName: string;
    args?: any[];
  }>
) => {
  const results = calls.map(call => 
    useContractRead(call.contractName, call.functionName, call.args)
  );
  
  return {
    data: results.map(r => r.data),
    isLoading: results.some(r => r.isLoading),
    error: results.find(r => r.error)?.error,
    refetch: () => results.forEach(r => r.refetch()),
  };
};

// Contract event listener hook
export const useContractEvents = (
  contractName: ContractName,
  eventName: string,
  options?: {
    fromBlock?: bigint;
    args?: any[];
  }
) => {
  // This would be implemented with wagmi's useWatchContractEvent
  // For now, returning a placeholder
  return {
    events: [],
    isLoading: false,
    error: null,
  };
};

// Export contract utilities
export const ContractUtils = {
  useContractRead,
  useContractWrite,
  useMultiContractRead,
  useContractEvents,
} as const;