import { ipcMain } from 'electron';
import { Category } from '@/shared/types';
import db from '../database';

export function setupCategoriesHandlers() {
  ipcMain.handle('categories:getAll', () => {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY parent_id, name');
    return stmt.all();
  });

  ipcMain.handle('categories:create', (_, data: Omit<Category, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO categories (name, parent_id, type)
      VALUES (?, ?, 'expense')
    `);

    const result = stmt.run(data.name, data.parent_id);
    return result.lastInsertRowid;
  });

  ipcMain.handle('categories:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ? AND is_default = 0');
    return stmt.run(id);
  });

  ipcMain.handle('categories:update', (_, id: number, name: string) => {
    const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ? AND is_default = 0');
    return stmt.run(name, id);
  });
}
