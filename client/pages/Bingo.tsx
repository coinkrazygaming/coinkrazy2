import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CasinoHeader from "@/components/CasinoHeader";
import {
  Star,
  Users,
  Trophy,
  Clock,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Gift,
  Crown,
  Timer,
  Zap,
  Radio,
  Mic,
  Camera,
} from "lucide-react";

export default function Bingo() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bingoCard, setBingoCard] = useState<number[][]>([]);
  const [calledNumbers, setCalledNumbers] = useState<string[]>([]);
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [timeToNext, setTimeToNext] = useState(120);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [currentBall, setCurrentBall] = useState<string | null>(null);
  const [ballAnimation, setBallAnimation] = useState(false);

  // Mock bingo rooms data - Half SC (Sweeps Coins) and Half GC (Gold Coins) with CoinKrazy branding
  const bingoRooms = [
    {
      id: "coinkrizy-golden-hall",
      name: "🌟 CoinKrazy Golden Hall",
      emoji: "✨",
      players: 47,
      maxPlayers: 100,
      jackpot: 125.5,
      ticketPrice: 2,
      currency: "SC",
      gameType: "CoinKrazy 75-Ball",
      status: "active",
      nextDraw: "2024-12-20 15:30",
      pattern: "CoinKrazy Full House",
      timeRemaining: 8,
      caller: "Sarah @ CoinKrazy.com",
      table: "CoinKrazy Premium Table #1",
    },
    {
      id: "coinkrizy-diamond-room",
      name: "💎 CoinKrazy Diamond Room",
      emoji: "💎",
      players: 32,
      maxPlayers: 75,
      jackpot: 1789.75,
      ticketPrice: 20,
      currency: "GC",
      gameType: "CoinKrazy 90-Ball",
      status: "waiting",
      nextDraw: "2024-12-20 16:00",
      pattern: "CoinKrazy Line",
      timeRemaining: 15,
      caller: "Mike @ CoinKrazy.com",
      table: "CoinKrazy VIP Table #2",
    },
    {
      id: "coinkrizy-ruby-lounge",
      name: "💍 CoinKrazy Ruby Lounge",
      emoji: "❤️",
      players: 23,
      maxPlayers: 50,
      jackpot: 67.25,
      ticketPrice: 1.5,
      currency: "SC",
      gameType: "CoinKrazy Speed 75",
      status: "waiting",
      nextDraw: "2024-12-20 15:45",
      pattern: "CoinKrazy Four Corners",
      timeRemaining: 5,
      caller: "Emma @ CoinKrazy.com",
      table: "CoinKrazy Express Table #3",
    },
    {
      id: "coinkrizy-emerald-palace",
      name: "💚 CoinKrazy Emerald Palace",
      emoji: "💚",
      players: 56,
      maxPlayers: 150,
      jackpot: 4680.8,
      ticketPrice: 100,
      currency: "GC",
      gameType: "CoinKrazy Mega 90",
      status: "active",
      nextDraw: "2024-12-20 15:35",
      pattern: "CoinKrazy Full House",
      timeRemaining: 12,
      caller: "James @ CoinKrazy.com",
      table: "CoinKrazy Platinum Table #4",
    },
    {
      id: "coinkrizy-sapphire-suite",
      name: "💙 CoinKrazy Sapphire Suite",
      emoji: "💙",
      players: 18,
      maxPlayers: 30,
      jackpot: 45.6,
      ticketPrice: 0.5,
      currency: "SC",
      gameType: "CoinKrazy Mini 75",
      status: "waiting",
      nextDraw: "2024-12-20 16:15",
      pattern: "CoinKrazy Blackout",
      timeRemaining: 25,
      caller: "Anna @ CoinKrazy.com",
      table: "CoinKrazy Cozy Table #5",
    },
    {
      id: "coinkrizy-platinum-hall",
      name: "🤍 CoinKrazy Platinum Hall",
      emoji: "⚪",
      players: 89,
      maxPlayers: 200,
      jackpot: 9137.9,
      ticketPrice: 200,
      currency: "GC",
      gameType: "CoinKrazy Super 90",
      status: "active",
      nextDraw: "2024-12-20 15:25",
      pattern: "CoinKrazy Two Lines",
      timeRemaining: 3,
      caller: "Victoria @ CoinKrazy.com",
      table: "CoinKrazy Elite Table #6",
    },
  ];

  // Generate random bingo card with CoinKrazy branding
  const generateBingoCard = () => {
    const card: number[][] = [];
    for (let col = 0; col < 5; col++) {
      const column: number[] = [];
      const min = col * 15 + 1;
      const max = col * 15 + 15;
      const numbers = Array.from({ length: 15 }, (_, i) => min + i);

      // Shuffle and pick 5 numbers
      for (let i = 0; i < 5; i++) {
        if (col === 2 && i === 2) {
          column.push(0); // Free space
        } else {
          const randomIndex = Math.floor(Math.random() * numbers.length);
          column.push(numbers.splice(randomIndex, 1)[0]);
        }
      }
      card.push(column);
    }

    // Transpose to get row-major order
    const transposed: number[][] = [];
    for (let row = 0; row < 5; row++) {
      transposed.push(card.map((col) => col[row]));
    }

    return transposed;
  };

  const generateRandomNumber = () => {
    const letters = ["B", "I", "N", "G", "O"];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    let min, max;

    switch (letter) {
      case "B":
        min = 1;
        max = 15;
        break;
      case "I":
        min = 16;
        max = 30;
        break;
      case "N":
        min = 31;
        max = 45;
        break;
      case "G":
        min = 46;
        max = 60;
        break;
      case "O":
        min = 61;
        max = 75;
        break;
      default:
        min = 1;
        max = 75;
    }

    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${letter}-${number}`;
  };

  const joinRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setBingoCard(generateBingoCard());
    setCalledNumbers([]);
    setCurrentNumber(null);
    setSelectedNumbers(new Set());
  };

  const startGame = () => {
    setGameInProgress(true);
    const interval = setInterval(() => {
      const newNumber = generateRandomNumber();
      setCurrentNumber(newNumber);
      setCurrentBall(newNumber);
      setBallAnimation(true);
      setCalledNumbers((prev) => [...prev, newNumber]);

      // Reset ball animation after 2 seconds
      setTimeout(() => setBallAnimation(false), 2000);

      if (Math.random() > 0.8) {
        // 20% chance to end game
        setGameInProgress(false);
        clearInterval(interval);
      }
    }, 3000);
  };

  const toggleNumber = (number: number) => {
    if (number === 0) return; // Can't select free space

    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(number)) {
      newSelected.delete(number);
    } else {
      newSelected.add(number);
    }
    setSelectedNumbers(newSelected);
  };

  useEffect(() => {
    // Countdown timer for next game
    const interval = setInterval(() => {
      setTimeToNext((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedRoomData = bingoRooms.find((room) => room.id === selectedRoom);

  if (selectedRoom && selectedRoomData) {
    return (
      <div className="min-h-screen bg-background">
        <CasinoHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Game Header with CoinKrazy Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                ← Back to CoinKrazy Lobby
              </Button>
              <h1 className="text-3xl font-bold text-primary">
                {selectedRoomData.name}
              </h1>
              <Badge
                className={`${
                  selectedRoomData.status === "active"
                    ? "bg-destructive text-white animate-pulse"
                    : "bg-yellow-500 text-white"
                }`}
              >
                {selectedRoomData.status === "active"
                  ? "🔴 LIVE @ CoinKrazy.com"
                  : "⏳ WAITING @ CoinKrazy.com"}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">
              🎤 Caller: {selectedRoomData.caller} • 🎯 Pattern:{" "}
              {selectedRoomData.pattern}
            </p>
            <p className="text-muted-foreground">
              🏆 CoinKrazy Jackpot:{" "}
              <span className="font-bold text-primary">
                {selectedRoomData.currency === "SC"
                  ? `${selectedRoomData.jackpot} SC`
                  : `${selectedRoomData.jackpot.toLocaleString()} GC`}
              </span>
              {" • "}🪑 Table: {selectedRoomData.table}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* CoinKrazy Branded Bingo Card */}
            <div className="lg:col-span-2">
              <Card className="casino-glow border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20">
                  <CardTitle className="text-center text-primary flex items-center justify-center">
                    🎯 Your CoinKrazy.com Bingo Ticket
                  </CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    🖊️ CoinKrazy Premium Dobber • Official CoinKrazy.com Ticket
                    #{Math.floor(Math.random() * 999999)}
                  </p>
                </CardHeader>
                <CardContent className="bg-gradient-to-br from-card to-card/80">
                  <div className="mb-4">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {["B", "I", "N", "G", "O"].map((letter, index) => (
                        <div
                          key={letter}
                          className="bg-primary text-primary-foreground text-center py-3 font-bold text-xl rounded border-2 border-primary shadow-lg"
                        >
                          <div className="text-xs text-primary-foreground/80">
                            CoinKrazy
                          </div>
                          <div>{letter}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 p-3 bg-white/10 rounded-lg border-2 border-accent">
                      {bingoCard.map((row, rowIndex) =>
                        row.map((number, colIndex) => {
                          const isSelected = selectedNumbers.has(number);
                          const isCalled = calledNumbers.some((called) =>
                            called.includes(number.toString()),
                          );

                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() => toggleNumber(number)}
                              className={`aspect-square flex flex-col items-center justify-center text-lg font-bold rounded border-2 cursor-pointer transition-all transform hover:scale-105 ${
                                number === 0
                                  ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-accent shadow-lg"
                                  : isSelected
                                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-lg ring-2 ring-yellow-400"
                                    : isCalled
                                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-lg"
                                      : "bg-gradient-to-br from-secondary to-secondary/80 border-border hover:bg-secondary/60 shadow-md"
                              }`}
                            >
                              {number === 0 ? (
                                <>
                                  <div className="text-[8px] text-accent-foreground/80">
                                    CoinKrazy
                                  </div>
                                  <div className="text-xs">FREE</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[8px] text-current/60">
                                    CK
                                  </div>
                                  <div>{number}</div>
                                </>
                              )}
                            </div>
                          );
                        }),
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="flex justify-center space-x-3">
                      <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                        🏆 Call CoinKrazy BINGO!
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setBingoCard(generateBingoCard())}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        New CoinKrazy Ticket
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🖊️ Using CoinKrazy.com Premium Digital Dobber • Official
                      Licensed Ticket
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Info with CoinKrazy Branding */}
            <div className="space-y-6">
              {/* CoinKrazy Ball Wheel */}
              <Card className="casino-glow border-accent">
                <CardHeader className="bg-gradient-to-r from-accent/20 to-primary/20">
                  <CardTitle className="text-center text-accent flex items-center justify-center">
                    🎱 CoinKrazy Ball Wheel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {currentNumber ? (
                      <div
                        className={`relative ${ballAnimation ? "animate-bounce" : ""}`}
                      >
                        <div className="text-6xl font-bold text-primary mb-2 casino-pulse">
                          {currentNumber}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          🎱 CoinKrazy.com Official Ball
                        </div>
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg border-2 border-yellow-300">
                          <div className="text-center">
                            <div className="text-[8px]">CoinKrazy</div>
                            <div>{currentNumber}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl text-muted-foreground mb-4">
                        🎱 CoinKrazy Wheel Ready...
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm">
                      📊 CoinKrazy Numbers Called: {calledNumbers.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CoinKrazy Caller Studio */}
              <Card className="casino-glow border-green-500">
                <CardHeader className="bg-gradient-to-r from-green-500/20 to-blue-500/20">
                  <CardTitle className="text-center flex items-center justify-center">
                    🎤 CoinKrazy Caller Studio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Mic className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">LIVE</div>
                      </div>
                    </div>
                    <h3 className="font-bold text-primary">
                      {selectedRoomData.caller}
                    </h3>
                    <Badge className="bg-green-600 text-white">
                      <Radio className="w-3 h-3 mr-1" />
                      🔴 Broadcasting Live from CoinKrazy Studios
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      📡 Professional CoinKrazy.com Certified Caller
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CoinKrazy Called Numbers */}
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="text-center">
                    📋 CoinKrazy Called Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {calledNumbers.map((number, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-secondary to-secondary/80 text-center py-2 rounded text-sm font-bold border border-border shadow-sm"
                        >
                          <div className="text-[8px] text-muted-foreground">
                            CK
                          </div>
                          <div>{number}</div>
                        </div>
                      ))}
                    </div>
                    {calledNumbers.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        🎱 No CoinKrazy balls called yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Game Controls */}
              <Card className="casino-glow">
                <CardHeader>
                  <CardTitle className="text-center">
                    🎮 CoinKrazy Game Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    onClick={startGame}
                    disabled={gameInProgress}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {gameInProgress
                      ? "CoinKrazy Game In Progress..."
                      : "🎱 Start CoinKrazy Demo"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Volume2 className="w-4 h-4 mr-1" />
                      CK Audio
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-1" />
                      CK Chat
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    ⏰ Next CoinKrazy Game: {formatTime(timeToNext)}
                  </div>
                </CardContent>
              </Card>

              {/* CoinKrazy Jackpot Info */}
              <Card className="casino-glow border-yellow-500">
                <CardHeader className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                  <CardTitle className="text-center text-primary">
                    🏆 CoinKrazy Jackpot Prize
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      CoinKrazy.com Official Prize
                    </div>
                    <div
                      className={`text-3xl font-bold mb-2 ${selectedRoomData.currency === "SC" ? "text-green-500" : "text-accent"}`}
                    >
                      {selectedRoomData.currency === "SC"
                        ? `${selectedRoomData.jackpot} SC`
                        : `${selectedRoomData.jackpot.toLocaleString()} GC`}
                    </div>
                    <Badge
                      className={`mb-2 ${selectedRoomData.currency === "SC" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}`}
                    >
                      {selectedRoomData.currency === "SC"
                        ? "💰 CoinKrazy Sweeps Coins"
                        : "🪙 CoinKrazy Gold Coins"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-2">
                      🎯 CoinKrazy Pattern: {selectedRoomData.pattern}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      👥 {selectedRoomData.players} CoinKrazy players competing
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      🪑 Playing at: {selectedRoomData.table}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CasinoHeader />

      <div className="container mx-auto px-4 py-8">
        {/* CoinKrazy Bingo Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            <Star className="w-10 h-10 mr-3 text-primary" />
            🏆 CoinKrazy Bingo Hall
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            🎤 Live CoinKrazy.com callers • 🏆 Real CoinKrazy prizes • 🎊
            CoinKrazy community fun!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-destructive text-white px-4 py-2 animate-pulse">
              <Timer className="w-4 h-4 mr-2" />
              🔴 3 COINKRIZY ROOMS LIVE
            </Badge>
            <Badge className="bg-primary text-primary-foreground px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              265 CoinKrazy Players Online
            </Badge>
            <Badge className="bg-accent text-accent-foreground px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              $1,020 in CoinKrazy Prizes
            </Badge>
          </div>
        </div>

        {/* CoinKrazy Next Game Timer */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary casino-glow">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  🎯 Next CoinKrazy Game Starting Soon!
                </h2>
                <div className="text-4xl font-bold text-accent mb-2">
                  {formatTime(timeToNext)}
                </div>
                <p className="text-muted-foreground">
                  🎪 Join a CoinKrazy room now to secure your branded table
                  seat!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CoinKrazy Bingo Rooms */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {bingoRooms.map((room) => (
            <Card
              key={room.id}
              className="casino-glow hover:scale-105 transition-all duration-300 cursor-pointer border-primary"
              onClick={() => joinRoom(room.id)}
            >
              <CardHeader className="text-center bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="text-5xl mb-2 animate-float">{room.emoji}</div>
                <CardTitle className="text-xl text-primary">
                  {room.name}
                </CardTitle>
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-1">
                  <Badge
                    className={`${
                      room.status === "active"
                        ? "bg-destructive text-white animate-pulse"
                        : "bg-yellow-500 text-white"
                    }`}
                  >
                    {room.status === "active"
                      ? "🔴 LIVE @ CoinKrazy"
                      : "⏳ WAITING @ CoinKrazy"}
                  </Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    🎤 {room.caller}
                  </Badge>
                  <Badge
                    className={`${room.currency === "SC" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"} font-bold`}
                  >
                    {room.currency === "SC"
                      ? "💰 CoinKrazy SC ROOM"
                      : "🪙 CoinKrazy GC ROOM"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center text-sm text-muted-foreground border-b pb-2">
                    🪑 Table: {room.table}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CoinKrazy Players:</span>
                    <span className="font-bold">
                      {room.players}/{room.maxPlayers}
                    </span>
                  </div>
                  <Progress
                    value={(room.players / room.maxPlayers) * 100}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">CK Jackpot:</span>
                      <div
                        className={`font-bold ${room.currency === "SC" ? "text-green-500" : "text-accent"}`}
                      >
                        {room.currency === "SC"
                          ? `${room.jackpot} SC`
                          : `${room.jackpot.toLocaleString()} GC`}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CK Ticket:</span>
                      <div
                        className={`font-bold ${room.currency === "SC" ? "text-green-500" : "text-accent"}`}
                      >
                        {room.currency === "SC"
                          ? `${room.ticketPrice} SC`
                          : `${room.ticketPrice} GC`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">CK Type:</span>
                      <div className="font-bold">{room.gameType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CK Pattern:</span>
                      <div className="font-bold text-xs">{room.pattern}</div>
                    </div>
                  </div>
                  {room.status === "active" ? (
                    <div className="text-center text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      <span className="text-destructive font-bold">
                        {room.timeRemaining} min remaining
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-sm">
                      <Timer className="w-4 h-4 inline mr-1" />
                      <span className="text-muted-foreground">
                        Next CoinKrazy game: {room.timeRemaining} min
                      </span>
                    </div>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 casino-pulse"
                    onClick={() => joinRoom(room.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    🪑 Join CoinKrazy Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CoinKrazy How to Play */}
        <div className="mb-8">
          <Card className="casino-glow border-primary">
            <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20">
              <CardTitle className="text-center flex items-center justify-center text-primary">
                <Star className="w-6 h-6 mr-2" />
                📋 How to Play CoinKrazy Bingo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎫</div>
                  <h3 className="font-semibold mb-2">Buy CoinKrazy Tickets</h3>
                  <p className="text-sm text-muted-foreground">
                    Purchase official CoinKrazy.com branded bingo tickets with
                    Gold Coins or Sweeps Coins
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎤</div>
                  <h3 className="font-semibold mb-2">CoinKrazy Live Caller</h3>
                  <p className="text-sm text-muted-foreground">
                    Numbers are called by certified CoinKrazy.com professional
                    callers from our studios
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🖊️</div>
                  <h3 className="font-semibold mb-2">
                    CoinKrazy Digital Dobber
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use your premium CoinKrazy.com digital dobber to mark
                    numbers on your branded ticket
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="font-semibold mb-2">Win CoinKrazy Prizes</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete CoinKrazy patterns to win official Sweepstakes Cash
                    prizes!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CoinKrazy Bingo Patterns */}
        <div className="mb-8">
          <Card className="casino-glow border-accent">
            <CardHeader className="bg-gradient-to-r from-accent/20 to-primary/20">
              <CardTitle className="text-center text-accent">
                🎨 CoinKrazy Winning Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-3xl mb-2">📏</div>
                  <h4 className="font-semibold">CoinKrazy Line</h4>
                  <p className="text-xs text-muted-foreground">
                    Any horizontal CoinKrazy line
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔲</div>
                  <h4 className="font-semibold">CoinKrazy Corners</h4>
                  <p className="text-xs text-muted-foreground">
                    All four CoinKrazy corners
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">❌</div>
                  <h4 className="font-semibold">CoinKrazy X Pattern</h4>
                  <p className="text-xs text-muted-foreground">
                    Both CoinKrazy diagonals
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">⬛</div>
                  <h4 className="font-semibold">CoinKrazy Blackout</h4>
                  <p className="text-xs text-muted-foreground">
                    Entire CoinKrazy card
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🏠</div>
                  <h4 className="font-semibold">CoinKrazy Full House</h4>
                  <p className="text-xs text-muted-foreground">
                    All CoinKrazy numbers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CoinKrazy Equipment Showcase */}
        <div className="mb-8">
          <Card className="casino-glow border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-500/20 to-blue-500/20">
              <CardTitle className="text-center text-primary">
                🎯 Official CoinKrazy.com Gaming Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-3">🎱</div>
                  <h4 className="font-semibold">CoinKrazy Balls</h4>
                  <p className="text-xs text-muted-foreground">
                    Every ball branded with CoinKrazy.com logo for authenticity
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🖊️</div>
                  <h4 className="font-semibold">CoinKrazy Dobbers</h4>
                  <p className="text-xs text-muted-foreground">
                    Premium digital CoinKrazy.com dobbers for precise marking
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🪑</div>
                  <h4 className="font-semibold">CoinKrazy Tables</h4>
                  <p className="text-xs text-muted-foreground">
                    Luxury CoinKrazy.com branded tables with premium comfort
                  </p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🎫</div>
                  <h4 className="font-semibold">CoinKrazy Tickets</h4>
                  <p className="text-xs text-muted-foreground">
                    Official CoinKrazy.com licensed tickets with unique serial
                    numbers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsible Gaming */}
        <div className="text-center">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              🎲 Play responsibly at CoinKrazy.com • 🔞 18+ Only • 🏆 Fair play
              certified • 🎊 Official CoinKrazy community gaming
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
