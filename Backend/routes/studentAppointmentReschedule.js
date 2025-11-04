const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// PUT: Reschedule Confirm - Student Side
// PUT Reschedule Status
router.put("/appointment/accept/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updated = await knex("appointments")
      .where({ id })
      .update({ status })
      .returning("*");

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: `Reschedule ${status.toLowerCase()} successfully`,
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT Reschedule Status
router.put("/appointment/reject/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // Update the appointment status in the database
    const updated = await knex("appointments")
      .where({ id })
      .update({ status })
      .returning("*"); // returns the updated row(s)

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: `Reschedule ${status.toLowerCase()} successfully`,
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
