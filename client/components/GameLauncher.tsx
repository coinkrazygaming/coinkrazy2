import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, X, Coins, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pragmaticPlayService from "@/services/pragmaticPlay";
import { toast } from "sonner";

interface GameLauncherProps {
  gameSymbol: string;
  gameName: string;
  onClose: () => void;
  currency: "GC" | "SC";
}

export default function GameLauncher({
  gameSymbol,
  gameName,
  onClose,
  currency,
}: GameLauncherProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<any>(null);

  useEffect(() => {
    loadGameInfo();
  }, [gameSymbol]);

  const loadGameInfo = async () => {
    try {
      const info = await pragmaticPlayService.getGameInfo(gameSymbol);
      setGameInfo(info);
    } catch (error) {
      console.error("Failed to load game info:", error);
      toast.error("Failed to load game information");
    }
  };

  const launchGame = async () => {
    if (!user) {
      toast.error("Please log in to play games");
      return;
    }

    setLoading(true);
    try {
      const session = await pragmaticPlayService.launchGame({
        gameSymbol,
        userId: user.id.toString(),
        currency,
        mode: "sweepstakes", // Always use sweepstakes mode for compliance
        returnUrl: window.location.origin + "/slots",
        language: "en",
      });

      setGameUrl(session.gameUrl);
      toast.success("Game launched successfully!");

      // Record game launch in database
      await recordGameLaunch();
    } catch (error) {
      console.error("Failed to launch game:", error);
      toast.error("Failed to launch game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recordGameLaunch = async () => {
    try {
      // Call backend to record game session start
      await fetch("/api/games/pragmatic/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          gameSymbol,
          currency,
          mode: "sweepstakes",
        }),
      });
    } catch (error) {
      console.error("Failed to record game launch:", error);
    }
  };

  if (gameUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full h-full max-w-7xl max-h-screen bg-white rounded-lg overflow-hidden">
          {/* Game Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold">{gameName}</h2>
              <Badge className="bg-white text-primary">
                {currency === "SC" ? "🏆 Sweeps Mode" : "🪙 Gold Mode"}
              </Badge>
              <Badge className="bg-accent text-white">
                <Star className="w-4 h-4 mr-1" />
                RTP: {gameInfo?.rtp}%
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Game Frame */}
          <div className="h-full bg-black">
            <iframe
              src={gameUrl}
              className="w-full h-full border-0"
              allow="fullscreen; autoplay; payment"
              title={gameName}
            />
          </div>

          {/* Game Footer */}
          <div className="bg-secondary p-3 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>🎰 Powered by PragmaticPlay</span>
              <span>🔒 Sweepstakes Mode - Play for FREE</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Balance:</span>
              <span className="font-bold">
                {currency === "SC"
                  ? `${user?.sweeps_coins?.toFixed(2) || "0.00"} SC`
                  : `${user?.gold_coins?.toLocaleString() || "0"} GC`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md casino-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Play className="w-5 h-5 mr-2 text-primary" />
              Launch Game
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameInfo ? (
            <>
              {/* Game Info */}
              <div className="text-center">
                <img
                  src={gameInfo.thumbnail}
                  alt={gameName}
                  className="w-32 h-48 mx-auto rounded-lg mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-2">{gameName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">RTP:</span>
                    <span className="font-bold ml-2">{gameInfo.rtp}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volatility:</span>
                    <span className="font-bold ml-2">
                      {gameInfo.volatility}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Win:</span>
                    <span className="font-bold ml-2">
                      {gameInfo.maxWin.toLocaleString()}x
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-bold ml-2">PragmaticPlay</span>
                  </div>
                </div>
              </div>

              {/* Currency Selection Info */}
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="font-semibold">
                    Playing with{" "}
                    {currency === "SC" ? "Sweeps Coins" : "Gold Coins"}
                  </span>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {currency === "SC"
                    ? "🏆 Sweeps Coins can be redeemed for real prizes!"
                    : "🪙 Gold Coins are for entertainment only"}
                </p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-2">Game Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {gameInfo.features.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Launch Button */}
              <Button
                onClick={launchGame}
                disabled={loading || !user}
                className="w-full bg-primary hover:bg-primary/90 casino-pulse"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Launching Game...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    🎰 Play {gameName}
                  </>
                )}
              </Button>

              {/* Disclaimer */}
              <div className="text-xs text-center text-muted-foreground space-y-1">
                <p>🔞 Must be 18+ to play</p>
                <p>🎮 Play responsibly • Set limits and stick to them</p>
                <p>🔒 Game operates in sweepstakes mode for compliance</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading game information...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
