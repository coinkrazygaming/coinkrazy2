import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gold_coins: number;
  sweeps_coins: number;
  sc_balance?: number;
  gc_balance?: number;
  level: number;
  experience_points: number;
  kyc_status: string;
  is_admin: boolean;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateBalance: (goldCoins: number, sweepsCoins: number) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = window.location.origin + "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log("Making API call to:", url, "with config:", config);

    try {
      const response = await fetch(url, config);
      console.log("Response received:", response.status, response.statusText);

      if (!response.ok) {
        // Try to get error message from response if possible
        let errorMessage = `API call failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("Error response data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
          // If we can't parse the error response, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Success response data:", data);
      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  // Verify token and get user data
  const verifyToken = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall("/auth/verify");
      // Only update state if component is still mounted
      setUser(data.user);
    } catch (error) {
      console.error("Token verification failed:", error);
      // Only call logout if component is still mounted
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Attempting login with:", { email, password: "***" });
      const data = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response received:", data);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const data = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Update balance (for real-time updates)
  const updateBalance = (goldCoins: number, sweepsCoins: number) => {
    if (user) {
      setUser({
        ...user,
        gold_coins: goldCoins,
        sweeps_coins: sweepsCoins,
      });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;

    try {
      const data = await apiCall("/user/profile");
      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Check token on mount
  useEffect(() => {
    let isMounted = true;

    const checkToken = async () => {
      if (isMounted) {
        await verifyToken();
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh user data periodically
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (user && token) {
      interval = setInterval(() => {
        refreshUser();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user, token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateBalance,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
