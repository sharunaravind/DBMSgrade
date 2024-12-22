import sqlite3 from "sqlite3";
import { promisify } from "util";
import fs from "fs";

const DB_FILE = "grades.db";
const RESET_DB = true;

// Delete corrupted database if it exists
if (RESET_DB && fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
}

// Create a new database instance
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Database creation error:", err);
    process.exit(1);
  }
  console.log("Connected to SQLite database");
});

// Promisify database methods
const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

// Initialize database tables
const initDb = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subject TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        roll_no TEXT NOT NULL,
        t1 REAL,
        t2 REAL,
        t_total REAL,
        ap REAL,
        tutorial REAL,
        finals REAL,
        teacher_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id)
      )
    `);

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};

// Initialize the database
initDb();

// Add error handling for database operations
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Database connection closed");
    }
    process.exit(err ? 1 : 0);
  });
});

export default {
  run,
  get,
  all,
};
