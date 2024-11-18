import { useEffect, useState } from 'react';
import { Income, MonthlyTotals } from '@/shared/types';
import { Button } from '@/renderer/components/button';
import { useCurrency } from '@/renderer/components/CurrencyProvider';
import { useDate } from '@/renderer/components/DateProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/table';
import IncomeDialog from '@/renderer/components/IncomeDialog';
import MonthlyTotalDialog from '@/renderer/components/MonthlyTotalDialog';
import { Alert, AlertDescription } from '@/renderer/components/alert';

export default function IncomePage() {
  const [incomeSources, setIncomeSources] = useState<Income[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [isMonthlyTotalDialogOpen, setIsMonthlyTotalDialogOpen] = useState(false);
  const [selectedMonthlyTotal, setSelectedMonthlyTotal] = useState<{
    id: number;
    amount: number;
  } | null>(null);
  const { formatAmount } = useCurrency();
  const { formatMonthYear } = useDate();

  const loadIncomeSources = async () => {
    const sources = await window.electron.income.getAll();
    setIncomeSources(sources);
  };

  useEffect(() => {
    loadIncomeSources();
  }, []);

  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await window.electron.income.delete(id);
    loadIncomeSources();
  };

  const handleDialogClose = () => {
    setSelectedIncome(null);
    setIsDialogOpen(false);
    loadIncomeSources();
  };

  const handleMonthlyTotalAdjust = (id: number, currentAmount: number) => {
    setSelectedMonthlyTotal({ id, amount: currentAmount });
    setIsMonthlyTotalDialogOpen(true);
  };

  const getCurrentMonthTotal = (monthlyTotals: string, category: string): number => {
    try {
      const totals = JSON.parse(monthlyTotals) as MonthlyTotals;
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = (new Date().getMonth() + 1).toString();
      return totals[currentYear]?.[currentMonth]?.[category] || 0;
    } catch {
      return 0;
    }
  };

  const updateMonthlyTotal = async (amount: number) => {
    if (!selectedMonthlyTotal) return;

    const income = incomeSources.find(i => i.id === selectedMonthlyTotal.id);
    if (!income) return;

    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();

    try {
      const totals = JSON.parse(income.monthly_totals) as MonthlyTotals;

      if (!totals[currentYear]) {
        totals[currentYear] = {};
      }
      if (!totals[currentYear][currentMonth]) {
        totals[currentYear][currentMonth] = {};
      }

      totals[currentYear][currentMonth][income.name] = amount;

      await window.electron.income.updateMonthlyTotals(
        selectedMonthlyTotal.id,
        JSON.stringify(totals)
      );

      loadIncomeSources();
    } catch (error) {
      console.error('Error updating monthly total:', error);
    }
  };

  const currentMonthYear = formatMonthYear(new Date());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Income</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Income Source
        </Button>
      </div>

      <div className="mb-8">
        <Alert><AlertDescription>Automatically calculated recurring income is currently broken</AlertDescription></Alert>
        <h2 className="text-xl font-semibold mb-4">Income in {currentMonthYear}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeSources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>{source.name}</TableCell>
                <TableCell>
                  {formatAmount(getCurrentMonthTotal(source.monthly_totals, source.name))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMonthlyTotalAdjust(
                      source.id,
                      getCurrentMonthTotal(source.monthly_totals, source.name)
                    )}
                  >
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Annual Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeSources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>{source.name}</TableCell>
                <TableCell className="capitalize">{source.type}</TableCell>
                <TableCell className="capitalize">
                  {source.frequency || '-'}
                </TableCell>
                <TableCell>
                  {source.amount ? formatAmount(source.amount) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(source)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(source.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <IncomeDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        income={selectedIncome}
        onSubmit={async (data) => {
          if (selectedIncome) {
            await window.electron.income.update(selectedIncome.id, data);
          } else {
            await window.electron.income.create(data);
          }
        }}
      />

      <MonthlyTotalDialog
        open={isMonthlyTotalDialogOpen}
        onClose={() => {
          setIsMonthlyTotalDialogOpen(false);
          setSelectedMonthlyTotal(null);
        }}
        currentAmount={selectedMonthlyTotal?.amount || 0}
        onSubmit={updateMonthlyTotal}
      />
    </div>
  );
}
