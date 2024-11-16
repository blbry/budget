import { ipcMain } from 'electron';
import db from '../database';

export function setupSettingsHandlers() {
  ipcMain.handle('settings:getAll', () => {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const settings = stmt.all() as { key: string; value: string }[];
    return settings.reduce((acc, curr) => ({
      ...acc,
      [curr.key]: curr.value
    }), {} as Record<string, string>);
  });

  ipcMain.handle('settings:update', (_, key: string, value: string) => {
    db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        WHERE key = ?
      `);
      return stmt.run(key, value, key);
    })();
  });
}
