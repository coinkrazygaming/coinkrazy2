import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CasinoHeader from "@/components/CasinoHeader";
import GameCard from "@/components/GameCard";
import MiniGameLauncher from "@/components/MiniGames/MiniGameLauncher";
import DogCatcherGame from "@/components/MiniGames/DogCatcherGame";
import GTAGame from "@/components/MiniGames/GTAGame";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown,
  Gift,
  Star,
  Timer,
  Trophy,
  Zap,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";

export default function MiniGames() {
  const { user } = useAuth();
  const [selectedMiniGame, setSelectedMiniGame] = useState<string | null>(null);

  const miniGames = [
    {
      id: "dogCatcher",
      title: "Dog Catcher",
      emoji: "🐕",
      category: "Mini Game",
      cooldown: "Available",
      provider: "CoinKrazy",
      description: "Catch as many dogs as you can in 60 seconds!",
      maxReward: "1.00 SC",
      difficulty: "Medium",
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop&auto=format",
      component: DogCatcherGame,
    },
    {
      id: "gtaV1",
      title: "Corey's GTA v1",
      emoji: "🚗",
      category: "Mini Game",
      cooldown: "Available",
      provider: "CoinKrazy",
      description: "Steal cars and escape the police in 60 seconds!",
      maxReward: "0.25 SC",
      difficulty: "Hard",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&auto=format",
      component: GTAGame,
    },
    {
      title: "Josey's Duck Pond",
      emoji: "🦆",
      category: "Mini Game",
      cooldown: "18:24:15",
      provider: "CoinKrazy",
      description: "Pick the lucky ducks to win SC rewards!",
      maxReward: "0.25 SC",
      difficulty: "Easy",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F72c742a5911d473691d607381841c43f?format=webp&width=800",
    },
    {
      title: "Colin Shots",
      emoji: "🏀",
      category: "Mini Game",
      cooldown: null,
      provider: "CoinKrazy",
      description: "Shoot hoops and score baskets to earn SC!",
      maxReward: "0.50 SC",
      difficulty: "Medium",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2Fd814c0ccb6ff4f92a9beb83abec0bcd9?format=webp&width=800",
    },
    {
      title: "Crack the Vault",
      emoji: "🔐",
      category: "Mini Game",
      cooldown: "12:45:30",
      provider: "CoinKrazy",
      description: "Crack the code and unlock the vault for rewards!",
      maxReward: "1.00 SC",
      difficulty: "Hard",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F158ad80714ee4ada8f8c644f5204f766?format=webp&width=800",
    },
    {
      title: "Lucky Wheel Spin",
      emoji: "🎡",
      category: "Mini Game",
      cooldown: null,
      provider: "CoinKrazy",
      description: "Spin the wheel for your chance at SC prizes!",
      maxReward: "0.30 SC",
      difficulty: "Easy",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F72c742a5911d473691d607381841c43f?format=webp&width=800",
    },
    {
      title: "Number Guess Master",
      emoji: "🔢",
      category: "Mini Game",
      cooldown: "23:15:42",
      provider: "CoinKrazy",
      description: "Guess the secret number to win SC rewards!",
      maxReward: "0.40 SC",
      difficulty: "Medium",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F158ad80714ee4ada8f8c644f5204f766?format=webp&width=800",
    },
    {
      title: "Coin Flip Challenge",
      emoji: "🪙",
      category: "Mini Game",
      cooldown: "06:30:15",
      provider: "CoinKrazy",
      description: "Call heads or tails and test your luck!",
      maxReward: "0.20 SC",
      difficulty: "Easy",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F7c34c31495aa42ffab5801e2d12a9790%2F72c742a5911d473691d607381841c43f?format=webp&width=800",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Hard":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-foreground flex items-center">
                  <Gamepad2 className="w-10 h-10 mr-4 text-primary" />
                  🎮 CoinKrazy Mini Games
                </h1>
                <p className="text-muted-foreground text-lg">
                  Play daily mini games to earn free Sweep Coins! • Reset every
                  24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="casino-glow">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">6</p>
                <p className="text-sm text-muted-foreground">🎮 Total Games</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="p-4 text-center">
                <Timer className="w-8 h-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold text-accent">3</p>
                <p className="text-sm text-muted-foreground">⏰ Available</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-500">1.00</p>
                <p className="text-sm text-muted-foreground">💰 Max SC</p>
              </CardContent>
            </Card>
            <Card className="casino-glow">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">FREE</p>
                <p className="text-sm text-muted-foreground">🎁 Daily Play</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <Card className="casino-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-6 h-6 mr-2 text-primary" />
              🎯 How Mini Games Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Daily Reset</h3>
                <p className="text-sm text-muted-foreground">
                  Each mini game can be played once every 24 hours. Timers reset
                  at midnight UTC.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Earn SC Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Win Sweep Coins based on your performance. Higher scores earn
                  more SC!
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Completely Free</h3>
                <p className="text-sm text-muted-foreground">
                  No Gold Coins required! Play daily for free SC rewards and
                  have fun.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miniGames.map((game, index) => (
            <Card
              key={index}
              className="casino-glow hover:scale-105 transition-transform cursor-pointer"
              onClick={() => {
                if (!game.cooldown || game.cooldown === "Available") {
                  const slug = game.id || game.title
                    .toLowerCase()
                    .replace(/[']/g, "")
                    .replace(/\s+/g, "-");
                  setSelectedMiniGame(slug);
                }
              }}
            >
              <div className="relative">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={getDifficultyColor(game.difficulty)}>
                    {game.difficulty}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-accent text-accent-foreground">
                    {game.maxReward}
                  </Badge>
                </div>
                {game.cooldown && game.cooldown !== "Available" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                    <div className="text-center text-white">
                      <Timer className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Available in</p>
                      <p className="font-bold">{game.cooldown}</p>
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{game.title}</h3>
                  <span className="text-2xl">{game.emoji}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{game.category}</Badge>
                  <Button
                    size="sm"
                    disabled={!!game.cooldown}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!game.cooldown || game.cooldown === "Available") {
                        const slug = game.id || game.title
                          .toLowerCase()
                          .replace(/[']/g, "")
                          .replace(/\s+/g, "-");
                        setSelectedMiniGame(slug);
                      }
                    }}
                  >
                    {game.cooldown && game.cooldown !== "Available" ? "On Cooldown" : "Play Now 🎮"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="casino-glow max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                🎮 Exclusive CoinKrazy Mini Games
              </h3>
              <p className="text-muted-foreground mb-4">
                These mini games are exclusively developed for CoinKrazy.com
                players. Play daily to maximize your free SC earnings and have
                fun with our unique game collection!
              </p>
              <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                <span>🕒 Resets Daily at Midnight UTC</span>
                <span>•</span>
                <span>🎁 100% Free to Play</span>
                <span>•</span>
                <span>💰 Real SC Rewards</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
