import { useEffect, useState } from 'react';
import { PaymentMethod } from '@/shared/types';
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
import PaymentMethodDialog from '@/renderer/components/PaymentMethodDialog'

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { formatAmount } = useCurrency();
  const { formatDate } = useDate();

  const loadPaymentMethods = async () => {
    const methods = await window.electron.paymentMethods.getAll();
    setPaymentMethods(methods);
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      await window.electron.paymentMethods.delete(id);
      loadPaymentMethods();
    }
  };

  const handleDialogClose = () => {
    setSelectedMethod(null);
    setIsDialogOpen(false);
    loadPaymentMethods();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Payment Method
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Statement Date</TableHead>
            <TableHead>Annual Fee</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentMethods.map((method) => (
            <TableRow key={method.id}>
              <TableCell className="capitalize">{method.type}</TableCell>
              <TableCell>{method.name}</TableCell>
              <TableCell>
                {method.statementDate ? (
                  <span>
                    {method.statementDate}
                    {getOrdinalSuffix(method.statementDate)}
                    {' '}
                    ({formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), method.statementDate))})
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell>
                {method.type === 'credit' && method.annualFee != null
                  ? formatAmount(method.annualFee)
                  : '-'}
              </TableCell>
              <TableCell>
                {method.type !== 'cash' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(method)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
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

      <PaymentMethodDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        paymentMethod={selectedMethod}
      />
    </div>
  );
}
