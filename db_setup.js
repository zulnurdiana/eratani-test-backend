const { Client } = require("pg");
const xlsx = require("xlsx");
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

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // 1) Buat tabel users
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
        id SERIAL PRIMARY KEY,
        country VARCHAR(255),
        credit_card_type VARCHAR(255),
        credit_card_number VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255)
      );
    `);

    // 2) Buat tabel belanja (relasi ke users)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${SHOPPING_TABLE} (
        id SERIAL PRIMARY KEY,
        id_user INT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE,
        total_buy BIGINT NOT NULL
      );
    `);

    console.log(`Tables ${USERS_TABLE} & ${SHOPPING_TABLE} created/verified`);

    const workbook = xlsx.readFile("Test Case.xlsx");
    const userSheet = workbook.Sheets["Data User"];
    const shoppingSheet = workbook.Sheets["Data Belanja"];

    if (!userSheet || !shoppingSheet) {
      throw new Error(
        "Sheet 'Data User' atau 'Data Belanja' tidak ditemukan di Test Case.xlsx",
      );
    }

    const usersData = xlsx.utils.sheet_to_json(userSheet);
    const shoppingData = xlsx.utils.sheet_to_json(shoppingSheet);

    const userCountRes = await client.query(
      `SELECT COUNT(*) FROM ${USERS_TABLE}`,
    );
    const shoppingCountRes = await client.query(
      `SELECT COUNT(*) FROM ${SHOPPING_TABLE}`,
    );

    const userCount = parseInt(userCountRes.rows[0].count, 10);
    const shoppingCount = parseInt(shoppingCountRes.rows[0].count, 10);

    await client.query("BEGIN");

    if (userCount === 0) {
      for (const row of usersData) {
        const query = `
          INSERT INTO ${USERS_TABLE} (id, country, credit_card_type, credit_card_number, first_name, last_name)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `;

        const values = [
          Number(row.id),
          row.country,
          row.credit_card_type,
          String(row.credit_card_number),
          row.first_name,
          row.last_name,
        ];

        await client.query(query, values);
      }
      console.log(`Inserted ${usersData.length} rows into ${USERS_TABLE}.`);
    } else {
      console.log(`Data ${USERS_TABLE} sudah ada, skip import.`);
    }

    if (shoppingCount === 0) {
      for (const row of shoppingData) {
        const query = `
          INSERT INTO ${SHOPPING_TABLE} (id, id_user, total_buy)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO NOTHING
        `;

        const values = [
          Number(row.id),
          Number(row.id_user),
          Number(row.total_buy),
        ];
        await client.query(query, values);
      }
      console.log(
        `Inserted ${shoppingData.length} rows into ${SHOPPING_TABLE}.`,
      );
    } else {
      console.log(`Data ${SHOPPING_TABLE} sudah ada, skip import.`);
    }

    await client.query("COMMIT");
    console.log("Database setup completed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database setup error:", err.message);
  } finally {
    await client.end();
  }
}

setupDatabase();
