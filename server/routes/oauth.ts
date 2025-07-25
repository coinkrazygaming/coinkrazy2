import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "coinkriazy_jwt_secret_2024";

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8080";

// Configure Google OAuth strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/oauth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google OAuth profile:", profile);

          const email = profile.emails?.[0]?.value;
          const firstName = profile.name?.givenName || "";
          const lastName = profile.name?.familyName || "";
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email provided by Google"), null);
          }

          // Check if user exists
          let users = [];
          try {
            users = await executeQuery(
              "SELECT * FROM users WHERE email = ? OR google_id = ?",
              [email, googleId],
            );
          } catch (dbError) {
            console.log("Database not available, checking mock users");
            // Check mock users if database is unavailable
            const mockUsers = [
              {
                id: 1,
                username: "admin",
                email: "coinkrazy00@gmail.com",
                first_name: "Casino",
                last_name: "Administrator",
                gold_coins: 1000000.0,
                sweeps_coins: 10000.0,
                level: 50,
                experience_points: 100000,
                kyc_status: "verified",
                is_admin: true,
                is_staff: true,
                is_active: true,
                google_id: null,
              },
            ];
            users = mockUsers.filter((u) => u.email === email);
          }

          let user;

          if (users.length > 0) {
            // User exists, update Google ID if not set
            user = users[0];
            if (!user.google_id && user.id) {
              try {
                await executeQuery(
                  "UPDATE users SET google_id = ? WHERE id = ?",
                  [googleId, user.id],
                );
                user.google_id = googleId;
              } catch (updateError) {
                console.log("Could not update Google ID in database");
              }
            }
          } else {
            // Create new user
            try {
              const result = await executeQuery(
                `INSERT INTO users (
                  username, email, first_name, last_name, google_id,
                  gold_coins, sweeps_coins, level, experience_points,
                  kyc_status, is_admin, is_staff, is_active,
                  email_verified_at, registration_date, country
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  email.split("@")[0], // Username from email
                  email,
                  firstName,
                  lastName,
                  googleId,
                  10000.0, // Welcome bonus gold coins
                  10.0, // Welcome bonus sweeps coins
                  1, // Starting level
                  0, // Starting experience
                  "pending", // KYC status
                  false, // is_admin
                  false, // is_staff
                  true, // is_active
                  new Date().toISOString(), // email_verified_at (OAuth emails are verified)
                  new Date().toISOString(), // registration_date
                  "Unknown", // country
                ],
              );

              // Get the created user
              const newUsers = await executeQuery(
                "SELECT * FROM users WHERE id = ?",
                [result.insertId],
              );
              user = newUsers[0];

              // Create welcome bonus transactions
              await executeQuery(
                `INSERT INTO transactions (
                  user_id, transaction_type, coin_type, amount,
                  previous_balance, new_balance, description, status
                ) VALUES
                (?, 'bonus', 'gold', 10000.00, 0.00, 10000.00, 'Google OAuth Welcome Bonus - Gold Coins', 'completed'),
                (?, 'bonus', 'sweeps', 10.00, 0.00, 10.00, 'Google OAuth Welcome Bonus - Sweeps Coins', 'completed')`,
                [result.insertId, result.insertId],
              );
            } catch (createError) {
              console.log("Could not create user in database:", createError);
              // Create a temporary user object for systems without database
              user = {
                id: Date.now(), // Temporary ID
                username: email.split("@")[0],
                email,
                first_name: firstName,
                last_name: lastName,
                google_id: googleId,
                gold_coins: 10000.0,
                sweeps_coins: 10.0,
                level: 1,
                experience_points: 0,
                kyc_status: "pending",
                is_admin: false,
                is_staff: false,
                is_active: true,
              };
            }
          }

          return done(null, user);
        } catch (error) {
          console.error("OAuth error:", error);
          return done(error, null);
        }
      },
    ),
  );
}

// Initialize passport
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const users = await executeQuery("SELECT * FROM users WHERE id = ?", [id]);
    done(null, users[0] || null);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to generate JWT
function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      is_admin: user.is_admin,
      is_staff: user.is_staff,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.redirect(`${CLIENT_URL}/auth?error=oauth_failed`);
      }

      // Generate JWT token
      const token = generateToken(user);

      // Redirect to frontend with token
      res.redirect(`${CLIENT_URL}/auth?token=${token}&success=true`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${CLIENT_URL}/auth?error=oauth_callback_failed`);
    }
  },
);

// Facebook OAuth routes (placeholder for future implementation)
router.get("/facebook", (req, res) => {
  res.status(501).json({
    message: "Facebook OAuth not implemented yet",
    availableProviders: ["google"],
  });
});

router.get("/facebook/callback", (req, res) => {
  res.status(501).json({
    message: "Facebook OAuth not implemented yet",
    availableProviders: ["google"],
  });
});

// Get available OAuth providers
router.get("/providers", (req, res) => {
  const providers = [];

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    providers.push({
      name: "google",
      displayName: "Google",
      authUrl: "/api/oauth/google",
      enabled: true,
    });
  }

  providers.push({
    name: "facebook",
    displayName: "Facebook",
    authUrl: "/api/oauth/facebook",
    enabled: false,
    note: "Coming soon",
  });

  res.json({ providers });
});

export default router;
