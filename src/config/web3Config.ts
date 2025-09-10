
import { http, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Import the new contract system
export * from '../contracts';
export * from '../utils/gasManager';

// Your WalletConnect Project ID
export const projectId = '54f21f6c7882333f76d6cb091036ba32';

// Web3Modal Metadata
export const metadata = {
  name: 'INOUT NETWORK',
  description: 'decentralized financial ecosystem',
  url: 'https://in-out.live',
  icons: ['https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png'],
  verifyUrl: 'https://in-out.live'
};

// Ensure project ID is valid
if (!projectId) {
  throw new Error('WalletConnect Project ID is required');
}

// Clean Wagmi Config with optimized settings
export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: http('https://polygon-rpc.com', {
      batch: false,
      fetchOptions: {
        timeout: 10000,
      },
    }),
  },
  connectors: [
    injected({
      target: {
        id: 'metaMask',
        name: 'MetaMask',
        provider: (window) => window.ethereum?.isMetaMask ? window.ethereum : undefined,
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      },
    }),

    walletConnect({
      projectId,
      metadata,
      showQrModal: false, // Web3Modal will handle this
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000',
        },
      },
    }),
  ],
  ssr: false,
  multiInjectedProviderDiscovery: false,
});

// Network validation
export const isPolygonNetwork = (chainId: number) => {
  return chainId === polygon.id;
};

// Default DeFi settings
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE = 20; // 20 minutes
export const GAS_LIMIT_MULTIPLIER = 1.2;