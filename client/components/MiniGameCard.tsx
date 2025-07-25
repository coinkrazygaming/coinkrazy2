import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, RotateCcw, Star, Timer } from "lucide-react";

interface MiniGameCardProps {
  id: string;
  title: string;
  description: string;
  maxEarning: string;
  difficulty: string;
  cooldown?: string | null;
  lastPlayed?: string | null;
  onClick?: () => void;
}

const gameImages = {
  "quack-attack":
    "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=300&fit=crop&crop=center",
  "colin-shots":
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&crop=center",
  "flickin-bean":
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
  "haylie-coins":
    "https://images.unsplash.com/photo-1543699565-003b8adda5fc?w=400&h=300&fit=crop&crop=center",
  "beth-darts":
    "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop&crop=center",
};

const gameEmojis = {
  "quack-attack": "🦆",
  "colin-shots": "🏀",
  "flickin-bean": "🎯",
  "haylie-coins": "🪙",
  "beth-darts": "🎪",
};

export default function MiniGameCard({
  id,
  title,
  description,
  maxEarning,
  difficulty,
  cooldown,
  lastPlayed,
  onClick,
}: MiniGameCardProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const isOnCooldown = !!cooldown;
  const gameImage = gameImages[id as keyof typeof gameImages];
  const gameEmoji = gameEmojis[id as keyof typeof gameEmojis];

  useEffect(() => {
    if (cooldown) {
      const updateTimer = () => {
        const [hours, minutes, seconds] = cooldown.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds <= 0) {
          setTimeRemaining("Available Now!");
          return;
        }

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        setTimeRemaining(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
        );
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  return (
    <Card
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 casino-glow ${
        isOnCooldown ? "opacity-75" : "hover:shadow-xl"
      }`}
    >
      <div className="relative">
        {/* Game Thumbnail with Branding */}
        <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
          <img
            src={gameImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Dark overlay for branding */}
          <div className="absolute inset-0 bg-black/40" />

          {/* CoinKrazy.com Branding */}
          <div className="absolute top-2 left-2 right-2">
            <div className="bg-primary/90 backdrop-blur-sm px-2 py-1 rounded text-center">
              <p className="text-primary-foreground text-xs font-bold">
                CoinKrazy.com Exclusive Mini Game
              </p>
            </div>
          </div>

          {/* Game Emoji Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl drop-shadow-lg animate-float">
              {gameEmoji}
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge
              className={`text-xs ${
                difficulty === "Easy"
                  ? "bg-green-500 text-white"
                  : difficulty === "Medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
              }`}
            >
              {difficulty === "Easy" && "🟢 Easy"}
              {difficulty === "Medium" && "🟡 Medium"}
              {difficulty === "Hard" && "🔴 Hard"}
            </Badge>
          </div>

          {/* Max Earning Badge */}
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-accent text-accent-foreground text-xs">
              💰 {maxEarning}
            </Badge>
          </div>
        </div>

        {/* Game Info */}
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>

            {/* Countdown Timer */}
            {isOnCooldown ? (
              <div className="text-center">
                <div className="bg-secondary/50 p-3 rounded-lg mb-3">
                  <Timer className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-semibold text-yellow-600 mb-1">
                    ⏰ Next Play Available In:
                  </p>
                  <div className="text-2xl font-bold text-primary font-mono">
                    {timeRemaining}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last played: {lastPlayed}
                  </p>
                </div>
                <Button className="w-full" disabled>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Come Back Later
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-500/10 p-3 rounded-lg mb-3">
                  <Star className="w-5 h-5 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-semibold text-green-600 mb-1">
                    ✅ Available Now!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Play for FREE SC every 24 hours
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 casino-pulse"
                  onClick={onClick}
                >
                  <Play className="w-4 h-4 mr-2" />
                  🎮 Play Now!
                </Button>
              </div>
            )}

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/50 p-2 rounded text-center">
                <p className="text-muted-foreground">Duration</p>
                <p className="font-bold">60 seconds</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded text-center">
                <p className="text-muted-foreground">Reward</p>
                <p className="font-bold text-accent">FREE SC</p>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
