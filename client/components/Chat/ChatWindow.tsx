import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import ChatRoom from "./ChatRoom";
import MessageInput from "./MessageInput";
import {
  MessageCircle,
  Users,
  Crown,
  Shield,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ChatWindowProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export default function ChatWindow({
  isMinimized = false,
  onToggleMinimize,
  onClose,
}: ChatWindowProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("general");
  const {
    rooms,
    currentRoom,
    switchRoom,
    isConnected,
    userCount,
    typingUsers,
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleRoomSwitch = (roomId: string) => {
    setSelectedRoom(roomId);
    switchRoom(roomId);
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50 casino-glow">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm">Chat</CardTitle>
              <Badge variant="outline" className="text-xs">
                {userCount} online
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="w-6 h-6 p-0"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-6 h-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 casino-glow flex flex-col">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm">Live Chat</CardTitle>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <Badge variant="outline" className="text-xs">
                {userCount} online
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-6 h-6 p-0"
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </Button>
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="w-6 h-6 p-0"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Room Tabs */}
        <Tabs
          value={selectedRoom}
          onValueChange={handleRoomSwitch}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-3 w-full rounded-none border-b bg-muted/50">
            {rooms.slice(0, 3).map((room) => (
              <TabsTrigger
                key={room.id}
                value={room.id}
                className="text-xs p-2 data-[state=active]:bg-primary/10"
                disabled={room.vip_only && (!user || user.level < 5)}
              >
                <span className="flex items-center space-x-1">
                  <span>{room.name.split(" ")[0]}</span>
                  {room.vip_only && <Crown className="w-3 h-3 text-accent" />}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {rooms.slice(0, 3).map((room) => (
            <TabsContent
              key={room.id}
              value={room.id}
              className="flex-1 flex flex-col p-0 m-0"
            >
              <ChatRoom
                room={room}
                isActive={currentRoom === room.id}
                isMuted={isMuted}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-3 py-1 text-xs text-muted-foreground border-t">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} people are typing...`}
          </div>
        )}

        {/* Message Input */}
        <div className="border-t">
          <MessageInput />
        </div>
      </CardContent>
    </Card>
  );
}
