// PragmaticPlay API Integration Service
// This service handles integration with PragmaticPlay's game API

interface PragmaticPlayConfig {
  apiUrl: string;
  operatorId: string;
  secretKey: string;
  currency: string;
  mode: "demo" | "real";
}

interface GameLaunchParams {
  gameSymbol: string;
  userId?: string;
  currency: "GC" | "SC";
  mode: "demo" | "sweepstakes";
  returnUrl: string;
  language: string;
}

interface GameSession {
  sessionId: string;
  gameUrl: string;
  expiresAt: number;
}

class PragmaticPlayService {
  private config: PragmaticPlayConfig;

  constructor() {
    this.config = {
      apiUrl:
        import.meta.env.VITE_PRAGMATIC_PLAY_API_URL ||
        "https://api.pragmaticplay.net",
      operatorId:
        import.meta.env.VITE_PRAGMATIC_PLAY_OPERATOR_ID || "coinkriazy_demo",
      secretKey:
        import.meta.env.VITE_PRAGMATIC_PLAY_SECRET_KEY || "demo_secret_key",
      currency: "USD",
      mode: "demo", // Default to demo mode for sweepstakes compliance
    };
  }

  // Generate authentication signature for API calls
  private generateSignature(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // In production, use proper HMAC-SHA256 signature
    // For demo, we'll use a simple hash
    return btoa(sortedParams + this.config.secretKey).substring(0, 32);
  }

