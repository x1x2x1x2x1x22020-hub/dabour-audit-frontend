import React, { useState } from "react";
import { X, BookOpen, FileText, CheckCircle, Sparkles, AlertTriangle, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import { Language } from "../translations";

interface ZazaDocument {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  categoryAr: string;
  date: string;
  content: string;
  contentAr: string;
  suggestedRisk: {
    description: string;
    descriptionAr: string;
    assertion: string;
    inherentRisk: "High" | "Medium" | "Low";
    plannedResponse: string;
    plannedResponseAr: string;
  } | null;
}

interface ZazaDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onIncorporateRiskAndProcedure: (risk: any, procedure: any) => void;
}

const SECURE_DOCS_VAULT: ZazaDocument[] = [
  {
    id: "doc1",
    title: "ISA 210 Signed Engagement Letter - FY26.pdf",
    titleAr: "خطاب الارتباط الموقع للتدقيق - معيار ٢١٠.pdf",
    category: "Engagement & Terms",
    categoryAr: "شروط التعاقد والارتباط",
    date: "2026-02-14",
    content: `AUDIT ENGAGEMENT LETTER FOR THE FINANCIAL YEAR ENDED 31-DEC-2026.
CLIENT: Global Tech Solutions PLC
ENGAGEMENT AUDITOR: S. Al-Dabour, FCA

This letter confirms our acceptance and our understanding of this audit engagement to evaluate compliance with International Standards on Auditing (ISA 200 - 800) and issue an independent auditor report on financial statements.
The objectives and scope of our audit are:
1. Express an opinion on the group financial statements.
2. Conduct direct testing of internal financial controls over financial reporting (ICOFR).

Management Responsibilities:
The preparation and fair presentation of the financial statements in accordance with International Financial Reporting Standards (IFRS). Management shall provide unhindered access to all books, accounts, transaction records, and corporate board details.
Fees estimated at standard retail rates. No contingency arrangements permitted as per IESBA Board rules.`,
    contentAr: `خطاب ارتباط تدقيق مالي للسنة المنتهية في ٣١ ديسمبر ٢٠٢٦.
العميل: حلول التكنولوجيا العالمية ب.ل.ك
مدقق الارتباط: ش. الدبور، زميل معهد المحاسبين المعتمدين

يؤكد هذا الكتاب قبولنا وتفاهمنا لارتباط المراجعة هذا لتقييم الالتزام بالمعايير الدولية للمراجعة (ISA 200 - 800) وإصدار تقرير مدقق مستقل عن القوائم المالية.
أهداف ونطاق تدقيقنا هي:
١. إبداء الرأي حول القوائم المالية الموحدة للمجموعة.
٢. إجراء اختبارات مباشرة للرقابة الداخلية المالية على التقارير المالية (ICOFR).

مسؤوليات الإدارة:
إعداد وعرض القوائم المالية بعدالة بما يتوافق مع المعايير الدولية للتقارير المالية (IFRS). تلتزم الإدارة بتقديم وصول غير مقيد لكافة دفاتر المحاسبة والقيود وسجلات المعاملات الشاملة.`,
    suggestedRisk: {
      description: "First-year implementation of group consolidation under IFRS 10 lacks specialized auditing templates, presenting mapping assertion errors.",
      descriptionAr: "مخاطر تعقيد عمليات توحيد القوائم المالية لأول مرة للشركة مما يؤدي لخطأ في تأكيد التقييم والمطابقة وفق المعيار الدولي العاشر IFRS 10.",
      assertion: "Valuation & Allocation (V)",
      inherentRisk: "Medium",
      plannedResponse: "Implement rigorous review of consolidating top-side ledger adjustments and trace client elimination entries.",
      plannedResponseAr: "تنفيذ مراجعة دقيقة ومستقلة لتعديلات توحيد الحسابات العليا ومطابقة قيود الاستبعاد التي يجريها فريق المحاسبة."
    }
  },
  {
    id: "doc2",
    title: "Executive Board Q4 Board Meeting Minutes Summary.docx",
    titleAr: "محضر اجتماع مجلس الإدارة الربع الأخير ٢٠٢٥.docx",
    category: "Governance & Minutes",
    categoryAr: "الحوكمة ومحاضر الاجتماعات",
    date: "2025-11-20",
    content: `EXECUTIVE BOARD MEETING MINUTES - Q4 SUMMARY.
DATE OF MEETING: November 20, 2025.
ATTENDEES: Chief Executive Officer, CFO, Chief Legal Counsel, Lead Non-Executive Directors.

Key discussions:
1. Inventory write-downs: The CFO noted that slow-moving technological inventory lines (specifically licensing codes under storage blocks) totaling approximately $1,800,000 exhibit declining market valuation indexes. Some software versions are superseded by competitor updates.
2. Doha Warehouse Lease Contingency: The legal advisor detailed that terminating our leased Doha Assembly warehouse will cause a contract termination penalty covenant of $50,000 to trigger if done before September 2026.
3. Credit Loss Provisions: Trade receivables collection benchmarks in South America deteriorated from 45 days average to 95 days. No adjustive additions were booked to allowance for doubtful debts.`,
    contentAr: `ملخص محضر اجتماع مجلس الإدارة التنفيذي - الربع الرابع.
تاريخ الاجتماع: ٢٠ نوفمبر ٢٠٢٥.
الحاضرون: الرئيس التنفيذي، المدير المالي، المستشار القانوني الرئيسي، أعضاء مجلس الإدارة المستقلين.

المناقشات الرئيسية:
١. إخفاض قيمة المخزون: أشار المدير المالي إلى أن خطوط المخزون التكنولوجي راكد الحركة بقيمة تبلغ ١,٨٠٠,٠٠٠ دولار تقريباً تعاني من انخفاض مؤشرات التقييم السوقي وتطلب تعديل القيمة الاستردادية.
٢. مجمع مستودعات الدوحة المؤجر: أوضح المستشار القانوني أن إلغاء عقد مستودع الدوحة سيترتب عليه غرامة فسخ عقد مبكر مشروطة بقيمة ٥٠,٠٠٠ دولار.
٣. مخصص خسائر الائتمان المتوقعة: تدهورت معدلات تحصيل الذمم المدينة التجارية لعملاء أمريكا الجنوبية من ٤٥ يوماً كمتوسط إلى ٩٥ يوماً دون تعديل مخصص الديون المشكوك فيها.`,
    suggestedRisk: {
      description: "Slow-moving inventory items ($1.8M) may be overvalued due to obsolete pricing indices, in violation of IAS 2 Inventory valuation rules.",
      descriptionAr: "مخاطر انخفاض القيمة الفعلية للمخزون التكنولوجي الراكد البالغ ١.٨ مليون دولار وعدم كفاية مخصص تخفيض سعر التكلفة وفق المعيار الدولي ٢.",
      assertion: "Valuation & Allocation",
      inherentRisk: "High",
      plannedResponse: "Obtain client net realizable value (NRV) schedule, perform inventory obsolescence testing and trace obsolete batch sales prices.",
      plannedResponseAr: "الحصول على كشف صافي القيمة الممكن تحقيقها (NRV) من العميل، وإجراء اختبارات التقادم وتتبع مبيعات البضائع الراكدة بعد تاريخ الميزانية."
    }
  },
  {
    id: "doc3",
    title: "Commercial Lease Contract Doha Assembly Hub.pdf",
    titleAr: "عقد الإيجار التجاري لمركز تجميع الدوحة.pdf",
    category: "Legal Contracts",
    categoryAr: "العقود القانونية والاتفاقات",
    date: "2024-05-10",
    content: `COMMERCIAL VEHICLE AND PROPERTY LEASE AGREEMENT.
LESSOR: Doha Logistics Development Hub Ltd.
LESSEE: Global Tech Solutions Ltd.

Section 8.4: The lease term is set at 60 months, commencing May 10, 2024. Monthly rental is $12,000 payable in advance on the first business day of each month.
Section 8.9: Financial obligations require the lessee to maintain a Current Ratio (Current Assets divided by Current Liabilities) of at least 1.8x. Failure to meet this covenant for consecutive quarters triggers immediate lease escalation rate (+20%) or acceleration of the remaining lease payments as a current liability.
Section 9.1: Guarantee deposit of $24,000 is fully refundable at expiry, subject to wear-and-tear evaluations.`,
    contentAr: `اتفاقية الإيجار التجاري للممتلكات ومستودعات التجميع.
المؤجر: شركة مجمع الدوحة للتطوير والخدمات اللوجستية المحدودة.
المستأجر: شركة حلول التكنولوجيا العالمية المحدودة.

البند ٨.٤: مدة الإيجار ٦٠ شهراً تبدأ في ١٠ مايو ٢٠٢٤. الإيجار الشهري يبلغ ١٢,٠٠٠ دولار مستحق مسبقاً في أول يوم عمل من كل شهر.
البند ٨.٩: الشروط المالية تلزم المستأجر بالحفاظ على نسبة سيولة جارية (الأصول المتداولة تقسيم الالتزامات المتداولة) لا تقل عن ١.٨ ضعف. يؤدي عدم الوفاء بهذا الشرط لطلب سداد الدفعات المتبقية فوراً كالتزام متداول أو رفع سعر الإيجار بنسبة ٢٠٪.`,
    suggestedRisk: {
      description: "Failure to maintain the 1.8x lease covenant triggers potential Lease Liability classification acceleration under IFRS 16 rules.",
      descriptionAr: "مخاطر تسريع استحقاق التزامات إيجار مستودع الدوحة وتصنيفه كالتزامات متداولة لعدم الوفاء بشرط السيولة الجارية ١.٨ لشركة زازا.",
      assertion: "Classification & Presentation",
      inherentRisk: "Medium",
      plannedResponse: "Verify client Current Ratio compliance metrics, inspect audit calculations, and review lease contract disclosure accuracy.",
      plannedResponseAr: "التحقق من معادلات ومؤشرات نسبة السيولة الجارية لدى العميل ومراجعة إفصاحات التزامات الإيجار المقابلة وفق معيار IFRS 16."
    }
  }
];

