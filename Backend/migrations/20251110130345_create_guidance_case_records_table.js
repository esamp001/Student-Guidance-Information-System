/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('guidance_case_records', (table) => {
        table.increments('id').primary();

        table.integer('appointment_id').unsigned()
            .references('id').inTable('appointments').onDelete('SET NULL');

        table.integer('student_id').unsigned().notNullable()
            .references('id').inTable('students').onDelete('CASCADE');

        table.integer('counselor_id').unsigned().notNullable()
            .references('id').inTable('counselors').onDelete('CASCADE');

        table.text('case_type').notNullable(); // e.g., 'academic', 'personal', 'counseling'
        table.text('summary'); // Summary or notes of the session
        table.text('remarks'); // Additional remarks

        table.string('status', 50).defaultTo('active');

        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('guidance_case_records');
};
