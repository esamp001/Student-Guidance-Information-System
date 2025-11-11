/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("case_records", (table) => {
    table.increments("id").primary(); // Primary key

    // Reference to students table
    table
      .integer("student_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("students")
      .onDelete("CASCADE"); // Deletes case record if student is deleted

    // Reference to users table (counselor/user)
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // Deletes case record if user is deleted

    // Reference to appointment
    table
      .integer("appointment_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("appointments")
      .onDelete("CASCADE"); // Deletes case record if appointment is deleted

    table.string("case_type").notNullable(); // Academic, Behavioral, Career
    table.string("offense").notNullable(); // Concern / Offense
    table.string("session_type").notNullable(); // Online or Meet-up
    table.date("date").notNullable(); // Date of session
    table.text("remarks"); // Optional detailed notes

    // Automatically adds created_at and updated_at columns
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("case_records");
};
