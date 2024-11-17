/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const formSchema = z.object({
  amount: z.number().min(0)
});

interface Props {
  open: boolean;
  onClose: () => void;
  currentAmount: number;
  onSubmit: (amount: number) => Promise<void>;
}

export default function MonthlyTotalDialog({ open, onClose, currentAmount, onSubmit }: Props) {
  const form = useForm<{ amount: number }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: currentAmount
    }
  });

  const handleSubmit = async (data: { amount: number }) => {
    try {
      await onSubmit(data.amount);
      onClose();
    } catch (error) {
      console.error('Error updating monthly total:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Monthly Total</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
