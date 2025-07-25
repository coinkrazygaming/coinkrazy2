#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const DB_TYPE = process.env.DB_TYPE || "sqlite";

// MySQL configuration
const mysqlConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "coinkriazy_user",
  password: process.env.DB_PASSWORD || "CoinKriazy2024!",
  database: process.env.DB_NAME || "coinkriazy_casino",
  multipleStatements: true,
};

// SQLite configuration
const sqliteConfig = {
  filename:
    process.env.SQLITE_DB || path.join(__dirname, "../database/coinkriazy.db"),
  driver: sqlite3.Database,
};

async function setupMySQL() {
  let connection;

  try {
    console.log("🔄 Setting up MySQL database...");

    // Create connection without specifying database first
    const tempConfig = { ...mysqlConfig };
    delete tempConfig.database;

    connection = await mysql.createConnection(tempConfig);
    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${mysqlConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✅ Database ${mysqlConfig.database} created/verified`);

    // Close connection and reconnect to the specific database
    await connection.end();
    connection = await mysql.createConnection(mysqlConfig);

    // Read and execute schema
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await connection.execute(schema);
      console.log("✅ MySQL schema created successfully");
    } else {
      console.log("⚠️  MySQL schema file not found, skipping schema creation");
    }

    // Read and execute seed data
    const seedPath = path.join(__dirname, "../database/seed_data.sql");
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, "utf8");
      await connection.execute(seedData);
      console.log("✅ MySQL seed data inserted successfully");
    } else {
      console.log("⚠️  MySQL seed data file not found, skipping data seeding");
    }

    // Verify installation
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users",
    );
    console.log(`✅ MySQL database initialized with ${rows[0].count} users`);

    const [gameRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM games",
    );
    console.log(
      `✅ MySQL database initialized with ${gameRows[0].count} games`,
    );
  } catch (error) {
    console.error("❌ MySQL setup failed:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "💡 Make sure MySQL is running and credentials are correct",
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Make sure MySQL server is running on the specified host and port",
      );
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function setupSQLite() {
  let db;

  try {
    console.log("🔄 Setting up SQLite database...");

    // Ensure database directory exists
    const dbDir = path.dirname(sqliteConfig.filename);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open SQLite database
    db = await open(sqliteConfig);
    console.log(`✅ SQLite database opened: ${sqliteConfig.filename}`);

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON;");

    // Read and execute schema
    const schemaPath = path.join(__dirname, "../database/sqlite-schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await db.exec(schema);
      console.log("✅ SQLite schema created successfully");
    } else {
      console.log("⚠️  SQLite schema file not found, skipping schema creation");
    }

    // Read and execute seed data
    const seedPath = path.join(__dirname, "../database/sqlite-seed.sql");
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, "utf8");
      await db.exec(seedData);
      console.log("✅ SQLite seed data inserted successfully");
    } else {
      console.log("⚠️  SQLite seed data file not found, skipping data seeding");
    }

    // Verify installation
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`✅ SQLite database initialized with ${userCount.count} users`);

    const gameCount = await db.get("SELECT COUNT(*) as count FROM games");
    console.log(`✅ SQLite database initialized with ${gameCount.count} games`);
  } catch (error) {
    console.error("❌ SQLite setup failed:", error.message);
    throw error;
  } finally {
    if (db) {
      await db.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  console.log(`🎯 Database Type: ${DB_TYPE.toUpperCase()}`);
  console.log("🔄 Starting database setup...");

  try {
    if (DB_TYPE === "mysql") {
      await setupMySQL();
    } else {
      await setupSQLite();
    }

    console.log("🎉 Database setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Start the development server: npm run dev");
    console.log("2. Visit the application in your browser");
    console.log("3. Login with admin credentials:");
    console.log("   Email: coinkrazy00@gmail.com");
    console.log("   Password: Woot6969!");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { setupMySQL, setupSQLite };
