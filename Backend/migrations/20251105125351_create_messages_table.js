/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("messages", (table) => {
    table.increments("id").primary(); // Primary key
    table.integer("sender_id").notNullable(); // ID of the user sending the message
    table.integer("receiver_id").notNullable(); // ID of the user receiving the message
    table
      .integer("appointment_id")
      .unsigned()
      .references("id")
      .inTable("appointments")
      .onDelete("CASCADE"); // Deletes messages if appointment is deleted
    table.text("content").notNullable(); // Message content
    table.boolean("is_read").notNullable().defaultTo(false); // unread by default
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Timestamp
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("messages");
};
