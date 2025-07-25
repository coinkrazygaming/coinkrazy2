import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import gameRoutes from "./routes/games.js";
import transactionRoutes from "./routes/transactions.js";
import adminRoutes from "./routes/admin.js";
import staffRoutes from "./routes/staff.js";
import storeRoutes from "./routes/store.js";
import publicRoutes from "./routes/public.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from "./routes/notifications.js";
import sportsRoutes from "./routes/sports.js";
import oauthRoutes from "./routes/oauth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export function createServer() {
  const app = express();

  // Trust proxy for rate limiting in cloud environments
  app.set("trust proxy", 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
  });
  app.use("/api", limiter);

  // CORS configuration
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://coinkriazy.com", "https://www.coinkriazy.com"]
          : ["http://localhost:8080", "http://localhost:5173"],
      credentials: true,
    }),
  );

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Session middleware for OAuth
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "coinkriazy_session_secret_2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // API routes
  app.use("/api/public", publicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/oauth", oauthRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/games", gameRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/store", storeRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/sports", sportsRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    });
  });

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
  }

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(err.stack);
      res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    },
  );

  return app;
}
