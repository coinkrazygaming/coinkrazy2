import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MiniGameEngine, MINI_GAMES } from '@/lib/miniGameEngine';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Clock, DollarSign, Target } from 'lucide-react';

interface Dog {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  type: 'small' | 'medium' | 'large';
  color: string;
  caught: boolean;
}

interface Van {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DOG_TYPES = {
  small: { speed: 3, size: 20, points: 1 },
  medium: { speed: 2, size: 25, points: 1 },
  large: { speed: 1.5, size: 30, points: 1 },
};

const DOG_COLORS = ['#8B4513', '#D2691E', '#000000', '#FFFFFF', '#FFD700', '#FF6347'];

export default function DogCatcherGame() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [dogsCaught, setDogsCaught] = useState(0);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [van, setVan] = useState<Van>({ x: 400, y: 300, width: 80, height: 50 });
  const [canPlay, setCanPlay] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [gameResult, setGameResult] = useState<{ scEarned: number; message: string } | null>(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const TOTAL_DOGS = 100;

  // Initialize dogs
  const initializeDogs = useCallback(() => {
    const newDogs: Dog[] = [];
    for (let i = 0; i < TOTAL_DOGS; i++) {
      const types = Object.keys(DOG_TYPES) as Array<keyof typeof DOG_TYPES>;
      const type = types[Math.floor(Math.random() * types.length)];
      
      newDogs.push({
        id: i,
        x: Math.random() * (CANVAS_WIDTH - 40) + 20,
        y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
        speed: DOG_TYPES[type].speed + Math.random() * 0.5,
        direction: Math.random() * Math.PI * 2,
        type,
        color: DOG_COLORS[Math.floor(Math.random() * DOG_COLORS.length)],
        caught: false,
      });
    }
    setDogs(newDogs);
  }, []);

  // Check if user can play
  useEffect(() => {
    if (!user) return;

    const checkPlayStatus = async () => {
      const status = await MiniGameEngine.canPlayGame('dogCatcher', user.id.toString());
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
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  // Mouse movement for van
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setVan(prev => ({
        ...prev,
        x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, x - prev.width / 2)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - prev.height, y - prev.height / 2)),
      }));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setDogs(prevDogs => 
        prevDogs.map(dog => {
          if (dog.caught) return dog;

          // Move dog
          let newX = dog.x + Math.cos(dog.direction) * dog.speed;
          let newY = dog.y + Math.sin(dog.direction) * dog.speed;
          let newDirection = dog.direction;

          // Bounce off walls
          if (newX <= 0 || newX >= CANVAS_WIDTH - DOG_TYPES[dog.type].size) {
            newDirection = Math.PI - dog.direction;
            newX = Math.max(0, Math.min(CANVAS_WIDTH - DOG_TYPES[dog.type].size, newX));
          }
          if (newY <= 0 || newY >= CANVAS_HEIGHT - DOG_TYPES[dog.type].size) {
            newDirection = -dog.direction;
            newY = Math.max(0, Math.min(CANVAS_HEIGHT - DOG_TYPES[dog.type].size, newY));
          }

          // Check collision with van
          const dogSize = DOG_TYPES[dog.type].size;
          if (
            newX < van.x + van.width &&
            newX + dogSize > van.x &&
            newY < van.y + van.height &&
            newY + dogSize > van.y
          ) {
            // Dog caught!
            setDogsCaught(prev => prev + 1);
            setScore(prev => prev + DOG_TYPES[dog.type].points);
            return { ...dog, caught: true };
          }

          return {
            ...dog,
            x: newX,
            y: newY,
            direction: newDirection,
          };
        })
      );

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, van]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grass
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

    // Draw dogs
    dogs.forEach(dog => {
      if (dog.caught) return;

      const size = DOG_TYPES[dog.type].size;
      ctx.fillStyle = dog.color;
      ctx.beginPath();
      ctx.ellipse(dog.x + size/2, dog.y + size/2, size/2, size/3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw tail
      ctx.strokeStyle = dog.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dog.x, dog.y + size/2);
      ctx.lineTo(dog.x - 10, dog.y + size/2 - 5);
      ctx.stroke();
    });

    // Draw van
    ctx.fillStyle = '#4169E1'; // Blue van
    ctx.fillRect(van.x, van.y, van.width, van.height);
    
