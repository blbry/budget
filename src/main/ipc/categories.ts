import { ipcMain } from 'electron';
import { Category } from '@/shared/types';
import db from '../database';

export function setupCategoriesHandlers() {
  ipcMain.handle('categories:getAll', () => {
    const stmt = db.prepare(`
      WITH RECURSIVE CategoryHierarchy AS (
        -- Base case: Get all root categories
        SELECT id, name, parent_id, type, is_default, 0 as level, name as sort_path
        FROM categories
        WHERE parent_id IS NULL

        UNION ALL

        -- Recursive case: Get child categories
        SELECT c.id, c.name, c.parent_id, c.type, c.is_default, ch.level + 1,
               ch.sort_path || '/' || c.name
        FROM categories c
        JOIN CategoryHierarchy ch ON c.parent_id = ch.id
      )
      SELECT id, name, parent_id, type, is_default
      FROM CategoryHierarchy
      ORDER BY sort_path;
    `);
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
