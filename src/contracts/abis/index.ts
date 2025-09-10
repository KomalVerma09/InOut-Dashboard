// Import all ABI JSON files
import orionTokenAbi from './orionToken.json';
import usdtTokenAbi from './usdtToken.json';
import daoContractAbi from './daoContract.json';
import affiliateContractAbi from './affiliateContract.json';
import paymentContractAbi from './paymentContract.json';
import savingContractAbi from './savingContract.json';
import adviserContractAbi from './adviserContract.json';
import orionStakingAbi from './orionStaking.json';

// Export all ABIs with proper typing
export const CONTRACT_ABIS = {
  ORION_TOKEN: orionTokenAbi,
  USDT_TOKEN: usdtTokenAbi,
  DAO_CONTRACT: daoContractAbi,
  AFFILIATE_CONTRACT: affiliateContractAbi,
  PAYMENT_CONTRACT: paymentContractAbi,
  SAVING_CONTRACT: savingContractAbi,
  ADVISER_CONTRACT: adviserContractAbi,
  ORION_STAKING: orionStakingAbi,
} as const;

// Export individual ABIs for direct access
export {
  orionTokenAbi,
  usdtTokenAbi,
  daoContractAbi,
  affiliateContractAbi,
  paymentContractAbi,
  savingContractAbi,
  adviserContractAbi,
  orionStakingAbi,
};

// Type definitions for better TypeScript support
export type ContractABI = typeof CONTRACT_ABIS[keyof typeof CONTRACT_ABIS];
export type ContractABIName = keyof typeof CONTRACT_ABIS;