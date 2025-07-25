import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Star,
  Heart,
  Info,
  TrendingUp,
  Coins,
  Crown,
  Volume2,
  VolumeX,
  Maximize,
  X,
} from "lucide-react";

interface GamePreviewModalProps {
  game: {
    id: string;
    title: string;
    provider: string;
    thumbnail: string;
    category: string;
    rtp: string;
    volatility: string;
    paylines: number | string;
    minBet: number;
    maxBet: number;
    jackpot?: string;
    isPopular?: boolean;
    isNew?: boolean;
    description: string;
  };
  children: React.ReactNode;
  onPlayGold: () => void;
  onPlaySweeps: () => void;
}

export default function GamePreviewModal({
  game,
  children,
  onPlayGold,
  onPlaySweeps,
}: GamePreviewModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const gameFeatures = [
    "Wild Symbols",
    "Scatter Pays",
    "Free Spins",
    "Bonus Rounds",
    "Multipliers",
    "Auto Play",
  ];

  const recentWins = [
    { player: "Player***23", amount: 1250, currency: "GC", time: "2 min ago" },
    { player: "Lucky***88", amount: 45.5, currency: "SC", time: "5 min ago" },
    { player: "Casino***99", amount: 890, currency: "GC", time: "8 min ago" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {game.title}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-current text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Game Preview */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={game.thumbnail}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 left-4 space-y-2">
                {game.isNew && (
                  <Badge className="bg-destructive text-white animate-pulse">
                    🆕 NEW
                  </Badge>
                )}
                {game.isPopular && (
                  <Badge className="bg-accent text-accent-foreground">
                    ⭐ POPULAR
                  </Badge>
                )}
                {game.jackpot && (
                  <Badge className="bg-primary text-primary-foreground casino-pulse">
                    💰 {game.jackpot}
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Play className="w-5 h-5 mr-2" />
                  Preview Game
                </Button>
              </div>
            </div>

            {/* Play Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg py-3"
                onClick={onPlayGold}
              >
                <Coins className="w-5 h-5 mr-2" />
                Play with Gold Coins
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
                onClick={onPlaySweeps}
              >
                <Crown className="w-5 h-5 mr-2" />
                Play with Sweeps Coins
              </Button>
            </div>
          </div>

          {/* Game Details */}
          <div className="space-y-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Game Info</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="wins">Recent Wins</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Game Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <div className="font-semibold">{game.provider}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-semibold">{game.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RTP:</span>
                        <div className="font-semibold text-green-500">
                          {game.rtp}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Volatility:
                        </span>
                        <div className="font-semibold">{game.volatility}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paylines:</span>
                        <div className="font-semibold">{game.paylines}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Win:</span>
                        <div className="font-semibold text-accent">
                          {game.maxBet * 1000} GC
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Betting Range
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Min Bet</p>
                        <p className="text-xl font-bold">{game.minBet} GC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Max Bet</p>
                        <p className="text-xl font-bold">{game.maxBet} GC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Game Features
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {gameFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Star className="w-3 h-3 text-accent" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Performance Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hit Frequency</span>
                        <span className="font-bold">28.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Win</span>
                        <span className="font-bold text-accent">125 GC</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Multiplier</span>
                        <span className="font-bold text-primary">x5000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bonus Hit Rate</span>
                        <span className="font-bold">1 in 180 spins</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Player Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Players Today</span>
                        <span className="font-bold">2,847</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Spins</span>
                        <span className="font-bold">156,789</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Biggest Win Today</span>
                        <span className="font-bold text-accent">12,450 SC</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wins" className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-primary">
                      Recent Big Wins 🏆
                    </h3>
                    <div className="space-y-3">
                      {recentWins.map((win, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              {win.player}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {win.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent">
                              {win.amount.toLocaleString()} {win.currency}
                            </p>
                            <div className="flex items-center">
                              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-500">
                                Big Win!
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Info className="w-4 h-4 inline mr-2" />
                {game.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
