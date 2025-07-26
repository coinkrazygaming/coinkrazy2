import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniGameEngine, MINI_GAMES } from "@/lib/miniGameEngine";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/contexts/BalanceContext";
import {
  Trophy,
  Clock,
  DollarSign,
  Target,
  Car,
  Shield,
  Zap,
} from "lucide-react";

interface Car {
  id: number;
  x: number;
  y: number;
  type: "player" | "steal" | "police";
  speed: number;
  direction: number;
  color: string;
  stolen?: boolean;
  active: boolean;
}

interface Player {
  x: number;
  y: number;
  hasStolen: boolean;
  onFoot: boolean;
  stolenCarId?: number;
  arrested: boolean;
}

const CAR_TYPES = {
  sedan: { speed: 2, value: 0.02 },
  sports: { speed: 3, value: 0.04 },
  luxury: { speed: 2.5, value: 0.06 },
};

const CAR_COLORS = [
  "#FF0000",
  "#0000FF",
  "#FFFF00",
  "#FF8000",
  "#800080",
  "#008000",
];

export default function GTAGame() {
  const { user } = useAuth();
  const { updateBalance } = useBalance();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "finished"
  >("waiting");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [carsStolen, setCarsStolen] = useState(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    hasStolen: false,
    onFoot: true,
    arrested: false,
  });
  const [canPlay, setCanPlay] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [gameResult, setGameResult] = useState<{
    scEarned: number;
    message: string;
  } | null>(null);
  const [wantedLevel, setWantedLevel] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const TOTAL_CARS = 15;
  const POLICE_CARS = 3;

  // Initialize cars and police
  const initializeGame = useCallback(() => {
    const newCars: Car[] = [];

    // Add steal-able cars
    for (let i = 0; i < TOTAL_CARS; i++) {
      const types = Object.keys(CAR_TYPES) as Array<keyof typeof CAR_TYPES>;
      const type = types[Math.floor(Math.random() * types.length)];

      newCars.push({
        id: i,
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 60) + 30,
        type: "steal",
        speed: CAR_TYPES[type].speed,
        direction: Math.random() * Math.PI * 2,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        stolen: false,
        active: true,
      });
    }

    // Add police cars
    for (let i = 0; i < POLICE_CARS; i++) {
      newCars.push({
        id: TOTAL_CARS + i,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        type: "police",
        speed: 3,
        direction: 0,
        color: "#000000",
        active: true,
      });
    }

    setCars(newCars);
    setPlayer({
      x: 400,
      y: 300,
      hasStolen: false,
      onFoot: true,
      arrested: false,
    });
    setWantedLevel(0);
  }, []);

  // Check if user can play
  useEffect(() => {
    if (!user) return;

    const checkPlayStatus = async () => {
      const status = await MiniGameEngine.canPlayGame(
        "gtaV1",
        user.id.toString(),
      );
      setCanPlay(status.canPlay);
      if (!status.canPlay && status.timeUntilNext) {
        setCooldownTime(status.timeUntilNext);
      }
    };

    checkPlayStatus();
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setCanPlay(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  // Game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "playing" && timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing" || player.arrested) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const speed = player.onFoot ? 3 : 5;

      setPlayer((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (e.key.toLowerCase()) {
          case "w":
          case "arrowup":
            newY = Math.max(0, prev.y - speed);
            break;
          case "s":
          case "arrowdown":
            newY = Math.min(CANVAS_HEIGHT - 20, prev.y + speed);
            break;
          case "a":
          case "arrowleft":
            newX = Math.max(0, prev.x - speed);
            break;
          case "d":
          case "arrowright":
            newX = Math.min(CANVAS_WIDTH - 20, prev.x + speed);
            break;
          case " ":
          case "e":
            // Try to steal car
            if (prev.onFoot) {
              const nearCar = cars.find(
                (car) =>
                  car.type === "steal" &&
                  !car.stolen &&
                  car.active &&
                  Math.abs(car.x - prev.x) < 40 &&
                  Math.abs(car.y - prev.y) < 40,
              );

              if (nearCar) {
                setCars((prevCars) =>
                  prevCars.map((car) =>
                    car.id === nearCar.id
                      ? { ...car, stolen: true, active: false }
                      : car,
                  ),
                );
                setCarsStolen((prevStolen) => prevStolen + 1);
                setScore((prevScore) => prevScore + 10);
                setWantedLevel((prevLevel) => Math.min(5, prevLevel + 1));

                return {
                  ...prev,
                  hasStolen: true,
                  onFoot: false,
                  stolenCarId: nearCar.id,
                };
              }
            }
            break;
        }

        return { ...prev, x: newX, y: newY };
      });
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [gameState, cars, player.arrested, player.onFoot]);

  // Game loop for police AI
  useEffect(() => {
    if (gameState !== "playing" || player.arrested) return;

    const gameLoop = () => {
      // Move police cars toward player if wanted level > 0
      if (wantedLevel > 0) {
        setCars((prevCars) =>
          prevCars.map((car) => {
            if (car.type !== "police") return car;

            // Police chase player
            const dx = player.x - car.x;
            const dy = player.y - car.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
              // Player caught!
              setPlayer((prev) => ({ ...prev, arrested: true }));
              return car;
            }

            const moveX = (dx / distance) * car.speed;
            const moveY = (dy / distance) * car.speed;

            return {
              ...car,
              x: Math.max(0, Math.min(CANVAS_WIDTH - 40, car.x + moveX)),
              y: Math.max(0, Math.min(CANVAS_HEIGHT - 40, car.y + moveY)),
            };
          }),
        );
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, player, wantedLevel]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with city background
    ctx.fillStyle = "#404040"; // Dark gray street
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw street lines
    ctx.strokeStyle = "#FFFF00"; // Yellow lines
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    // Horizontal lines
    for (let y = 100; y < CANVAS_HEIGHT; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let x = 100; x < CANVAS_WIDTH; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw cars
    cars.forEach((car) => {
      if (!car.active) return;

      ctx.fillStyle = car.color;

      if (car.type === "police") {
        // Police car (black with red/blue lights)
        ctx.fillRect(car.x, car.y, 40, 20);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(car.x + 5, car.y - 3, 8, 3);
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(car.x + 27, car.y - 3, 8, 3);

        // Badge
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.fillText("POLICE", car.x + 2, car.y + 35);
      } else {
        // Regular car
        ctx.fillRect(car.x, car.y, 35, 18);
        ctx.fillStyle = "#000000";
        ctx.fillRect(car.x + 3, car.y + 3, 29, 12); // Windows
      }
    });

    // Draw player
    if (!player.arrested) {
      if (player.onFoot) {
        // Player on foot
        ctx.fillStyle = "#FFDBAC"; // Skin color
        ctx.fillRect(player.x, player.y, 8, 12);
        ctx.fillStyle = "#0000FF"; // Blue shirt
        ctx.fillRect(player.x + 1, player.y + 4, 6, 8);
      } else {
        // Player in stolen car
        const stolenCar = cars.find((car) => car.id === player.stolenCarId);
        if (stolenCar) {
          ctx.fillStyle = stolenCar.color;
          ctx.fillRect(player.x, player.y, 35, 18);
          ctx.fillStyle = "#FF0000"; // Red tint for stolen
          ctx.fillRect(player.x, player.y, 35, 18);
        }
      }
    } else {
      // Player arrested
      ctx.fillStyle = "#FF0000";
      ctx.font = "bold 20px Arial";
      ctx.fillText("BUSTED!", player.x - 30, player.y - 10);
    }

    // Draw CoinKrazy.com branding
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 16px Arial";
    ctx.fillText("CoinKrazy.com", 10, 30);

    // Game UI
    if (gameState === "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(10, CANVAS_HEIGHT - 100, 200, 90);

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 14px Arial";
      ctx.fillText(`Time: ${timeLeft}s`, 20, CANVAS_HEIGHT - 75);
      ctx.fillText(`Cars Stolen: ${carsStolen}`, 20, CANVAS_HEIGHT - 55);
      ctx.fillText(`Score: ${score}`, 20, CANVAS_HEIGHT - 35);

      // Wanted level
      ctx.fillStyle = "#FF0000";
      ctx.fillText(
        `Wanted: ${"★".repeat(wantedLevel)}`,
        20,
        CANVAS_HEIGHT - 15,
      );
    }

    // Controls
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(CANVAS_WIDTH - 150, 10, 140, 80);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.fillText("WASD - Move", CANVAS_WIDTH - 140, 30);
    ctx.fillText("SPACE - Steal Car", CANVAS_WIDTH - 140, 45);
    ctx.fillText("Avoid Police!", CANVAS_WIDTH - 140, 60);
    ctx.fillText(`Escape to Win`, CANVAS_WIDTH - 140, 75);
  }, [cars, player, gameState, timeLeft, carsStolen, score, wantedLevel]);

  const startGame = async () => {
    if (!canPlay) return;

    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    setCarsStolen(0);
    setGameResult(null);
    initializeGame();
  };

  const endGame = async () => {
    setGameState("finished");
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    if (!user) return;

    // Calculate reward (reduced if arrested)
    let finalScore = carsStolen * 10;
    if (player.arrested) {
      finalScore = Math.max(0, finalScore - 50); // Penalty for getting arrested
    }

    const scEarned = Math.min(0.25, finalScore * 0.01); // Max 0.25 SC

    // Record result
    const result = await MiniGameEngine.recordGameResult({
      gameId: "gtaV1",
      userId: user.id.toString(),
      score: finalScore,
      scEarned,
      duration: 60,
    });

    if (result.success) {
      const message = player.arrested
        ? `You got busted! But you still earned ${scEarned.toFixed(2)} SC from the cars you stole. Try to avoid the police next time!`
        : `Congrats! You escaped with ${carsStolen} stolen cars and earned ${scEarned.toFixed(2)} SC. Remember 1 SC = $1 but we do not cash out until $100.00 MIN WITHDRAW and subject to sweepstake laws! Come back tomorrow for another heist!`;

      setGameResult({
        scEarned,
        message,
      });

      // Update user balance in real-time
      if (result.newBalance) {
        updateBalance({
          sc: result.newBalance.sc,
          gc: result.newBalance.gc,
        });
      }
    }

    // Set cooldown
    setCanPlay(false);
    setCooldownTime(24 * 60 * 60); // 24 hours
  };

  const config = MINI_GAMES.gtaV1;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 via-red-900 to-black text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Car className="h-8 w-8 text-red-400" />
          {config.name}
          <Badge variant="secondary" className="ml-auto">
            CoinKrazy.com
          </Badge>
        </CardTitle>
        <p className="text-red-200">{config.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{carsStolen}</div>
            <div className="text-sm text-gray-300">Cars Stolen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {timeLeft}s
            </div>
            <div className="text-sm text-gray-300">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-sm text-gray-300">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {"★".repeat(wantedLevel)}
            </div>
            <div className="text-sm text-gray-300">Wanted Level</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-red-400 rounded-lg bg-gray-800"
          />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          {canPlay && gameState === "waiting" && (
            <Button
              onClick={startGame}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
            >
              <Car className="mr-2 h-5 w-5" />
              Start Heist!
            </Button>
          )}

          {!canPlay && (
            <div className="text-center">
              <div className="text-lg font-semibold text-red-400 mb-2">
                <Clock className="inline mr-2 h-5 w-5" />
                Next Heist Available In:
              </div>
              <div className="text-2xl font-bold text-white">
                {MiniGameEngine.formatTimeRemaining(cooldownTime)}
              </div>
            </div>
          )}
        </div>

        {/* Game Result */}
        {gameResult && (
          <div className="mt-6 p-4 bg-red-800 border border-red-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">
                +{gameResult.scEarned.toFixed(2)} SC Earned!
              </span>
            </div>
            <p className="text-sm text-red-200">{gameResult.message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
          <h3 className="font-semibold text-yellow-400 mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use WASD or arrow keys to move around the city</li>
            <li>• Get close to cars and press SPACE to steal them</li>
            <li>• Avoid the police - they'll chase you when wanted!</li>
            <li>• Each stolen car increases your wanted level</li>
            <li>• Survive 60 seconds to win max SC rewards!</li>
            <li>• Getting arrested reduces your final payout</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
