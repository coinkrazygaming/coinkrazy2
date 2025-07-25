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

// Get recent transactions for dashboard
router.get("/recent", verifyToken, async (req: any, res) => {
  try {
    const transactions = await executeQuery(
      `SELECT
        id, transaction_type, coin_type, amount, previous_balance,
        new_balance, description, status, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10`,
      [req.user.id],
    );

    // Format transactions for dashboard display
    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx.id.toString(),
      type: tx.transaction_type,
      amount: tx.amount,
      currency: tx.coin_type.toUpperCase(),
      description: tx.description,
      status: tx.status,
      created_at: tx.created_at,
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Recent transactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user transaction history
router.get("/history", verifyToken, async (req: any, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      coinType,
      status,
      startDate,
      endDate,
    } = req.query;

    let whereConditions = ["user_id = ?"];
    let queryParams = [req.user.id];

    if (type) {
      whereConditions.push("transaction_type = ?");
      queryParams.push(type);
    }

    if (coinType) {
      whereConditions.push("coin_type = ?");
      queryParams.push(coinType);
    }

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    if (startDate) {
      whereConditions.push("created_at >= ?");
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push("created_at <= ?");
      queryParams.push(endDate);
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const transactions = await executeQuery(
      `SELECT 
        id, transaction_type, coin_type, amount, previous_balance,
        new_balance, description, reference_id, status, 
        created_at, processed_at
      FROM transactions 
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit as string), offset],
    );

    // Get total count
    const totalResult = await executeQuery(
      `SELECT COUNT(*) as total
      FROM transactions 
      WHERE ${whereConditions.join(" AND ")}`,
      queryParams,
    );

    // Get summary statistics
    const summary = await executeQuery(
      `SELECT 
        transaction_type,
        coin_type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? AND status = 'completed'
      GROUP BY transaction_type, coin_type`,
      [req.user.id],
    );

    res.json({
      transactions,
      summary,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalResult[0].total,
        pages: Math.ceil(totalResult[0].total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Request withdrawal
router.post("/withdraw", verifyToken, async (req: any, res) => {
  try {
    const withdrawSchema = z.object({
      amount: z.number().min(1).max(1000),
      coinType: z.enum(["sweeps"]),
      withdrawalMethod: z.enum(["bank_transfer", "check", "paypal"]),
      bankInfo: z
        .object({
          accountNumber: z.string(),
          routingNumber: z.string(),
          accountName: z.string(),
        })
        .optional(),
      paypalEmail: z.string().email().optional(),
      address: z
        .object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          country: z.string(),
        })
        .optional(),
    });

    const validatedData = withdrawSchema.parse(req.body);

    // Check minimum withdrawal amount
    if (validatedData.amount < 10) {
      return res.status(400).json({
        message: "Minimum withdrawal amount is 10 Sweeps Coins",
      });
    }

    // Get user data
    const user = await executeQuery(
      "SELECT sweeps_coins, kyc_status FROM users WHERE id = ?",
      [req.user.id],
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check KYC status for withdrawals over $100
    if (validatedData.amount >= 100 && user[0].kyc_status !== "verified") {
      return res.status(400).json({
        message: "KYC verification required for withdrawals over $100",
      });
    }

    // Check balance
    if (user[0].sweeps_coins < validatedData.amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check daily withdrawal limit
    const todayWithdrawals = await executeQuery(
      `SELECT SUM(amount) as total
      FROM transactions 
      WHERE user_id = ? 
      AND transaction_type = 'withdrawal' 
      AND coin_type = 'sweeps'
      AND status IN ('pending', 'completed')
      AND DATE(created_at) = CURDATE()`,
      [req.user.id],
    );

    const dailyLimit = 1000; // $1000 daily limit
    const todayTotal = todayWithdrawals[0].total || 0;

    if (todayTotal + validatedData.amount > dailyLimit) {
      return res.status(400).json({
        message: `Daily withdrawal limit exceeded. Remaining: $${dailyLimit - todayTotal}`,
      });
    }

    // Create withdrawal transaction
    const newBalance = user[0].sweeps_coins - validatedData.amount;

    const transactionResult = await executeQuery(
      `INSERT INTO transactions (
        user_id, transaction_type, coin_type, amount, 
        previous_balance, new_balance, description, status, metadata
      ) VALUES (?, 'withdrawal', 'sweeps', ?, ?, ?, ?, 'pending', ?)`,
      [
        req.user.id,
        -validatedData.amount,
        user[0].sweeps_coins,
        newBalance,
        `Withdrawal request - ${validatedData.withdrawalMethod}`,
        JSON.stringify({
          withdrawalMethod: validatedData.withdrawalMethod,
          bankInfo: validatedData.bankInfo,
          paypalEmail: validatedData.paypalEmail,
          address: validatedData.address,
        }),
      ],
    );

    // Update user balance
    await executeQuery("UPDATE users SET sweeps_coins = ? WHERE id = ?", [
      newBalance,
      req.user.id,
    ]);

    res.json({
      message: "Withdrawal request submitted successfully",
      transactionId: transactionResult.insertId,
      amount: validatedData.amount,
      newBalance,
      status: "pending",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get withdrawal status
router.get("/withdrawals", verifyToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let whereConditions = [
      "user_id = ?",
      "transaction_type = 'withdrawal'",
      "coin_type = 'sweeps'",
    ];
    let queryParams = [req.user.id];

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const withdrawals = await executeQuery(
      `SELECT 
        id, amount, description, status, metadata,
        created_at, processed_at
      FROM transactions 
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit as string), offset],
    );

    // Parse metadata for withdrawal details
    const withdrawalsWithDetails = withdrawals.map((w: any) => ({
      ...w,
      withdrawalDetails: w.metadata ? JSON.parse(w.metadata) : null,
    }));

    res.json({ withdrawals: withdrawalsWithDetails });
  } catch (error) {
    console.error("Withdrawals fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get daily bonuses
router.get("/bonuses/daily", verifyToken, async (req: any, res) => {
  try {
    // Check if user already claimed today
    const todayClaim = await executeQuery(
      `SELECT id FROM transactions 
      WHERE user_id = ? 
      AND transaction_type = 'bonus' 
      AND description LIKE '%Daily Login%'
      AND DATE(created_at) = CURDATE()`,
      [req.user.id],
    );

    const canClaim = todayClaim.length === 0;

    // Get streak info
    const recentLogins = await executeQuery(
      `SELECT DATE(created_at) as login_date
      FROM transactions 
      WHERE user_id = ? 
      AND transaction_type = 'bonus' 
      AND description LIKE '%Daily Login%'
      ORDER BY created_at DESC 
      LIMIT 7`,
      [req.user.id],
    );

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < recentLogins.length; i++) {
      const loginDate = new Date(recentLogins[i].login_date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i - (canClaim ? 1 : 0));

      if (loginDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    res.json({
      canClaim,
      streak,
      nextClaimTime: canClaim
        ? null
        : new Date(today.getTime() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error("Daily bonus check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Claim daily bonus
router.post("/bonuses/daily/claim", verifyToken, async (req: any, res) => {
  try {
    // Check if already claimed today
    const todayClaim = await executeQuery(
      `SELECT id FROM transactions 
      WHERE user_id = ? 
      AND transaction_type = 'bonus' 
      AND description LIKE '%Daily Login%'
      AND DATE(created_at) = CURDATE()`,
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
      bonusAmount,
      newBalance,
    });
  } catch (error) {
    console.error("Daily bonus claim error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get available promotions
router.get("/promotions", verifyToken, async (req: any, res) => {
  try {
    const promotions = await executeQuery(
      `SELECT 
        p.id, p.name, p.description, p.promo_type, p.coin_type,
        p.bonus_amount, p.wagering_requirement, p.end_date,
        p.terms_conditions,
        CASE WHEN ub.id IS NOT NULL THEN 1 ELSE 0 END as already_claimed
      FROM promotions p
      LEFT JOIN user_bonuses ub ON p.id = ub.promotion_id AND ub.user_id = ?
      WHERE p.is_active = TRUE 
      AND p.start_date <= NOW() 
      AND p.end_date >= NOW()
      ORDER BY p.promo_type, p.created_at DESC`,
      [req.user.id],
    );

    res.json({ promotions });
  } catch (error) {
    console.error("Promotions fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Claim promotion
router.post("/promotions/:id/claim", verifyToken, async (req: any, res) => {
  try {
    // Get promotion details
    const promotion = await executeQuery(
      `SELECT * FROM promotions 
      WHERE id = ? AND is_active = TRUE 
      AND start_date <= NOW() AND end_date >= NOW()`,
      [req.params.id],
    );

    if (promotion.length === 0) {
      return res
        .status(404)
        .json({ message: "Promotion not found or expired" });
    }

    const promo = promotion[0];

    // Check if already claimed
    const existingClaim = await executeQuery(
      "SELECT id FROM user_bonuses WHERE user_id = ? AND promotion_id = ?",
      [req.user.id, promo.id],
    );

    if (existingClaim.length > 0) {
      return res.status(400).json({ message: "Promotion already claimed" });
    }

    // Get user data
    const user = await executeQuery(
      "SELECT gold_coins, sweeps_coins, level FROM users WHERE id = ?",
      [req.user.id],
    );

    // Check level requirement for VIP bonuses
    if (promo.promo_type === "loyalty" && user[0].level < 20) {
      return res.status(400).json({
        message: "VIP level required (Level 20+) to claim this bonus",
      });
    }

    // Calculate bonus amounts
    let goldBonus = 0;
    let sweepsBonus = 0;

    if (promo.coin_type === "gold" || promo.coin_type === "both") {
      goldBonus = promo.bonus_amount;
    }
    if (promo.coin_type === "sweeps" || promo.coin_type === "both") {
      sweepsBonus =
        promo.coin_type === "both"
          ? promo.bonus_amount / 100
          : promo.bonus_amount;
    }

    // Update user balances
    const newGoldBalance = user[0].gold_coins + goldBonus;
    const newSweepsBalance = user[0].sweeps_coins + sweepsBonus;

    await executeQuery(
      "UPDATE users SET gold_coins = ?, sweeps_coins = ? WHERE id = ?",
      [newGoldBalance, newSweepsBalance, req.user.id],
    );

    // Create bonus transactions
    if (goldBonus > 0) {
      await executeQuery(
        `INSERT INTO transactions (
          user_id, transaction_type, coin_type, amount, 
          previous_balance, new_balance, description, status, reference_id
        ) VALUES (?, 'bonus', 'gold', ?, ?, ?, ?, 'completed', ?)`,
        [
          req.user.id,
          goldBonus,
          user[0].gold_coins,
          newGoldBalance,
          `${promo.name} - Gold Coins`,
          promo.id,
        ],
      );
    }

    if (sweepsBonus > 0) {
      await executeQuery(
        `INSERT INTO transactions (
          user_id, transaction_type, coin_type, amount, 
          previous_balance, new_balance, description, status, reference_id
        ) VALUES (?, 'bonus', 'sweeps', ?, ?, ?, ?, 'completed', ?)`,
        [
          req.user.id,
          sweepsBonus,
          user[0].sweeps_coins,
          newSweepsBalance,
          `${promo.name} - Sweeps Coins`,
          promo.id,
        ],
      );
    }

    // Create user bonus record
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await executeQuery(
      `INSERT INTO user_bonuses (
        user_id, promotion_id, bonus_amount, wagering_requirement, expires_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        promo.id,
        promo.bonus_amount,
        promo.bonus_amount * promo.wagering_requirement,
        expiresAt,
      ],
    );

    res.json({
      message: "Promotion claimed successfully",
      goldBonus,
      sweepsBonus,
      newGoldBalance,
      newSweepsBalance,
    });
  } catch (error) {
    console.error("Promotion claim error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
