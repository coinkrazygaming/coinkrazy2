import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CasinoHeader from "@/components/CasinoHeader";
import GameCard from "@/components/GameCard";
import MiniGameLauncher from "@/components/MiniGames/MiniGameLauncher";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

export default function Index() {
  const { stats } = useLiveData();
  const { user } = useAuth();
  const [selectedMiniGame, setSelectedMiniGame] = useState<string | null>(null);

  // Mock data for games
  const miniGames = [
    {
      title: "Josey's Quack Attack",
      emoji: "🦆",
      category: "Mini Game",
      cooldown: "18:24:15",
      provider: "CoinKrazy",
      image:
        "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=600&fit=crop&crop=center",
    },
    {
      title: "Colin Shots",
      emoji: "🏀",
      category: "Mini Game",
      cooldown: null,
      provider: "CoinKrazy",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop&crop=center",
    },
    {
      title: "Flickin' My Bean",
      emoji: "🎯",
      category: "Mini Game",
      cooldown: "12:45:30",
      provider: "CoinKrazy",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&crop=center",
    },
    {
      title: "Lucky Wheel Spin",
      emoji: "🎡",
      category: "Mini Game",
      cooldown: null,
      provider: "CoinKrazy",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F72c742a5911d473691d607381841c43f?format=webp&width=800",
    },
    {
      title: "Number Guess Master",
      emoji: "🔢",
      category: "Mini Game",
      cooldown: "23:15:42",
      provider: "CoinKrazy",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F158ad80714ee4ada8f8c644f5204f766?format=webp&width=800",
    },
  ];

  const slotGames = [
    {
      title: "Sweet Bonanza",
      emoji: "💰",
      category: "Slots",
      isPopular: true,
      jackpot: "$21,100",
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25sweetbonanza.png",
    },
    {
      title: "The Dog House",
      emoji: "💎",
      category: "Slots",
      isNew: true,
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20doghouse.png",
    },
    {
      title: "Gate of Olympus",
      emoji: "🍀",
      category: "Slots",
      isPopular: true,
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20gatotoro.png",
    },
    {
      title: "Fruit Party",
      emoji: "🦁",
      category: "Slots",
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20fruitparty.png",
    },
    {
      title: "Gold Party",
      emoji: "🌊",
      category: "Slots",
      jackpot: "$15,234",
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25goldparty.png",
    },
    {
      title: "Great Rhino",
      emoji: "🚀",
      category: "Slots",
      isNew: true,
      provider: "Pragmatic Play",
      image:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20greatrhino.png",
    },
  ];

  const tableGames = [
        {
      title: "Blackjack Classic",
      emoji: "🃏",
      category: "Table Game",
      isPopular: true,
      provider: "Evolution",
      image:
        "https://cdn.evolution.lv/live_casino/blackjack/game_thumb_340x240_classic_blackjack.jpg",
    },
        {
      title: "European Roulette",
      emoji: "🎡",
      category: "Table Game",
      provider: "Evolution",
      image:
        "https://cdn.evolution.lv/live_casino/roulette/game_thumb_340x240_european_roulette.jpg",
    },
        {
      title: "Baccarat Deluxe",
      emoji: "🎭",
      category: "Table Game",
      provider: "Playtech",
      image:
        "https://cdn.evolution.lv/live_casino/baccarat/game_thumb_340x240_classic_baccarat.jpg",
    },
        {
      title: "Texas Hold'em",
      emoji: "♠️",
      category: "Poker",
      isPopular: true,
      provider: "PokerStars",
      image:
        "https://cdn.evolution.lv/live_casino/poker/game_thumb_340x240_texas_holdem.jpg",
    },
  ];

  // No longer needed - using live data context

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      {/* Hero Banner */}
      <section className="relative py-12 casino-gradient">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center space-x-2 mb-4 bg-black/20 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5 text-gold-400" />
              <span className="text-gold-400 font-semibold">
                Welcome to CoinKrazy.com! 🎊
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🎰 Social Casino Fun! 🎲
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Play for FREE • Win Real Prizes • Join the Fun! 🎉
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 casino-pulse"
                    asChild
                  >
                    <Link to="/slots">
                      <Star className="w-5 h-5 mr-2" />
                      🎰 Play Slots Now!
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-background"
                    asChild
                  >
                    <Link to="/mini-games">
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      🎮 Play Mini Games
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 casino-pulse"
                    asChild
                  >
                    <Link to="/auth">
                      <Gift className="w-5 h-5 mr-2" />
                      🎁 Claim FREE 10,000 GC + 10 SC
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-background"
                    asChild
                  >
                    <Link to="/auth">
                      <Crown className="w-5 h-5 mr-2" />
                      🔐 Login & Play
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary">
                <Users className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {stats.usersOnline.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">🟢 Players Online</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-accent">
                <TrendingUp className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  ${stats.totalWithdrawals.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                💰 Today's Payouts
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span className="text-2xl font-bold">700+</span>
              </div>
              <p className="text-sm text-muted-foreground">
                🎮 Games Available
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-accent">
                <Zap className="w-4 h-4" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <p className="text-sm text-muted-foreground">⚡ Live Support</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* Daily Mini Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Timer className="w-6 h-6 mr-2 text-accent" />
                🎯 Daily Mini Games
              </h2>
              <p className="text-muted-foreground">
                Play once every 24 hours for FREE SC! 🆓
              </p>
            </div>
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              🔥 Exclusive to CoinKrazy!
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {miniGames.map((game, index) => (
              <GameCard
                key={index}
                title={game.title}
                provider={game.provider}
                image={game.image}
                category={game.category}
                emoji={game.emoji}
                cooldown={game.cooldown}
                onClick={() => {
                  const slug = game.title
                    .toLowerCase()
                    .replace(/['']/g, "")
                    .replace(/\s+/g, "-");
                  setSelectedMiniGame(slug);
                }}
              />
            ))}
          </div>
        </section>

        {/* Popular Slots */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Star className="w-6 h-6 mr-2 text-primary" />
                🎰 Popular Slots
              </h2>
              <p className="text-muted-foreground">
                Top player favorites with big wins! 💎
              </p>
            </div>
            <Button variant="outline">View All Slots →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {slotGames.map((game, index) => (
              <GameCard
                key={index}
                title={game.title}
                provider={game.provider}
                image={game.image}
                category={game.category}
                emoji={game.emoji}
                isPopular={game.isPopular}
                isNew={game.isNew}
                jackpot={game.jackpot}
                onClick={() => console.log(`Playing ${game.title}`)}
                onPlayGold={() =>
                  console.log(`Playing ${game.title} with Gold Coins`)
                }
                onPlaySweeps={() =>
                  console.log(`Playing ${game.title} with Sweeps Coins`)
                }
              />
            ))}
          </div>
        </section>

        {/* Table Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Crown className="w-6 h-6 mr-2 text-accent" />
                🎲 Table Games
              </h2>
              <p className="text-muted-foreground">
                Classic casino favorites! 🃏
              </p>
            </div>
            <Button variant="outline">View All Tables →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tableGames.map((game, index) => (
              <GameCard
                key={index}
                title={game.title}
                provider={game.provider}
                image={game.image}
                category={game.category}
                emoji={game.emoji}
                isPopular={game.isPopular}
                onClick={() => console.log(`Playing ${game.title}`)}
              />
            ))}
          </div>
        </section>

        {/* Promotions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-primary" />
            🎁 Active Promotions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  🎊 Welcome Bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  New players get 10,000 GC + 10 SC FREE! 🎁
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Claim Now! 🚀
                </Button>
              </CardContent>
            </Card>

            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-accent">
                  ⚡ Daily Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Login daily for increasing rewards! 📈
                </p>
                <Button
                  variant="outline"
                  className="w-full border-accent text-accent"
                >
                  Check In ✅
                </Button>
              </CardContent>
            </Card>

            <Card className="casino-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  🏆 Weekly Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Compete for the top prizes! 🥇
                </p>
                <Button variant="outline" className="w-full">
                  View Rankings 📊
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CoinKrazy.com
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            🎰 Social Casino • 🎁 Free to Play • 🏆 Real Prizes
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary">
              Responsible Gaming
            </a>
            <a href="#" className="hover:text-primary">
              Support 💬
            </a>
          </div>
          <div className="flex justify-center space-x-4 mt-6 mb-2">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary/70 hover:text-primary hover:border-primary text-xs"
              asChild
            >
              <Link to="/admin">🔧 Admin Login</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/30 text-accent/70 hover:text-accent hover:border-accent text-xs"
              asChild
            >
              <Link to="/staff">👮 Staff Login</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © 2024 CoinKrazy.com • 18+ Only �� Play Responsibly 🎲
          </p>
        </div>
      </footer>

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
