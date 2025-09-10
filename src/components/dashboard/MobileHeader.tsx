import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle, 
  BarChart3,
  Wallet,
  Copy,
  CheckCircle,
  Wifi,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAccount } from 'wagmi';

interface MobileHeaderProps {
  tokenPrice: number;
  onHistoryClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ tokenPrice, onHistoryClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { logout } = useAuth();
  const { address } = useAccount();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      if (window.triggerHaptic) window.triggerHaptic('light');
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const menuItems = [
    { icon: BarChart3, label: 'Transaction History', action: onHistoryClick },
    { icon: User, label: 'Profile Settings', action: () => console.log('Profile') },
    { icon: Settings, label: 'App Settings', action: () => console.log('Settings') },
    { icon: HelpCircle, label: 'Help & Support', action: () => console.log('Help') },
    { icon: LogOut, label: 'Logout', action: logout, danger: true },
  ];

  return (
    <>
      {/* Modern Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* Status Bar Background */}
        <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 h-8"></div>
        
        {/* Main Header */}
        <div className="bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl border-b border-white/10">
          <div className="px-4 py-3">
            {/* Single Row - Logo, Price, Wallet, Menu */}
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src="https://raw.githubusercontent.com/inquisitiveScholar/images/refs/heads/main/InOut-Images/logo.png" 
                    alt="INOUT" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-base">INOUT</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">Polygon</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Section - Price + Menu */}
              <div className="flex items-center space-x-3">
                {/* INOUT Price */}
                <motion.div 
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl px-3 py-2 border border-green-400/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="text-center">
                    <div className="text-white text-xs font-bold">
                      ${Number(tokenPrice || 0).toFixed(6)}
                    </div>
                    <div className="text-green-400 text-xs">1 ORIN</div>
                  </div>
                </motion.div>

                {/* Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(true)}
                  className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl text-white hover:bg-white/10 transition-all border border-blue-400/30 shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl rounded-t-3xl border-t border-white/10 shadow-2xl"
            >
              <div className="p-6">
                {/* Handle */}
                <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-6"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-xl font-bold">Menu</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-white/60" />
                  </motion.button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        item.action();
                        setIsMenuOpen(false);
                        if (window.triggerHaptic) window.triggerHaptic('light');
                      }}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                        item.danger 
                          ? 'hover:bg-red-500/20 text-red-400 border border-red-400/20' 
                          : 'hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.danger 
                          ? 'bg-gradient-to-br from-red-500/20 to-red-600/20' 
                          : 'bg-gradient-to-br from-blue-500/20 to-purple-600/20'
                      }`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{item.label}</div>
                        {/* <div className="text-xs text-white/60">{item.desc}</div> */}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Safe Area */}
                <div className="safe-bottom mt-6"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHeader;