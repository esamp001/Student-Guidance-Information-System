const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // adjust the path to your knex instance
const bcrypt = require("bcryptjs");

// POST - REGISTER
router.post("/register/student", async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { userForm } = req.body;

    //  Check if user data exists
    if (!userForm) {
      return res.status(400).json({ message: "User data is required." });
    }

    //  Destructure userForm fields
    const {
      firstName,
      middleName,
      lastName,
      email,
      userName,
      password,
      confirmPassword,
      contactNumber,
      course,
      studentID,
    } = userForm;

    //  Basic required field validation
    const requiredFields = [
      "firstName",
      "middleName",
      "lastName",
      "email",
      "userName",
      "password",
      "confirmPassword",
      "course",
      "studentID",
    ];

    for (const field of requiredFields) {
      if (!userForm[field] || userForm[field].trim() === "") {
        return res.status(400).json({ message: `${field} is required.` });
      }
    }

    //  Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    //  Password rules
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter.",
      });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter.",
      });
    }
    if (!/[0-9]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number." });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character.",
      });
    }

    //  Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    //  Username validation
    if (userName.length < 4 || !/^[a-zA-Z0-9_]+$/.test(userName)) {
      return res.status(400).json({
        message:
          "Username must be at least 4 characters and contain only letters, numbers, and underscores.",
      });
    }

    //  Student ID numeric check
    if (!/^\d+$/.test(studentID)) {
      return res.status(400).json({ message: "Student ID must be numeric." });
    }

    //  Contact number validation (optional)
    const safeContact =
      contactNumber && contactNumber.trim() !== "" ? contactNumber : null;
    if (safeContact && !/^\+?\d{10,15}$/.test(safeContact)) {
      return res.status(400).json({ message: "Invalid contact number." });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Insert userForm
    const newUser = {
      email,
      username: userName,
      role: "student",
      password_hash: hashedPassword,
    };

    const [userId] = await trx("users").insert(newUser).returning("id");

    // Insert student profile
    const newStudent = {
      user_id: userId.id,
      student_no: studentID,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      contact_no: safeContact,
      course,
    };
    await trx("students").insert(newStudent);

    await trx.commit();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    await trx.rollback();
    console.error("Error inserting user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
