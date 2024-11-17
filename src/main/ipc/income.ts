import { ipcMain } from 'electron';
import { Income, IncomeFormData } from '@/shared/types';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import db from '../database';

function getPaychecksPerMonth(frequency?: string): number {
  switch (frequency) {
    case 'weekly': return 4.33;
    case 'biweekly': return 2.17;
    case 'semimonthly': return 2;
    case 'monthly': return 1;
    case 'quarterly': return 0.33;
    case 'annually': return 0.083;
    default: return 1;
  }
}

function getPaychecksPerYear(frequency?: string): number {
  switch (frequency) {
    case 'weekly': return 52;
    case 'biweekly': return 26;
    case 'semimonthly': return 24;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
    default: return 12;
  }
}

function calculatePaymentAmount(income: Income): number {
  // Calculate per-paycheck amount based on annual salary
  const annualAmount = income.amount || 0;
  const paychecksPerYear = getPaychecksPerYear(income.frequency);
  const baseAmount = annualAmount / paychecksPerYear;

  let totalDeductions = 0;

  income.deductions?.forEach((deduction) => {
    const deductionAmount = deduction.format === 'percent'
      ? baseAmount * (deduction.value / 100)
      : deduction.value;

    switch (deduction.frequency) {
      case 'per_paycheck':
        totalDeductions += deductionAmount;
        break;
      case 'monthly':
        totalDeductions += deductionAmount / getPaychecksPerMonth(income.frequency);
        break;
      case 'annually':
        totalDeductions += deductionAmount / getPaychecksPerYear(income.frequency);
        break;
      default:
        break;
    }
  });

  return baseAmount - totalDeductions;
}

function calculateNextPaymentDate(income: Income): Date {
  const currentDate = income.next_payment_date
    ? new Date(income.next_payment_date)
    : new Date();

  switch (income.frequency) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'semimonthly':
      return addDays(currentDate, 15);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'quarterly':
      return addMonths(currentDate, 3);
    case 'annually':
      return addYears(currentDate, 1);
    default:
      return currentDate;
  }
}

function updateMonthlyTotal(id: number, amount: number): void {
  const income = db.prepare('SELECT name, monthly_totals FROM income WHERE id = ?').get(id) as Income;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString();

  try {
    const totals = JSON.parse(income.monthly_totals);
    if (!totals[currentYear]) totals[currentYear] = {};
    if (!totals[currentYear][currentMonth]) totals[currentYear][currentMonth] = {};

    const currentTotal = totals[currentYear][currentMonth][income.name] || 0;
    totals[currentYear][currentMonth][income.name] = currentTotal + amount;

    const stmt = db.prepare('UPDATE income SET monthly_totals = ? WHERE id = ?');
    stmt.run(JSON.stringify(totals), id);
  } catch (error) {
    console.error('Error updating monthly total:', error);
  }
}

function updateNextPaymentDate(id: number, nextDate: Date): void {
  const stmt = db.prepare('UPDATE income SET next_payment_date = ? WHERE id = ?');
  stmt.run(nextDate.toISOString(), id);
}

export function setupIncomeHandlers() {
  ipcMain.handle('income:getAll', () => {
    const stmt = db.prepare(`
      SELECT i.*,
        json_group_array(
          json_object(
            'id', d.id,
            'source_id', d.source_id,
            'name', d.name,
            'type', d.type,
            'format', d.format,
            'value', d.value,
            'frequency', d.frequency
          )
        ) as deductions
      FROM income i
      LEFT JOIN income_deductions d ON i.id = d.source_id
      GROUP BY i.id
    `);
    return stmt.all();
  });

  ipcMain.handle('income:create', (_, data: IncomeFormData) => {
    const stmt = db.prepare(`
      INSERT INTO income (name, type, frequency, amount, pay_date, next_payment_date, monthly_totals)
      VALUES (?, ?, ?, ?, ?, ?, '{}')
    `);

    const payDate = new Date(data.pay_date || new Date().toISOString());
    const now = new Date();

    if (payDate.getDate() < now.getDate()) {
      payDate.setMonth(payDate.getMonth() + 1);
    }

    const info = stmt.run(
      data.name,
      data.type,
      data.frequency,
      data.amount,
      data.pay_date,
      payDate.toISOString()
    );

    if (data.deductions?.length) {
      const deductionStmt = db.prepare(`
        INSERT INTO income_deductions (source_id, name, type, format, value, frequency)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      data.deductions.forEach((deduction) => {
        deductionStmt.run(
          info.lastInsertRowid,
          deduction.name,
          deduction.type,
          deduction.format,
          deduction.value,
          deduction.frequency
        );
      });
    }

    const income = db.prepare('SELECT * FROM income WHERE id = ?').get(info.lastInsertRowid) as Income;
    if (income) {
      const amount = calculatePaymentAmount(income);
      updateMonthlyTotal(income.id, amount);
    }

    return info.lastInsertRowid;
  });

  ipcMain.handle('income:update', (_, id: number, data: IncomeFormData) => {
    const stmt = db.prepare(`
      UPDATE income
      SET name = ?, type = ?, frequency = ?, amount = ?, pay_date = ?, next_payment_date = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name,
      data.type,
      data.frequency,
      data.amount,
      data.pay_date,
      data.next_payment_date,
      id
    );

    // Handle deductions
    const deleteStmt = db.prepare('DELETE FROM income_deductions WHERE source_id = ?');
    deleteStmt.run(id);

    if (data.deductions?.length) {
      const deductionStmt = db.prepare(`
        INSERT INTO income_deductions (source_id, name, type, format, value, frequency)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      data.deductions.forEach((deduction) => {
        deductionStmt.run(id, deduction.name, deduction.type, deduction.format, deduction.value, deduction.frequency);
      });
    }
  });

  ipcMain.handle('income:updateMonthlyTotals', (_, id: number, totals: string) => {
    const stmt = db.prepare('UPDATE income SET monthly_totals = ? WHERE id = ?');
    return stmt.run(totals, id);
  });

  ipcMain.handle('income:delete', (_, id: number) => {
    const stmt = db.prepare('DELETE FROM income WHERE id = ?');
    return stmt.run(id);
  });

  ipcMain.handle('income:processDuePayments', () => {
    const now = new Date();
    const stmt = db.prepare(`
      SELECT * FROM income
      WHERE next_payment_date IS NOT NULL
      AND next_payment_date <= ?
    `);

    const duePayments = stmt.all(now.toISOString()) as Income[];

    duePayments.forEach((income) => {
      // Calculate payment amount
      const amount = calculatePaymentAmount(income);

      // Add payment to monthly_totals
      updateMonthlyTotal(income.id, amount);

      // Calculate and set next payment date
      const nextDate = calculateNextPaymentDate(income);
      updateNextPaymentDate(income.id, nextDate);
    });
  });
}
