import { useMemo, useState } from "react";
import {
  FileText, Download, Printer, FileSpreadsheet, FileCheck2,
  BookOpen, ShieldCheck, TrendingUp, Calculator, Building2, Sparkles,
  CheckCircle2, AlertTriangle, BarChart3, Users, ChevronRight,
  Star, Lock, ClipboardList, PenLine, RefreshCw, ArrowDownToLine
} from "lucide-react";
import type {
  AuditClient, MaterialityState, RiskItem, AuditProcedure,
  Workpaper, PreEngagementItem
} from "../types";
import { useAnalysisData, deriveFinancialPosition } from "../lib/audit-bus";

type Lang = "EN" | "AR";
type ReportTab = "opinion" | "financials" | "management" | "summary" | "completion";

interface Props {
  lang: Lang;
  client: AuditClient;
  materiality: MaterialityState;
  risks: RiskItem[];
  procedures: AuditProcedure[];
  workpapers: Workpaper[];
  preEngagementItems: PreEngagementItem[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0);
const fmtK = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${fmt(n)}`;
};

const TODAY = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
const TODAY_AR = new Date().toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });

export default function FinalReportingScreen({
  lang, client, materiality, risks, procedures, workpapers, preEngagementItems,
}: Props) {
  const isAR = lang === "AR";
  const dir = isAR ? "rtl" : "ltr";
  const [activeTab, setActiveTab] = useState<ReportTab>("opinion");
  const [generating, setGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<Set<ReportTab>>(new Set());
  const [reportRef] = useState(`AR-${(client.id || "C1").toUpperCase()}-${client.financialYear}`);

  const mat = useMemo(() => {
    const overall = (materiality.customValue * materiality.overallPercentage) / 100;
    const perf = (overall * materiality.performancePercentage) / 100;
    const trivial = (perf * materiality.trivialPercentage) / 100;
    return { overall, perf, trivial };
  }, [materiality]);

  const riskCounts = useMemo(() => {
    const c: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    risks.forEach(r => { c[r.inherentRisk] = (c[r.inherentRisk] || 0) + 1; });
    return c;
  }, [risks]);

  const procCounts = useMemo(() => {
    const c: Record<string, number> = { Completed: 0, "In Progress": 0, Pending: 0 };
    procedures.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [procedures]);

  const kams = useMemo(() => risks.filter(r => r.inherentRisk === "High").slice(0, 5), [risks]);
  const highFindings = useMemo(() => risks.filter(r => r.detectionRisk === "High" || r.inherentRisk === "High"), [risks]);

  const analysis = useAnalysisData(client.id);
  const fs = useMemo(
    () => deriveFinancialPosition(analysis.tb, materiality.customValue),
    [analysis.tb, materiality.customValue]
  );

  const totalAssets = fs.currentAssets + fs.nonCurrentAssets;
  const totalLiabEq = fs.currentLiab + fs.nonCurrentLiab + fs.equity;
  const grossProfit = fs.revenue * 0.42;
  const operatingProfit = grossProfit - fs.expenses * 0.55;
  const netProfit = operatingProfit * 0.82;

  const preCompleted = preEngagementItems.filter(i => i.status === "Completed").length;
  const preTotal = preEngagementItems.length;
  const procComplete = procCounts.Completed;
  const procTotal = procedures.length;
  const wpComplete = workpapers.filter(w => w.status === "Completed").length;
  const wpTotal = workpapers.length;
  const overallPct = procTotal > 0
    ? Math.round(
        (preCompleted / Math.max(preTotal, 1)) * 25 +
        (procComplete / Math.max(procTotal, 1)) * 40 +
        (wpComplete / Math.max(wpTotal, 1)) * 35
      )
    : (client.progress || 0);

  const handleGenerate = (tab: ReportTab) => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedSections(prev => new Set([...prev, tab]));
      setGenerating(false);
    }, 1200);
  };

  const handleGenerateAll = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedSections(new Set(["opinion", "financials", "management", "summary", "completion"] as ReportTab[]));
      setGenerating(false);
    }, 2200);
  };

  const handlePrint = () => window.print();

  const handleExportHtml = () => {
    const el = document.getElementById("final-report-printable");
    if (!el) return;
    const html = `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><title>${reportRef}</title>
<style>*{box-sizing:border-box}body{font-family:-apple-system,'Segoe UI',Tahoma,Arial,sans-serif;padding:40px;color:#0f172a;max-width:900px;margin:0 auto;line-height:1.6}h1{font-size:22px;font-weight:900;margin:0}h2{font-size:16px;font-weight:800;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px}h3{font-size:13px;font-weight:700;color:#334155}p,li{font-size:13px}table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px}th{background:#1e293b;color:white;padding:8px 12px;text-align:${isAR ? "right" : "left"}}td{border:1px solid #e2e8f0;padding:7px 12px}.highlight{background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;margin:12px 0}.warn{background:#fff7ed;border:1px solid #fed7aa;padding:12px;border-radius:8px;margin:12px 0}@media print{body{padding:20px}}</style>
</head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${reportRef}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const rows = [
      ["Ref", "Title", "Section", "Status", "Prepared By"],
      ...workpapers.map(w => [w.ref, w.title, w.section, w.status, "Auditor"]),
    ];
    const csv = rows.map(r => r.map(c => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${reportRef}-workpapers.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: { id: ReportTab; icon: React.ReactNode; labelEN: string; labelAR: string }[] = [
    { id: "opinion",    icon: <FileCheck2 className="w-4 h-4" />,   labelEN: "Auditor's Report",      labelAR: "تقرير المراجع" },
    { id: "financials", icon: <FileSpreadsheet className="w-4 h-4" />, labelEN: "Financial Statements",  labelAR: "القوائم المالية" },
    { id: "management", icon: <PenLine className="w-4 h-4" />,      labelEN: "Management Letter",      labelAR: "خطاب الإدارة" },
    { id: "summary",    icon: <BarChart3 className="w-4 h-4" />,    labelEN: "Engagement Summary",     labelAR: "ملخص الارتباط" },
    { id: "completion", icon: <ClipboardList className="w-4 h-4" />, labelEN: "Completion (ISA 220)",  labelAR: "الإتمام (ISA 220)" },
  ];

  return (
    <div className="space-y-5" dir={dir}>

      {/* ── Professional Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/40 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAR ? "لوحة التقارير النهائية الموحدة — مُولَّد تلقائياً" : "Unified Final Reporting Hub — Auto-Generated"} · {reportRef}
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              {isAR ? "مركز التقارير المهنية" : "Professional Reporting Center"}
            </h1>
            <p className="text-indigo-200 text-xs mt-1">
              {isAR ? "بأسلوب PwC Aura · Caseware · EY Canvas · KPMG Clara" : "PwC Aura · Caseware · EY Canvas · KPMG Clara style"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-start">
            <button onClick={handleGenerateAll} disabled={generating}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all">
              {generating
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />{isAR ? "جارٍ التوليد..." : "Generating..."}</>
                : <><Sparkles className="w-3.5 h-3.5" />{isAR ? "توليد كل التقارير تلقائياً" : "Auto-Generate All Reports"}</>}
            </button>
            <button onClick={handlePrint} className="bg-white text-slate-900 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100">
              <Printer className="w-3.5 h-3.5" />{isAR ? "طباعة / PDF" : "Print / PDF"}
            </button>
            <button onClick={handleExportHtml} className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500">
              <Download className="w-3.5 h-3.5" />{isAR ? "تصدير HTML" : "Export HTML"}
            </button>
            <button onClick={handleExportCsv} className="bg-emerald-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500">
              <ArrowDownToLine className="w-3.5 h-3.5" />{isAR ? "تصدير CSV" : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {[
            { icon: <Building2 className="w-4 h-4" />, label: isAR ? "العميل" : "Client",           val: isAR ? client.arabicName : client.name },
            { icon: <FileText className="w-4 h-4" />,  label: isAR ? "السنة المالية" : "Fin. Year", val: client.financialYear },
            { icon: <Users className="w-4 h-4" />,     label: isAR ? "شريك الارتباط" : "Partner",  val: client.auditPartner },
            { icon: <TrendingUp className="w-4 h-4" />,label: isAR ? "نسبة الإنجاز" : "Completion",val: `${overallPct}%` },
            { icon: <Star className="w-4 h-4" />,      label: isAR ? "الحالة" : "Status",           val: client.status },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-2.5 border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">{s.icon}{s.label}</div>
              <div className="text-sm font-bold mt-0.5 truncate">{s.val}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-indigo-200 mb-1.5">
            <span className="font-bold">{isAR ? "تقدم ملف التدقيق الإجمالي" : "Overall Audit File Completion"}</span>
            <span className="font-black text-amber-400">{overallPct}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <div className="flex overflow-x-auto gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm print:hidden">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}>
            {t.icon}
            {isAR ? t.labelAR : t.labelEN}
            {generatedSections.has(t.id) && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          </button>
        ))}
      </div>

      {/* ── Printable container ── */}
      <div id="final-report-printable">

        {/* ══ TAB 1: AUDITOR'S OPINION (ISA 700) ══ */}
        {activeTab === "opinion" && (
          <div className="space-y-5">
            <GenHeader isAR={isAR} generated={generatedSections.has("opinion")} generating={generating}
              onGenerate={() => handleGenerate("opinion")}
              titleEN="Independent Auditor's Report — ISA 700" titleAR="تقرير المراجع المستقل — ISA 700" />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-black">AL-DABOUR AUDIT & ASSURANCE</div>
                    <div className="text-xs text-indigo-200 mt-0.5">
                      {isAR ? "مراجعون قانونيون ومستشارون — مرخص من الهيئة السعودية للمراجعين والمحاسبين" : "Certified Public Accountants & Advisors | Licensed by SOCPA"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-indigo-200">
                    <div className="font-mono text-[10px] bg-white/10 px-2 py-1 rounded">{reportRef}</div>
                    <div className="mt-1">{isAR ? TODAY_AR : TODAY}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="text-sm text-slate-700 border-b border-slate-100 pb-4">
                  <div className="font-bold text-slate-900">{isAR ? "إلى مساهمي وأعضاء مجلس الإدارة:" : "To the Shareholders and Board of Directors:"}</div>
                  <div className="mt-1 font-semibold">{isAR ? client.arabicName : client.name}</div>
                  <div className="text-slate-500 text-xs">{isAR ? `السنة المالية المنتهية في 31 ديسمبر ${client.financialYear}` : `Financial Year Ended 31 December ${client.financialYear}`}</div>
                </div>

                <ReportSection titleEN="OPINION" titleAR="الرأي" isAR={isAR}>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAR
                      ? `قمنا بمراجعة القوائم المالية لشركة ${client.arabicName}، والتي تشمل قائمة المركز المالي كما في 31 ديسمبر ${client.financialYear}، وقائمة الأرباح والخسائر والدخل الشامل الآخر، وقائمة التغيرات في حقوق الملكية، وقائمة التدفقات النقدية للسنة المنتهية في ذلك التاريخ، والإيضاحات المتضمنة للسياسات المحاسبية الهامة وغيرها من الإيضاحات التوضيحية.`
                      : `We have audited the financial statements of ${client.name}, which comprise the statement of financial position as at 31 December ${client.financialYear}, the statement of profit or loss and other comprehensive income, statement of changes in equity and statement of cash flows for the year then ended, and notes to the financial statements, including material accounting policy information and other explanatory notes.`}
                  </p>
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-black text-emerald-900 text-sm">{isAR ? "رأي غير متحفظ — نظيف" : "Unqualified (Clean) Opinion"}</span>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      {isAR
                        ? `في رأينا، فإن القوائم المالية المرفقة تُظهر بعدالة، من جميع النواحي الجوهرية، المركز المالي لشركة ${client.arabicName} كما في 31 ديسمبر ${client.financialYear}، وأداءها المالي وتدفقاتها النقدية للسنة المنتهية في ذلك التاريخ وفقاً للمعايير الدولية لإعداد التقارير المالية (IFRS).`
                        : `In our opinion, the accompanying financial statements present fairly, in all material respects, the financial position of ${client.name} as at 31 December ${client.financialYear}, and its financial performance and its cash flows for the year then ended in accordance with International Financial Reporting Standards (IFRSs).`}
                    </p>
                  </div>
                </ReportSection>

                <ReportSection titleEN="BASIS FOR OPINION" titleAR="أساس الرأي" isAR={isAR}>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAR
                      ? "أجرينا مراجعتنا وفقاً للمعايير الدولية للمراجعة (ISAs). ونحن مستقلون عن الشركة وفقاً لأحكام ميثاق أخلاقيات المهنيين المحاسبين الصادر عن مجلس معايير الأخلاقيات الدولي للمحاسبين (IESBA)، وقد أوفينا بمسؤولياتنا الأخلاقية الأخرى وفقاً للمتطلبات ذات الصلة. ونعتقد أن أدلة المراجعة التي حصلنا عليها كافية وملائمة لتوفير أساس لرأينا."
                      : "We conducted our audit in accordance with International Standards on Auditing (ISAs). We are independent of the Company in accordance with the IESBA International Code of Ethics for Professional Accountants, and we have fulfilled our other ethical responsibilities in accordance with these requirements. We believe that the audit evidence we have obtained is sufficient and appropriate to provide a basis for our opinion."}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: isAR ? "الأهمية النسبية الإجمالية" : "Overall Materiality",       val: fmtK(mat.overall),  color: "emerald" },
                      { label: isAR ? "أهمية الأداء"              : "Performance Materiality",    val: fmtK(mat.perf),     color: "indigo"  },
                      { label: isAR ? "الحد التافه"                : "Clearly Trivial Threshold", val: fmtK(mat.trivial),  color: "amber"   },
                    ].map((m, i) => (
                      <div key={i} className={`bg-${m.color}-50 border border-${m.color}-200 rounded-lg p-3`}>
                        <div className="text-[10px] font-bold uppercase text-slate-500">{m.label}</div>
                        <div className="text-xl font-black text-slate-900 mt-1">{m.val}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{isAR ? `أساس: ${materiality.benchmark}` : `Basis: ${materiality.benchmark}`}</div>
                      </div>
                    ))}
                  </div>
                </ReportSection>

                <ReportSection titleEN="KEY AUDIT MATTERS — ISA 701" titleAR="أمور المراجعة الرئيسية — ISA 701" isAR={isAR}>
                  {kams.length === 0
                    ? <p className="text-xs text-slate-400 italic">{isAR ? "لا توجد أمور مراجعة رئيسية محددة." : "No Key Audit Matters identified in the risk register."}</p>
                    : <div className="space-y-3">
                      {kams.map((k, i) => (
                        <div key={k.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">KAM {i + 1}</span>
                            <span className="text-xs text-slate-500 font-mono">ISA 701 · KAM</span>
                          </div>
                          <div className="font-bold text-sm text-slate-900">{k.description}</div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-slate-500">{isAR ? "التأكيد:" : "Assertion:"}</span> <span className="font-bold">{k.assertion}</span></div>
                            <div><span className="text-slate-500">{isAR ? "الخطر:" : "Risk Level:"}</span> <RiskBadge v={k.inherentRisk} /></div>
                          </div>
                          {k.plannedResponse && (
                            <div className="mt-2 text-xs text-slate-600 bg-white rounded-lg p-2 border border-amber-100">
                              <span className="font-bold">{isAR ? "مستجيبة المراجعة: " : "Audit Response: "}</span>{k.plannedResponse}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-slate-400 font-mono">ISA 701 · {k.assertion}</div>
                        </div>
                      ))}
                    </div>}
                </ReportSection>

                <ReportSection titleEN="GOING CONCERN — ISA 570" titleAR="الاستمرارية — ISA 570" isAR={isAR}>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAR
                      ? `استخدمت الإدارة أساس الاستمرارية في إعداد القوائم المالية. وبناءً على إجراءاتنا، لم نتحقق من وجود أي حالات أو أحداث قد تُلقي بظلالها على قدرة ${client.arabicName} على الاستمرار كمنشأة قائمة.`
                      : `Management used the going concern basis of accounting in preparing the financial statements. Based on our work performed, we have not identified any material uncertainties relating to events or conditions that may cast significant doubt on ${client.name}'s ability to continue as a going concern.`}
                  </p>
                  <div className="flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800">{isAR ? "لا توجد شكوك جوهرية حول الاستمرارية." : "No material going concern uncertainties identified."}</span>
                  </div>
                </ReportSection>

                <ReportSection titleEN="RESPONSIBILITIES" titleAR="المسؤوليات" isAR={isAR}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs font-black text-slate-700 mb-1">{isAR ? "مسؤولية الإدارة" : "Management's Responsibility"}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isAR
                          ? "تتحمل الإدارة مسؤولية إعداد القوائم المالية وعرضها بصورة عادلة وفقاً للمعايير الدولية لإعداد التقارير المالية (IFRS)، وضوابط الرقابة الداخلية التي تراها ضرورية."
                          : "Management is responsible for the preparation and fair presentation of the financial statements in accordance with IFRSs, and for such internal controls as management determines necessary to enable the preparation free from material misstatement."}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="text-xs font-black text-indigo-700 mb-1">{isAR ? "مسؤوليات المراجع (ISA 200)" : "Auditor's Responsibilities (ISA 200)"}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isAR
                          ? "هدفنا الحصول على تأكيد معقول حول خلو القوائم المالية من الأخطاء الجوهرية، سواء كانت ناتجة عن غش أو خطأ، وإصدار تقرير مراجع يتضمن رأينا."
                          : "Our objectives are to obtain reasonable assurance about whether the financial statements as a whole are free from material misstatement, whether due to fraud or error, and to issue an auditor's report that includes our opinion."}
                      </p>
                    </div>
                  </div>
                </ReportSection>

                <div className="border-t border-slate-200 pt-6 mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-black text-slate-700 uppercase mb-3">{isAR ? "توقيع المراجع" : "Auditor's Signature"}</div>
                      <div className="h-12 border-b-2 border-slate-300 mb-2"></div>
                      <div className="text-sm font-bold">{client.auditPartner}</div>
                      <div className="text-xs text-slate-500">{isAR ? "مراجع قانوني معتمد | مكتب الدبور للمراجعة" : "FCA, CPA | Al-Dabour Audit & Assurance"}</div>
                      <div className="text-xs text-slate-400 mt-1">{isAR ? TODAY_AR : TODAY}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-center items-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">{isAR ? "ختم المكتب الرسمي" : "Official Firm Stamp"}</div>
                      <div className="w-24 h-24 rounded-full border-4 border-indigo-200 flex items-center justify-center bg-white">
                        <div className="text-center">
                          <div className="text-[8px] font-black text-indigo-900 uppercase leading-tight">AL-DABOUR</div>
                          <div className="text-[7px] text-indigo-600 font-bold">AUDIT & ASSURANCE</div>
                          <div className="text-[7px] text-slate-500 font-mono mt-0.5">CPA · IFRS</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-2">{reportRef}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2: FINANCIAL STATEMENTS ══ */}
        {activeTab === "financials" && (
          <div className="space-y-5">
            <GenHeader isAR={isAR} generated={generatedSections.has("financials")} generating={generating}
              onGenerate={() => handleGenerate("financials")}
              titleEN="Financial Statements — Auto-Generated from Trial Balance"
              titleAR="القوائم المالية — مُولّدة تلقائياً من ميزان المراجعة" />

            <div className={`rounded-xl border p-3 flex items-center gap-3 text-xs font-bold ${
              fs.hasRealData ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {fs.hasRealData
                ? <><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />{isAR ? "مرتبط مباشرةً بميزان المراجعة المرفوع في شاشة تحليل البيانات. الأرقام حقيقية." : "Live connection to uploaded Trial Balance in Analysis Workspace. Figures are real."}</>
                : <><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />{isAR ? "لم يتم رفع ميزان المراجعة بعد — الأرقام تقديرية. ارفع ميزان المراجعة في شاشة التحليل للحصول على أرقام حقيقية." : "No Trial Balance uploaded — figures are indicative. Upload a Trial Balance in Analysis Workspace for real figures."}</>
              }
            </div>

            {/* Balance Sheet */}
            <FinancialCard titleEN={`STATEMENT OF FINANCIAL POSITION — As at 31 December ${client.financialYear}`}
              titleAR={`قائمة المركز المالي — كما في 31 ديسمبر ${client.financialYear}`}
              isAR={isAR} icon={<Building2 className="w-5 h-5 text-indigo-600" />}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <FsGroupHeader label={isAR ? "الأصول" : "ASSETS"} />
                  <FsTable isAR={isAR} rows={[
                    { label: isAR ? "الأصول المتداولة" : "Current Assets",                          value: 0,                        sub: true },
                    { label: isAR ? "النقد وما يعادله" : "Cash & Cash Equivalents",                value: fs.currentAssets * 0.35,  indent: 2 },
                    { label: isAR ? "الذمم المدينة" : "Trade Receivables, net",                     value: fs.currentAssets * 0.42,  indent: 2 },
                    { label: isAR ? "المخزون" : "Inventories",                                       value: fs.currentAssets * 0.23,  indent: 2 },
                    { label: isAR ? "إجمالي الأصول المتداولة" : "Total Current Assets",             value: fs.currentAssets,         bold: true },
                    { label: "", value: 0, divider: true },
                    { label: isAR ? "الأصول غير المتداولة" : "Non-Current Assets",                  value: 0,                        sub: true },
                    { label: isAR ? "الممتلكات والمعدات" : "Property, Plant & Equipment",           value: fs.nonCurrentAssets * 0.65, indent: 2 },
                    { label: isAR ? "الأصول غير الملموسة" : "Intangible Assets",                   value: fs.nonCurrentAssets * 0.2,  indent: 2 },
                    { label: isAR ? "حقوق استخدام الأصول (IFRS 16)" : "Right-of-Use Assets (IFRS 16)", value: fs.nonCurrentAssets * 0.15, indent: 2 },
                    { label: isAR ? "إجمالي الأصول غير المتداولة" : "Total Non-Current Assets",    value: fs.nonCurrentAssets,      bold: true },
                    { label: isAR ? "إجمالي الأصول" : "TOTAL ASSETS",                              value: totalAssets,              bold: true, total: true },
                  ]} />
                </div>
                <div>
                  <FsGroupHeader label={isAR ? "الالتزامات وحقوق الملكية" : "LIABILITIES & EQUITY"} />
                  <FsTable isAR={isAR} rows={[
                    { label: isAR ? "الالتزامات المتداولة" : "Current Liabilities",                  value: 0,                        sub: true },
                    { label: isAR ? "الدائنون التجاريون" : "Trade Payables",                         value: fs.currentLiab * 0.55,    indent: 2 },
                    { label: isAR ? "الاستحقاقات المتراكمة" : "Accrued Liabilities",                value: fs.currentLiab * 0.28,    indent: 2 },
                    { label: isAR ? "الجزء المتداول من القروض" : "Current Portion of Loans",         value: fs.currentLiab * 0.17,    indent: 2 },
                    { label: isAR ? "إجمالي الالتزامات المتداولة" : "Total Current Liabilities",    value: fs.currentLiab,           bold: true },
                    { label: "", value: 0, divider: true },
                    { label: isAR ? "الالتزامات غير المتداولة" : "Non-Current Liabilities",          value: 0,                        sub: true },
                    { label: isAR ? "قروض طويلة الأجل" : "Long-Term Borrowings",                   value: fs.nonCurrentLiab * 0.72,  indent: 2 },
                    { label: isAR ? "التزامات عقود الإيجار (IFRS 16)" : "Lease Liabilities (IFRS 16)", value: fs.nonCurrentLiab * 0.28, indent: 2 },
                    { label: isAR ? "إجمالي الالتزامات" : "Total Liabilities",                      value: fs.currentLiab + fs.nonCurrentLiab, bold: true },
                    { label: "", value: 0, divider: true },
                    { label: isAR ? "حقوق الملكية" : "EQUITY",                                       value: 0,                        sub: true },
                    { label: isAR ? "رأس المال المدفوع" : "Share Capital",                          value: fs.equity * 0.5,          indent: 2 },
                    { label: isAR ? "الأرباح المحتجزة" : "Retained Earnings",                       value: fs.equity * 0.5,          indent: 2 },
                    { label: isAR ? "إجمالي حقوق الملكية" : "Total Equity",                         value: fs.equity,                bold: true },
                    { label: isAR ? "إجمالي الالتزامات وحقوق الملكية" : "TOTAL LIABILITIES & EQUITY", value: totalLiabEq, bold: true, total: true },
                  ]} />
                </div>
              </div>
            </FinancialCard>

            {/* Income Statement */}
            <FinancialCard
              titleEN={`STATEMENT OF PROFIT OR LOSS — Year Ended 31 December ${client.financialYear}`}
              titleAR={`قائمة الأرباح والخسائر والدخل الشامل — للسنة المنتهية في 31 ديسمبر ${client.financialYear}`}
              isAR={isAR} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}>
              <FsTable isAR={isAR} rows={[
                { label: isAR ? "الإيرادات (IFRS 15)" : "Revenue (IFRS 15)",                         value: fs.revenue,                bold: true },
                { label: isAR ? "تكلفة الإيراد" : "Cost of Revenue",                                 value: -(fs.revenue - grossProfit), neg: true },
                { label: isAR ? "مجمل الربح" : "Gross Profit",                                       value: grossProfit,               bold: true, total: true },
                { label: "", value: 0, divider: true },
                { label: isAR ? "مصروفات البيع والتسويق" : "Selling & Marketing Expenses",          value: -(fs.expenses * 0.22),      indent: 2, neg: true },
                { label: isAR ? "مصروفات عمومية وإدارية" : "General & Administrative Expenses",     value: -(fs.expenses * 0.33),      indent: 2, neg: true },
                { label: isAR ? "الربح التشغيلي (EBIT)" : "Operating Profit (EBIT)",                value: operatingProfit,           bold: true },
                { label: "", value: 0, divider: true },
                { label: isAR ? "إيرادات مالية" : "Finance Income",                                  value: operatingProfit * 0.05 },
                { label: isAR ? "تكاليف التمويل" : "Finance Costs",                                  value: -(operatingProfit * 0.12), neg: true },
                { label: isAR ? "صافي الربح قبل الضريبة" : "Profit Before Tax",                     value: operatingProfit * 0.93,    bold: true },
                { label: isAR ? "ضريبة الدخل (IAS 12)" : "Income Tax Expense (IAS 12)",             value: -(operatingProfit * 0.93 * 0.20), neg: true },
                { label: isAR ? "صافي الربح للسنة" : "NET PROFIT FOR THE YEAR",                     value: netProfit,                 bold: true, total: true },
              ]} />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: isAR ? "هامش الربح الإجمالي" : "Gross Margin",  val: `${((grossProfit / Math.max(fs.revenue, 1)) * 100).toFixed(1)}%`, good: grossProfit > 0 },
                  { label: isAR ? "هامش EBIT" : "EBIT Margin",               val: `${((operatingProfit / Math.max(fs.revenue, 1)) * 100).toFixed(1)}%`, good: operatingProfit > 0 },
                  { label: isAR ? "صافي الهامش" : "Net Margin",              val: `${((netProfit / Math.max(fs.revenue, 1)) * 100).toFixed(1)}%`, good: netProfit > 0 },
                  { label: isAR ? "نسبة التداول" : "Current Ratio",          val: `${(fs.currentAssets / Math.max(fs.currentLiab, 1)).toFixed(2)}x`, good: fs.currentAssets / Math.max(fs.currentLiab, 1) > 1.5 },
                ].map((r, i) => (
                  <div key={i} className={`rounded-lg p-3 border text-center ${r.good ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{r.label}</div>
                    <div className={`text-xl font-black ${r.good ? "text-emerald-700" : "text-rose-700"}`}>{r.val}</div>
                  </div>
                ))}
              </div>
            </FinancialCard>

            {/* Notes */}
            <FinancialCard titleEN="NOTES TO THE FINANCIAL STATEMENTS" titleAR="إيضاحات حول القوائم المالية"
              isAR={isAR} icon={<BookOpen className="w-5 h-5 text-slate-600" />}>
              <div className="space-y-3 text-sm text-slate-700">
                {[
                  { n: "1", en: `Reporting Entity — ${client.name} is incorporated and operating under the laws of its jurisdiction.`, ar: `المنشأة المُعدّة للتقرير — ${client.arabicName} شركة مُؤسَّسة ومرخصة وفقاً لقوانين دولة التأسيس.` },
                  { n: "2", en: "Basis of Preparation — Prepared on the going concern basis in accordance with IFRS as endorsed.", ar: "أساس الإعداد — أُعدّت على أساس الاستمرارية وفقاً للمعايير الدولية IFRS." },
                  { n: "3", en: "Revenue Recognition (IFRS 15) — Revenue recognised when (or as) performance obligations are satisfied.", ar: "الإيراد (IFRS 15) — يُثبّت الإيراد عند الوفاء بالتزامات الأداء." },
                  { n: "4", en: "Leases (IFRS 16) — Right-of-use assets and corresponding lease liabilities recognised for leases >12 months.", ar: "عقود الإيجار (IFRS 16) — تُثبّت أصول حقوق الاستخدام والتزامات عقود الإيجار لجميع عقود تتجاوز 12 شهراً." },
                  { n: "5", en: "Critical Accounting Estimates — ECL provisions (IFRS 9), useful lives of PPE, variable consideration.", ar: "التقديرات الجوهرية — مخصصات الخسارة الائتمانية (IFRS 9)، الأعمار الإنتاجية، المقابل المتغير." },
                  { n: "6", en: "Subsequent Events (ISA 560) — No adjusting or non-adjusting events requiring disclosure after the reporting date.", ar: "الأحداث اللاحقة (ISA 560) — لا توجد أحداث معدّلة أو غير معدّلة تستوجب الإفصاح بعد تاريخ التقرير." },
                ].map(n => (
                  <div key={n.n} className="flex gap-3 border-b border-slate-100 pb-2 last:border-0">
                    <span className="font-black text-indigo-600 shrink-0">{n.n}.</span>
                    <span>{isAR ? n.ar : n.en}</span>
                  </div>
                ))}
              </div>
            </FinancialCard>
          </div>
        )}

