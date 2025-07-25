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

// Get user's notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    // Mock notifications for demo
    const notifications = [
      {
        id: "1",
        type: "win",
        title: "🎉 Big Win!",
        message: "You won 500 GC playing Gold Rush Deluxe!",
        amount: 500,
        currency: "GC",
        priority: "high",
        icon: "🎰",
        read: false,
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "2",
        type: "bonus",
        title: "🎁 Daily Bonus",
        message: "Your daily login bonus is ready!",
        amount: 250,
        currency: "GC",
        priority: "medium",
        icon: "🎁",
        read: false,
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "3",
        type: "achievement",
        title: "🏆 Level Up!",
        message: "Congratulations! You reached level 13!",
        priority: "medium",
        icon: "🏆",
        read: true,
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
    ];

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get recent notifications since a timestamp
router.get("/recent", verifyToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    res.status(500).json({ error: "Failed to fetch recent notifications" });
  }
});

// Create a new notification
router.post("/", verifyToken, async (req, res) => {
  try {
    const notification = {
      id: Date.now().toString(),
      ...req.body,
      timestamp: new Date().toISOString(),
      read: false,
    };

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", verifyToken, async (req, res) => {
  try {
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Delete a notification
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// Clear all notifications
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// Get notification stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    res.json({
      total: 3,
      unread: 2,
      wins: 1,
      bonuses: 1,
      high_priority: 1,
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ error: "Failed to fetch notification stats" });
  }
});

export default router;
