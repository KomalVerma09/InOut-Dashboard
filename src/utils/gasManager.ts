// Gas Management - Polygon network gas optimization
import { formatGwei, parseGwei } from 'viem';
import { polygon } from 'wagmi/chains';

// Polygon gas configuration
export const POLYGON_GAS_CONFIG = {
  // Standard gas limits for different operations
  GAS_LIMITS: {
    ERC20_TRANSFER: 65000n,
    ERC20_APPROVE: 55000n,
    SWAP: 200000n,
    STAKE: 150000n,
    UNSTAKE: 120000n,
    CLAIM_REWARDS: 100000n,
    REFERRAL_REGISTER: 80000n,
    AIRDROP_CLAIM: 90000n,
    MULTICALL: 300000n,
  },
  
  // Gas price tiers (in gwei)
  GAS_PRICES: {
    SLOW: parseGwei('30'),      // ~30 gwei - slow but cheap
    STANDARD: parseGwei('35'),   // ~35 gwei - standard speed
    FAST: parseGwei('45'),       // ~45 gwei - fast confirmation
    INSTANT: parseGwei('60'),    // ~60 gwei - instant confirmation
  },
  
  // Priority fees for EIP-1559 (Polygon supports it)
  PRIORITY_FEES: {
    SLOW: parseGwei('1'),
    STANDARD: parseGwei('2'),
    FAST: parseGwei('3'),
    INSTANT: parseGwei('5'),
  },
  
  // Maximum fee per gas (base fee + priority fee)
  MAX_FEE_PER_GAS: {
    SLOW: parseGwei('35'),
    STANDARD: parseGwei('40'),
    FAST: parseGwei('50'),
    INSTANT: parseGwei('70'),
  },
} as const;

// Gas speed options
export type GasSpeed = 'SLOW' | 'STANDARD' | 'FAST' | 'INSTANT';

// Gas estimation interface
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: bigint;
  estimatedCostUSD?: number;
}

// Get gas configuration for operation type
export const getGasLimit = (operationType: keyof typeof POLYGON_GAS_CONFIG.GAS_LIMITS): bigint => {
  return POLYGON_GAS_CONFIG.GAS_LIMITS[operationType];
};

// Get gas price configuration
export const getGasPrice = (speed: GasSpeed = 'STANDARD'): bigint => {
  return POLYGON_GAS_CONFIG.GAS_PRICES[speed];
};

// Get EIP-1559 gas configuration
export const getEIP1559GasConfig = (speed: GasSpeed = 'STANDARD') => {
  return {
    maxFeePerGas: POLYGON_GAS_CONFIG.MAX_FEE_PER_GAS[speed],
    maxPriorityFeePerGas: POLYGON_GAS_CONFIG.PRIORITY_FEES[speed],
  };
};

// Estimate gas cost in MATIC
export const estimateGasCost = (
  gasLimit: bigint,
  gasPrice: bigint
): bigint => {
  return gasLimit * gasPrice;
};

// Estimate gas cost in USD (requires MATIC price)
export const estimateGasCostUSD = (
  gasLimit: bigint,
  gasPrice: bigint,
  maticPriceUSD: number
): number => {
  const costInMatic = Number(estimateGasCost(gasLimit, gasPrice)) / 1e18;
  return costInMatic * maticPriceUSD;
};

// Get complete gas estimate for an operation
export const getGasEstimate = (
  operationType: keyof typeof POLYGON_GAS_CONFIG.GAS_LIMITS,
  speed: GasSpeed = 'STANDARD',
  maticPriceUSD?: number
): GasEstimate => {
  const gasLimit = getGasLimit(operationType);
  const eip1559Config = getEIP1559GasConfig(speed);
  
  const estimatedCost = estimateGasCost(gasLimit, eip1559Config.maxFeePerGas);
  const estimatedCostUSD = maticPriceUSD 
    ? estimateGasCostUSD(gasLimit, eip1559Config.maxFeePerGas, maticPriceUSD)
    : undefined;
  
  return {
    gasLimit,
    maxFeePerGas: eip1559Config.maxFeePerGas,
    maxPriorityFeePerGas: eip1559Config.maxPriorityFeePerGas,
    estimatedCost,
    estimatedCostUSD,
  };
};

// Format gas price for display
export const formatGasPrice = (gasPrice: bigint): string => {
  return `${formatGwei(gasPrice)} gwei`;
};

// Format gas cost for display
export const formatGasCost = (gasCost: bigint): string => {
  const costInMatic = Number(gasCost) / 1e18;
  return `${costInMatic.toFixed(6)} MATIC`;
};

// Get recommended gas configuration based on network congestion
export const getRecommendedGasConfig = (
  operationType: keyof typeof POLYGON_GAS_CONFIG.GAS_LIMITS,
  urgency: 'low' | 'medium' | 'high' = 'medium'
) => {
  const speedMap: Record<typeof urgency, GasSpeed> = {
    low: 'SLOW',
    medium: 'STANDARD',
    high: 'FAST',
  };
  
  const speed = speedMap[urgency];
  return getGasEstimate(operationType, speed);
};

// Polygon-specific gas optimization
export const optimizePolygonGas = (baseGasLimit: bigint): bigint => {
  // Add 20% buffer for Polygon network variations
  return (baseGasLimit * 120n) / 100n;
};

// Check if gas price is reasonable for Polygon
export const isReasonableGasPrice = (gasPrice: bigint): boolean => {
  const maxReasonablePrice = parseGwei('100'); // 100 gwei max for Polygon
  return gasPrice <= maxReasonablePrice;
};

// Gas price monitoring (for future implementation)
export interface GasPriceMonitor {
  currentGasPrice: bigint;
  recommendedGasPrice: bigint;
  networkCongestion: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

// Export gas utilities
export const GasUtils = {
  getGasLimit,
  getGasPrice,
  getEIP1559GasConfig,
  estimateGasCost,
  estimateGasCostUSD,
  getGasEstimate,
  formatGasPrice,
  formatGasCost,
  getRecommendedGasConfig,
  optimizePolygonGas,
  isReasonableGasPrice,
} as const;