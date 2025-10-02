/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("user_id").primary(); // auto-incrementing primary key
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.enum("role", ["student", "counselor", "admin"]).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("last_login").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
