/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AccountFormData } from "@/shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/form";
import { Input } from "@/renderer/components/input";
import { Button } from "@/renderer/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/select";
import { Alert, AlertDescription } from "@/renderer/components/alert";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['crypto', 'bank']),
  wallet_addr: z.string().optional(),
  balance: z.number().min(0).optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => Promise<void>;
}

export default function AccountDialog({ open, onClose, onSubmit }: Props) {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      balance: 0,
    }
  });

  const handleSubmit = async (data: AccountFormData) => {
    try {
      const formattedData = {
        ...data,
        balance: data.type === 'crypto' ? undefined : data.balance
      };
      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="crypto">Crypto Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={form.watch('type') === 'bank' ? 'e.g., Chase Checking' : 'e.g., Hardware Wallet'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'crypto' && (
              <>
                <FormField
                  control={form.control}
                  name="wallet_addr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert>
                  <AlertDescription>
                    We currently only support Bitcoin wallets.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {form.watch('type') === 'bank' && (
              <>
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert>
                  <AlertDescription>
                    This value will be automatically updated, but you should always verify with your bank statement.
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Account</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
