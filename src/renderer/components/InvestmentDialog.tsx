/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Investment, InvestmentFormData } from "@/shared/types";
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
  name: z.string().min(1, "Name is required"),
  ticker: z.string().min(1, "Ticker symbol is required"),
  value: z.number().min(0, "Value must be positive"),
});

interface Props {
  open: boolean;
  onClose: () => void;
  investment?: Investment;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
}

export default function InvestmentDialog({ open, onClose, investment, onSubmit }: Props) {
  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ticker: '',
      value: 0,
    }
  });

  useEffect(() => {
    if (investment) {
      form.reset({
        name: investment.name,
        ticker: investment.ticker,
        value: investment.value,
      });
    } else {
      form.reset({
        name: '',
        ticker: '',
        value: 0,
      });
    }
  }, [investment, form]);

  const handleSubmit = async (data: InvestmentFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{investment ? 'Edit' : 'Add'} Investment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., AAPL"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
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
