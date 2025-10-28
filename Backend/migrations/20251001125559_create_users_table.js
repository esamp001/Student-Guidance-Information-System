/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary(); // auto-incrementing primary key
    table.string("username", 255).notNullable().unique(); // unique username
    table.string("email", 255).notNullable().unique(); // unique email
    table.string("password_hash", 255).notNullable(); // hashed password
    table.enum("role", ["student", "counselor", "admin"]).notNullable(); // user role
    table.timestamp("created_at").defaultTo(knex.fn.now()); // creation timestamp
    table.timestamp("last_login").nullable(); // nullable last login
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
