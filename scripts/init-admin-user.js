#!/usr/bin/env node

import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, "../database/coinkriazy.db");
console.log("Database path:", dbPath);

// Initialize database
const db = new Database(dbPath);

async function initAdminUser() {
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
    const existingUser = db
      .prepare(
        "SELECT id, username, email, is_admin FROM users WHERE email = ?",
      )
      .get(adminEmail);

    if (existingUser) {
      console.log("👤 Admin user already exists:", existingUser);

      // Update the existing user to ensure admin privileges and correct password
      const updateStmt = db.prepare(`
        UPDATE users 
        SET password_hash = ?, 
            is_admin = TRUE, 
            is_staff = TRUE, 
            username = ?, 
            email_verified_at = datetime('now'),
            kyc_status = 'verified'
        WHERE email = ?
      `);

      updateStmt.run(passwordHash, adminUsername, adminEmail);
      console.log(
        "✅ Admin user updated with correct credentials and privileges",
      );
    } else {
      // Create new admin user
      const insertStmt = db.prepare(`
        INSERT INTO users (
          username, email, password_hash, first_name, last_name,
          date_of_birth, country, gold_coins, sweeps_coins,
          level, experience_points, kyc_status, is_admin, is_staff,
          is_active, email_verified_at, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(
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
        true, // is_admin
        true, // is_staff
        true, // is_active
        new Date().toISOString(), // email_verified_at
        new Date().toISOString(), // registration_date
      );

      console.log(
        "✅ Admin user created successfully with ID:",
        result.lastInsertRowid,
      );
    }

    // Verify the admin user
    const adminUser = db
      .prepare(
        "SELECT id, username, email, is_admin, is_staff, kyc_status FROM users WHERE email = ?",
      )
      .get(adminEmail);

    console.log("🎯 Final admin user status:", adminUser);

    // Verify password
    const isPasswordValid = await bcrypt.compare(adminPassword, passwordHash);
    console.log(
      "🔐 Password verification:",
      isPasswordValid ? "✅ VALID" : "❌ INVALID",
    );

    console.log("\n🚀 Admin user initialization completed!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👑 Admin privileges: ENABLED");
    console.log("👮 Staff privileges: ENABLED");
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the initialization
initAdminUser();
