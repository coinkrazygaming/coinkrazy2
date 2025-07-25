import express from "express";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";
import { z } from "zod";
import crypto from "crypto";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "coinkriazy_jwt_secret_2024";

// Middleware to verify JWT token
function verifyToken(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get all games with filters
router.get("/", async (req, res) => {
  try {
    const {
      category,
      provider,
      search,
      volatility,
      minRtp,
      maxRtp,
      minBet,
      maxBet,
      featured,
      new: isNew,
      popular,
      sort = "popular",
      page = 1,
      limit = 20,
    } = req.query;

    let whereConditions = ["g.is_active = TRUE"];
    let queryParams: any[] = [];

    // Build WHERE conditions
    if (category) {
      whereConditions.push("gc.slug = ?");
      queryParams.push(category);
    }

    if (provider) {
      whereConditions.push("gp.slug = ?");
      queryParams.push(provider);
    }

    if (search) {
      whereConditions.push("g.name LIKE ?");
      queryParams.push(`%${search}%`);
    }

    if (volatility) {
      whereConditions.push("g.volatility = ?");
      queryParams.push(volatility);
    }

    if (minRtp) {
      whereConditions.push("g.rtp >= ?");
      queryParams.push(parseFloat(minRtp as string));
    }

    if (maxRtp) {
      whereConditions.push("g.rtp <= ?");
      queryParams.push(parseFloat(maxRtp as string));
    }

    if (minBet) {
      whereConditions.push("g.min_bet >= ?");
      queryParams.push(parseFloat(minBet as string));
    }

    if (maxBet) {
      whereConditions.push("g.max_bet <= ?");
      queryParams.push(parseFloat(maxBet as string));
    }

    if (featured === "true") {
      whereConditions.push("g.is_featured = TRUE");
    }

    if (isNew === "true") {
      whereConditions.push("g.is_new = TRUE");
    }

    if (popular === "true") {
      whereConditions.push("g.is_popular = TRUE");
    }

    // Build ORDER BY clause
    let orderBy = "g.play_count DESC";
    switch (sort) {
      case "newest":
        orderBy = "g.created_at DESC";
        break;
      case "rtp":
        orderBy = "g.rtp DESC";
        break;
      case "name":
        orderBy = "g.name ASC";
        break;
      case "jackpots":
        orderBy = "g.max_win DESC";
        break;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const games = await executeQuery(
      `SELECT 
        g.id, g.name, g.slug, g.thumbnail_url, g.rtp, g.volatility,
        g.min_bet, g.max_bet, g.max_win, g.features, g.paylines, g.reels,
        g.is_featured, g.is_new, g.is_popular, g.play_count, g.game_type,
        gc.name as category_name, gc.slug as category_slug,
        gp.name as provider_name, gp.slug as provider_slug
      FROM games g
      JOIN game_categories gc ON g.category_id = gc.id
      JOIN game_providers gp ON g.provider_id = gp.id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit as string), offset],
    );

    // Get total count for pagination
    const totalResult = await executeQuery(
      `SELECT COUNT(*) as total
      FROM games g
      JOIN game_categories gc ON g.category_id = gc.id
      JOIN game_providers gp ON g.provider_id = gp.id
      WHERE ${whereConditions.join(" AND ")}`,
      queryParams,
    );

    res.json({
      games,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalResult[0].total,
        pages: Math.ceil(totalResult[0].total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Games fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user game history for dashboard
router.get("/history", verifyToken, async (req: any, res) => {
  try {
    const gameHistory = await executeQuery(
      `SELECT
        gs.id, gs.coin_type, gs.bet_amount, gs.total_wagered, gs.total_won,
        gs.spins_played, gs.session_start, gs.session_end, gs.status,
        g.name as game_name, g.game_type,
        ROUND((julianday(COALESCE(gs.session_end, datetime('now'))) - julianday(gs.session_start)) * 24 * 60) as duration_minutes
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.user_id = ?
      ORDER BY gs.session_start DESC
      LIMIT 10`,
      [req.user.id],
    );

    // Format for dashboard display
    const formattedHistory = gameHistory.map((session: any) => ({
      id: session.id,
      game_name: session.game_name,
      game_type: session.game_type,
      amount_wagered: session.total_wagered || session.bet_amount,
      amount_won: session.total_won || 0,
      created_at: session.session_start,
      duration_minutes: session.duration_minutes || 0,
      currency_type: session.coin_type.toUpperCase(),
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error("Game history error:", error);
    // Return empty array on error to prevent dashboard crashes
    res.json([]);
  }
});

// Get game categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await executeQuery(
      "SELECT id, name, slug, description, icon FROM game_categories WHERE is_active = TRUE ORDER BY sort_order",
    );
    res.json({ categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get game providers
router.get("/providers", async (req, res) => {
  try {
    const providers = await executeQuery(
      "SELECT id, name, slug, logo_url FROM game_providers WHERE is_active = TRUE ORDER BY name",
    );
    res.json({ providers });
  } catch (error) {
    console.error("Providers fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single game details
router.get("/:slug", async (req, res) => {
  try {
    const game = await executeQuery(
      `SELECT 
        g.*, gc.name as category_name, gc.slug as category_slug,
        gp.name as provider_name, gp.slug as provider_slug
      FROM games g
      JOIN game_categories gc ON g.category_id = gc.id
      JOIN game_providers gp ON g.provider_id = gp.id
      WHERE g.slug = ? AND g.is_active = TRUE`,
      [req.params.slug],
    );

    if (game.length === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Get recent big wins for this game
    const recentWins = await executeQuery(
      `SELECT 
        gr.win_amount, gr.multiplier, gr.created_at,
        u.username
      FROM game_results gr
      JOIN users u ON gr.user_id = u.id
      WHERE gr.game_id = ? AND gr.win_amount > 100
      ORDER BY gr.created_at DESC
      LIMIT 10`,
      [game[0].id],
    );

    // Get game statistics
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_spins,
        AVG(win_amount) as avg_win,
        MAX(win_amount) as max_win,
        MAX(multiplier) as max_multiplier,
        COUNT(CASE WHEN win_amount > 0 THEN 1 END) / COUNT(*) * 100 as hit_frequency
      FROM game_results
      WHERE game_id = ?`,
      [game[0].id],
    );

    res.json({
      game: game[0],
      recentWins,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Game details fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start game session
router.post("/:slug/play", verifyToken, async (req: any, res) => {
  try {
    const playSchema = z.object({
      coinType: z.enum(["gold", "sweeps"]),
      betAmount: z.number().min(0.1).max(500),
    });

    const { coinType, betAmount } = playSchema.parse(req.body);

    // Get game details
    const game = await executeQuery(
      "SELECT * FROM games WHERE slug = ? AND is_active = TRUE",
      [req.params.slug],
    );

    if (game.length === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check bet limits
    if (betAmount < game[0].min_bet || betAmount > game[0].max_bet) {
      return res.status(400).json({
        message: `Bet amount must be between ${game[0].min_bet} and ${game[0].max_bet}`,
      });
    }

    // Get user balance
    const user = await executeQuery(
      "SELECT gold_coins, sweeps_coins FROM users WHERE id = ?",
      [req.user.id],
    );

    const currentBalance =
      coinType === "gold" ? user[0].gold_coins : user[0].sweeps_coins;

    if (currentBalance < betAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Create game session
    const sessionResult = await executeQuery(
      `INSERT INTO game_sessions (
        user_id, game_id, session_token, coin_type, bet_amount
      ) VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, game[0].id, sessionToken, coinType, betAmount],
    );

    // Update play count
    await executeQuery(
      "UPDATE games SET play_count = play_count + 1 WHERE id = ?",
      [game[0].id],
    );

    res.json({
      sessionId: sessionResult.insertId,
      sessionToken,
      game: game[0],
      message: "Game session started",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Game session start error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Play spin/round
router.post(
  "/session/:sessionToken/spin",
  verifyToken,
  async (req: any, res) => {
    try {
      // Get session details
      const session = await executeQuery(
        `SELECT gs.*, g.rtp, g.max_win, g.volatility, g.features
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.session_token = ? AND gs.user_id = ? AND gs.status = 'active'`,
        [req.params.sessionToken, req.user.id],
      );

      if (session.length === 0) {
        return res
          .status(404)
          .json({ message: "Session not found or inactive" });
      }

      const gameSession = session[0];

      // Get user balance
      const user = await executeQuery(
        "SELECT gold_coins, sweeps_coins FROM users WHERE id = ?",
        [req.user.id],
      );

      const coinType = gameSession.coin_type;
      const betAmount = gameSession.bet_amount;
      const currentBalance =
        coinType === "gold" ? user[0].gold_coins : user[0].sweeps_coins;

      if (currentBalance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Generate random result based on RTP and volatility
      const winAmount = generateGameResult(
        betAmount,
        gameSession.rtp,
        gameSession.volatility,
        gameSession.max_win,
      );

      const multiplier = winAmount > 0 ? winAmount / betAmount : 0;

      // Update user balance
      const newBalance = currentBalance - betAmount + winAmount;
      const balanceField = coinType === "gold" ? "gold_coins" : "sweeps_coins";

      await executeQuery(
        `UPDATE users SET ${balanceField} = ?, experience_points = experience_points + ? WHERE id = ?`,
        [newBalance, Math.floor(betAmount / 10), req.user.id],
      );

      // Create transaction records
      if (betAmount > 0) {
        await executeQuery(
          `INSERT INTO transactions (
          user_id, transaction_type, coin_type, amount, 
          previous_balance, new_balance, description, reference_id
        ) VALUES (?, 'game_loss', ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            coinType,
            -betAmount,
            currentBalance,
            currentBalance - betAmount,
            `${gameSession.name || "Game"} - Bet`,
            gameSession.session_token,
          ],
        );
      }

      if (winAmount > 0) {
        await executeQuery(
          `INSERT INTO transactions (
          user_id, transaction_type, coin_type, amount, 
          previous_balance, new_balance, description, reference_id
        ) VALUES (?, 'game_win', ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            coinType,
            winAmount,
            currentBalance - betAmount,
            newBalance,
            `${gameSession.name || "Game"} - Win`,
            gameSession.session_token,
          ],
        );
      }

      // Update session stats
      await executeQuery(
        `UPDATE game_sessions SET 
        total_wagered = total_wagered + ?,
        total_won = total_won + ?,
        spins_played = spins_played + 1
      WHERE id = ?`,
        [betAmount, winAmount, gameSession.id],
      );

      // Create game result record
      const resultHash = crypto
        .createHash("sha256")
        .update(`${gameSession.id}-${Date.now()}-${winAmount}`)
        .digest("hex");

      await executeQuery(
        `INSERT INTO game_results (
        session_id, user_id, game_id, coin_type, bet_amount,
        win_amount, multiplier, result_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gameSession.id,
          req.user.id,
          gameSession.game_id,
          coinType,
          betAmount,
          winAmount,
          multiplier,
          resultHash,
        ],
      );

      res.json({
        betAmount,
        winAmount,
        multiplier,
        newBalance,
        resultHash,
        isWin: winAmount > 0,
        gameData: generateGameSymbols(winAmount > 0, multiplier),
      });
    } catch (error) {
      console.error("Game spin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// End game session
router.post(
  "/session/:sessionToken/end",
  verifyToken,
  async (req: any, res) => {
    try {
      await executeQuery(
        `UPDATE game_sessions SET 
        status = 'completed', 
        session_end = NOW() 
      WHERE session_token = ? AND user_id = ?`,
        [req.params.sessionToken, req.user.id],
      );

      res.json({ message: "Session ended successfully" });
    } catch (error) {
      console.error("Session end error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Mini game cooldown check
router.get("/mini-games/cooldown/:slug", verifyToken, async (req: any, res) => {
  try {
    const cooldown = await executeQuery(
      "SELECT cooldown_ends FROM mini_game_cooldowns WHERE user_id = ? AND game_slug = ?",
      [req.user.id, req.params.slug],
    );

    if (cooldown.length === 0) {
      return res.json({ onCooldown: false, timeRemaining: 0 });
    }

    const now = new Date();
    const cooldownEnds = new Date(cooldown[0].cooldown_ends);
    const timeRemaining = Math.max(0, cooldownEnds.getTime() - now.getTime());

    res.json({
      onCooldown: timeRemaining > 0,
      timeRemaining: Math.floor(timeRemaining / 1000), // seconds
    });
  } catch (error) {
    console.error("Cooldown check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Play mini game
router.post("/mini-games/:slug/play", verifyToken, async (req: any, res) => {
  try {
    // Check cooldown
    const cooldown = await executeQuery(
      "SELECT cooldown_ends FROM mini_game_cooldowns WHERE user_id = ? AND game_slug = ?",
      [req.user.id, req.params.slug],
    );

    if (cooldown.length > 0) {
      const now = new Date();
      const cooldownEnds = new Date(cooldown[0].cooldown_ends);
      if (cooldownEnds > now) {
        const timeRemaining = Math.floor(
          (cooldownEnds.getTime() - now.getTime()) / 1000,
        );
        return res.status(400).json({
          message: "Game is on cooldown",
          timeRemaining,
        });
      }
    }

    // Generate random reward (500-5000 GC)
    const rewardAmount = Math.floor(Math.random() * 4501) + 500;

    // Update user balance
    const user = await executeQuery(
      "SELECT gold_coins FROM users WHERE id = ?",
      [req.user.id],
    );

    const newBalance = user[0].gold_coins + rewardAmount;

    await executeQuery(
      "UPDATE users SET gold_coins = ?, experience_points = experience_points + 50 WHERE id = ?",
      [newBalance, req.user.id],
    );

    // Create transaction
    await executeQuery(
      `INSERT INTO transactions (
        user_id, transaction_type, coin_type, amount, 
        previous_balance, new_balance, description
      ) VALUES (?, 'game_win', 'gold', ?, ?, ?, ?)`,
      [
        req.user.id,
        rewardAmount,
        user[0].gold_coins,
        newBalance,
        `Mini Game: ${req.params.slug} - Daily Reward`,
      ],
    );

    // Set cooldown (24 hours)
    const cooldownEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await executeQuery(
      `INSERT INTO mini_game_cooldowns (user_id, game_slug, cooldown_ends)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      last_played = NOW(), cooldown_ends = VALUES(cooldown_ends)`,
      [req.user.id, req.params.slug, cooldownEnd],
    );

    res.json({
      reward: rewardAmount,
      newBalance,
      nextPlayTime: cooldownEnd,
      message: "Mini game completed successfully!",
    });
  } catch (error) {
    console.error("Mini game play error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to generate game results based on RTP
function generateGameResult(
  betAmount: number,
  rtp: number,
  volatility: string,
  maxWin: number,
): number {
  const random = Math.random();
  const rtpDecimal = rtp / 100;

  // Adjust win frequency based on volatility
  let winChance = 0.3; // Base 30% win chance
  switch (volatility) {
    case "low":
      winChance = 0.45;
      break;
    case "medium":
      winChance = 0.35;
      break;
    case "high":
      winChance = 0.25;
      break;
    case "very_high":
      winChance = 0.15;
      break;
  }

  if (random > winChance) {
    return 0; // No win
  }

  // Generate win amount
  let multiplier = Math.random() * 10; // 0-10x base multiplier

  // Adjust multiplier based on volatility
  switch (volatility) {
    case "low":
      multiplier = Math.random() * 3 + 0.5; // 0.5-3.5x
      break;
    case "medium":
      multiplier = Math.random() * 8 + 0.5; // 0.5-8.5x
      break;
    case "high":
      multiplier = Math.random() * 25 + 0.5; // 0.5-25.5x
      break;
    case "very_high":
      // Rare chance for huge multiplier
      if (Math.random() < 0.01) {
        multiplier = Math.random() * 200 + 50; // 50-250x (very rare)
      } else {
        multiplier = Math.random() * 15 + 0.5; // 0.5-15.5x
      }
      break;
  }

  let winAmount = betAmount * multiplier;

  // Cap at max win
  winAmount = Math.min(winAmount, maxWin);

  // Ensure the house edge over time
  const targetReturn = betAmount * rtpDecimal;
  if (winAmount > targetReturn * 3) {
    winAmount = targetReturn * (1 + Math.random() * 2); // 1x-3x target return
  }

  return Math.round(winAmount * 100) / 100; // Round to 2 decimal places
}

// Helper function to generate slot symbols
function generateGameSymbols(isWin: boolean, multiplier: number) {
  const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "🔔", "💰"];
  const reels = 5;
  const rows = 3;

  const result = [];
  for (let i = 0; i < reels; i++) {
    const reel = [];
    for (let j = 0; j < rows; j++) {
      if (isWin && i === 0 && j === 1) {
        // Ensure at least one winning symbol on first reel
        reel.push("💰");
      } else if (isWin && i < 3 && j === 1 && Math.random() < 0.7) {
        // Higher chance of matching symbols on payline for wins
        reel.push("💰");
      } else {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
    }
    result.push(reel);
  }

  return {
    reels: result,
    paylines: isWin
      ? [{ line: 1, symbols: ["💰", "💰", "💰"], multiplier }]
      : [],
  };
}

export default router;
