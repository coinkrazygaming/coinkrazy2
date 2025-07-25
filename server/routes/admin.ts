import express from "express";
import { executeQuery, initializeDatabase } from "../config/database.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database with schema and seed data
router.post("/init-database", async (req, res) => {
  try {
    console.log("Starting database initialization...");

    // Initialize database connection
    await initializeDatabase();

    // Read and execute SQLite schema
    const schemaPath = path.join(__dirname, "../../database/sqlite-schema.sql");
    const schema = readFileSync(schemaPath, "utf8");

    // Split schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Executing ${statements.length} schema statements...`);

    for (const statement of statements) {
      try {
        await executeQuery(statement);
      } catch (error) {
        // Ignore table already exists errors
        if (!error.message.includes("already exists")) {
          console.warn("Schema statement warning:", error.message);
        }
      }
    }

    // Read and execute SQLite seed data
    const seedPath = path.join(__dirname, "../../database/sqlite-seed.sql");
    const seedData = readFileSync(seedPath, "utf8");

    // Split seed data into individual statements
    const seedStatements = seedData
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Executing ${seedStatements.length} seed statements...`);

    for (const statement of seedStatements) {
      try {
        await executeQuery(statement);
      } catch (error) {
        // Ignore duplicate key errors for seed data
        if (
          !error.message.includes("UNIQUE constraint failed") &&
          !error.message.includes("already exists")
        ) {
          console.warn("Seed statement warning:", error.message);
        }
      }
    }

    // Verify database by checking a few key tables
    const userCount = await executeQuery("SELECT COUNT(*) as count FROM users");
    const gameCount = await executeQuery("SELECT COUNT(*) as count FROM games");
    const categoryCount = await executeQuery(
      "SELECT COUNT(*) as count FROM game_categories",
    );

    console.log("Database initialization completed successfully!");

    res.json({
      success: true,
      message: "Database initialized successfully",
      stats: {
        users: userCount[0]?.count || 0,
        games: gameCount[0]?.count || 0,
        categories: categoryCount[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(500).json({
      success: false,
      message: "Database initialization failed",
      error: error.message,
    });
  }
});

// Test database connection
router.get("/test-database", async (req, res) => {
  try {
    const result = await executeQuery("SELECT 1 as test");
    res.json({
      success: true,
      message: "Database connection successful",
      result: result[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Fix user passwords with proper hashes
router.post("/fix-passwords", async (req, res) => {
  try {
    const bcrypt = await import("bcryptjs");

    // Generate proper hashes
    const adminHash = await bcrypt.hash("Woot6969!", 10);
    const demoHash = await bcrypt.hash("demo123", 10);

    // Update admin user
    await executeQuery("UPDATE users SET password_hash = ? WHERE email = ?", [
      adminHash,
      "coinkrazy00@gmail.com",
    ]);

    // Update demo user
    await executeQuery("UPDATE users SET password_hash = ? WHERE email = ?", [
      demoHash,
      "demo1@coinkriazy.com",
    ]);

    // Update other demo users with demo123 password
    await executeQuery(
      "UPDATE users SET password_hash = ? WHERE email LIKE 'demo%@coinkriazy.com'",
      [demoHash],
    );

    res.json({
      success: true,
      message: "User passwords updated successfully",
      hashes: {
        admin: adminHash.substring(0, 20) + "...",
        demo: demoHash.substring(0, 20) + "...",
      },
    });
  } catch (error) {
    console.error("Password fix failed:", error);
    res.status(500).json({
      success: false,
      message: "Password fix failed",
      error: error.message,
    });
  }
});

// Add email verification fields to existing users table
router.post("/add-email-verification", async (req, res) => {
  try {
    console.log("Adding email verification fields to users table...");

    // Add email verification columns if they don't exist
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN email_verified_at DATETIME",
      "ALTER TABLE users ADD COLUMN email_verification_token TEXT",
      "ALTER TABLE users ADD COLUMN email_verification_expires DATETIME",
    ];

    for (const query of alterQueries) {
      try {
        await executeQuery(query);
        console.log("Added column:", query);
      } catch (error) {
        if (error.message.includes("duplicate column name")) {
          console.log("Column already exists:", query);
        } else {
          console.warn("Migration warning:", error.message);
        }
      }
    }

    // Set existing users as verified (grandfather them in)
    await executeQuery(
      "UPDATE users SET email_verified_at = datetime('now') WHERE email_verified_at IS NULL",
    );

    res.json({
      success: true,
      message:
        "Email verification fields added successfully! Existing users grandfathered as verified. New users will need to verify email to get welcome bonus.",
    });
  } catch (error) {
    console.error("Email verification migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Email verification migration failed",
      error: error.message,
    });
  }
});

// Seed sports betting data
router.post("/seed-sports", async (req, res) => {
  try {
    console.log("Seeding sports betting data...");

    // Read sports seed file
    const sportsPath = path.join(__dirname, "../../database/sports-seed.sql");

    try {
      const sportsData = readFileSync(sportsPath, "utf8");

      // Split into individual statements
      const statements = sportsData
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      console.log(`Executing ${statements.length} sports seed statements...`);

      for (const statement of statements) {
        try {
          await executeQuery(statement);
        } catch (error) {
          // Ignore duplicate entries
          if (
            !error.message.includes("UNIQUE constraint") &&
            !error.message.includes("already exists")
          ) {
            console.warn("Sports seed statement warning:", error.message);
          }
        }
      }

      res.json({
        success: true,
        message: "Sports betting data seeded successfully!",
        statements: statements.length,
      });
    } catch (fileError) {
      console.warn("Sports seed file not found, using inline data");

      // Fallback to inline seed data with realistic betting volumes
      const fallbackStatements = [
        // Sports events
        `INSERT OR REPLACE INTO sports_events (id, sport, league, home_team, away_team, event_date, status, home_score, away_score) VALUES
         (1, 'NFL', 'NFL', 'Kansas City Chiefs', 'Buffalo Bills', '2024-12-22 20:00:00', 'upcoming', 0, 0),
         (2, 'NBA', 'NBA', 'Los Angeles Lakers', 'Golden State Warriors', '2024-12-20 22:00:00', 'live', 89, 94),
         (3, 'Soccer', 'La Liga', 'Real Madrid', 'FC Barcelona', '2024-12-21 21:00:00', 'upcoming', 0, 0)`,

        // Sports odds
        `INSERT OR REPLACE INTO sports_odds (id, event_id, bet_type, bet_option, odds) VALUES
         (1, 1, 'moneyline', 'Kansas City Chiefs', 1.85),
         (2, 1, 'moneyline', 'Buffalo Bills', 1.95),
         (3, 2, 'moneyline', 'Los Angeles Lakers', 2.10),
         (4, 2, 'moneyline', 'Golden State Warriors', 1.75),
         (5, 3, 'moneyline', 'Real Madrid', 2.30),
         (6, 3, 'moneyline', 'FC Barcelona', 2.80)`,

        // Today's bets with realistic volumes (mix of pending, won, and lost)
        `INSERT OR REPLACE INTO sports_bets (user_id, event_id, odds_id, bet_amount, potential_win, actual_win, status, placed_at, settled_at) VALUES
         (3, 1, 1, 50.00, 92.50, 92.50, 'won', datetime('now', '-2 hours'), datetime('now', '-1 hour')),
         (4, 2, 3, 75.00, 157.50, 0.00, 'pending', datetime('now', '-1 hour'), NULL),
         (5, 3, 5, 100.00, 230.00, 0.00, 'pending', datetime('now', '-30 minutes'), NULL),
         (6, 1, 2, 85.00, 165.75, 165.75, 'won', datetime('now', '-3 hours'), datetime('now', '-2 hours')),
         (7, 2, 4, 60.00, 105.00, 0.00, 'lost', datetime('now', '-4 hours'), datetime('now', '-3 hours')),
         (8, 3, 6, 120.00, 336.00, 336.00, 'won', datetime('now', '-5 hours'), datetime('now', '-4 hours')),
         (3, 1, 1, 40.00, 74.00, 74.00, 'won', datetime('now', '-6 hours'), datetime('now', '-5 hours')),
         (4, 2, 3, 90.00, 189.00, 0.00, 'pending', datetime('now', '-7 hours'), NULL),
         (5, 3, 5, 65.00, 149.50, 0.00, 'lost', datetime('now', '-8 hours'), datetime('now', '-7 hours')),
         (6, 1, 2, 110.00, 214.50, 214.50, 'won', datetime('now', '-9 hours'), datetime('now', '-8 hours')),
         (7, 2, 4, 45.00, 78.75, 0.00, 'pending', datetime('now', '-10 hours'), NULL),
         (8, 3, 6, 200.00, 560.00, 0.00, 'lost', datetime('now', '-11 hours'), datetime('now', '-10 hours')),
         (3, 1, 1, 55.00, 101.75, 101.75, 'won', datetime('now', '-12 hours'), datetime('now', '-11 hours')),
         (4, 2, 3, 80.00, 168.00, 168.00, 'won', datetime('now', '-13 hours'), datetime('now', '-12 hours')),
         (5, 3, 5, 95.00, 218.50, 0.00, 'pending', datetime('now', '-14 hours'), NULL),
         (6, 1, 2, 70.00, 136.50, 0.00, 'lost', datetime('now', '-15 hours'), datetime('now', '-14 hours')),
         (7, 2, 4, 150.00, 262.50, 262.50, 'won', datetime('now', '-16 hours'), datetime('now', '-15 hours')),
         (8, 3, 6, 35.00, 98.00, 98.00, 'won', datetime('now', '-17 hours'), datetime('now', '-16 hours')),
         (3, 1, 1, 125.00, 231.25, 0.00, 'pending', datetime('now', '-18 hours'), NULL),
         (4, 2, 3, 25.00, 52.50, 0.00, 'lost', datetime('now', '-19 hours'), datetime('now', '-18 hours'))`,
      ];

      for (const statement of fallbackStatements) {
        try {
          await executeQuery(statement);
        } catch (error) {
          console.warn("Fallback statement warning:", error.message);
        }
      }

      res.json({
        success: true,
        message: "Sports betting fallback data seeded successfully!",
        statements: fallbackStatements.length,
      });
    }
  } catch (error) {
    console.error("Sports seeding failed:", error);
    res.status(500).json({
      success: false,
      message: "Sports seeding failed",
      error: error.message,
    });
  }
});

// Initialize default admin user
router.post("/init-admin-user", async (req, res) => {
  try {
    console.log("🔧 Initializing admin user...");

    // Admin user credentials
    const adminEmail = "coinkrazy00@gmail.com";
    const adminPassword = "Woot6969!";
    const adminUsername = "admin";

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log("✅ Password hashed successfully");

    // Check if admin user already exists
    const existingUsers = await executeQuery(
      "SELECT id, username, email, is_admin FROM users WHERE email = ?",
      [adminEmail],
    );

    let adminUser;

    if (existingUsers.length > 0) {
      console.log("👤 Admin user already exists:", existingUsers[0]);

      // Update the existing user to ensure admin privileges and correct password
      await executeQuery(
        `UPDATE users
         SET password_hash = ?,
             is_admin = 1,
             is_staff = 1,
             username = ?,
             email_verified_at = datetime('now'),
             kyc_status = 'verified'
         WHERE email = ?`,
        [passwordHash, adminUsername, adminEmail],
      );

      console.log(
        "✅ Admin user updated with correct credentials and privileges",
      );
    } else {
      // Create new admin user
      const result = await executeQuery(
        `INSERT INTO users (
          username, email, password_hash, first_name, last_name,
          date_of_birth, country, gold_coins, sweeps_coins,
          level, experience_points, kyc_status, is_admin, is_staff,
          is_active, email_verified_at, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          adminUsername,
          adminEmail,
          passwordHash,
          "Casino",
          "Administrator",
          "1990-01-01",
          "United States",
          1000000.0, // 1M gold coins
          10000.0, // 10K sweeps coins
          50, // Max level
          100000, // Max experience
          "verified", // KYC verified
          1, // is_admin (SQLite uses integers for booleans)
          1, // is_staff
          1, // is_active
          new Date().toISOString(), // email_verified_at
          new Date().toISOString(), // registration_date
        ],
      );

      console.log(
        "✅ Admin user created successfully with ID:",
        result.insertId,
      );
    }

    // Verify the admin user
    const adminUsers = await executeQuery(
      "SELECT id, username, email, is_admin, is_staff, kyc_status FROM users WHERE email = ?",
      [adminEmail],
    );
    adminUser = adminUsers[0];

    console.log("🎯 Final admin user status:", adminUser);

    // Verify password
    const isPasswordValid = await bcrypt.compare(adminPassword, passwordHash);
    console.log(
      "🔐 Password verification:",
      isPasswordValid ? "✅ VALID" : "❌ INVALID",
    );

    res.json({
      success: true,
      message: "Admin user initialized successfully!",
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        is_admin: Boolean(adminUser.is_admin),
        is_staff: Boolean(adminUser.is_staff),
        kyc_status: adminUser.kyc_status,
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      passwordValid: isPasswordValid,
    });
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize admin user",
      error: error.message,
    });
  }
});

export default router;
