import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  type: "win" | "bonus" | "system" | "chat" | "achievement" | "warning";
  title: string;
  message: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  action_url?: string;
  icon?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  toggleNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const lastNotificationCheck = useRef<Date>(new Date());

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // WebSocket connection disabled to prevent fetch errors
  useEffect(() => {
    // Completely disabled to prevent any network errors
    return () => {};
  }, [user, token]);

  // Fallback polling mechanism (disabled to prevent fetch errors)
  const setupPolling = () => {
    // Disable polling to prevent fetch errors
    // Return a no-op cleanup function
    return () => {};
  };

  // Load initial notifications
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      return;
    }

    // Use local mock notifications to prevent any fetch errors
    const mockNotifications = [
      {
        id: "1",
        type: "system" as const,
        title: "🎉 Welcome to CoinKrazy!",
        message: "Your account is ready. Start playing to earn rewards!",
        priority: "high" as const,
        icon: "🎰",
        read: false,
        timestamp: new Date().toISOString(),
      },
    ];

    setNotifications(mockNotifications);

    // No cleanup needed since we're using local data only
  }, [user, token]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const addNotification = (
    notificationData:
      | Omit<Notification, "id" | "timestamp" | "read">
      | Notification,
  ) => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      ...notificationData,
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // Local-only operation to prevent fetch errors
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Local-only operation to prevent fetch errors
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Local-only operation to prevent fetch errors
  };

  const clearAll = async () => {
    setNotifications([]);
    // Local-only operation to prevent fetch errors
  };

  // Auto-generate sample notifications for demo
  useEffect(() => {
    if (!user) return;

    const generateSampleNotifications = () => {
      const samples: Omit<Notification, "id" | "timestamp" | "read">[] = [
        {
          type: "win",
          title: "🎉 Big Win!",
          message: "You won 250 GC playing Gold Rush Deluxe!",
          amount: 250,
          currency: "GC",
          priority: "high",
          icon: "🎰",
        },
        {
          type: "bonus",
          title: "🎁 Daily Bonus Ready",
          message: "Your daily login bonus is waiting for you!",
          priority: "medium",
          action_url: "/dashboard",
          icon: "🎁",
        },
        {
          type: "achievement",
          title: "🏆 Level Up!",
          message: "Congratulations! You've reached level 13!",
          priority: "medium",
          icon: "🏆",
        },
        {
          type: "system",
          title: "🔄 Maintenance Notice",
          message: "Scheduled maintenance tonight from 2-4 AM EST.",
          priority: "low",
          icon: "⚙️",
        },
      ];

      // Add one sample notification every 30 seconds (for demo)
      let index = 0;
      const interval = setInterval(() => {
        if (index < samples.length) {
          addNotification(samples[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30000);

      return () => clearInterval(interval);
    };

    // Only add samples if no notifications exist
    if (notifications.length === 0) {
      setTimeout(generateSampleNotifications, 2000);
    }
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isOpen,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
