import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LiveStats {
  usersOnline: number;
  totalPayout: number;
  jackpotAmount: number;
  gamesPlaying: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  newUsersToday: number;
  activeGames: number;
}

interface LiveDataContextType {
  stats: LiveStats;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(
  undefined,
);

// Construct API base URL with fallback
const getApiBaseUrl = () => {
  try {
    // In development, use explicit localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:8080/api`;
    }
    // In production, use current origin
    return `${window.location.origin}/api`;
  } catch (error) {
    // Fallback if window.location is not available
    return '/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<LiveStats>({
    usersOnline: 1247,
    totalPayout: 125678.45,
    jackpotAmount: 245678.89,
    gamesPlaying: 423,
    totalWithdrawals: 45621.32,
    pendingWithdrawals: 15,
    newUsersToday: 127,
    activeGames: 847,
  });
  const [loading, setLoading] = useState(false);

  // API call helper with better error isolation
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      // Store reference to native fetch before any scripts can override it
      const originalFetch = window.fetch.bind(window);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const configWithSignal: RequestInit = {
        ...config,
        signal: controller.signal
      };

      const response = await originalFetch(url, configWithSignal);
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`API call failed with status ${response.status}: ${url}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Log error details for debugging but don't throw
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`API call timeout: ${url}`);
        } else {
          console.warn(`API call error for ${url}:`, error.message);
        }
      }
      return null;
    }
  };

  // Fetch live stats from API
  const fetchStats = async () => {
    setLoading(true);

    // Debug logging
    console.log('Fetching stats from:', `${API_BASE_URL}/public/stats`);

    const data = await apiCall("/public/stats");

    if (data && data.stats) {
      // Successfully got data from API
      setStats({
        usersOnline: data.stats.usersOnline,
        totalPayout: data.stats.totalPayout,
        jackpotAmount: data.stats.jackpotAmount,
        gamesPlaying: data.stats.gamesPlaying,
        totalWithdrawals: data.stats.totalWithdrawals,
        pendingWithdrawals: data.stats.pendingWithdrawals,
        newUsersToday: data.stats.newUsersToday,
        activeGames: data.stats.activeGames,
      });
    } else {
      // API failed or returned null, simulate live data with small random changes
      setStats((prev) => ({
        ...prev,
        usersOnline: Math.max(
          1200,
          prev.usersOnline + Math.floor(Math.random() * 20) - 10,
        ),
        totalPayout: prev.totalPayout + Math.random() * 2000,
        jackpotAmount: prev.jackpotAmount + Math.random() * 150,
        gamesPlaying: Math.max(
          300,
          prev.gamesPlaying + Math.floor(Math.random() * 10) - 5,
        ),
        newUsersToday: Math.max(
          50,
          prev.newUsersToday + Math.floor(Math.random() * 4) - 2,
        ),
        activeGames: Math.max(
          700,
          prev.activeGames + Math.floor(Math.random() * 6) - 3,
        ),
      }));
    }
    setLoading(false);
  };

  // Refresh stats manually
  const refreshStats = async () => {
    await fetchStats();
  };

  // Auto-refresh stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  const value: LiveDataContextType = {
    stats,
    refreshStats,
    loading,
  };

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const context = useContext(LiveDataContext);
  if (context === undefined) {
    throw new Error("useLiveData must be used within a LiveDataProvider");
  }
  return context;
}
