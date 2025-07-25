import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CasinoHeader from "@/components/CasinoHeader";
import {
  Clock,
  Users,
  MessageCircle,
  Shield,
  UserCheck,
  FileText,
  Eye,
  Plus,
  Send,
  Pin,
  Gamepad2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Headphones,
  Search,
  Filter,
  Ban,
  Edit,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Timer,
  Activity,
  Award,
  Target,
  Settings,
  Clock3,
  UserPlus,
  Ticket,
  Archive,
  Tag,
  ArrowRight,
  RotateCcw,
  Paperclip,
  Play,
  BarChart,
} from "lucide-react";

export default function StaffPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftStart] = useState(new Date("2024-12-19T08:00:00"));
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [staffStats, setStaffStats] = useState({
    activeChats: 3,
    resolvedToday: 12,
    kycReviewed: 5,
    hoursWorked: 6.5,
    responseTime: 2.3,
    satisfaction: 4.8,
  });

  const [activeChatUsers, setActiveChatUsers] = useState([
    {
      id: "user1",
      username: "Player123",
      message: "Hi, I need help with my withdrawal",
      timestamp: "14:30",
      priority: "high",
      lastResponse: "5 minutes ago",
      status: "waiting",
    },
    {
      id: "user2",
      username: "LuckyGamer",
      message: "Can't access mini games",
      timestamp: "14:25",
      priority: "medium",
      lastResponse: "2 minutes ago",
      status: "responding",
    },
    {
      id: "user3",
      username: "NewPlayer",
      message: "How do I verify my KYC documents?",
      timestamp: "14:20",
      priority: "low",
      lastResponse: "Just started",
      status: "new",
    },
  ]);

  const [onlineUsers, setOnlineUsers] = useState([
    {
      id: "USR001",
      username: "Player123",
      level: 12,
      gcBalance: 25650,
      scBalance: 127.5,
      currentGame: "Gold Rush Deluxe",
      location: "Slots",
      loginTime: "2024-12-19 13:30",
      kycStatus: "verified",
      lastActivity: "Playing slot games",
      flags: ["high_activity"],
      notes: [
        {
          text: "Player requested bonus help",
          author: "staff_mike",
          timestamp: "2024-12-19 13:45",
        },
      ],
    },
    {
      id: "USR002",
      username: "LuckyGamer",
      level: 8,
      gcBalance: 12340,
      scBalance: 89.2,
      currentGame: "Colin Shots",
      location: "Mini Games",
      loginTime: "2024-12-19 14:00",
      kycStatus: "pending",
      lastActivity: "Mini game session",
      flags: [],
      notes: [],
    },
    {
      id: "USR003",
      username: "VIPPlayer",
      level: 25,
      gcBalance: 156000,
      scBalance: 450.75,
      currentGame: "Diamond Dreams",
      location: "Slots",
      loginTime: "2024-12-19 12:15",
      kycStatus: "verified",
      lastActivity: "High stakes gaming",
      flags: ["vip", "high_roller"],
      notes: [
        {
          text: "VIP member, priority support",
          author: "admin_sarah",
          timestamp: "2024-12-18 16:30",
        },
      ],
    },
  ]);

  const [pendingKYC, setPendingKYC] = useState([
    {
      id: "KYC001",
      username: "NewPlayer99",
      submittedDate: "2024-12-19 12:00",
      documents: ["ID", "Proof of Address"],
      status: "pending",
      priority: "normal",
      reviewTime: "2 hours ago",
    },
    {
      id: "KYC002",
      username: "CasinoFan88",
      submittedDate: "2024-12-19 11:30",
      documents: ["ID", "Bank Statement"],
      status: "pending",
      priority: "high",
      reviewTime: "3 hours ago",
    },
    {
      id: "KYC003",
      username: "LuckyPlayer",
      submittedDate: "2024-12-19 10:15",
      documents: ["Passport", "Utility Bill"],
      status: "pending",
      priority: "normal",
      reviewTime: "4 hours ago",
    },
  ]);

  const [bingoSessions, setBingoSessions] = useState([
    {
      id: "BINGO001",
      roomName: "🌟 Golden Hall",
      players: 47,
      status: "active",
      currentNumber: "B-7",
      numbersDrawn: 23,
      jackpot: "125.50 SC",
      timeRemaining: "12:34",
    },
    {
      id: "BINGO002",
      roomName: "💎 Diamond Room",
      players: 32,
      status: "waiting",
      currentNumber: null,
      numbersDrawn: 0,
      jackpot: "89.75 SC",
      timeRemaining: "Starting soon",
    },
    {
      id: "BINGO003",
      roomName: "🏆 Platinum Hall",
      players: 28,
      status: "active",
      currentNumber: "G-15",
      numbersDrawn: 31,
      jackpot: "200.00 SC",
      timeRemaining: "8:42",
    },
  ]);

  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TIC001",
      title: "Withdrawal Issue - Funds Not Received",
      description:
        "Player reports withdrawal approved 48 hours ago but funds not received in bank account",
      customer: {
        username: "Player123",
        email: "player123@example.com",
        level: 12,
        vipTier: "Gold",
      },
      priority: "high",
      status: "open",
      category: "withdrawal",
      createdAt: "2024-12-19 14:30",
      updatedAt: "2024-12-19 14:30",
      assignedTo: null,
      tags: ["urgent", "financial"],
      timeToResolve: "24 hours",
      escalationLevel: 0,
      messages: [
        {
          id: 1,
          author: "Player123",
          message:
            "Hi, I requested a withdrawal 2 days ago and it was approved but I still haven't received the money. Can you please help?",
          timestamp: "2024-12-19 14:30",
          isStaff: false,
        },
      ],
    },
    {
      id: "TIC002",
      title: "Unable to Access Mini Games",
      description:
        "Customer experiencing technical difficulties accessing mini games section",
      customer: {
        username: "LuckyGamer",
        email: "lucky@example.com",
        level: 8,
        vipTier: "Silver",
      },
      priority: "medium",
      status: "in_progress",
      category: "technical",
      createdAt: "2024-12-19 13:45",
      updatedAt: "2024-12-19 14:20",
      assignedTo: "staff_mike",
      tags: ["technical", "games"],
      timeToResolve: "4 hours",
      escalationLevel: 0,
      messages: [
        {
          id: 1,
          author: "LuckyGamer",
          message:
            "I can't access the mini games. Every time I click it just loads forever.",
          timestamp: "2024-12-19 13:45",
          isStaff: false,
        },
        {
          id: 2,
          author: "staff_mike",
          message:
            "Hi! I'm looking into this issue for you. Can you please try clearing your browser cache and let me know if that helps?",
          timestamp: "2024-12-19 14:20",
          isStaff: true,
        },
      ],
    },
    {
      id: "TIC003",
      title: "KYC Document Verification Question",
      description:
        "New player needs guidance on KYC document submission process",
      customer: {
        username: "NewPlayer99",
        email: "newplayer@example.com",
        level: 1,
        vipTier: "Bronze",
      },
      priority: "low",
      status: "open",
      category: "kyc",
      createdAt: "2024-12-19 12:15",
      updatedAt: "2024-12-19 12:15",
      assignedTo: null,
      tags: ["kyc", "new-player"],
      timeToResolve: "8 hours",
      escalationLevel: 0,
      messages: [
        {
          id: 1,
          author: "NewPlayer99",
          message:
            "Hi, I'm new here and I want to verify my account. What documents do I need to submit for KYC?",
          timestamp: "2024-12-19 12:15",
          isStaff: false,
        },
      ],
    },
    {
      id: "TIC004",
      title: "Bonus Not Applied to Account",
      description:
        "VIP customer reports promotional bonus not credited despite meeting requirements",
      customer: {
        username: "VIPPlayer",
        email: "vip@example.com",
        level: 25,
        vipTier: "Diamond",
      },
      priority: "high",
      status: "escalated",
      category: "promotion",
      createdAt: "2024-12-19 11:30",
      updatedAt: "2024-12-19 13:45",
      assignedTo: "staff_mike",
      tags: ["vip", "bonus", "escalated"],
      timeToResolve: "2 hours",
      escalationLevel: 1,
      messages: [
        {
          id: 1,
          author: "VIPPlayer",
          message:
            "I completed the weekly challenge but didn't receive my 500 SC bonus. I'm a Diamond VIP member.",
          timestamp: "2024-12-19 11:30",
          isStaff: false,
        },
        {
          id: 2,
          author: "staff_mike",
          message:
            "I understand your concern. Let me check your account and the promotion requirements. I'll escalate this to our VIP team.",
          timestamp: "2024-12-19 13:45",
          isStaff: true,
        },
      ],
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(supportTickets[0]);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  // Staff access is now handled by ProtectedRoute

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatShiftTime = (start: Date, current: Date) => {
    const diff = current.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleChatResponse = async (userId: string, message: string) => {
    try {
      const response = await fetch(`/api/staff/chat/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent",
          description: "Your response has been sent to the user.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const addPlayerNote = async (userId: string, note: string) => {
    try {
      const response = await fetch(`/api/staff/users/${userId}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        toast({
          title: "Note Added",
          description: "Player note has been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    }
  };

  const handleKYCAction = async (
    kycId: string,
    action: "approve" | "reject",
  ) => {
    try {
      const response = await fetch(`/api/staff/kyc/${kycId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setPendingKYC((prev) => prev.filter((kyc) => kyc.id !== kycId));
        toast({
          title: "KYC Updated",
          description: `KYC document ${action === "approve" ? "approved" : "rejected"} successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status.",
        variant: "destructive",
      });
    }
  };

  const clockIn = () => {
    toast({
      title: "Clocked In",
      description: "Your shift has started. Have a great day!",
    });
  };

  const clockOut = () => {
    toast({
      title: "Clocked Out",
      description: "Your shift has ended. Great work today!",
    });
  };

  // Access control is now handled by ProtectedRoute at the routing level

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Staff Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Headphones className="w-8 h-8 mr-3 text-accent" />
                👮 Staff Control Panel
              </h1>
              <p className="text-muted-foreground">
                Level 1 Staff Access • CoinKrazy Support Team • Logged in as:{" "}
                {user.username}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-accent text-accent-foreground mb-2">
                🟢 ON DUTY
              </Badge>
              <p className="text-sm text-muted-foreground">
                Shift Time: {formatShiftTime(shiftStart, currentTime)}
              </p>
              <p className="text-xs text-muted-foreground">Rate: $18.50/hour</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {staffStats.activeChats}
              </p>
              <p className="text-sm text-muted-foreground">💬 Active Chats</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-500">
                {staffStats.resolvedToday}
              </p>
              <p className="text-sm text-muted-foreground">✅ Resolved Today</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-accent">
                {staffStats.kycReviewed}
              </p>
              <p className="text-sm text-muted-foreground">📋 KYC Reviewed</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {staffStats.hoursWorked}h
              </p>
              <p className="text-sm text-muted-foreground">��� Hours Worked</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Timer className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-accent">
                {staffStats.responseTime}m
              </p>
              <p className="text-sm text-muted-foreground">⚡ Avg Response</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {staffStats.satisfaction}/5
              </p>
              <p className="text-sm text-muted-foreground">⭐ Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full mb-6">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="tickets">🎫 Tickets</TabsTrigger>
            <TabsTrigger value="chat">💬 Live Chat</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="kyc">🛡️ KYC</TabsTrigger>
            <TabsTrigger value="bingo">🏆 Bingo</TabsTrigger>
            <TabsTrigger value="reports">📈 Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                    Priority Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-semibold text-destructive">
                          High Priority Chat
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Player123 - Withdrawal issue
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab("chat")}
                      >
                        Respond
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                      <div>
                        <p className="font-semibold text-yellow-600">
                          KYC Review
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pendingKYC.length} documents awaiting review
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab("kyc")}
                      >
                        Review
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <div>
                        <p className="font-semibold text-accent">
                          Bingo Sessions
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monitor active bingo rooms
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab("bingo")}
                      >
                        Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-accent" />
                    Time Clock & Payroll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {currentTime.toLocaleTimeString()}
                      </div>
                      <p className="text-muted-foreground">
                        {currentTime.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Today's Shift
                          </span>
                          <p className="font-bold">
                            {formatShiftTime(shiftStart, currentTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Hourly Rate
                          </span>
                          <p className="font-bold text-primary">$18.50</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Est. Earnings
                          </span>
                          <p className="font-bold text-green-500">
                            $
                            {(
                              staffStats.hoursWorked * 18.5 +
                              ((currentTime.getTime() - shiftStart.getTime()) /
                                (1000 * 60 * 60)) *
                                18.5
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Performance
                          </span>
                          <p className="font-bold text-accent">
                            {staffStats.satisfaction}/5 ⭐
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={clockIn}
                      >
                        Clock In
                      </Button>
                      <Button variant="outline">Break</Button>
                      <Button
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={clockOut}
                      >
                        Clock Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm font-bold">
                          {staffStats.responseTime}m (Target: 3m)
                        </span>
                      </div>
                      <Progress
                        value={Math.max(
                          0,
                          100 - (staffStats.responseTime / 3) * 100,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Resolution Rate</span>
                        <span className="text-sm font-bold">
                          {Math.round(
                            (staffStats.resolvedToday /
                              (staffStats.resolvedToday +
                                staffStats.activeChats)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.round(
                          (staffStats.resolvedToday /
                            (staffStats.resolvedToday +
                              staffStats.activeChats)) *
                            100,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="text-sm font-bold">
                          {staffStats.satisfaction}/5.0
                        </span>
                      </div>
                      <Progress
                        value={(staffStats.satisfaction / 5) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm font-semibold text-primary">
                        🏆 Today's Goals
                      </p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>
                          ✅ Resolve 15+ tickets ({staffStats.resolvedToday}/15)
                        </li>
                        <li>
                          ✅ Maintain 95%+ satisfaction (
                          {((staffStats.satisfaction / 5) * 100).toFixed(0)}%)
                        </li>
                        <li>⏳ Review all pending KYC documents</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <Card className="casino-glow lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-primary" />
                      Support Tickets
                    </div>
                    <Badge className="bg-destructive text-white">
                      {
                        supportTickets.filter((t) => t.status !== "resolved")
                          .length
                      }
                    </Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <select
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="text-sm bg-secondary border rounded px-2 py-1"
                    >
                      <option value="all">All Tickets</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="escalated">Escalated</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {supportTickets
                      .filter((ticket) => {
                        if (ticketFilter === "all") return true;
                        if (ticketFilter === "high")
                          return ticket.priority === "high";
                        return ticket.status === ticketFilter;
                      })
                      .map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedTicket?.id === ticket.id
                              ? "bg-primary/20 border border-primary"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`text-xs ${
                                  ticket.priority === "high"
                                    ? "bg-destructive text-white"
                                    : ticket.priority === "medium"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-green-500 text-white"
                                }`}
                              >
                                {ticket.priority}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  ticket.status === "open"
                                    ? "bg-blue-500 text-white"
                                    : ticket.status === "in_progress"
                                      ? "bg-yellow-500 text-white"
                                      : ticket.status === "escalated"
                                        ? "bg-destructive text-white"
                                        : "bg-green-500 text-white"
                                }`}
                              >
                                {ticket.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {ticket.id}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm truncate mb-1">
                            {ticket.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {ticket.customer.username} • {ticket.category}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {ticket.createdAt}
                            </span>
                            {ticket.escalationLevel > 0 && (
                              <Badge className="bg-destructive text-white text-xs">
                                ⚠️ Level {ticket.escalationLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Details */}
              <Card className="casino-glow lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-accent" />
                      Ticket #{selectedTicket.id}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${
                          selectedTicket.priority === "high"
                            ? "bg-destructive text-white"
                            : selectedTicket.priority === "medium"
                              ? "bg-yellow-500 text-white"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {selectedTicket.priority} priority
                      </Badge>
                      <Badge
                        className={`${
                          selectedTicket.status === "open"
                            ? "bg-blue-500 text-white"
                            : selectedTicket.status === "in_progress"
                              ? "bg-yellow-500 text-white"
                              : selectedTicket.status === "escalated"
                                ? "bg-destructive text-white"
                                : "bg-green-500 text-white"
                        }`}
                      >
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Ticket Info */}
                    <div className="bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">
                        {selectedTicket.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedTicket.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Customer:
                          </span>
                          <p className="font-bold">
                            {selectedTicket.customer.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {selectedTicket.customer.level} •{" "}
                            {selectedTicket.customer.vipTier} VIP
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <p className="font-bold capitalize">
                            {selectedTicket.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Target Resolution: {selectedTicket.timeToResolve}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        {selectedTicket.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-accent text-accent-foreground text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="h-64 bg-secondary p-4 rounded-lg overflow-y-auto">
                      <div className="space-y-3">
                        {selectedTicket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`${message.isStaff ? "text-right" : "text-left"}`}
                          >
                            <div
                              className={`inline-block p-3 rounded-lg max-w-xs ${
                                message.isStaff
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent text-accent-foreground"
                              }`}
                            >
                              {message.message}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {message.author} • {message.timestamp}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply */}
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Type your response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                          rows={3}
                        />
                        <div className="flex flex-col space-y-2">
                          <Button size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {selectedTicket.status === "open" && (
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Take Ticket
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Escalate
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Transfer
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                      </div>

                      {/* Status Update */}
                      <div className="grid grid-cols-3 gap-2">
                        <select className="text-sm bg-secondary border rounded px-2 py-1">
                          <option>Change Status</option>
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting_customer">
                            Waiting Customer
                          </option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <select className="text-sm bg-secondary border rounded px-2 py-1">
                          <option>Change Priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select className="text-sm bg-secondary border rounded px-2 py-1">
                          <option>Assign To</option>
                          <option value="staff_mike">staff_mike</option>
                          <option value="staff_sarah">staff_sarah</option>
                          <option value="admin_team">Admin Team</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info Panel */}
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-bold">
                            {selectedTicket.customer.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            VIP Tier:
                          </span>
                          <p className="font-bold">
                            {selectedTicket.customer.vipTier}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Level:</span>
                          <p className="font-bold">
                            {selectedTicket.customer.level}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3 mr-1" />
                          Email Customer
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-3 h-3 mr-1" />
                          Call Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="casino-glow lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-accent" />
                      Active Chats
                    </div>
                    <Badge className="bg-primary text-white">
                      {activeChatUsers.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeChatUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{user.username}</h3>
                          <div className="flex items-center space-x-1">
                            <Badge
                              className={`text-xs ${
                                user.priority === "high"
                                  ? "bg-destructive text-white"
                                  : user.priority === "medium"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-green-500 text-white"
                              }`}
                            >
                              {user.priority}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                user.status === "waiting"
                                  ? "bg-red-500 text-white"
                                  : user.status === "responding"
                                    ? "bg-blue-500 text-white"
                                    : "bg-green-500 text-white"
                              }`}
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            {user.timestamp}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.lastResponse}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glow lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-accent" />
                      Chat with Player123
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white">
                        🟢 Online
                      </Badge>
                      <Badge className="bg-destructive text-white">
                        🔥 High Priority
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-64 bg-secondary p-4 rounded-lg overflow-y-auto">
                      <div className="space-y-3">
                        <div className="text-right">
                          <div className="inline-block bg-primary text-primary-foreground p-2 rounded-lg max-w-xs">
                            Hi! I'm {user.username} from CoinKrazy support. How
                            can I help you today? 😊
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            14:25
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="inline-block bg-accent text-accent-foreground p-2 rounded-lg max-w-xs">
                            Hi, I need help with my withdrawal. It's been
                            pending for 2 days and I'm getting worried.
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            14:30
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-block bg-primary text-primary-foreground p-2 rounded-lg max-w-xs">
                            I understand your concern. Let me check your account
                            status right now. Can you please provide your email
                            address?
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            14:31
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your response..."
                        className="flex-1"
                      />
                      <Button size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Responses */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        Check KYC Status
                      </Button>
                      <Button size="sm" variant="outline">
                        Withdrawal Help
                      </Button>
                      <Button size="sm" variant="outline">
                        Bonus Questions
                      </Button>
                      <Button size="sm" variant="outline">
                        Technical Issues
                      </Button>
                      <Button size="sm" variant="outline">
                        Account Verification
                      </Button>
                      <Button size="sm" variant="outline">
                        Escalate to Admin
                      </Button>
                    </div>

                    {/* User Info Panel */}
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">User Information</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Balance:
                          </span>
                          <p>25,650 GC | 127.5 SC</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Level:</span>
                          <p>12 (Gold VIP)</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">KYC:</span>
                          <p className="text-green-500">✅ Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Online Users Monitoring ({onlineUsers.length} online)
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onlineUsers
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{user.username}</h3>
                              {user.flags.includes("vip") && (
                                <Badge className="bg-accent text-white">
                                  👑 VIP
                                </Badge>
                              )}
                              {user.flags.includes("high_roller") && (
                                <Badge className="bg-primary text-white">
                                  💎 High Roller
                                </Badge>
                              )}
                              {user.flags.includes("high_activity") && (
                                <Badge className="bg-green-500 text-white">
                                  🔥 Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Playing: {user.currentGame} ({user.location})
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                className={`text-xs ${
                                  user.kycStatus === "verified"
                                    ? "bg-green-500 text-white"
                                    : "bg-yellow-500 text-white"
                                }`}
                              >
                                {user.kycStatus === "verified" ? "✅" : "⏳"}{" "}
                                KYC
                              </Badge>
                              <Badge className="bg-accent text-accent-foreground text-xs">
                                Level {user.level}
                              </Badge>
                              {user.notes.length > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  📝 {user.notes.length} Notes
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="font-semibold">
                              {user.gcBalance.toLocaleString()} GC
                            </span>{" "}
                            |{" "}
                            <span className="font-semibold text-accent">
                              {user.scBalance} SC
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Online since: {user.loginTime}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.lastActivity}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveTab("chat")}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pin className="w-3 h-3 mr-1" />
                              Note
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    KYC Document Review ({pendingKYC.length} pending)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter by Priority
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Bulk Review
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingKYC.map((kyc) => (
                    <div
                      key={kyc.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            kyc.priority === "high"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <h3 className="font-semibold">{kyc.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {kyc.submittedDate}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Waiting for: {kyc.reviewTime}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {kyc.documents.map((doc, index) => (
                              <Badge
                                key={index}
                                className="bg-accent text-accent-foreground text-xs"
                              >
                                📄 {doc}
                              </Badge>
                            ))}
                            <Badge
                              className={`text-xs ${
                                kyc.priority === "high"
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                              }`}
                            >
                              {kyc.priority === "high"
                                ? "🔥 High"
                                : "📋 Normal"}{" "}
                              Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleKYCAction(kyc.id, "approve")}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleKYCAction(kyc.id, "reject")}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bingo Tab */}
          <TabsContent value="bingo">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-primary" />
                    Bingo Room Management
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Session
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bingoSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {session.roomName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {session.players} players • Jackpot:{" "}
                            {session.jackpot}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Time: {session.timeRemaining}
                          </p>
                        </div>
                        <Badge
                          className={`${
                            session.status === "active"
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {session.status === "active"
                            ? "🟢 LIVE"
                            : "⏳ WAITING"}
                        </Badge>
                      </div>

                      {session.status === "active" && (
                        <div className="bg-primary/10 p-4 rounded-lg mb-4">
                          <div className="text-center mb-4">
                            <div className="text-4xl font-bold text-primary mb-2">
                              {session.currentNumber}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Numbers drawn: {session.numbersDrawn}/75
                            </p>
                          </div>
                          <Progress
                            value={(session.numbersDrawn / 75) * 100}
                            className="mb-4"
                          />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        {session.status === "waiting" ? (
                          <Button className="bg-green-500 hover:bg-green-600">
                            <Play className="w-4 h-4 mr-2" />
                            Start Game
                          </Button>
                        ) : (
                          <>
                            <Button>
                              <Target className="w-4 h-4 mr-2" />
                              Call Next Number
                            </Button>
                            <Button variant="outline">
                              <Timer className="w-4 h-4 mr-2" />
                              Pause Game
                            </Button>
                          </>
                        )}
                        <Button variant="outline">
                          <Users className="w-4 h-4 mr-2" />
                          View Players
                        </Button>
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2 text-primary" />
                    Staff Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {staffStats.resolvedToday}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tickets Resolved Today
                        </p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold text-accent">
                          {staffStats.responseTime}m
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Average Response Time
                        </p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold text-green-500">
                          {staffStats.satisfaction}/5
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Customer Satisfaction
                        </p>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {staffStats.kycReviewed}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          KYC Documents Reviewed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        📊 Generate Daily Report
                      </Button>
                      <Button className="w-full" variant="outline">
                        📈 Weekly Performance Summary
                      </Button>
                      <Button className="w-full" variant="outline">
                        💼 Export Timesheet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-accent" />
                    Today's Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Resolved Player123's withdrawal issue</span>
                      <span className="text-muted-foreground">14:35</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Approved KYC for NewPlayer99</span>
                      <span className="text-muted-foreground">14:15</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Started bingo session in Golden Hall</span>
                      <span className="text-muted-foreground">13:45</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Handled technical support for LuckyGamer</span>
                      <span className="text-muted-foreground">13:20</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Reviewed and rejected fraudulent KYC</span>
                      <span className="text-muted-foreground">12:50</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>Clock in - Shift started</span>
                      <span className="text-muted-foreground">08:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