  // Launch a PragmaticPlay game
  async launchGame(params: GameLaunchParams): Promise<GameSession> {
    try {
      // For sweepstakes compliance, always use demo mode
      const mode = params.mode === "sweepstakes" ? "demo" : "demo";

      const apiParams = {
        operator_id: this.config.operatorId,
        game_symbol: params.gameSymbol,
        user_id: params.userId || "demo_user",
        currency: params.currency === "SC" ? "USD" : "DEMO",
        mode: mode,
        return_url: params.returnUrl,
        language: params.language || "en",
        timestamp: Date.now(),
      };

      const signature = this.generateSignature(apiParams);

      // For demo purposes, simulate the PragmaticPlay response
      // In production, this would be a real API call to PragmaticPlay
      const gameSession: GameSession = {
        sessionId: `pp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gameUrl: this.buildGameUrl(params.gameSymbol, apiParams, signature),
        expiresAt: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
      };

      return gameSession;
    } catch (error) {
      console.error("PragmaticPlay launch error:", error);
      throw new Error("Failed to launch game");
    }
  }

  // Build the game URL with proper parameters
  private buildGameUrl(
    gameSymbol: string,
    params: any,
    signature: string,
  ): string {
    // This simulates the PragmaticPlay game URL structure
    // In production, this would be the actual PragmaticPlay game launcher URL
    const baseUrl = `${this.config.apiUrl}/game_launcher`;
    const queryParams = new URLSearchParams({
      ...params,
      signature,
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }

  // Get game information from PragmaticPlay
  async getGameInfo(gameSymbol: string): Promise<any> {
    try {
      // In production, this would fetch real game info from PragmaticPlay API
      // For demo, return mock data
      const gameInfo = {
        gameSymbol,
        name: this.getGameName(gameSymbol),
        rtp: this.getGameRTP(gameSymbol),
        volatility: this.getGameVolatility(gameSymbol),
        maxWin: this.getGameMaxWin(gameSymbol),
        features: this.getGameFeatures(gameSymbol),
        thumbnail: this.getGameThumbnail(gameSymbol),
      };

      return gameInfo;
    } catch (error) {
      console.error("Failed to get game info:", error);
      throw new Error("Game information unavailable");
    }
  }

  // Helper methods for game data (would be replaced with real API calls)
  private getGameName(symbol: string): string {
    const gameNames: Record<string, string> = {
      vs20doghouse: "The Dog House",
      vs25goldparty: "Gold Party",
      vs20fruitparty: "Fruit Party",
      vs25sweetbonanza: "Sweet Bonanza",
      vs243lions: "Book of Gold: Classic",
      vs20gatotoro: "Gate of Olympus",
      vs10eyeshorus: "Eye of Horus",
      vswaitstorm: "Storm Lord",
      vs25dragonkingdom: "Dragon Kingdom",
      vs25gladiator: "Gladiator Legends",
    };
    return gameNames[symbol] || "PragmaticPlay Game";
  }

  private getGameRTP(symbol: string): number {
    // Return RTP percentages for different games
    const rtpMap: Record<string, number> = {
      vs20doghouse: 96.51,
      vs25goldparty: 96.5,
      vs20fruitparty: 96.5,
      vs25sweetbonanza: 96.51,
      vs243lions: 96.52,
      vs20gatotoro: 96.5,
      vs10eyeshorus: 96.31,
      vswaitstorm: 96.52,
      vs25dragonkingdom: 96.5,
      vs25gladiator: 96.52,
    };
    return rtpMap[symbol] || 96.5;
  }

  private getGameVolatility(symbol: string): string {
    const volatilityMap: Record<string, string> = {
      vs20doghouse: "High",
      vs25goldparty: "Medium",
      vs20fruitparty: "High",
      vs25sweetbonanza: "High",
      vs243lions: "Medium",
      vs20gatotoro: "High",
      vs10eyeshorus: "Medium",
      vswaitstorm: "High",
      vs25dragonkingdom: "Medium",
      vs25gladiator: "High",
    };
    return volatilityMap[symbol] || "Medium";
  }

  private getGameMaxWin(symbol: string): number {
    const maxWinMap: Record<string, number> = {
      vs20doghouse: 6750,
      vs25goldparty: 5000,
      vs20fruitparty: 5000,
      vs25sweetbonanza: 21100,
      vs243lions: 2500,
      vs20gatotoro: 5000,
      vs10eyeshorus: 10000,
      vswaitstorm: 5000,
      vs25dragonkingdom: 5000,
      vs25gladiator: 5000,
    };
    return maxWinMap[symbol] || 5000;
  }

  private getGameFeatures(symbol: string): string[] {
    const featuresMap: Record<string, string[]> = {
      vs20doghouse: ["Free Spins", "Multiplier Symbols", "Sticky Wilds"],
      vs25goldparty: ["Free Games", "Wild Symbols", "Scatter Pays"],
      vs20fruitparty: ["Tumble Feature", "Free Spins", "Multipliers"],
      vs25sweetbonanza: ["Tumble Feature", "Free Spins", "Multiplier Bombs"],
      vs243lions: ["Free Spins", "Expanding Symbols", "Gamble Feature"],
      vs20gatotoro: ["Cascading Wins", "Multipliers", "Free Spins"],
      vs10eyeshorus: ["Free Spins", "Expanding Symbols", "Wild Symbols"],
      vswaitstorm: ["Free Spins", "Colossal Symbols", "Wild Symbols"],
      vs25dragonkingdom: ["Free Spins", "Dragon Wilds", "Multipliers"],
      vs25gladiator: ["Free Spins", "Wild Symbols", "Bonus Round"],
    };
    return featuresMap[symbol] || ["Free Spins", "Wild Symbols"];
  }

  private getGameThumbnail(symbol: string): string {
    // Return game-specific thumbnails
    const thumbnailMap: Record<string, string> = {
      vs20doghouse:
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=600&fit=crop",
      vs25goldparty:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
      vs20fruitparty:
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=600&fit=crop",
      vs25sweetbonanza:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      vs243lions:
        "https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&h=600&fit=crop",
      vs20gatotoro:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      vs10eyeshorus:
        "https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&h=600&fit=crop",
      vswaitstorm:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop",
      vs25dragonkingdom:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      vs25gladiator:
        "https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&h=600&fit=crop",
    };
    return (
      thumbnailMap[symbol] ||
      "https://images.unsplash.com/photo-1541278107931-e006523892df?w=400&h=600&fit=crop"
    );
  }

  // Validate session (called by backend)
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      // In production, this would validate with PragmaticPlay API
      // For demo, check if session format is valid
      return sessionId.startsWith("pp_session_") && sessionId.length > 20;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }

  // End game session
  async endSession(sessionId: string): Promise<void> {
    try {
      // In production, this would call PragmaticPlay API to end session
      console.log(`Ending PragmaticPlay session: ${sessionId}`);
    } catch (error) {
      console.error("End session error:", error);
    }
  }
}

// Export singleton instance
export const pragmaticPlayService = new PragmaticPlayService();
export default pragmaticPlayService;
