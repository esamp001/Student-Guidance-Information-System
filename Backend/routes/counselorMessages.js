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
        "aps.datetime as appointment_datetime",
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
      .andWhere("aps.mode", "Online")
      .andWhere("u.id", userId)
      .orderBy([
        { column: "st.id", order: "asc" },
        { column: "aps.id", order: "desc" }, // get most recent completed appointment
      ]);

    const formattedResult = result.map((item) => {
      return {
        ...item,
        appointment_datetime_readable: item.appointment_datetime
          ? new Date(item.appointment_datetime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })
          : null,
        time: new Date(item.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    });

    console.log("Fetched conversation list:", formattedResult);

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

// Unread Messages Count for counselor
router.get("/unreadCount", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await knex("messages")
      .count("id as unreadCount")
      .where("receiver_id", userId)
      .andWhere("is_read", false)
      .first();

    res.json({ unreadCount: Number(result.unreadCount) || 0 });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unread counts grouped by conversation (appointment)
router.get("/unreadByConversation", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const rows = await knex("messages")
      .select("appointment_id")
      .count("id as count")
      .where("receiver_id", userId)
      .andWhere("is_read", false)
      .groupBy("appointment_id");

    const map = {};
    rows.forEach((r) => {
      map[String(r.appointment_id)] = Number(r.count) || 0;
    });
    res.json(map);
  } catch (error) {
    console.error("Error fetching unread by conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark messages as read when opening a conversation
router.put("/mark-read", async (req, res) => {
  const { userId, appointmentId } = req.body;

  if (!userId || !appointmentId) {
    return res
      .status(400)
      .json({ error: "userId and appointmentId are required" });
  }

  try {
    await knex("messages")
      .where({ receiver_id: userId, appointment_id: appointmentId })
      .andWhere("is_read", false)
      .update({ is_read: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Appointment look up on request followup
router.get("/appointments/lookup", async (req, res) => {
  const { appointmentId } = req.query;

  if (!appointmentId) {
    return res.status(400).json({ error: "appointmentId is required" });
  }

  try {
    const appointment = await knex("appointments")
      .select("id", "type", "mode", "status")
      .where("id", appointmentId)
      .first();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("Failed to fetch appointment:", err);
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

router.put("/appointments/follow-up", async (req, res) => {

  console.log("HIT HEREES")
  const { appointmentId } = req.query;
  const { dateTime, type, mode, status } = req.body;

  console.log({ appointmentId, dateTime, type, mode, status }, "appointmentId, dateTime, type, mode, status");

  if (!appointmentId || !dateTime || !type || !mode || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Update the appointment
    const updated = await knex("appointments")
      .where({ id: appointmentId })
      .update({
        datetime: dateTime, // make sure your DB column names match
        type: type,
        mode: mode,
        status: status
      })
      .returning("*"); // returns the updated row(s)

    if (updated.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Emit socket event to notify student about follow-up
    if (req.io && updated[0].student_id) {
      req.io.to(`user_${String(updated[0].student_id)}`).emit("appointment_followup", {
        appointmentId: appointmentId,
        status: "Follow-up",
        newDateTime: dateTime
      });
    }

    // Optionally, send a notification here if needed
    // await sendNotification({ userId: updated[0].student_id, ... });

    return res.json({ message: "Appointment updated successfully", appointment: updated[0] });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});



module.exports = router;