    // Van details
    ctx.fillStyle = '#000';
    ctx.fillRect(van.x + 5, van.y + 5, 15, 10); // Window
    ctx.fillRect(van.x + van.width - 20, van.y + 5, 15, 10); // Window
    
    // Hand with cage hanging out
    ctx.fillStyle = '#FFDBAC'; // Skin color
    ctx.fillRect(van.x + van.width, van.y + 15, 15, 8); // Hand
    
    // Cage
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(van.x + van.width + 10, van.y + 25, 20, 15);
    ctx.strokeRect(van.x + van.width + 12, van.y + 27, 16, 11); // Inner cage

    // Draw CoinKrazy.com branding
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('CoinKrazy.com', 10, 30);

    // Game UI
    if (gameState === 'playing') {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(10, CANVAS_HEIGHT - 80, 200, 70);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Time: ${timeLeft}s`, 20, CANVAS_HEIGHT - 55);
      ctx.fillText(`Dogs Caught: ${dogsCaught}`, 20, CANVAS_HEIGHT - 35);
      ctx.fillText(`Score: ${score}`, 20, CANVAS_HEIGHT - 15);
    }
  }, [dogs, van, gameState, timeLeft, dogsCaught, score]);

  const startGame = async () => {
    if (!canPlay) return;

    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setDogsCaught(0);
    setGameResult(null);
    initializeDogs();
  };

  const endGame = async () => {
    setGameState('finished');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    if (!user) return;

    // Calculate reward
    const dogsEscaped = TOTAL_DOGS - dogsCaught;
    const scEarned = MiniGameEngine.calculateReward('dogCatcher', dogsCaught, dogsEscaped);

    // Record result
    const result = await MiniGameEngine.recordGameResult({
      gameId: 'dogCatcher',
      userId: user.id.toString(),
      score: dogsCaught,
      scEarned,
      duration: 60,
    });

    if (result.success) {
      setGameResult({
        scEarned,
        message: `Congrats on the win! We are crediting your account now! You caught ${dogsCaught} dogs and earned ${scEarned.toFixed(2)} SC. Remember 1 SC = $1 but we do not cash out until $100.00 MIN WITHDRAW and subject to sweepstake laws! Come back tomorrow for another chance to win free SC catching dogs!`,
      });
      
      // Update user balance in context if available
      if (result.newBalance) {
        // This would trigger a balance update
        console.log('New balance:', result.newBalance);
      }
    }

    // Set cooldown
    setCanPlay(false);
    setCooldownTime(24 * 60 * 60); // 24 hours
  };

  const config = MINI_GAMES.dogCatcher;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Target className="h-8 w-8 text-yellow-400" />
          {config.name}
          <Badge variant="secondary" className="ml-auto">
            CoinKrazy.com
          </Badge>
        </CardTitle>
        <p className="text-blue-200">{config.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{dogsCaught}</div>
            <div className="text-sm text-blue-200">Dogs Caught</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{timeLeft}s</div>
            <div className="text-sm text-blue-200">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score}</div>
            <div className="text-sm text-blue-200">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">0.01 SC</div>
            <div className="text-sm text-blue-200">Per Dog</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-yellow-400 rounded-lg bg-sky-200 cursor-none"
            style={{ cursor: gameState === 'playing' ? 'none' : 'default' }}
          />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          {canPlay && gameState === 'waiting' && (
            <Button
              onClick={startGame}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Start Catching Dogs!
            </Button>
          )}

          {!canPlay && (
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-400 mb-2">
                <Clock className="inline mr-2 h-5 w-5" />
                Next Game Available In:
              </div>
              <div className="text-2xl font-bold text-white">
                {MiniGameEngine.formatTimeRemaining(cooldownTime)}
              </div>
            </div>
          )}
        </div>

        {/* Game Result */}
        {gameResult && (
          <div className="mt-6 p-4 bg-green-800 border border-green-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">
                +{gameResult.scEarned.toFixed(2)} SC Earned!
              </span>
            </div>
            <p className="text-sm text-green-200">{gameResult.message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-800 border border-blue-600 rounded-lg">
          <h3 className="font-semibold text-yellow-400 mb-2">How to Play:</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Move your mouse to control the dog catcher van</li>
            <li>• Catch as many dogs as possible in 60 seconds</li>
            <li>• Each dog caught earns 0.01 SC</li>
            <li>• Dogs that escape will subtract from your winnings</li>
            <li>• Play once every 24 hours for free SC!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
