/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PaymentMethod, PaymentMethodFormData, Category } from "@/shared/types";
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
import { useState, useEffect } from "react";

const formSchema = z.object({
  type: z.enum(['credit', 'crypto']),
  name: z.string().min(1, "Name is required"),
  statementDate: z.number().min(1).max(31).nullable(),
  paymentAccount: z.string().optional(),
  annualFee: z.number().min(0).nullable(),
  tickerSymbol: z.string().optional(),
  walletAddress: z.string().optional(),
  rewards: z.array(z.object({
    id: z.number().optional(),
    payment_method_id: z.number(),
    type: z.enum(['points', 'cashback', 'credit']),
    amount: z.number(),
    category_id: z.number(),
    frequency: z.enum(['monthly', 'annual', 'semiannual']).optional()
  })).optional()
});

interface Props {
  open: boolean;
  onClose: () => void;
  paymentMethod?: PaymentMethod | null;
}

export default function PaymentMethodDialog({ open, onClose, paymentMethod }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'credit',
      name: '',
      statementDate: 1,
      paymentAccount: '',
      annualFee: 0,
      tickerSymbol: '',
      walletAddress: '',
      rewards: []
    }
  });

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await window.electron.categories.getAll();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (paymentMethod) {
      form.reset({
        type: paymentMethod.type as 'credit' | 'crypto',
        name: paymentMethod.name,
        statementDate: paymentMethod.statementDate ?? null,
        paymentAccount: paymentMethod.paymentAccount ?? '',
        annualFee: paymentMethod.annualFee ?? null,
        tickerSymbol: paymentMethod.tickerSymbol ?? '',
        walletAddress: paymentMethod.walletAddress ?? '',
        rewards: paymentMethod.rewards ?? []
      });
    } else {
      form.reset({
        type: 'credit',
        name: '',
        statementDate: 1,
        paymentAccount: '',
        annualFee: 0,
        tickerSymbol: '',
        walletAddress: '',
        rewards: []
      });
    }
  }, [paymentMethod, form]);

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      const formattedData = {
        ...data,
        rewards: data.type === 'crypto' ? [] : (data.rewards || []).map(reward => ({
          ...reward,
          payment_method_id: paymentMethod?.id ?? 0,
          frequency: reward.type === 'credit' ? reward.frequency : undefined
        }))
      };

      if (paymentMethod) {
        await window.electron.paymentMethods.update(paymentMethod.id, formattedData);
      } else {
        await window.electron.paymentMethods.create(formattedData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {paymentMethod ? 'Edit' : 'Add'} Payment Method
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
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
                  <FormLabel>{form.watch('type') === 'credit' ? 'Card Name' : 'Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder={form.watch('type') === 'credit' ? 'e.g., Gold Card' : 'e.g., Coinbase'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'crypto' && (
              <>
                <FormField
                  control={form.control}
                  name="tickerSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BTC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {form.watch('type') === 'credit' && (
              <>
                <FormField
                  control={form.control}
                  name="statementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statement Date</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Account</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chase Checking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {form.watch('type') === 'credit' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Rewards</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rewards = form.getValues('rewards') || [];
                      form.setValue('rewards', [
                        ...rewards,
                        {
                          id: undefined,
                          type: 'points',
                          amount: 0,
                          category_id: 2,
                          payment_method_id: paymentMethod?.id ?? 0
                        }
                      ]);
                    }}
                  >
                    Add Reward
                  </Button>
                </div>
                {form.watch('rewards')?.map((reward, index) => (
                  <div
                    key={reward.id ?? `new-${reward.type}-${reward.category_id}-${reward.amount}`}
                    className="relative pr-24"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="points">Points</SelectItem>
                                    <SelectItem value="cashback">Cashback</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={reward.type === 'points' ? 1 : 0.01}
                                  placeholder={reward.type === 'points' ? 'Points (e.g., 4)' : 'Amount'}
                                  {...field}
                                  onChange={e => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(reward.type === 'points' ? Math.round(value) : value);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.category_id`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Select
                                  onValueChange={val => field.onChange(parseInt(val, 10))}
                                  value={field.value?.toString()}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories
                                      .filter(category => category.parent_id !== null)
                                      .map(category => (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id.toString()}
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {reward.type === 'credit' && (
                          <FormField
                            control={form.control}
                            name={`rewards.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem className="w-40">
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="annual">Annual</SelectItem>
                                      <SelectItem value="semiannual">Semi-annual</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-0 -top-[1px] -bottom-[1px]"
                      onClick={() => {
                        const rewards = form.getValues('rewards') || [];
                        form.setValue('rewards', rewards.filter((_, i) => i !== index));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {paymentMethod ? 'Update' : 'Add'} {form.watch('type') === 'credit' ? 'Card' : 'Wallet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
