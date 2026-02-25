const { Client } = require("pg");
require("dotenv").config();

const USERS_TABLE = process.env.USERS_TABLE || "users";
const SHOPPING_TABLE = process.env.SHOPPING_TABLE || "belanja";

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function syncSequence(tableName) {
  const query = `
    SELECT setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
      true
    );
  `;

  await client.query(query);
}

async function fixSequence() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    console.log(`Fixing sequences for ${USERS_TABLE} and ${SHOPPING_TABLE}...`);
    await syncSequence(USERS_TABLE);
    await syncSequence(SHOPPING_TABLE);

    console.log("Sequences updated to match MAX(id) for both tables.");
  } catch (err) {
    console.error("Error fixing sequence:", err.message);
  } finally {
    await client.end();
  }
}

fixSequence();
