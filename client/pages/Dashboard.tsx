import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import CasinoHeader from "@/components/CasinoHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Coins,
  History,
  FileText,
  Shield,
  Wallet,
  Trophy,
  Star,
  TrendingUp,
  Download,
  Upload,
  CreditCard,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Gamepad2,
  Target,
  Calendar,
  Award,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  created_at: string;
  bonus_amount?: number;
}

interface GameSession {
  id: number;
  game_name: string;
  game_type: string;
  amount_wagered: number;
  amount_won: number;
  created_at: string;
  duration_minutes: number;
  currency_type: string;
}

interface UserStats {
  total_wagered: number;
  total_won: number;
  games_played: number;
  favorite_game: string;
  win_rate: number;
  biggest_win: number;
  current_streak: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const { toast } = useToast();

  // Calculate derived user data
  const getVipTier = (level: number) => {
    if (level >= 50) return "Diamond";
    if (level >= 30) return "Platinum";
    if (level >= 15) return "Gold";
    if (level >= 5) return "Silver";
    return "Bronze";
  };

  const getXpToNext = (level: number) => {
    return level * 1000; // Simple formula: next level requires level * 1000 XP
  };

  // Fetch user dashboard data
  useEffect(() => {
    if (!user || !token) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch recent transactions
        const transactionsRes = await fetch("/api/transactions/recent", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(transactionsData.slice(0, 10)); // Show last 10 transactions
        }

        // Fetch game history
        const gameHistoryRes = await fetch("/api/games/history", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (gameHistoryRes.ok) {
          const gameHistoryData = await gameHistoryRes.json();
          setGameHistory(gameHistoryData.slice(0, 10)); // Show last 10 games
        }

        // Fetch user statistics
        const statsRes = await fetch("/api/user/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description:
            "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, toast]);

  // Claim daily bonus
  const claimDailyBonus = async () => {
    try {
      const response = await fetch("/api/user/claim-daily-bonus", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Bonus Claimed! 🎉",
          description: `You received ${result.amount} ${result.currency}!`,
        });
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Cannot Claim Bonus",
          description:
            error.message || "You have already claimed today's bonus.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Gamepad2 className="w-8 h-8 mr-3 text-primary" />
                Player Dashboard 🎮
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user.username}! 👋
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-primary text-primary-foreground mb-2">
                {getVipTier(user.level)} VIP 👑
              </Badge>
              <p className="text-sm text-muted-foreground">
                Level {user.level} • {user.experience_points.toLocaleString()}{" "}
                XP
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level Progress</span>
              <span className="text-sm text-muted-foreground">
                {user.experience_points} / {getXpToNext(user.level)} XP
              </span>
            </div>
            <Progress
              value={(user.experience_points / getXpToNext(user.level)) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-primary" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {user.gold_coins.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Gold Coins</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-accent" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent" />
              ) : (
                <p className="text-2xl font-bold text-accent">
                  {user.sweeps_coins.toFixed(2)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Sweepstakes Cash</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" />
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  ${userStats?.total_won.toLocaleString() || "0"}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Total Won</p>
            </CardContent>
          </Card>
          <Card className="casino-glow">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {userStats?.games_played.toLocaleString() || "0"}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Games Played</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        {userStats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="casino-glow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold text-green-500">
                      {userStats.win_rate
                        ? (userStats.win_rate * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Biggest Win</p>
                    <p className="text-2xl font-bold text-primary">
                      ${userStats.biggest_win?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {userStats.current_streak || 0} days
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
            <TabsTrigger value="profile">👤 Profile</TabsTrigger>
            <TabsTrigger value="transactions">💰 Transactions</TabsTrigger>
            <TabsTrigger value="games">🎮 Game History</TabsTrigger>
            <TabsTrigger value="kyc">🛡️ KYC</TabsTrigger>
            <TabsTrigger value="bonuses">🎁 Bonuses</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={user.username}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={user.first_name}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={user.last_name}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-primary">
                        Account Status 📊
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>KYC Status:</span>
                          <Badge
                            className={
                              user.kyc_status === "verified"
                                ? "bg-green-500 text-white"
                                : "bg-yellow-500 text-white"
                            }
                          >
                            {user.kyc_status === "verified"
                              ? "✅ Verified"
                              : "⏳ Pending"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>VIP Tier:</span>
                          <Badge className="bg-primary text-primary-foreground">
                            👑 {getVipTier(user.level)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Level:</span>
                          <span className="font-medium">{user.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <Badge variant="outline">
                            {user.is_admin
                              ? "🔒 Admin"
                              : user.is_staff
                                ? "⚡ Staff"
                                : "🎮 Player"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {userStats && (
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 text-primary">
                          Gaming Stats 🎯
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Favorite Game:</span>
                            <span className="font-medium">
                              {userStats.favorite_game || "None yet"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Wagered:</span>
                            <span className="font-medium">
                              ${userStats.total_wagered.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Net Profit:</span>
                            <span
                              className={`font-medium ${userStats.total_won - userStats.total_wagered > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              $
                              {(
                                userStats.total_won - userStats.total_wagered
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Update Profile Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-primary" />
                    Transaction History
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No transactions yet. Start playing to see your activity
                      here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {(tx.type === "deposit" ||
                              tx.type === "purchase") && (
                              <Upload className="w-5 h-5 text-primary" />
                            )}
                            {tx.type === "withdrawal" && (
                              <Download className="w-5 h-5 text-accent" />
                            )}
                            {(tx.type === "win" || tx.type === "game_win") && (
                              <Trophy className="w-5 h-5 text-green-500" />
                            )}
                            {tx.type === "bonus" && (
                              <Gift className="w-5 h-5 text-primary" />
                            )}
                            {tx.type === "mini_game" && (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.type === "deposit" && "💰 Deposit"}
                              {tx.type === "purchase" && "💰 Purchase"}
                              {tx.type === "withdrawal" && "💸 Withdrawal"}
                              {tx.type === "win" && "🎉 Game Win"}
                              {tx.type === "game_win" && "🎉 Game Win"}
                              {tx.type === "bonus" && "🎁 Bonus"}
                              {tx.type === "mini_game" && "🎯 Mini Game"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.description} •{" "}
                              {new Date(tx.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount.toLocaleString()} {tx.currency}
                          </p>
                          {tx.bonus_amount && (
                            <p className="text-sm text-green-500">
                              +{tx.bonus_amount} {tx.currency} bonus
                            </p>
                          )}
                          <div className="flex items-center justify-end mt-1">
                            {tx.status === "completed" ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            ) : tx.status === "pending" ? (
                              <Badge className="bg-yellow-500 text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white">
                                <XCircle className="w-3 h-3 mr-1" />
                                {tx.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game History Tab */}
          <TabsContent value="games">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-primary" />
                  Recent Game Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading game history...</p>
                  </div>
                ) : gameHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No games played yet. Start playing to build your history!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gameHistory.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold">{game.game_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {game.game_type} •{" "}
                            {new Date(game.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {game.duration_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            Wagered: {game.amount_wagered} {game.currency_type}
                          </p>
                          <p className="text-sm">
                            Won: {game.amount_won} {game.currency_type}
                          </p>
                          <p
                            className={`font-bold ${
                              game.amount_won - game.amount_wagered > 0
                                ? "text-green-500"
                                : game.amount_won - game.amount_wagered < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {game.amount_won - game.amount_wagered > 0
                              ? "+"
                              : ""}
                            {(game.amount_won - game.amount_wagered).toFixed(2)}{" "}
                            {game.currency_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Know Your Customer (KYC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {user.kyc_status === "verified" ? (
                    <>
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2 text-green-500">
                        ✅ KYC Verification Complete!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Your identity has been verified. You can now withdraw
                        Sweepstakes Cash prizes! 🎉
                      </p>
                      <div className="bg-secondary p-4 rounded-lg inline-block">
                        <p className="text-sm">
                          <strong>Verified Documents:</strong>
                        </p>
                        <ul className="text-sm text-left mt-2 space-y-1">
                          <li>✅ Government ID</li>
                          <li>✅ Proof of Address</li>
                          <li>✅ Bank Account Information</li>
                        </ul>
                      </div>
                    </>
                  ) : user.kyc_status === "pending" ? (
                    <>
                      <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                      <h3 className="text-xl font-semibold mb-2 text-yellow-600">
                        ⏳ KYC Verification Pending
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Your documents are being reviewed. This usually takes
                        1-3 business days.
                      </p>
                      <div className="bg-secondary p-4 rounded-lg inline-block">
                        <p className="text-sm">
                          <strong>Submitted Documents:</strong>
                        </p>
                        <ul className="text-sm text-left mt-2 space-y-1">
                          <li>⏳ Government ID - Under Review</li>
                          <li>⏳ Proof of Address - Under Review</li>
                          <li>⏳ Bank Account Information - Under Review</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                      <h3 className="text-xl font-semibold mb-2 text-red-500">
                        🔒 KYC Verification Required
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Complete KYC verification to withdraw Sweepstakes Cash
                        prizes.
                      </p>
                      <Button className="mb-4">
                        <Shield className="w-4 h-4 mr-2" />
                        Start KYC Verification
                      </Button>
                      <div className="bg-secondary p-4 rounded-lg inline-block">
                        <p className="text-sm">
                          <strong>Required Documents:</strong>
                        </p>
                        <ul className="text-sm text-left mt-2 space-y-1">
                          <li>📄 Government ID (Driver's License, Passport)</li>
                          <li>
                            🏠 Proof of Address (Utility Bill, Bank Statement)
                          </li>
                          <li>🏦 Bank Account Information</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonuses Tab */}
          <TabsContent value="bonuses">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-primary" />
                  Active Bonuses & Promotions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">
                      🎁 Daily Login Bonus
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Login daily to earn bonus coins!
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={claimDailyBonus}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      Claim Today's Bonus
                    </Button>
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                    <h3 className="font-semibold text-accent mb-2">
                      ⚡ VIP {getVipTier(user.level)} Benefits
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enjoy exclusive perks as a {getVipTier(user.level)} VIP
                      member!
                    </p>
                    <ul className="text-xs space-y-1">
                      {getVipTier(user.level) === "Bronze" && (
                        <>
                          <li>• 5% bonus on deposits</li>
                          <li>• Basic customer support</li>
                          <li>• Access to all games</li>
                        </>
                      )}
                      {getVipTier(user.level) === "Silver" && (
                        <>
                          <li>• 10% bonus on deposits</li>
                          <li>• Enhanced customer support</li>
                          <li>• Weekly bonus opportunities</li>
                        </>
                      )}
                      {getVipTier(user.level) === "Gold" && (
                        <>
                          <li>• 20% bonus on deposits</li>
                          <li>• Priority customer support</li>
                          <li>• Exclusive VIP tournaments</li>
                        </>
                      )}
                      {getVipTier(user.level) === "Platinum" && (
                        <>
                          <li>• 35% bonus on deposits</li>
                          <li>• VIP account manager</li>
                          <li>• Exclusive high-roller games</li>
                        </>
                      )}
                      {getVipTier(user.level) === "Diamond" && (
                        <>
                          <li>• 50% bonus on deposits</li>
                          <li>• Personal VIP concierge</li>
                          <li>• Custom betting limits</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <h3 className="font-semibold text-green-500 mb-2">
                      🏆 Weekly Challenge
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Play 50 games this week for extra rewards!
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.min(userStats?.games_played || 0, 50)}/50 games
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          ((userStats?.games_played || 0) / 50) * 100,
                          100,
                        )}
                        className="h-2"
                      />
                    </div>
                    <p className="text-xs text-green-500">
                      Reward: 1,000 GC + 5 SC
                    </p>
                    {userStats && userStats.games_played >= 50 && (
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-green-500 hover:bg-green-600"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Claim Reward!
                      </Button>
                    )}
                  </div>

                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <h3 className="font-semibold text-yellow-600 mb-2">
                      🎯 Mini Game Master
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete all 5 mini games today!
                    </p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Josey's Quack Attack</span>
                        <span className="text-green-500">✅ Complete</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Colin Shots</span>
                        <span className="text-green-500">✅ Complete</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flickin' My Bean</span>
                        <span className="text-yellow-600">⏳ Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Haylie's Coins</span>
                        <span className="text-muted-foreground">🔒 Locked</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beth's Darts</span>
                        <span className="text-muted-foreground">🔒 Locked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
