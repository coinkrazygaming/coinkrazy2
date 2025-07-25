import express from "express";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";
import { z } from "zod";

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

// Get user profile
router.get("/profile", verifyToken, async (req: any, res) => {
  try {
    const user = await executeQuery(
      `SELECT 
        id, username, email, first_name, last_name, date_of_birth,
        country, state, zip_code, phone, gold_coins, sweeps_coins,
        level, experience_points, kyc_status, registration_date
      FROM users WHERE id = ?`,
      [req.user.id],
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: user[0] });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", verifyToken, async (req: any, res) => {
  try {
    const updateSchema = z.object({
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      phone: z.string().optional(),
      country: z.string().min(1).max(100).optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase to snake_case
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updateValues.push(req.user.id);

    await executeQuery(
      `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      updateValues,
    );

    // Return updated user data
    const updatedUser = await executeQuery(
      `SELECT 
        id, username, email, first_name, last_name, date_of_birth,
        country, state, zip_code, phone, gold_coins, sweeps_coins,
        level, experience_points, kyc_status
      FROM users WHERE id = ?`,
      [req.user.id],
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user transactions
router.get("/transactions", verifyToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const transactions = await executeQuery(
      `SELECT 
        id, transaction_type, coin_type, amount, previous_balance,
        new_balance, description, status, created_at, processed_at
      FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset],
    );

    const totalCount = await executeQuery(
      "SELECT COUNT(*) as count FROM transactions WHERE user_id = ?",
      [req.user.id],
    );

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Transactions fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user favorites
router.get("/favorites", verifyToken, async (req: any, res) => {
  try {
    const favorites = await executeQuery(
      `SELECT 
        g.id, g.name, g.slug, g.thumbnail_url, g.rtp, g.volatility,
        g.game_type, gc.name as category_name, gp.name as provider_name
      FROM user_favorites uf
      JOIN games g ON uf.game_id = g.id
      JOIN game_categories gc ON g.category_id = gc.id
      JOIN game_providers gp ON g.provider_id = gp.id
      WHERE uf.user_id = ? AND g.is_active = TRUE
      ORDER BY uf.created_at DESC`,
      [req.user.id],
    );

    res.json({ favorites });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add/remove favorite
router.post("/favorites/:gameId", verifyToken, async (req: any, res) => {
  try {
    const gameId = parseInt(req.params.gameId);

    // Check if already favorited
    const existing = await executeQuery(
      "SELECT id FROM user_favorites WHERE user_id = ? AND game_id = ?",
      [req.user.id, gameId],
    );

    if (existing.length > 0) {
      // Remove favorite
      await executeQuery(
        "DELETE FROM user_favorites WHERE user_id = ? AND game_id = ?",
        [req.user.id, gameId],
      );
      res.json({ message: "Removed from favorites", favorited: false });
    } else {
      // Add favorite
      await executeQuery(
        "INSERT INTO user_favorites (user_id, game_id) VALUES (?, ?)",
        [req.user.id, gameId],
      );
      res.json({ message: "Added to favorites", favorited: true });
    }
  } catch (error) {
    console.error("Favorite toggle error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user game sessions
router.get("/sessions", verifyToken, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sessions = await executeQuery(
      `SELECT 
        gs.id, gs.coin_type, gs.bet_amount, gs.total_wagered, gs.total_won,
        gs.spins_played, gs.session_start, gs.session_end, gs.status,
        g.name as game_name, g.thumbnail_url
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.user_id = ?
      ORDER BY gs.session_start DESC
      LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset],
    );

    res.json({ sessions });
  } catch (error) {
    console.error("Sessions fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user stats
router.get("/stats", verifyToken, async (req: any, res) => {
  try {
    // Get basic stats
    const totalSessions = await executeQuery(
      "SELECT COUNT(*) as count FROM game_sessions WHERE user_id = ?",
      [req.user.id],
    );

    const totalWagered = await executeQuery(
      "SELECT COALESCE(SUM(total_wagered), 0) as total FROM game_sessions WHERE user_id = ?",
      [req.user.id],
    );

    const totalWon = await executeQuery(
      "SELECT COALESCE(SUM(total_won), 0) as total FROM game_sessions WHERE user_id = ?",
      [req.user.id],
    );

    const biggestWin = await executeQuery(
      `SELECT COALESCE(MAX(win_amount), 0) as biggest_win
      FROM game_results gr
      WHERE gr.user_id = ?`,
      [req.user.id],
    );

    const favoriteGame = await executeQuery(
      `SELECT g.name, COUNT(*) as play_count
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.user_id = ?
      GROUP BY g.id, g.name
      ORDER BY play_count DESC
      LIMIT 1`,
      [req.user.id],
    );

    // Calculate win rate
    const winResults = await executeQuery(
      `SELECT
        COUNT(*) as total_games,
        COUNT(CASE WHEN win_amount > 0 THEN 1 END) as winning_games
      FROM game_results
      WHERE user_id = ?`,
      [req.user.id],
    );

    const totalGames = winResults[0]?.total_games || 0;
    const winningGames = winResults[0]?.winning_games || 0;
    const winRate = totalGames > 0 ? winningGames / totalGames : 0;

    res.json({
      total_wagered: totalWagered[0].total,
      total_won: totalWon[0].total,
      games_played: totalSessions[0].count,
      favorite_game: favoriteGame[0]?.name || "None yet",
      win_rate: winRate,
      biggest_win: biggestWin[0].biggest_win,
      current_streak: 0, // TODO: Calculate actual streak
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    // Return default stats on error to prevent dashboard crashes
    res.json({
      total_wagered: 0,
      total_won: 0,
      games_played: 0,
      favorite_game: "None yet",
      win_rate: 0,
      biggest_win: 0,
      current_streak: 0,
    });
  }
});

// Claim daily bonus
router.post("/claim-daily-bonus", verifyToken, async (req: any, res) => {
  try {
    // Check if already claimed today
    const todayClaim = await executeQuery(
      `SELECT id FROM transactions
      WHERE user_id = ?
      AND transaction_type = 'bonus'
      AND description LIKE '%Daily Login%'
      AND date(created_at) = date('now')`,
      [req.user.id],
    );

    if (todayClaim.length > 0) {
      return res.status(400).json({
        message: "Daily bonus already claimed today",
      });
    }

    // Get user balance
    const user = await executeQuery(
      "SELECT gold_coins FROM users WHERE id = ?",
      [req.user.id],
    );

    const bonusAmount = 1000; // Daily bonus amount
    const newBalance = user[0].gold_coins + bonusAmount;

    // Update user balance
    await executeQuery(
      "UPDATE users SET gold_coins = ?, experience_points = experience_points + 25 WHERE id = ?",
      [newBalance, req.user.id],
    );

    // Create bonus transaction
    await executeQuery(
      `INSERT INTO transactions (
        user_id, transaction_type, coin_type, amount,
        previous_balance, new_balance, description, status
      ) VALUES (?, 'bonus', 'gold', ?, ?, ?, 'Daily Login Bonus', 'completed')`,
      [req.user.id, bonusAmount, user[0].gold_coins, newBalance],
    );

    res.json({
      message: "Daily bonus claimed successfully",
      amount: bonusAmount,
      currency: "GC",
      newBalance,
    });
  } catch (error) {
    console.error("Daily bonus claim error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Submit KYC documents
router.post("/kyc", verifyToken, async (req: any, res) => {
  try {
    const kycSchema = z.object({
      documents: z.array(
        z.object({
          type: z.enum(["id", "passport", "utility_bill", "bank_statement"]),
          url: z.string().url(),
          filename: z.string(),
        }),
      ),
    });

    const { documents } = kycSchema.parse(req.body);

    await executeQuery(
      "UPDATE users SET kyc_documents = ?, kyc_status = 'pending', updated_at = NOW() WHERE id = ?",
      [JSON.stringify(documents), req.user.id],
    );

    res.json({ message: "KYC documents submitted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("KYC submission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
