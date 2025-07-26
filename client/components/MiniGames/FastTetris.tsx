import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MiniGameEngine, MINI_GAMES } from '@/lib/miniGameEngine';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/contexts/BalanceContext';
import { Trophy, Clock, DollarSign, Target, Square, Zap } from 'lucide-react';

interface TetrisBlock {
  x: number;
  y: number;
  color: string;
  placed: boolean;
}

interface TetrisPiece {
  blocks: { x: number; y: number }[];
  color: string;
  x: number;
  y: number;
}

const TETRIS_PIECES = [
  { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }], color: '#00FFFF' }, // I
  { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: '#FFFF00' }, // O
  { blocks: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#800080' }, // T
  { blocks: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#00FF00' }, // S
  { blocks: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: '#FF0000' }, // Z
  { blocks: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#FFA500' }, // L
  { blocks: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#0000FF' }, // J
];

export default function FastTetris() {
  const { user } = useAuth();
  const { updateBalance } = useBalance();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const dropIntervalRef = useRef<NodeJS.Timeout>();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [bricksPlaced, setBricksPlaced] = useState(0);
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [canPlay, setCanPlay] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [gameResult, setGameResult] = useState<{ scEarned: number; message: string } | null>(null);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);

  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const BLOCK_SIZE = 25;
  const CANVAS_WIDTH = BOARD_WIDTH * BLOCK_SIZE + 200; // Extra space for UI
  const CANVAS_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE;
  const TARGET_BRICKS = 100;

  // Initialize empty board
  const initializeBoard = useCallback(() => {
    const newBoard: (string | null)[][] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      newBoard[y] = new Array(BOARD_WIDTH).fill(null);
    }
    setBoard(newBoard);
  }, []);

  // Generate random piece
  const generatePiece = useCallback((): TetrisPiece => {
    const template = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    return {
      blocks: [...template.blocks],
      color: template.color,
      x: Math.floor(BOARD_WIDTH / 2) - 2,
      y: 0,
    };
  }, []);

  // Check if user can play
  useEffect(() => {
    if (!user) return;

    const checkPlayStatus = async () => {
      const status = await MiniGameEngine.canPlayGame('fastTetris', user.id.toString());
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

  // Check collision
  const checkCollision = useCallback((piece: TetrisPiece, board: (string | null)[][], dx = 0, dy = 0): boolean => {
    for (const block of piece.blocks) {
      const newX = piece.x + block.x + dx;
      const newY = piece.y + block.y + dy;
      
      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return true;
      }
      
      if (newY >= 0 && board[newY][newX] !== null) {
        return true;
      }
    }
    return false;
  }, []);

  // Place piece on board
  const placePiece = useCallback((piece: TetrisPiece, board: (string | null)[][]) => {
    const newBoard = board.map(row => [...row]);
    
    for (const block of piece.blocks) {
      const x = piece.x + block.x;
      const y = piece.y + block.y;
      if (y >= 0) {
        newBoard[y][x] = piece.color;
      }
    }
    
    return newBoard;
  }, []);

  // Check and clear lines
  const clearLines = useCallback((board: (string | null)[][]) => {
    const newBoard = board.filter(row => row.some(cell => cell === null));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    // Add empty rows at top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(new Array(BOARD_WIDTH).fill(null));
    }
    
    return { newBoard, clearedLines };
  }, []);

  // Rotate piece
  const rotatePiece = useCallback((piece: TetrisPiece): TetrisPiece => {
    const rotatedBlocks = piece.blocks.map(block => ({
      x: -block.y,
      y: block.x,
    }));
    
    return { ...piece, blocks: rotatedBlocks };
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPiece) return;
      
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          if (!checkCollision(currentPiece, board, -1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null);
          }
          break;
        case 'd':
        case 'arrowright':
          if (!checkCollision(currentPiece, board, 1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null);
          }
          break;
        case 's':
        case 'arrowdown':
          if (!checkCollision(currentPiece, board, 0, 1)) {
            setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
          }
          break;
        case 'w':
        case 'arrowup':
        case ' ':
          const rotated = rotatePiece(currentPiece);
          if (!checkCollision(rotated, board)) {
            setCurrentPiece(rotated);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentPiece, board, checkCollision, rotatePiece]);

  // Auto drop piece
  useEffect(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    const dropSpeed = Math.max(100, 500 - (level * 50)); // Faster as level increases

    dropIntervalRef.current = setInterval(() => {
      setCurrentPiece(prev => {
        if (!prev) return null;

        if (!checkCollision(prev, board, 0, 1)) {
          return { ...prev, y: prev.y + 1 };
        } else {
          // Piece landed, place it
          const newBoard = placePiece(prev, board);
          const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
          
          setBoard(clearedBoard);
          setBricksPlaced(prevBricks => prevBricks + 4); // Each piece has 4 blocks
          setScore(prevScore => prevScore + (clearedLines * 100) + 10);
          setLinesCleared(prevLines => prevLines + clearedLines);
          
          if (clearedLines > 0) {
            setLevel(prevLevel => Math.floor(linesCleared / 10) + 1);
          }
          
          // Generate next piece
          const next = nextPiece || generatePiece();
          setNextPiece(generatePiece());
          
          return next;
        }
      });
    }, dropSpeed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameState, currentPiece, board, level, nextPiece, checkCollision, placePiece, clearLines, generatePiece, linesCleared]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw board grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y] && board[y][x]) {
          ctx.fillStyle = board[y][x]!;
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (const block of currentPiece.blocks) {
        const x = currentPiece.x + block.x;
        const y = currentPiece.y + block.y;
        if (x >= 0 && x < BOARD_WIDTH && y >= 0) {
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      }
    }

    // Draw UI panel
    const panelX = BOARD_WIDTH * BLOCK_SIZE + 10;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(panelX, 0, 180, CANVAS_HEIGHT);

    // CoinKrazy.com branding
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('CoinKrazy.com', panelX + 10, 30);

    // Game stats
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Time: ${timeLeft}s`, panelX + 10, 60);
    ctx.fillText(`Bricks: ${bricksPlaced}/${TARGET_BRICKS}`, panelX + 10, 80);
    ctx.fillText(`Score: ${score}`, panelX + 10, 100);
    ctx.fillText(`Lines: ${linesCleared}`, panelX + 10, 120);
    ctx.fillText(`Level: ${level}`, panelX + 10, 140);

    // Next piece preview
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('NEXT:', panelX + 10, 170);
    
    if (nextPiece) {
      ctx.fillStyle = nextPiece.color;
      for (const block of nextPiece.blocks) {
        const x = panelX + 20 + block.x * 15;
        const y = 180 + block.y * 15;
        ctx.fillRect(x, y, 13, 13);
      }
    }

    // Controls
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '10px Arial';
    ctx.fillText('Controls:', panelX + 10, 250);
    ctx.fillText('A/D - Move', panelX + 10, 265);
    ctx.fillText('S - Drop', panelX + 10, 280);
    ctx.fillText('W/Space - Rotate', panelX + 10, 295);

    // Progress bar
    const progress = Math.min(1, bricksPlaced / TARGET_BRICKS);
    ctx.fillStyle = '#333333';
    ctx.fillRect(panelX + 10, 320, 160, 20);
    ctx.fillStyle = progress >= 1 ? '#00FF00' : '#FFD700';
    ctx.fillRect(panelX + 10, 320, 160 * progress, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText('Progress to Max SC', panelX + 10, 355);
  }, [board, currentPiece, nextPiece, timeLeft, bricksPlaced, score, linesCleared, level]);

  const startGame = async () => {
    if (!canPlay) return;

    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    setBricksPlaced(0);
    setLinesCleared(0);
    setLevel(1);
    setGameResult(null);
    initializeBoard();
    setCurrentPiece(generatePiece());
    setNextPiece(generatePiece());
  };

  const endGame = async () => {
    setGameState('finished');
    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current);
    }

    if (!user) return;

    // Calculate reward
    const bricksNotStacked = Math.max(0, TARGET_BRICKS - bricksPlaced);
    const scEarned = MiniGameEngine.calculateReward('fastTetris', bricksPlaced, bricksNotStacked);

    // Record result
    const result = await MiniGameEngine.recordGameResult({
      gameId: 'fastTetris',
      userId: user.id.toString(),
      score: bricksPlaced,
      scEarned,
      duration: 60,
    });

    if (result.success) {
      setGameResult({
        scEarned,
        message: `Congrats! You stacked ${bricksPlaced} bricks and earned ${scEarned.toFixed(2)} SC. ${bricksNotStacked > 0 ? `${bricksNotStacked} bricks not stacked reduced your winnings.` : 'Perfect game!'} Remember 1 SC = $1 but we do not cash out until $100.00 MIN WITHDRAW and subject to sweepstake laws! Come back tomorrow for more Tetris action!`,
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

  const config = MINI_GAMES.fastTetris;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Square className="h-8 w-8 text-blue-400" />
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
            <div className="text-2xl font-bold text-blue-400">{bricksPlaced}</div>
            <div className="text-sm text-gray-300">Bricks Stacked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{timeLeft}s</div>
            <div className="text-sm text-gray-300">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-sm text-gray-300">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{level}</div>
            <div className="text-sm text-gray-300">Level</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-blue-400 rounded-lg bg-black"
          />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          {canPlay && gameState === 'waiting' && (
            <Button
              onClick={startGame}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Square className="mr-2 h-5 w-5" />
              Start Stacking!
            </Button>
          )}

          {!canPlay && (
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400 mb-2">
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
          <div className="mt-6 p-4 bg-blue-800 border border-blue-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">
                +{gameResult.scEarned.toFixed(2)} SC Earned!
              </span>
            </div>
            <p className="text-sm text-blue-200">{gameResult.message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-indigo-800 border border-indigo-600 rounded-lg">
          <h3 className="font-semibold text-yellow-400 mb-2">How to Play:</h3>
          <ul className="text-sm text-indigo-200 space-y-1">
            <li>• Use A/D or arrow keys to move pieces left/right</li>
            <li>• Press S or down arrow to drop pieces faster</li>
            <li>• Press W or Space to rotate pieces</li>
            <li>• Complete horizontal lines to clear them and score points</li>
            <li>• Stack as many bricks as possible in 60 seconds</li>
            <li>• Each brick stacked = 0.01 SC, up to 1.00 SC max!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
