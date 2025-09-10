import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { polygon } from 'wagmi/chains';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import Alert from './ui/Alert';
import { 
  LogOut, 
  Wallet,
  Bell,
  Home,
  ArrowUpRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Copy,
  MoreHorizontal
} from 'lucide-react';

// Import Bottom Nav
import MobileBottomNav from './dashboard/MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'swap' | 'stake' | 'history';
  onTabChange?: (tab: 'home' | 'swap' | 'stake' | 'history') => void;
}


const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'home', onTabChange }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { logout, user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const isWrongNetwork = isConnected && chainId !== polygon.id;

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [alert, setAlert] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!isConnected) {
      logout();
    }
  }, [isConnected, logout]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setAlert({
        type: 'success',
        title: 'Copied!',
        message: 'Wallet address copied to clipboard',
        isVisible: true
      });
      if (window.triggerHaptic) window.triggerHaptic('light');
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    if (window.triggerHaptic) window.triggerHaptic('light');
  };
  
    // === Handlers copied from Dashboard for navbar ===
  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
    if (window.triggerHaptic) window.triggerHaptic('medium');
  };

  const handleLogout = () => {
    console.log('🚪 LOGOUT BUTTON CLICKED');
    
    // Disconnect wallet first
    if (isConnected) {
      try {
        disconnect();
        console.log('🔌 WALLET DISCONNECTED');
      } catch (error) {
        console.error('Wallet disconnect error:', error);
      }
    }
    
    // Then logout (which will handle the redirect)
    logout();
  };

  // Mobile doesn't need traditional navbar - use minimal header
  if (!isDesktop) {
    return (
      <>
      <div className="min-h-screen desktop-bg" >
        {/* Modern Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="safe-top">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo Section */}
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                    <img 
                      src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                      alt="ORION" 
                      className="w-full h-16 object-contain"
                    />
                  </div>
                  {/* <div>
                    <div className="text-white font-bold text-base">ORION</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Network</span>
                    </div>
                  </div> */}
                </motion.div>

                {/* Right Section - Network Status + Wallet */}
                <div className="flex items-center space-x-2 ">
                  {/* Network Status */}
                  <motion.div 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
                      isWrongNetwork 
                        ? 'bg-red-500/20 border-red-400/30 text-red-400' 
                        : 'bg-green-500/20 border-green-400/30 text-green-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {isWrongNetwork ? (
                      <WifiOff className="h-5 w-5 xxs:h-3 xxs:w-3" />
                    ) : (
                      <Wifi className="h-5 w-5 xxs:h-3 xxs:w-3" />
                    )}
                    <span className="text-xs font-medium xxs:flex hidden">
                      {isWrongNetwork ? 'Wrong' : 'Polygon'}
                    </span>
                  </motion.div>

                  {/* Wallet Address */}
                  {isConnected && (
                    <motion.button
                      onClick={copyAddress}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 transition-all"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <Wallet className="h-3 w-3 text-white/70" />
                      <span className="text-xs text-white font-mono">{formatAddress(address!)}</span>
                      <Copy className="h-3 w-3 text-white/50" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content with top padding */}
        <div className="pt-10 pb-20">
          {children}
        </div>
                  {/* Bottom Nav always visible on mobile */}
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showMoreMenu={showMoreMenu}
            onMoreMenuToggle={handleMoreMenuToggle}
            onHistoryClick={() => handleTabChange('history')}
          />
      </div>
      </>
    );
  }

  // Desktop Navigation
  return (
    <>
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={() => setAlert(prev => ({ ...prev, isVisible: false }))}
      />
      
    <div className="min-h-screen desktop-bg transition-all duration-500 ">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className=""
            >
              <motion.div 
                className="w-32 h-20 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                
              >
                <img 
                  src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                  alt="INOUT NETWORK" 
                  className="w-16 h-14 object-contain lg:w-32 lg:h-14"
                />
              </motion.div>
              
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {[
                { id: 'home', icon: Home, label: 'Home' },
                { id: 'swap', icon: ArrowUpRight, label: 'Swap' },
                { id: 'stake', icon: Wallet, label: 'Stake' },
                { id: 'history', icon: BarChart3, label: 'History' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'history') {
                      handleTabChange(tab.id as typeof activeTab);
                    } else {
                      handleTabChange(tab.id as typeof activeTab);
                    }
                  }}
                  className={`flex items-center space-x-0 lg:space-x-2 px-2 lg:px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Right Side Items */}
            <div className="flex items-center space-x-4">
              {/* Network & Wallet Status */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex items-center space-x-3 glass-card px-4 py-2 rounded-xl border border-white/10"
                >
                  <div className="flex items-center space-x-2">
                    {isWrongNetwork ? (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <Wifi className="h-4 w-4 text-green-400" />
                    )}
                    <span className={`text-xs font-medium ${isWrongNetwork ? 'text-red-400' : 'text-green-400'}`}>
                      {isWrongNetwork ? 'Wrong Network' : 'Polygon'}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <motion.button
                    onClick={copyAddress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                   className="flex items-center space-x-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                  >
                    <Wallet className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white font-mono">{formatAddress(address!)}</span>
                    <Copy className="h-3 w-3 text-white/50" />
                  </motion.button>
                </motion.div>
              )}

              {/* Wrong Network Warning */}
              {isConnected && isWrongNetwork && (
                <motion.button
                  onClick={() => open({ view: 'Networks' })}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl border border-red-400/30 hover:bg-red-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium">Switch Network</span>
                </motion.button>
              )}

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block p-2 glass-card rounded-xl text-white hover:bg-white/10 transition-all relative"
              >
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 glass-card rounded-xl text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-24">
        {children}
      </main>
    </div>
    </>
  );
};

export default Layout;