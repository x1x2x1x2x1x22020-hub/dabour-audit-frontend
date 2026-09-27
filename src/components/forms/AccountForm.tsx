import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateAccount, 
  getListAccountsQueryKey,
  useListClients,
  getListClientsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const accountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  clientId: z.string().min(1, "Client is required"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountFormDialog({ defaultClientId }: { defaultClientId?: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createAccount = useCreateAccount();

  const { data: clients } = useListClients({
    query: { queryKey: getListClientsQueryKey() }
  });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name: "",
      nameAr: "",
      type: "asset",
      clientId: defaultClientId ? defaultClientId.toString() : "",
    },
  });

  function onSubmit(data: AccountFormValues) {
    createAccount.mutate(
      { 
        data: {
          ...data,
          clientId: parseInt(data.clientId, 10)
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
          toast.success("تم إضافة الحساب بنجاح / Account added successfully");
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("حدث خطأ أثناء إضافة الحساب / Error adding account");
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-add-account">
          <Plus className="ml-2 h-4 w-4" />
          إضافة حساب / Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة حساب جديد / Add New Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العميل / Client*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-account-client">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الحساب / Account Code*</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-code" className="font-mono dir-ltr text-left" />
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
                    <FormLabel>نوع الحساب / Account Type*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue placeholder="اختر النوع / Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asset">أصول / Asset</SelectItem>
                        <SelectItem value="liability">خصوم / Liability</SelectItem>
                        <SelectItem value="equity">حقوق ملكية / Equity</SelectItem>
                        <SelectItem value="revenue">إيرادات / Revenue</SelectItem>
                        <SelectItem value="expense">مصروفات / Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم (إنجليزي) / Name (English)*</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-name" className="dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم (عربي) / Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-name-ar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-account">
                إلغاء / Cancel
              </Button>
              <Button type="submit" disabled={createAccount.isPending} data-testid="button-submit-account">
                {createAccount.isPending ? "جاري الحفظ..." : "حفظ / Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
