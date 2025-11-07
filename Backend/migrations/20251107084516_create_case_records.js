/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("case_records", (table) => {
        table.increments("id").primary();           // Primary key
        table.integer("student_id").notNullable();  // Reference to students table
        table.string("case_type").notNullable();    // Academic, Behavioral, Career
        table.string("offense").notNullable();      // Concern / Offense
        table.string("session_type").notNullable(); // Online or Meet-up
        table.date("date").notNullable();           // Date of session
        table.text("remarks");                       // Optional detailed notes
        table.text("quick_notes");                   // Optional quick notes
        table.timestamps(true, true);               // created_at & updated_at
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("case_records");
};
