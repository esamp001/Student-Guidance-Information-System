const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust path

// GET completed appointments for students by user ID
router.get("/conversationList/completed", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const results = await knex.raw(
      `
      SELECT DISTINCT ON (c.id)
          st.id AS student_id,
          u.id AS user_id,
          apt.id AS appointment_id,
          apt.status,
          apt.datetime AS appointment_datetime,
          c.id AS counselor_id,
          c.first_name AS counselor_first_name,
          c.last_name AS counselor_last_name,
          uc.id AS counselor_user_id,
          (
            SELECT m.content
            FROM public.messages AS m
            WHERE m.appointment_id = apt.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) AS "latestMessage",
          (
            SELECT m.created_at
            FROM public.messages AS m
            WHERE m.appointment_id = apt.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) AS "time"
      FROM public.students AS st
      INNER JOIN public.users AS u
          ON st.user_id = u.id
      INNER JOIN public.appointments AS apt
          ON st.id = apt.student_id
      INNER JOIN public.counselors AS c
          ON apt.counselor_id = c.id
      INNER JOIN public.users AS uc
          ON c.user_id = uc.id
      WHERE apt.status IN ('Confirmed', 'Confirmed Reschedule')
        AND apt.mode = 'Online'
      AND u.id = ?
      ORDER BY c.id, apt.created_at DESC;
    `,
      [userId]
    ); // safely inject userId

    const formattedResult = results.rows.map((item) => {
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

    console.log("Formatted Result:", formattedResult);

    res.json(formattedResult); // knex.raw() returns { rows: [...] }
  } catch (error) {
    console.error("Error fetching completed appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

    // Fetch the latest message (the last one in order)
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

    // Fetch appointment datetime
    const appt = await knex("appointments")
      .select("datetime")
      .where("id", appointmentId)
      .first();

    const appointmentDatetime = appt?.datetime || null;

    // Return both + appointment datetime
    res.json({
      messages: formattedMessages,
      latestMessage: formattedLatestMessage || null,
      appointment: appointmentDatetime
        ? {
            datetime: appointmentDatetime,
            datetime_readable: new Date(appointmentDatetime).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unread Messages Count for Both Student and Counselor
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


// Mark messages as read when the user opens a conversation
// router.put("/mark-read", async (req, res) => {
//   const { userId, appointmentId } = req.body;

//   if (!userId || !appointmentId) {
//     return res.status(400).json({ error: "userId and appointmentId are required" });
//   }

//   try {
//     await knex("messages")
//       .where({ receiver_id: userId, appointment_id: appointmentId })
//       .update({ is_read: true });

//     res.json({ success: true, message: "Messages marked as read" });
//   } catch (error) {
//     console.error("Error marking messages as read:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// })


module.exports = router;
