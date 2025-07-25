#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "coinkriazy_user",
  password: process.env.DB_PASSWORD || "CoinKriazy2024!",
  database: process.env.DB_NAME || "coinkriazy_casino",
  multipleStatements: true,
};

async function initializeDatabase() {
  let connection;

  try {
    console.log("🔄 Starting database initialization...");

    // Create connection without specifying database first
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;

    connection = await mysql.createConnection(tempConfig);
    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✅ Database ${dbConfig.database} created/verified`);

    // Close connection and reconnect to the specific database
    await connection.end();
    connection = await mysql.createConnection(dbConfig);

    // Read and execute schema
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await connection.execute(schema);
      console.log("✅ Database schema created successfully");
    } else {
      console.log("⚠️  Schema file not found, skipping schema creation");
    }

    // Read and execute seed data
    const seedPath = path.join(__dirname, "../database/seed_data.sql");
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, "utf8");
      await connection.execute(seedData);
      console.log("✅ Seed data inserted successfully");
    } else {
      console.log("⚠️  Seed data file not found, skipping data seeding");
    }

    // Verify installation
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users",
    );
    console.log(`✅ Database initialized with ${rows[0].count} users`);

    const [gameRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM games",
    );
    console.log(`✅ Database initialized with ${gameRows[0].count} games`);

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "💡 Make sure MySQL is running and credentials are correct",
      );
    } else if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Make sure MySQL server is running on the specified host and port",
      );
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createMySQLUser() {
  let connection;

  try {
    console.log("🔄 Creating MySQL user...");

    // Connect as root to create user
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: "root",
      password: process.env.MYSQL_ROOT_PASSWORD || "",
    });

    // Create user and grant privileges
    const user = process.env.DB_USER || "coinkriazy_user";
    const password = process.env.DB_PASSWORD || "CoinKriazy2024!";
    const database = process.env.DB_NAME || "coinkriazy_casino";

    await connection.execute(
      `CREATE USER IF NOT EXISTS '${user}'@'%' IDENTIFIED BY '${password}'`,
    );
    await connection.execute(
      `GRANT ALL PRIVILEGES ON ${database}.* TO '${user}'@'%'`,
    );
    await connection.execute(`FLUSH PRIVILEGES`);

    console.log(
      `✅ MySQL user '${user}' created with privileges on '${database}'`,
    );
  } catch (error) {
    console.error("❌ User creation failed:", error.message);
    console.log(
      "💡 You may need to create the MySQL user manually or run this script as root",
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--create-user")) {
    await createMySQLUser();
  }

  await initializeDatabase();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { initializeDatabase, createMySQLUser };
