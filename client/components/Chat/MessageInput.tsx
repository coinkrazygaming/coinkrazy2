import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Send,
  Smile,
  Image,
  Gift,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
} from "lucide-react";

const emojis = [
  { icon: "😀", name: "smile" },
  { icon: "😂", name: "laugh" },
  { icon: "❤️", name: "heart" },
  { icon: "👍", name: "thumbs up" },
  { icon: "🎉", name: "party" },
  { icon: "🎰", name: "slot machine" },
  { icon: "💰", name: "money" },
  { icon: "🏆", name: "trophy" },
  { icon: "🔥", name: "fire" },
  { icon: "💎", name: "diamond" },
  { icon: "🍀", name: "four leaf clover" },
  { icon: "⭐", name: "star" },
  { icon: "🎯", name: "target" },
  { icon: "🎲", name: "dice" },
  { icon: "🃏", name: "cards" },
  { icon: "🥳", name: "celebration" },
];

const quickReactions = [
  { icon: Heart, emoji: "❤️", label: "Love" },
  { icon: ThumbsUp, emoji: "👍", label: "Like" },
  { icon: Laugh, emoji: "😂", label: "Funny" },
  { icon: Gift, emoji: "🎁", label: "Gift" },
];

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const { sendMessage, currentRoom, isConnected } = useChat();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() || !isConnected || !user) return;

    sendMessage(message);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    setIsEmojiOpen(false);
    inputRef.current?.focus();
  };

  const insertQuickReaction = (emoji: string) => {
    setMessage(emoji);
    setTimeout(() => handleSend(), 100);
  };

  if (!user) {
    return (
      <div className="p-3 text-center">
        <p className="text-sm text-muted-foreground">
          Please log in to join the chat
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {/* Quick Reactions */}
      <div className="flex items-center justify-center space-x-2">
        {quickReactions.map((reaction) => (
          <Button
            key={reaction.label}
            variant="ghost"
            size="sm"
            onClick={() => insertQuickReaction(reaction.emoji)}
            className="w-8 h-8 p-0 hover:bg-primary/20"
            title={reaction.label}
          >
            <reaction.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected
                ? `Message ${currentRoom} chat...`
                : "Connecting to chat..."
            }
            disabled={!isConnected}
            className="pr-10"
            maxLength={500}
          />

          {/* Emoji Button */}
          <DropdownMenu open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-primary/20"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertEmoji(emoji.icon)}
                    className="w-8 h-8 p-0 text-lg hover:bg-primary/20"
                    title={emoji.name}
                  >
                    {emoji.icon}
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || !isConnected}
          size="sm"
          className="px-3"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="text-center">
          <span className="text-xs text-red-500">
            ⚠️ Disconnected - Attempting to reconnect...
          </span>
        </div>
      )}

      {/* Character Count */}
      {message.length > 400 && (
        <div className="text-right">
          <span
            className={`text-xs ${message.length > 480 ? "text-red-500" : "text-muted-foreground"}`}
          >
            {message.length}/500
          </span>
        </div>
      )}
    </div>
  );
}