export default function ZazaDocsModal({ isOpen, onClose, lang, onIncorporateRiskAndProcedure }: ZazaDocsModalProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("doc1");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDocId, setScannedDocId] = useState<string | null>(null);
  const [incorporatedDocs, setIncorporatedDocs] = useState<{ [docId: string]: boolean }>({});

  if (!isOpen) return null;

  const isRtl = lang === "AR";
  const activeDoc = SECURE_DOCS_VAULT.find(d => d.id === selectedDocId) || SECURE_DOCS_VAULT[0];

  const handleSamiScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedDocId(activeDoc.id);
    }, 1800);
  };

  const handleApplyToAudit = () => {
    if (!activeDoc.suggestedRisk) return;
    
    // Construct RiskItem for client audit program
    const mockRisk = {
      description: isRtl ? activeDoc.suggestedRisk.descriptionAr : activeDoc.suggestedRisk.description,
      assertion: activeDoc.suggestedRisk.assertion,
      inherentRisk: activeDoc.suggestedRisk.inherentRisk,
      plannedResponse: isRtl ? activeDoc.suggestedRisk.plannedResponseAr : activeDoc.suggestedRisk.plannedResponse
    };

    // Construct AuditProcedure item for program
    const mockProcedure = {
      cycleArea: activeDoc.category === "Legal Contracts" ? "Fixed Assets / Leases" : "Inventories & Obsoletes",
      standardRef: activeDoc.id === "doc2" ? "ISA 315 / IAS 2" : "IFRS 16 / ISA 315",
      vouchInstructions: isRtl ? activeDoc.suggestedRisk.plannedResponseAr : activeDoc.suggestedRisk.plannedResponse,
      fsAssertion: activeDoc.suggestedRisk.assertion,
      evidenceObtained: isRtl ? "مستندات تحليل القيمة الممكن تحقيقها وتقرير التقادم" : "Reviewed NRV lists and inventory turnover tracking files.",
      status: "Pending"
    };

    onIncorporateRiskAndProcedure(mockRisk, mockProcedure);

    // Save as incorporated
    setIncorporatedDocs(prev => ({ ...prev, [activeDoc.id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl text-white">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isRtl ? "مستودع ومستندات زازا الذكي لربط الحسابات" : "Zaza Secure Vault & Client Documents Center"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRtl ? "فحص المستندات التجارية والاتفاقيات والمحاضر الموثقة بالذكاء الاصطناعي مع سامي" : "Inspect authentic lease schedules, signed contracts, or minutes directly in Doha and scan with Sami AI."}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1 bg-slate-50">
          
          {/* Docs Left list */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col overflow-y-auto max-h-[450px] lg:max-h-none gap-3">
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider mb-2">
              {isRtl ? "الملفات والمستندات الرقمية" : "Client Shared Electronic Documents"}
            </span>

            {SECURE_DOCS_VAULT.map((doc) => {
              const hasScanResult = scannedDocId === doc.id;
              const isIncorporated = incorporatedDocs[doc.id];

              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                  }}
                  type="button"
                  className={`p-3.5 rounded-2xl border text-left text-xs flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedDocId === doc.id
                      ? "border-orange-500 bg-orange-50/60 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[9px] text-slate-500">
                      {isRtl ? doc.categoryAr : doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{doc.date}</span>
                  </div>
                  
                  <span className="font-bold text-slate-800 mt-1 flex items-center gap-1.5 leading-snug">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{isRtl ? doc.titleAr : doc.title}</span>
                  </span>

                  <div className="flex items-center gap-2 mt-2">
                    {hasScanResult && (
                      <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-red-500" />
                        {isRtl ? "مكتمل الفحص" : "Sami AI Scanned"}
                      </span>
                    )}
                    {isIncorporated && (
                      <span className="text-[9px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.5 rounded">
                        {isRtl ? "مدمج بالتدقيق" : "Mapped to Audit"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Viewer & AI Scanner panel */}
          <div className="lg:col-span-8 p-5 flex flex-col overflow-y-auto max-h-[500px] lg:max-h-none h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-start">
              
              {/* Left Column: Document File reader with elegant margins */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    {isRtl ? "معاينة المستند" : "AUTHENTIC DOCUMENT VIEWER"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isRtl ? "معتمد ومحمي" : "Secured by Zaza"}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-serif text-xs text-slate-700 leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-line select-text border-t-4 border-t-orange-500">
                  <h4 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2 mb-3">
                    {isRtl ? activeDoc.titleAr : activeDoc.title}
                  </h4>
                  {isRtl ? activeDoc.contentAr : activeDoc.content}
                </div>
              </div>

              {/* Right Column: Sami Copilot Scanner */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                  {isRtl ? "فحص وتحليل المخاطر المالي بـ سامي" : "SAMI CO-PILOT AUDIT RISKS EXTRACTION"}
                </span>

                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md min-h-[180px] flex flex-col justify-between">
                  {/* Default State: Unscanned */}
                  {scannedDocId !== activeDoc.id && !isScanning && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <Sparkles className="w-8 h-8 text-orange-400 mb-2 animate-bounce" />
                      <p className="text-xs font-semibold text-slate-300">
                        {isRtl 
                          ? "جاهز للتحليل. اضغط لبدء مراجعة سامي الآلي وتحديد متطلبات المراجعة" 
                          : "Ready for scan. Click below to trigger Sami AI review for audits."}
                      </p>
                      <button
                        onClick={handleSamiScan}
                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isRtl ? "تحليل المستند بـ سامي" : "Analyze and scan with Sami AI"}</span>
                      </button>
                    </div>
                  )}

                  {/* Scanning Animation */}
                  {isScanning && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                      <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
                      <p className="text-xs font-bold text-slate-300">
                        {isRtl ? "جاري قراءة بنود العقد وتحديد شروط المعايير..." : "Reading lease covenants and matching compliance indices..."}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 italic">
                        {isRtl ? "مطابقة شروط معيار ISA 315 و IFRS 16" : "Mapping to ISA 315 / IFRS 16 / IAS 2 Standards..."}
                      </span>
                    </div>
                  )}

                  {/* Scanned Result display */}
                  {scannedDocId === activeDoc.id && !isScanning && activeDoc.suggestedRisk && (
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex items-start gap-2 border-b border-slate-800 pb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-red-400">
                            {isRtl ? "مخاطر تدقيق محتملة محددة" : "Identified Audit Risk Factor"}
                          </span>
                          <p className="text-xs font-bold text-white leading-snug mt-1">
                            {isRtl ? activeDoc.suggestedRisk.descriptionAr : activeDoc.suggestedRisk.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-400 block">{isRtl ? "التنسيب المتبقي" : "Assertion"}</span>
                            <span className="font-mono font-bold text-orange-400">{activeDoc.suggestedRisk.assertion}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">{isRtl ? "درجة الخطر المتأصل" : "Inherent Severity"}</span>
                            <span className="text-red-400 font-bold">{activeDoc.suggestedRisk.inherentRisk}</span>
                          </div>
                        </div>

                        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-750">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            {isRtl ? "إجراء الاستجابة المدعوم" : "Suggested Field Audit Procedure"}
                          </span>
                          <p className="text-[11px] text-slate-200 leading-normal">
                            {isRtl ? activeDoc.suggestedRisk.plannedResponseAr : activeDoc.suggestedRisk.plannedResponse}
                          </p>
                        </div>
                      </div>

                      {/* Apply buttons */}
                      <div className="mt-2 border-t border-slate-800 pt-3">
                        {incorporatedDocs[activeDoc.id] ? (
                          <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 p-2.5 rounded-xl text-center text-[11px] font-bold flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>{isRtl ? "تم إدراج الخطر والإجراء في مصفوفة وعمليات التدقيق!" : "Incorporate complete! Mapped under risks & procedures"}</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleApplyToAudit}
                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isRtl ? "إدراج وتضمين هذا الخطر لبرنامج العمل" : "Feed Directly to Risk & Substantive Program"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-755 text-xs text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isRtl ? "إغلاق المستعرض" : "Close Document Cabinet"}
          </button>
        </div>
      </div>
    </div>
  );
}
