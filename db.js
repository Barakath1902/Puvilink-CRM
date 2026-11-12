
const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Check your environment variables.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("Connected to Neon PostgreSQL!");
});

pool.on("error", (error) => {
    console.error("PostgreSQL connection error:", error);
});

module.exports = pool;
