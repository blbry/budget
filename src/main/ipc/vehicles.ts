import { ipcMain } from 'electron';
import { Vehicle, VehicleFormData } from '@/shared/types';
import db from '../database';

export function setupVehiclesHandlers() {
  ipcMain.handle('vehicles:getAll', () => {
    const stmt = db.prepare('SELECT * FROM vehicles ORDER BY name ASC');
    return stmt.all() as Vehicle[];
  });

  ipcMain.handle('vehicles:create', (_, data: VehicleFormData) => {
    const stmt = db.prepare(`
      INSERT INTO vehicles (name, ownership_type, value, payment_date, remaining_payments, payment_amount, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.ownership_type,
      data.value || null,
      data.payment_date || null,
      data.remaining_payments || null,
      data.payment_amount || null,
      data.description || null
    );

    return result.lastInsertRowid;
  });

  ipcMain.handle('vehicles:update', (_, id: number, data: VehicleFormData) => {
    const stmt = db.prepare(`
      UPDATE vehicles
      SET name = ?, ownership_type = ?, value = ?, payment_date = ?,
          remaining_payments = ?, payment_amount = ?, description = ?
      WHERE id = ?
    `);

    return stmt.run(
      data.name,
      data.ownership_type,
      data.value || null,
      data.payment_date || null,
      data.remaining_payments || null,
      data.payment_amount || null,
      data.description || null,
      id
    );
  });

  ipcMain.handle('vehicles:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    return stmt.run(id);
  });
}
