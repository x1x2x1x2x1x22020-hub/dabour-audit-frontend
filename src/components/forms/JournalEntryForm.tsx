import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateJournalEntry, 
  getListJournalEntriesQueryKey,
  useListClients,
  getListClientsQueryKey,
  useListAccounts,
  getListAccountsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const journalLineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z.string().optional(),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
});

const journalEntrySchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  date: z.string().min(1, "Date is required"),
  reference: z.string().min(1, "Reference is required"),
  description: z.string().optional(),
  lines: z.array(journalLineSchema).min(2, "At least two lines are required"),
}).superRefine((data, ctx) => {
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  
  // Need lines to have values to check balance
  if (totalDebit > 0 || totalCredit > 0) {
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total debit (${totalDebit}) must equal total credit (${totalCredit})`,
        path: ["lines"]
      });
    }
  }
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

export function JournalEntryFormDialog({ defaultClientId }: { defaultClientId?: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createJournalEntry = useCreateJournalEntry();

  const { data: clients } = useListClients({
    query: { queryKey: getListClientsQueryKey() }
  });

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      clientId: defaultClientId ? defaultClientId.toString() : "",
      date: new Date().toISOString().split('T')[0],
      reference: "",
      description: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 }
      ],
    },
  });

  const selectedClientId = form.watch("clientId");
  const parsedClientId = selectedClientId ? parseInt(selectedClientId, 10) : undefined;

  const { data: accounts } = useListAccounts(
    parsedClientId ? { clientId: parsedClientId } : undefined,
    { query: { enabled: !!parsedClientId, queryKey: getListAccountsQueryKey(parsedClientId ? { clientId: parsedClientId } : undefined) } }
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines"
  });

  const watchLines = form.watch("lines");
  const totalDebit = watchLines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = watchLines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && (totalDebit > 0 || totalCredit > 0);

  function onSubmit(data: JournalEntryFormValues) {
    createJournalEntry.mutate(
      { 
        data: {
          clientId: parseInt(data.clientId, 10),
          date: data.date,
          reference: data.reference,
          description: data.description,
          lines: data.lines.map(line => ({
            accountId: parseInt(line.accountId, 10),
            description: line.description,
            debit: line.debit,
            credit: line.credit
          }))
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() });
          toast.success("تم حفظ القيد بنجاح / Journal entry saved successfully");
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("حدث خطأ أثناء حفظ القيد / Error saving journal entry");
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-add-journal">
          <Plus className="ml-2 h-4 w-4" />
          إضافة قيد / New Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة قيد يومية جديد / Add New Journal Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العميل / Client*</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      // Reset lines when client changes since accounts will be different
                      form.setValue("lines", [
                        { accountId: "", description: "", debit: 0, credit: 0 },
                        { accountId: "", description: "", debit: 0, credit: 0 }
                      ]);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-journal-client">
                          <SelectValue placeholder="اختر العميل / Select Client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.nameAr || client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ / Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-journal-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المرجع / Reference*</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-journal-reference" className="dir-ltr text-left font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البيان / Description</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-journal-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 border rounded-md p-4 bg-muted/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">بنود القيد / Entry Lines</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ accountId: "", description: "", debit: 0, credit: 0 })}
                  disabled={!selectedClientId}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة سطر / Add Line
                </Button>
              </div>

              {form.formState.errors.lines?.root && (
                <div className="text-sm text-destructive mb-4 font-medium">
                  {form.formState.errors.lines.root.message}
                </div>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="grid grid-cols-12 gap-2 flex-1">
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.accountId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClientId}>
                                <FormControl>
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="الحساب / Account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts?.map((account) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                      {account.code} - {account.nameAr || account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="البيان / Desc" className="h-9" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.debit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field} 
                                  className="h-9 dir-ltr text-right font-mono text-sm" 
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.credit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field} 
                                  className="h-9 dir-ltr text-right font-mono text-sm" 
                                  placeholder="0.00"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end gap-6 text-sm font-mono font-medium">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">الإجمالي مدين / Total Debit:</span>
                  <span className={isBalanced ? "text-primary" : "text-destructive"}>{totalDebit.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">الإجمالي دائن / Total Credit:</span>
                  <span className={isBalanced ? "text-primary" : "text-destructive"}>{totalCredit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-journal">
                إلغاء / Cancel
              </Button>
              <Button type="submit" disabled={createJournalEntry.isPending || (!isBalanced && (totalDebit > 0 || totalCredit > 0))} data-testid="button-submit-journal">
                {createJournalEntry.isPending ? "جاري الحفظ..." : "حفظ / Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
