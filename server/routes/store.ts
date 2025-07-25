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

// Get all store packages
router.get("/packages", async (req, res) => {
  try {
    const packages = await executeQuery(
      `SELECT
        id, name, description, price, gold_coins, bonus_sweeps_coins,
        package_type, is_featured, sort_order
      FROM store_packages
      WHERE is_active = TRUE
      ORDER BY sort_order, price ASC`,
    );

    res.json({ packages });
  } catch (error) {
    console.error("Store packages fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get package details
router.get("/packages/:id", async (req, res) => {
  try {
    const storePackage = await executeQuery(
      `SELECT * FROM store_packages WHERE id = ? AND is_active = TRUE`,
      [req.params.id],
    );

    if (storePackage.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ package: storePackage[0] });
  } catch (error) {
    console.error("Package details fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Purchase package
router.post("/purchase", verifyToken, async (req: any, res) => {
  try {
    const purchaseSchema = z.object({
      packageId: z.number(),
      paymentMethod: z.enum([
        "google_pay",
        "apple_pay",
        "credit_card",
        "paypal",
      ]),
      paymentData: z.object({
        paymentMethodId: z.string().optional(),
        billingDetails: z.object({
          name: z.string(),
          email: z.string().email(),
          address: z
            .object({
              line1: z.string(),
              city: z.string(),
              state: z.string(),
              postal_code: z.string(),
              country: z.string(),
            })
            .optional(),
        }),
      }),
    });

    const validatedData = purchaseSchema.parse(req.body);

    // Get package details
    const storePackage = await executeQuery(
      "SELECT * FROM store_packages WHERE id = ? AND is_active = TRUE",
      [validatedData.packageId],
    );

    if (storePackage.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }

    const pkg = storePackage[0];

    // Simulate payment processing
    const paymentSuccess = await processPayment(
      pkg.price,
      validatedData.paymentMethod,
      validatedData.paymentData,
    );

    if (!paymentSuccess.success) {
      return res.status(400).json({
        message: "Payment failed",
        error: paymentSuccess.error,
      });
    }

    // Get user current balance
    const user = await executeQuery(
      "SELECT gold_coins, sweeps_coins FROM users WHERE id = ?",
      [req.user.id],
    );

    const newGoldBalance = user[0].gold_coins + pkg.gold_coins;
    const newSweepsBalance = user[0].sweeps_coins + pkg.bonus_sweeps_coins;

    // Update user balance
    await executeQuery(
      "UPDATE users SET gold_coins = ?, sweeps_coins = ?, experience_points = experience_points + ? WHERE id = ?",
      [
        newGoldBalance,
        newSweepsBalance,
        Math.floor(pkg.price * 10), // 10 XP per dollar
        req.user.id,
      ],
    );

    // Create purchase record
    const purchaseResult = await executeQuery(
      `INSERT INTO purchases (
        user_id, package_id, amount, payment_method, payment_provider,
        external_payment_id, status, gold_coins_received, sweeps_coins_received,
        payment_data
      ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
      [
        req.user.id,
        pkg.id,
        pkg.price,
        validatedData.paymentMethod,
        "stripe", // Payment provider
        paymentSuccess.transactionId,
        pkg.gold_coins,
        pkg.bonus_sweeps_coins,
        JSON.stringify(validatedData.paymentData),
      ],
    );

    // Create transaction records
    await executeQuery(
      `INSERT INTO transactions (
        user_id, transaction_type, coin_type, amount,
        previous_balance, new_balance, description, status, reference_id
      ) VALUES
      (?, 'purchase', 'gold', ?, ?, ?, ?, 'completed', ?),
      (?, 'purchase', 'sweeps', ?, ?, ?, ?, 'completed', ?)`,
      [
        req.user.id,
        pkg.gold_coins,
        user[0].gold_coins,
        newGoldBalance,
        `${pkg.name} - Gold Coins`,
        purchaseResult.insertId,
        req.user.id,
        pkg.bonus_sweeps_coins,
        user[0].sweeps_coins,
        newSweepsBalance,
        `${pkg.name} - Bonus Sweeps Coins`,
        purchaseResult.insertId,
      ],
    );

    res.json({
      message: "Purchase completed successfully",
      purchaseId: purchaseResult.insertId,
      goldCoinsReceived: pkg.gold_coins,
      sweepsCoinsReceived: pkg.bonus_sweeps_coins,
      newGoldBalance,
      newSweepsBalance,
      transactionId: paymentSuccess.transactionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get purchase history
router.get("/purchases", verifyToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const purchases = await executeQuery(
      `SELECT
        p.id, p.amount, p.payment_method, p.status,
        p.gold_coins_received, p.sweeps_coins_received, p.created_at,
        sp.name as package_name, sp.description as package_description
      FROM purchases p
      JOIN store_packages sp ON p.package_id = sp.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit as string), offset],
    );

    // Get total purchase stats
    const stats = await executeQuery(
      `SELECT
        COUNT(*) as total_purchases,
        SUM(amount) as total_spent,
        SUM(gold_coins_received) as total_gold_coins,
        SUM(sweeps_coins_received) as total_sweeps_coins
      FROM purchases
      WHERE user_id = ? AND status = 'completed'`,
      [req.user.id],
    );

    res.json({
      purchases,
      stats: stats[0],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: purchases.length,
      },
    });
  } catch (error) {
    console.error("Purchase history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get purchase receipt
router.get("/purchases/:id/receipt", verifyToken, async (req: any, res) => {
  try {
    const purchase = await executeQuery(
      `SELECT
        p.*, sp.name as package_name, sp.description as package_description,
        u.email, u.first_name, u.last_name
      FROM purchases p
      JOIN store_packages sp ON p.package_id = sp.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id],
    );

    if (purchase.length === 0) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const receipt = {
      ...purchase[0],
      payment_data: purchase[0].payment_data
        ? JSON.parse(purchase[0].payment_data)
        : null,
    };

    res.json({ receipt });
  } catch (error) {
    console.error("Receipt fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user spending stats
router.get("/stats", verifyToken, async (req: any, res) => {
  try {
    const stats = await executeQuery(
      `SELECT
        COUNT(DISTINCT DATE(created_at)) as days_purchased,
        COUNT(*) as total_purchases,
        SUM(amount) as total_spent,
        AVG(amount) as average_purchase,
        MAX(amount) as largest_purchase,
        SUM(gold_coins_received) as total_gold_received,
        SUM(sweeps_coins_received) as total_sweeps_received
      FROM purchases
      WHERE user_id = ? AND status = 'completed'`,
      [req.user.id],
    );

    // Get monthly spending
    const monthlySpending = await executeQuery(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as purchases,
        SUM(amount) as total
      FROM purchases
      WHERE user_id = ? AND status = 'completed'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC`,
      [req.user.id],
    );

    // Get favorite package type
    const favoritePackage = await executeQuery(
      `SELECT
        sp.package_type,
        COUNT(*) as purchase_count,
        SUM(p.amount) as total_spent
      FROM purchases p
      JOIN store_packages sp ON p.package_id = sp.id
      WHERE p.user_id = ? AND p.status = 'completed'
      GROUP BY sp.package_type
      ORDER BY purchase_count DESC
      LIMIT 1`,
      [req.user.id],
    );

    res.json({
      summary: stats[0],
      monthlySpending,
      favoritePackage: favoritePackage[0] || null,
    });
  } catch (error) {
    console.error("Store stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Payment processing function
async function processPayment(
  amount: number,
  method: string,
  paymentData: any,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    console.log(`Processing ${method} payment for $${amount}:`, {
      paymentMethodId: paymentData?.paymentMethodId?.substring(0, 20) + "...",
      email: paymentData?.email,
      billingDetails: paymentData?.billingDetails ? "provided" : "not provided",
    });

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (method === "google_pay") {
      // Validate Google Pay payment data
      if (!paymentData?.paymentMethodId) {
        return {
          success: false,
          error: "Invalid Google Pay payment data",
        };
      }

      // In a real implementation, you would:
      // 1. Validate the payment token with Google Pay
      // 2. Process the payment with your payment processor (Stripe, etc.)
      // 3. Handle the response and update your records

      // For now, simulate a successful payment with 98% success rate
      if (Math.random() < 0.98) {
        return {
          success: true,
          transactionId: `gpy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      } else {
        return {
          success: false,
          error:
            "Payment declined by your bank. Please try another payment method.",
        };
      }
    } else if (method === "credit_card") {
      // Handle credit card payments
      if (Math.random() < 0.95) {
        return {
          success: true,
          transactionId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      } else {
        return {
          success: false,
          error: "Credit card declined. Please check your card details.",
        };
      }
    } else if (method === "paypal") {
      // Handle PayPal payments
      if (!paymentData?.paymentMethodId) {
        return {
          success: false,
          error: "Invalid PayPal payment data",
        };
      }

      // In a real implementation, you would:
      // 1. Validate the PayPal order ID
      // 2. Capture the payment through PayPal API
      // 3. Verify the payment status

      // For now, simulate a successful payment with 97% success rate
      if (Math.random() < 0.97) {
        return {
          success: true,
          transactionId: `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
      } else {
        return {
          success: false,
          error:
            "PayPal payment was declined. Please try again or use another payment method.",
        };
      }
    } else {
      return {
        success: false,
        error: "Unsupported payment method",
      };
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: "Payment processing failed. Please try again.",
    };
  }
}

// Webhook endpoint for payment confirmations (for real payment processors)
router.post(
  "/webhook/payment",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // This would handle real webhooks from payment processors like Stripe
      // For now, we'll just acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ error: "Webhook failed" });
    }
  },
);

export default router;
