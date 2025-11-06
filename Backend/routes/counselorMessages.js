const express = require("express");
const router = express.Router();
const knex = require("../db/db");

/**
 * Get Conversation List for Counselor
 * Shows all students the counselor has completed appointments with
 */
router.get("/conversationList/completed", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId parameter" });
  }

  try {
    const result = await knex("students as st")
      .distinctOn("st.id")
      .select(
        "u.id as user_id",
        "aps.id as appointment_id",
        "aps.status as appointment_status",
        "c.id as counselor_id",
        "st.id as student_id",
        "st.first_name",
        "st.last_name",
        "us.id as student_user_id",
        knex("messages as m")
          .select("content")
          .whereRaw("m.appointment_id = aps.id")
          .orderBy("created_at", "desc")
          .limit(1)
          .as("latestMessage"),
        knex("messages as m2")
          .select("created_at")
          .whereRaw("m2.appointment_id = aps.id")
          .orderBy("created_at", "desc")
          .limit(1)
          .as("time")
      )
      .innerJoin("appointments as aps", "aps.student_id", "st.id")
      .innerJoin("counselors as c", "c.id", "aps.counselor_id")
      .innerJoin("users as u", "u.id", "c.user_id")
      .innerJoin("users as us", "us.id", "st.user_id")
      .whereIn("aps.status", ["Confirmed", "Confirmed Reschedule"])
      .andWhere("u.id", userId)
      .orderBy([
        { column: "st.id", order: "asc" },
        { column: "aps.id", order: "desc" }, // get most recent completed appointment
      ]);

    const formattedResult = result.map((item) => {
      return {
        ...item,
        time: new Date(item.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error("Failed to fetch conversation list:", err);
    res.status(500).json({ message: "Error fetching conversation list" });
  }
});

/**
 * 💬 Fetch Messages for a Conversation (lookup)
 */
router.get("/messages/lookup", async (req, res) => {
  const { appointmentId } = req.query;

  if (!appointmentId) {
    return res.status(400).json({ error: "appointmentId is required" });
  }

  try {
    // Fetch all messages
    const messages = await knex("messages")
      .select(
        "id",
        "appointment_id",
        "sender_id as author",
        "content",
        "created_at as time"
      )
      .where("appointment_id", appointmentId)
      .orderBy("created_at", "asc");

    const formattedMessages = messages.map((message) => {
      return {
        ...message,
        time: new Date(message.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    });

    // Fetch the latest message
    const latestMessage = await knex("messages")
      .select(
        "id",
        "appointment_id",
        "sender_id as author",
        "content",
        "created_at as time"
      )
      .where("appointment_id", appointmentId)
      .orderBy("created_at", "desc")
      .first();

    const formattedLatestMessage = latestMessage ? {
      ...latestMessage,
      time: new Date(latestMessage.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      } : null;


    res.json({ messages: formattedMessages, latestMessage: formattedLatestMessage || null });
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: "Internal server error" });
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
