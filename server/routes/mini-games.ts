import express from "express";
import { executeQuery } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

// Get user's mini game session data
router.post("/mini-game-session", authenticateToken, async (req, res) => {
  try {
    const { gameId, userId } = req.body;
    const user = (req as any).user;

    // Verify user can access this session
    if (user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get or create game session
    let sessions = await executeQuery(
      `SELECT * FROM mini_game_sessions 
       WHERE user_id = ? AND game_id = ?`,
      [userId, gameId],
    );

    if (sessions.length === 0) {
      // Create new session
      await executeQuery(
        `INSERT INTO mini_game_sessions 
         (user_id, game_id, last_played, next_available, total_plays, best_score, total_sc_earned)
         VALUES (?, ?, '2000-01-01', '2000-01-01', 0, 0, 0)`,
        [userId, gameId],
      );

      sessions = await executeQuery(
        `SELECT * FROM mini_game_sessions 
         WHERE user_id = ? AND game_id = ?`,
        [userId, gameId],
      );
    }

    const session = sessions[0];
    res.json({
      gameId: session.game_id,
      userId: session.user_id,
      lastPlayed: session.last_played,
      nextAvailable: session.next_available,
      totalPlays: session.total_plays,
      bestScore: session.best_score,
      totalScEarned: session.total_sc_earned,
    });
  } catch (error) {
    console.error("Mini game session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record game result and update balances
router.post("/record-result", authenticateToken, async (req, res) => {
  try {
    const {
      gameId,
      userId,
      score,
      scEarned,
      gcEarned = 0,
      duration = 60,
    } = req.body;
    const user = (req as any).user;

    // Verify user can record this result
    if (user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Start transaction
    await executeQuery("START TRANSACTION");

    try {
      // Record the game result
      await executeQuery(
        `INSERT INTO mini_game_results 
         (user_id, game_id, score, sc_earned, gc_earned, duration, played_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [userId, gameId, score, scEarned, gcEarned, duration],
      );

      // Update user balance
      await executeQuery(
        `UPDATE users 
         SET sc_balance = sc_balance + ?, gc_balance = gc_balance + ?
         WHERE id = ?`,
        [scEarned, gcEarned, userId],
      );

      // Update game session
      const nextAvailable = new Date();
      nextAvailable.setHours(nextAvailable.getHours() + 24); // 24 hour cooldown

      await executeQuery(
        `UPDATE mini_game_sessions 
         SET last_played = NOW(), 
             next_available = ?,
             total_plays = total_plays + 1,
             best_score = GREATEST(best_score, ?),
             total_sc_earned = total_sc_earned + ?
         WHERE user_id = ? AND game_id = ?`,
        [nextAvailable, score, scEarned, userId, gameId],
      );

      // Get updated balance
      const balanceResult = await executeQuery(
        `SELECT sc_balance, gc_balance FROM users WHERE id = ?`,
        [userId],
      );

      await executeQuery("COMMIT");

      res.json({
        success: true,
        newBalance: {
          sc: balanceResult[0].sc_balance,
          gc: balanceResult[0].gc_balance,
        },
      });
    } catch (error) {
      await executeQuery("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Record result error:", error);
    res.status(500).json({ error: "Failed to record game result" });
  }
});

// Get leaderboard for a specific game
router.get("/leaderboard/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const { period = "weekly" } = req.query;

    let dateFilter = "AND r.played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    if (period === "monthly") {
      dateFilter = "AND r.played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    }

    const leaderboard = await executeQuery(
      `SELECT 
         u.id as userId,
         u.username,
         MAX(r.score) as score,
         SUM(r.sc_earned) as scEarned,
         ROW_NUMBER() OVER (ORDER BY MAX(r.score) DESC) as rank
       FROM mini_game_results r
       JOIN users u ON r.user_id = u.id
       WHERE r.game_id = ? ${dateFilter}
       GROUP BY u.id, u.username
       ORDER BY score DESC
       LIMIT 20`,
      [gameId],
    );

    // Get user's rank if authenticated
    let userRank = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        // Note: Would need to verify token here for user rank
        // For now, just return the leaderboard
      } catch (error) {
        // Continue without user rank
      }
    }

    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
        scEarned: entry.scEarned,
        rank: index + 1,
      })),
      userRank,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Admin: Get all mini game statistics
router.get("/admin/stats", authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const stats = await executeQuery(`
      SELECT 
        r.game_id,
        COUNT(r.id) as total_plays,
        COUNT(DISTINCT r.user_id) as unique_players,
        SUM(r.sc_earned) as total_sc_paid,
        AVG(r.score) as avg_score,
        MAX(r.score) as best_score,
        DATE(r.played_at) as play_date
      FROM mini_game_results r
      WHERE r.played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY r.game_id, DATE(r.played_at)
      ORDER BY r.game_id, play_date DESC
    `);

    res.json({ stats });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// Admin: Manually award weekly leaderboard prizes
router.post(
  "/admin/award-weekly-prizes",
  authenticateToken,
  async (req, res) => {
    try {
      const user = (req as any).user;
      if (user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { gameId } = req.body;

      // Get top player for the week
      const winners = await executeQuery(
        `SELECT 
         u.id as userId,
         u.username,
         MAX(r.score) as score
       FROM mini_game_results r
       JOIN users u ON r.user_id = u.id
       WHERE r.game_id = ? 
         AND r.played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY u.id, u.username
       ORDER BY score DESC
       LIMIT 1`,
        [gameId],
      );

      if (winners.length === 0) {
        return res.json({ message: "No winners found for this week" });
      }

      const winner = winners[0];
      const prizeAmount = 5; // 5 SC

      // Award the prize
      await executeQuery(
        `UPDATE users SET sc_balance = sc_balance + ? WHERE id = ?`,
        [prizeAmount, winner.userId],
      );

      // Record the prize transaction
      await executeQuery(
        `INSERT INTO transactions 
       (user_id, transaction_type, amount, description, status, created_at)
       VALUES (?, 'weekly_prize', ?, ?, 'completed', NOW())`,
        [winner.userId, prizeAmount, `Weekly ${gameId} leaderboard prize`],
      );

      res.json({
        success: true,
        winner: {
          userId: winner.userId,
          username: winner.username,
          score: winner.score,
          prizeAmount,
        },
      });
    } catch (error) {
      console.error("Award prizes error:", error);
      res.status(500).json({ error: "Failed to award prizes" });
    }
  },
);

export default router;
