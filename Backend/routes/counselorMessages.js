const express = require("express");
const router = express.Router();
const knex = require("../db/db");

/**
 * Get Conversation List for Counselor
 * Shows all students the counselor has completed appointments with
 */
router.get("/conversationList/completed", async (req, res) => {
  const { userId } = req.query; // counselor user id

  console.log(userId, "userID");

  try {
    const result = await knex("students as st")
      .distinctOn("st.id") // PostgreSQL feature
      .select(
        "u.id as user_id",
        "aps.id as appointment_id",
        "aps.status as appointment_status",
        "c.id as counselor_id",
        "st.id as student_id",
        "st.first_name",
        "st.last_name"
      )
      .innerJoin("appointments as aps", "aps.student_id", "st.id")
      .innerJoin("counselors as c", "c.id", "aps.counselor_id")
      .innerJoin("users as u", "u.id", "c.user_id")
      .where("aps.status", "Completed")
      .andWhere("u.id", userId)
      .orderBy([
        { column: "st.id", order: "asc" },
        { column: "aps.id", order: "asc" }, // required for DISTINCT ON
      ]);

    console.log(result, "result");
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch conversation list:", err);
    res.status(500).json({ message: "Error fetching conversation list" });
  }
});

/**
 * 💬 Fetch Messages for a Conversation (lookup)
 */
router.get("/messages/lookup", async (req, res) => {
  const { appointmentId, userId } = req.query;

  try {
    const messages = await knex("messages")
      .select(
        "id",
        "appointment_id",
        "sender_id as author",
        "receiver_id",
        "content",
        "created_at as time"
      )
      .where("appointment_id", appointmentId)
      .orderBy("created_at", "asc");

    // Map author correctly for UI
    const formatted = messages.map((msg) => ({
      ...msg,
      author: String(msg.author) === String(userId) ? userId : msg.receiver_id,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

/**
 * Send Message (for non-socket fallback)
 */
router.post("/send", async (req, res) => {
  const { appointmentId, senderId, receiverId, content } = req.body;

  try {
    await knex("messages").insert({
      appointment_id: appointmentId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      created_at: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
