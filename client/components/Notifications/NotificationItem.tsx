import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  type Notification,
} from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Gift,
  Info,
  MessageSquare,
  Star,
  AlertTriangle,
  MoreVertical,
  Trash2,
  ExternalLink,
  Check,
  Clock,
  Coins,
  Crown,
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case "win":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "bonus":
        return <Gift className="w-5 h-5 text-green-500" />;
      case "system":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "chat":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "achievement":
        return <Star className="w-5 h-5 text-accent" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={`
        relative group p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50
        ${notification.read ? "bg-background" : "bg-primary/5 border-primary/20"}
        ${getPriorityColor()} border-l-4
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {notification.icon ? (
            <span className="text-lg">{notification.icon}</span>
          ) : (
            getIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-tight">
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {notification.message}
              </p>

              {/* Amount Display */}
              {notification.amount && notification.currency && (
                <div className="flex items-center space-x-1 mt-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    +{notification.amount.toLocaleString()}{" "}
                    {notification.currency}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}

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
                <DropdownMenuContent align="end" className="w-40">
                  {!notification.read && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  {notification.action_url && (
                    <DropdownMenuItem onClick={handleClick}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {formatTime(notification.timestamp)}
              </span>

              {/* Priority Badge */}
              {notification.priority === "high" && (
                <Badge variant="destructive" className="text-xs">
                  High Priority
                </Badge>
              )}
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
