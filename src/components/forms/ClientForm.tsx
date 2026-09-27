import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateClient, 
  getListClientsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  industry: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  fiscalYearEnd: z.string().optional(),
  currency: z.string().default("SAR"),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientFormDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createClient = useCreateClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      industry: "",
      taxId: "",
      address: "",
      phone: "",
      email: "",
      fiscalYearEnd: "12-31",
      currency: "SAR",
    },
  });

  function onSubmit(data: ClientFormValues) {
    createClient.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          toast.success("تم إضافة العميل بنجاح / Client added successfully");
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("حدث خطأ أثناء إضافة العميل / Error adding client");
        }
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-add-client">
          <Plus className="ml-2 h-4 w-4" />
          إضافة عميل / Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة عميل جديد / Add New Client</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم (إنجليزي) / Name (English)*</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-name" className="dir-ltr text-left" />
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
                      <Input {...field} data-testid="input-client-name-ar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القطاع / Industry</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-industry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الضريبي / Tax ID</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-taxid" className="font-mono dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني / Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" data-testid="input-client-email" className="dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الهاتف / Phone</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-phone" className="dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fiscalYearEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نهاية السنة المالية / Fiscal Year End</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="MM-DD" data-testid="input-client-fiscal" className="dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة / Currency</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-currency" className="dir-ltr text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان / Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-client-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                إلغاء / Cancel
              </Button>
              <Button type="submit" disabled={createClient.isPending} data-testid="button-submit">
                {createClient.isPending ? "جاري الحفظ..." : "حفظ / Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
