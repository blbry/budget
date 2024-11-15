import { ipcMain } from 'electron';
import db from '../database';

export function setupCategoriesHandlers() {
  ipcMain.handle('categories:getAll', () => {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY parent_id, name');
    return stmt.all();
  });
}
