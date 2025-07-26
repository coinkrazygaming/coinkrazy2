import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CasinoHeader from "@/components/CasinoHeader";
import MiniGameLauncher from "@/components/MiniGames/MiniGameLauncher";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/contexts/BalanceContext";
import {
  Gift,
  TrendingUp,
  Users,
  Zap,
  Star,
  Crown,
  Gamepad2,
  Trophy,
  Timer,
  DollarSign,
  Play,
  Sparkles,
  Flame,
  Target,
  Coins,
  ArrowUp,
  Activity,
  Clock,
  Award,
} from "lucide-react";

export default function ModernIndex() {
  const { stats, loading: statsLoading } = useLiveData();
  const { user } = useAuth();
  const { scBalance, gcBalance } = useBalance();
  const [selectedMiniGame, setSelectedMiniGame] = useState<string | null>(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState({
    newWinAmount: 0,
    newUserCount: 0,
    flashUpdate: false,
  });

  // Simulate real-time win updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomWin = Math.random() * 500 + 50;
      setRealtimeUpdates(prev => ({
        ...prev,
        newWinAmount: randomWin,
        flashUpdate: true,
      }));
      
      setTimeout(() => {
        setRealtimeUpdates(prev => ({ ...prev, flashUpdate: false }));
      }, 2000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const miniGames = [
    {
      id: "dogCatcher",
      title: "Dog Catcher",
      emoji: "🐕",
      category: "60s Challenge",
      reward: "1.00 SC",
      difficulty: "Medium",
      players: "1,247",
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "gtaV1",
      title: "Corey's GTA v1",
      emoji: "🚗",
      category: "60s Challenge",
      reward: "0.25 SC",
      difficulty: "Hard",
      players: "892",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "fastTetris",
      title: "Fast Tetris",
      emoji: "🧱",
      category: "60s Challenge",
      reward: "1.00 SC",
      difficulty: "Medium",
      players: "1,156",
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&auto=format",
    },
  ];

  const slotGames = [
    {
      title: "Golden Fortune",
      emoji: "🏆",
      provider: "Pragmatic Play",
      rtp: "96.5%",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format",
    },
    {
      title: "Crystal Riches",
      emoji: "💎",
      provider: "Evolution",
      rtp: "97.2%",
      image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop&auto=format",
    },
    {
      title: "Mega Jackpot",
      emoji: "🎰",
      provider: "NetEnt",
      rtp: "95.8%",
      image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop&auto=format",
    },
  ];

  const recentWins = [
    { user: "Player***2847", amount: 1247.50, game: "Golden Fortune", time: "2 min ago" },
    { user: "Player***8392", amount: 892.25, game: "Dog Catcher", time: "5 min ago" },
    { user: "Player***5671", amount: 2156.75, game: "Crystal Riches", time: "8 min ago" },
    { user: "Player***9384", amount: 567.50, game: "Fast Tetris", time: "12 min ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <CasinoHeader />

      {/* Hero Section with Real-time Stats */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"} />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>FREE SWEEPS COINS DAILY</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                CoinKrazy
              </span>
              <span className="text-white">.com</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The most exciting social casino with <span className="text-yellow-400 font-bold">real cash prizes</span> 
              and <span className="text-green-400 font-bold">daily free coins</span>
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold casino-pulse"
                  asChild
                >
                  <Link to="/register">
                    <Gift className="w-5 h-5 mr-2" />
                    Get 10,000 GC + 10 SC FREE
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg"
                  asChild
                >
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold"
                  asChild
                >
                  <Link to="/mini-games">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Play Mini Games
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link to="/slots">
                    <Star className="w-5 h-5 mr-2" />
                    Play Slots
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-green-400 mr-2" />
                  <div className={`text-2xl font-bold text-white ${statsLoading ? 'animate-pulse' : ''}`}>
                    {stats.usersOnline.toLocaleString()}
                  </div>
                </div>
                <p className="text-green-400 text-sm font-medium">Players Online</p>
                <div className="flex items-center justify-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Live</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-yellow-400 mr-2" />
                  <div className={`text-2xl font-bold text-white ${realtimeUpdates.flashUpdate ? 'animate-pulse text-yellow-400' : ''}`}>
                    ${stats.totalPayout.toLocaleString()}
                  </div>
                </div>
                <p className="text-yellow-400 text-sm font-medium">Today's Payouts</p>
                <div className="flex items-center justify-center mt-1">
                  <Activity className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span className="text-xs text-yellow-400">Live Updates</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-purple-400 mr-2" />
                  <div className="text-2xl font-bold text-white">
                    ${stats.jackpotAmount.toLocaleString()}
                  </div>
                </div>
                <p className="text-purple-400 text-sm font-medium">Progressive Jackpot</p>
                <div className="flex items-center justify-center mt-1">
                  <Flame className="w-3 h-3 text-orange-400 animate-bounce" />
                  <span className="text-xs text-orange-400">Growing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Gamepad2 className="w-6 h-6 text-blue-400 mr-2" />
                  <div className="text-2xl font-bold text-white">
                    {stats.gamesPlaying.toLocaleString()}
                  </div>
                </div>
                <p className="text-blue-400 text-sm font-medium">Games Playing</p>
                <div className="flex items-center justify-center mt-1">
                  <Play className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">Active Now</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mini Games Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
              🎮 60-Second Challenges
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Daily Mini Games
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Play once every 24 hours and earn free Sweeps Coins! Each game is a 60-second challenge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {miniGames.map((game) => (
              <Card
                key={game.id}
                className="bg-black/40 border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer casino-glow group"
                onClick={() => setSelectedMiniGame(game.id)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white">
                      {game.reward}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                      {game.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>{game.category}</span>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {game.players}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4"
              asChild
            >
              <Link to="/mini-games">
                <Trophy className="w-5 h-5 mr-2" />
                Play All Mini Games
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Real-time Wins Feed */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              <span>LIVE WINS</span>
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Recent Big Wins
            </h2>
            <p className="text-xl text-blue-100">
              See what our players are winning right now!
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {recentWins.map((win, index) => (
              <Card
                key={index}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{win.user}</p>
                        <p className="text-sm text-gray-400">won ${win.amount.toLocaleString()} on {win.game}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">${win.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{win.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Slots Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black mb-4">
              🎰 Premium Slots
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Top Slot Games
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              High RTP slots with massive jackpots and exciting bonus features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {slotGames.map((game, index) => (
              <Card
                key={index}
                className="bg-black/40 border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-black">
                      RTP {game.rtp}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-300">{game.provider}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-8 py-4 font-semibold"
              asChild
            >
              <Link to="/slots">
                <Star className="w-5 h-5 mr-2" />
                Explore All Slots
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Win Big?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of players winning real money every day. Start with your free welcome bonus!
            </p>
            
            {!user && (
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 text-xl font-bold casino-pulse"
                asChild
              >
                <Link to="/register">
                  <Crown className="w-6 h-6 mr-3" />
                  Claim Your Free Bonus Now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Mini Game Launcher */}
      {selectedMiniGame && (
        <MiniGameLauncher
          gameSlug={selectedMiniGame}
          onClose={() => setSelectedMiniGame(null)}
        />
      )}
    </div>
  );
}
