import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { Toaster } from 'react-hot-toast';
import { useChainId } from 'wagmi';
import { polygon } from 'wagmi/chains';

import { config, projectId, metadata } from './config/web3Config';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { div } from 'framer-motion/client';

// Setup queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30000,
    },
  },
});

// Create Web3Modal ONCE - outside component to prevent re-initialization
if (projectId) {
  try {
    createWeb3Modal({
      wagmiConfig: config,
      projectId,
      metadata,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#1e40af',
        '--w3m-color-mix-strength': 20,
        '--w3m-accent': '#3b82f6',
        '--w3m-border-radius-master': '12px',
      },
      featuredWalletIds: [
    
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
      ],
      enableAnalytics: true,
      enableOnramp: false,
      excludeWalletIds: [
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Exclude Coinbase
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Exclude Rainbow (causes duplicate MetaMask)
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Exclude Ledger Live (causes duplicate MetaMask)
      ],
    });
    console.log('✅ Web3Modal initialized successfully with Project ID:', projectId);
  } catch (error) {
    console.error('❌ Failed to create Web3Modal:', error);
  }
} else {
  console.error('❌ Missing WalletConnect Project ID');
}

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isRegistered } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'swap' | 'stake' | 'history'>('home');
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = isConnected && chainId !== polygon.id;
  const navigate = useNavigate();
  const location = useLocation();


  // Signal that app is ready
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🚀 App ready, dispatching load event');
      if (window.dispatchEvent) {
        window.dispatchEvent(new Event('load'));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while auth is being checked
  if (isLoading && location.pathname !== '/login' && location.pathname !== '/register') {
    return (
      <div className="min-h-screen desktop-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Route-based rendering
  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Login onSwitchToRegister={() => navigate('/register', { replace: true })} />
        )
      } />
      
      <Route path="/login" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Login onSwitchToRegister={() => navigate('/register', { replace: true })} />
        )
      } />
      
      <Route path="/register" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Register onSwitchToLogin={() => navigate('/login', { replace: true })} />
        )
      } />
      
      <Route path="/invite/:inviteCode" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Register onSwitchToLogin={() => navigate('/login', { replace: true })} />
        )
      } />
      
      <Route path="/register/invite/:inviteCode" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Register onSwitchToLogin={() => navigate('/login', { replace: true })} />
        )
      } />
      
      <Route path="/dashboard" element={
        isAuthenticated ? (
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
          </Layout>
        ) : (
          <Login onSwitchToRegister={() => navigate('/register', { replace: true })} />
        )
      } />
    </Routes>
  );
};

function App() {
  // Add error boundary
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('App error:', error);
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    
    <WagmiProvider config={config}>
      
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <WalletProvider>
            <AuthProvider>
              <div className="App">
                <AppContent />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'red',
                      color: '#fff',
                      border: '1px solid #374151',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </WalletProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;