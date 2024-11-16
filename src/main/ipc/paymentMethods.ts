import { ipcMain } from 'electron';
import { PaymentMethod, PaymentMethodFormData, Reward } from '@/shared/types';
import db from '../database';

interface DBPaymentMethod {
  id: number;
  type: string;
  name: string;
  statementDate: number | null;
  paymentAccount: string | null;
  annualFee: number | null;
  tickerSymbol: string | null;
  walletAddress: string | null;
  rewards: string;
}

export function setupPaymentMethodsHandlers() {
  ipcMain.handle('payment-methods:getAll', () => {
    const stmt = db.prepare(`
      SELECT
        pm.*,
        json_group_array(
          json_object(
            'id', r.id,
            'type', r.type,
            'amount', r.amount,
            'category_id', r.category_id,
            'frequency', r.frequency
          )
        ) as rewards
      FROM payment_methods pm
      LEFT JOIN rewards r ON pm.id = r.payment_method_id
      GROUP BY pm.id, pm.type, pm.name, pm.statementDate,
               pm.paymentAccount, pm.annualFee, pm.tickerSymbol,
               pm.walletAddress
      ORDER BY pm.id ASC
    `);

    const results = stmt.all() as DBPaymentMethod[];
    return results.map((method) => ({
      id: method.id,
      type: method.type as PaymentMethod['type'],
      name: method.name,
      statementDate: method.statementDate,
      paymentAccount: method.paymentAccount,
      annualFee: method.annualFee,
      tickerSymbol: method.tickerSymbol,
      walletAddress: method.walletAddress,
      rewards: JSON.parse(method.rewards).filter((r: Reward) => r.id !== null)
    }));
  });

  ipcMain.handle('payment-methods:create', (_, data: PaymentMethodFormData) => {
    db.transaction(() => {
      const methodStmt = db.prepare(`
        INSERT INTO payment_methods (
          type, name, statementDate,
          paymentAccount, annualFee,
          tickerSymbol, walletAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = methodStmt.run(
        data.type,
        data.name,
        data.statementDate,
        data.paymentAccount,
        data.annualFee,
        data.tickerSymbol,
        data.walletAddress
      );

      if (data.rewards && Array.isArray(data.rewards) && data.rewards.length > 0) {
        const rewardStmt = db.prepare(`
          INSERT INTO rewards (
            payment_method_id, type, amount,
            category_id, frequency
          ) VALUES (?, ?, ?, ?, ?)
        `);

        data.rewards.forEach((reward: Reward) => {
          rewardStmt.run(
            result.lastInsertRowid,
            reward.type,
            reward.amount,
            reward.category_id,
            reward.frequency
          );
        });
      }

      return result.lastInsertRowid;
    })();
  });

  ipcMain.handle('payment-methods:update', (_, id: number, data: PaymentMethodFormData) => {
    db.transaction(() => {
      const methodStmt = db.prepare(`
        UPDATE payment_methods
        SET type = ?, name = ?, statementDate = ?,
            paymentAccount = ?, annualFee = ?,
            tickerSymbol = ?, walletAddress = ?
        WHERE id = ?
      `);

      methodStmt.run(
        data.type,
        data.name,
        data.statementDate,
        data.paymentAccount,
        data.annualFee,
        data.tickerSymbol,
        data.walletAddress,
        id
      );

      // Delete existing rewards
      db.prepare('DELETE FROM rewards WHERE payment_method_id = ?').run(id);

      // Insert new rewards
      if (data.rewards && Array.isArray(data.rewards) && data.rewards.length > 0) {
        const rewardStmt = db.prepare(`
          INSERT INTO rewards (
            payment_method_id, type, amount,
            category_id, frequency
          ) VALUES (?, ?, ?, ?, ?)
        `);

        data.rewards.forEach((reward: Reward) => {
          rewardStmt.run(
            id,
            reward.type,
            reward.amount,
            reward.category_id,
            reward.frequency
          );
        });
      }
    })();
  });

  ipcMain.handle('payment-methods:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM payment_methods WHERE id = ?');
    stmt.run(id);
  });
}
