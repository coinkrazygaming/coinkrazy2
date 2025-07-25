import express from "express";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";
import { z } from "zod";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "coinkriazy_jwt_secret_2024";

// Middleware to verify JWT token and staff access
function verifyStaffToken(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.isStaff && !decoded.isAdmin) {
      return res.status(403).json({ message: "Staff access required" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get staff dashboard
router.get("/dashboard", verifyStaffToken, async (req: any, res) => {
  try {
    // Today's stats
    const todayStats = await executeQuery(
      `SELECT 
        COUNT(CASE WHEN transaction_type = 'withdrawal' AND status = 'pending' THEN 1 END) as pending_withdrawals,
        COUNT(CASE WHEN kyc_status = 'pending' THEN 1 END) as pending_kyc,
        COUNT(CASE WHEN DATE(registration_date) = CURDATE() THEN 1 END) as new_users_today,
        COUNT(CASE WHEN DATE(last_login) = CURDATE() THEN 1 END) as active_users_today
      FROM users
      CROSS JOIN transactions`,
    );

    // Support tickets
    const ticketStats = await executeQuery(
      `SELECT 
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN assigned_to = ? THEN 1 END) as my_tickets
      FROM support_tickets`,
      [req.user.id],
    );

    // Recent activities
    const recentTickets = await executeQuery(
      `SELECT 
        st.id, st.subject, st.priority, st.status, st.created_at,
        u.username
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.status IN ('open', 'in_progress')
      ORDER BY st.created_at DESC
      LIMIT 5`,
    );

    const pendingWithdrawals = await executeQuery(
      `SELECT 
        t.id, t.amount, t.created_at,
        u.username, u.kyc_status
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.transaction_type = 'withdrawal' 
      AND t.status = 'pending'
      ORDER BY t.created_at ASC
      LIMIT 5`,
    );

    // Staff member's schedule today
    const mySchedule = await executeQuery(
      `SELECT 
        ss.shift_start, ss.shift_end, ss.status,
        sr.role_name, sr.hourly_rate
      FROM staff_schedules ss
      JOIN staff_roles sr ON ss.role_id = sr.id
      WHERE ss.user_id = ? 
      AND DATE(ss.shift_start) = CURDATE()`,
      [req.user.id],
    );

    res.json({
      todayStats: todayStats[0],
      ticketStats: ticketStats[0],
      recentTickets,
      pendingWithdrawals,
      mySchedule: mySchedule[0] || null,
    });
  } catch (error) {
    console.error("Staff dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Support ticket management
router.get("/tickets", verifyStaffToken, async (req: any, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assigned = "all",
    } = req.query;

    let whereConditions = [];
    let queryParams: any[] = [];

    if (status && status !== "all") {
      whereConditions.push("st.status = ?");
      queryParams.push(status);
    }

    if (priority && priority !== "all") {
      whereConditions.push("st.priority = ?");
      queryParams.push(priority);
    }

    if (category && category !== "all") {
      whereConditions.push("st.category = ?");
      queryParams.push(category);
    }

    if (assigned === "me") {
      whereConditions.push("st.assigned_to = ?");
      queryParams.push(req.user.id);
    } else if (assigned === "unassigned") {
      whereConditions.push("st.assigned_to IS NULL");
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const tickets = await executeQuery(
      `SELECT 
        st.*, 
        u.username, u.email,
        staff.username as assigned_to_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN users staff ON st.assigned_to = staff.id
      ${whereClause}
      ORDER BY 
        CASE st.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        st.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit as string), offset],
    );

    res.json({ tickets });
  } catch (error) {
    console.error("Tickets fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get ticket details
router.get("/tickets/:id", verifyStaffToken, async (req: any, res) => {
  try {
    const ticket = await executeQuery(
      `SELECT 
        st.*, 
        u.username, u.email, u.first_name, u.last_name,
        staff.username as assigned_to_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN users staff ON st.assigned_to = staff.id
      WHERE st.id = ?`,
      [req.params.id],
    );

    if (ticket.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Get ticket messages
    const messages = await executeQuery(
      `SELECT 
        sm.*, u.username, u.first_name, u.last_name
      FROM support_messages sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.ticket_id = ?
      ORDER BY sm.created_at ASC`,
      [req.params.id],
    );

    res.json({
      ticket: ticket[0],
      messages,
    });
  } catch (error) {
    console.error("Ticket details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update ticket
router.put("/tickets/:id", verifyStaffToken, async (req: any, res) => {
  try {
    const updateSchema = z.object({
      status: z
        .enum(["open", "in_progress", "waiting_user", "resolved", "closed"])
        .optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assignedTo: z.number().optional(),
      resolution: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        let dbField = key;
        if (key === "assignedTo") dbField = "assigned_to";
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add resolved_at if status is resolved
    if (
      validatedData.status === "resolved" ||
      validatedData.status === "closed"
    ) {
      updateFields.push("resolved_at = NOW()");
    }

    updateValues.push(req.params.id);

    await executeQuery(
      `UPDATE support_tickets SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      updateValues,
    );

    // If assigning to self, make sure it's in_progress
    if (validatedData.assignedTo === req.user.id && !validatedData.status) {
      await executeQuery(
        "UPDATE support_tickets SET status = 'in_progress' WHERE id = ?",
        [req.params.id],
      );
    }

    res.json({ message: "Ticket updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Ticket update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add message to ticket
router.post(
  "/tickets/:id/messages",
  verifyStaffToken,
  async (req: any, res) => {
    try {
      const messageSchema = z.object({
        message: z.string().min(1),
        isStaffReply: z.boolean().default(true),
      });

      const { message, isStaffReply } = messageSchema.parse(req.body);

      await executeQuery(
        `INSERT INTO support_messages (
        ticket_id, user_id, message, is_staff_reply
      ) VALUES (?, ?, ?, ?)`,
        [req.params.id, req.user.id, message, isStaffReply],
      );

      // Update ticket status to in_progress if it was open
      await executeQuery(
        `UPDATE support_tickets SET 
        status = CASE 
          WHEN status = 'open' THEN 'in_progress'
          ELSE status 
        END,
        updated_at = NOW()
      WHERE id = ?`,
        [req.params.id],
      );

      res.json({ message: "Message added successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      console.error("Message add error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// KYC review
router.get("/kyc/pending", verifyStaffToken, async (req: any, res) => {
  try {
    const pendingKyc = await executeQuery(
      `SELECT 
        id, username, email, first_name, last_name, 
        kyc_documents, registration_date
      FROM users 
      WHERE kyc_status = 'pending' 
      AND kyc_documents IS NOT NULL
      ORDER BY registration_date ASC`,
    );

    // Parse KYC documents
    const pendingWithDocs = pendingKyc.map((user: any) => ({
      ...user,
      kyc_documents: user.kyc_documents ? JSON.parse(user.kyc_documents) : [],
    }));

    res.json({ pendingKyc: pendingWithDocs });
  } catch (error) {
    console.error("Pending KYC error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Process KYC
router.put("/kyc/:userId", verifyStaffToken, async (req: any, res) => {
  try {
    const kycSchema = z.object({
      status: z.enum(["verified", "rejected"]),
      notes: z.string().optional(),
    });

    const { status, notes } = kycSchema.parse(req.body);

    await executeQuery(
      "UPDATE users SET kyc_status = ?, updated_at = NOW() WHERE id = ?",
      [status, req.params.userId],
    );

    // Log the KYC decision
    await executeQuery(
      `INSERT INTO audit_logs (
        user_id, action, table_name, record_id, new_values, ip_address
      ) VALUES (?, 'kyc_review', 'users', ?, ?, ?)`,
      [
        req.user.id,
        req.params.userId,
        JSON.stringify({ status, notes, reviewer: req.user.username }),
        req.ip,
      ],
    );

    res.json({ message: `KYC ${status} successfully` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("KYC processing error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Staff schedule
router.get("/schedule", verifyStaffToken, async (req: any, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateCondition = "";
    let queryParams = [req.user.id];

    if (startDate && endDate) {
      dateCondition = "AND DATE(ss.shift_start) BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    } else {
      // Default to current week
      dateCondition = "AND WEEK(ss.shift_start) = WEEK(NOW())";
    }

    const schedule = await executeQuery(
      `SELECT 
        ss.*, sr.role_name, sr.hourly_rate
      FROM staff_schedules ss
      JOIN staff_roles sr ON ss.role_id = sr.id
      WHERE ss.user_id = ? ${dateCondition}
      ORDER BY ss.shift_start ASC`,
      queryParams,
    );

    res.json({ schedule });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Clock in/out
router.post("/clock/:action", verifyStaffToken, async (req: any, res) => {
  try {
    const action = req.params.action; // 'in' or 'out'

    if (action === "in") {
      // Find today's scheduled shift
      const todayShift = await executeQuery(
        `SELECT id FROM staff_schedules 
        WHERE user_id = ? 
        AND DATE(shift_start) = CURDATE() 
        AND status = 'scheduled'
        LIMIT 1`,
        [req.user.id],
      );

      if (todayShift.length === 0) {
        return res
          .status(400)
          .json({ message: "No scheduled shift found for today" });
      }

      await executeQuery(
        "UPDATE staff_schedules SET status = 'active' WHERE id = ?",
        [todayShift[0].id],
      );

      res.json({ message: "Clocked in successfully" });
    } else if (action === "out") {
      // Find active shift
      const activeShift = await executeQuery(
        `SELECT ss.*, sr.hourly_rate
        FROM staff_schedules ss
        JOIN staff_roles sr ON ss.role_id = sr.id
        WHERE ss.user_id = ? 
        AND ss.status = 'active'
        LIMIT 1`,
        [req.user.id],
      );

      if (activeShift.length === 0) {
        return res.status(400).json({ message: "No active shift found" });
      }

      const shift = activeShift[0];
      const now = new Date();
      const shiftStart = new Date(shift.shift_start);
      const hoursWorked =
        (now.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

      await executeQuery(
        `UPDATE staff_schedules SET 
          status = 'completed', 
          hours_worked = ?,
          shift_end = NOW()
        WHERE id = ?`,
        [hoursWorked, shift.id],
      );

      const earnings = hoursWorked * shift.hourly_rate;

      res.json({
        message: "Clocked out successfully",
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        earnings: Math.round(earnings * 100) / 100,
      });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Clock in/out error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Live chat (simplified)
router.get("/chat/active", verifyStaffToken, async (req: any, res) => {
  try {
    // Get users who have been active in the last 30 minutes
    const activeUsers = await executeQuery(
      `SELECT 
        u.id, u.username, u.level, u.gold_coins, u.sweeps_coins,
        MAX(t.created_at) as last_activity
      FROM users u
      JOIN transactions t ON u.id = t.user_id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      AND u.is_active = TRUE
      GROUP BY u.id, u.username, u.level, u.gold_coins, u.sweeps_coins
      ORDER BY last_activity DESC
      LIMIT 20`,
    );

    res.json({ activeUsers });
  } catch (error) {
    console.error("Active users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User lookup
router.get("/users/search", verifyStaffToken, async (req: any, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: "Search query too short" });
    }

    const users = await executeQuery(
      `SELECT 
        id, username, email, first_name, last_name, level,
        gold_coins, sweeps_coins, kyc_status, is_active, last_login
      FROM users 
      WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
      AND is_active = TRUE
      LIMIT 10`,
      [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`],
    );

    res.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Staff stats
router.get("/stats", verifyStaffToken, async (req: any, res) => {
  try {
    // Current month stats for the staff member
    const monthlyStats = await executeQuery(
      `SELECT 
        COUNT(*) as tickets_handled,
        AVG(CASE WHEN st.status = 'resolved' THEN 
          TIMESTAMPDIFF(HOUR, st.created_at, st.resolved_at) 
        END) as avg_resolution_time,
        SUM(ss.hours_worked) as total_hours,
        SUM(ss.hours_worked * sr.hourly_rate) as total_earnings
      FROM support_tickets st
      LEFT JOIN staff_schedules ss ON ss.user_id = ? AND MONTH(ss.shift_start) = MONTH(NOW())
      LEFT JOIN staff_roles sr ON ss.role_id = sr.id
      WHERE st.assigned_to = ? 
      AND MONTH(st.created_at) = MONTH(NOW())`,
      [req.user.id, req.user.id],
    );

    // Recent performance
    const recentTickets = await executeQuery(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM support_tickets 
      WHERE assigned_to = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [req.user.id],
    );

    res.json({
      monthlyStats: monthlyStats[0],
      recentPerformance: recentTickets[0],
    });
  } catch (error) {
    console.error("Staff stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
