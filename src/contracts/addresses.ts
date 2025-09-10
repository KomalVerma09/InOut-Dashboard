// Contract Addresses - Centralized address management
import { polygon } from 'wagmi/chains';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [polygon.id]: {
    // Token Contracts
    ORION_TOKEN: '0xC279a4807523Be2901725aA5f52d4c93B77F1138' as `0x${string}`,
    USDT_TOKEN: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as `0x${string}`,
    
    // Platform Contracts
    DAO_CONTRACT: '0xE8D23648ce0D102f0AEbbD710797E184581017E7' as `0x${string}`,
    AFFILIATE_CONTRACT: '0x17e2A356b4C33e17318beE7E4ac11287AC79129F' as `0x${string}`,
    PAYMENT_CONTRACT: '0xa2eaB28188fDd78b9fbf5F4299Ca5F713798E0ea' as `0x${string}`,
    SAVING_CONTRACT: '0xd22E666953fe59CCDF6F6DE116Db3632Eb66442F' as `0x${string}`,
    ADVISER_CONTRACT: '0xE4Cd5911494a40f5a5f2649B241c086bE2e6DF3A' as `0x${string}`,
    ORION_STAKING: '0x8a011F9872fa91A422Ae81543da5b4A50A636a41' as `0x${string}`,
  },
} as const;

// Helper function to get contract address for current network
export const getContractAddress = (
  contractName: keyof typeof CONTRACT_ADDRESSES[typeof polygon.id],
  chainId: number = polygon.id
): `0x${string}` => {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  
  const address = addresses[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not found for chain ${chainId}`);
  }
  
  return address;
};

// Export individual addresses for convenience
export const ORION_TOKEN_ADDRESS = getContractAddress('ORION_TOKEN');
export const USDT_TOKEN_ADDRESS = getContractAddress('USDT_TOKEN');
export const DAO_CONTRACT_ADDRESS = getContractAddress('DAO_CONTRACT');
export const AFFILIATE_CONTRACT_ADDRESS = getContractAddress('AFFILIATE_CONTRACT');
export const PAYMENT_CONTRACT_ADDRESS = getContractAddress('PAYMENT_CONTRACT');
export const SAVING_CONTRACT_ADDRESS = getContractAddress('SAVING_CONTRACT');
export const ADVISER_CONTRACT_ADDRESS = getContractAddress('ADVISER_CONTRACT');
export const ORION_STAKING_ADDRESS = getContractAddress('ORION_STAKING');