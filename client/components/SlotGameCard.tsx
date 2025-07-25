import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Coins, Crown } from "lucide-react";
import GameLauncher from "./GameLauncher";
import SweepstakesTermsModal from "./SweepstakesTermsModal";

interface SlotGameCardProps {
  title: string;
  gameSymbol?: string;
  provider?: string;
  thumbnail: string;
  isPopular?: boolean;
  isNew?: boolean;
  jackpot?: string;
  category: string;
  rtp: string;
  volatility: string;
  onPlayGold?: () => void;
  onPlaySweeps?: () => void;
}

export default function SlotGameCard({
  title,
  gameSymbol,
  provider,
  thumbnail,
  isPopular,
  isNew,
  jackpot,
  category,
  rtp,
  volatility,
  onPlayGold,
  onPlaySweeps,
}: SlotGameCardProps) {
  const [showLauncher, setShowLauncher] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [showSweepstakesModal, setShowSweepstakesModal] = useState(false);

  const handlePlayGold = () => {
    if (gameSymbol) {
      setSelectedCurrency("GC");
      setShowLauncher(true);
    } else if (onPlayGold) {
      onPlayGold();
    }
  };

  const handlePlaySweeps = () => {
    // Always show terms modal first for SweepsCoins
    setShowSweepstakesModal(true);
  };

  const handleAcceptTermsAndPlay = () => {
    if (gameSymbol) {
      setSelectedCurrency("SC");
      setShowLauncher(true);
    } else if (onPlaySweeps) {
      onPlaySweeps();
    }
  };
  return (
    <Card className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 casino-glow hover:shadow-xl">
      <div className="relative">
        {/* Game Thumbnail */}
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

          {/* Game Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-white text-xs">
              <div className="flex justify-between items-center">
                <span>RTP: {rtp}</span>
                <span>{volatility}</span>
              </div>
            </div>
          </div>
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

            {/* Dual Play Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                size="sm"
                onClick={handlePlayGold}
              >
                <Coins className="w-3 h-3 mr-1" />
                Play for FUN with GoldCoins!
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                size="sm"
                onClick={handlePlaySweeps}
              >
                <Crown className="w-3 h-3 mr-1" />
                Play For Real with SweepsCoins!
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Game Launcher Modal */}
      {showLauncher && gameSymbol && (
        <GameLauncher
          gameSymbol={gameSymbol}
          gameName={title}
          currency={selectedCurrency}
          onClose={() => setShowLauncher(false)}
        />
      )}

      {/* Sweepstakes Terms Modal */}
      <SweepstakesTermsModal
        isOpen={showSweepstakesModal}
        onClose={() => setShowSweepstakesModal(false)}
        onAccept={handleAcceptTermsAndPlay}
        gameName={title}
      />
    </Card>
  );
}
