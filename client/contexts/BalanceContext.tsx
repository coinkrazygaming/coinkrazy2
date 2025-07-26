import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface BalanceContextType {
  scBalance: number;
  gcBalance: number;
  updateBalance: (newBalance: { sc?: number; gc?: number }) => void;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [scBalance, setScBalance] = useState(0);
  const [gcBalance, setGcBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user balance from API
  const refreshBalance = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScBalance(data.scBalance || 0);
        setGcBalance(data.gcBalance || 0);
      }
    } catch (error) {
      console.warn('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance (for real-time updates from games)
  const updateBalance = (newBalance: { sc?: number; gc?: number }) => {
    if (newBalance.sc !== undefined) {
      setScBalance(newBalance.sc);
    }
    if (newBalance.gc !== undefined) {
      setGcBalance(newBalance.gc);
    }
  };

  // Initialize balance when user changes
  useEffect(() => {
    if (user) {
      // Use existing user properties as fallback, then refresh from API
      setScBalance(user.sc_balance || user.sweeps_coins || 0);
      setGcBalance(user.gc_balance || user.gold_coins || 0);
      refreshBalance();
    } else {
      setScBalance(0);
      setGcBalance(0);
    }
  }, [user]);

  // Periodic balance refresh (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const value: BalanceContextType = {
    scBalance,
    gcBalance,
    updateBalance,
    refreshBalance,
    isLoading,
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}
