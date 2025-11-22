const { app } = require("electron");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const isDev = !app || !app.isPackaged; // true in dev mode

// In dev → use local database
// In prod → use a writable location in userData
const dbDir = isDev
  ? path.join(__dirname)
  : path.join(app.getPath("userData"));

const dbPath = path.join(dbDir, "restaurant.db");

// If production and DB doesn’t exist yet → copy from packaged version
if (!isDev && !fs.existsSync(dbPath)) {
  try {
    const source = path.join(process.resourcesPath, "database", "restaurant.db");
    fs.copyFileSync(source, dbPath);
    console.log("✅ Copied restaurant.db to userData:", dbPath);
  } catch (err) {
    console.error("❌ Failed to copy database file:", err);
  }
}

console.log("📦 Using SQLite database:", dbPath);
const db = new Database(dbPath);

// ✅ Products table
db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )
`).run();

// ✅ Customers table
db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    token TEXT UNIQUE,
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

// ✅ Bills table
db.prepare(`
  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    invoice TEXT NOT NULL,
    name TEXT NOT NULL,
    total REAL NOT NULL
  )
`).run();

console.log("✅ Database initialized and ready.");
module.exports = db;
