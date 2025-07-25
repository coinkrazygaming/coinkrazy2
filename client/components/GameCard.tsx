import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star, Coins, Clock, Crown } from "lucide-react";

interface GameCardProps {
  title: string;
  provider?: string;
  image: string;
  isPopular?: boolean;
  isNew?: boolean;
  jackpot?: string;
  category: string;
  emoji: string;
  cooldown?: string;
  onClick?: () => void;
  onPlayGold?: () => void;
  onPlaySweeps?: () => void;
}

export default function GameCard({
  title,
  provider,
  image,
  isPopular,
  isNew,
  jackpot,
  category,
  emoji,
  cooldown,
  onClick,
  onPlayGold,
  onPlaySweeps,
}: GameCardProps) {
  const isOnCooldown = !!cooldown;

  return (
    <Card
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 casino-glow ${
        isOnCooldown ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
      }`}
      onClick={!isOnCooldown ? onClick : undefined}
    >
      <div className="relative">
        {/* Game Image */}
        <div className="aspect-[3/4] bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
          {image ? (
            <>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-casino-gradient opacity-20" />
              <div className="flex items-center justify-center h-full">
                <div className="text-6xl mb-4 animate-float">{emoji}</div>
              </div>
            </>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            {!isOnCooldown ? (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 casino-pulse"
              >
                <Play className="w-5 h-5 mr-2" />
                Play Now
              </Button>
            ) : (
              <div className="text-center text-white">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Available in</p>
                <p className="font-bold">{cooldown}</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                🆕 NEW
              </Badge>
            )}
            {isPopular && (
              <Badge className="bg-accent text-accent-foreground">
                ⭐ POPULAR
              </Badge>
            )}
          </div>

          {/* Jackpot */}
          {jackpot && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-primary-foreground casino-pulse">
                💰 {jackpot}
              </Badge>
            </div>
          )}
        </div>

        {/* Game Info */}
        <CardContent className="p-3">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              {provider && (
                <p className="text-xs text-muted-foreground mt-1">
                  by {provider}
                </p>
              )}
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              </div>
            </div>

            {/* Dual Play Buttons for Slots */}
            {category === "Slots" &&
              onPlayGold &&
              onPlaySweeps &&
              !isOnCooldown && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayGold();
                    }}
                  >
                    <Coins className="w-3 h-3 mr-1" />
                    Play for FUN with Gold Coins!
                  </Button>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySweeps();
                    }}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Play for REAL with Sweeps Coins!
                  </Button>
                </div>
              )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
