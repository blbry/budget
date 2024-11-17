/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Income, IncomeFormData } from "@/shared/types";
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
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/renderer/components/tooltip";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['employment', 'other_recurring', 'simple']),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'semimonthly', 'quarterly', 'annually', 'none']).optional(),
  amount: z.number().min(0).optional(),
  pay_date: z.string().optional(),
  next_payment_date: z.string().optional(),
  deductions: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['credit', 'deduction']),
    format: z.enum(['percent', 'amount']),
    value: z.number().min(0),
    frequency: z.enum(['per_paycheck', 'monthly', 'annually'])
  })).optional()
});

interface Props {
  open: boolean;
  onClose: () => void;
  income: Income | null;
  onSubmit: (data: IncomeFormData) => Promise<void>;
}

export default function IncomeDialog({ open, onClose, income, onSubmit }: Props) {
  const form = useForm<IncomeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'simple',
      frequency: 'monthly',
      amount: 0,
      pay_date: new Date().toISOString(),
      next_payment_date: new Date().toISOString(),
      deductions: []
    }
  });

  const incomeType = form.watch('type');

  const handleSubmit = async (data: IncomeFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {income ? 'Edit' : 'Add'} Income Source
          </DialogTitle>
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
                    <Input placeholder="e.g., Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="other_recurring">Other Recurring</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {incomeType !== 'simple' && (
              <>
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Annual Amount
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoCircledIcon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter the total annual amount before taxes and deductions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name="pay_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pay Date</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              const date = new Date(field.value || new Date().toISOString());
                              date.setDate(parseInt(value, 10));
                              field.onChange(date.toISOString());
                            }}
                            value={new Date(field.value || new Date().toISOString()).getDate().toString()}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[200px]">
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              const date = new Date(field.value || new Date().toISOString());
                              date.setMonth(parseInt(value, 10));
                              field.onChange(date.toISOString());
                            }}
                            value={new Date(field.value || new Date().toISOString()).getMonth().toString()}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[200px]">
                              {['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December']
                                .map((month, index) => (
                                  <SelectItem key={month} value={index.toString()}>
                                    {month}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              const date = new Date(field.value || new Date().toISOString());
                              date.setFullYear(parseInt(value, 10));
                              field.onChange(date.toISOString());
                            }}
                            value={new Date(field.value || new Date().toISOString()).getFullYear().toString()}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[200px]">
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deductions Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Deductions & Credits</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const deductions = form.getValues('deductions') || [];
                        form.setValue('deductions', [
                          ...deductions,
                          {
                            name: '',
                            type: 'deduction',
                            format: 'percent',
                            value: 0,
                            frequency: 'per_paycheck'
                          }
                        ]);
                      }}
                    >
                      Add Item
                    </Button>
                  </div>

                  {form.watch('deductions')?.map((deduction, index) => (
                    <div key={`deduction-${index}`} className="relative pr-24">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`deductions.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="w-[180px]">
                                <FormControl>
                                  <Input placeholder="Name" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`deductions.${index}.type`}
                            render={({ field }) => (
                              <FormItem className="w-[120px]">
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="deduction">Deduction</SelectItem>
                                      <SelectItem value="credit">Credit</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`deductions.${index}.format`}
                            render={({ field }) => (
                              <FormItem className="w-[120px]">
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percent">Percent</SelectItem>
                                      <SelectItem value="amount">Amount</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`deductions.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="w-[80px]">
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`deductions.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem className="w-[160px]">
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="per_paycheck">Per Paycheck</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="annually">Annually</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-0 -top-[1px] -bottom-[1px]"
                        onClick={() => {
                          const deductions = form.getValues('deductions') || [];
                          form.setValue(
                            'deductions',
                            deductions.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

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
