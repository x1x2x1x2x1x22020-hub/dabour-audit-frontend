import { useState } from "react";
import { 
  useListClients, 
  getListClientsQueryKey, 
  useGetAuditorReport, 
  getGetAuditorReportQueryKey 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer } from "lucide-react";

export default function Reports() {
  const [selectedClient, setSelectedClient] = useState<string>("");

  const { data: clients, isLoading: clientsLoading } = useListClients({
    query: { queryKey: getListClientsQueryKey() }
  });

  const clientId = selectedClient ? parseInt(selectedClient, 10) : 0;

  const { data: auditorReport, isLoading: reportLoading } = useGetAuditorReport(
    { clientId },
    { query: { enabled: !!clientId, queryKey: getGetAuditorReportQueryKey({ clientId }) } }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-primary">التقارير | Reports</h1>
        <p className="text-muted-foreground">Generate financial reports and audit opinions</p>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border print:hidden flex flex-wrap gap-4 items-end">
        <div className="w-full sm:w-64 space-y-2">
          <label className="text-sm font-medium">العميل / Client</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العميل / Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.nameAr || client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={!selectedClient || reportLoading}
          className="mr-auto"
        >
          <Printer className="ml-2 h-4 w-4" />
          طباعة / Print
        </Button>
      </div>

      {!selectedClient ? (
        <div className="text-center py-20 text-muted-foreground print:hidden">
          يرجى اختيار عميل لعرض التقارير
          <br />
          Please select a client to view reports
        </div>
      ) : (
        <Tabs defaultValue="auditor" className="w-full print:block">
          <TabsList className="print:hidden mb-4">
            <TabsTrigger value="auditor">تقرير المدقق / Auditor's Report</TabsTrigger>
            <TabsTrigger value="trial" disabled>ميزان المراجعة / Trial Balance</TabsTrigger>
            <TabsTrigger value="income" disabled>قائمة الدخل / Income Statement</TabsTrigger>
            <TabsTrigger value="balance" disabled>الميزانية / Balance Sheet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auditor" className="print:block m-0">
            <Card className="print:border-0 print:shadow-none bg-white text-black dark:text-black">
              <CardContent className="p-8 sm:p-12 print:p-0">
                {reportLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full mt-8" />
                  </div>
                ) : auditorReport ? (
                  <div className="space-y-8 font-serif rtl:font-sans">
                    <div className="text-center space-y-2 border-b-2 border-black pb-6">
                      <h2 className="text-2xl font-bold uppercase tracking-widest">تقرير مدقق الحسابات المستقل</h2>
                      <h3 className="text-xl font-bold uppercase text-gray-600">Independent Auditor's Report</h3>
                    </div>

                    <div className="space-y-1 text-lg font-bold">
                      <p>إلى مساهمي / To the Shareholders of:</p>
                      <p>{auditorReport.clientName}</p>
                    </div>

                    <div className="space-y-6 text-justify leading-relaxed">
                      <h4 className="font-bold text-xl mb-2">الرأي / Opinion ({auditorReport.opinion})</h4>
                      <p className="whitespace-pre-wrap">{auditorReport.reportTextAr || auditorReport.reportText}</p>
                      
                      {auditorReport.standards && auditorReport.standards.length > 0 && (
                        <>
                          <h4 className="font-bold text-xl mt-6 mb-2">أساس الرأي / Basis for Opinion</h4>
                          <p>We conducted our audit in accordance with International Standards on Auditing (ISAs). Our responsibilities under those standards are further described in the Auditor's Responsibilities for the Audit of the Financial Statements section of our report. We are independent of the Company in accordance with the International Ethics Standards Board for Accountants' Code of Ethics for Professional Accountants (IESBA Code), and we have fulfilled our other ethical responsibilities in accordance with the IESBA Code.</p>
                          <ul className="list-disc list-inside px-4 mt-2">
                            {auditorReport.standards.map((std, i) => <li key={i}>{std}</li>)}
                          </ul>
                        </>
                      )}
                    </div>

                    <div className="pt-20 grid grid-cols-2 gap-8 items-end border-t border-gray-200 mt-12">
                      <div>
                        <p className="font-bold text-lg mb-8">{auditorReport.auditorName || 'Dabour Audit Firm'}</p>
                        <div className="border-t border-black w-48 mt-12 mb-2"></div>
                        <p className="text-sm">توقيع المدقق / Auditor Signature</p>
                      </div>
                      <div className="text-left" dir="ltr">
                        <p className="font-bold mb-1">Date: {new Date(auditorReport.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="font-bold">Period End: {new Date(auditorReport.periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">تعذر تحميل التقرير / Failed to load report</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
