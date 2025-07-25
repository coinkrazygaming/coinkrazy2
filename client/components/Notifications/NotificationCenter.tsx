import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationItem from "./NotificationItem";
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  X,
  Gift,
  Trophy,
  AlertTriangle,
  MessageSquare,
  Star,
  Info,
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>("all");
  const { notifications, unreadCount, markAllAsRead, clearAll } =
    useNotifications();

  if (!isOpen) return null;

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const getFilterIcon = (type: string) => {
    switch (type) {
      case "win":
        return Trophy;
      case "bonus":
        return Gift;
      case "system":
        return Info;
      case "chat":
        return MessageSquare;
      case "achievement":
        return Star;
      case "warning":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getFilterCount = (type: string) => {
    if (type === "all") return notifications.length;
    if (type === "unread") return unreadCount;
    return notifications.filter((n) => n.type === type).length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end pt-16 pr-4">
      <Card className="w-96 max-h-[80vh] casino-glow animate-in slide-in-from-right duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-primary" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-6 h-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={filter} onValueChange={setFilter}>
            {/* Filter Tabs */}
            <TabsList className="grid grid-cols-4 w-full rounded-none border-b bg-muted/50">
              <TabsTrigger value="all" className="text-xs">
                All ({getFilterCount("all")})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread ({getFilterCount("unread")})
              </TabsTrigger>
              <TabsTrigger value="win" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Wins
              </TabsTrigger>
              <TabsTrigger value="bonus" className="text-xs">
                <Gift className="w-3 h-3 mr-1" />
                Bonus
              </TabsTrigger>
            </TabsList>

            {/* Notification Content */}
            <TabsContent value={filter} className="m-0">
              <ScrollArea className="h-[400px]">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {filter === "unread"
                        ? "You're all caught up! 🎉"
                        : "When you receive notifications, they'll appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Footer */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {notifications.length} total notifications
            </span>
            <Button variant="ghost" size="sm" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
