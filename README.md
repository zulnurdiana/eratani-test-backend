"# Eratani Interview Test Solutions

Repository ini berisi solusi untuk tes coding interview Eratani, mencakup 4 soal yang diselesaikan menggunakan Node.js.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Instalasi Global](#instalasi-global)
- [Soal 1: Pola Angka](#soal-1-pola-angka-soal1js)
- [Soal 2: Cek Palindrome](#soal-2-cek-palindrome-soal2js)
- [Soal 3: API & Database (PostgreSQL)](#soal-3-api--database-postgresql-soal3js)
- [Soal 4: Selection Sort](#soal-4-selection-sort-soal4js)

---

## Prasyarat

Pastikan Anda telah menginstal:

1.  **Node.js** (v14 ke atas recommended)
2.  **PostgreSQL** (untuk Soal 3)
3.  **Git** (opsional, untuk clone repo)

---

## Instalasi Global

Sebelum menjalankan script apa pun, install dependencies yang diperlukan:

```bash
npm install
```

_Dependencies utama: `express`, `pg`, `dotenv`, `xlsx`._

---

## Soal 1: Pola Angka (`soal1.js`)

Program ini menerima input nilai `k` dan menampilkan angka ke-`k` dari sebuah pola bilangan tertentu.

### Cara Menjalankan

```bash
node soal1.js
```

### Contoh Penggunaan

1.  Program akan meminta jumlah test case.
2.  Masukkan nilai `k` untuk setiap test case.
3.  Program akan mencetak hasilnya.

---

## Soal 2: Cek Palindrome (`soal2.js`)

Program sederhana untuk mengecek apakah sebuah input (kata/angka) adalah palindrome (dibaca sama dari depan maupun belakang).

### Cara Menjalankan

```bash
node soal2.js
```

### Contoh Penggunaan

1.  Masukkan kata: `katak` -> Output: `Palindrome ✅`
2.  Masukkan kata: `hello` -> Output: `Bukan palindrome ❌`

---

## Soal 3: API & Database PostgreSQL (`soal3.js`)

Solusi Backend API menggunakan Express.js dan PostgreSQL. Mencakup import data Excel, Query Statistik, dan CRUD sederhana.

### Persiapan Database (Wajib dilakukan pertama kali)

1.  Pastikan service PostgreSQL berjalan.
2.  Buat database baru (contoh: `eratani_test`).
3.  Buat file `.env` di root folder dan isi sesuai kredensial Anda:
    ```env
    DB_USER=postgres
    DB_HOST=localhost
    DB_DATABASE=eratani_test
    DB_PASSWORD=password_anda
    DB_PORT=5432
    ```
4.  Jalankan script setup untuk membuat tabel dan import data dari `Test Case.xlsx`:
    ```bash
    node db_setup.js
    ```
5.  (Opsional) Jika terjadi error duplicate key saat insert data baru, jalankan fix sequence:
    ```bash
    node fix_sequence.js
    ```

### Cara Menjalankan Server

```bash
node soal3.js
```

_Output terminal akan langsung menampilkan jawaban untuk query statistik (Country & Card Type terbanyak)._

### Testing API

**1. GET Data Transaksi Negara Terbanyak**

```bash
curl http://localhost:3000/api/top-country-transactions
```

**2. POST Tambah Data Baru**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"country": "Indonesia", "credit_card_type": "Visa", "credit_card": "4000123456789010", "first_name": "Budi", "last_name": "Santoso"}' http://localhost:3000/api/transaction
```

---

## Soal 4: Selection Sort (`soal4.js`)

Implementasi algoritma sorting (Selection Sort) untuk mengurutkan array angka acak.

### Cara Menjalankan

```bash
node soal4.js
```

Program akan menghasilkan 10 angka acak, menampilkannya, lalu menampilkannya lagi setelah diurutkan."
