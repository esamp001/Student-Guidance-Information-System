const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path based on your setup
const bcrypt = require("bcryptjs");

// Look up counselor - Get
router.get("/admin/counselor_lookup", async (req, res) => {
  try {
    const counselors = await knex("counselors as cl").select(
      "cl.id",
      "cl.first_name",
      "cl.middle_name",
      "cl.last_name",
      "cl.specialization"
    );

    res.json(counselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save counselor - Post
router.post("/admin/add_counselor", async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      specialization,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !specialization || !email || !password) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Check if email already exists
    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate incremental username
    const lastUser = await knex("users")
      .where("role", "counselor")
      .orderBy("id", "desc")
      .first();

    let nextNumber = 1;
    if (lastUser?.username?.startsWith("Counselor-U")) {
      const match = lastUser.username.match(/U(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }

    const username = `Counselor-U${String(nextNumber).padStart(5, "0")}`;

    const [newUser] = await knex("users")
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        role: "counselor",
        created_at: knex.fn.now(),
      })
      .returning("id");

    const [newCounselor] = await knex("counselors")
      .insert({
        user_id: newUser.id || newUser,
        first_name,
        middle_name,
        last_name,
        specialization,
        created_at: knex.fn.now(),
      })
      .returning("*");

    res.json({
      message: "Counselor added successfully!",
      counselor: { ...newCounselor, username },
    });
  } catch (error) {
    console.error("Error adding counselor:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete counselor - Delete
router.delete("/admin/delete_counselor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if counselor exists
    const counselor = await knex("counselors").where("id", id).first();
    if (!counselor) {
      return res
        .status(404)
        .json({ success: false, message: "Counselor not found" });
    }

    // Delete counselor record
    await knex("counselors").where("id", id).del();

    // Optionally delete the linked user record
    await knex("users").where("id", counselor.user_id).del();

    res.json({ success: true, message: "Counselor deleted successfully" });
  } catch (error) {
    console.error("Error deleting counselor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update counselor - Update
router.put("/admin/update_counselor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      middle_name,
      last_name,
      specialization,
      password,
      confirmPassword,
    } = req.body;

    // Validate required fields (no email check)
    if (!first_name || !last_name || !specialization) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    // Validate password if provided
    if (password && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Get the counselor
    const counselor = await knex("counselors").where({ id }).first();
    if (!counselor) {
      return res.status(404).json({ error: "Counselor not found." });
    }

    // Update user record (only password if provided)
    const userUpdates = {};
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userUpdates.password_hash = hashedPassword;
    }
    if (Object.keys(userUpdates).length > 0) {
      await knex("users").where({ id: counselor.user_id }).update(userUpdates);
    }

    // Update counselor record
    const updatedCounselor = await knex("counselors").where({ id }).update(
      {
        first_name,
        middle_name,
        last_name,
        specialization,
        updated_at: knex.fn.now(),
      },
      ["*"] // returning updated record
    );

    res.json({
      message: "Counselor updated successfully!",
      counselor: updatedCounselor[0],
    });
  } catch (error) {
    console.error("Error updating counselor:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
