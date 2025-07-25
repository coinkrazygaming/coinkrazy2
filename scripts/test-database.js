#!/usr/bin/env node

import {
  testConnection,
  executeQuery,
  getDatabaseType,
} from "../server/config/database.js";

async function testDatabase() {
  try {
    console.log(
      `🎯 Testing ${getDatabaseType().toUpperCase()} database connection...`,
    );

    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    // Test a simple query
    try {
      const users = await executeQuery("SELECT COUNT(*) as count FROM users");
      console.log(`✅ Found ${users[0]?.count || 0} users in database`);
    } catch (error) {
      console.log(
        "⚠️  Users table not found - database may need to be initialized",
      );
    }

    // Test games table
    try {
      const games = await executeQuery("SELECT COUNT(*) as count FROM games");
      console.log(`✅ Found ${games[0]?.count || 0} games in database`);
    } catch (error) {
      console.log(
        "⚠️  Games table not found - database may need to be initialized",
      );
    }

    console.log("🎉 Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    process.exit(1);
  }
}

testDatabase();
