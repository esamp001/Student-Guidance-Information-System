/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("counselors", function (table) {
    table.increments("id").primary(); // auto-incrementing ID
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE"); // foreign key to users table
    table.string("first_name").notNullable();
    table.string("middle_name").nullable(); // optional if some people don’t have one
    table.string("last_name").notNullable();
    table.string("specialization").notNullable();
    table.timestamps(true, true); // adds created_at & updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("counselors");
};
