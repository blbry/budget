/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle, VehicleFormData } from "@/shared/types";
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
import { Textarea } from "@/renderer/components/textarea";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ownership_type: z.enum(['own', 'lease', 'loan']),
  value: z.number().min(0).optional(),
  payment_date: z.number().min(1).max(31).optional(),
  remaining_payments: z.number().min(0).optional(),
  payment_amount: z.number().min(0).optional(),
  description: z.string().optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  onSubmit: (data: VehicleFormData) => Promise<void>;
}

export default function VehicleDialog({ open, onClose, vehicle, onSubmit }: Props) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ownership_type: 'own',
      value: 0,
      payment_date: 1,
      remaining_payments: 0,
      payment_amount: 0,
      description: '',
    }
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        name: vehicle.name,
        ownership_type: vehicle.ownership_type,
        value: vehicle.value || 0,
        payment_date: vehicle.payment_date || 1,
        remaining_payments: vehicle.remaining_payments || 0,
        payment_amount: vehicle.payment_amount || 0,
        description: vehicle.description || '',
      });
    } else {
      form.reset({
        name: '',
        ownership_type: 'own',
        value: 0,
        payment_date: 1,
        remaining_payments: 0,
        payment_amount: 0,
        description: '',
      });
    }
  }, [vehicle, form]);

  const ownershipType = form.watch('ownership_type');
  const needsPaymentInfo = ownershipType === 'lease' || ownershipType === 'loan';

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      const formattedData = {
        ...data,
        value: needsPaymentInfo || ownershipType === 'own' ? data.value : undefined,
        payment_date: needsPaymentInfo ? data.payment_date : undefined,
        remaining_payments: needsPaymentInfo ? data.remaining_payments : undefined,
        payment_amount: needsPaymentInfo ? data.payment_amount : undefined,
      };
      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit' : 'Add'} Vehicle</DialogTitle>
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
                    <Input placeholder="e.g., 2020 Toyota Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownership_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ownership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">Own</SelectItem>
                        <SelectItem value="lease">Lease</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(needsPaymentInfo || ownershipType === 'own') && (
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
            )}

            {needsPaymentInfo && (
              <>
                <FormField
                  control={form.control}
                  name="payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remaining_payments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remaining Payments</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
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
              </>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details..."
                      {...field}
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
              <Button type="submit">{vehicle ? 'Update' : 'Add'} Vehicle</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

