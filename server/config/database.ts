import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Database type configuration
const DB_TYPE = process.env.DB_TYPE || "sqlite"; // 'mysql', 'sqlite', or 'neon'

const mysqlConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "coinkriazy_user",
  password: process.env.DB_PASSWORD || "CoinKriazy2024!",
  database: process.env.DB_NAME || "coinkriazy_casino",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const sqliteConfig = {
  filename:
    process.env.SQLITE_DB ||
    path.join(__dirname, "../../database/coinkriazy.db"),
  driver: sqlite3.Database,
};

const neonConfig = {
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
};

// Create connection pool for MySQL, SQLite, or Neon database connection
let pool: any = null;
let sqliteDb: Database | null = null;
let neonSql: any = null;

if (DB_TYPE === "mysql") {
  pool = mysql.createPool(mysqlConfig);
} else if (DB_TYPE === "neon") {
  neonSql = neon(neonConfig.connectionString);
} else {
  // SQLite connection will be opened when needed
}

// Get SQLite database connection
async function getSqliteDb(): Promise<Database> {
  if (!sqliteDb) {
    sqliteDb = await open(sqliteConfig);
    await sqliteDb.exec("PRAGMA foreign_keys = ON;");
  }
  return sqliteDb;
}

// Test connection
export async function testConnection() {
  try {
    if (DB_TYPE === "mysql") {
      const connection = await pool.getConnection();
      console.log("✅ MySQL database connected successfully");
      connection.release();
    } else if (DB_TYPE === "neon") {
      await neonSql`SELECT 1`;
      console.log("✅ Neon database connected successfully");
    } else {
      const db = await getSqliteDb();
      await db.get("SELECT 1");
      console.log("✅ SQLite database connected successfully");
    }
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Execute query helper
export async function executeQuery(
  query: string,
  params: any[] = [],
): Promise<any> {
  try {
    if (DB_TYPE === "mysql") {
      const [results] = await pool.execute(query, params);
      return results;
            } else if (DB_TYPE === "neon") {
      // For Neon, convert ? placeholders to $1, $2, etc. and use the pg-style interface
      if (params.length > 0) {
        let paramIndex = 1;
        const neonQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
        const result = await neonSql(neonQuery, params);
        return result;
      } else {
        const result = await neonSql(query);
        return result;
      }
    } else {
      const db = await getSqliteDb();

      // Convert MySQL-style queries to SQLite-compatible ones
      let sqliteQuery = query
        .replace(/`/g, '"') // Replace backticks with double quotes
        .replace(/CURDATE\(\)/g, "date('now')")
        .replace(/NOW\(\)/g, "datetime('now')")
        // Fix DATE_SUB patterns more comprehensively
        .replace(
          /DATE_SUB\(NOW\(\), INTERVAL (\d+) (MINUTE|HOUR|DAY|MONTH|YEAR)\)/gi,
          "datetime('now', '-$1 $2s')",
        )
        .replace(
          /DATE_SUB\(datetime\('now'\), INTERVAL (\d+) (MINUTE|HOUR|DAY|MONTH|YEAR)\)/gi,
          "datetime('now', '-$1 $2s')",
        )
        // Fix DATE() function
        .replace(/DATE\(([^)]+)\)/g, "date($1)")
        .replace(/AUTO_INCREMENT/gi, "AUTOINCREMENT")
        .replace(/BOOLEAN/gi, "INTEGER")
        .replace(/TEXT COLLATE utf8mb4_unicode_ci/gi, "TEXT")
        .replace(/TIMESTAMP/gi, "DATETIME")
        .replace(/DECIMAL\(\d+,\d+\)/gi, "REAL")
        .replace(/INT\(\d+\)/gi, "INTEGER")
        .replace(/VARCHAR\(\d+\)/gi, "TEXT")
        .replace(/ENUM\([^)]+\)/gi, "TEXT")
        .replace(/JSON/gi, "TEXT");

      if (sqliteQuery.toUpperCase().includes("SELECT")) {
        return await db.all(sqliteQuery, params);
      } else if (
        sqliteQuery.toUpperCase().includes("INSERT") ||
        sqliteQuery.toUpperCase().includes("UPDATE") ||
        sqliteQuery.toUpperCase().includes("DELETE")
      ) {
        const result = await db.run(sqliteQuery, params);
        return { insertId: result.lastID, affectedRows: result.changes };
      } else {
        return await db.exec(sqliteQuery);
      }
    }
  } catch (error) {
    console.error("Database query error:", error);
    console.error("Query:", query);
    console.error("Params:", params);
    throw error;
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    if (DB_TYPE === "mysql") {
      // Create database if it doesn't exist
      const createDbQuery = `CREATE DATABASE IF NOT EXISTS ${mysqlConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
      const tempPool = mysql.createPool({
        ...mysqlConfig,
        database: undefined,
      });

      await tempPool.execute(createDbQuery);
      console.log(`✅ MySQL database ${mysqlConfig.database} created/verified`);
      await tempPool.end();
    } else if (DB_TYPE === "neon") {
      // For Neon, the database is already created, just test the connection
      console.log(`✅ Neon database connection verified`);
    } else {
      // For SQLite, just ensure the database file exists
      const db = await getSqliteDb();
      console.log(`✅ SQLite database ${sqliteConfig.filename} opened/created`);
    }

    // Test connection with the actual database
    await testConnection();

    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Export database type for external use
export const getDatabaseType = () => DB_TYPE;

// Close database connection
export async function closeDatabase() {
  try {
    if (DB_TYPE === "mysql" && pool) {
      await pool.end();
    } else if (DB_TYPE === "neon") {
      // Neon connections are automatically managed, no explicit close needed
      console.log("✅ Neon database connection will be automatically managed");
    } else if (sqliteDb) {
      await sqliteDb.close();
      sqliteDb = null;
    }
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
}
