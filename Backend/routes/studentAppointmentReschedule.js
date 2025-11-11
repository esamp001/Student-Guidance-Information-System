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

// PUT: Confirm counselor-initiated appointment - Student confirms
router.put("/appointment/confirm-counselor-initiated/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Get the current appointment
    const currentAppointment = await knex("appointments")
      .where({ id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update the appointment status to Confirmed
    const updated = await knex("appointments")
      .where({ id })
      .update({ status: status || "Confirmed", updated_at: new Date() })
      .returning("*");

    // Log the status change in history
    await knex("appointment_status_history").insert({
      appointment_id: id,
      old_status: currentAppointment.status,
      new_status: status || "Confirmed",
      changed_by: currentAppointment.student_id,
      changed_by_role: "student",
      notes: "Student confirmed counselor-initiated appointment",
      changed_at: new Date(),
    });

    res.json({
      message: "Appointment confirmed successfully",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT: Decline counselor-initiated appointment - Student declines
router.put("/appointment/decline-counselor-initiated/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Get the current appointment
    const currentAppointment = await knex("appointments")
      .where({ id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update the appointment status to Rejected
    const updated = await knex("appointments")
      .where({ id })
      .update({ status: status || "Rejected", updated_at: new Date() })
      .returning("*");

    // Log the status change in history
    await knex("appointment_status_history").insert({
      appointment_id: id,
      old_status: currentAppointment.status,
      new_status: status || "Rejected",
      changed_by: currentAppointment.student_id,
      changed_by_role: "student",
      notes: "Student declined counselor-initiated appointment",
      changed_at: new Date(),
    });

    res.json({
      message: "Appointment declined",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error declining appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
