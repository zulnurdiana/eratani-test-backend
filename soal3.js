const express = require("express");
const { Client } = require("pg");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

const USERS_TABLE = process.env.USERS_TABLE || "users";
const SHOPPING_TABLE = process.env.SHOPPING_TABLE || "belanja";

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
  const query = `
    SELECT u.country, SUM(b.total_buy) AS total_spend, COUNT(*) AS transaction_count
    FROM ${SHOPPING_TABLE} b
    JOIN ${USERS_TABLE} u ON u.id = b.id_user
    GROUP BY u.country
    ORDER BY total_spend DESC
    LIMIT 1;
  `;

  const res = await client.query(query);
  return res.rows[0];
}

async function getTopCardType() {
  const query = `
    SELECT u.credit_card_type, COUNT(*) AS usage_count
    FROM ${SHOPPING_TABLE} b
    JOIN ${USERS_TABLE} u ON u.id = b.id_user
    GROUP BY u.credit_card_type
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
        `\n[a] Country dengan total belanja terbanyak: ${topCountry.country} (Total Spend: ${topCountry.total_spend}, Jumlah Transaksi: ${topCountry.transaction_count})`,
      );
    }

    const topCard = await getTopCardType();
    if (topCard) {
      console.log(
        `[b] Tipe Kartu Kredit terbanyak: ${topCard.credit_card_type} (Jumlah: ${topCard.usage_count})\n`,
      );
    }
  } catch (err) {
    console.error("Error running initial queries:", err.message);
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
      SELECT
        b.id,
        u.country,
        u.credit_card_type,
        u.credit_card_number,
        u.first_name,
        u.last_name,
        b.total_buy
      FROM ${SHOPPING_TABLE} b
      JOIN ${USERS_TABLE} u ON u.id = b.id_user
      WHERE u.country = $1
      ORDER BY b.id;
    `;

    const result = await client.query(queryDetail, [countryName]);

    const responseData = result.rows.map((row) => ({
      Id: row.id,
      Country: row.country,
      Credit_card_type: row.credit_card_type,
      Credit_card: row.credit_card_number,
      First_name: row.first_name,
      Last_name: row.last_name,
      Total_buy: row.total_buy,
    }));

    res.json({
      description: `Data transaksi untuk negara dengan total belanja terbanyak: ${countryName}`,
      total_spend: topCountryData.total_spend,
      total_records: responseData.length,
      data: responseData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
      detail: err.message,
    });
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
        "Mohon lengkapi field wajib: country, credit_card_type, credit_card, first_name, last_name",
    });
  }

  try {
    await client.query("BEGIN");
    const insertUserQuery = `
      INSERT INTO ${USERS_TABLE} (country, credit_card_type, credit_card_number, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, country, credit_card_type, credit_card_number, first_name, last_name
    `;

    const userValues = [
      country,
      credit_card_type,
      credit_card,
      first_name,
      last_name,
    ];
    const userResult = await client.query(insertUserQuery, userValues);
    const newUser = userResult.rows[0];

    // 2) Insert transaksi belanja default 0 agar relasi dan data transaksi tetap konsisten
    const insertShoppingQuery = `
      INSERT INTO ${SHOPPING_TABLE} (id_user, total_buy)
      VALUES ($1, $2)
      RETURNING id, total_buy
    `;
    const shoppingResult = await client.query(insertShoppingQuery, [
      newUser.id,
      0,
    ]);
    const newShopping = shoppingResult.rows[0];

    await client.query("COMMIT");

    res.status(201).json({
      message: "Data transaksi berhasil ditambahkan",
      data: {
        Id: newShopping.id,
        Country: newUser.country,
        Credit_card_type: newUser.credit_card_type,
        Credit_card: newUser.credit_card_number,
        First_name: newUser.first_name,
        Last_name: newUser.last_name,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: "Failed to insert data",
      detail: err.message,
    });
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
