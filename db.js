
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

// Check PostgreSQL connection
pool.connect()
    .then(client => {
        console.log("PostgreSQL connected successfully!");
        client.release();
    })
    .catch(error => {
        console.error("PostgreSQL connection failed:", error.message);
    });

module.exports = pool;
