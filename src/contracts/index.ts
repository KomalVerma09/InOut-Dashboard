// Contract Configuration - Main contract setup
import { polygon } from 'wagmi/chains';
import { CONTRACT_ABIS } from './abis';
import { getContractAddress } from './addresses';

// Contract configurations with ABI and address
export const CONTRACTS = {
  ORION_TOKEN: {
    address: getContractAddress('ORION_TOKEN'),
    abi: CONTRACT_ABIS.ORION_TOKEN,
    chainId: polygon.id,
  },
  
  USDT_TOKEN: {
    address: getContractAddress('USDT_TOKEN'),
    abi: CONTRACT_ABIS.USDT_TOKEN,
    chainId: polygon.id,
  },
  
  DAO_CONTRACT: {
    address: getContractAddress('DAO_CONTRACT'),
    abi: CONTRACT_ABIS.DAO_CONTRACT,
    chainId: polygon.id,
  },
  
  AFFILIATE_CONTRACT: {
    address: getContractAddress('AFFILIATE_CONTRACT'),
    abi: CONTRACT_ABIS.AFFILIATE_CONTRACT,
    chainId: polygon.id,
  },
  
  PAYMENT_CONTRACT: {
    address: getContractAddress('PAYMENT_CONTRACT'),
    abi: CONTRACT_ABIS.PAYMENT_CONTRACT,
    chainId: polygon.id,
  },
  
  SAVING_CONTRACT: {
    address: getContractAddress('SAVING_CONTRACT'),
    abi: CONTRACT_ABIS.SAVING_CONTRACT,
    chainId: polygon.id,
  },
  
  ADVISER_CONTRACT: {
    address: getContractAddress('ADVISER_CONTRACT'),
    abi: CONTRACT_ABIS.ADVISER_CONTRACT,
    chainId: polygon.id,
  },
  
  ORION_STAKING: {
    address: getContractAddress('ORION_STAKING'),
    abi: CONTRACT_ABIS.ORION_STAKING,
    chainId: polygon.id,
  },
} as const;

// Helper function to get contract configuration
export const getContractConfig = (contractName: keyof typeof CONTRACTS) => {
  return CONTRACTS[contractName];
};

// Export contract types for TypeScript
export type ContractName = keyof typeof CONTRACTS;
export type ContractConfig = typeof CONTRACTS[ContractName];

// Re-export everything for convenience
export * from './abis';
export * from './addresses';