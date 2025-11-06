/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('notifications', (table) => {
      table.increments('id').primary();         // Primary key
      table.integer('user_id').notNullable();   // User who receives notification
      table.string('type', 50).notNullable();   // Type of notification: 'reminder', 'grade', etc.
      table.jsonb('context');                   // Dynamic data about the notification
      table.text('message').notNullable();      // Notification message
      table.boolean('read').defaultTo(false);   // Has the user read this notification
      table.timestamp('created_at').defaultTo(knex.fn.now()); // Timestamp
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notifications');
  };
  