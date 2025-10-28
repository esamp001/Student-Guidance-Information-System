/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema.createTable("appointments", function (table) {
    table.increments("id").primary();

    table
      .integer("student_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("students")
      .onDelete("CASCADE"); // delete appointments if student is deleted

    table
      .integer("counselor_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("counselors")
      .onDelete("CASCADE");

    // Appointment data
    table.string("type").notNullable(); // e.g. Counseling, Academic
    table.string("mode").notNullable(); // Online / Onsite
    table.datetime("datetime").notNullable();
    table.text("reason").notNullable();
    table.string("status").notNullable().defaultTo("Pending"); // default status is "Pending"
    table.timestamps(true, true); // created_at & updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("appointments");
};
