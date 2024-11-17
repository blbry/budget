import { ipcMain } from 'electron';
import { Account, AccountFormData } from '@/shared/types';
import db from '../database';

export function setupAccountsHandlers() {
  ipcMain.handle('accounts:getAll', () => {
    const stmt = db.prepare('SELECT * FROM accounts ORDER BY name ASC');
    return stmt.all() as Account[];
  });

  ipcMain.handle('accounts:create', (_, data: AccountFormData) => {
    const stmt = db.prepare(`
      INSERT INTO accounts (name, type, wallet_addr, balance, balance_updated)
      VALUES (?, ?, ?, ?, ?)
    `);

    const balance = data.type === 'crypto' ? 0 : (data.balance || 0);

    const result = stmt.run(
      data.name,
      data.type,
      data.wallet_addr || null,
      balance,
      new Date().toISOString()
    );

    return result.lastInsertRowid;
  });

  ipcMain.handle('accounts:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
    return stmt.run(id);
  });
}
