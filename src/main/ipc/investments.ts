import { ipcMain } from 'electron';
import { Investment, InvestmentFormData } from '@/shared/types';
import db from '../database';

export function setupInvestmentHandlers() {
  ipcMain.handle('investments:getAll', () => {
    const stmt = db.prepare(`
      SELECT
        i.id, i.name, i.ticker, i.value, i.monthly_totals, i.last_updated
      FROM investments i
      UNION ALL
      SELECT
        id,
        name,
        COALESCE(ticker, 'BTC') as ticker,
        balance as value,
        '{}' as monthly_totals,
        balance_updated as last_updated
      FROM accounts
      WHERE type = 'crypto'
      ORDER BY name ASC
    `);
    return stmt.all() as Investment[];
  });

  ipcMain.handle('investments:create', (_, data: InvestmentFormData) => {
    const stmt = db.prepare(`
      INSERT INTO investments (name, ticker, value, last_updated)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.ticker.toUpperCase(),
      data.value,
      new Date().toISOString()
    );

    return result.lastInsertRowid;
  });

  ipcMain.handle('investments:update', (_, id: number, data: InvestmentFormData) => {
    const stmt = db.prepare(`
      UPDATE investments
      SET name = ?, ticker = ?, value = ?, last_updated = ?
      WHERE id = ?
    `);

    return stmt.run(
      data.name,
      data.ticker.toUpperCase(),
      data.value,
      new Date().toISOString(),
      id
    );
  });

  ipcMain.handle('investments:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM investments WHERE id = ?');
    return stmt.run(id);
  });

  ipcMain.handle('investments:updateMonthlyTotals', (_, id: number, totals: string) => {
    const stmt = db.prepare('UPDATE investments SET monthly_totals = ? WHERE id = ?');
    return stmt.run(totals, id);
  });
}
