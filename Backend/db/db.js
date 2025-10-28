// db.js
const knex = require("knex");
const knexConfig = require("../knexfile"); // your knexfile.js

// Use the "development" config
const db = knex(knexConfig.development);

module.exports = db;
