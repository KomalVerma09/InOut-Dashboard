import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ArrowUpRight, 
  Wallet, 
  MoreHorizontal,
  BarChart3,
  LogOut,
  User,
  Settings,
  HelpCircle,
  X,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileBottomNavProps {
  activeTab: 'home' | 'swap' | 'stake' | 'history';
  onTabChange: (tab: 'home' | 'swap' | 'stake' | 'history') => void;
  showMoreMenu: boolean;
  onMoreMenuToggle: () => void;
  onHistoryClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  showMoreMenu,
  onMoreMenuToggle,
  onHistoryClick
}) => {
  const { logout } = useAuth();

  const handleTabChange = (tab: typeof activeTab) => {
    onTabChange(tab);
    if (window.triggerHaptic) window.triggerHaptic('light');
  };

  const moreMenuItems = [
    { 
      icon: BarChart3, 
      label: 'Transaction History', 
      action: onHistoryClick,
      color: 'from-blue-500 to-blue-700',
      desc: 'View all your transactions'
    },
    // { 
    //   icon: User, 
    //   label: 'Profile Settings', 
    //   action: () => {
    //     console.log('Profile');
    //     onMoreMenuToggle();
    //   },
    //   color: 'from-purple-500 to-purple-700',
    //   desc: 'Manage your account'
    // },
    // { 
    //   icon: Settings, 
    //   label: 'App Settings', 
    //   action: () => {
    //     console.log('Settings');
    //     onMoreMenuToggle();
    //   },
    //   color: 'from-gray-500 to-gray-700',
    //   desc: 'Customize your experience'
    // },
    // { 
    //   icon: HelpCircle, 
    //   label: 'Help & Support', 
    //   action: () => {
    //     console.log('Help');
    //     onMoreMenuToggle();
    //   },
    //   color: 'from-green-500 to-green-700',
    //   desc: 'Get help and support'
    // },
    { 
      icon: LogOut, 
      label: 'Logout', 
      action: () => {
        logout();
        onMoreMenuToggle();
      },
      color: 'from-red-500 to-red-700',
      danger: true,
      desc: 'Sign out of your account'
    },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/20 backdrop-blur-md border-t border-purple-500/20">
        <div className="bg-slate-900/95 backdrop-blur-xl shadow-2xl">
          <div className="safe-bottom">
            <div className="flex justify-around items-center py-2">
              {[
                { id: 'home', icon: Home, label: 'Home' },
                { id: 'swap', icon: ArrowUpRight, label: 'Swap' },
                { id: 'stake', icon: Wallet, label: 'Stake' },
                { id: 'more', icon: MoreHorizontal, label: 'More' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'more') {
                      onMoreMenuToggle();
                    } else {
                      handleTabChange(tab.id as 'home' | 'swap' | 'stake');
                    }
                  }}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-2xl min-w-[70px] transition-all ${
                    (activeTab === tab.id || (tab.id === 'more' && showMoreMenu))
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative">
                    <tab.icon className="h-6 w-6" />
                    {(activeTab === tab.id || (tab.id === 'more' && showMoreMenu)) && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onMoreMenuToggle}
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
                  <h3 className="text-white text-xl font-bold">More Options</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMoreMenuToggle}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ChevronUp className="h-5 w-5 text-white/60" />
                  </motion.button>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {moreMenuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        item.action();
                        if (window.triggerHaptic) window.triggerHaptic('light');
                      }}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                        item.danger 
                          ? 'hover:bg-red-500/20 text-red-400 border border-red-400/20' 
                          : 'hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-white/60">
                          {item.label === 'Transaction History' && 'View all your transactions'}
                          {item.label === 'Profile Settings' && 'Manage your account'}
                          {item.label === 'App Settings' && 'Customize your experience'}
                          {item.label === 'Help & Support' && 'Get help and support'}
                          {item.label === 'Logout' && 'Sign out of your account'}
                        </div>
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

export default MobileBottomNav;