import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Investment } from '@/shared/types';
import { Button } from '@/renderer/components/button';
import { useCurrency } from '@/renderer/components/CurrencyProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/table';
import InvestmentDialog from '@/renderer/components/InvestmentDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/renderer/components/tooltip';

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const { formatAmount } = useCurrency();

  const loadInvestments = async () => {
    const invs = await window.electron.investments.getAll();
    setInvestments(invs);
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      await window.electron.investments.delete(id);
      loadInvestments();
    }
  };

  const handleDialogClose = () => {
    setSelectedInvestment(null);
    setIsDialogOpen(false);
    loadInvestments();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Investments</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Investment
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell>{investment.name}</TableCell>
              <TableCell>{investment.ticker}</TableCell>
              <TableCell>{formatAmount(investment.value)}</TableCell>
              <TableCell>
                {format(new Date(investment.last_updated), 'MM/dd/yyyy')}
              </TableCell>
              <TableCell>
                {investment.id.toString().startsWith('-') ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit this crypto account on the Accounts page</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(investment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(investment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InvestmentDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        investment={selectedInvestment || undefined}
        onSubmit={async (data) => {
          if (selectedInvestment) {
            await window.electron.investments.update(selectedInvestment.id, data);
          } else {
            await window.electron.investments.create(data);
          }
        }}
      />
    </div>
  );
}