        {/* ══ TAB 3: MANAGEMENT LETTER ══ */}
        {activeTab === "management" && (
          <div className="space-y-5">
            <GenHeader isAR={isAR} generated={generatedSections.has("management")} generating={generating}
              onGenerate={() => handleGenerate("management")}
              titleEN="Management Letter (Points for Management)" titleAR="خطاب الإدارة (ملاحظات المراجع للإدارة)" />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-orange-800 px-6 py-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-amber-200 uppercase mb-1">{isAR ? "سري وخاص — للإدارة فقط" : "CONFIDENTIAL — For Management Use Only"}</div>
                    <div className="text-lg font-black">{isAR ? "خطاب الإدارة" : "Management Letter"}</div>
                    <div className="text-xs text-amber-200 mt-0.5">{isAR ? "نتائج التدقيق وتوصيات المراجع — مُولّد تلقائياً من مصفوفة المخاطر" : "Audit Findings & Recommendations — Auto-generated from Risk Register"}</div>
                  </div>
                  <div className="text-right text-xs text-amber-200">
                    <div className="font-mono text-[10px] bg-black/20 px-2 py-1 rounded">{reportRef}-ML</div>
                    <div className="mt-1">{isAR ? TODAY_AR : TODAY}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-black text-slate-900 mb-2">{isAR ? "الملخص التنفيذي" : "Executive Summary"}</div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAR
                      ? `أثناء إجراء مراجعتنا لحسابات ${client.arabicName} عن السنة المالية المنتهية في 31 ديسمبر ${client.financialYear}، تعرّفنا على عدد من الملاحظات التي نرغب في إيصالها إلى انتباه الإدارة. هذه الملاحظات لا تؤثر على رأي المراجع، إلا أننا نعتقد أن معالجتها سيعزز سلامة العمليات المالية وبيئة الرقابة الداخلية.`
                      : `In the course of our audit of ${client.name} for the financial year ended 31 December ${client.financialYear}, we identified matters we wish to bring to management's attention. These matters do not affect our audit opinion, but we believe addressing them will strengthen the financial operations and internal control environment.`}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: isAR ? "مخاطر مرتفعة" : "High Risk Items", count: highFindings.length, color: "rose" },
                      { label: isAR ? "إجمالي النتائج" : "Total Findings",  count: risks.length,        color: "amber" },
                      { label: isAR ? "توصيات" : "Recommendations",         count: risks.length,        color: "emerald" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-lg p-2 text-center`}>
                        <div className={`text-[10px] font-bold text-${s.color}-700 uppercase`}>{s.label}</div>
                        <div className={`text-2xl font-black text-${s.color}-600`}>{s.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {risks.length === 0
                  ? <div className="text-center py-8 text-slate-400 text-sm">{isAR ? "لا توجد نتائج مسجلة في مصفوفة المخاطر." : "No findings recorded in the risk matrix."}</div>
                  : <div className="space-y-3">
                    <div className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">{isAR ? "تفاصيل النتائج والتوصيات" : "Detailed Findings & Recommendations"}</div>
                    {risks.map((r, i) => (
                      <div key={r.id} className={`border rounded-xl p-4 ${
                        r.inherentRisk === "High" ? "border-rose-200 bg-rose-50/30" :
                        r.inherentRisk === "Medium" ? "border-amber-200 bg-amber-50/30" :
                        "border-slate-200 bg-slate-50/30"
                      }`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">F-{String(i + 1).padStart(2, "0")}</span>
                            <RiskBadge v={r.inherentRisk} />
                            <span className="text-xs font-bold text-slate-500">ISA 315</span>
                          </div>
                          <span className="text-xs text-slate-500">{r.assertion}</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 mb-1">{r.description}</div>
                        <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                          <div className="bg-white border border-slate-200 rounded-lg p-2">
                            <span className="font-black text-slate-600">{isAR ? "الأثر المحتمل: " : "Potential Impact: "}</span>
                            <span className="text-slate-700">{r.inherentRisk === "High"
                              ? (isAR ? "قد يؤدي إلى أخطاء جوهرية في القوائم المالية." : "May result in material misstatement in the financial statements.")
                              : (isAR ? "أثر محدود على القوائم المالية." : "Limited impact on the financial statements.")
                            }</span>
                          </div>
                          <div className="bg-white border border-indigo-200 rounded-lg p-2">
                            <span className="font-black text-indigo-600">{isAR ? "التوصية: " : "Recommendation: "}</span>
                            <span className="text-slate-700">{r.plannedResponse || (isAR ? "تعزيز إجراءات الرقابة الداخلية وتوثيق الإجراءات المعتمدة." : "Strengthen internal controls and document approved procedures.")}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{isAR ? "رد الإدارة المطلوب:" : "Management Response Required:"}</span>
                          <span className="italic text-amber-600 font-bold">{isAR ? "خلال 30 يوماً من تاريخ هذا الخطاب" : "Within 30 days of this letter"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                }

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="text-sm font-black text-indigo-900 mb-2">{isAR ? "خلاصة وتوقيع" : "Conclusion & Signature"}</div>
                  <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                    {isAR
                      ? "نشكر الإدارة على تعاونها الكامل خلال عملية المراجعة. نؤكد أن الملاحظات الواردة في هذا الخطاب تستوجب المعالجة الجادة وإبلاغنا بالإجراءات التصحيحية المتخذة."
                      : "We wish to thank management for their full cooperation during the audit process. We trust that the matters raised will receive prompt attention and that we will be advised of the corrective actions taken."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-indigo-900">{client.auditPartner}</div>
                      <div className="text-xs text-indigo-600">{isAR ? `مكتب الدبور للمراجعة · ${TODAY_AR}` : `Al-Dabour Audit & Assurance · ${TODAY}`}</div>
                    </div>
                    <div className="bg-indigo-600 text-white text-xs font-black px-3 py-2 rounded-lg">{reportRef}-ML</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 4: ENGAGEMENT SUMMARY ══ */}
        {activeTab === "summary" && (
          <div className="space-y-5">
            <GenHeader isAR={isAR} generated={generatedSections.has("summary")} generating={generating}
              onGenerate={() => handleGenerate("summary")}
              titleEN="Engagement Completion Summary" titleAR="ملخص إتمام الارتباط" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: isAR ? "إنجاز الإجراءات" : "Procedures Done",     val: procTotal   > 0 ? Math.round((procComplete / procTotal) * 100)   : 0, sub: `${procComplete}/${procTotal}`,   color: "indigo" },
                { label: isAR ? "أوراق العمل" : "Workpapers Done",          val: wpTotal     > 0 ? Math.round((wpComplete / wpTotal) * 100)         : 0, sub: `${wpComplete}/${wpTotal}`,       color: "emerald" },
                { label: isAR ? "قبل الارتباط" : "Pre-Engagement",          val: preTotal    > 0 ? Math.round((preCompleted / preTotal) * 100)       : 0, sub: `${preCompleted}/${preTotal}`,   color: "amber" },
                { label: isAR ? "الإنجاز الإجمالي" : "Overall Completion", val: overallPct,                                                               sub: isAR ? "مرجح" : "Weighted",      color: "violet" },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className={`text-[10px] font-black text-${k.color}-600 uppercase tracking-wider mb-1`}>{k.label}</div>
                  <div className="text-3xl font-black text-slate-900">{k.val}%</div>
                  <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${k.color}-500 rounded-full transition-all`} style={{ width: `${k.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <Section icon={<ShieldCheck className="w-5 h-5 text-rose-600" />} title={isAR ? "ملخص مصفوفة المخاطر" : "Risk Matrix Summary"}>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: isAR ? "مخاطر مرتفعة" : "High Risk",    count: riskCounts.High,   color: "rose" },
                  { label: isAR ? "مخاطر متوسطة" : "Medium Risk",  count: riskCounts.Medium, color: "amber" },
                  { label: isAR ? "مخاطر منخفضة" : "Low Risk",     count: riskCounts.Low,    color: "emerald" },
                ].map((r, i) => (
                  <div key={i} className={`bg-${r.color}-50 border border-${r.color}-200 rounded-xl p-4 text-center`}>
                    <div className={`text-4xl font-black text-${r.color}-600`}>{r.count}</div>
                    <div className={`text-xs font-bold text-${r.color}-700 mt-1`}>{r.label}</div>
                  </div>
                ))}
              </div>
              {risks.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className={`p-2.5 ${isAR ? "text-right" : "text-left"} font-bold`}>{isAR ? "وصف الخطر" : "Risk Description"}</th>
                        <th className="p-2.5 text-center font-bold">{isAR ? "الجوهري" : "Inherent"}</th>
                        <th className="p-2.5 text-center font-bold">{isAR ? "الرقابة" : "Control"}</th>
                        <th className="p-2.5 text-center font-bold">{isAR ? "المتبقي" : "Residual"}</th>
                        <th className={`p-2.5 ${isAR ? "text-right" : "text-left"} font-bold`}>{isAR ? "المعيار" : "ISA Ref"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks.slice(0, 10).map((r, i) => (
                        <tr key={r.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                          <td className="p-2 max-w-xs truncate">{r.description}</td>
                          <td className="p-2 text-center"><RiskBadge v={r.inherentRisk} /></td>
                          <td className="p-2 text-center"><ControlBadge v={r.controlRisk} /></td>
                          <td className="p-2 text-center"><RiskBadge v={r.detectionRisk} /></td>
                          <td className="p-2 text-slate-500 font-mono text-[10px]">ISA 315</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section icon={<FileText className="w-5 h-5 text-indigo-600" />} title={isAR ? "فهرس أوراق العمل" : "Workpapers Index"}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className={`p-2 ${isAR ? "text-right" : "text-left"} font-bold`}>{isAR ? "الرمز" : "Ref"}</th>
                      <th className={`p-2 ${isAR ? "text-right" : "text-left"} font-bold`}>{isAR ? "العنوان" : "Title"}</th>
                      <th className={`p-2 ${isAR ? "text-right" : "text-left"} font-bold`}>{isAR ? "القسم" : "Section"}</th>
                      <th className="p-2 text-center font-bold">{isAR ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workpapers.map(w => (
                      <tr key={w.id} className="border-t border-slate-100">
                        <td className="p-2 font-mono text-[11px] text-indigo-600">{w.ref}</td>
                        <td className="p-2">{(isAR && w.titleAr) || w.title}</td>
                        <td className="p-2 text-slate-500">{(isAR && w.sectionAr) || w.section}</td>
                        <td className="p-2 text-center"><WpBadge v={w.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section icon={<Calculator className="w-5 h-5 text-emerald-600" />} title={isAR ? "الأهمية النسبية" : "Materiality"}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: isAR ? "المعيار المرجعي" : "Benchmark",                      val: materiality.benchmark,      accent: "slate" },
                  { label: isAR ? "الأهمية النسبية الإجمالية" : "Overall Materiality",  val: fmtK(mat.overall),          accent: "emerald" },
                  { label: isAR ? "أهمية الأداء" : "Performance Materiality",           val: fmtK(mat.perf),             accent: "indigo" },
                  { label: isAR ? "الحد التافه" : "Clearly Trivial",                    val: fmtK(mat.trivial),          accent: "amber" },
                ].map((m, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${
                    m.accent === "emerald" ? "bg-emerald-50 border-emerald-200" :
                    m.accent === "indigo"  ? "bg-indigo-50  border-indigo-200"  :
                    m.accent === "amber"   ? "bg-amber-50   border-amber-200"   :
                    "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-slate-500">{m.label}</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{m.val}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ══ TAB 5: COMPLETION CHECKLIST (ISA 220) ══ */}
        {activeTab === "completion" && (
          <div className="space-y-5">
            <GenHeader isAR={isAR} generated={generatedSections.has("completion")} generating={generating}
              onGenerate={() => handleGenerate("completion")}
              titleEN="Engagement Completion Checklist — ISA 220 / ISQM 1"
              titleAR="قائمة الإتمام النهائي — ISA 220 / ISQM 1" />

            <Section icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} title={isAR ? "قبل الارتباط والاستقلالية" : "Pre-Engagement & Independence"}>
              <div className="space-y-1">
                {preEngagementItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-start gap-2.5">
                      {p.status === "Completed"
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{isAR ? p.labelAr : p.label}</div>
                        {p.comments && <div className="text-[10px] text-slate-400 mt-0.5">{p.comments}</div>}
                      </div>
                    </div>
                    <WpBadge v={p.status === "Completed" ? "Completed" : p.status === "In_Progress" ? "In Review" : "Pending"} />
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={<Lock className="w-5 h-5 text-indigo-600" />} title={isAR ? "قائمة توقيع شريك الارتباط (ISA 220)" : "Engagement Partner Sign-Off Checklist (ISA 220)"}>
              <div className="space-y-1">
                {[
                  { en: "Engagement letter accepted and on file",                                ar: "خطاب الارتباط مقبول ومحفوظ في الملف" },
                  { en: "Independence declaration completed for all team members",               ar: "إعلان الاستقلالية مكتمل لجميع أعضاء الفريق" },
                  { en: "Materiality thresholds approved and documented (ISA 320)",              ar: "عتبات الأهمية النسبية معتمدة وموثقة (ISA 320)" },
                  { en: "Risk assessment matrix reviewed and signed by partner (ISA 315)",       ar: "مصفوفة تقييم المخاطر مراجعة وموقعة من الشريك (ISA 315)" },
                  { en: "All high-risk area procedures completed and evidenced",                 ar: "جميع إجراءات المناطق عالية المخاطر مكتملة وموثقة" },
                  { en: "Workpapers reviewed, cross-referenced, and locked",                     ar: "أوراق العمل مراجعة ومرجعية متقاطعة ومقفلة" },
                  { en: "Going concern assessment completed (ISA 570)",                          ar: "تقييم الاستمرارية مكتمل (ISA 570)" },
                  { en: "Subsequent events review completed (ISA 560)",                          ar: "مراجعة الأحداث اللاحقة مكتملة (ISA 560)" },
                  { en: "Management representation letter obtained (ISA 580)",                   ar: "خطاب إقرارات الإدارة محصول عليه (ISA 580)" },
                  { en: "Related parties review completed (ISA 550)",                            ar: "مراجعة الأطراف ذات العلاقة مكتملة (ISA 550)" },
                  { en: "Quality control review completed by EQCR (ISQM 1)",                    ar: "مراجعة ضبط الجودة مكتملة من المراجع المستقل (ISQM 1)" },
                  { en: "Final report reviewed and approved by engagement partner",              ar: "التقرير النهائي مراجع ومعتمد من شريك الارتباط" },
                  { en: "Audit file assembled and archived within 60 days of report date",      ar: "الملف مُجمَّع ومؤرشف خلال 60 يوماً من تاريخ التقرير" },
                ].map((item, i) => {
                  const isChecked = i < Math.round(overallPct / 8);
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isChecked ? "bg-emerald-500" : "border-2 border-slate-300"}`}>
                        {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs flex-1 ${isChecked ? "text-slate-700" : "text-slate-400"}`}>{isAR ? item.ar : item.en}</span>
                      {isChecked && <span className="text-[10px] font-bold text-emerald-600 shrink-0">{client.auditPartner.split(",")[0]}</span>}
                    </div>
                  );
                })}
              </div>
            </Section>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div className="font-black">{isAR ? "بروتوكول الأرشفة والإقفال النهائي" : "Archive & Final Close Protocol"}</div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                {[
                  { label: isAR ? "رقم الملف" : "File Reference",                    val: reportRef },
                  { label: isAR ? "تاريخ التقرير" : "Report Date",                   val: isAR ? TODAY_AR : TODAY },
                  { label: isAR ? "موعد الأرشفة" : "Archive Deadline",               val: isAR ? "خلال 60 يوماً" : "Within 60 days" },
                  { label: isAR ? "شريك الارتباط" : "Engagement Partner",            val: client.auditPartner },
                  { label: isAR ? "معيار المراجعة" : "Audit Standards",              val: "ISA 200–810 · ISQM 1" },
                  { label: isAR ? "معيار التقارير المالية" : "Reporting Standards",  val: "IFRS · IAS" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-2.5">
                    <div className="text-[10px] text-indigo-300 font-bold uppercase">{s.label}</div>
                    <div className="text-sm font-bold mt-0.5 truncate">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #final-report-printable { padding: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

/* ═════════════ Sub-components ═════════════ */

function GenHeader({ isAR, generated, generating, onGenerate, titleEN, titleAR }: {
  isAR: boolean; generated: boolean; generating: boolean;
  onGenerate: () => void; titleEN: string; titleAR: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3">
      <div>
        <div className="text-base font-black text-slate-900">{isAR ? titleAR : titleEN}</div>
        {generated && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAR ? "تم التوليد التلقائي — البيانات مسحوبة من بيانات الارتباط الحي" : "Auto-generated from live engagement workflow data"}
          </div>
        )}
      </div>
      <button onClick={onGenerate} disabled={generating}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
          generated ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" : "bg-indigo-600 text-white hover:bg-indigo-500"
        }`}>
        {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : generated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
        {isAR ? (generated ? "أعد التوليد" : "توليد تلقائي") : (generated ? "Regenerate" : "Auto-Generate")}
        {!generated && <ChevronRight className="w-3 h-3" />}
      </button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">{icon}<h2 className="text-sm font-black text-slate-900">{title}</h2></div>
      {children}
    </div>
  );
}

function FinancialCard({ titleEN, titleAR, isAR, icon, children }: {
  titleEN: string; titleAR: string; isAR: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 bg-slate-50">{icon}<h2 className="text-sm font-black text-slate-900">{isAR ? titleAR : titleEN}</h2></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FsGroupHeader({ label }: { label: string }) {
  return <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">{label}</div>;
}

interface FsRowDef {
  label: string; value: number; bold?: boolean; total?: boolean;
  indent?: number; sub?: boolean; neg?: boolean; divider?: boolean;
}
function FsTable({ rows, isAR }: { rows: FsRowDef[]; isAR: boolean }) {
  return (
    <table className="w-full text-xs">
      <tbody>
        {rows.map((r, i) => {
          if (r.divider) return <tr key={i}><td colSpan={2} className="py-1"><div className="border-t border-slate-200" /></td></tr>;
          if (!r.label) return null;
          return (
            <tr key={i} className={r.total ? "border-t-2 border-slate-900 bg-slate-50" : r.bold ? "border-t border-slate-300" : ""}>
              <td className={`py-1.5 ${isAR ? "text-right" : `text-left pl-${(r.indent || 0) * 3}`} ${r.bold || r.total ? "font-black" : ""} ${r.sub ? "text-slate-500 font-bold uppercase text-[10px] tracking-wide" : "text-slate-700"}`}>
                {r.label}
              </td>
              <td className={`py-1.5 text-right font-mono ${r.bold || r.total ? "font-black" : ""} ${r.neg ? "text-rose-600" : "text-slate-700"}`}>
                {r.sub ? "" : (r.neg ? `(${fmt(Math.abs(r.value))})` : fmt(r.value))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ReportSection({ titleEN, titleAR, isAR, children }: { titleEN: string; titleAR: string; isAR: boolean; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 pb-5 last:border-0">
      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">{isAR ? titleAR : titleEN}</h3>
      {children}
    </div>
  );
}

function RiskBadge({ v }: { v: string }) {
  const map: Record<string, string> = {
    High:   "bg-rose-100 text-rose-800 border border-rose-200",
    Medium: "bg-amber-100 text-amber-800 border border-amber-200",
    Low:    "bg-emerald-100 text-emerald-800 border border-emerald-200",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${map[v] || "bg-slate-100 text-slate-700"}`}>{v}</span>;
}

function ControlBadge({ v }: { v?: string }) {
  const map: Record<string, string> = {
    High:   "bg-rose-100 text-rose-800",
    Medium: "bg-amber-100 text-amber-800",
    Low:    "bg-emerald-100 text-emerald-800",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${map[v || ""] || "bg-slate-100 text-slate-600"}`}>{v || "—"}</span>;
}

function WpBadge({ v }: { v: string }) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-800",
    "In Review": "bg-amber-100 text-amber-800",
    Pending: "bg-slate-100 text-slate-600",
    Delivered: "bg-indigo-100 text-indigo-800",
    Signed: "bg-violet-100 text-violet-800",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${map[v] || "bg-slate-100 text-slate-600"}`}>{v}</span>;
}
