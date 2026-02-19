const express = require("express");
const { Client } = require("pg");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(express.json());

// Setup Database Connection
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));

async function getTopCountry() {
  // Query a. Munculkan data country mana aja yang spend nya terbanyak
  const query = `
        SELECT country, COUNT(*) as transaction_count
        FROM transactions
        GROUP BY country
        ORDER BY transaction_count DESC
        LIMIT 1;
    `;
  const res = await client.query(query);
  return res.rows[0];
}

async function getTopCardType() {
  // Query b. Munculkan data jumlah tipe kartu kredit terbanyak
  const query = `
        SELECT credit_card_type, COUNT(*) as usage_count
        FROM transactions
        GROUP BY credit_card_type
        ORDER BY usage_count DESC
        LIMIT 1;
    `;
  const res = await client.query(query);
  return res.rows[0];
}

(async () => {
  try {
    const topCountry = await getTopCountry();
    if (topCountry) {
      console.log(
        `\n[a] Country dengan transaksi terbanyak: ${topCountry.country} (Jumlah: ${topCountry.transaction_count})`,
      );
    }

    const topCard = await getTopCardType();
    if (topCard) {
      console.log(
        `[b] Tipe Kartu Kredit terbanyak: ${topCard.credit_card_type} (Jumlah: ${topCard.usage_count})\n`,
      );
    }
  } catch (err) {
    console.error("Error running initial queries:", err);
  }
})();

app.get("/api/top-country-transactions", async (req, res) => {
  try {
    const topCountryData = await getTopCountry();

    if (!topCountryData) {
      return res.status(404).json({ message: "No data found" });
    }

    const countryName = topCountryData.country;

    const queryDetail = `
        SELECT id, country, credit_card_type, credit_card_number, first_name, last_name
        FROM transactions
        WHERE country = $1
    `;
    const result = await client.query(queryDetail, [countryName]);

    const responseData = result.rows.map((row) => ({
      Id: row.id,
      Country: row.country,
      Credit_card_type: row.credit_card_type,
      Credit_card: row.credit_card_number,
      First_name: row.first_name,
      Last_name: row.last_name,
    }));

    res.json({
      description: `Data transaksi untuk negara dengan spend terbanyak: ${countryName}`,
      total_records: responseData.length,
      data: responseData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/transaction", async (req, res) => {
  const { country, credit_card_type, credit_card, first_name, last_name } =
    req.body;

  if (
    !country ||
    !credit_card_type ||
    !credit_card ||
    !first_name ||
    !last_name
  ) {
    return res.status(400).json({
      error:
        "Mohon lengkapi semua field (country, credit_card_type, credit_card, first_name, last_name)",
    });
  }

  try {
    const queryInsert = `
        INSERT INTO transactions (country, credit_card_type, credit_card_number, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, country, credit_card_type, credit_card_number, first_name, last_name
      `;
    const values = [
      country,
      credit_card_type,
      credit_card,
      first_name,
      last_name,
    ];

    const result = await client.query(queryInsert, values);
    const newRecord = result.rows[0];

    res.status(201).json({
      message: "Data berhasil ditambahkan",
      data: {
        Id: newRecord.id,
        Country: newRecord.country,
        Credit_card_type: newRecord.credit_card_type,
        Credit_card: newRecord.credit_card_number,
        First_name: newRecord.first_name,
        Last_name: newRecord.last_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert data" });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log(
    `[GET] Lihat data transaksi negara terbanyak: http://localhost:${port}/api/top-country-transactions`,
  );
  console.log(
    `[POST] Tambah data baru ke: http://localhost:${port}/api/transaction`,
  );
});
