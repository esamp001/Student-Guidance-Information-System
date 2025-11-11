/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("appointment_status_history", (table) => {
    table.increments("id").primary();

    // Reference to the appointment
    table
      .integer("appointment_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("appointments")
      .onDelete("CASCADE");

    // Status change details
    table.string("old_status", 50); // Previous status (null for initial creation)
    table.string("new_status", 50).notNullable(); // New status

    // Who made the change
    table.integer("changed_by").unsigned(); // user_id or counselor_id
    table.string("changed_by_role", 20); // 'student', 'counselor', 'admin'

    // Additional context
    table.text("notes"); // Optional notes about the change
    table.timestamp("changed_at").defaultTo(knex.fn.now()); // When the change occurred
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("appointment_status_history");
};
