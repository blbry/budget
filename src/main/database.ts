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
    type TEXT NOT NULL DEFAULT 'expense' CHECK(type IN ('expense', 'income', 'asset')),
    is_default BOOLEAN NOT NULL DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('employment', 'other_recurring', 'simple')),
    frequency TEXT CHECK(frequency IN ('weekly', 'biweekly', 'monthly', 'semimonthly', 'quarterly', 'annually', 'none')),
    amount REAL DEFAULT 0,
    pay_date INTEGER,
    monthly_totals TEXT DEFAULT '{}',
    next_payment_date TEXT
  );

  CREATE TABLE IF NOT EXISTS income_deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'deduction')),
    format TEXT NOT NULL CHECK(format IN ('percent', 'amount')),
    value REAL NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('per_paycheck', 'monthly', 'annually')),
    FOREIGN KEY (source_id) REFERENCES income(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('crypto', 'bank')),
    ticker TEXT DEFAULT 'BTC',
    wallet_addr TEXT,
    balance REAL DEFAULT 0,
    balance_updated TEXT
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ownership_type TEXT NOT NULL CHECK(ownership_type IN ('own', 'lease', 'loan')),
    value REAL,
    payment_date INTEGER,
    remaining_payments INTEGER,
    payment_amount REAL,
    description TEXT
  );

  -- Insert default categories if they don't exist
  INSERT OR IGNORE INTO categories (id, name, parent_id, type, is_default) VALUES
    -- Recreation
    (1, 'Recreation', NULL, 'expense', 1),
    (2, 'Other', 1, 'expense', 1),

    -- Living Expenses
    (3, 'Living Expenses', NULL, 'expense', 1),
    (4, 'Other', 3, 'expense', 1),
    (5, 'Housing', 3, 'expense', 1),
    (6, 'Home Insurance', 3, 'expense', 1),
    (7, 'Utilities', 3, 'expense', 1),
    (8, 'Groceries', 3, 'expense', 1),
    (9, 'Restaurants', 3, 'expense', 1);

  -- Insert default cash payment method if it doesn't exist
  INSERT OR IGNORE INTO payment_methods (id, type, name) VALUES (1, 'cash', 'Cash');

  -- Insert default settings if they don't exist
  INSERT OR IGNORE INTO settings (key, value) VALUES
    ('theme', 'system'),
    ('dateFormat', 'MM/DD/YYYY'),
    ('currencyFormat', 'USD'),
    ('location', 'NY');
`);

export default db;
