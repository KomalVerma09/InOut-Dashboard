import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook, AuthState, User } from '../hooks/useAuth';

interface AuthContextType extends AuthState {
  validateUser: () => Promise<boolean>;
  logout: () => void;
  isWrongNetwork: boolean;
  getReferralFromUrl: () => string | null;
  validateReferralAddress: (address: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authHook = useAuthHook();

  // Validate referral address format
  const validateReferralAddress = (address: string): boolean => {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  };

  // Get referral from URL
  const getReferralFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    return ref && validateReferralAddress(ref) ? ref : null;
  };

  const contextValue: AuthContextType = {
    ...authHook,
    getReferralFromUrl,
    validateReferralAddress,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};