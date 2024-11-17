import { useEffect, useState } from 'react';
import { Account } from '@/shared/types';
import { Button } from '@/renderer/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/renderer/components/table';
import AccountDialog from '@/renderer/components/AccountDialog';

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadAccounts = async () => {
    const accts = await window.electron.accounts.getAll();
    setAccounts(accts);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDelete = async (id: number) => {
    await window.electron.accounts.delete(id);
    loadAccounts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Add Account
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.name}</TableCell>
              <TableCell className="capitalize">{account.type}</TableCell>
              <TableCell>${account.balance.toFixed(2)}</TableCell>
              <TableCell>
                {new Date(account.balance_updated).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AccountDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async (data) => {
          await window.electron.accounts.create(data);
          loadAccounts();
        }}
      />
    </div>
  );
}
