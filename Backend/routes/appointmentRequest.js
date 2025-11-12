const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// Helper function to log appointment status changes
async function logStatusChange(appointmentId, oldStatus, newStatus, changedBy, changedByRole, notes = null) {
  try {
    await knex("appointment_status_history").insert({
      appointment_id: appointmentId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      changed_by_role: changedByRole,
      notes: notes,
      changed_at: new Date(),
    });
  } catch (error) {
    console.error("Error logging status change:", error);
    // Don't throw error, just log it - we don't want to break the main operation
  }
}

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

// Get pending confirmation appointments for a counselor
router.get("/counselor/:counselorUserId/pending-confirmation", async (req, res) => {
  const { counselorUserId } = req.params;

  try {
    const appointments = await knex("appointments AS aps")
      .select(
        "aps.id AS appointment_id",
        "aps.type",
        "aps.mode",
        "aps.datetime",
        "aps.status",
        "aps.reason",
        "s.id AS student_id",
        "s.first_name AS student_first_name",
        "s.middle_name AS student_middle_name",
        "s.last_name AS student_last_name",
        "s.student_no"
      )
      .innerJoin("students AS s", "s.id", "aps.student_id")
      .innerJoin("counselors AS c", "c.id", "aps.counselor_id")
      .innerJoin("users AS u", "u.id", "c.user_id")
      .where("u.id", counselorUserId)
      .andWhere("aps.status", "Pending Confirmation")
      .orderBy("aps.datetime", "asc");

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching pending confirmation appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get confirmed appointments for a counselor
router.get("/counselor/:counselorUserId/confirmed-appointments", async (req, res) => {
  const { counselorUserId } = req.params;

  try {
    const appointments = await knex("appointments AS aps")
      .select(
        "aps.id AS appointment_id",
        "aps.type",
        "aps.mode",
        "aps.datetime",
        "aps.status",
        "aps.reason",
        "s.id AS student_id",
        "s.first_name AS student_first_name",
        "s.middle_name AS student_middle_name",
        "s.last_name AS student_last_name",
        "s.student_no"
      )
      .innerJoin("students AS s", "s.id", "aps.student_id")
      .innerJoin("counselors AS c", "c.id", "aps.counselor_id")
      .innerJoin("users AS u", "u.id", "c.user_id")
      .where("u.id", counselorUserId)
      .whereIn("aps.status", ["Confirmed", "Confirmed Reschedule"])
      .orderBy("aps.datetime", "asc");

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// PUT Confirmed
router.put("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { status, counselor_id } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // Get the current appointment to retrieve old status
    const currentAppointment = await knex("appointments")
      .where({ id: id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update the appointment status
    const updated = await knex("appointments")
      .where({ id: id })
      .update({ status })
      .returning("*"); // returns updated row(s), may vary based on DB

    // Log the status change
    await logStatusChange(
      id,
      currentAppointment.status,
      status,
      counselor_id || currentAppointment.counselor_id,
      "counselor",
      "Appointment confirmed by counselor"
    );

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
  const { status, counselor_id } = req.body;

  if (!status || status !== "Rejected") {
    return res.status(400).json({ message: "Invalid or missing status" });
  }

  try {
    // Get the current appointment to retrieve old status
    const currentAppointment = await knex("appointments")
      .where({ id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updated = await knex("appointments")
      .where({ id })
      .update({ status })
      .returning("*");

    // Log the status change
    await logStatusChange(
      id,
      currentAppointment.status,
      status,
      counselor_id || currentAppointment.counselor_id,
      "counselor",
      "Appointment rejected by counselor"
    );

    res.json({
      message: "Appointment rejected successfully",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT Completed
router.put("/appointments/completed/:id", async (req, res) => {
  const { id } = req.params;
  const { status, counselor_id } = req.body;

  console.log({id, status}, "id, status");

  if (!status || status !== "Completed") {
    return res.status(400).json({ message: "Invalid or missing status" });
  }

  try {
    // Get the current appointment to retrieve old status
    const currentAppointment = await knex("appointments")
      .where({ id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updated = await knex("appointments")
      .where({ id })
      .update({ status })
      .returning("*");

    // Log the status change
    await logStatusChange(
      id,
      currentAppointment.status,
      status,
      counselor_id || currentAppointment.counselor_id,
      "counselor",
      "Appointment marked as completed by counselor"
    );

    // Emit socket event to notify student about completion
    if (req.io && currentAppointment.student_id) {
      req.io.to(`user_${String(currentAppointment.student_id)}`).emit("appointment_completed", {
        appointmentId: id,
        status: "Completed"
      });
    }

    res.json({
      message: "Appointment Completed successfully",
      appointment: updated[0],
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT: Update appointment status and rescheduled time
router.put("/:id/reschedule", async (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  const { status, rescheduled_time, counselor_id } = req.body;

  console.log(rescheduled_time, "rescheduled_time");

  try {
    // Get the current appointment to retrieve old status
    const currentAppointment = await knex("appointments")
      .where({ id })
      .first();

    if (!currentAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await knex("appointments").where({ id }).update({
      status,
      datetime: rescheduled_time,
      updated_at: new Date(),
    });

    // Log the status change
    await logStatusChange(
      id,
      currentAppointment.status,
      status,
      counselor_id || currentAppointment.counselor_id,
      "counselor",
      `Appointment rescheduled to ${new Date(rescheduled_time).toLocaleString()}`
    );

    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});


// router.put("/appointments/follow-up", async (req, res) => {
//   const { appointmentId } = req.query;
//   console.log(typeof(appointmentId), "appointmentId");
//   const { status, type, mode, dateTime } = req.body;   // <-- keep dateTime if you want it later

//   if (!appointmentId) {
//     return res.status(400).json({ message: "appointmentId is required" });
//   }

//   try {
//     const toUpdate = { status, type, mode, datetime: dateTime };
//     // If you ever add a `scheduled_at` column, uncomment:
//     // if (dateTime) toUpdate.scheduled_at = dateTime;

//     const updated = await knex("appointments")
//       .where({ id: appointmentId })
//       .update(toUpdate)
//       .returning("*");

//     if (!updated.length) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }

//     res.json({ success: true, appointment: updated[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });



module.exports = router;

