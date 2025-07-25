import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  Shield,
  Star,
  MoreVertical,
  Flag,
  Volume2,
  VolumeX,
  Copy,
  Gift,
} from "lucide-react";

interface ChatRoomProps {
  room: {
    id: string;
    name: string;
    description: string;
    user_count: number;
    vip_only: boolean;
    game_specific?: string;
  };
  isActive: boolean;
  isMuted: boolean;
}

export default function ChatRoom({ room, isActive, isMuted }: ChatRoomProps) {
  const { messages, muteUser, reportMessage } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

  // Filter messages for current room
  const roomMessages = messages.filter((msg) => msg.room === room.id);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomMessages, isActive]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserBadge = (message: any) => {
    if (message.is_admin) {
      return <Shield className="w-3 h-3 text-red-500" />;
    }
    if (message.is_staff) {
      return <Star className="w-3 h-3 text-blue-500" />;
    }
    if (message.is_vip || message.user_level >= 15) {
      return <Crown className="w-3 h-3 text-accent" />;
    }
    return null;
  };

  const getUsernameColor = (message: any) => {
    if (message.is_admin) return "text-red-500";
    if (message.is_staff) return "text-blue-500";
    if (message.is_vip || message.user_level >= 15) return "text-accent";
    return "text-primary";
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText);
  };

  const handleMuteUser = (userId: number) => {
    muteUser(userId);
  };

  const handleReportMessage = (messageId: string) => {
    reportMessage(messageId);
  };

  const shouldShowDateSeparator = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    if (
      !lastMessageTime ||
      messageDate.toDateString() !== lastMessageTime.toDateString()
    ) {
      setLastMessageTime(messageDate);
      return true;
    }
    return false;
  };

  if (!isActive) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Room Info */}
      <div className="px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center space-x-1">
              <span>{room.name}</span>
              {room.vip_only && <Crown className="w-3 h-3 text-accent" />}
            </h3>
            <p className="text-xs text-muted-foreground">{room.description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {room.user_count} users
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-3">
          {roomMessages.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            roomMessages.map((message, index) => (
              <div key={message.id}>
                {/* Date Separator */}
                {shouldShowDateSeparator(message.timestamp) && (
                  <div className="text-center py-2">
                    <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Message */}
                <div className="group flex items-start space-x-2 hover:bg-muted/30 p-1 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-1">
                      <span
                        className={`text-sm font-medium ${getUsernameColor(message)}`}
                      >
                        {message.username}
                      </span>
                      {getUserBadge(message)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words leading-relaxed">
                      {message.message}
                    </p>
                  </div>

                  {/* Message Actions */}
                  {user && message.user_id !== user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleCopyMessage(message.message)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReportMessage(message.id)}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Report Message
                        </DropdownMenuItem>
                        {(user.is_admin || user.is_staff) && (
                          <DropdownMenuItem
                            onClick={() => handleMuteUser(message.user_id)}
                          >
                            <VolumeX className="w-4 h-4 mr-2" />
                            Mute User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
