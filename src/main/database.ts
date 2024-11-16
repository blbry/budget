import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

const USER_DATA_PATH = app.getPath('userData');
const DB_PATH = path.join(USER_DATA_PATH, 'database.db');

// Ensure the userdata directory exists
if (!fs.existsSync(USER_DATA_PATH)) {
  fs.mkdirSync(USER_DATA_PATH, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    statementDate INTEGER,
    paymentAccount TEXT,
    annualFee REAL,
    tickerSymbol TEXT,
    walletAddress TEXT
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_method_id INTEGER NOT NULL,
    type TEXT NOT NULL,  -- 'points' or 'cashback' or 'credit'
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    frequency TEXT,      -- 'monthly' or 'annual' or 'semiannual', for credits only
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  -- Insert default categories if they don't exist
  INSERT OR IGNORE INTO categories (id, name, parent_id) VALUES
    (1, 'Living Expenses', NULL),
    (2, 'Groceries', 1),
    (3, 'Internet', 1);

  -- Insert default cash payment method if it doesn't exist
  INSERT OR IGNORE INTO payment_methods (id, type, name) VALUES (1, 'cash', 'Cash');
`);

export default db;
