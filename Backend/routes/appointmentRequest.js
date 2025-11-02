const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.get("/counselor/appointments_lookup", async (req, res) => {
  const { counselorUserId } = req.query;

  try {
    // Base query
    let query = knex("appointments AS aps")
      .select(
        "aps.id AS appointment_id",
        "aps.type",
        "aps.mode",
        "aps.datetime",
        "aps.status",
        "c.id AS counselor_id",
        "c.first_name AS counselor_first_name",
        "c.middle_name AS counselor_middle_name",
        "c.last_name AS counselor_last_name",
        "c.specialization",
        "s.id AS student_id",
        "s.first_name AS student_first_name",
        "s.last_name AS student_last_name",
        "s.student_no"
      )
      .innerJoin("counselors AS c", "c.id", "aps.counselor_id")
      .innerJoin("users AS u", "u.id", "c.user_id")
      .innerJoin("students AS s", "s.id", "aps.student_id")
      .where("u.id", counselorUserId);

    // Order by datetime descending
    const appointments = await query.orderBy("aps.datetime", "desc");

    // Map and format datetime for user
    const formattedAppointments = appointments.map((apt) => {
      const dt = new Date(apt.datetime);
      const datePart = dt.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const timePart = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        ...apt,
        datetime_readable: `${datePart} - ${timePart}`, // Wed, Oct 29, 2025 - 09:25 AM
      };
    });

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// PUT Confirmed
router.put("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(id, "id");
  console.log(status, "status");

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // Update the appointment status
    const updated = await knex("appointments")
      .where({ id: id })
      .update({ status })
      .returning("*"); // returns updated row(s), may vary based on DB

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment updated successfully",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT Rejected
router.put("/appointments/reject/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("Reject endpoint hit with:", { id, status });

  if (!status || status !== "Rejected") {
    return res.status(400).json({ message: "Invalid or missing status" });
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
      message: "Appointment rejected successfully",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
