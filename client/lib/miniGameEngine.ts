import { z } from 'zod';

// Game result schema
export const GameResultSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  score: z.number(),
  scEarned: z.number(),
  gcEarned: z.number().default(0),
  playedAt: z.date(),
  duration: z.number().default(60), // seconds
});

export type GameResult = z.infer<typeof GameResultSchema>;

// Game session schema
export const GameSessionSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  lastPlayed: z.date(),
  nextAvailable: z.date(),
  totalPlays: z.number().default(0),
  bestScore: z.number().default(0),
  totalScEarned: z.number().default(0),
});

export type GameSession = z.infer<typeof GameSessionSchema>;

// Mini game configuration
export interface MiniGameConfig {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  cooldownHours: number;
  maxScReward: number;
  baseScRate: number; // SC per point/item
  gameDuration: number; // seconds
  leaderboardPrize: number; // SC for weekly winner
}

// Available mini games
export const MINI_GAMES: Record<string, MiniGameConfig> = {
  dogCatcher: {
    id: 'dogCatcher',
    name: 'Dog Catcher',
    description: 'Catch as many dogs as you can in 60 seconds!',
    thumbnail: '/images/mini-games/dog-catcher.webp',
    cooldownHours: 24,
    maxScReward: 1.0,
    baseScRate: 0.01, // 0.01 SC per dog caught
    gameDuration: 60,
    leaderboardPrize: 5,
  },
  gtaV1: {
    id: 'gtaV1',
    name: "Corey's GTA v1",
    description: 'Steal cars and escape the police in 60 seconds!',
    thumbnail: '/images/mini-games/gta-v1.webp',
    cooldownHours: 24,
    maxScReward: 0.25,
    baseScRate: 0.01,
    gameDuration: 60,
    leaderboardPrize: 5,
  },
  fastTetris: {
    id: 'fastTetris',
    name: 'Fast Tetris',
    description: 'Stack as many bricks as possible in 60 seconds!',
    thumbnail: '/images/mini-games/fast-tetris.webp',
    cooldownHours: 24,
    maxScReward: 1.0,
    baseScRate: 0.01, // 0.01 SC per brick stacked
    gameDuration: 60,
    leaderboardPrize: 5,
  },
};

// Game state management
export class MiniGameEngine {
  static async canPlayGame(gameId: string, userId: string): Promise<{
    canPlay: boolean;
    nextAvailable?: Date;
    timeUntilNext?: number; // seconds
  }> {
    try {
      const response = await fetch('/api/games/mini-games/mini-game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, userId }),
      });
      
      if (!response.ok) return { canPlay: true }; // Allow play if session check fails
      
      const session = await response.json();
      const now = new Date();
      const nextAvailable = new Date(session.nextAvailable);
      
      if (now < nextAvailable) {
        return {
          canPlay: false,
          nextAvailable,
          timeUntilNext: Math.ceil((nextAvailable.getTime() - now.getTime()) / 1000),
        };
      }
      
      return { canPlay: true };
    } catch (error) {
      console.warn('Error checking game session:', error);
      return { canPlay: true }; // Allow play on error
    }
  }

  static async recordGameResult(result: Omit<GameResult, 'playedAt'>): Promise<{
    success: boolean;
    newBalance?: { sc: number; gc: number };
    error?: string;
  }> {
    try {
      const response = await fetch('/api/games/mini-games/record-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          playedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, newBalance: data.newBalance };
    } catch (error) {
      console.error('Error recording game result:', error);
      return { success: false, error: 'Network error' };
    }
  }

  static async getLeaderboard(gameId: string, period: 'weekly' | 'monthly' = 'weekly'): Promise<{
    leaderboard: Array<{
      userId: string;
      username: string;
      score: number;
      scEarned: number;
      rank: number;
    }>;
    userRank?: number;
  }> {
    try {
      const response = await fetch(`/api/games/mini-games/leaderboard/${gameId}?period=${period}`);
      if (!response.ok) return { leaderboard: [] };
      
      return await response.json();
    } catch (error) {
      console.warn('Error fetching leaderboard:', error);
      return { leaderboard: [] };
    }
  }

  static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static calculateReward(gameId: string, score: number, itemsLost: number = 0): number {
    const config = MINI_GAMES[gameId];
    if (!config) return 0;
    
    const grossReward = score * config.baseScRate;
    const penalty = itemsLost * config.baseScRate;
    const netReward = Math.max(0, grossReward - penalty);
    
    return Math.min(netReward, config.maxScReward);
  }
}

// Countdown hook for UI
export class CountdownTimer {
  private intervalId?: NodeJS.Timeout;
  private callbacks: Array<(timeLeft: number) => void> = [];

  constructor(private endTime: Date) {}

  start(callback: (timeLeft: number) => void): void {
    this.callbacks.push(callback);
    
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.ceil((this.endTime.getTime() - now) / 1000));
        
        this.callbacks.forEach(cb => cb(timeLeft));
        
        if (timeLeft <= 0) {
          this.stop();
        }
      }, 1000);
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.callbacks = [];
  }
}
