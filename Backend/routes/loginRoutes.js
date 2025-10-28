const express = require("express");
const router = express.Router();
const knex = require("../db/db");
const bcrypt = require("bcryptjs");

// POST - LOGIN
router.post("/login/students", async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await trx("users").where({ email }).first();
    if (!user) {
      await trx.rollback();
      return res.status(400).json({ message: "User not found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await trx.rollback();
      return res.status(401).json({ message: "Invalid password." });
    }

    // Update last_login
    const now = new Date();
    await trx("users").where({ id: user.id }).update({ last_login: now });

    // Create session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      last_login: now,
    };

    await trx.commit();

    res.status(200).json({
      message: "Login successful!",
      user: req.session.user,
    });
  } catch (error) {
    await trx.rollback();
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login/auth/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Failed to log out." });
      }

      // Clear the cookie from client side
      res.clearCookie("connect.sid", { path: "/" });
      return res.status(200).json({ message: "Logout successful." });
    });
  } else {
    return res.status(200).json({ message: "No active session." });
  }
});

// GET - LOGIN
router.get("/login/auth/session", (req, res) => {
  // Check if a session exists
  if (req.session && req.session.user) {
    return res.status(200).json({
      loggedIn: true,
      sessionID: req.sessionID, // this corresponds to connect.sid
      user: req.session.user, // your stored user info
      cookie: req.session.cookie, // optional: cookie metadata
    });
  } else {
    return res.status(200).json({
      loggedIn: false,
      message: "No active session found.",
    });
  }
});

module.exports = router;
