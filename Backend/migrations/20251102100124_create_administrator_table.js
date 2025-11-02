/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("administrator", (table) => {
    table.increments("id").primary();

    // Foreign key to user table
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Administrator details
    table.string("first_name").notNullable();
    table.string("middle_name");
    table.string("last_name").notNullable();

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("administrator");
};
