import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import CasinoHeader from "@/components/CasinoHeader";
import {
  Trophy,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Trash2,
  Timer,
  Users,
  Target,
  Zap,
  Calendar,
  BarChart3,
  PlayCircle,
  Pause,
  TrendingDown,
  Filter,
  Search,
  Activity,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Crown,
  Coins,
  Calculator,
  History,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface SportEvent {
  id: string;
  sport: string;
  emoji: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: "upcoming" | "live" | "finished";
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  category: string;
  totalBets: number;
  description: string;
  liveScore?: string;
  timeRemaining?: string;
  quarter?: string;
  homeScore?: number;
  awayScore?: number;
  overUnder?: {
    total: number;
    overOdds: number;
    underOdds: number;
  };
  spread?: {
    points: number;
    homeOdds: number;
    awayOdds: number;
  };
  props?: Array<{
    name: string;
    options: Array<{
      name: string;
      odds: number;
    }>;
  }>;
}

interface Bet {
  id: string;
  eventId: string;
  team: string;
  opponent: string;
  odds: number;
  sport: string;
  stake: number;
  betType: "moneyline" | "spread" | "total" | "prop";
  betDetails?: string;
  currency: "GC" | "SC";
}

export default function Sports() {
  const [betSlip, setBetSlip] = useState<Bet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [betSlipType, setBetSlipType] = useState<"single" | "parlay">("single");
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [liveEventsCount, setLiveEventsCount] = useState(47);
  const [betHistory, setBetHistory] = useState<any[]>([]);
  const [sportsStats, setSportsStats] = useState({
    dailyPayouts: "$0",
    betsToday: 0,
    payoutRate: "95.5%",
    isRealData: false,
  });

  // Comprehensive sports events data
  const sportsEvents: SportEvent[] = [
    {
      id: "nfl-chiefs-bills",
      sport: "NFL",
      emoji: "🏈",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      startTime: "2024-12-22 20:00",
      status: "upcoming",
      homeOdds: 1.85,
      awayOdds: 1.95,
      category: "featured",
      totalBets: 15420,
      description: "AFC Championship Game",
      spread: { points: -3.5, homeOdds: 1.9, awayOdds: 1.9 },
      overUnder: { total: 47.5, overOdds: 1.9, underOdds: 1.9 },
      props: [
        {
          name: "First Touchdown Scorer",
          options: [
            { name: "Travis Kelce", odds: 3.5 },
            { name: "Stefon Diggs", odds: 4.2 },
            { name: "Josh Allen", odds: 8.5 },
          ],
        },
      ],
    },
    {
      id: "nba-lakers-warriors",
      sport: "NBA",
      emoji: "🏀",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Golden State Warriors",
      startTime: "2024-12-20 22:00",
      status: "live",
      homeOdds: 2.1,
      awayOdds: 1.75,
      category: "live",
      description:
        "Western Conference showdown between LA Lakers and Golden State Warriors",
      totalBets: 8930,
      liveScore: "Lakers 89 - Warriors 94",
      timeRemaining: "Q3 8:32",
      quarter: "3rd Quarter",
      homeScore: 89,
      awayScore: 94,
      spread: { points: +4.5, homeOdds: 1.85, awayOdds: 1.95 },
      overUnder: { total: 225.5, overOdds: 1.9, underOdds: 1.9 },
      props: [
        {
          name: "LeBron Points",
          options: [
            { name: "Over 25.5", odds: 1.85 },
            { name: "Under 25.5", odds: 1.95 },
          ],
        },
      ],
    },
    {
      id: "soccer-real-barca",
      sport: "Soccer",
      emoji: "⚽",
      homeTeam: "Real Madrid",
      awayTeam: "FC Barcelona",
      startTime: "2024-12-21 21:00",
      status: "upcoming",
      homeOdds: 2.3,
      awayOdds: 2.8,
      drawOdds: 3.1,
      category: "featured",
      totalBets: 25670,
      description: "El Clasico",
      overUnder: { total: 2.5, overOdds: 1.8, underOdds: 2.0 },
      props: [
        {
          name: "First Goal Scorer",
          options: [
            { name: "Karim Benzema", odds: 4.5 },
            { name: "Robert Lewandowski", odds: 3.8 },
            { name: "Vinicius Jr", odds: 5.2 },
          ],
        },
      ],
    },
    {
      id: "mma-jones-miocic",
      sport: "MMA",
      emoji: "🥊",
      homeTeam: "Jon Jones",
      awayTeam: "Stipe Miocic",
      startTime: "2024-12-23 22:00",
      status: "upcoming",
      homeOdds: 1.65,
      awayOdds: 2.25,
      category: "featured",
      totalBets: 12450,
      description: "Heavyweight Championship",
      props: [
        {
          name: "Method of Victory",
          options: [
            { name: "Jones by KO/TKO", odds: 3.2 },
            { name: "Jones by Decision", odds: 2.8 },
            { name: "Miocic by KO/TKO", odds: 4.5 },
          ],
        },
      ],
    },
    {
      id: "tennis-djokovic-nadal",
      sport: "Tennis",
      emoji: "🎾",
      homeTeam: "Novak Djokovic",
      awayTeam: "Rafael Nadal",
      startTime: "2024-12-20 15:00",
      status: "live",
      homeOdds: 1.9,
      awayOdds: 1.9,
      category: "live",
      description: "Epic tennis match between legends Djokovic and Nadal",
      totalBets: 7820,
      liveScore: "Djokovic 6-4, 3-2",
      timeRemaining: "Set 2",
      overUnder: { total: 3.5, overOdds: 1.75, underOdds: 2.05 },
    },
    {
      id: "hockey-rangers-bruins",
      sport: "NHL",
      emoji: "🏒",
      homeTeam: "New York Rangers",
      awayTeam: "Boston Bruins",
      startTime: "2024-12-21 19:00",
      status: "upcoming",
      homeOdds: 2.05,
      awayOdds: 1.8,
      category: "upcoming",
      totalBets: 4560,
      description: "Eastern Conference Rivalry",
      spread: { points: -1.5, homeOdds: 3.2, awayOdds: 1.35 },
      overUnder: { total: 6.5, overOdds: 1.9, underOdds: 1.9 },
    },
    {
      id: "baseball-yankees-redsox",
      sport: "MLB",
      emoji: "⚾",
      homeTeam: "New York Yankees",
      awayTeam: "Boston Red Sox",
      startTime: "2024-12-22 19:30",
      status: "upcoming",
      homeOdds: 1.75,
      awayOdds: 2.1,
      category: "upcoming",
      totalBets: 6780,
      description: "AL East Rivalry",
      spread: { points: -1.5, homeOdds: 1.9, awayOdds: 1.9 },
      overUnder: { total: 8.5, overOdds: 1.85, underOdds: 1.95 },
    },
    {
      id: "boxing-fury-usyk",
      sport: "Boxing",
      emoji: "🥊",
      homeTeam: "Tyson Fury",
      awayTeam: "Oleksandr Usyk",
      startTime: "2024-12-24 22:00",
      status: "upcoming",
      homeOdds: 2.4,
      awayOdds: 1.6,
      category: "featured",
      totalBets: 18920,
      description: "Undisputed Heavyweight Title",
      props: [
        {
          name: "Fight Goes Distance",
          options: [
            { name: "Yes", odds: 2.5 },
            { name: "No", odds: 1.5 },
          ],
        },
      ],
    },
    {
      id: "esports-t1-gen",
      sport: "Esports",
      emoji: "🎮",
      homeTeam: "T1",
      awayTeam: "Gen.G",
      startTime: "2024-12-20 18:00",
      status: "live",
      homeOdds: 1.6,
      awayOdds: 2.3,
      category: "live",
      totalBets: 5240,
      liveScore: "T1 1 - 0 Gen.G",
      timeRemaining: "Game 2",
      description: "LCK Finals",
      overUnder: { total: 2.5, overOdds: 1.8, underOdds: 2.0 },
    },
    {
      id: "cricket-ind-aus",
      sport: "Cricket",
      emoji: "🏏",
      homeTeam: "India",
      awayTeam: "Australia",
      startTime: "2024-12-21 09:00",
      status: "upcoming",
      homeOdds: 1.9,
      awayOdds: 1.9,
      drawOdds: 4.5,
      category: "upcoming",
      totalBets: 12340,
      description: "Test Match - Day 1",
      overUnder: { total: 650.5, overOdds: 1.9, underOdds: 1.9 },
    },
  ];

  const categories = [
    { id: "all", name: "All Sports", icon: "🏆", count: sportsEvents.length },
    {
      id: "live",
      name: "Live Now",
      icon: "🔴",
      count: sportsEvents.filter((e) => e.status === "live").length,
    },
    {
      id: "featured",
      name: "Featured",
      icon: "⭐",
      count: sportsEvents.filter((e) => e.category === "featured").length,
    },
    {
      id: "upcoming",
      name: "Upcoming",
      icon: "📅",
      count: sportsEvents.filter((e) => e.status === "upcoming").length,
    },
  ];

  const sports = [
    { id: "all", name: "All Sports", count: sportsEvents.length },
    {
      id: "NFL",
      name: "Football",
      count: sportsEvents.filter((e) => e.sport === "NFL").length,
    },
    {
      id: "NBA",
      name: "Basketball",
      count: sportsEvents.filter((e) => e.sport === "NBA").length,
    },
    {
      id: "Soccer",
      name: "Soccer",
      count: sportsEvents.filter((e) => e.sport === "Soccer").length,
    },
    {
      id: "NHL",
      name: "Hockey",
      count: sportsEvents.filter((e) => e.sport === "NHL").length,
    },
    {
      id: "MLB",
      name: "Baseball",
      count: sportsEvents.filter((e) => e.sport === "MLB").length,
    },
    {
      id: "MMA",
      name: "MMA",
      count: sportsEvents.filter((e) => e.sport === "MMA").length,
    },
    {
      id: "Boxing",
      name: "Boxing",
      count: sportsEvents.filter((e) => e.sport === "Boxing").length,
    },
    {
      id: "Tennis",
      name: "Tennis",
      count: sportsEvents.filter((e) => e.sport === "Tennis").length,
    },
    {
      id: "Esports",
      name: "Esports",
      count: sportsEvents.filter((e) => e.sport === "Esports").length,
    },
    {
      id: "Cricket",
      name: "Cricket",
      count: sportsEvents.filter((e) => e.sport === "Cricket").length,
    },
  ];

  // Fetch real sports statistics
  const fetchSportsStats = async () => {
    try {
      const response = await fetch("/api/sports/stats");
      if (response.ok) {
        const data = await response.json();
        setSportsStats({
          dailyPayouts: data.dailyStats.dailyPayoutsFormatted,
          betsToday: data.dailyStats.betsToday,
          payoutRate: `${data.dailyStats.payoutRate}%`,
          isRealData: data.isRealData,
        });
        setLiveEventsCount(data.liveStats.liveEvents);
      } else {
        console.warn("Failed to fetch sports stats, using fallback");
      }
    } catch (error) {
      console.warn("Sports stats API unavailable, using fallback data");
    }
  };

  useEffect(() => {
    // Fetch initial stats
    fetchSportsStats();

    // Update stats every 30 seconds
    const statsInterval = setInterval(fetchSportsStats, 30000);

    // Simulate live updates for events count
    const liveInterval = setInterval(() => {
      setLiveEventsCount((prev) =>
        Math.max(8, prev + Math.floor(Math.random() * 6) - 3),
      );
    }, 15000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(liveInterval);
    };
  }, []);

  const filteredEvents = sportsEvents.filter((event) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "live" && event.status === "live") ||
      (selectedCategory === "featured" && event.category === "featured") ||
      (selectedCategory === "upcoming" && event.status === "upcoming");

    const matchesSport =
      selectedSport === "all" || event.sport === selectedSport;

    const matchesSearch =
      searchTerm === "" ||
      event.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.sport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLive = !showLiveOnly || event.status === "live";

    return matchesCategory && matchesSport && matchesSearch && matchesLive;
  });

  const addToBetSlip = (
    event: SportEvent,
    side: string,
    betType: string,
    odds: number,
    betDetails?: string,
  ) => {
    let team = "";
    let opponent = "";

    if (betType === "moneyline") {
      team =
        side === "home"
          ? event.homeTeam
          : side === "away"
            ? event.awayTeam
            : "Draw";
      opponent = side === "home" ? event.awayTeam : event.homeTeam;
    } else {
      team = betDetails || side;
      opponent = `${event.homeTeam} vs ${event.awayTeam}`;
    }

    const bet: Bet = {
      id: `${event.id}-${side}-${betType}-${Date.now()}`,
      eventId: event.id,
      team,
      opponent,
      odds,
      sport: event.sport,
      stake: 10,
      betType: betType as any,
      betDetails,
      currency: "GC",
    };

    setBetSlip((prev) => {
      const existing = prev.find((b) => b.id === bet.id);
      if (existing) return prev;
      return [...prev, bet];
    });

    toast.success(`Added ${team} to bet slip!`);
  };

  const removeFromBetSlip = (betId: string) => {
    setBetSlip((prev) => prev.filter((bet) => bet.id !== betId));
    toast.info("Removed from bet slip");
  };

  const updateBetStake = (betId: string, stake: number) => {
    setBetSlip((prev) =>
      prev.map((bet) => (bet.id === betId ? { ...bet, stake } : bet)),
    );
  };

  const updateBetCurrency = (betId: string, currency: "GC" | "SC") => {
    setBetSlip((prev) =>
      prev.map((bet) => (bet.id === betId ? { ...bet, currency } : bet)),
    );
  };

  const getTotalOdds = () => {
    if (betSlipType === "single") return 0;
    return betSlip.reduce((total, bet) => total * bet.odds, 1);
  };

  const getTotalStake = () => {
    return betSlip.reduce((total, bet) => total + bet.stake, 0);
  };

  const getPotentialWin = () => {
    if (betSlipType === "single") {
      return betSlip.reduce((total, bet) => total + bet.stake * bet.odds, 0);
    }
    return getTotalStake() * getTotalOdds();
  };

  const placeBets = () => {
    if (betSlip.length === 0) return;

    const newBets = betSlip.map((bet) => ({
      ...bet,
      timestamp: new Date().toISOString(),
      status: "pending",
      potentialWin: bet.stake * bet.odds,
    }));

    setBetHistory((prev) => [...newBets, ...prev]);
    setBetSlip([]);

    toast.success(`${newBets.length} bet(s) placed successfully! 🎉`);
  };

  const clearBetSlip = () => {
    setBetSlip([]);
    toast.info("Bet slip cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Sports Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 mr-3 text-primary" />
            🏈 CoinKrazy Sportsbook
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Live odds • Real-time betting • Championship excitement! 🎯
          </p>
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
            <Badge className="bg-destructive text-white px-4 py-2 animate-pulse">
              <Timer className="w-4 h-4 mr-2" />
              🔴 {liveEventsCount} LIVE
            </Badge>
            <Badge className="bg-primary text-primary-foreground px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {sportsStats.betsToday.toLocaleString()} Bets Today
              {sportsStats.isRealData && (
                <span className="ml-1 text-xs">📊</span>
              )}
            </Badge>
            <Badge className="bg-accent text-accent-foreground px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Best Odds Guaranteed
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2">
              <DollarSign className="w-4 h-4 mr-2" />
              $2.4M+ Paid Out
            </Badge>
          </div>
        </div>

        {/* Live Stats Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary casino-glow">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary casino-pulse">
                    {sportsStats.dailyPayouts}
                    {sportsStats.isRealData && (
                      <span className="text-xs ml-1">📊</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    💰 Daily Payouts
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {liveEventsCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    🔴 Live Events
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">
                    🏆 Daily Events
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {sportsStats.payoutRate}
                    {sportsStats.isRealData && (
                      <span className="text-xs ml-1">📊</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📈 Payout Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Sports Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Events</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search teams, sports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sport">Sport</Label>
                    <Select
                      value={selectedSport}
                      onValueChange={setSelectedSport}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name} ({sport.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="liveOnly"
                      checked={showLiveOnly}
                      onChange={(e) => setShowLiveOnly(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="liveOnly" className="text-sm">
                      🔴 Live Only
                    </Label>
                  </div>
                  <div className="flex items-center pt-6">
                    <Badge variant="outline">
                      {filteredEvents.length} Events
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Categories */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-4 w-full mb-6">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.icon} {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory}>
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2">
                          No events found
                        </h3>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search term
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredEvents.map((event) => (
                      <Card key={event.id} className="casino-glow">
                        <CardContent className="p-6">
                          {/* Event Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-4xl">{event.emoji}</div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-lg">
                                    {event.homeTeam} vs {event.awayTeam}
                                  </h3>
                                  {event.status === "live" && (
                                    <Badge className="bg-destructive text-white animate-pulse">
                                      🔴 LIVE
                                    </Badge>
                                  )}
                                  {event.category === "featured" && (
                                    <Badge className="bg-primary text-primary-foreground">
                                      ⭐ FEATURED
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {event.sport} • {event.description}
                                </p>
                                {event.status === "live" ? (
                                  <div className="text-sm">
                                    <span className="font-bold text-primary">
                                      {event.liveScore}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                      {event.timeRemaining}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {new Date(event.startTime).toLocaleString()}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  👥 {event.totalBets.toLocaleString()} bets
                                  placed
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Betting Markets */}
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Moneyline */}
                            <div className="bg-secondary/20 p-4 rounded-lg">
                              <h4 className="font-semibold mb-3 text-sm">
                                Moneyline
                              </h4>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full justify-between hover:bg-primary hover:text-primary-foreground"
                                  onClick={() =>
                                    addToBetSlip(
                                      event,
                                      "home",
                                      "moneyline",
                                      event.homeOdds,
                                    )
                                  }
                                >
                                  <span className="text-xs">
                                    {event.homeTeam}
                                  </span>
                                  <span className="font-bold">
                                    {event.homeOdds.toFixed(2)}
                                  </span>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between hover:bg-accent hover:text-accent-foreground"
                                  onClick={() =>
                                    addToBetSlip(
                                      event,
                                      "away",
                                      "moneyline",
                                      event.awayOdds,
                                    )
                                  }
                                >
                                  <span className="text-xs">
                                    {event.awayTeam}
                                  </span>
                                  <span className="font-bold">
                                    {event.awayOdds.toFixed(2)}
                                  </span>
                                </Button>
                                {event.drawOdds && (
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-secondary hover:text-secondary-foreground"
                                    onClick={() =>
                                      addToBetSlip(
                                        event,
                                        "draw",
                                        "moneyline",
                                        event.drawOdds!,
                                      )
                                    }
                                  >
                                    <span className="text-xs">Draw</span>
                                    <span className="font-bold">
                                      {event.drawOdds.toFixed(2)}
                                    </span>
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Spread */}
                            {event.spread && (
                              <div className="bg-secondary/20 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3 text-sm">
                                  Spread
                                </h4>
                                <div className="space-y-2">
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-primary hover:text-primary-foreground"
                                    onClick={() =>
                                      addToBetSlip(
                                        event,
                                        "home",
                                        "spread",
                                        event.spread!.homeOdds,
                                        `${event.homeTeam} ${event.spread!.points > 0 ? "+" : ""}${event.spread!.points}`,
                                      )
                                    }
                                  >
                                    <span className="text-xs">
                                      {event.homeTeam}{" "}
                                      {event.spread.points > 0 ? "+" : ""}
                                      {event.spread.points}
                                    </span>
                                    <span className="font-bold">
                                      {event.spread.homeOdds.toFixed(2)}
                                    </span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-accent hover:text-accent-foreground"
                                    onClick={() =>
                                      addToBetSlip(
                                        event,
                                        "away",
                                        "spread",
                                        event.spread!.awayOdds,
                                        `${event.awayTeam} ${event.spread!.points < 0 ? "+" : ""}${-event.spread!.points}`,
                                      )
                                    }
                                  >
                                    <span className="text-xs">
                                      {event.awayTeam}{" "}
                                      {event.spread.points < 0 ? "+" : ""}
                                      {-event.spread.points}
                                    </span>
                                    <span className="font-bold">
                                      {event.spread.awayOdds.toFixed(2)}
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Over/Under */}
                            {event.overUnder && (
                              <div className="bg-secondary/20 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3 text-sm">
                                  Total Points
                                </h4>
                                <div className="space-y-2">
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-green-600 hover:text-white"
                                    onClick={() =>
                                      addToBetSlip(
                                        event,
                                        "over",
                                        "total",
                                        event.overUnder!.overOdds,
                                        `Over ${event.overUnder!.total}`,
                                      )
                                    }
                                  >
                                    <span className="text-xs">
                                      Over {event.overUnder.total}
                                    </span>
                                    <span className="font-bold">
                                      {event.overUnder.overOdds.toFixed(2)}
                                    </span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between hover:bg-red-600 hover:text-white"
                                    onClick={() =>
                                      addToBetSlip(
                                        event,
                                        "under",
                                        "total",
                                        event.overUnder!.underOdds,
                                        `Under ${event.overUnder!.total}`,
                                      )
                                    }
                                  >
                                    <span className="text-xs">
                                      Under {event.overUnder.total}
                                    </span>
                                    <span className="font-bold">
                                      {event.overUnder.underOdds.toFixed(2)}
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Player Props */}
                          {event.props && event.props.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-3 text-sm">
                                Player Props
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                {event.props.map((prop, propIndex) => (
                                  <div
                                    key={propIndex}
                                    className="bg-secondary/10 p-3 rounded-lg"
                                  >
                                    <h5 className="font-medium text-xs mb-2">
                                      {prop.name}
                                    </h5>
                                    <div className="space-y-1">
                                      {prop.options.map((option, optIndex) => (
                                        <Button
                                          key={optIndex}
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-between text-xs"
                                          onClick={() =>
                                            addToBetSlip(
                                              event,
                                              "prop",
                                              "prop",
                                              option.odds,
                                              option.name,
                                            )
                                          }
                                        >
                                          <span>{option.name}</span>
                                          <span className="font-bold">
                                            {option.odds.toFixed(2)}
                                          </span>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <Card className="casino-glow sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-primary">
                    <Target className="w-5 h-5 mr-2" />
                    🎯 Bet Slip ({betSlip.length})
                  </CardTitle>
                  {betSlip.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearBetSlip}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {betSlip.length > 1 && (
                  <div className="flex space-x-2">
                    <Button
                      variant={betSlipType === "single" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBetSlipType("single")}
                    >
                      Single Bets
                    </Button>
                    <Button
                      variant={betSlipType === "parlay" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBetSlipType("parlay")}
                    >
                      Parlay
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {betSlip.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-muted-foreground">
                      Click on odds to add bets to your slip!
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Build single bets or parlays for bigger payouts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {betSlip.map((bet) => (
                      <div key={bet.id} className="bg-secondary p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{bet.team}</p>
                            <p className="text-xs text-muted-foreground">
                              {bet.opponent} • {bet.sport}
                            </p>
                            {bet.betDetails && (
                              <p className="text-xs text-primary">
                                {bet.betDetails}
                              </p>
                            )}
                            <p className="text-xs font-bold text-accent">
                              Odds: {bet.odds.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromBetSlip(bet.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Stake:
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="10000"
                              value={bet.stake}
                              onChange={(e) =>
                                updateBetStake(
                                  bet.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Currency:
                            </Label>
                            <Select
                              value={bet.currency}
                              onValueChange={(value: "GC" | "SC") =>
                                updateBetCurrency(bet.id, value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GC">
                                  <div className="flex items-center">
                                    <Coins className="w-4 h-4 mr-2 text-yellow-500" />
                                    Gold Coins
                                  </div>
                                </SelectItem>
                                <SelectItem value="SC">
                                  <div className="flex items-center">
                                    <Crown className="w-4 h-4 mr-2 text-purple-500" />
                                    Sweeps Coins
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {betSlipType === "single" && (
                            <div className="text-xs text-center p-2 bg-primary/10 rounded">
                              Win: {(bet.stake * bet.odds).toFixed(2)}{" "}
                              {bet.currency}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Bet Summary */}
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bet Type:</span>
                          <span className="font-bold capitalize">
                            {betSlipType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Stake:</span>
                          <span className="font-bold">
                            {getTotalStake()} Coins
                          </span>
                        </div>
                        {betSlipType === "parlay" && (
                          <div className="flex justify-between">
                            <span>Combined Odds:</span>
                            <span className="font-bold">
                              {getTotalOdds().toFixed(2)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-base">
                          <span>Potential Win:</span>
                          <span className="font-bold text-accent">
                            {getPotentialWin().toFixed(2)} Coins
                          </span>
                        </div>
                        {betSlipType === "parlay" && betSlip.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            All bets must win for parlay payout
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 casino-pulse"
                      onClick={placeBets}
                      disabled={getTotalStake() === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      🚀 Place {betSlipType === "parlay" ? "Parlay" : "Bets"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bet History */}
            {betHistory.length > 0 && (
              <Card className="casino-glow mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-accent">
                    <History className="w-5 h-5 mr-2" />
                    Recent Bets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {betHistory.slice(0, 5).map((bet, index) => (
                      <div
                        key={index}
                        className="bg-secondary/20 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{bet.team}</p>
                            <p className="text-xs text-muted-foreground">
                              {bet.sport}
                            </p>
                            <p className="text-xs text-primary">
                              {bet.stake} {bet.currency} @ {bet.odds.toFixed(2)}
                            </p>
                          </div>
                          <Badge className="bg-yellow-500 text-black">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sportsbook Information */}
        <div className="mt-12">
          <Card className="casino-glow">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center text-primary">
                <Info className="w-6 h-6 mr-2" />
                🏆 How Sports Betting Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold mb-2">Reading Odds</h3>
                  <p className="text-sm text-muted-foreground">
                    Decimal odds show your total return. 2.00 = double your
                    money!
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold mb-2">Bet Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Moneyline, spread, totals, and player props available
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔴</div>
                  <h3 className="font-semibold mb-2">Live Betting</h3>
                  <p className="text-sm text-muted-foreground">
                    Bet on games in progress with real-time odds updates
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-semibold mb-2">Parlays</h3>
                  <p className="text-sm text-muted-foreground">
                    Combine bets for bigger payouts - all must win!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsible Betting */}
        <div className="mt-8 text-center">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              🎯 Bet responsibly • 🔞 18+ Only • 🏆 Virtual events for
              entertainment • 💰 Never bet more than you can afford • 🎮 Set
              limits and enjoy the game
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
