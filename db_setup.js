const { Client } = require("pg");
const xlsx = require("xlsx");
require("dotenv").config();

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

    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                country VARCHAR(255),
                credit_card_type VARCHAR(255),
                credit_card_number VARCHAR(255),
                first_name VARCHAR(255),
                last_name VARCHAR(255)
            );
        `;
    await client.query(createTableQuery);
    console.log("Table transactions created/verified");

    const countRes = await client.query("SELECT COUNT(*) FROM transactions");
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log("Loading data from Excel...");
      const workbook = xlsx.readFile("Test Case.xlsx");
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Insert Data
      for (const row of data) {
        const insertQuery = `
                    INSERT INTO transactions (id, country, credit_card_type, credit_card_number, first_name, last_name)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
        const values = [
          row.id,
          row.country,
          row.credit_card_type,
          row.credit_card_number,
          row.first_name,
          row.last_name,
        ];
        await client.query(insertQuery, values);
      }
      console.log(`Inserted ${data.length} rows from Excel.`);
    } else {
      console.log("Data already exists in table, skipping import.");
    }
  } catch (err) {
    console.error("Database setup error:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();
