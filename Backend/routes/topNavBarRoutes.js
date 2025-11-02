const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// GET - TOPNAVBAR
router.get("/data/lookup", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const user = await knex("users")
      .select("id", "role")
      .where("id", userId)
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let data = null;

    if (user.role === "student") {
      data = await knex("students as st")
        .select("st.first_name", "st.middle_name", "st.last_name")
        .innerJoin("users as us", "us.id", "st.user_id")
        .where("us.id", userId)
        .first();
    } else if (user.role === "counselor") {
      data = await knex("counselors as cl")
        .select("cl.first_name", "cl.middle_name", "cl.last_name")
        .innerJoin("users as us", "us.id", "cl.user_id")
        .where("us.id", userId)
        .first();
    } else {
      data = await knex("administrator as am")
        .select("am.first_name", "am.middle_name", "am.last_name")
        .innerJoin("users as us", "us.id", "cl.user_id")
        .where("us.id", userId)
        .first();
    }

    // Just return data directly
    res.json(data || null);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
