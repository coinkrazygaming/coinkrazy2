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

interface ChatMessage {
  id: string;
  user_id: number;
  username: string;
  message: string;
  room: string;
  timestamp: string;
  user_level: number;
  is_vip: boolean;
  is_staff: boolean;
  is_admin: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  user_count: number;
  vip_only: boolean;
  game_specific?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  rooms: ChatRoom[];
  currentRoom: string;
  isConnected: boolean;
  userCount: number;
  sendMessage: (message: string) => void;
  switchRoom: (roomId: string) => void;
  isTyping: boolean;
  typingUsers: string[];
  muteUser: (userId: number) => void;
  reportMessage: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat rooms
  useEffect(() => {
    const defaultRooms: ChatRoom[] = [
      {
        id: "general",
        name: "🎰 General Chat",
        description: "General discussion for all players",
        user_count: 0,
        vip_only: false,
      },
      {
        id: "vip",
        name: "👑 VIP Lounge",
        description: "Exclusive chat for VIP members",
        user_count: 0,
        vip_only: true,
      },
      {
        id: "slots",
        name: "🎲 Slots Talk",
        description: "Discuss slot games and strategies",
        user_count: 0,
        vip_only: false,
        game_specific: "slots",
      },
      {
        id: "bingo",
        name: "🎯 Bingo Room",
        description: "Chat during bingo games",
        user_count: 0,
        vip_only: false,
        game_specific: "bingo",
      },
      {
        id: "mini-games",
        name: "🎮 Mini Games",
        description: "Mini game discussions and challenges",
        user_count: 0,
        vip_only: false,
        game_specific: "mini-games",
      },
    ];
    setRooms(defaultRooms);
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!user || !token) return;

    const connectWebSocket = () => {
      try {
        // In production, use proper WebSocket URL
        const wsUrl = `ws://localhost:3001/chat?token=${token}&room=${currentRoom}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log("Chat WebSocket connected");
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case "message":
                setMessages((prev) => [...prev, data.message]);
                break;
              case "user_count":
                setUserCount(data.count);
                break;
              case "typing":
                if (data.username !== user.username) {
                  setTypingUsers((prev) => {
                    if (!prev.includes(data.username)) {
                      return [...prev, data.username];
                    }
                    return prev;
                  });
                  // Remove typing indicator after 3 seconds
                  setTimeout(() => {
                    setTypingUsers((prev) =>
                      prev.filter((u) => u !== data.username),
                    );
                  }, 3000);
                }
                break;
              case "room_messages":
                setMessages(data.messages);
                break;
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          console.log("Chat WebSocket disconnected, using HTTP fallback");
          // Don't attempt to reconnect, just use HTTP polling
        };

        wsRef.current.onerror = (error) => {
          console.log("Chat WebSocket unavailable, using HTTP fallback");
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to connect to chat:", error);
        // Fallback to polling if WebSocket fails
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, token, currentRoom]);

  const sendMessage = (message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Fallback to HTTP API if WebSocket is not available
      sendMessageHttp(message);
      return;
    }

    if (!user || message.trim() === "") return;

    const messageData = {
      type: "message",
      message: message.trim(),
      room: currentRoom,
      token,
    };

    try {
      wsRef.current.send(JSON.stringify(messageData));
    } catch (error) {
      console.error("Failed to send message:", error);
      sendMessageHttp(message);
    }
  };

  const sendMessageHttp = async (message: string) => {
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          room: currentRoom,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const switchRoom = (roomId: string) => {
    setCurrentRoom(roomId);
    setMessages([]); // Clear messages when switching rooms
    setTypingUsers([]);

    // Update WebSocket connection for new room
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join_room",
          room: roomId,
          token,
        }),
      );
    }
  };

  const handleTyping = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    if (!isTyping) {
      setIsTyping(true);
      wsRef.current.send(
        JSON.stringify({
          type: "typing",
          room: currentRoom,
          token,
        }),
      );
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const muteUser = async (userId: number) => {
    try {
      const response = await fetch("/api/chat/mute", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        toast({
          title: "User muted",
          description: "User has been muted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to mute user",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const reportMessage = async (messageId: string) => {
    try {
      const response = await fetch("/api/chat/report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (response.ok) {
        toast({
          title: "Message reported",
          description: "Thank you for helping keep our chat safe.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to report message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: ChatContextType = {
    messages,
    rooms,
    currentRoom,
    isConnected,
    userCount,
    sendMessage,
    switchRoom,
    isTyping,
    typingUsers,
    muteUser,
    reportMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
