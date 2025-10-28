/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("students", (table) => {
    table.bigIncrements("id").primary(); // auto-incrementing primary key
    table.bigInteger("user_id").unsigned().notNullable(); // foreign key to users table
    table.string("student_no", 50).notNullable().unique(); // unique student number
    table.string("first_name", 255).notNullable(); // student name
    table.string("middle_name", 255).notNullable(); // student name
    table.string("last_name", 255).notNullable(); // student name
    table.string("contact_no", 50).nullable(); // contact number
    table.string("course", 100).notNullable(); // course
    table.text("academic_record").nullable(); // academic record (text for flexibility)
    table.text("behavior_record").nullable(); // behavior record (text for flexibility)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("students");
};
