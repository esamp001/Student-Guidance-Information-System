
const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path to your knex instance

function buildNotificationMessage(type, context = {}) {
    switch(type) {
        case 'profile':
            return "Your profile has been updated";
        case 'grade':
            return "New grade report is available";
        case 'reminder':
            return `Reminder: Counseling session ${context.date || ""}`;
        case 'appointment_confirmed':
            return `Appointment confirmed. You can start chatting your counselor on ${context.date || "the scheduled date"}.`;
        case 'message':
            return `You have a new message from ${context.sender || "someone"}`;
        case 'announcement':
            return `New announcement: ${context.title || ""}`;
        default:
            return "You have a new notification";
    }
}


// POST /notifications/create
router.post("/notifications/create", async (req, res) => {
    const { user_id, type, context } = req.body;
  
    try {
      const message = buildNotificationMessage(type, context);
  
      await knex('notifications').insert({
        user_id,
        type,
        context: JSON.stringify(context),
        message,
        created_at: new Date()
      });
  
      res.status(200).json({ success: true, message: "Notification created" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Failed to create notification" });
    }
  });
  
  // GET /notifications/lookup?userId=123&limit=20&offset=0
  router.get("/notifications/lookup", async (req, res) => {
    const { userId, limit = 20, offset = 0 } = req.query;
  
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }
  
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedOffset = Number.parseInt(offset, 10);
    const safeLimit = Number.isFinite(parsedLimit) ? Math.min(parsedLimit, 100) : 20;
    const safeOffset = Number.isFinite(parsedOffset) ? parsedOffset : 0;
  
    try {
      const rows = await knex('notifications')
        .select('id', 'user_id', 'type', 'context', 'message', 'created_at')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(safeLimit)
        .offset(safeOffset);
  
      const notifications = rows.map((row) => {
        let parsedContext = row.context;
        if (typeof row.context === 'string') {
          try {
            parsedContext = JSON.parse(row.context);
          } catch (_) {
            parsedContext = {};
          }
        }
        return {
          id: row.id,
          user_id: row.user_id,
          type: row.type,
          context: parsedContext,
          message: row.message,
          created_at: row.created_at,
        };
      });
  
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Failed to fetch notifications" });
    }
  });
  

  module.exports = router;
  