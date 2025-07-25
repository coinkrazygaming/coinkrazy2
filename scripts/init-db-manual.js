#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeSQLiteDatabase() {
  const dbPath = path.join(__dirname, "../database/coinkriazy.db");
  const schemaPath = path.join(__dirname, "../database/sqlite-schema.sql");
  const seedPath = path.join(__dirname, "../database/sqlite-seed.sql");

  try {
    console.log("🔄 Initializing SQLite database...");

    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log(`✅ SQLite database opened: ${dbPath}`);

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON;");

    // Execute schema
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await db.exec(schema);
      console.log("✅ Database schema created");
    }

    // Execute seed data
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, "utf8");
      await db.exec(seedData);
      console.log("✅ Seed data inserted");
    }

    // Verify
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    const gameCount = await db.get("SELECT COUNT(*) as count FROM games");

    console.log(`✅ Database initialized with:`);
    console.log(`   - ${userCount.count} users`);
    console.log(`   - ${gameCount.count} games`);

    await db.close();
    console.log("🎉 Database initialization completed!");

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

// Run initialization
initializeSQLiteDatabase()
  .then((success) => {
    if (success) {
      console.log("\n📋 Next steps:");
      console.log("1. Start the server: npm run dev");
      console.log("2. Login with admin credentials:");
      console.log("   Email: coinkrazy00@gmail.com");
      console.log("   Password: Woot6969!");
    }
    process.exit(success ? 0 : 1);
  })
  .catch(console.error);
