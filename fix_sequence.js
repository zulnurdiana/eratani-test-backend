const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixSequence() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    console.log("Fixing id sequence...");
    await client.query(
      "SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));",
    );
    console.log("Sequence updated to match MAX(id).");
  } catch (err) {
    console.error("Error fixing sequence:", err);
  } finally {
    await client.end();
  }
}

fixSequence();
