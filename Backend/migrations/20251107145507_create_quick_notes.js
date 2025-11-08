/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quick_notes", (table) => {
    table.increments("id").primary(); // unique ID
    table.text("name").notNullable(); // note text
    table
      .integer("case_record_id") // reference to case_records
      .unsigned()
      .references("id")
      .inTable("case_records")
      .onDelete("CASCADE"); // delete quick notes if case record deleted
    table.timestamp("created_at").defaultTo(knex.fn.now()); // timestamp
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("quick_notes");
};
