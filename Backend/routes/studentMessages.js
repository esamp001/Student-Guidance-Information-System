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
          c.id AS counselor_id,
          c.first_name AS counselor_first_name,
          c.last_name AS counselor_last_name
      FROM public.students AS st
      INNER JOIN public.users AS u
          ON st.user_id = u.id
      INNER JOIN public.appointments AS apt
          ON st.id = apt.student_id
      INNER JOIN public.counselors AS c
          ON apt.counselor_id = c.id
      WHERE apt.status = 'Completed'
      AND u.id = ?
      ORDER BY c.id, apt.created_at DESC;
    `,
      [userId]
    ); // safely inject userId

    console.log(results.rows, "ROWS");
    res.json(results.rows); // knex.raw() returns { rows: [...] }
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
        "created_at"
      )
      .where("appointment_id", appointmentId)
      .orderBy("created_at", "asc");

    // Fetch the latest message (the last one in order)
    const latestMessage = await knex("messages")
      .select(
        "id",
        "appointment_id",
        "sender_id as author",
        "content",
        "created_at"
      )
      .where("appointment_id", appointmentId)
      .orderBy("created_at", "desc")
      .first();

    // Return both
    console.log(latestMessage, "latestMessage");
    res.json({
      messages,
      latestMessage: latestMessage || null,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages between student and counselor
// router.get("/messages", async (req, res) => {
//   const { userId, counselorId } = req.query;
//   try {
//     const messages = await knex("messages")
//       .where(function () {
//         this.where({ sender_id: userId, receiver_id: counselorId }).orWhere({
//           sender_id: counselorId,
//           receiver_id: userId,
//         });
//       })
//       .orderBy("created_at", "asc");

//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
