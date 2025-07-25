import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CasinoHeader from "@/components/CasinoHeader";
import GameCard from "@/components/GameCard";
import SlotGameCard from "@/components/SlotGameCard";
import GamePreviewModal from "@/components/GamePreviewModal";
import SlotFilters from "@/components/SlotFilters";
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Gift,
  Trophy,
  Coins,
  Play,
  Volume2,
  Clock,
} from "lucide-react";

export default function Slots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [jackpotAmount, setJackpotAmount] = useState(245678.89);
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [selectedVolatility, setSelectedVolatility] = useState("All");
  const [rtpRange, setRtpRange] = useState<[number, number]>([90, 99]);
  const [betRange, setBetRange] = useState<[number, number]>([0.1, 500]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);

  // PragmaticPlay slot games with real API integration
  const slotGames = [
    {
      id: "doghouse",
      title: "The Dog House",
      gameSymbol: "vs20doghouse",
      provider: "Pragmatic Play",
      category: "popular",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20doghouse.png",
      rtp: "96.51%",
      volatility: "High",
      paylines: 20,
      minBet: 0.2,
      maxBet: 125,
      jackpot: "$15,420",
      isNew: false,
      isPopular: true,
      description: "Enjoy a fun-filled adventure with man's best friend!",
    },
    {
      id: "sweetbonanza",
      title: "Sweet Bonanza",
      gameSymbol: "vs25sweetbonanza",
      provider: "Pragmatic Play",
      category: "new",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25sweetbonanza.png",
      rtp: "96.51%",
      volatility: "High",
      paylines: "Pays Anywhere",
      minBet: 0.2,
      maxBet: 100,
      jackpot: "$21,100",
      isNew: true,
      isPopular: true,
      description: "Sweet treats and big wins in this tumbling slot!",
    },
    {
      id: "greatrhino",
      title: "Great Rhino",
      gameSymbol: "vs20greatrhino",
      provider: "Pragmatic Play",
      category: "classic",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20greatrhino.png",
      rtp: "96.5%",
      volatility: "Medium",
      paylines: 20,
      minBet: 0.2,
      maxBet: 100,
      jackpot: null,
      isNew: false,
      isPopular: true,
      description: "Classic safari adventure with big wins!",
    },
    {
      id: "wildwest",
      title: "Wild West Gold",
      gameSymbol: "vs40wildwest",
      provider: "Pragmatic Play",
      category: "adventure",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs40wildwest.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: 40,
      minBet: 0.4,
      maxBet: 200,
      jackpot: null,
      isNew: false,
      isPopular: false,
      description: "Journey into the wild west for golden treasures!",
    },
    {
      id: "gateofolympus",
      title: "Gate of Olympus",
      gameSymbol: "vs20gatotoro",
      provider: "Pragmatic Play",
      category: "adventure",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20gatotoro.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: "Pays Anywhere",
      minBet: 0.5,
      maxBet: 200,
      jackpot: "$8,923",
      isNew: false,
      isPopular: true,
      description: "Dive deep for underwater riches!",
    },
    {
      id: "starlight",
      title: "Starlight Princess",
      gameSymbol: "vs20starlightx",
      provider: "Pragmatic Play",
      category: "magic",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20starlightx.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: "Pays Anywhere",
      minBet: 0.2,
      maxBet: 100,
      jackpot: null,
      isNew: true,
      isPopular: false,
      description: "Explore the magical cosmos for stellar wins!",
    },
    {
      id: "fruitparty",
      title: "Fruit Party",
      gameSymbol: "vs20fruitparty",
      provider: "Pragmatic Play",
      category: "classic",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20fruitparty.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: "Cluster Pays",
      minBet: 0.2,
      maxBet: 100,
      jackpot: "$5,000",
      isNew: false,
      isPopular: true,
      description: "Join the fruity fun in this colorful party!",
    },
    {
      id: "goldparty",
      title: "Gold Party",
      gameSymbol: "vs25goldparty",
      provider: "Pragmatic Play",
      category: "magic",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25goldparty.png",
      rtp: "96.5%",
      volatility: "Medium",
      paylines: 25,
      minBet: 0.25,
      maxBet: 125,
      jackpot: "$15,234",
      isNew: false,
      isPopular: true,
      description: "Celebrate wins with this golden party slot!",
    },
    {
      id: "dragonkingdom",
      title: "Dragon Kingdom",
      gameSymbol: "vs25dragonkingdom",
      provider: "Pragmatic Play",
      category: "classic",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25dragonkingdom.png",
      rtp: "96.5%",
      volatility: "Medium",
      paylines: 25,
      minBet: 0.25,
      maxBet: 125,
      jackpot: null,
      isNew: false,
      isPopular: false,
      description: "Enter the mystical dragon kingdom for treasures!",
    },
    {
      id: "piratespub",
      title: "Pirate's Pub",
      gameSymbol: "vs9piratepub",
      provider: "Pragmatic Play",
      category: "adventure",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs9piratepub.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: 9,
      minBet: 0.09,
      maxBet: 45,
      jackpot: "$9,876",
      isNew: false,
      isPopular: true,
      description: "Join the pirates for a tavern adventure!",
    },
    {
      id: "buffalokingmega",
      title: "Buffalo King Megaways",
      gameSymbol: "vswaysbufking",
      provider: "Pragmatic Play",
      category: "jackpot",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vswaysbufking.png",
      rtp: "96.06%",
      volatility: "Very High",
      paylines: "Megaways",
      minBet: 0.2,
      maxBet: 100,
      jackpot: "$245,678",
      isNew: false,
      isPopular: true,
      description: "Buffalo stampede with megaways for life-changing wins!",
    },
    {
      id: "bookoftut",
      title: "Book of Tut",
      gameSymbol: "vs10bookoftut",
      provider: "Pragmatic Play",
      category: "ancient",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs10bookoftut.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: 10,
      minBet: 0.1,
      maxBet: 50,
      jackpot: null,
      isNew: false,
      isPopular: false,
      description: "Uncover ancient Egyptian treasures with Tutankhamun!",
    },
    {
      id: "candyblitz",
      title: "Candy Blitz",
      gameSymbol: "vs20candyblitz",
      provider: "Pragmatic Play",
      category: "sweet",
      thumbnail:
        "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20candyblitz.png",
      rtp: "96.5%",
      volatility: "High",
      paylines: "Cluster Pay",
      minBet: 0.2,
      maxBet: 100,
      jackpot: null,
      isNew: true,
      isPopular: true,
      description: "Sweet candy blitz with explosive wins!",
    },
  ];

  const categories = [
    { id: "all", name: "All Games", count: slotGames.length },
    {
      id: "popular",
      name: "🔥 Popular",
      count: slotGames.filter((g) => g.isPopular).length,
    },
    {
      id: "new",
      name: "🆕 New",
      count: slotGames.filter((g) => g.isNew).length,
    },
    {
      id: "jackpot",
      name: "💰 Jackpots",
      count: slotGames.filter((g) => g.jackpot).length,
    },
    {
      id: "classic",
      name: "🎰 Classic",
      count: slotGames.filter((g) => g.category === "classic").length,
    },
    {
      id: "adventure",
      name: "🗺️ Adventure",
      count: slotGames.filter((g) => g.category === "adventure").length,
    },
  ];

  const providers = [
    "All Providers",
    "Pragmatic Play",
    "NetEnt",
    "Play'n GO",
    "Microgaming",
    "Red Tiger",
    "Yggdrasil",
    "Evolution",
  ];

  useEffect(() => {
    // Simulate progressive jackpot updates
    const interval = setInterval(() => {
      setJackpotAmount((prev) => prev + Math.random() * 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = slotGames.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "popular" && game.isPopular) ||
      (selectedCategory === "new" && game.isNew) ||
      (selectedCategory === "jackpot" && game.jackpot) ||
      game.category === selectedCategory;
    const matchesProvider =
      selectedProvider === "All Providers" ||
      game.provider === selectedProvider;
    const matchesVolatility =
      selectedVolatility === "All" || game.volatility === selectedVolatility;
    const rtpValue = parseFloat(game.rtp.replace("%", ""));
    const matchesRtp = rtpValue >= rtpRange[0] && rtpValue <= rtpRange[1];
    const matchesBet = game.minBet >= betRange[0] && game.maxBet <= betRange[1];

    return (
      matchesSearch &&
      matchesCategory &&
      matchesProvider &&
      matchesVolatility &&
      matchesRtp &&
      matchesBet
    );
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedProvider !== "All Providers") count++;
    if (selectedVolatility !== "All") count++;
    if (rtpRange[0] !== 90 || rtpRange[1] !== 99) count++;
    if (betRange[0] !== 0.1 || betRange[1] !== 500) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSelectedProvider("All Providers");
    setSelectedVolatility("All");
    setRtpRange([90, 99]);
    setBetRange([0.1, 500]);
  };

  const toggleFavorite = (gameId: string) => {
    setFavorites((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId],
    );
  };

  const addToRecentlyPlayed = (gameId: string) => {
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((id) => id !== gameId);
      return [gameId, ...filtered].slice(0, 10); // Keep last 10 played
    });
  };

  const handlePlayGame = (gameId: string) => {
    // Implementation for launching slot game
    console.log(`Launching slot game: ${gameId}`);
  };

  const handlePlayWithGold = (gameId: string) => {
    // Implementation for playing with Gold Coins
    addToRecentlyPlayed(gameId);
    console.log(`Playing ${gameId} with Gold Coins`);
  };

  const handlePlayWithSweeps = (gameId: string) => {
    // Implementation for playing with Sweeps Coins
    addToRecentlyPlayed(gameId);
    console.log(`Playing ${gameId} with Sweeps Coins`);
  };

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Slots Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            <Crown className="w-10 h-10 mr-3 text-primary" />
            🎰 Slot Games
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Over 700+ premium slot games from top providers! 🎮
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-primary text-primary-foreground px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Premium Games
            </Badge>
            <Badge className="bg-accent text-accent-foreground px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Instant Play
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              FREE with GC
            </Badge>
          </div>
        </div>

        {/* Progressive Jackpot Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary casino-glow">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  💰 Progressive Jackpot
                </h2>
                <div className="text-4xl font-bold text-accent mb-2 casino-pulse">
                  $
                  {jackpotAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-muted-foreground mb-4">
                  🎯 Next jackpot winner could be YOU! Play Mega Millions now!
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 casino-pulse"
                  onClick={() => handlePlayGame("mega-millions")}
                >
                  <Play className="w-5 h-5 mr-2" />
                  🚀 Play for Jackpot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-8">
          <SlotFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            selectedVolatility={selectedVolatility}
            onVolatilityChange={setSelectedVolatility}
            rtpRange={rtpRange}
            onRtpRangeChange={setRtpRange}
            betRange={betRange}
            onBetRangeChange={setBetRange}
            onClearFilters={clearAllFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </div>

        {/* Game Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory}>
            {/* Featured Games for Popular Tab */}
            {selectedCategory === "popular" && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-primary" />
                  🔥 Most Popular This Week
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {slotGames
                    .filter((game) => game.isPopular)
                    .slice(0, 4)
                    .map((game) => (
                      <SlotGameCard
                        key={game.id}
                        title={game.title}
                        gameSymbol={game.gameSymbol}
                        provider={game.provider}
                        thumbnail={game.thumbnail}
                        category="Slots"
                        rtp={game.rtp}
                        volatility={game.volatility}
                        isPopular={game.isPopular}
                        isNew={game.isNew}
                        jackpot={game.jackpot}
                        onPlayGold={() => handlePlayWithGold(game.id)}
                        onPlaySweeps={() => handlePlayWithSweeps(game.id)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-accent" />
                  🕐 Recently Played
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentlyPlayed
                    .slice(0, 6)
                    .map((gameId) => {
                      const game = slotGames.find((g) => g.id === gameId);
                      return game ? (
                        <GamePreviewModal
                          key={game.id}
                          game={game}
                          onPlayGold={() => handlePlayWithGold(game.id)}
                          onPlaySweeps={() => handlePlayWithSweeps(game.id)}
                        >
                          <div className="cursor-pointer">
                            <SlotGameCard
                              title={game.title}
                              provider={game.provider}
                              thumbnail={game.thumbnail}
                              category="Slots"
                              rtp={game.rtp}
                              volatility={game.volatility}
                              isPopular={game.isPopular}
                              isNew={game.isNew}
                              jackpot={game.jackpot}
                              onPlayGold={() => handlePlayWithGold(game.id)}
                              onPlaySweeps={() => handlePlayWithSweeps(game.id)}
                            />
                          </div>
                        </GamePreviewModal>
                      ) : null;
                    })
                    .filter(Boolean)}
                </div>
              </div>
            )}

            {/* All Games Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {selectedCategory === "all"
                    ? `All Slot Games (${filteredGames.length})`
                    : `${
                        categories.find((c) => c.id === selectedCategory)?.name
                      } (${filteredGames.length})`}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Volume2 className="w-4 h-4" />
                  <span>Sound on for full experience</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredGames.map((game) => (
                  <GamePreviewModal
                    key={game.id}
                    game={game}
                    onPlayGold={() => handlePlayWithGold(game.id)}
                    onPlaySweeps={() => handlePlayWithSweeps(game.id)}
                  >
                    <div className="cursor-pointer">
                      <SlotGameCard
                        title={game.title}
                        gameSymbol={game.gameSymbol}
                        provider={game.provider}
                        thumbnail={game.thumbnail}
                        category="Slots"
                        rtp={game.rtp}
                        volatility={game.volatility}
                        isPopular={game.isPopular}
                        isNew={game.isNew}
                        jackpot={game.jackpot}
                        onPlayGold={() => handlePlayWithGold(game.id)}
                        onPlaySweeps={() => handlePlayWithSweeps(game.id)}
                      />
                    </div>
                  </GamePreviewModal>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    No games found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or category filters
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Provider Showcase */}
        <div className="mt-12">
          <Card className="casino-glow">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center text-primary">
                <Trophy className="w-6 h-6 mr-2" />
                🏆 Premium Game Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl mb-2">🎮</div>
                  <h3 className="font-semibold">Pragmatic Play</h3>
                  <p className="text-sm text-muted-foreground">
                    Industry leaders in slots
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold">NetEnt</h3>
                  <p className="text-sm text-muted-foreground">
                    Innovative game mechanics
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">🎪</div>
                  <h3 className="font-semibold">Play'n GO</h3>
                  <p className="text-sm text-muted-foreground">
                    Mobile-first designs
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">🎨</div>
                  <h3 className="font-semibold">Microgaming</h3>
                  <p className="text-sm text-muted-foreground">
                    Progressive jackpots
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsible Gaming Notice */}
        <div className="mt-8 text-center">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              🎮 Play responsibly • 🔞 18+ Only • 🎰 Slots are games of chance •
              💰 Set limits and play within your means
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
