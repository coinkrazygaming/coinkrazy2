import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  RotateCcw,
  Home,
  Trophy,
  Star,
  Zap,
  Crown,
} from "lucide-react";

interface GameState {
  score: number;
  shots: number;
  timeLeft: number;
  gameActive: boolean;
  gameStarted: boolean;
  basketPosition: { x: number; y: number };
  balls: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
  }>;
}

export default function ColinShots({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    shots: 0,
    timeLeft: 60,
    gameActive: false,
    gameStarted: false,
    basketPosition: { x: 400, y: 100 },
    balls: [],
  });

  const [loading, setLoading] = useState(false);
  const [powerMeter, setPowerMeter] = useState(0);
  const [angle, setAngle] = useState(45);
  const [isPowering, setIsPowering] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const BASKET_WIDTH = 80;
  const BASKET_HEIGHT = 60;
  const BALL_RADIUS = 15;

  useEffect(() => {
    if (gameState.gameActive && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.gameActive && gameState.timeLeft === 0) {
      endGame();
    }
  }, [gameState.timeLeft, gameState.gameActive]);

  useEffect(() => {
    if (gameState.gameActive) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.gameActive]);

  const startGame = () => {
    setGameState({
      score: 0,
      shots: 0,
      timeLeft: 60,
      gameActive: true,
      gameStarted: true,
      basketPosition: {
        x: Math.random() * (CANVAS_WIDTH - BASKET_WIDTH),
        y: 100,
      },
      balls: [],
    });
  };

  const endGame = async () => {
    setGameState((prev) => ({ ...prev, gameActive: false }));

    // Calculate SC reward based on score
    const scReward = Math.floor(gameState.score / 10) * 0.1;

    if (scReward > 0) {
      toast({
        title: "Game Complete! 🏀",
        description: `Great shooting! You earned ${scReward} SC for your performance!`,
      });
    } else {
      toast({
        title: "Game Complete! 🏀",
        description:
          "Keep practicing your shots! Try again in 24 hours for more SC rewards.",
      });
    }
  };

  const shoot = () => {
    if (!gameState.gameActive || isPowering) return;

    const power = powerMeter / 100;
    const radianAngle = (angle * Math.PI) / 180;

    const newBall = {
      id: Date.now(),
      x: 100,
      y: CANVAS_HEIGHT - 50,
      vx: Math.cos(radianAngle) * power * 20,
      vy: -Math.sin(radianAngle) * power * 20,
      active: true,
    };

    setGameState((prev) => ({
      ...prev,
      shots: prev.shots + 1,
      balls: [...prev.balls, newBall],
    }));

    setPowerMeter(0);
  };

  const handlePowerUp = () => {
    if (isPowering) return;

    setIsPowering(true);
    setPowerMeter(0);

    const powerInterval = setInterval(() => {
      setPowerMeter((prev) => {
        if (prev >= 100) {
          clearInterval(powerInterval);
          setIsPowering(false);
          shoot();
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Auto-shoot at max power if held too long
    setTimeout(() => {
      clearInterval(powerInterval);
      setIsPowering(false);
      if (powerMeter > 0) shoot();
    }, 2500);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#E0F6FF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw court
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    // Draw basket
    ctx.fillStyle = "#FF6B35";
    ctx.fillRect(
      gameState.basketPosition.x,
      gameState.basketPosition.y,
      BASKET_WIDTH,
      20,
    );

    // Draw basket rim
    ctx.strokeStyle = "#D2001C";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      gameState.basketPosition.x + BASKET_WIDTH / 2,
      gameState.basketPosition.y + 10,
      BASKET_WIDTH / 2,
      0,
      Math.PI,
    );
    ctx.stroke();

    // Draw shooter position
    ctx.fillStyle = "#4A90E2";
    ctx.beginPath();
    ctx.arc(100, CANVAS_HEIGHT - 50, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw power meter line
    if (isPowering || powerMeter > 0) {
      const radianAngle = (angle * Math.PI) / 180;
      const lineLength = (powerMeter / 100) * 150;

      ctx.strokeStyle =
        powerMeter > 80 ? "#FF4444" : powerMeter > 50 ? "#FFD700" : "#44FF44";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(100, CANVAS_HEIGHT - 50);
      ctx.lineTo(
        100 + Math.cos(radianAngle) * lineLength,
        CANVAS_HEIGHT - 50 - Math.sin(radianAngle) * lineLength,
      );
      ctx.stroke();
    }

    // Update and draw balls
    setGameState((prev) => ({
      ...prev,
      balls: prev.balls
        .map((ball) => {
          if (!ball.active) return ball;

          // Update position
          ball.x += ball.vx;
          ball.y += ball.vy;
          ball.vy += 0.5; // gravity

          // Check basket collision
          if (
            ball.x > gameState.basketPosition.x - BALL_RADIUS &&
            ball.x < gameState.basketPosition.x + BASKET_WIDTH + BALL_RADIUS &&
            ball.y > gameState.basketPosition.y - BALL_RADIUS &&
            ball.y < gameState.basketPosition.y + BASKET_HEIGHT + BALL_RADIUS
          ) {
            // Score!
            prev.score += 10;
            ball.active = false;

            // Move basket to new position
            prev.basketPosition = {
              x: Math.random() * (CANVAS_WIDTH - BASKET_WIDTH),
              y: 100 + Math.random() * 100,
            };
          }

          // Remove ball if out of bounds
          if (
            ball.x < -50 ||
            ball.x > CANVAS_WIDTH + 50 ||
            ball.y > CANVAS_HEIGHT + 50
          ) {
            ball.active = false;
          }

          // Draw ball
          if (ball.active) {
            ctx.fillStyle = "#FF8C00";
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();

            // Basketball lines
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
            ctx.moveTo(ball.x - BALL_RADIUS, ball.y);
            ctx.lineTo(ball.x + BALL_RADIUS, ball.y);
            ctx.moveTo(ball.x, ball.y - BALL_RADIUS);
            ctx.lineTo(ball.x, ball.y + BALL_RADIUS);
            ctx.stroke();
          }

          return ball;
        })
        .filter((ball) => ball.active),
    }));

    if (gameState.gameActive) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Colin Shots 🏀
                </h1>
                <p className="text-muted-foreground">
                  Shoot hoops and earn SC! • CoinKrazy.com Exclusive
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <Home className="w-4 h-4 mr-2" />
              Return to Lobby
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="p-6 bg-secondary/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">
                  {gameState.score}
                </p>
                <p className="text-sm text-muted-foreground">Score</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold text-accent">
                  {gameState.shots}
                </p>
                <p className="text-sm text-muted-foreground">Shots</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Zap className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-500">
                  {gameState.timeLeft}s
                </p>
                <p className="text-sm text-muted-foreground">Time Left</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">
                  {gameState.shots > 0
                    ? Math.round((gameState.score / 10 / gameState.shots) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Crown className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold text-accent">
                  {Math.floor(gameState.score / 10) * 0.1}
                </p>
                <p className="text-sm text-muted-foreground">SC Earned</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Area */}
        <div className="p-6">
          {!gameState.gameStarted ? (
            <div className="text-center py-12">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Colin Shots Basketball Challenge!
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Test your basketball skills! Aim carefully and shoot hoops to
                earn Sweep Coins. Each successful shot scores 10 points. Get 100
                points to earn 1 SC!
              </p>
              <div className="bg-primary/10 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-2">How to Play:</h3>
                <ul className="text-sm text-left space-y-1">
                  <li>• Click and hold to charge your shot power</li>
                  <li>• Adjust angle with the slider</li>
                  <li>• Release to shoot the basketball</li>
                  <li>• Hit the moving basket to score</li>
                  <li>• Earn SC based on your total score!</li>
                </ul>
              </div>
              <Button
                onClick={startGame}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                disabled={loading}
              >
                {loading ? "Starting..." : "Start Game 🏀"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Game Canvas */}
              <div className="flex justify-center">
                <div className="relative border-4 border-primary rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block bg-gradient-to-b from-blue-200 to-blue-400"
                  />

                  {/* Game overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      Score: {gameState.score}
                    </Badge>
                    <Badge className="bg-destructive text-destructive-foreground text-lg px-3 py-1">
                      Time: {gameState.timeLeft}s
                    </Badge>
                  </div>

                  {/* CoinKrazy.com Watermark */}
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-black/70 text-white text-sm">
                      CoinKrazy.com
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              {gameState.gameActive && (
                <div className="flex justify-center space-x-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shot Angle: {angle}°
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="75"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-48"
                        disabled={isPowering}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Power: {powerMeter}%
                      </label>
                      <Progress value={powerMeter} className="w-48 h-3" />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      onMouseDown={handlePowerUp}
                      onTouchStart={handlePowerUp}
                      disabled={isPowering}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isPowering ? "Charging..." : "🏀 Shoot!"}
                    </Button>
                    <Button
                      onClick={() =>
                        setGameState((prev) => ({
                          ...prev,
                          gameActive: false,
                          gameStarted: false,
                        }))
                      }
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/30 text-center">
          <p className="text-sm text-muted-foreground">
            🏀 Colin Shots - Exclusive CoinKrazy.com Mini Game • Play daily to
            earn free SC! 🎯
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Game resets every 24 hours • Responsible gaming • 18+ only
          </p>
        </div>
      </div>
    </div>
  );
}
