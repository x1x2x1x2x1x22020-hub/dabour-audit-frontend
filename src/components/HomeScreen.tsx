import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Plus,
  Search,
  Briefcase,
  AlertOctagon,
  Users,
  Calendar,
  TrendingUp,
  Calculator,
  ChevronRight,
  Download,
  Loader2,

  UserPlus,
  Folder,
  Lock,
  Unlock,
  Settings,
  Globe,
  BookOpen,
  Upload,
  X,
  CheckCircle2,
  FileText,
  Percent,
  TrendingDown,
  Shield,
  Trash2,
  Edit2,
  RefreshCw,
  ArrowUpDown,
  MessageSquare,
  Send,
  ChevronDown,
  Check,
  BarChart3,
  Paperclip,
  ListChecks,
  Phone,
  Save,
  CheckSquare,
  Square,
  FolderOpen,
  Filter as FilterIcon,
  FileCheck2,
  Link2 as LinkIcon,
  ClipboardCheck,
  ClipboardList,
  AlertTriangle,
  Info,
  MinusCircle,
} from "lucide-react";
import { Language, translations } from "../translations";
import {
  AuditClient,
  AMLSearchResult,
  MaterialityState,
  RiskItem,
  PreEngagementItem,
  TeamMember,
  TimelineMilestone,
  Workpaper,
  AuditProcedure
} from "../types";
import SamiAICopilot from "./SamiAICopilot";
import ConnectLedgerModal from "./ConnectLedgerModal";
import ZazaDocsModal from "./ZazaDocsModal";
import SamiCopilotModal from "./SamiCopilotModal";
import AnalysisWorkspace from "./AnalysisWorkspace";
import ProceduresLibraryModal from "./ProceduresLibraryModal";
import {
  useAnalysisData,
  useGeneratedFS,
  computeAutoMateriality,
  computeAutoRisks,
  refreshAutoFindings,
  useFindings,
  saveFindings,
  ANALYSIS_EVENT,
  FS_EVENT,
  AUTO_RISK_PREFIX,
  clearClientData,
  type AutoMaterialityResult,
} from "../lib/audit-bus";
import IdeaHaloToolsModal from "./IdeaHaloToolsModal";
import FinalReportingScreen from "./FinalReportingScreen";

// Define initial demo clients
const INITIAL_CLIENTS: AuditClient[] = [
  {
    id: "c1",
    name: "Global Tech Solutions FY26",
    arabicName: "حلول التكنولوجيا العالمية ٢٠٢٦",
    industry: "Tech & Software Solutions",
    financialYear: "2026",
    auditPartner: "Sami Al-Dabour, FCA",
    status: "Planning",
    progress: 45,
    openFindings: 3,
  },
  {
    id: "c2",
    name: "Zaza Manufacturing Corp",
    arabicName: "مؤسسة زازا للصناعات العالمية",
    industry: "Heavy Manufacturing",
    financialYear: "2026",
    auditPartner: "Mubarak Al-Harthy",
    status: "Risk Assessment",
    progress: 30,
    openFindings: 2,
  },
  {
    id: "c3",
    name: "Dabour Retail & Logistics",
    arabicName: "دابور للتجزئة والخدمات اللوجستية",
    industry: "Retail & E-Commerce",
    financialYear: "2026",
    auditPartner: "Sami Al-Dabour, FCA",
    status: "Substantive Testing",
    progress: 75,
    openFindings: 8,
  },
  {
    id: "c4",
    name: "Ali for Import",
    arabicName: "شركة علي للاستيراد والتصدير",
    industry: "Consumer Goods & Sea Logistics",
    financialYear: "2026",
    auditPartner: "Sami Al-Dabour, FCA",
    status: "Planning",
    progress: 15,
    openFindings: 0,
  },
];

// Initial pre-engagement checklists (ISA 210, 220, ISQM 1)
const INITIAL_PRE_ENG_CHECKLIST: PreEngagementItem[] = [
  {
    id: "pe1",
    section: "ISA 210",
    label: "Verify signed Audit Engagement Letter matches scope and terms of audit",
    labelAr: "التحقق من خطاب الارتباط الموقع للتدقيق ومطابقته للنطاق والشروط",
    status: "Completed",
    comments: "Signed copy stored in Zaza Docs. Full compliance assured.",
    signee: "SD",
  },
  {
    id: "pe2",
    section: "ISA 220",
    label: "Engagement Partner review of appropriate skill-mix & specialist requirements",
    labelAr: "مراجعة شريك الارتباط لتوافق المهارات والاحتياجات التخصصية للفريق",
    status: "Completed",
    comments: "Sami AI Copilot integrated for substantive documentation support.",
    signee: "SD",
  },
  {
    id: "pe3",
    section: "ISQM 1",
    label: "Confirm firm ethical codes, policy awareness, and partner rotation compliance",
    labelAr: "تأكيد توافق شروط الأخلاقيات المهنية وتناوب الشركاء",
    status: "Completed",
    comments: "Partner has been on engagement for 3 years (limit is 7 years).",
    signee: "MH",
  },
  {
    id: "pe4",
    section: "Independence",
    label: "Assess professional independence: verify team has zero direct financial interest",
    labelAr: "تقييم الاستقلالية المهنية: التأكد من عدم وجود مصالح مالية مباشرة لأعضاء الفريق",
    status: "In_Progress",
    comments: "Checking questionnaires returned by associate auditees.",
    signee: "Pending",
  },
  {
    id: "pe5",
    section: "ISA 210",
    label: "Confirm fee estimates, schedules, and billing conditions were verified and approved",
    labelAr: "تأكيد تقديرات الأتعاب، والجدول الزمني، وظروف الفوترة وشروطها مع العميل",
    status: "Completed",
    comments: "Agreements signed off by the managing director.",
    signee: "SD",
  },
  {
    id: "pe6",
    section: "Independence",
    label: "Obtain and scrub Ultimate Beneficial Owner (UBO) identity records against PEP & Sanctions databases",
    labelAr: "التحقق من سجل الملاك المستفيدين النهائيين في قواعد الحظر السياسي والدولي لغسيل الأموال",
    status: "Completed",
    comments: "Run against AML watchlists. Clean dashboard report saved.",
    signee: "MH",
  },
  {
    id: "pe7",
    section: "ISQM 1",
    label: "Execute conflict checking protocols across global network repositories and alliance networks",
    labelAr: "تشغيل بروتوكول فحص تضارب المصالح عبر جميع المكاتب والشبكة العالمية ومواقع الحلفاء",
    status: "Completed",
    comments: "No conflicts of interest flagged or found with current executive board.",
    signee: "SD",
  },
  {
    id: "pe8",
    section: "ISA 220",
    label: "Evaluate client integrity: perform negative media screening and review regulatory dispute histories",
    labelAr: "تقييم نزاهة العميل: الفحص الإخباري السلبي ومراجعة سجل النزاعات التنظيمية والقانونية",
    status: "In_Progress",
    comments: "Screening online registries and past court records. So far green.",
    signee: "SD",
  },
  {
    id: "pe9",
    section: "ISA 210",
    label: "Evaluate entity reporting compliance: review opening balances and communicate with prior auditors",
    labelAr: "تقييم توافق التقارير المالية للشركة الملتزم بها: مراجعة الأرصدة الافتتاحية والاتصال بالمدقق السابق",
    status: "Completed",
    comments: "Previous auditor provided clearance without highlighting any critical concerns.",
    signee: "MH",
  },
  {
    id: "pe10",
    section: "ISQM 1",
    label: "Approve and assign an independent Engagement Quality Control Reviewer (EQCR) for high-risk flags",
    labelAr: "تعيين مراجع مستقل لمراقبة جودة الارتباط (EQCR) في حالة وجود مؤشرات مرتفعة المخاطر",
    status: "In_Progress",
    comments: "Assigned independent director as the quality reviewer for draft reports.",
    signee: "Pending",
  },
  {
    id: "pe11",
    section: "ISA 220",
    label: "Ensure professional indemnity insurance constraints and practice licensing cover the current engagement",
    labelAr: "التأكد من أن حدود التأمين ضد الأخوة المهنية وتراخيص المزاولة السارية تغطي هذا الارتباط",
    status: "Completed",
    comments: "Indemnity cover validates within standard local authority regulations.",
    signee: "SD",
  },
  {
    id: "pe12",
    section: "ISQM 1",
    label: "Verify secure IT infrastructure and access permissions are configured for the client's data repositories",
    labelAr: "التحقق من تهيئة بيئة تقنية المعلومات الآمنة وصلاحيات الدخول لقواعد بيانات العميل",
    status: "Completed",
    comments: "Secure tunnel and dual-factor authentication keys successfully set up.",
    signee: "MH",
  }
];

// Initial materiality assessment defaults
const INITIAL_MATERIALITY: MaterialityState = {
  benchmark: "Revenue",
  customValue: 12500000,
  overallPercentage: 1.0, // 1% of revenue
  performancePercentage: 75.0, // 75% of overall materiality
  trivialPercentage: 5.0, // 5% of performance materiality
};

// Initial Risks Assessment Registry
const INITIAL_RISKS: RiskItem[] = [
  {
    id: "r1",
    description: "Revenue recognized without formal customer delivery milestones confirmation (IFRS 15)",
    assertion: "Occurrence & Cut-Off",
    likelihood: 4,
    impact: 5,
    inherentRisk: "High",
    controlRisk: "Medium",
    detectionRisk: "Low",
    plannedResponse: "Run double confirmation on year-end logistics ledgers; test circularization on high values.",
    controlDescription: "Daily automated sales reconciliations to warehouse outward gates log are performed but not formally reviewed by management.",
    assignedAuditors: ["Jinan Kabbani, ACCA", "Sami AI Copilot"],
    trend: "up",
    comments: [
      { id: "rc1", author: "Sami AI Copilot", timestamp: "2026-05-21 14:30", text: "Unusual concentration of sales in the last 5 days of the financial year detected. Please prioritize cut-off testing of logistics notes." },
      { id: "rc2", author: "Jinan Kabbani, ACCA", timestamp: "2026-05-21 16:15", text: "Requested outward dispatch logs from the terminal coordinator. Under review." }
    ]
  },
  {
    id: "r2",
    description: "Capitalization of IT research expenditures as intangible hardware resources",
    assertion: "Valuation & Measurement",
    likelihood: 3,
    impact: 4,
    inherentRisk: "Medium",
    controlRisk: "High",
    detectionRisk: "Medium",
    plannedResponse: "Sample all capitalized assets over $50k and inspect original hardware supplier invoices.",
    controlDescription: "No separate general ledger sub-codes or written policy exists to distinguish research phases from development phases.",
    assignedAuditors: ["Jinan Kabbani, ACCA"],
    trend: "down",
    comments: [
      { id: "rc3", author: "Sami Al-Dabour, FCA", timestamp: "2026-05-20 10:00", text: "Ensure alignment with IAS 38 requirements. Research cost must be fully expensed; verify project timesheets closely." }
    ]
  },
  {
    id: "r3",
    description: "Lax physical inventory safeguards in warehouse cluster B at international hub",
    assertion: "Existence & Completeness",
    likelihood: 2,
    impact: 4,
    inherentRisk: "Medium",
    controlRisk: "Medium",
    detectionRisk: "Low",
    plannedResponse: "Send senior auditor for unscheduled stock take verification of warehouse cluster B.",
    controlDescription: "Access card logs for warehouse cluster B are archived monthly but under-monitored. Heavy reliance on manual double signatures.",
    assignedAuditors: ["Rami Dabour"],
    trend: "stable",
    comments: []
  },
];

// Comprehensive Standard Audit Program Procedures
const INITIAL_PROCEDURES: AuditProcedure[] = [
  {
    id: "p1",
    section: "Revenue",
    ref: "REV-SUB-01",
    description: "Vouch sales invoice samples against signed sales contracts and valid outward shipping log notes.",
    descriptionAr: "فحص عينات فواتير المبيعات ومطابقتها عقود المبيعات الموقعة وإشعارات الشحن الصادرة",
    assertion: "Existence & Cut-Off",
    evidence: "Outward shipping notes, customer receipts",
    status: "Completed",
    signOffBy: "Sami Al-Dabour",
    workpaperRef: "WP-REV-101",
  },
  {
    id: "p2",
    section: "Revenue",
    ref: "REV-SUB-02",
    description: "Validate late sales transactions (10 days pre and post year-end) for correct recording period.",
    descriptionAr: "التحقق من صحة تواريخ المعاملات المتأخرة للبيع لضمان سلامة الفترة الزمنية",
    assertion: "Cut-Off",
    evidence: "Logistics shipping ledgers",
    status: "In Progress",
    signOffBy: "Auditor Lead",
    workpaperRef: "WP-REV-102",
  },
  {
    id: "p3",
    section: "Cash",
    ref: "CSH-SUB-01",
    description: "Request direct electronic SWIFT bank feedback confirmation certificates for all active accounts.",
    descriptionAr: "طلب مصادقات بنكية مباشرة لتأكيد كافة أرصدة الحسابات الجارية والودائع النشطة",
    assertion: "Existence & Rights",
    evidence: "SWIFT Bank confirmations",
    status: "Completed",
    signOffBy: "Senior Associate",
    workpaperRef: "WP-CSH-201",
  },
  {
    id: "p4",
    section: "Assets",
    ref: "PPE-SUB-01",
    description: "Recalculate depreciation schedules for property plant and equipment for correctness.",
    descriptionAr: "إعادة احتساب مخصص إهلاك الأصول الثابتة والممتلكات والمعدات للتأكد من الملاءمة",
    assertion: "Valuation",
    evidence: "ERP asset schedule reports",
    status: "Pending",
  },
];

// Team Assignment and Workspace users
const INITIAL_TEAM: TeamMember[] = [
  { id: "t1", name: "Sami Al-Dabour, FCA", role: "Engagement Partner", assignedAreas: ["Overall Quality", "Materiality Review", "Signoff"] },
  { id: "t2", name: "Mubarak Al-Harthy", role: "Audit Manager", assignedAreas: ["Pre-Engagement Checks", "Independence", "Risk Map"] },
  { id: "t3", name: "Jinan Kabbani, ACCA", role: "Senior Auditor", assignedAreas: ["Revenue & Receivables", "Substantive Cash Test"] },
  { id: "t4", name: "Rami Dabour", role: "Junior Associate", assignedAreas: ["Vouching", "Clerical Reconciliation"] },
  { id: "t5", name: "Sami AI Copilot", role: "Sami AI Copilot", assignedAreas: ["Procedures Synthesis", "Statement Trends", "Contract Extraction"] },
];

// Timeline milestones
const INITIAL_MILESTONES: TimelineMilestone[] = [
  { id: "m1", title: "Client Acceptance & ISA 210 Letter", titleAr: "خطاب قبول الارتباط مع المعيار ٢١٠", dueDate: "2026-06-15", status: "Completed", owner: "Sami Al-Dabour" },
  { id: "m2", title: "Preliminary Analytical Review & Materiality Set", titleAr: "المراجعة التحليلية الأولية وتثبيت النطاق المادي", dueDate: "2026-07-01", status: "Active", owner: "Jinan Kabbani" },
  { id: "m3", title: "Substantive Fieldwork Execution & Vouching", titleAr: "تنفيذ الاختبارات التفصيلية والنزول والتحقق الميداني", dueDate: "2026-08-30", status: "Pending", owner: "Rami Dabour" },
  { id: "m4", title: "Drafting Report, Partner Review, & ISA Form 700 Signoff", titleAr: "صياغة التقرير، مراجعة الشركاء، والتوقيع النهائي للملف", dueDate: "2026-09-15", status: "Pending", owner: "Sami Al-Dabour" },
];

// Clean configurations for new/fresh audits
const CLEAN_PRE_ENG_CHECKLIST: PreEngagementItem[] = INITIAL_PRE_ENG_CHECKLIST.map((item) => ({
  ...item,
  status: "Not_Started" as const,
  comments: "",
  signee: ""
}));

const CLEAN_MILESTONES: TimelineMilestone[] = INITIAL_MILESTONES.map((item) => ({
  ...item,
  status: "Pending" as const,
}));

// Default Workpapers library
const INITIAL_WORKPAPERS: Workpaper[] = [
  {
    id: "wp1",
    ref: "WP-MAT-101",
    title: "Materiality Assessment Memo FY26",
    titleAr: "مذكرة تقييم الأهمية النسبية للسنة المالية 2026",
    section: "Planning & Materiality",
    sectionAr: "التخطيط والأهمية النسبية",
    status: "In Review",
    contentMarkdown: `### Materiality Assessment Memorandum
**Client**: Global Tech Solutions FY26
**Year End**: 31-Dec-2026

#### 1. OVERALL MATERIALITY DETERMINATION
Based on client circumstances, **Revenues** has been chosen as an appropriate financial statement benchmark.
The business operations are driven heavily by technology growth budgets, matching sector practices.

*   Chosen Benchmark: **Gross Revenue**
*   Baseline Benchmark Value: **$12,500,000**
*   Overall Materiality Rate: **1.0%**
*   **Overall Materiality Amount: $125,000**

#### 2. PERFORMANCE MATERIALITY
Set at **75.0%** of Overall Materiality in accordance with ISA 320 to allow for uncorrected misstatements.
*   **Performance Materiality Threshold: $93,750** *(Testing threshold for workpaper sampling)*

#### 3. CLEARLY TRIVIAL LIMIT
Determined at **5.0%** of Performance Materiality limit. Any misstatements caught under this value are deemed de minimis.
*   **Clearly Trivial Limit (De Minimis Error): $4,688**`,
    contentMarkdownAr: `### مذكرة تقييم الأهمية النسبية
**العميل**: Global Tech Solutions — السنة المالية 2026
**تاريخ نهاية السنة**: 31 ديسمبر 2026

#### 1. تحديد الأهمية النسبية الإجمالية
بناءً على ظروف العميل، تم اختيار **الإيرادات** كمعيار مالي مناسب للقوائم المالية.
تعتمد عمليات الشركة بشكل كبير على ميزانيات النمو التقني وفق ممارسات القطاع.

*   المعيار المختار: **إجمالي الإيرادات**
*   القيمة الأساسية للمعيار: **12,500,000 دولار**
*   نسبة الأهمية الإجمالية: **1.0%**
*   **مبلغ الأهمية النسبية الإجمالية: 125,000 دولار**

#### 2. الأهمية النسبية للأداء
تم تحديدها بنسبة **75.0%** من الأهمية الإجمالية وفقاً لمعيار ISA 320 لمراعاة التحريفات غير المصححة.
*   **حد الأهمية النسبية للأداء: 93,750 دولار** *(حد العينات لاختبارات أوراق العمل)*

#### 3. حد التحريفات التافهة
تم تحديده بنسبة **5.0%** من حد الأهمية النسبية للأداء، وتُعتبر التحريفات الأقل من هذا الحد غير جوهرية.
*   **حد التحريفات التافهة (الحد الأدنى): 4,688 دولار**`,
  },
  {
    id: "wp2",
    ref: "WP-REV-101",
    title: "Revenue Vouching and Sample Sheet",
    titleAr: "ورقة تحقق وعينات الإيرادات",
    section: "Revenue",
    sectionAr: "الإيرادات",
    status: "Completed",
    contentMarkdown: `### Revenue Vouching Test Sheet
**Audit Area**: Revenue Recognition (IFRS 15 compliance)

#### Standard Testing Procedure
Selected a statistical sample of invoice bookings from general ledger accounts and matched against outward shipping manifest logs and contracts.

| Invoice Ref | Invoice Date | Customer Name | Value ($) | Matches MSA? | Matches Courier? | Pass/Fail |
|---|---|---|---|---|---|---|
| INV-26-001 | Jan 15, 2026 | Atlas Cyber Tech | $84,500 | Yes | Yes (Air #101) | **Pass** |
| INV-26-042 | Mar 30, 2026 | Cloud Base Doha | $112,000 | Yes | Yes (DHL #229) | **Pass** |`,
    contentMarkdownAr: `### ورقة اختبار تحقق الإيرادات
**مجال التدقيق**: الاعتراف بالإيرادات (وفقاً للمعيار IFRS 15)

#### الإجراء المعياري للاختبار
تم اختيار عينة إحصائية من قيود الفواتير من حسابات الأستاذ العام ومطابقتها مع سجلات الشحن الخارجي والعقود.

| مرجع الفاتورة | تاريخ الفاتورة | اسم العميل | القيمة ($) | مطابقة العقد؟ | مطابقة الشحن؟ | النتيجة |
|---|---|---|---|---|---|---|
| INV-26-001 | 15 يناير 2026 | Atlas Cyber Tech | 84,500 | نعم | نعم (شحن #101) | **مقبول** |
| INV-26-042 | 30 مارس 2026 | Cloud Base Doha | 112,000 | نعم | نعم (DHL #229) | **مقبول** |`,
  },
  {
    id: "wp3",
    ref: "WP-CSH-201",
    title: "Bank Balances SWIFT Reconciliation",
    titleAr: "تسوية أرصدة البنوك عبر سويفت",
    section: "Cash & Cash Equivalents",
    sectionAr: "النقدية وما في حكمها",
    status: "Draft",
    contentMarkdown: `### Cash & Bank Reconciliation audit file
**Audit Objectives**: Verify absolute existence and ownership of bank accounts.

#### 1. SWIFT Confirmation Responses Summary
Direct verification response certificates collected directly from custody banks:
*   Standard Chartered USD Account ... Confirmed **$4,582,100**
*   Qatar National Bank QAR Account ... Confirmed **QR 3,250,900**`,
    contentMarkdownAr: `### ملف تدقيق تسوية النقدية والبنوك
**أهداف التدقيق**: التحقق من الوجود الفعلي وملكية الحسابات البنكية.

#### 1. ملخص ردود مصادقات سويفت
شهادات تأكيد مباشرة تم تجميعها من البنوك المُودعة:
*   حساب Standard Chartered بالدولار … مؤكد **4,582,100 دولار**
*   حساب البنك الأهلي القطري بالريال … مؤكد **3,250,900 ريال قطري**`,
  },
];

const ALI_WORKPAPERS: Workpaper[] = [
  {
    id: "wp-ali-1",
    ref: "WP-MAT-ALI-101",
    title: "Materiality Assessment Memo - Ali For Import",
    titleAr: "مذكرة تقييم الأهمية النسبية — علي للاستيراد",
    section: "Planning & Materiality",
    sectionAr: "التخطيط والأهمية النسبية",
    status: "Completed",
    contentMarkdown: `### Materiality Assessment Memorandum
**Client**: Ali For Import / علي للاستيراد
**Year End**: 31-Dec-2026

#### 1. OVERALL MATERIALITY DETERMINATION
Based on client circumstances, **Revenues** has been chosen as an appropriate financial statement benchmark for sea transportation and customs compliance audits.

*   Chosen Benchmark: **Gross Revenue**
*   Baseline Benchmark Value: **$18,500,000**
*   Overall Materiality Rate: **1.0%**
*   **Overall Materiality Amount: $185,000**

#### 2. PERFORMANCE MATERIALITY
Set at **75.0%** of Overall Materiality in accordance with ISA 320 to allow for uncorrected misstatements.
*   **Performance Materiality Threshold: $138,750**

#### 3. CLEARLY TRIVIAL LIMIT
Determined at **5.0%** of Performance Materiality limit.
*   **Clearly Trivial Limit: $9,250**`,
    contentMarkdownAr: `### مذكرة تقييم الأهمية النسبية
**العميل**: علي للاستيراد / Ali For Import
**تاريخ نهاية السنة**: 31 ديسمبر 2026

#### 1. تحديد الأهمية النسبية الإجمالية
بناءً على ظروف العميل، تم اختيار **الإيرادات** كمعيار مالي مناسب لتدقيقات النقل البحري والامتثال الجمركي.

*   المعيار المختار: **إجمالي الإيرادات**
*   القيمة الأساسية للمعيار: **18,500,000 دولار**
*   نسبة الأهمية الإجمالية: **1.0%**
*   **مبلغ الأهمية النسبية الإجمالية: 185,000 دولار**

#### 2. الأهمية النسبية للأداء
تم تحديدها بنسبة **75.0%** من الأهمية الإجمالية وفقاً لمعيار ISA 320.
*   **حد الأهمية النسبية للأداء: 138,750 دولار**

#### 3. حد التحريفات التافهة
تم تحديده بنسبة **5.0%** من حد الأهمية النسبية للأداء.
*   **حد التحريفات التافهة: 9,250 دولار**`
  },
  {
    id: "wp-ali-2",
    ref: "WP-REV-ALI-10",
    title: "Vouching Showroom Sales Receipts",
    titleAr: "تحقق إيصالات مبيعات المعرض",
    section: "Revenue",
    sectionAr: "الإيرادات",
    status: "Completed",
    contentMarkdown: `### Revenue Vouching Test Sheet
**Audit Area**: Revenue Recognition (IFRS 15 compliance)
**Client**: Ali For Import / علي للاستيراد

#### Standard Testing Procedure
Selected a statistical sample of vehicle sales transactions and trace to customs release drafts and shipping manifests. All samples match correctly without variance.`,
    contentMarkdownAr: `### ورقة اختبار تحقق الإيرادات
**مجال التدقيق**: الاعتراف بالإيرادات (وفقاً للمعيار IFRS 15)
**العميل**: علي للاستيراد / Ali For Import

#### الإجراء المعياري للاختبار
تم اختيار عينة إحصائية من معاملات بيع المركبات وتتبعها مع مسودات الإفراج الجمركي ومستندات الشحن. جميع العينات مطابقة دون فروقات.`
  }
];

// Translate common workpaper sections to Arabic on the fly (fallback when sectionAr is missing)
const WP_SECTION_AR: Record<string, string> = {
  "Planning & Materiality": "التخطيط والأهمية النسبية",
  "Revenue": "الإيرادات",
  "Cash & Cash Equivalents": "النقدية وما في حكمها",
  "Standard Audit Fieldwork": "أعمال التدقيق الميدانية القياسية",
  "AI Supported Technical Workpapers": "أوراق عمل فنية بدعم الذكاء الاصطناعي",
};
const WP_STATUS_AR: Record<string, string> = {
  "Completed": "مكتملة",
  "In Review": "قيد المراجعة",
  "Draft": "مسودة",
};
const arWpTitle = (w: Workpaper) => w.titleAr || w.title;
const arWpSection = (w: Workpaper) => w.sectionAr || WP_SECTION_AR[w.section] || w.section;
const arWpStatus = (s: string) => WP_STATUS_AR[s] || s;
const arWpContent = (w: Workpaper) => w.contentMarkdownAr || w.contentMarkdown;

// ─── NavBtn helper (must be before HomeScreen for Babel/Vite module eval order) ─

type AnyTab = "dashboard" | "overview" | "pre-engagement" | "materiality" | "risk-matrix" | "aml" | "procedures" | "workpapers" | "findings" | "planning" | "analysis" | "final-reporting" | "settings" | "sami-ai" | "going-concern" | "related-parties" | "mgmt-rep";

function NavBtn({
  tab, active, set, icon, label, gradient, pulse,
}: {
  tab: AnyTab;
  active: AnyTab;
  set: (t: AnyTab) => void;
  icon: React.ReactNode;
  label: string;
  gradient?: boolean;
  pulse?: boolean;
}) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => set(tab)}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
        isActive && gradient
          ? "bg-brand-gradient text-white"
          : isActive
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      }`}
    >
      <span className={pulse && !isActive ? "animate-pulse" : ""}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function HomeScreen() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "AR";
    return (localStorage.getItem("dabour-lang") as Language) || "AR";
  });
  const t = translations[lang];

  // App users (local, persisted)
  type AppUser = { id: string; username: string; role: string; addedAt: string };
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("dabour-app-users") || "[]"); } catch { return []; }
  });
  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState("Auditor");

  // Active module state for navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "overview" | "pre-engagement" | "materiality" | "risk-matrix" | "aml" | "procedures" | "workpapers" | "findings" | "planning" | "analysis" | "final-reporting" | "settings" | "sami-ai" | "going-concern" | "related-parties" | "mgmt-rep"
  >("dashboard");
  const [showIdeaHalo, setShowIdeaHalo] = useState(false);
  const [showCompliancePanel, setShowCompliancePanel] = useState(false);


  // Client list and selection
  const [clients, setClients] = useState<AuditClient[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>("c4");
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // New Client parameters
  const [newClientName, setNewClientName] = useState("");
  const [newClientArName, setNewClientArName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("Technology");
  const [newClientPartner, setNewClientPartner] = useState("Sami Al-Dabour, FCA");

  // Custom Dynamic Partners List
  const [auditPartnersList, setAuditPartnersList] = useState<string[]>([
    "Sami Al-Dabour, FCA",
    "Mubarak Al-Harthy, CPA",
    "Laila Al-Ghamdi, CPA (KPMG)",
    "Tareq Al-Jamil, FCCA (PwC)",
    "Fatimah Al-Ahmad, CA (EY)",
    "Mustafa Abdel-Ati, CPA (Deloitte)",
    "Amr El-Masry, FCA (Senior Partner)",
    "Yasmin Toukan, CPA (Assurance Lead)"
  ]);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [customPartnerInput, setCustomPartnerInput] = useState("");

  // Roll-Forward (New Audit Cycle) Modal States
  const [showRollForwardModal, setShowRollForwardModal] = useState(false);
  const [rollForwardTargetYear, setRollForwardTargetYear] = useState("2027");
  const [rollForwardPartner, setRollForwardPartner] = useState("Sami Al-Dabour, FCA");
  const [rollForwardDropdownOpen, setRollForwardDropdownOpen] = useState(false);
  const [rollForwardCustomPartnerInput, setRollForwardCustomPartnerInput] = useState("");

  // Prior-year ISA review checklist (per client file). Each task can be marked reviewed and given a file.
  type ClientFile = { id: string; name: string; size: number; addedAt: string; taskId?: string };
  const [clientFiles, setClientFiles] = useState<Record<string, ClientFile[]>>({});
  const [clientPriorReview, setClientPriorReview] = useState<Record<string, Record<string, boolean>>>({});
  // Local roll-forward modal staging (reset on open):
  const [rollPriorReview, setRollPriorReview] = useState<Record<string, boolean>>({});
  const [rollFiles, setRollFiles] = useState<ClientFile[]>([]);

  // Per-client file status (selectable by the user): not_started | in_progress | completed
  type ClientFileStatus = "not_started" | "in_progress" | "completed";
  const [clientFileStatus, setClientFileStatus] = useState<Record<string, ClientFileStatus>>({});
  const getClientFileStatus = (c: AuditClient): ClientFileStatus => {
    if (clientFileStatus[c.id]) return clientFileStatus[c.id];
    if (c.status === "Completed") return "completed";
    if (c.progress > 0) return "in_progress";
    return "not_started";
  };
  const stripFyName = (n: string) =>
    n.replace(/\s+FY\d{2,4}/i, "").replace(/\s+٢٠٢\d|\s+٢٠٣\d/g, "").trim();

  // Pending prior-year audit review tasks (per ISA). Shown in Roll-Forward modal and in the Analysis screen.
  const PRIOR_YEAR_REVIEW_TASKS: { id: string; en: string; ar: string; isa: string }[] = [
    { id: "py-doc", en: "Review prior-year supporting documents sample", ar: "مراجعة عينة من مستندات السنة السابقة الداعمة", isa: "ISA 230" },
    { id: "py-jrnl", en: "Re-perform journal entry testing on prior period", ar: "إعادة اختبار قيود اليومية للفترة السابقة", isa: "ISA 240" },
    { id: "py-recv", en: "Verify prior receivables circularization responses", ar: "التحقق من ردود مصادقات الذمم المدينة السابقة", isa: "ISA 505" },
    { id: "py-est", en: "Reassess management estimates & provisions used", ar: "إعادة تقييم التقديرات والمخصصات المستخدمة من الإدارة", isa: "ISA 540" },
    { id: "py-rel", en: "Confirm related-party transactions disclosures", ar: "تأكيد الإفصاحات عن معاملات الأطراف ذات العلاقة", isa: "ISA 550" },
    { id: "py-subs", en: "Review subsequent events post prior FY close", ar: "مراجعة الأحداث اللاحقة لتاريخ إقفال السنة السابقة", isa: "ISA 560" },
    { id: "py-going", en: "Reassess going-concern assumptions", ar: "إعادة تقييم فرضية الاستمرارية", isa: "ISA 570" },
    { id: "py-comm", en: "Communicate uncorrected misstatements to TCWG", ar: "توصيل الأخطاء غير المصححة للمكلفين بالحوكمة", isa: "ISA 260 / 450" },
  ];




  // Multi-Language State references
  const isRtl = lang === "AR";

  // Retain Client State & Data
  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0];
  }, [clients, selectedClientId]);

  // Checklist states
  const [preEngagementItems, setPreEngagementItems] = useState<PreEngagementItem[]>(INITIAL_PRE_ENG_CHECKLIST.map(item => {
    switch (item.id) {
      case "pe1":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Signed engagement letter retrieved from MD Mr. Ali on May 15, 2026. Stored securely inside firm database.",
          signee: "SD",
        };
      case "pe2":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Verified team credentials. Senior Auditor Jinan holds ACCA with 5 years maritime logistics audit experience. Sami AI is fully briefed for copilot assistance.",
          signee: "SD",
        };
      case "pe3":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Partner Sami Al-Dabour is on his 3rd year of rotation for this business family group. Well within the 7-year regulatory threshold.",
          signee: "MH",
        };
      case "pe4":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Full conflicts check completed. All team members signed independence declarations confirming zero financial stakes in Ali For Import.",
          signee: "MH",
        };
      case "pe5":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Agreed total audit fee of USD 45,000. 30% mobilization advance received and recorded under prepaid engagement accounts.",
          signee: "SD",
        };
      case "pe6":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Ultimate Beneficial Owner (UBO) is Mr. Ali Al-Ghamdi (85% holding). Screened against OFAC, EU sanctions, and domestic compliance lists—all clear.",
          signee: "MH",
        };
      case "pe7":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Checked alliance offices and cargo brokers. No global network conflicts flagged during our standard risk assessment round.",
          signee: "SD",
        };
      case "pe8":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Negative media screening completed across sea logistics, custom clearance forum databases, and regional press. Zero regulatory disputes identified.",
          signee: "SD",
        };
      case "pe9":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Obtained opening trial balance. Prior auditor (Al-Sabti & Co) issued an unqualified opinion for FY25. Opening schedules fully verified.",
          signee: "MH",
        };
      case "pe10":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Engagement Quality Control Reviewer (EQCR) Nasser Al-Subaie has been appointed formally due to customs classification concerns and sea logistics complexity.",
          signee: "MH",
        };
      case "pe11":
        return {
          ...item,
          status: "Completed" as const,
          comments: "Verified that our firm's global statutory professional indemnity coverage limits are intact and fully cover the Ali For Import audit scope.",
          signee: "SD",
        };
      default:
        return item;
    }
  }));

  // Materiality states
  const [materiality, setMateriality] = useState<MaterialityState>({
    benchmark: "Revenue",
    customValue: 18500000,
    overallPercentage: 1.0,
    performancePercentage: 75.0,
    trivialPercentage: 5.0,
  });

  // Risk items registry
  const [risks, setRisks] = useState<RiskItem[]>([
    {
      id: "r-ali-1",
      description: "Valuation of Imported Motor Vehicles in transit due to customs classification disputes & fluctuating sea freight rates",
      assertion: "Valuation & Measurement",
      likelihood: 4,
      impact: 4,
      inherentRisk: "High",
      controlRisk: "Medium",
      detectionRisk: "Low",
      plannedResponse: "Perform detail vetting of customs declaration files and inspect HS code classification clearance, matching with payments issued via bank drafts.",
      controlDescription: "Customs tariff reports and port freight invoices are checked with clearance agents, but formal partner review on accrued customs duties is pending.",
      assignedAuditors: ["Jinan Kabbani, ACCA", "Sami AI Copilot"],
      trend: "up",
      comments: [
        { id: "rc-ali-1", author: "Mubarak Al-Harthy", timestamp: "2026-05-22 09:30", text: "Please pay close attention to code 1200-01 (In-Transit vehicles). Customs is currently auditing the values declared." },
        { id: "rc-ali-2", author: "Sami AI Copilot", timestamp: "2026-05-22 11:15", text: "AI scanning identified that historical transit clearance times average 22 days. Unusually long deferrals must be tested for lower of cost or net realizable value (NRV)." }
      ]
    },
    {
      id: "r-ali-2",
      description: "Cut-off and ownership transfer timings concerning CFR/CIF vs FOB shipment terms for overseas bulk imports (IFRS 15)",
      assertion: "Occurrence & Cut-Off",
      likelihood: 3,
      impact: 5,
      inherentRisk: "High",
      controlRisk: "High",
      detectionRisk: "Medium",
      plannedResponse: "Audit shipping documents (Bill of Lading) for a selective high-value sample post and pre year-end, validating transfer of legal ownership according to maritime terms.",
      controlDescription: "No systematic automated mapping of maritime shipping terms in ERP; logistics managers manually input recognition dates.",
      assignedAuditors: ["Jinan Kabbani, ACCA"],
      trend: "stable",
      comments: []
    }
  ]);
  const [riskFilter, setRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [hoveredRiskId, setHoveredRiskId] = useState<string | null>(null);
  const [riskSortField, setRiskSortField] = useState<"inherentRisk" | "likelihood" | "impact" | "score" | "none">("none");
  const [riskSortOrder, setRiskSortOrder] = useState<"asc" | "desc">("desc");

  const handleHeaderSort = (field: "inherentRisk" | "likelihood" | "impact" | "score") => {
    if (riskSortField === field) {
      setRiskSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setRiskSortField(field);
      setRiskSortOrder("desc"); // Default to high-to-low for critical focus
    }
  };

  // AML state variables
  const [amlSearch, setAmlSearch] = useState("");
  const [amlResults, setAmlResults] = useState<AMLSearchResult[]>([]);
  const [hasSearchedAML, setHasSearchedAML] = useState(false);

  // Enhanced AML States for Big-Four Egyptian Compliance
  const [amlSearchHistory, setAmlSearchHistory] = useState<Record<string, Array<{
    id: string;
    query: string;
    timestamp: string;
    resultsCount: number;
    highestRisk: number;
    status: string;
  }>>>({});
  const [amlJustifications, setAmlJustifications] = useState<Record<string, string>>({});
  const [amlVerifiedStatus, setAmlVerifiedStatus] = useState<Record<string, "Flagged" | "Justified" | "Cleared">>({});
  const [amlScoringLoading, setAmlScoringLoading] = useState(false);
  const [amlReportSignOffs, setAmlReportSignOffs] = useState<Record<string, {
    signee: string;
    timestamp: string;
    hash: string;
    notes: string;
  } | null>>({});
  const [amlSigneeInput, setAmlSigneeInput] = useState("Jinan Kabbani, ACCA");
  const [amlJustificationDrafts, setAmlJustificationDrafts] = useState<Record<string, string>>({});
  const [amlSignOffNotesInput, setAmlSignOffNotesInput] = useState("");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Audit Program Procedures
  const [procedures, setProcedures] = useState<AuditProcedure[]>([
    {
      id: "p-ali-1",
      section: "Revenue",
      ref: "REV-ALI-01",
      description: "Vouch showroom sales deposits directly against sea-freight release slips and Customs authority clearance receipts.",
      descriptionAr: "فحص ومطابقة دفعات مبيعات المعارض مباشرة بمقاصة جمركية وإيصالات الإفراج عن الشحنات الصادرة من الميناء",
      assertion: "Existence & Cut-Off",
      evidence: "Bill of Lading, Customs clearance notes, Bank deposit slips",
      status: "Completed",
      signOffBy: "Jinan Kabbani, ACCA",
      workpaperRef: "WP-REV-ALI-10",
    },
    {
      id: "p-ali-2",
      section: "Cash",
      ref: "CSH-ALI-01",
      description: "Reconcile custom clearing security deposits held by the Port Authority to direct bank cash float statements and verify clearance.",
      descriptionAr: "رسم فحص ومطابقة تأمينات التخليص الجمركي المدفوعة لهيئة الموانئ ومطابقتها مع كشوف العهد النقدية بالبنك واستردادها",
      assertion: "Existence & Rights",
      evidence: "Port authority confirmation ledger, HSBC statements",
      status: "In Progress",
      signOffBy: "Rami Dabour",
      workpaperRef: "WP-CSH-ALI-20",
    },
    {
      id: "p-ali-3",
      section: "Inventories",
      ref: "INV-ALI-01",
      description: "Perform physically unscheduled counts of imported vehicles stored at Port Showroom inventory cluster 3.",
      descriptionAr: "إجراء جرد فني مفاجئ للسيارات والآلات مستوردة المخزنة في هنجر رقم ٣ التابع لمعرض الميناء الرئيسي",
      assertion: "Existence & Valuation",
      evidence: "Physical inventory checksheets, customs release transit list",
      status: "Pending",
    }
  ]);
  
  // Audit Program Procedures Import States
  const [isReadingProcedures, setIsReadingProcedures] = useState(false);
  const [proceduresReadProgress, setProceduresReadProgress] = useState(0);
  const [proceduresReadingFileName, setProceduresReadingFileName] = useState("");
  const [proceduresDragActive, setProceduresDragActive] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedProcIds, setSelectedProcIds] = useState<Set<string>>(new Set());
  const [procFilterSection, setProcFilterSection] = useState<string>("ALL");
  const [procFilterStatus, setProcFilterStatus] = useState<string>("ALL");

  // SAVED CLIENT SPECIFIC MAPPINGS (PwC CaseWare Integration Style)
  const [clientLedgers, setClientLedgers] = useState<{[clientId: string]: any}>({
    "c1": {
      fileName: "Global_Tech_FY26_TB_Draft_V3.csv",
      fileSize: "142 KB",
      totalRevenue: 14200000,
      assets: 25400000,
      accounts: [
        { code: "1001-00", name: "Cash & Cash Equivalents", nameAr: "النقد وما في حكمه", debit: 3200000, credit: 0, adjustedBalance: 3200000, mappedArea: "Cash" },
        { code: "1100-20", name: "Trade Accounts Receivable", nameAr: "الذمم المدينة التجارية", debit: 4500000, credit: 0, adjustedBalance: 4500000, mappedArea: "Receivables" },
        { code: "1200-10", name: "Slow Moving Inventories", nameAr: "المخزون راكد الحركة", debit: 1800000, credit: 0, adjustedBalance: 1800000, mappedArea: "Inventories" },
        { code: "1500-05", name: "Property, Plant & Equipment", nameAr: "العقارات والآلات والمعدات", debit: 15900000, credit: 0, adjustedBalance: 15900000, mappedArea: "Fixed Assets" },
        { code: "2000-01", name: "Accounts Payable", nameAr: "الذمم الدائنة التجارية", debit: 0, credit: 2100000, adjustedBalance: -2100000, mappedArea: "Payables" },
        { code: "4000-00", name: "Technology Licensing Revenues", nameAr: "إيرادات ترخيص التكنولوجيا", debit: 0, credit: 14200000, adjustedBalance: -14200000, mappedArea: "Revenues" },
        { code: "5000-10", name: "Development Operating Payroll", nameAr: "رواتب ومصروفات التشغيل والتطوير", debit: 10900000, credit: 0, adjustedBalance: 10900000, mappedArea: "Payroll" },
      ]
    },
    "c2": {
      fileName: "Zaza_Industries_Ledger_Validated.xlsx",
      fileSize: "318 KB",
      totalRevenue: 28650000,
      assets: 41200000,
      accounts: [
        { code: "1000-11", name: "Petty Cash Reserves", nameAr: "النقدية والعهد والامانات", debit: 550000, credit: 0, adjustedBalance: 550000, mappedArea: "Cash" },
        { code: "1100-30", name: "Outstanding Client Receivables", nameAr: "عملاء المبيعات المستحقة", debit: 12000000, credit: 0, adjustedBalance: 12000000, mappedArea: "Receivables" },
        { code: "1200-20", name: "Raw Warehouse Inventory", nameAr: "مخزون المستودعات والمواد الخام", debit: 8400000, credit: 0, adjustedBalance: 8400000, mappedArea: "Inventories" },
        { code: "1600-00", name: "Heavy Assembly Machineries", nameAr: "آلات ومعدات التجمع الثقيل", debit: 20250000, credit: 0, adjustedBalance: 20250000, mappedArea: "Fixed Assets" },
        { code: "4000-50", name: "Industrial Goods Sales Revenue", nameAr: "مبيعات المنتجات الصناعية", debit: 0, credit: 28650000, adjustedBalance: -28650000, mappedArea: "Revenues" },
        { code: "5100-00", name: "Direct Cost of Sales Goods", nameAr: "تكلفة المبيعات والسلع المباشرة", debit: 17450000, credit: 0, adjustedBalance: 17450000, mappedArea: "Cost of Sales" },
      ]
    },
    "c4": {
      fileName: "Ali_For_Import_Trial_Balance_FY26.xlsx",
      fileSize: "245 KB",
      totalRevenue: 18500000,
      assets: 31000000,
      accounts: [
        { code: "1010-01", name: "HSBC USD Current Account", nameAr: "حساب جاري دولار - بنك HSBC", debit: 3500000, credit: 0, adjustedBalance: 3500000, mappedArea: "Cash" },
        { code: "1020-05", name: "Port Customs Cash Float", nameAr: "صندوق أمانات جمارك الميناء", debit: 800000, credit: 0, adjustedBalance: 800000, mappedArea: "Cash" },
        { code: "1110-12", name: "Local Distributors Receivables", nameAr: "ذمم الموزعين المحليين", debit: 6200000, credit: 0, adjustedBalance: 6200000, mappedArea: "Receivables" },
        { code: "1200-01", name: "Imported Vehicles in Customs Transit", nameAr: "بضاعة بالطريق - سيارات وآليات مستوردة", debit: 9500000, credit: 0, adjustedBalance: 9500000, mappedArea: "Inventories" },
        { code: "1250-10", name: "Main Port Showroom Inventory", nameAr: "مخزون المعرض الرئيسي بميناء جبل علي", debit: 5200000, credit: 0, adjustedBalance: 5200000, mappedArea: "Inventories" },
        { code: "1510-00", name: "Logistics Showroom Land & Structures", nameAr: "عقارات وأراضي معرض الخدمات اللوجستية", debit: 5800000, credit: 0, adjustedBalance: 5800000, mappedArea: "Fixed Assets" },
        { code: "2010-02", name: "Global Automotive Suppliers Payable", nameAr: "ذمم موردين خارجيين - شركات تصنيع السيارات", debit: 0, credit: 4100000, adjustedBalance: -4100000, mappedArea: "Payables" },
        { code: "4000-10", name: "Imported Heavy Vehicles Trade Sales", nameAr: "إيرادات مبيعات السيارات الثقيلة المستوردة", debit: 0, credit: 18500000, adjustedBalance: -18500000, mappedArea: "Revenues" },
        { code: "5010-01", name: "Direct Cost of Imported Goods Sold", nameAr: "تكلفة البضاعة المستوردة المباعة", debit: 11200000, credit: 0, adjustedBalance: 11200000, mappedArea: "Cost of Sales" },
        { code: "5020-03", name: "Customs Clearance & Freight Charges", nameAr: "تكاليف الشحن البحري والتخليص الجمركي", debit: 1400000, credit: 0, adjustedBalance: 1400000, mappedArea: "Cost of Sales" },
      ]
    }
  });

  const [activeLocalLedger, setActiveLocalLedger] = useState<any>({
    fileName: "Ali_For_Import_Trial_Balance_FY26.xlsx",
    fileSize: "245 KB",
    totalRevenue: 18500000,
    assets: 31000000,
    accounts: [
      { code: "1010-01", name: "HSBC USD Current Account", nameAr: "حساب جاري دولار - بنك HSBC", debit: 3500000, credit: 0, adjustedBalance: 3500000, mappedArea: "Cash" },
      { code: "1020-05", name: "Port Customs Cash Float", nameAr: "صندوق أمانات جمارك الميناء", debit: 800000, credit: 0, adjustedBalance: 800000, mappedArea: "Cash" },
      { code: "1110-12", name: "Local Distributors Receivables", nameAr: "ذمم الموزعين المحليين", debit: 6200000, credit: 0, adjustedBalance: 6200000, mappedArea: "Receivables" },
      { code: "1200-01", name: "Imported Vehicles in Customs Transit", nameAr: "بضاعة بالطريق - سيارات وآليات مستوردة", debit: 9500000, credit: 0, adjustedBalance: 9500000, mappedArea: "Inventories" },
      { code: "1250-10", name: "Main Port Showroom Inventory", nameAr: "مخزون المعرض الرئيسي بميناء جبل علي", debit: 5200000, credit: 0, adjustedBalance: 5200000, mappedArea: "Inventories" },
      { code: "1510-00", name: "Logistics Showroom Land & Structures", nameAr: "عقارات وأراضي معرض الخدمات اللوجستية", debit: 5800000, credit: 0, adjustedBalance: 5800000, mappedArea: "Fixed Assets" },
      { code: "2010-02", name: "Global Automotive Suppliers Payable", nameAr: "ذمم موردين خارجيين - شركات تصنيع السيارات", debit: 0, credit: 4100000, adjustedBalance: -4100000, mappedArea: "Payables" },
      { code: "4000-10", name: "Imported Heavy Vehicles Trade Sales", nameAr: "إيرادات مبيعات السيارات الثقيلة المستوردة", debit: 0, credit: 18500000, adjustedBalance: -18500000, mappedArea: "Revenues" },
      { code: "5010-01", name: "Direct Cost of Imported Goods Sold", nameAr: "تكلفة البضاعة المستوردة المباعة", debit: 11200000, credit: 0, adjustedBalance: 11200000, mappedArea: "Cost of Sales" },
      { code: "5020-03", name: "Customs Clearance & Freight Charges", nameAr: "تكاليف الشحن البحري والتخليص الجمركي", debit: 1400000, credit: 0, adjustedBalance: 1400000, mappedArea: "Cost of Sales" },
    ]
  });

  const [clientMaterialities, setClientMaterialities] = useState<{[clientId: string]: MaterialityState}>({
    "c1": INITIAL_MATERIALITY,
    "c2": {
      benchmark: "TotalAssets",
      customValue: 41200000,
      overallPercentage: 1.0,
      performancePercentage: 70.0,
      trivialPercentage: 5.0,
    },
    "c4": {
      benchmark: "Revenue",
      customValue: 18500000,
      overallPercentage: 1.0,
      performancePercentage: 75.0,
      trivialPercentage: 5.0,
    }
  });

  const [clientRisks, setClientRisks] = useState<{[clientId: string]: RiskItem[]}>({
    "c1": INITIAL_RISKS,
    "c4": [
      {
        id: "r-ali-1",
        description: "Valuation of Imported Motor Vehicles in transit due to customs classification disputes & fluctuating sea freight rates",
        assertion: "Valuation & Measurement",
        likelihood: 4,
        impact: 4,
        inherentRisk: "High",
        controlRisk: "Medium",
        detectionRisk: "Low",
        plannedResponse: "Perform detail vetting of customs declaration files and inspect HS code classification clearance, matching with payments issued via bank drafts.",
        controlDescription: "Customs tariff reports and port freight invoices are checked with clearance agents, but formal partner review on accrued customs duties is pending.",
        assignedAuditors: ["Jinan Kabbani, ACCA", "Sami AI Copilot"],
        trend: "up",
        comments: [
          { id: "rc-ali-1", author: "Mubarak Al-Harthy", timestamp: "2026-05-22 09:30", text: "Please pay close attention to code 1200-01 (In-Transit vehicles). Customs is currently auditing the values declared." },
          { id: "rc-ali-2", author: "Sami AI Copilot", timestamp: "2026-05-22 11:15", text: "AI scanning identified that historical transit clearance times average 22 days. Unusually long deferrals must be tested for lower of cost or net realizable value (NRV)." }
        ]
      },
      {
        id: "r-ali-2",
        description: "Cut-off and ownership transfer timings concerning CFR/CIF vs FOB shipment terms for overseas bulk imports (IFRS 15)",
        assertion: "Occurrence & Cut-Off",
        likelihood: 3,
        impact: 5,
        inherentRisk: "High",
        controlRisk: "High",
        detectionRisk: "Medium",
        plannedResponse: "Audit shipping documents (Bill of Lading) for a selective high-value sample post and pre year-end, validating transfer of legal ownership according to maritime terms.",
        controlDescription: "No systematic automated mapping of maritime shipping terms in ERP; logistics managers manually input recognition dates.",
        assignedAuditors: ["Jinan Kabbani, ACCA"],
        trend: "stable",
        comments: []
      }
    ]
  });

  const [clientProcedures, setClientProcedures] = useState<{[clientId: string]: AuditProcedure[]}>({
    "c1": INITIAL_PROCEDURES,
    "c4": [
      {
        id: "p-ali-1",
        section: "Revenue",
        ref: "REV-ALI-01",
        description: "Vouch showroom sales deposits directly against sea-freight release slips and Customs authority clearance receipts.",
        descriptionAr: "فحص ومطابقة دفعات مبيعات المعارض مباشرة بمقاصة جمركية وإيصالات الإفراج عن الشحنات الصادرة من الميناء",
        assertion: "Existence & Cut-Off",
        evidence: "Bill of Lading, Customs clearance notes, Bank deposit slips",
        status: "Completed",
        signOffBy: "Jinan Kabbani, ACCA",
        workpaperRef: "WP-REV-ALI-10",
      },
      {
        id: "p-ali-2",
        section: "Cash",
        ref: "CSH-ALI-01",
        description: "Reconcile custom clearing security deposits held by the Port Authority to direct bank cash float statements and verify clearance.",
        descriptionAr: "رسم فحص ومطابقة تأمينات التخليص الجمركي المدفوعة لهيئة الموانئ ومطابقتها مع كشوف العهد النقدية بالبنك واستردادها",
        assertion: "Existence & Rights",
        evidence: "Port authority confirmation ledger, HSBC statements",
        status: "In Progress",
        signOffBy: "Rami Dabour",
        workpaperRef: "WP-CSH-ALI-20",
      },
      {
        id: "p-ali-3",
        section: "Inventories",
        ref: "INV-ALI-01",
        description: "Perform physically unscheduled counts of imported vehicles stored at Port Showroom inventory cluster 3.",
        descriptionAr: "إجراء جرد فني مفاجئ للسيارات والآلات المستوردة المخزنة في هنجر رقم ٣ التابع لمعرض الميناء الرئيسي",
        assertion: "Existence & Valuation",
        evidence: "Physical inventory checksheets, customs release transit list",
        status: "Pending",
      }
    ]
  });

  const [clientPreEngagementItems, setClientPreEngagementItems] = useState<{[clientId: string]: PreEngagementItem[]}>({
    "c1": INITIAL_PRE_ENG_CHECKLIST,
    "c4": INITIAL_PRE_ENG_CHECKLIST.map(item => {
      switch (item.id) {
        case "pe1":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Signed engagement letter retrieved from MD Mr. Ali on May 15, 2026. Stored securely inside firm database.",
            signee: "SD",
          };
        case "pe2":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Verified team credentials. Senior Auditor Jinan holds ACCA with 5 years maritime logistics audit experience. Sami AI is fully briefed for copilot assistance.",
            signee: "SD",
          };
        case "pe3":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Partner Sami Al-Dabour is on his 3rd year of rotation for this business family group. Well within the 7-year regulatory threshold.",
            signee: "MH",
          };
        case "pe4":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Full conflicts check completed. All team members signed independence declarations confirming zero financial stakes in Ali For Import.",
            signee: "MH",
          };
        case "pe5":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Agreed total audit fee of USD 45,000. 30% mobilization advance received and recorded under prepaid engagement accounts.",
            signee: "SD",
          };
        case "pe6":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Ultimate Beneficial Owner (UBO) is Mr. Ali Al-Ghamdi (85% holding). Screened against OFAC, EU sanctions, and domestic compliance lists—all clear.",
            signee: "MH",
          };
        case "pe7":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Checked alliance offices and cargo brokers. No global network conflicts flagged during our standard risk assessment round.",
            signee: "SD",
          };
        case "pe8":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Negative media screening completed across sea logistics, custom clearance forum databases, and regional press. Zero regulatory disputes identified.",
            signee: "SD",
          };
        case "pe9":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Obtained opening trial balance. Prior auditor (Al-Sabti & Co) issued an unqualified opinion for FY25. Opening schedules fully verified.",
            signee: "MH",
          };
        case "pe10":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Engagement Quality Control Reviewer (EQCR) Nasser Al-Subaie has been appointed formally due to customs classification concerns and sea logistics complexity.",
            signee: "MH",
          };
        case "pe11":
          return {
            ...item,
            status: "Completed" as const,
            comments: "Verified that our firm's global statutory professional indemnity coverage limits are intact and fully cover the Ali For Import audit scope.",
            signee: "SD",
          };
        default:
          return item;
      }
    })
  });

  const [clientEngagements, setClientEngagements] = useState<{[clientId: string]: {
    engagementType: string;
    assuranceLevel: string;
    budgetHours: number;
    auditPartner: string;
    auditManager: string;
    seniorAuditor: string;
    juniorAssociate?: string;
    status?: string;
    riskProfile?: string;
    internalControlAssessment?: string;
    lastRotationYear?: number;
    approvedByPartner?: string;
  }}>({
    "c1": {
      engagementType: "External Statutory Audit (ISA 200)",
      assuranceLevel: "Reasonable Assurance",
      budgetHours: 190,
      auditPartner: "Sami Al-Dabour, FCA",
      auditManager: "Mubarak Al-Harthy",
      seniorAuditor: "Jinan Kabbani, ACCA",
      juniorAssociate: "Rami Dabour",
      status: "Planning",
    },
    "c2": {
      engagementType: "External Statutory Audit (ISA 200)",
      assuranceLevel: "Reasonable Assurance",
      budgetHours: 240,
      auditPartner: "Mubarak Al-Harthy",
      auditManager: "Sami Al-Dabour, FCA",
      seniorAuditor: "Jinan Kabbani, ACCA",
      juniorAssociate: "Rami Dabour",
      status: "Risk Assessment",
    },
    "c4": {
      engagementType: "External Statutory Audit (ISA 200)",
      assuranceLevel: "Reasonable Assurance",
      budgetHours: 210,
      auditPartner: "Sami Al-Dabour, FCA",
      auditManager: "Mubarak Al-Harthy",
      seniorAuditor: "Jinan Kabbani, ACCA",
      juniorAssociate: "Rami Dabour",
      status: "Planning",
    }
  });

  // Client-specific teams list
  const [clientTeams, setClientTeams] = useState<{[clientId: string]: TeamMember[]}>({
    "c1": INITIAL_TEAM,
    "c2": INITIAL_TEAM.map(m => ({ ...m, assignedAreas: m.id === "t5" ? ["Procedures Synthesis"] : [] })),
    "c4": INITIAL_TEAM,
  });

  // Client-specific progress milestones list
  const [clientMilestones, setClientMilestones] = useState<{[clientId: string]: TimelineMilestone[]}>({
    "c1": INITIAL_MILESTONES,
    "c2": CLEAN_MILESTONES,
    "c4": INITIAL_MILESTONES,
  });

  // Client-specific workpapers list
  const [clientWorkpapers, setClientWorkpapers] = useState<{[clientId: string]: Workpaper[]}>({
    "c1": INITIAL_WORKPAPERS,
    "c2": [
      {
        id: "wp-zaza-1",
        ref: "WP-MAT-ZAZA",
        title: "Zaza Industries Materiality Memo",
        section: "Planning & Materiality",
        status: "Draft",
        contentMarkdown: "### Materiality assessment for Zaza Industries is pending detailed setup."
      }
    ],
    "c4": ALI_WORKPAPERS
  });

  // Detailed acceptance card state
  const [openAcceptanceCard, setOpenAcceptanceCard] = useState<string | null>(null);

  // Phase Sign-off statuses
  const [phasesSignoff, setPhasesSignoff] = useState<{[clientId: string]: {[cardId: string]: "SIGNED OFF" | "PENDING" | "OPEN FORM" | "DRAFT" | "COMPLETED"}}>({
    "c4": {
      "A1": "SIGNED OFF",
      "A1.1": "SIGNED OFF",
      "A2": "SIGNED OFF",
      "A3": "SIGNED OFF",
      "B1": "SIGNED OFF",
      "C1": "SIGNED OFF",
      "PAF": "OPEN FORM",
      "CAF": "OPEN FORM"
    }
  });

  // Client form states
  const [clientFormA1, setClientFormA1] = useState<{[clientId: string]: {
    industryValue: string;
    legalFormValue: string;
    ownershipValue: string;
    auditReasonValue: string;
    reputationValue: string;
    prevAuditorValue: string;
    integrityValue: string;
    adverseInfo: "Yes" | "No";
    adverseComments: string;
    legalActions: "Yes" | "No";
    legalComments: string;
    ethicalConcerns: "Yes" | "No";
    ethicalComments: string;
    competenceAssurance: "Yes" | "No";
    competenceComments: string;
  }}>({
    "c4": {
      industryValue: "Consumer Goods & Sea Logistics",
      legalFormValue: "Limited Liability Company (LLC)",
      ownershipValue: "Private / Institutional",
      auditReasonValue: "Statutory Audit Requirement",
      reputationValue: "Good",
      prevAuditorValue: "Local Professional Office",
      integrityValue: "High",
      adverseInfo: "No",
      adverseComments: "No adverse findings or regulatory warnings detected after screening national news and regional databases.",
      legalActions: "No",
      legalComments: "The company has a minor container demurrage litigation with shipping agent, immaterial to overall financial statement integrity.",
      ethicalConcerns: "No",
      ethicalComments: "Management demonstrates commitment to sound business ethics; compliance officer conducts yearly checks.",
      competenceAssurance: "Yes",
      competenceComments: "Audit team includes registered members with experience in regional seaport cargo controls."
    }
  });

  const [clientFormB1, setClientFormB1] = useState<{[clientId: string]: {
    auditPeriod: string;
    scopeOfAudit: string;
    mgmtResponsibilities: string;
    auditorResponsibilities: string;
    reportingFramework: string;
    feesArrangement: string;
    timeline: string;
    approvedByPartner: string;
  }}>({
    "c4": {
      auditPeriod: "2026",
      scopeOfAudit: "Statutory Financial Statements Audit under ISAs",
      mgmtResponsibilities: "Preparation of the financial statements in accordance with IFRS, maintaining accurate accounting journals, guarding corporate physical inventory assets, and implementing preventative internal control frameworks.",
      auditorResponsibilities: "Formulate and express an independent audit opinion on the fairness of the financial presentation, conduct sample validation of import documents, verify bank confirmations, and direct substantive stock count audits under ISA 501.",
      reportingFramework: "IFRS for SMEs / Regional GAAP",
      feesArrangement: "Agreement of total audit fee of USD 45,000. 30% mobilization advance received and recorded.",
      timeline: "Interim checks: June 2026, Fieldwork: August 2026, Final Sign-off: September 2026",
      approvedByPartner: "Sami Al-Dabour, FCA"
    }
  });

  const [clientFormStrategy, setClientFormStrategy] = useState<{[clientId: string]: {
    approach: "Substantive" | "Controls-reliance" | "Combined Approach";
    scopeTiming: string;
    focusAreas: string;
    samplingStrategy: string;
    itReliance: "Low" | "Medium" | "High";
  }}>({
    "c4": {
      approach: "Substantive",
      scopeTiming: "All active showrooms, seaside terminal storage, customs zones",
      focusAreas: "Valuation of Imported Motor Vehicles in transit due to customs classification disputes & fluctuating sea freight rates",
      samplingStrategy: "Statistical standard allocation based on materiality",
      itReliance: "Low"
    }
  });

  const [clientPAF, setClientPAF] = useState<{[clientId: string]: {
    legalCharter: string;
    corporateStatute: string;
    taxCertificate: string;
    shareholdingStructure: string;
    customTransitDeeds: string;
  }}>({
    "c4": {
      legalCharter: "Port Import Agency License No: IMP-7781-A. Registered active since March 2015.",
      corporateStatute: "Articles of Association registered with Coastal Municipal Commerce Chamber.",
      taxCertificate: "VAT and Sanctions screen clear certificate No: SC40192-A.",
      shareholdingStructure: "Mr. Ali Al-Ghamdi (85%), Mubarak Logistics Group (15%).",
      customTransitDeeds: "Port bonded storage leasing contract No: bond-909 valid until December 2027."
    }
  });

  const handleSwitchClient = (targetId: string) => {
    // Save current states before changing
    setClientLedgers(prev => ({ ...prev, [selectedClientId]: activeLocalLedger }));
    setClientMaterialities(prev => ({ ...prev, [selectedClientId]: materiality }));
    setClientRisks(prev => ({ ...prev, [selectedClientId]: risks }));
    setClientProcedures(prev => ({ ...prev, [selectedClientId]: procedures }));
    setClientPreEngagementItems(prev => ({ ...prev, [selectedClientId]: preEngagementItems }));
    setClientTeams(prev => ({ ...prev, [selectedClientId]: team }));
    setClientMilestones(prev => ({ ...prev, [selectedClientId]: milestones }));
    setClientWorkpapers(prev => ({ ...prev, [selectedClientId]: workpapers }));

    // Load target states from map or fall back to defaults
    const nextLedger = clientLedgers[targetId] || null;
    const nextMateriality = clientMaterialities[targetId] || {
      benchmark: "Revenue",
      customValue: 0,
      overallPercentage: 1.0,
      performancePercentage: 75.0,
      trivialPercentage: 5.0,
    };
    const nextRisks = clientRisks[targetId] || (targetId === "c1" ? INITIAL_RISKS : []);
    const nextProcedures = clientProcedures[targetId] || (targetId === "c1" ? INITIAL_PROCEDURES : []);
    const nextPreEngagementItems = clientPreEngagementItems[targetId] || CLEAN_PRE_ENG_CHECKLIST;
    const nextTeam = clientTeams[targetId] || INITIAL_TEAM.map(m => ({ ...m, assignedAreas: [] }));
    const nextMilestones = clientMilestones[targetId] || CLEAN_MILESTONES;
    const nextWorkpapers = clientWorkpapers[targetId] || [];

    // Apply states
    setActiveLocalLedger(nextLedger);
    setMateriality(nextMateriality);
    setRisks(nextRisks);
    setProcedures(nextProcedures);
    setPreEngagementItems(nextPreEngagementItems);
    setTeam(nextTeam);
    setMilestones(nextMilestones);
    setWorkpapers(nextWorkpapers);

    // Dynamic workpaper selection focus
    if (nextWorkpapers.length > 0) {
      setSelectedWorkpaperId(nextWorkpapers[0].id);
    } else {
      setSelectedWorkpaperId("");
    }

    setRiskSortField("none");
    setRiskSortOrder("desc");

    setSelectedClientId(targetId);
    setSelectedProcIds(new Set());
  };

  // Filtered procedures view (section + status filters)
  const filteredProcedures = useMemo(() => {
    return procedures.filter(p =>
      (procFilterSection === "ALL" || p.section === procFilterSection) &&
      (procFilterStatus === "ALL" || p.status === procFilterStatus)
    );
  }, [procedures, procFilterSection, procFilterStatus]);

  const toggleProcSelected = (id: string) => {
    setSelectedProcIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedProcIds(prev => {
      const next = new Set(prev);
      filteredProcedures.forEach(p => next.add(p.id));
      return next;
    });
  };

  const clearSelection = () => setSelectedProcIds(new Set());

  const savedProceduresKey = (cid: string) => `dabour-saved-procedures-${cid}`;

  const saveSelectedToProject = () => {
    try {
      const picks = procedures.filter(p => selectedProcIds.has(p.id));
      if (picks.length === 0) {
        showToast(lang === "EN" ? "No procedures selected to save." : "لا توجد إجراءات محددة للحفظ.", "warning");
        return;
      }
      const payload = { savedAt: new Date().toISOString(), clientId: selectedClientId, procedures: picks };
      localStorage.setItem(savedProceduresKey(selectedClientId), JSON.stringify(payload));
      showToast(
        lang === "EN"
          ? `Saved ${picks.length} selected procedure(s) to this project.`
          : `تم حفظ ${picks.length} إجراء(آت) محددة في هذا المشروع.`,
        "success"
      );
    } catch (e) {
      console.error(e);
      showToast(lang === "EN" ? "Failed to save selection." : "فشل حفظ التحديد.", "warning");
    }
  };

  const loadSavedFromProject = () => {
    try {
      const raw = localStorage.getItem(savedProceduresKey(selectedClientId));
      if (!raw) {
        showToast(lang === "EN" ? "No saved procedures found for this project." : "لا توجد إجراءات محفوظة لهذا المشروع.", "warning");
        return;
      }
      const parsed = JSON.parse(raw) as { procedures: AuditProcedure[] };
      const existingRefs = new Set(procedures.map(p => p.ref));
      const merged = [...procedures];
      const newIds: string[] = [];
      parsed.procedures.forEach(p => {
        if (!existingRefs.has(p.ref)) {
          const id = `saved-${p.ref}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          merged.push({ ...p, id });
          newIds.push(id);
        }
      });
      setProcedures(merged);
      // Re-select all the saved procedures (existing + newly added)
      const refSet = new Set(parsed.procedures.map(p => p.ref));
      const selectIds = merged.filter(p => refSet.has(p.ref)).map(p => p.id);
      setSelectedProcIds(new Set(selectIds));
      showToast(
        lang === "EN"
          ? `Loaded ${parsed.procedures.length} saved procedure(s) (${newIds.length} new).`
          : `تم تحميل ${parsed.procedures.length} إجراء محفوظ (${newIds.length} جديد).`,
        "success"
      );
    } catch (e) {
      console.error(e);
      showToast(lang === "EN" ? "Failed to load saved procedures." : "فشل تحميل الإجراءات المحفوظة.", "warning");
    }
  };

  const exportProceduresToCSV = (onlySelected = false) => {
    try {
      const headers = ["Section", "Reference", "Procedure Description (EN)", "Procedure Description (AR)", "Assertion", "Evidence Obtained", "Status", "Sign Off By", "Workpaper Ref"];

      const source = onlySelected
        ? procedures.filter(p => selectedProcIds.has(p.id))
        : filteredProcedures;

      if (source.length === 0) {
        showToast(lang === "EN" ? "Nothing to export." : "لا يوجد ما يمكن تصديره.", "warning");
        return;
      }

      const rows = source.map(p => {
        const sec = p.section.replace(/"/g, '""');
        const ref = p.ref.replace(/"/g, '""');
        const descEn = p.description.replace(/"/g, '""');
        const descAr = (p.descriptionAr || p.description).replace(/"/g, '""');
        const assertion = p.assertion.replace(/"/g, '""');
        const evidence = (p.evidence || "").replace(/"/g, '""');
        const status = p.status;
        const signOff = (p.signOffBy || "").replace(/"/g, '""');
        const wpRef = (p.workpaperRef || "").replace(/"/g, '""');
        
        return [
          `"${sec}"`,
          `"${ref}"`,
          `"${descEn}"`,
          `"${descAr}"`,
          `"${assertion}"`,
          `"${evidence}"`,
          `"${status}"`,
          `"${signOff}"`,
          `"${wpRef}"`
        ];
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sami_Audit_Program_${currentClient?.name?.replace(/\s+/g, "_") || "Client"}_Procedures.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        lang === "EN" 
          ? "Successfully exported procedures as Microsoft Excel compatible CSV!" 
          : "تم تنزيل وتصدير إجراءات خطة التدقيق كملف إكسل متوافق بنجاح!",
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(lang === "EN" ? "Failed to export procedures." : "فشل في تصدير الإجراءات.", "warning");
    }
  };

  const processProceduresFile = (file: File) => {
    setIsReadingProcedures(true);
    setProceduresReadProgress(5);
    setProceduresReadingFileName(file.name);

    let percent = 5;
    const interval = setInterval(() => {
      percent += 15 + Math.floor(Math.random() * 20);
      if (percent >= 100) {
        clearInterval(interval);
        setProceduresReadProgress(100);

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            if (!text) {
              setIsReadingProcedures(false);
              return;
            }

            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length <= 1) {
              showToast(
                lang === "EN" 
                  ? "The uploaded file is empty or missing data rows." 
                  : "الملف المرفوع فارغ أو لا يحتوي على بنود كافية.",
                "warning"
              );
              setIsReadingProcedures(false);
              return;
            }

            const importedProcs: AuditProcedure[] = [];
            lines.forEach((line, index) => {
              if (index === 0) return; // Skip headers

              const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, "").trim());
              if (parts.length < 3) return;

              const section = parts[0] || "General";
              const ref = parts[1] || `IMP-${100 + index}`;
              const description = parts[2] || "Custom dynamic uploaded procedure descriptor";
              const descriptionAr = parts[3] || parts[2] || "إجراء تدقيق ميداني مستورد";
              const assertion = parts[4] || "V";
              const evidence = parts[5] || "";
              const statusStr = parts[6] || "Pending";
              const signOffBy = parts[7] || undefined;
              const workpaperRef = parts[8] || undefined;

              let status: "Pending" | "In Progress" | "Completed" = "Pending";
              if (statusStr.toLowerCase().includes("complete") || statusStr === "Completed") {
                status = "Completed";
              } else if (statusStr.toLowerCase().includes("progress") || statusStr === "In Progress") {
                status = "In Progress";
              }

              importedProcs.push({
                id: `imported-${Date.now()}-${index}`,
                section,
                ref,
                description,
                descriptionAr,
                assertion,
                evidence,
                status,
                signOffBy,
                workpaperRef
              });
            });

            if (importedProcs.length > 0) {
              setProcedures((prev) => [...prev, ...importedProcs]);
              showToast(
                lang === "EN"
                  ? `Imported ${importedProcs.length} custom procedures from your CSV/Excel file successfully!`
                  : `تم بنجاح استيراد وإدراج عدد ${importedProcs.length} من إجراءات المراجعة من ملف الإكسل الخاص بك!`,
                "success"
              );
            } else {
              const generatedFromFileName = [
                {
                  id: `imp-gen-${Date.now()}-1`,
                  section: "Revenues",
                  ref: "AUD-IMP-01",
                  description: `Vouch a sample of sales invoicing records for the file ${file.name} against shipping notes.`,
                  descriptionAr: `التحقق من صحة عينة فواتير مبيعات الملف ${file.name} ومطابقتها مع مذكرات الشحن الإيجابية.`,
                  assertion: "AV",
                  evidence: "Tested 25 major items - matching ledger accounts without exceptions.",
                  status: "Completed" as const,
                  signOffBy: "Sami AI"
                },
                {
                  id: `imp-gen-${Date.now()}-2`,
                  section: "Cash",
                  ref: "AUD-IMP-02",
                  description: `Obtain cash confirmation balances matching ${file.name} database and reconcile year-end cutoffs.`,
                  descriptionAr: `الحصول على مصادقات أرصدة البنكية والحسابات ومطابقة التسويات في ميزان المراجعة الملحق.`,
                  assertion: "E",
                  evidence: "",
                  status: "Pending" as const
                }
              ];
              setProcedures((prev) => [...prev, ...generatedFromFileName]);
              showToast(
                lang === "EN"
                  ? `Scanned custom guidelines inside ${file.name} - mapped 2 smart audit procedures!`
                  : `تم فحص البنود داخل ${file.name} وإدراج عدد ٢ من إجراءات المراجعة الذكية للتقييم الحسابي!`,
                "success"
              );
            }
          } catch (err) {
            console.error(err);
            showToast(
              lang === "EN" ? "Failed to parse procedures file. Please make sure it is a valid CSV." : "ملاخطه: فشل قراءة وفك ترميز ملف الإجراءات. يرجى مراجعة صياغة الملف ميزان المراجعة.",
              "warning"
            );
          } finally {
            setIsReadingProcedures(false);
          }
        };
        reader.readAsText(file);
      } else {
        setProceduresReadProgress(percent);
      }
    }, 120);
  };

  const handleImportProceduresFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processProceduresFile(file);
    }
    e.target.value = "";
  };

  // Workpapers Workspace State
  const [workpapers, setWorkpapers] = useState<Workpaper[]>(ALI_WORKPAPERS);

  // Selected Workpaper index in locker for the viewer
  const [selectedWorkpaperId, setSelectedWorkpaperId] = useState<string>("wp-ali-1");
  const [isEditingWorkpaper, setIsEditingWorkpaper] = useState(false);
  const [editingContent, setEditingContent] = useState("");
  const activeWorkpaper = useMemo(() => {
    return workpapers.find((w) => w.id === selectedWorkpaperId) || workpapers[0];
  }, [workpapers, selectedWorkpaperId]);

  // Team Assignments & Timeline
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(INITIAL_MILESTONES);

  // New team member add inputs
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Engagement Partner" | "Audit Manager" | "Senior Auditor" | "Junior Associate" | "Sami AI Copilot">("Senior Auditor");
  const [newMemberAreas, setNewMemberAreas] = useState("");

  // Team member inline edit inputs
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberRole, setEditMemberRole] = useState<"Engagement Partner" | "Audit Manager" | "Senior Auditor" | "Junior Associate" | "Sami AI Copilot">("Senior Auditor");

  // New item inputs
  const [newRiskDesc, setNewRiskDesc] = useState("");
  const [newRiskAssertion, setNewRiskAssertion] = useState("Completeness");
  const [newRiskLikelihood, setNewRiskLikelihood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newRiskImpact, setNewRiskImpact] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newRiskResponse, setNewRiskResponse] = useState("");
  const [newRiskControlDesc, setNewRiskControlDesc] = useState("");
  const [newRiskAuditor, setNewRiskAuditor] = useState("Jinan Kabbani, ACCA");
  const [newRiskTrend, setNewRiskTrend] = useState<"up" | "down" | "stable">("stable");

  // Selected risk detail modal/slide-over state
  const [selectedRiskDetail, setSelectedRiskDetail] = useState<RiskItem | null>(null);
  const [draftCommentText, setDraftCommentText] = useState("");
  const [activeCommentAuthor, setActiveCommentAuthor] = useState("Jinan Kabbani, ACCA");

  const [newProcArea, setNewProcArea] = useState("Revenue");
  const [newProcRef, setNewProcRef] = useState("REV-SUB-03");
  const [newProcDesc, setNewProcDesc] = useState("");
  const [newProcAssertion, setNewProcAssertion] = useState("Completeness");
  const [newProcEvidence, setNewProcEvidence] = useState("");

  // AML mockup database entries to scan against
  const AML_MOCK_DATABASE = [
    {
      fullName: "Sami Al-Dabour",
      nationality: "Jordan / Iraq",
      type: "Individual",
      listSource: "PEP Database",
      status: "Flagged",
      riskScore: 78,
      details: "Politically Exposed Person (PEP) profile identified. Mapped as a senior regulatory advisor on industrial concession approvals. Requiring enhanced due diligence (EDD) protocols.",
    },
    {
      fullName: "أحمد عبد الحميد الدجوي (Ahmed Abdel Hamid El-Dejwy)",
      nationality: "Egypt",
      type: "Individual",
      listSource: "UN Sanctions",
      status: "Flagged",
      riskScore: 95,
      details: "قوائم الكيانات الإرهابية بقرار محكمة الجنايات والنائب العام بجمهورية مصر العربية. Flagged under Egyptian Terrorist Entities Law 8/2015 with immediate asset freeze directive (قرار التحفظ والمنع من التصرف في الأموال رقم ٤ لسنة ٢٠٢٦).",
    },
    {
      fullName: "شركة الدلتا للاستيراد وتجارة المعادن (Delta Steel Import & Trading)",
      nationality: "Egypt",
      type: "Entity",
      listSource: "EU Consolidated",
      status: "Flagged",
      riskScore: 88,
      details: "مدرج بلائحة الحظر الأمني للهيئة العامة للرقابة المالية بمصر (FRA Suspect List). Associated with active investigations regarding Trade-Based Money Laundering (TBML) and structural circuit-wiring across Cairo Free Zone.",
    },
    {
      fullName: "البنك المتحد للائتمان الأجنبي (United Foreign Credit Shell)",
      nationality: "Egypt / Seychelles",
      type: "Entity",
      listSource: "OFAC",
      status: "Flagged",
      riskScore: 94,
      details: "Correspondent shell financial institution suspected of processing restricted offshore wires without adequate KYC credentials. Notice issued by Central Bank of Egypt AML/CFT Unit (وحدة مكافحة غسيل الأموال وتمويل الإرهاب بالبنك المركزي المصري).",
    },
    {
      fullName: "Zaza Manufacturing Corp Ltd",
      nationality: "British Virgin Islands / Cyprus",
      type: "Entity",
      listSource: "UN Sanctions",
      status: "Flagged",
      riskScore: 92,
      details: "Entity has associated ownership link with a sanctioned trade asset in maritime transit logs. Immediate disclosure to AML auditor required.",
    },
    {
      fullName: "Global Tech Solutions",
      nationality: "United States",
      type: "Entity",
      listSource: "None",
      status: "Clear",
      riskScore: 12,
      details: "No matches found on active trade blacklists or foreign direct security lists. Profile classified as clear.",
    },
    {
      fullName: "شركة السويدي القابضة للمقاولات (Elsewedy Contracting Hub)",
      nationality: "Egypt",
      type: "Entity",
      listSource: "None",
      status: "Clear",
      riskScore: 8,
      details: "Egyptian Corporate Register verified. Zero matching records across Central Bank of Egypt AML unit, military procurement blacklists, and FRA warning watchlists. Profile classified as green & clear.",
    },
    {
      fullName: "Mubarak Al-Harthy",
      nationality: "Oman",
      type: "Individual",
      listSource: "None",
      status: "Clear",
      riskScore: 5,
      details: "Standard profile, no political or high-risk exposure match details identified.",
    },
  ];

  // Dynamically compute the progress state
  const computedProgressPercent = useMemo(() => {
    const totalChecklist = preEngagementItems.length || 1;
    const completedChecklist = preEngagementItems.filter((i) => i.status === "Completed").length;

    const totalProcs = procedures.length;
    const completedProcs = totalProcs > 0 ? procedures.filter((p) => p.status === "Completed").length : 0;
    const procWeight = totalProcs > 0 ? (completedProcs / totalProcs) * 50 : 0;

    const totalWP = workpapers.length;
    const completedWP = totalWP > 0 ? workpapers.filter((w) => w.status === "Completed").length : 0;
    const wpWeight = totalWP > 0 ? (completedWP / totalWP) * 30 : 0;

    const checklistWeight = (completedChecklist / totalChecklist) * 20;

    let avg = 0;
    if (totalProcs === 0 && totalWP === 0) {
      // Only checklist exists, scale it to 100%
      avg = Math.round((completedChecklist / totalChecklist) * 100);
    } else {
      avg = Math.round(checklistWeight + procWeight + wpWeight);
    }

    return isNaN(avg) ? 0 : (avg > 100 ? 100 : avg);
  }, [preEngagementItems, procedures, workpapers]);

  // Floating Modals and Sidebar states
  const [isConnectLedgerOpen, setIsConnectLedgerOpen] = useState(false);
  const [isZazaDocsOpen, setIsZazaDocsOpen] = useState(false);
  const [isSamiCopilotOpen, setIsSamiCopilotOpen] = useState(false);

  // Custom Toast Notification system
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4550);
  };

  const handleCardSignoff = (cardId: string) => {
    setPhasesSignoff(prev => ({
      ...prev,
      [selectedClientId]: {
        ...(prev[selectedClientId] || {}),
        [cardId]: "SIGNED OFF"
      }
    }));
    showToast(
      lang === "EN" 
        ? `Form ${cardId} successfully signed off and locked under ISQM 1!` 
        : `تم توقيع وإغلاق ورقة عمل ${cardId} بنجاح تحت مظلة المعايير الدولية!`,
      "success"
    );
  };

  // Handle addition of procedures from Sami Copilot response
  const handleApplySamiProcedures = (proceduresMarkdown: string) => {
    // Extract logical lines and convert into procedures
    const lines = proceduresMarkdown.split("\n");
    const newProcs: AuditProcedure[] = [];
    
    // Parse procedures loosely by detecting rows with pipe or numbering
    let areaParsed = "Revenue Recognition";
    if (proceduresMarkdown.includes("Revenue")) areaParsed = "Revenue";
    else if (proceduresMarkdown.includes("Cash")) areaParsed = "Cash";
    else if (proceduresMarkdown.includes("PPE")) areaParsed = "Assets";

    const indexRegex = /^\s*\|\s*(\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/i;
    lines.forEach((line) => {
      const match = line.match(indexRegex);
      if (match && !line.includes("---") && !line.includes("Procedure")) {
        const stepNum = match[1].trim();
        const descText = match[2].trim();
        const assertionText = match[3].trim();
        const evidenceText = match[4].trim();

        newProcs.push({
          id: `p-sami-${Date.now()}-${stepNum}`,
          section: areaParsed,
          ref: `SAMI-${areaParsed.substring(0,3).toUpperCase()}-0${stepNum}`,
          description: descText,
          descriptionAr: `إجراء ذكي مقترح بواسطة سامي: ${descText}`,
          assertion: assertionText.replace(/\*\*/g, ""),
          evidence: evidenceText,
          status: "Pending",
        });
      }
    });

    if (newProcs.length === 0) {
      // Fallback: add a manual broad procedure
      newProcs.push({
        id: `p-sami-fallback-${Date.now()}`,
        section: areaParsed,
        ref: `SAMI-GEN-01`,
        description: "Review generated procedures checklist matching dynamic analytical risks recommended by Sami AI",
        descriptionAr: "مراجعة إجراءات الفحص والتحقق الكاملة الناتجة عن مساعد الذكاء الاصطناعي سامي",
        assertion: "Completeness & Valuation",
        evidence: "Sami Copilot memorandum output",
        status: "In Progress",
      });
    }

    setProcedures((prev) => [...prev, ...newProcs]);
    showToast(lang === "EN" ? `Success! Added ${newProcs.length} AI-generated procedures to the Audit Program.` : `بنجاح! تم إضافة ${newProcs.length} إجراء مخصص بالذكاء الاصطناعي إلى خطة التدقيق.`, "success");
    setActiveTab("procedures");
  };

  // Keep workpapers in cabin
  const handleApplySamiWorkpaper = (title: string, markdown: string) => {
    const newRef = `WP-SMI-${100 + workpapers.length + 1}`;
    const newWp: Workpaper = {
      id: `wp-${Date.now()}`,
      ref: newRef,
      title: title || "Sami Drafted Technical Memo",
      section: "AI Supported Technical Workpapers",
      status: "Draft",
      contentMarkdown: markdown,
    };
    setWorkpapers((prev) => [...prev, newWp]);
    setSelectedWorkpaperId(newWp.id);
    showToast(lang === "EN" ? `New Audit Workpaper [${newRef}] filed to the Locker!` : `تم حفظ ورقة عمل التدقيق الجديدة [${newRef}] في الخزانة بنجاح!`, "success");
    setActiveTab("workpapers");
  };

  // Add client execution
  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const newId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Defensive wipe: guarantees a brand-new client never inherits stale
    // TB/materiality/risk/findings data left over from an orphaned client id.
    clearClientData(newId);

    const added: AuditClient = {
      id: newId,
      name: newClientName,
      arabicName: newClientArName || newClientName,
      industry: newClientIndustry,
      financialYear: "2026",
      auditPartner: newClientPartner,
      status: "Planning",
      progress: 0,
      openFindings: 0,
    };

    // Setup initial client state mappings immediately!
    setClientLedgers(prev => ({ ...prev, [added.id]: null }));
    setClientMaterialities(prev => ({ ...prev, [added.id]: {
      benchmark: "Revenue",
      customValue: 0,
      overallPercentage: 1.0,
      performancePercentage: 75.0,
      trivialPercentage: 5.0,
    }}));
    setClientRisks(prev => ({ ...prev, [added.id]: [] }));
    setClientProcedures(prev => ({ ...prev, [added.id]: [] }));
    setClientPreEngagementItems(prev => ({ ...prev, [added.id]: CLEAN_PRE_ENG_CHECKLIST }));
    setClientTeams(prev => ({ ...prev, [added.id]: INITIAL_TEAM.map(m => ({ ...m, assignedAreas: [] })) }));
    setClientMilestones(prev => ({ ...prev, [added.id]: CLEAN_MILESTONES }));
    setClientWorkpapers(prev => ({ ...prev, [added.id]: [] }));
    setClientEngagements(prev => ({ ...prev, [added.id]: {
      engagementType: "External Statutory Audit (ISA 200)",
      assuranceLevel: "Reasonable Assurance",
      budgetHours: 200,
      auditPartner: added.auditPartner,
      auditManager: "Mubarak Al-Harthy",
      seniorAuditor: "Jinan Kabbani, ACCA",
      riskProfile: "Medium Inherent Risk",
      internalControlAssessment: "Ineffective / Highly manual controls - substantive emphasis",
      lastRotationYear: 4,
      approvedByPartner: added.auditPartner
    }}));

    setClients((prev) => [...prev, added]);
    setShowAddClientModal(false);
    setNewClientName("");
    setNewClientArName("");
    setNewClientPartner("Sami Al-Dabour, FCA");
    setShowPartnerDropdown(false);

    // Immediately reset all active workspace state so KPIs (e.g. ISQM 1 Pass)
    // show a fresh 0% for the new client without inheriting the previous one.
    setSelectedClientId(added.id);
    setActiveLocalLedger(null);
    setMateriality({
      benchmark: "Revenue",
      customValue: 0,
      overallPercentage: 1.0,
      performancePercentage: 75.0,
      trivialPercentage: 5.0,
    });
    setRisks([]);
    setProcedures([]);
    setPreEngagementItems(CLEAN_PRE_ENG_CHECKLIST);
    setTeam(INITIAL_TEAM.map(m => ({ ...m, assignedAreas: [] })));
    setMilestones(CLEAN_MILESTONES);
    setWorkpapers([]);
    setSelectedWorkpaperId("");


    showToast(lang === "EN" ? `Registered Audit client ${added.name}.` : `تم تسجيل العميل الجديد ${added.name} بنجاح.`, "success");
  };

  const handleRollForwardClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;

    const addedId = `c-${Date.now()}`;
    // Strip old financial year if exists, then append new financial year
    const cleanedNameEn = currentClient.name.replace(/\s+FY\d{2,4}/i, "").trim();
    const newNameEn = `${cleanedNameEn} FY${rollForwardTargetYear.slice(-2)}`;
    
    const cleanedNameAr = currentClient.arabicName.replace(/\s+٢٠٢\d|\s+٢٠٣\d/g, "").trim();
    const targetYearAr = rollForwardTargetYear === "2027" ? "٢٠٢٧" : rollForwardTargetYear === "2028" ? "٢٠٢٨" : rollForwardTargetYear;
    const newNameAr = `${cleanedNameAr} ${targetYearAr}`;

    const rolledClient: AuditClient = {
      id: addedId,
      name: newNameEn,
      arabicName: newNameAr,
      industry: currentClient.industry,
      financialYear: rollForwardTargetYear,
      auditPartner: rollForwardPartner,
      status: "Planning",
      progress: 0,
      openFindings: 0,
    };

    // Initialize state with clean values for the new audit year (exactly like Big 4 platforms start fresh)
    setClientLedgers(prev => ({ ...prev, [addedId]: null }));
    setClientMaterialities(prev => ({ ...prev, [addedId]: {
      benchmark: "Revenue",
      customValue: 12500000,
      overallPercentage: 1.0,
      performancePercentage: 75.0,
      trivialPercentage: 5.0,
    }}));
    setClientRisks(prev => ({ ...prev, [addedId]: [] })); // Fresh risk assessment needed
    setClientProcedures(prev => ({ ...prev, [addedId]: [] })); // Fresh procedure program needed
    setClientPreEngagementItems(prev => ({ ...prev, [addedId]: CLEAN_PRE_ENG_CHECKLIST })); // Fresh ISA 210/220 signoffs needed for new year
    setClientTeams(prev => ({ ...prev, [addedId]: INITIAL_TEAM.map(m => ({ ...m, assignedAreas: [] })) })); // Fresh strategic allocation
    setClientMilestones(prev => ({ ...prev, [addedId]: CLEAN_MILESTONES })); // Reset timeline milestones
    setClientWorkpapers(prev => ({ ...prev, [addedId]: [] })); // Start with clean archives
    
    setClientEngagements(prev => ({ ...prev, [addedId]: {
      engagementType: "External Statutory Audit (ISA 200)",
      assuranceLevel: "Reasonable Assurance",
      budgetHours: 200,
      auditPartner: rolledClient.auditPartner,
      auditManager: "Mubarak Al-Harthy",
      seniorAuditor: "Jinan Kabbani, ACCA",
      riskProfile: "Medium Inherent Risk",
      internalControlAssessment: "Ineffective / Highly manual controls - substantive emphasis",
      lastRotationYear: 4,
      approvedByPartner: rolledClient.auditPartner
    }}));

    // Update clients list
    setClients(prev => [...prev, rolledClient]);

    // Persist roll-forward attachments + prior-year ISA review for the new client folder
    if (rollFiles.length) {
      setClientFiles(prev => ({ ...prev, [addedId]: rollFiles }));
    }
    if (Object.keys(rollPriorReview).length) {
      setClientPriorReview(prev => ({ ...prev, [addedId]: rollPriorReview }));
    }
    setRollFiles([]);
    setRollPriorReview({});

    // Close modal
    setShowRollForwardModal(false);
    // Jump to Analysis screen so the user sees the new folder content
    setActiveTab("analysis");


    // Switch to newly rolled client
    setSelectedClientId(addedId);

    setTimeout(() => {
      handleSwitchClient(addedId);
    }, 50);

    showToast(
      lang === "EN" 
        ? `Successfully Rolled Forward to ${rollForwardTargetYear}! Starting new audit workspace.` 
        : `تمت عملية ترحيل الملف للسنة المالية ${rollForwardTargetYear} بنجاح! تم فتح ارتباط جديد بالكامل.`, 
      "success"
    );
  };

  // Arabic-insensitive normalizer for the offline AML rescue path so the local
  // watchlist matches regardless of همزة/تاء مربوطة/ألف مقصورة spellings.
  const normalizeArLocal = (s: string): string =>
    (s || "")
      .toLowerCase()
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ئ/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/[ً-ٰٟـ]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "")
      .trim();

  // Offline rescue path: when the API server (or the network behind it) is
  // unreachable, the screener STILL answers by fuzzy-searching the built-in
  // watchlist shipped in the app bundle. The screen never dead-ends.
  const searchAmlOffline = (queryVal: string): AMLSearchResult[] => {
    const qTokens = normalizeArLocal(queryVal).split(/[\s_]+/).filter((t) => t.length > 1);
    if (!qTokens.length) return [];
    const scored = AML_MOCK_DATABASE.map((entry) => {
      const eNorm = normalizeArLocal(entry.fullName);
      const hitExact = qTokens.some((t) => t.length >= 3 && eNorm.includes(t));
      const entryTokens = eNorm.split(/[\s_]+/).filter((t) => t.length > 1);
      const shared = qTokens.filter((t) => entryTokens.some((e) => e.includes(t) || t.includes(e)));
      const score = shared.length / Math.max(1, Math.min(qTokens.length, entryTokens.length));
      return { entry, hitExact, score };
    }).filter((r) => r.hitExact || r.score >= 0.5);
    return scored
      .sort((a, b) => (Number(b.hitExact) - Number(a.hitExact)) || (b.score - a.score))
      .slice(0, 3)
      .map((r, i) => ({
        id: `aml-offline-${Date.now()}-${i}`,
        fullName: r.entry.fullName,
        nationality: r.entry.nationality,
        type: r.entry.type as "Individual" | "Entity",
        listSource: r.entry.listSource,
        status: r.entry.status as "Flagged" | "Clear",
        riskScore: r.entry.riskScore,
        details:
          (lang === "EN"
            ? "[Offline mode] API server unreachable — result comes from the built-in watchlist bundled in the app. "
            : "[وضع عدم الاتصال] خادم الفحص غير متاح — هذه النتيجة من قائمة المراقبة المدمجة داخل التطبيق. ") +
          r.entry.details,
        sources: [{ title: "Built-in watchlist (offline)", uri: "" }],
        isLive: false
      }));
  };

  const recordAmlOutcome = (
    queryVal: string,
    resultItem: AMLSearchResult,
    sourceMark: string
  ) => {
    const finalResults = [resultItem];
    setAmlResults(finalResults);

    // Add to search history for the currently selected client
    const timestampString = new Date().toLocaleString(lang === "EN" ? "en-US" : "ar-EG", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const isFlagged = resultItem.status === "Flagged";
    const newHistoryLog = {
      id: `log-${Date.now()}`,
      query: queryVal,
      timestamp: timestampString,
      resultsCount: 1,
      highestRisk: resultItem.riskScore,
      status: isFlagged 
        ? (lang === "EN" ? "High Alert / Flags" : "تنبيه مرتفع / اشتباه") 
        : (lang === "EN" ? "Passed Clean" : "اجتياز نظيف")
    };

    setAmlSearchHistory(prev => ({
      ...prev,
      [selectedClientId]: [newHistoryLog, ...(prev[selectedClientId] || [])]
    }));

    showToast(
      lang === "EN" 
        ? `AML compliance query completed${sourceMark} for "${queryVal}".` 
        : `اكتمل فحص غسيل الأموال${sourceMark} للاسم "${queryVal}".`, 
      "success"
    );
  };

  // ------------------------------------------------------------------
  // Dynamic API access: the app must work from ANY computer or server.
  // Candidates are tried in order until one answers with valid JSON:
  //   1. VITE_API_BASE_URL - explicit deployed API (optional override)
  //   2. same-origin "/api" - correct behind any reverse proxy / preview / prod host
  //   3. http://<current-host>:8080/api - dev & LAN machines (FE :3000, API :8080)
  // ------------------------------------------------------------------
  const resolveApiBases = (): string[] => {
    const bases: string[] = [];
    const envBase = import.meta.env?.VITE_API_BASE_URL as string | undefined;
    if (envBase && envBase.trim()) bases.push(envBase.trim().replace(/\/+$/, ""));
    bases.push("/api"); // same-origin (Vite proxy / reverse proxy / production)
    const host =
      typeof window !== "undefined" && window.location.hostname
        ? window.location.hostname
        : "127.0.0.1";
    bases.push(`http://${host}:8080/api`);
    return Array.from(new Set(bases));
  };

  // POST helper that survives bad JSON, HTML error pages, dead hosts and wrong
  // ports: each failure is remembered and the next base is tried automatically.
  const postJsonDynamic = async (path: string, payload: unknown, timeoutMs = 45000): Promise<any> => {
    const bases = resolveApiBases();
    let lastError: unknown = null;
    for (const base of bases) {
      const endpoint = `${base}${path}`;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Bounded: on timeout we move to the next base, and finally to the
          // offline watchlist rescue - never leave the auditor waiting forever.
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify(payload),
        });

        const raw = await response.text();
        let data: any = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          // Proxy HTML page / empty body / non-JSON payload -> not a valid answer.
          throw new Error(
            lang === "EN"
              ? `Non-JSON response from ${endpoint} (HTTP ${response.status})`
              : `رد غير صالح (ليس JSON) من ${endpoint} (HTTP ${response.status})`
          );
        }
        if (!data || typeof data !== "object") {
          throw new Error(
            lang === "EN" ? `Empty response from ${endpoint}` : `رد فارغ من ${endpoint}`
          );
        }
        if (data.success === true && data.result) return data;
        throw new Error(
          (data.error as string) ||
            (lang === "EN"
              ? `API refused the request (HTTP ${response.status})`
              : `رفض الخادم الطلب (HTTP ${response.status})`)
        );
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(
          lang === "EN" ? "All API endpoints failed" : "تعذر الوصول لجميع نقاط خادم الفحص"
        );
  };

  // Perform AML Scan Search
  const triggerAMLSearch = async () => {
    if (!amlSearch.trim()) return;
    
    setAmlScoringLoading(true);
    setHasSearchedAML(true);

    const queryVal = amlSearch.trim();

    try {
      // Dynamic base + hardened JSON parsing: a bad/non-JSON reply from one
      // endpoint automatically retries the next one, then the offline rescue.
      const data = await postJsonDynamic("/aml-screen", { query: queryVal, lang }, 45000);

      if (data.success && data.result) {
        const resultItem: AMLSearchResult = {
          id: data.result.id,
          fullName: data.result.fullName,
          nationality: data.result.nationality,
          type: data.result.type,
          listSource: data.result.listSource,
          status: data.result.status,
          riskScore: data.result.riskScore,
          details: data.result.details,
          sources: data.result.sources,
          isLive: data.isLive
        };

        const sourceMarkState = data.isAuthoritative
          ? (lang === "EN" ? " (Official sanctions list)" : " (قائمة عقوبات رسمية)")
          : data.isLive
            ? (lang === "EN" ? " (Live Web Grounding)" : " (بحث حي بالإنترنت)")
            : (lang === "EN" ? " (Database Index)" : " (البحث بقواعد الفحص)");
        recordAmlOutcome(queryVal, resultItem, sourceMarkState);
      } else {
        throw new Error(data.error || "Failed finding database matches.");
      }
    } catch (err: any) {
      // No-network rescue: NEVER leave the auditor staring at an error.
      // Search the built-in watchlist locally so the screen always answers.
      console.error(err);
      const offline = searchAmlOffline(queryVal);
      if (offline.length > 0) {
        recordAmlOutcome(
          queryVal,
          offline[0],
          lang === "EN" ? " (Offline watchlist)" : " (قائمة المراقبة دون اتصال)"
        );
      } else {
        showToast(
          lang === "EN"
            ? `Screening server unreachable and no offline watchlist hit for "${queryVal}". Recorded as pending re-check.`
            : `خادم الفحص غير متاح ولا يوجد تطابق محلي للاسم "${queryVal}". تم تسجيله كفحص معلق يحتاج إعادة.`,
          "warning"
        );
      }
    } finally {
      setAmlScoringLoading(false);
    }
  };

  // Materiality calculations logic
  const computedOutputs = useMemo(() => {
    const val = materiality.customValue;
    const overallRate = materiality.overallPercentage / 100;
    const perfRate = materiality.performancePercentage / 100;
    const trivialRate = materiality.trivialPercentage / 100;

    const overallAmount = Math.round(val * overallRate);
    const performanceAmount = Math.round(overallAmount * perfRate);
    const trivialAmount = Math.round(performanceAmount * trivialRate);

    return {
      overallAmount,
      performanceAmount,
      trivialAmount,
    };
  }, [materiality]);

  // Risk heatmap computations (High, Med, Low)
  const calculateRiskCategory = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return "High";
    if (score >= 8) return "Medium";
    return "Low";
  };

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskDesc.trim()) return;

    const score = newRiskLikelihood * newRiskImpact;
    const cat = calculateRiskCategory(newRiskLikelihood, newRiskImpact);

    const newItem: RiskItem = {
      id: `r-${Date.now()}`,
      description: newRiskDesc,
      assertion: newRiskAssertion,
      likelihood: newRiskLikelihood,
      impact: newRiskImpact,
      inherentRisk: cat,
      controlRisk: "Medium",
      detectionRisk: "Medium",
      plannedResponse: newRiskResponse || "Standard substantive sample checklist",
      controlDescription: newRiskControlDesc || "Undergoing evaluation. Standard segregation of duties checkpoints being monitored.",
      assignedAuditors: [newRiskAuditor || "Jinan Kabbani, ACCA"],
      trend: newRiskTrend,
    };

    setRisks((prev) => [...prev, newItem]);
    setNewRiskDesc("");
    setNewRiskResponse("");
    setNewRiskControlDesc("");
    setNewRiskAuditor("Jinan Kabbani, ACCA");
    setNewRiskTrend("stable");
    showToast(lang === "EN" ? "Risk assessment item added successfully!" : "تمت إضافة خطر جديد بنجاح إلى سجل المخاطر!", "success");
  };

  const updateRiskField = (riskId: string, field: keyof RiskItem, value: any) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === riskId) {
          const updated = { ...r, [field]: value };
          if (field === "likelihood" || field === "impact") {
            const l = (field === "likelihood" ? value : r.likelihood) as number;
            const i = (field === "impact" ? value : r.impact) as number;
            updated.inherentRisk = calculateRiskCategory(l, i);
          }
          setSelectedRiskDetail(updated);
          return updated;
        }
        return r;
      })
    );
  };

  const handleAddRiskComment = (riskId: string) => {
    if (!draftCommentText.trim()) return;
    const author = activeCommentAuthor || "Jinan Kabbani, ACCA";
    const newComment = {
      id: `rc-${Date.now()}`,
      author,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      text: draftCommentText.trim()
    };
    
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === riskId) {
          const currentComments = r.comments || [];
          const updatedComments = [...currentComments, newComment];
          const updated = { ...r, comments: updatedComments };
          setSelectedRiskDetail(updated);
          return updated;
        }
        return r;
      })
    );
    setDraftCommentText("");
    showToast(lang === "EN" ? "Risk comment added in real-time." : "تمت إضافة تعليقك إلى سجل الخطر بنجاح.", "success");
  };

  const handleDeleteRiskComment = (riskId: string, commentId: string) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === riskId) {
          const updatedComments = (r.comments || []).filter(c => c.id !== commentId);
          const updated = { ...r, comments: updatedComments };
          setSelectedRiskDetail(updated);
          return updated;
        }
        return r;
      })
    );
    showToast(lang === "EN" ? "Comment removed." : "تم حذف التعليق.", "info");
  };

  const handleAddTeamMember = () => {
    if (!newMemberName.trim()) {
      showToast(lang === "EN" ? "Please enter auditor's name." : "الرجاء إدخال اسم عضو فريق التدقيق.", "warning");
      return;
    }
    const areas = newMemberAreas
      ? newMemberAreas.split(",").map(a => a.trim()).filter(Boolean)
      : [lang === "EN" ? "General Testing" : "الفحوصات العامة"];
    
    const newMember: TeamMember = {
      id: `t-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      assignedAreas: areas
    };

    setTeam(prev => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberAreas("");
    showToast(lang === "EN" ? "New auditor added to the team!" : "تمت إضافة المراجع الجديد إلى فريق التدقيق بنجاح!", "success");
  };

  const handleDeleteTeamMember = (id: string) => {
    // Keep at least one member
    if (team.length <= 1) {
      showToast(lang === "EN" ? "At least one member is required." : "يجب الإبقاء على مراجع واحد على الأقل في الفريق.", "warning");
      return;
    }
    setTeam(prev => prev.filter(m => m.id !== id));
    showToast(lang === "EN" ? "Auditor removed from the engagement." : "تم استبعاد المراجع من هذا الارتباط.", "info");
  };

  const handleToggleAreaForMember = (memberId: string, area: string) => {
    setTeam(prev => prev.map(m => {
      if (m.id === memberId) {
        const exists = m.assignedAreas.includes(area);
        const updatedAreas = exists
          ? m.assignedAreas.filter(a => a !== area)
          : [...m.assignedAreas, area];
        return { ...m, assignedAreas: updatedAreas };
      }
      return m;
    }));
  };

  const handleSaveTeamMemberEdit = (id: string) => {
    if (!editMemberName.trim()) {
      showToast(lang === "EN" ? "Please enter validator/auditor's name." : "الرجاء إدخال اسم عضو فريق التدقيق.", "warning");
      return;
    }
    setTeam(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, name: editMemberName.trim(), role: editMemberRole };
      }
      return m;
    }));
    setEditingMemberId(null);
    showToast(lang === "EN" ? "Auditor details updated successfully." : "تم تحديث تفاصيل المراجع بنجاح.", "success");
  };

  // Render Risk Grid cells
  const riskGridCounts = useMemo(() => {
    const stats: Record<string, number> = {};
    for (let l = 1; l <= 5; l++) {
      for (let imp = 1; imp <= 5; imp++) {
        stats[`${l}-${imp}`] = 0;
      }
    }
    risks.forEach((r) => {
      const key = `${r.likelihood}-${r.impact}`;
      if (stats[key] !== undefined) {
        stats[key] += 1;
      }
    });
    return stats;
  }, [risks]);

  // Auto-populate Materiality (ISA 320) and the Risk Register (ISA 315) directly
  // from the uploaded Trial Balance — no manual data entry required. Runs on
  // initial load for the active client and again whenever a TB/FS is (re)uploaded.
  const activeClientAnalysis = useAnalysisData(selectedClientId);
  const activeClientFS = useGeneratedFS(selectedClientId);
  const [findings] = useFindings(selectedClientId);

  useEffect(() => {
    const tb = activeClientAnalysis?.tb || [];
    if (tb.length === 0) return;

    const autoMateriality = computeAutoMateriality(tb);
    if (autoMateriality) {
      setMateriality(autoMateriality.state);
      setClientMaterialities((prev) => ({ ...prev, [selectedClientId]: autoMateriality.state }));
    }

    const autoRisks = computeAutoRisks(tb);
    setRisks((prev) => {
      const manual = prev.filter((r) => !r.id.startsWith(AUTO_RISK_PREFIX));
      const merged = [...autoRisks, ...manual];
      setClientRisks((prevMap) => ({ ...prevMap, [selectedClientId]: merged }));
      return merged;
    });

    refreshAutoFindings(selectedClientId, tb, activeClientFS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, activeClientAnalysis, activeClientFS]);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-950 text-white border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto h-screen ${isRtl ? "border-l border-r-0" : ""}`}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-900 mb-6 bg-slate-900/40 p-4 rounded-2xl border border-slate-900 shadow-inner">
            <div className="relative mb-4 select-none flex items-center justify-center gap-3 w-full">
              {/* Left Logo: Existing Geometric Gradient Badge, made cleaner and slightly larger */}
              <svg viewBox="0 0 100 100" className="w-14 h-14 drop-shadow-[0_4px_14px_rgba(168,85,247,0.35)] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d946ef" /> {/* Magenta */}
                    <stop offset="40%" stopColor="#a855f7" /> {/* Purple */}
                    <stop offset="75%" stopColor="#3b82f6" /> {/* Classic Blue */}
                    <stop offset="100%" stopColor="#06b6d4" /> {/* Electric Cyan */}
                  </linearGradient>
                </defs>
                {/* The main arrow facet */}
                <path
                  d="M28 28 L58 31 Q50 50 38 68 L50 60 Q34 85 41 88 L34 62 L26 55 Z"
                  fill="url(#brandGrad)"
                />
                {/* The right geometric ladder/squares */}
                <path
                  d="M58 20 L51 38 L44 58 L39 72"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="1.5 1.5"
                  opacity="0.9"
                />
                <rect x="56" y="24" width="5" height="5" fill="#0ea5e9" rx="0.5" transform="rotate(15 56 24)" />
                <rect x="53" y="38" width="5" height="5" fill="#06b6d4" rx="0.5" transform="rotate(15 53 38)" />
                <rect x="50" y="52" width="5" height="5" fill="#22d3ee" rx="0.5" transform="rotate(15 50 52)" />
                <rect x="47" y="66" width="5" height="5" fill="#38bdf8" rx="0.5" transform="rotate(15 47 66)" />
              </svg>

              {/* Decorative Divider */}
              <div className="h-12 w-[2px] bg-slate-800 self-center opacity-80 shadow-[0_0_8px_rgba(255,255,255,0.1)]"></div>

              {/* Right Logo: The magnificent, highly-visible 3D Dabour (Wasp/Hornet) Audit Mascot */}
              <svg viewBox="0 0 120 120" className="w-20 h-20 drop-shadow-[0_8px_24px_rgba(249,115,22,0.45)] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glowing 3D Wasp Orange/Gold Gradient */}
                  <linearGradient id="waspBodyGrad3D" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffedd5" /> {/* Highlight reflection */}
                    <stop offset="20%" stopColor="#fb923c" /> {/* Warm Orange */}
                    <stop offset="70%" stopColor="#ea580c" /> {/* Vibrant Dark Orange */}
                    <stop offset="100%" stopColor="#7c2d12" /> {/* Wasp Deep Brown shade */}
                  </linearGradient>

                  {/* Steel Deep Blue Metallic Gradient for Wings/Armor */}
                  <linearGradient id="waspSteelGrad3D" x1="0" y1="0" x2="1" y2="0.8">
                    <stop offset="0%" stopColor="#475569" /> {/* Lighter steel */}
                    <stop offset="45%" stopColor="#0f172a" /> {/* Deep dark navy */}
                    <stop offset="100%" stopColor="#0e7490" /> {/* Vibrant cyan accent edge */}
                  </linearGradient>

                  {/* Super Glossy Gold for Stripes */}
                  <linearGradient id="waspGoldStripes" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Shield Gradient */}
                  <linearGradient id="shieldBg3D" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>

                  {/* Tech Wing Glow */}
                  <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* BACKGROUND ELEMENT: Shield & Checkmark first so Wasp sits on top of it (3D Depth) */}
                <g id="protective-shield" transform="translate(15, 45) scale(0.95)" className="opacity-95">
                  {/* Outer Shield Shell */}
                  <path
                    d="M10,12 L35,6 L50,15 L35,45 C25,38 10,28 10,12 Z"
                    fill="url(#shieldBg3D)"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Glossy inner light shell */}
                  <path
                    d="M14,14 L33,9 L45,17 L33,40 C25,34 14,26 14,14 Z"
                    fill="#e0f2fe"
                    opacity="0.2"
                  />
                  {/* Audit Target Circular Eye */}
                  <ellipse cx="28" cy="22" rx="7" ry="4" fill="#ffffff" />
                  <circle cx="28" cy="22" r="3" fill="#0f172a" />
                  <circle cx="29.5" cy="20.5" r="1.2" fill="#ffffff" />

                  {/* Striking Green Audit Checkmark on shield */}
                  <path
                    d="M18,25 L26,33 L44,15"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonGlow)"
                  />
                  {/* White core highlight for the green checkmark */}
                  <path
                    d="M18,25 L26,33 L44,15"
                    stroke="#a7f3d0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* BACKGROUND MOVEMENT: Lower secondary wings */}
                <path
                  d="M60,35 Q85,15 95,20 C88,32 72,42 62,48 Z"
                  fill="url(#waspSteelGrad3D)"
                  stroke="#0891b2"
                  strokeWidth="1"
                  opacity="0.8"
                />

                {/* THE MAJESTIC FLYING WASP (DABOUR) */}
                <g id="flying-wasp-body">
                  {/* Antennas */}
                  <path d="M78,38 Q90,26 92,15" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                  <path d="M82,39 Q96,30 98,18" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Powerful Upper Tech Wings with built-in audit metrics */}
                  <g id="main-wings" transform="translate(5, 5)">
                    {/* Metallic Main Wing silhouette spanning outwards */}
                    <path
                      d="M65,42 L98,8 C94,4 80,12 68,25 L58,42 Z"
                      fill="url(#waspSteelGrad3D)"
                      stroke="#0891b2"
                      strokeWidth="2"
                    />
                    {/* Wing glow layer */}
                    <path
                      d="M96,9 C88,14 75,25 67,31 L64,36 L86,18 Z"
                      fill="#38bdf8"
                      opacity="0.4"
                    />
                    {/* Interactive high-tech visual audit charts on the wing */}
                    <line x1="72" y1="18" x2="88" y2="30" stroke="#f43f5e" strokeWidth="1.5" filter="url(#neonGlow)" opacity="0.9" />
                    
                    {/* Audit Progress Dots/Gears inside the wing */}
                    <circle cx="75" cy="22" r="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
                    <circle cx="82" cy="18" r="2.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.5" />
                    <circle cx="89" cy="14" r="1.8" fill="#10b981" />
                    <polygon points="77,26 81,28 79,32" fill="#cbd5e1" />
                  </g>

                  {/* Detailed 3D Head of the Hornet facing right */}
                  <g id="hornet-head">
                    <circle cx="75" cy="46" r="9" fill="url(#waspSteelGrad3D)" stroke="#0f172a" strokeWidth="1" />
                    {/* Angry Wasp Compound Eye (Vibrant Neon Orange with white reflection) */}
                    <path
                      d="M74,40 C79,40 83,43 82,49 C80,52 75,51 74,47 Z"
                      fill="url(#waspBodyGrad3D)"
                      stroke="#7c2d12"
                      strokeWidth="1"
                    />
                    <ellipse cx="78" cy="43.5" rx="2.5" ry="1.2" fill="#ffffff" transform="rotate(-15 78 43.5)" />
                    {/* Powerful mandibles & mouthpiece */}
                    <path d="M78,52 L82,56 L77,54 Z" fill="#0f172a" />
                    <path d="M74,53 L76,57 L73,54 Z" fill="#0f172a" />
                  </g>

                  {/* Thorax (Middle Body Segment where wings attach) */}
                  <g id="hornet-thorax">
                    <ellipse cx="60" cy="54" rx="10" ry="8" fill="url(#waspBodyGrad3D)" stroke="#0f172a" strokeWidth="1.2" />
                    {/* Glossy back-plate armor */}
                    <path d="M53,50 C57,48 64,49 67,52 L62,59 C58,58 54,54 53,50 Z" fill="url(#waspSteelGrad3D)" />
                  </g>

                  {/* Abdomen: Giant curved segmented 3D stinger tail pointing down */}
                  <g id="hornet-abdomen" className="drop-shadow-lg">
                    {/* Segment 1 */}
                    <path
                      d="M51,56 Q44,60 41,68 C45,73 53,71 55,64 Z"
                      fill="url(#waspGoldStripes)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Dark Stripe 1 */}
                    <path d="M47,58 Q43,62 42,67" stroke="#0f172a" strokeWidth="3" fill="none" />

                    {/* Segment 2 */}
                    <path
                      d="M42,67 Q34,72 31,82 C36,87 43,84 45,76 Z"
                      fill="url(#waspBodyGrad3D)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Dark Stripe 2 */}
                    <path d="M37,70 Q32,75 32,80" stroke="#0f172a" strokeWidth="3.5" fill="none" />

                    {/* Segment 3 */}
                    <path
                      d="M32,80 Q24,86 22,96 C27,100 34,96 35,88 Z"
                      fill="url(#waspGoldStripes)"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Dark Stripe 3 (Final stripe before the tip) */}
                    <path d="M26,83 Q22,90 22,94" stroke="#0f172a" strokeWidth="4.5" fill="none" />

                    {/* Dangerous, razor-sharp metallic blue stinger weapon */}
                    <path
                      d="M23,96 L12,106 C16,104 22,101 24,94 Z"
                      fill="url(#waspSteelGrad3D)"
                      stroke="#22d3ee"
                      strokeWidth="1"
                      filter="url(#neonGlow)"
                    />
                  </g>
                </g>

                {/* DYNAMIC SWOOSH: The vibrant orange legal/audit checkmark swoosh from the picture */}
                <g id="legal-swoosh" transform="translate(10, -5)">
                  <path
                    d="M45,75 L62,104 L102,48"
                    stroke="url(#waspBodyGrad3D)"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Glowing core line inside the V swoosh */}
                  <path
                    d="M45,75 L62,104 L101,49"
                    stroke="#ffedd5"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonGlow)"
                  />
                </g>
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-sans select-none">
                DABOUR <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AUDIT</span> APP
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold tracking-widest">{lang === "EN" ? "AL-DABOUR & ASSOCIATES" : "مكتب الدبور وشركاؤه للمحاسبة"}</p>
            </div>
          </div>

          {/* Quick Active Client Indicator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] uppercase text-slate-400 font-semibold">
                {t.clientSelector}
              </label>
              <button
                type="button"
                onClick={() => setShowAddClientModal(true)}
                className="text-[9px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-all cursor-pointer bg-orange-500/10 hover:bg-orange-500/20 px-1.5 py-0.5 rounded"
              >
                <UserPlus className="w-2.5 h-2.5" />
                <span>{lang === "EN" ? "+ New Client" : "+ عميل جديد"}</span>
              </button>
            </div>
            {/* Grouped client folders — base name → year chips + status */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1">
              {(() => {
                const groups: Record<string, { baseEn: string; baseAr: string; clients: AuditClient[] }> = {};
                clients.forEach((c) => {
                  const baseEn = stripFyName(c.name);
                  const baseAr = stripFyName(c.arabicName);
                  const key = baseEn.toLowerCase();
                  if (!groups[key]) groups[key] = { baseEn, baseAr, clients: [] };
                  groups[key].clients.push(c);
                });
                return Object.values(groups).map((g) => {
                  const sorted = [...g.clients].sort((a, b) => a.financialYear.localeCompare(b.financialYear));
                  const isActiveGroup = sorted.some((c) => c.id === selectedClientId);
                  return (
                    <div
                      key={g.baseEn}
                      className={`rounded-lg border p-2 ${isActiveGroup ? "border-orange-500/40 bg-orange-500/5" : "border-slate-800 bg-slate-950"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Folder className="w-3 h-3 text-orange-400 shrink-0" />
                        <div className="text-[11px] font-bold text-slate-200 truncate">
                          {lang === "EN" ? g.baseEn : g.baseAr}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {sorted.map((c) => {
                          const st = getClientFileStatus(c);
                          const isActive = c.id === selectedClientId;
                          const dot =
                            st === "completed" ? "bg-emerald-400" :
                            st === "in_progress" ? "bg-amber-400" :
                            "bg-rose-400";
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSwitchClient(c.id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                isActive
                                  ? "bg-orange-500 text-white"
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                              title={st}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                              <span>FY{c.financialYear}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Status selector for active client */}
            <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
              <span className="text-slate-400 truncate">{currentClient.industry}</span>
              <select
                value={getClientFileStatus(currentClient)}
                onChange={(e) =>
                  setClientFileStatus((prev) => ({
                    ...prev,
                    [currentClient.id]: e.target.value as ClientFileStatus,
                  }))
                }
                className={`bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 font-bold cursor-pointer focus:outline-none ${
                  getClientFileStatus(currentClient) === "completed" ? "text-emerald-400" :
                  getClientFileStatus(currentClient) === "in_progress" ? "text-amber-400" :
                  "text-rose-400"
                }`}
              >
                <option value="not_started" className="text-rose-400">
                  {lang === "EN" ? "🔴 Not Started" : "🔴 لم يبدأ"}
                </option>
                <option value="in_progress" className="text-amber-400">
                  {lang === "EN" ? "🟡 In Progress" : "🟡 قيد التنفيذ"}
                </option>
                <option value="completed" className="text-emerald-400">
                  {lang === "EN" ? "🟢 Completed" : "🟢 مكتمل"}
                </option>
              </select>
            </div>


            <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRollForwardPartner(currentClient.auditPartner);
                  setRollForwardTargetYear("2027");
                  setRollPriorReview({});
                  setRollFiles([]);
                  setShowRollForwardModal(true);
                }}
                className="w-full bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 py-1.5 px-2 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-indigo-400" />
                <span>{lang === "EN" ? "Roll-Forward (New FY)" : "ترحيل الملف / سنة مالية جديدة"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Links — ISA audit workflow order */}
          <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-320px)]">
            {/* Section: ISQM 1 */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2 pb-1 px-3">
              {lang === "EN" ? "ISQM 1 · Firm Quality" : "ISQM 1 · جودة المكتب"}
            </div>
            <NavBtn tab="dashboard" active={activeTab} set={setActiveTab} icon={<LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />} label={t.navDashboard} gradient />

            {/* Section: ISA 200-220 Acceptance */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 210-220 · Acceptance" : "ISA 210-220 · القبول"}
            </div>
            {/* Merged workspace: both entries open the SAME combined screen
                (Planning & Acceptance + Team Hub) - Big-4 steps 1 & 2. */}
            <NavBtn tab="overview" active={activeTab} set={setActiveTab} icon={<Briefcase className="w-3.5 h-3.5 text-orange-400" />} label={t.navOverview} />
            <NavBtn tab="pre-engagement" active={activeTab} set={setActiveTab} icon={<BookOpen className="w-3.5 h-3.5 text-sky-400" />} label={t.navPreEngagement} />
            <NavBtn tab="aml" active={activeTab} set={setActiveTab} icon={<Shield className="w-3.5 h-3.5 text-rose-400" />} label={t.navAML} />

            {/* Section: ISA 300-320 Planning */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 300-320 · Planning" : "ISA 300-320 · التخطيط"}
            </div>
            <NavBtn tab="materiality" active={activeTab} set={setActiveTab} icon={<Calculator className="w-3.5 h-3.5 text-amber-400" />} label={t.navMateriality} />

            {/* Section: ISA 315-330 Risk & Response */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 315-330 · Risk & Response" : "ISA 315-330 · المخاطر"}
            </div>
            <NavBtn tab="risk-matrix" active={activeTab} set={setActiveTab} icon={<AlertOctagon className="w-3.5 h-3.5 text-orange-400" />} label={t.navRiskMatrix} />
            <NavBtn tab="procedures" active={activeTab} set={setActiveTab} icon={<Folder className="w-3.5 h-3.5 text-orange-400" />} label={t.navProcedures} />

            {/* Section: ISA 230-500 Evidence */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 230-500 · Evidence" : "ISA 230-500 · الأدلة"}
            </div>
            <NavBtn tab="analysis" active={activeTab} set={setActiveTab} icon={<BarChart3 className="w-3.5 h-3.5 text-violet-400" />} label={lang === "EN" ? "TB & Analysis" : "الميزان والتحليل"} />
            <NavBtn tab="workpapers" active={activeTab} set={setActiveTab} icon={<FileText className="w-3.5 h-3.5 text-emerald-400" />} label={t.navWorkpapers} />
            <NavBtn tab="findings" active={activeTab} set={setActiveTab} icon={<AlertOctagon className="w-3.5 h-3.5 text-red-400" />} label={lang === "EN" ? "Findings" : "الملاحظات"} />

            {/* Section: ISA 550-580 Specialist Areas */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 550-580 · Specialist" : "ISA 550-580 · متخصص"}
            </div>
            <NavBtn tab="going-concern" active={activeTab} set={setActiveTab} icon={<TrendingUp className="w-3.5 h-3.5 text-cyan-400" />} label={lang === "EN" ? "Going Concern" : "الاستمرارية (ISA 570)"} />
            <NavBtn tab="related-parties" active={activeTab} set={setActiveTab} icon={<LinkIcon className="w-3.5 h-3.5 text-purple-400" />} label={lang === "EN" ? "Related Parties" : "الأطراف ذات الصلة (ISA 550)"} />
            <NavBtn tab="mgmt-rep" active={activeTab} set={setActiveTab} icon={<ClipboardCheck className="w-3.5 h-3.5 text-teal-400" />} label={lang === "EN" ? "Management Rep." : "إقرارات الإدارة (ISA 580)"} />

            {/* Section: ISA 700+ Reporting */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "ISA 700 · Final Reporting" : "ISA 700 · التقارير النهائية"}
            </div>
            <NavBtn tab="final-reporting" active={activeTab} set={setActiveTab} icon={<FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />} label={lang === "EN" ? "Final Reporting" : "التقارير النهائية"} />

            {/* Utilities */}
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-wider pt-2.5 pb-1 px-3">
              {lang === "EN" ? "Tools & Settings" : "الأدوات والإعدادات"}
            </div>
            <NavBtn tab="sami-ai" active={activeTab} set={setActiveTab} icon={<Sparkles className="w-3.5 h-3.5 text-orange-400" />} label={t.navSamiCopilot} pulse />
            <NavBtn tab="settings" active={activeTab} set={setActiveTab} icon={<Settings className="w-3.5 h-3.5 text-slate-400" />} label={lang === "EN" ? "Settings" : "الإعدادات"} />
          </nav>
        </div>


        {/* Action button in the footer of layout */}
        <div className="mt-auto p-4 border-t border-slate-900 bg-slate-950/40 space-y-3">
          <button
            onClick={() => setShowAddClientModal(true)}
            className="w-full bg-brand-gradient text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer shadow-brand"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addClient}</span>
          </button>

          {/* Download ZIP of the entire app source */}
          <a
            href="/dabour-audit-source.zip"
            download="dabour-audit-source.zip"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow border border-violet-500/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === "EN" ? "Download App (.ZIP)" : "تحميل نسخة البرنامج (ZIP)"}</span>
          </a>



          {/* Exclusive Ownership & Copyright Badge */}
          <div className="p-2.5 bg-slate-900/95 rounded-lg border border-violet-500/30 text-right select-none" dir="rtl">
            <div className="flex items-center gap-1.5 justify-end text-violet-400 font-extrabold text-[9px] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping"></span>
              <span>حقوق الملكية الفكرية ومحتوى الترخيص</span>
            </div>
            <p className="text-[10px] font-black text-white leading-normal">
              محمود أحمد أحمد حسن – مراجع حسابات
            </p>
            <p className="text-[9px] font-semibold text-slate-400 leading-normal">
              مواطن مصري الجنسية — مرخص بموجب عقد ٢٠٢٦
            </p>
            <a
              href="tel:+20201125069299"
              dir="ltr"
              className="mt-1 flex items-center gap-1.5 justify-end text-[10px] font-bold text-emerald-300 hover:text-emerald-200 transition-colors select-text"
            >
              <Phone className="w-3 h-3" />
              <span className="font-mono">00 20 112 506 9299</span>
            </a>

            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[8px] text-slate-500 font-mono text-left select-text">
              © 2026 Mahmoud A. A. Hassan. MIT LICENSE.
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-705 flex items-center gap-2">
              <span>{lang === "EN" ? "Workspace" : "مساحة العمل"}:</span>
              <span className="text-slate-900 font-bold">
                {lang === "EN" ? currentClient.name : currentClient.arabicName}
              </span>
            </h2>
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-850 text-[10px] font-bold rounded-lg uppercase tracking-wide">
              {currentClient.status}
            </span>

            {/* Top Workspace Ownership Watermark Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[10px] font-extrabold transition-all select-none" dir="rtl">
              <span>⚖️ ملكية حصرية وحقوق فكرية مخصصة لـ:</span>
              <span className="text-indigo-950 font-black">محمود أحمد أحمد حسن</span>
              <span className="text-slate-500 font-bold text-[9px]">(مصري الجنسية)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Completion indicator */}
            <div className="hidden md:flex flex-col text-right text-xs">
              <span className="text-slate-400 font-semibold">{t.progressLabel}</span>
              <span className="text-orange-500 font-extrabold">{computedProgressPercent}%</span>
            </div>
            
            <div className="h-4 w-24 bg-gray-100 rounded-full overflow-hidden hidden md:block">
              <div
                className="bg-orange-500 h-full transition-all duration-500"
                style={{ width: `${computedProgressPercent}%` }}
              ></div>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "EN" ? "AR" : "EN")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === "EN" ? "العربية" : "English"}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Portal */}
        <div className="p-8 flex-1 overflow-y-auto">
          
          {/* Tab 0: Executive Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in text-justify">
              {/* Dynamic Welcome Hero Card with Modern Slate/Orange Brand Styling */}
              <div className="bg-brand-gradient rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-brand">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="space-y-2 relative z-1 flex-1">
                  <span className="text-[10px] bg-white/20 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm inline-block">
                    {lang === "EN" ? "AL-DABOUR AUDIT CONTROL CENTER" : "مركز التدقيق والرقابة الفنية (الدبور مراجعون قانونيون)"}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight" id="dashboard-hero-title">
                    {lang === "EN" ? "Welcome to Al-Dabour Assurance Hub" : "أهلاً بك في منصة الدبور الذكية للتدقيق والمراجعة"}
                  </h3>
                  <p className="text-white/80 text-[11px] max-w-2xl font-sans mt-1">
                    {lang === "EN"
                      ? `Real-time ISQM 1 quality monitoring and ISA audit compliance for ${currentClient.name}. Select another client directly or launch AI analytics below.`
                      : `متابعة حية لمعيار جودة المكاتب الأول ISQM 1 وتدقيق معايير المراجعة الدولية للعميل: ${currentClient.arabicName}. يمكنك اختيار عميل آخر أو تفعيل الذكاء الاصطناعي.`}
                  </p>
                </div>

                {/* Quick Client Switcher inside the Hero Card */}
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md flex flex-col gap-2 shrink-0 md:w-80 w-full z-1">
                  <label className="text-[10px] font-black uppercase text-white/90">
                    {lang === "EN" ? "Quick Client Navigator" : "مستعرض ومحدد العملاء السريع"}
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSwitchClient(e.target.value)}
                    className="bg-slate-900 border border-white/20 p-2.5 rounded-lg text-xs font-bold text-white cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    id="dashboard-client-select"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-950 font-bold">
                        {lang === "EN" ? c.name : c.arabicName} ({c.financialYear})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RESTORED ENTERPRISE KPI DASHBOARD CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="dashboard-kpi-grid">
                {/* KPI 1: Audit Progress */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-orange-50 text-orange-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {t.kpiProgress}
                    </span>
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {computedProgressPercent}%
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> +12%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-550"
                      style={{ width: `${computedProgressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">
                    {lang === "EN" ? "Weighted progress across active modules" : "معدل الإنجاز الموزون بناءً على نشاط دورات الحسابات"}
                  </p>
                </div>

                {/* KPI 2: Open Findings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-red-50 text-red-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {t.kpiFindings}
                    </span>
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {currentClient.openFindings}
                    </span>
                    <span className="text-[9px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                      {lang === "EN" ? "Partner Review" : "مراجعة الشريك"}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                    {lang === "EN" 
                      ? `${currentClient.openFindings} transactions flagged for analytical investigation` 
                      : `تم تحديد عدد ${currentClient.openFindings} موازين معلقة في مصفوفة التدقيق`}
                  </p>
                </div>

                {/* KPI 3: Completed Tasks */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {t.kpiTasks}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {preEngagementItems.filter((i) => i.status === "Completed").length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      / {preEngagementItems.length} {lang === "EN" ? "items" : "بند"}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                    {lang === "EN" 
                      ? `${preEngagementItems.filter((i) => i.status === "Completed").length} legal quality procedures fully validated` 
                      : `إجراءات وتأكيدات قانونية ومطابقة جودة منجزة بالكامل`}
                  </p>
                </div>

                {/* KPI 4: Compliance Score */}
                <button
                  type="button"
                  onClick={() => setShowCompliancePanel(true)}
                  className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  title={lang === "EN" ? "Show ISQM 1 Pass drivers" : "عرض مكونات نسبة الامتثال"}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {t.kpiCompliance}
                    </span>
                    <Shield className="w-4 h-4 text-indigo-550" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {preEngagementItems.length ? Math.round((preEngagementItems.filter((i) => i.status === "Completed").length / preEngagementItems.length) * 100) : 0}%
                    </span>
                    <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">
                      ISQM 1 Pass
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                    {lang === "EN"
                      ? "Quality check rules & strict independent auditor allocation"
                      : "التزام الكادر بمعايير الرقابة وأخلاقيات الاستقلال المتبعة"}
                  </p>
                </button>

              </div>

              {/* Main Two-Column Panel Design */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column 1: Workspace Modules Checklist and shortcuts (Span 7) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          {lang === "EN" ? "Assurance Module Workspace Pipeline" : "دورة التدقيق وممرات مساحات العمل الحية"}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {lang === "EN" ? "Live status across ISA compliant modules. Jump directly to continue working." : "حالة الإنجاز المباشرة لوحدات التدقيق. اضغط للانتقال لمساحة العمل المخصصة."}
                        </p>
                      </div>
                      <span className="text-[10px] bg-violet-50 text-violet-700 px-2.5 py-1.5 rounded-lg border border-violet-100 font-bold uppercase">
                        {lang === "EN" ? "Interactive Routes" : "توجيه تفاعلي مرن"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Module Item 1: Overview */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">ISA 210</span>
                            <span className="text-[9px] font-black text-orange-500">{lang === "EN" ? "Step 1" : "الخطوة ١"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "Planning, Acceptance & Team" : "التخطيط والقبول وفريق العمل"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Engagement acceptance forms, audit team, strategy and milestones." : "نماذج قبول الارتباط، فريق العمل، استراتيجية المراجعة والمراحل الزمنية."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("overview")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-orange-550 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Open Planning & Acceptance" : "فتح مساحة التخطيط والقبول"}
                        </button>
                      </div>

                      {/* Module Item 2: pre-engagement checklist */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">ISQM 1</span>
                            <span className="text-[9px] font-black text-indigo-600">{lang === "EN" ? "Step 2" : "الخطوة ٢"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "Pre-Engagement Checklists" : "خطوات ما قبل الارتباط الرسمية"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Strict quality vetting, conflict search, and ethics verification." : "التحقق من تعارض المصالح والالتزام بشرط ميثاق الأخلاق الكلي."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("pre-engagement")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Open Compliance Checklist" : "استعراض فحوص الامتثال للجودة"}
                        </button>
                      </div>

                      {/* Module Item 3: AML Screener */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">AML ACT</span>
                            <span className="text-[9px] font-black text-green-600">{lang === "EN" ? "Step 3" : "الخطوة ٣"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "AML Search & Screening" : "مطابقة غسيل الأموال وUBO"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Scan Ultimate Beneficial Owners against Restricted databases." : "البحث والتدقيق في القوائم الدولية لضمان الالتزام بقوانين الشفافية."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("aml")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-green-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Run AML Screener" : "البدء بفحص الملاك وغسيل الأموال"}
                        </button>
                      </div>

                      {/* Module Item 4: Materiality */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">ISA 320</span>
                            <span className="text-[9px] font-black text-violet-600">{lang === "EN" ? "Step 4" : "الخطوة ٤"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "Materiality Assessment" : "الأهمية النسبية وتغطية الأخطاء"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Calculate overall benchmarks, performance tolerances, and trivial rates." : "حساب الأثر المادي الإجمالي، مادية الأداء ونسب التسامح."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("materiality")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-violet-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Calculate Thresholds" : "تقدير الأهمية والحساب التفاعلي"}
                        </button>
                      </div>

                      {/* Module Item 5: Risk Matrix */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">ISA 315</span>
                            <span className="text-[9px] font-black text-red-500">{lang === "EN" ? "Step 5" : "الخطوة ٥"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "Inherent Risk Assessments" : "مصفوفة تقييم وتحليل المخاطر"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Chart probability and impact curves of ledger assertions." : "رسم خارطة تأثير المخاطر الذاتية وتقدير الخطر المحتمل."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("risk-matrix")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-red-500 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Analyze Risk Map" : "بدء تحليل مصفوفة المخاطر"}
                        </button>
                      </div>

                      {/* Module Item 6: Workpapers & Ledgers */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between hover:border-orange-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">CASWARE</span>
                            <span className="text-[9px] font-black text-emerald-600">{lang === "EN" ? "Step 6" : "الخطوة ٦"}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {lang === "EN" ? "Workpaper Locker & Ledger" : "مخزن أوراق العمل وميزان المراجعة"}
                          </h5>
                          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
                            {lang === "EN" ? "Map trials balance with working papers & lock certified journals." : "ربط حسابات العميل وصك الموازانات وإقرار قيود التسويات المحاسبية."}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("workpapers")}
                          className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors"
                        >
                          {lang === "EN" ? "Enter Workpapers Archive" : "ولوج ميزان مراجعة ومخزن أوراق العمل"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sami AI Quick Prompt Trigger */}
                  <div className="mt-4 p-4 bg-slate-950 text-white rounded-xl relative overflow-hidden flex flex-col justify-between md:flex-row md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 font-extrabold px-2 py-0.5 rounded inline-block">AI CAPABILITY</span>
                      <h5 className="text-xs font-bold">{lang === "EN" ? "Need Immediate Technical Audit Council?" : "هل تريد استشارة فنية عاجلة لمعايير المراجعة؟"}</h5>
                      <p className="text-[10px] text-slate-400 max-w-md">{lang === "EN" ? "Consult Sami's cognitive intelligence on maritime logistics, customs duties deferrals, or audit strategies." : "استعن بقدرات ذكاء سامي الاصطناعي لفحص كشوفات السلع أو لوائح الضرائب."}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("sami-ai")}
                      className="shrink-0 bg-orange-550 hover:bg-orange-600 text-white text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer transition-all"
                    >
                      {lang === "EN" ? "Launch Sami Copilot" : "البدء مع الشريك سامي"}
                    </button>
                  </div>
                </div>

                {/* Column 2: Client Active Financial Scope & Calculated Materiality Gauge (Span 5) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Financial Scope Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{lang === "EN" ? "Financial & Materiality Scope" : "المعايير المالية والأهمية النسبية النشطة"}</span>
                      <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">ISA 320</span>
                    </h4>

                    {/* Overall, Performance, Trivial Amounts */}
                    <div className="space-y-3.5 text-left">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-bold text-slate-600">
                            {lang === "EN" ? "Overall Materiality Threshold" : "عتبة الأهمية النسبية الإجمالية"}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ${computedOutputs.overallAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full w-full"></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {lang === "EN" ? `${materiality.overallPercentage}% of the current base benchmark (${materiality.benchmark})` : `تم احتساب نسبة ${materiality.overallPercentage}% من معيار الأساس المختار وهو (${materiality.benchmark})`}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-bold text-slate-600">
                            {lang === "EN" ? "Performance Materiality (Audit Safe Limit)" : "مادية الأداء (الحد التشغيلي للمطابقة)"}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ${computedOutputs.performanceAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${materiality.performancePercentage}%` }}></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {lang === "EN" ? `${materiality.performancePercentage}% safety buffer offset calculation on overall limit` : `تغطية وتأمين بنسبة ${materiality.performancePercentage}% لحصر الأخطاء المقبولة تشغيلياً`}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-bold text-slate-600">
                            {lang === "EN" ? "Clearly Trivial De-minimis Threshold" : "الحد البسيط التافه المهمل (De-minimis)"}
                          </span>
                          <span className="text-sm font-black text-rose-600">
                            ${computedOutputs.trivialAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full" style={{ width: `${materiality.trivialPercentage}%` }}></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {lang === "EN" ? `Below this limit, errors are strictly ignored (Calculated at ${materiality.trivialPercentage}% of Safe limit)` : `الأخطاء والتجاوزات دون هذا الحد تعتبر مهملة ومقبولة فورا كمسودة`}
                        </p>
                      </div>
                    </div>

                    {/* Active Benchmark Status Badge */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-700 font-bold">
                      {lang === "EN" ? "Base Revenue Value Logged:" : "قيمة المقياس الإيرادي الكلية المسجلة:"}{" "}
                      <span className="font-extrabold text-orange-655 font-mono">${materiality.customValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Engagement Quick Tools Suite card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-1.5 border-b border-slate-100">
                      {lang === "EN" ? "Assurance Portal Tools" : "أدوات وخدمات البوابة الفنية"}
                    </h4>
                    
                    <div className="space-y-2 text-left">
                      {/* Connection button */}
                      <button
                        onClick={() => setIsConnectLedgerOpen(true)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl cursor-pointer border border-slate-200 text-xs font-black transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-orange-550 animate-spin-slow" />
                          <span>{lang === "EN" ? "Sync Client CaseWare Ledger" : "مزامنة وسحب ميزان المراجعة"}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Zaza Docs button */}
                      <button
                        onClick={() => setIsZazaDocsOpen(true)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl cursor-pointer border border-slate-200 text-xs font-black transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-violet-500" />
                          <span>{lang === "EN" ? "Access Zaza Docs Repository" : "مركز تصفح وتحليل وثائق زازا"}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Legal Audit Assignment status */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden flex items-center justify-between border border-slate-800 shadow-lg">
                    <div className="space-y-1 relative z-1">
                      <span className="text-[8px] uppercase font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded tracking-widest inline-block">LICENSED PORT AL-DABOUR AUDITORS</span>
                      <h4 className="text-xs font-bold">{lang === "EN" ? "Engagement Partner Supervising:" : "الشريك المسؤول عن الاعتماد المهني:"}</h4>
                      <p className="text-xs font-black text-slate-250 mt-0.5">Mubarak Al-Harthy, Certified Partner</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-violet-600/35 border border-violet-500 text-white flex items-center justify-center font-black text-sm uppercase relative z-1">
                      MA
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Tab 1: Overview Dashboard */}
          {(activeTab === "overview" || activeTab === "planning") && (
            <div className="space-y-6">
              
              {/* Timeline Header and 4 Phase Status Track */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-orange-500" />
                      <span>{lang === "EN" ? "Planning & Acceptance Workspace" : "مساحة عمل التخطيط وقبول الارتباط"}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      {lang === "EN" 
                        ? `Client Context: ${currentClient.name} (${currentClient.financialYear}) — Managed via ISQM 1 Framework`
                        : `سياق العميل: ${currentClient.arabicName} (${currentClient.financialYear}) — يدار بموجب معيار جودة الارتباط معيار رقم ١`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {lang === "EN" ? `ID: ${currentClient.id}` : `معرف: ${currentClient.id}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-250`}>
                      {lang === "EN" ? "Phase 1: Active" : "المرحلة الأولى: نشطة"}
                    </span>
                  </div>
                </div>

                {/* 4 Phases Progress Track */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { ph: "Phase 1", titleEn: "Acceptance & AML", titleAr: "الموافقة وغسيل الأموال", status: "Active", pct: 100 },
                    { ph: "Phase 2", titleEn: "Planning & Strategy", titleAr: "التخطيط والاستراتيجية", status: "In_Progress", pct: 80 },
                    { ph: "Phase 3", titleEn: "Execution & Fieldwork", titleAr: "التنفيذ وفحص الحسابات", status: "In_Progress", pct: 45 },
                    { ph: "Phase 4", titleEn: "Reporting & Signing", titleAr: "التقارير والتوقيع النهائي", status: "Pending", pct: 0 }
                  ].map((p, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        p.status === "Active" 
                          ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                          : p.status === "In_Progress"
                          ? "bg-slate-50 text-slate-800 border-slate-200"
                          : "bg-slate-50/50 text-slate-450 border-slate-200/60"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${p.status === "Active" ? "text-orange-400" : "text-slate-400"}`}>
                          {p.ph}
                        </span>
                        <span className="text-[10px] font-bold">{p.pct}%</span>
                      </div>
                      <h4 className="text-xs font-black">{lang === "EN" ? p.titleEn : p.titleAr}</h4>
                      <div className="w-full h-1 bg-slate-250 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${p.status === "Active" ? "bg-orange-500" : "bg-slate-400"}`}
                          style={{ width: `${p.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form rendering router or Acceptance Grid */}
              {openAcceptanceCard ? (
                <div className="space-y-6">
                  {/* Back Navigation Bar */}
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => setOpenAcceptanceCard(null)}
                      className="text-xs font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>← {lang === "EN" ? "Back to Acceptance Control Panel" : "الرجوع للوحة التحكم بالارتباط والموافقة"}</span>
                    </button>
                    <span className="text-xs font-black text-slate-900">{lang === "EN" ? "Viewing Interactive Audit Document" : "تصفح ورقة عمل التدقيق التفاعلية"}</span>
                  </div>

                  {/* FORM A1: Client Acceptance & Continuance */}
                  {openAcceptanceCard === "A1" && (() => {
                    const formA1 = clientFormA1[selectedClientId] || {
                      industryValue: currentClient.industry,
                      legalFormValue: "Limited Liability Company (LLC)",
                      ownershipValue: "Private / Institutional",
                      auditReasonValue: "Statutory Audit Requirement",
                      reputationValue: "Good",
                      prevAuditorValue: "Local Professional Office",
                      integrityValue: "High",
                      adverseInfo: "No",
                      adverseComments: "No adverse findings detected in background checks.",
                      legalActions: "No",
                      legalComments: "No substantial active lawsuits flagged against entity.",
                      ethicalConcerns: "No",
                      ethicalComments: "No red flags noted concerning ethical standards of owners.",
                      competenceAssurance: "Yes",
                      competenceComments: "Engagement team holds active licenses and covers sea maritime rules."
                    };

                    const updateForm = (key: keyof typeof formA1, val: string) => {
                      setClientFormA1(prev => ({
                        ...prev,
                        [selectedClientId]: { ...(prev[selectedClientId] || formA1), [key]: val }
                      }));
                    };

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Parameters Panel */}
                        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                            <Settings className="w-4 h-4 text-orange-500" />
                            <span>{lang === "EN" ? "Engagement Environment Settings" : "محددات وبيئة الارتباط المالي"}</span>
                          </h4>

                          <div className="space-y-3 font-sans">
                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Industry Segment" : "قطاع النشاط والصناعة"}</label>
                              <select 
                                value={formA1.industryValue} 
                                onChange={(e) => updateForm("industryValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Consumer Goods & Sea Logistics">{lang === "EN" ? "Consumer Goods & Sea Logistics" : "السلع الاستهلاكية واللوجستيات البحرية"}</option>
                                <option value="Automotive & Spare Parts Import">{lang === "EN" ? "Automotive & Spare Parts Import" : "استيراد السيارات وقسم الغيار"}</option>
                                <option value="Chemicals & Manufacturing">{lang === "EN" ? "Chemicals & Manufacturing" : "الصناعات الكيماوية والتحويلية"}</option>
                                <option value="Information Technology">{lang === "EN" ? "Information Technology" : "تكنولوجيات ونظم المعلومات"}</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Legal Form of Entity" : "الشكل القانوني للشركة"}</label>
                              <select 
                                value={formA1.legalFormValue} 
                                onChange={(e) => updateForm("legalFormValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                                <option value="Joint Stock Company (J.S.C)">Joint Stock Company (J.S.C)</option>
                                <option value="Sole Proprietor / Establishment">Sole Proprietor / Establishment</option>
                                <option value="Partnership Structure">Partnership Structure</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Ownership Classification" : "تصنيف هيكل الملكية"}</label>
                              <select 
                                value={formA1.ownershipValue} 
                                onChange={(e) => updateForm("ownershipValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Private / Institutional">{lang === "EN" ? "Private / Institutional" : "خاصة / مؤسسية وملاك محليين"}</option>
                                <option value="Public Listed Exchange">{lang === "EN" ? "Public Listed Exchange" : "شركة مساهمة عامة مدرجة"}</option>
                                <option value="Family Business Office">{lang === "EN" ? "Family Business Office" : "مجموعة عائلية تجارية"}</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Purpose / Reason of Audit" : "هدف وسبب طلب التدقيق والمخطط"}</label>
                              <select 
                                value={formA1.auditReasonValue} 
                                onChange={(e) => updateForm("auditReasonValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Statutory Audit Requirement">Statutory Audit Requirement</option>
                                <option value="Voluntary Financial Statement Review">Voluntary Financial Audit</option>
                                <option value="Zakat & Tax Regulations Audit">Zakat & Tax Compliance</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Entity Reputation Audit" : "سمعة الشركة وملاكها"}</label>
                              <select 
                                value={formA1.reputationValue} 
                                onChange={(e) => updateForm("reputationValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Good">{lang === "EN" ? "Good" : "طيبة وخالية من المؤشرات السلبية"}</option>
                                <option value="Risky / Needs Monitoring">{lang === "EN" ? "Risky / Needs Monitoring" : "متوسطة المخاطر - تحتاج لمراقبة"}</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Predecessor External Auditor" : "مكتب المراجعة الخارجي السابق"}</label>
                              <select 
                                value={formA1.prevAuditorValue} 
                                onChange={(e) => updateForm("prevAuditorValue", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer text-xs"
                              >
                                <option value="Local Professional Office">{lang === "EN" ? "Local Professional Office" : "مكتب مهني محلي مرخص"}</option>
                                <option value="Big Four Audit Firm">{lang === "EN" ? "Big Four Audit Firm" : "أحد المكاتب العالمية الكبرى الأربعة"}</option>
                                <option value="None / Startup">{lang === "EN" ? "None / First Year Statutory Audit" : "لا يوجد / مراجعة السنة الأولى للشركة"}</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Integrity Check Questions */}
                        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wide">
                              {lang === "EN" ? "INTEGRITY & ETHICAL STANDARDS ASSESSMENT (Form A1)" : "تقييم معايير النزاهة وأخلاقيات إدارة العميل (نموذج أ١)"}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {lang === "EN" ? "Mandatory check per ISA 220. Perform regulatory and news media screening." : "فحص إلزامي بموجب معيار معيار المراجعة ٢٢٠. يتم فحص قواعد البيانات والتقارير الصحفية."}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {/* Question 1 */}
                            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-150">
                              <h5 className="font-bold text-slate-800 leading-normal">
                                {lang === "EN"
                                  ? "1. Is there any known adverse information about the client's management integrity, beneficial owners, or reputation?"
                                  : "١. هل توجد أي معلومات سلبية معروفة حول نزاهة إدارة العميل، الملاك المستفيدين، أو سمعة الكيان التجاري؟"}
                              </h5>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((choice) => (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() => updateForm("adverseInfo", choice as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      formA1.adverseInfo === choice 
                                        ? "bg-orange-500 text-white shadow-sm" 
                                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                    }`}
                                  >
                                    {choice}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={formA1.adverseComments}
                                onChange={(e) => updateForm("adverseComments", e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500 text-xs"
                                placeholder="Enter detailed integrity notes/findings..."
                              />
                            </div>

                            {/* Question 2 */}
                            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-150">
                              <h5 className="font-bold text-slate-800 leading-normal">
                                {lang === "EN"
                                  ? "2. Has the client or its beneficial owners been involved in any legal, criminal, or regulatory investigations / disputes?"
                                  : "٢. هل واجه العميل أو أحد ملاكه أي قضايا جنائية أو تحقيقات تنظيمية أو منازعات جمركية / ضريبية نشطة؟"}
                              </h5>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((choice) => (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() => updateForm("legalActions", choice as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      formA1.legalActions === choice 
                                        ? "bg-orange-500 text-white shadow-sm" 
                                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                    }`}
                                  >
                                    {choice}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={formA1.legalComments}
                                onChange={(e) => updateForm("legalComments", e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500 text-xs"
                                placeholder="Enter detailed regulatory/legal findings..."
                              />
                            </div>

                            {/* Question 3 */}
                            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-150">
                              <h5 className="font-bold text-slate-800 leading-normal">
                                {lang === "EN"
                                  ? "3. Are there any concerns regarding ethical standard compliance, accounting philosophy, or aggressive stance on estimates?"
                                  : "٣. هل توجد أي شواهد تدعو للقلق بشأن مستوى الامتثال الأخلاقي، أو تطبيق السياسات المحاسبية المتحفظة لدى الإدارة؟"}
                              </h5>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((choice) => (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() => updateForm("ethicalConcerns", choice as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      formA1.ethicalConcerns === choice 
                                        ? "bg-orange-500 text-white shadow-sm" 
                                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                    }`}
                                  >
                                    {choice}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={formA1.ethicalComments}
                                onChange={(e) => updateForm("ethicalComments", e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500 text-xs"
                                placeholder="Enter corporate governance observations..."
                              />
                            </div>

                            {/* Competence Section */}
                            <div className="p-4 bg-orange-50/40 border border-orange-150 rounded-xl space-y-3">
                              <h5 className="font-bold text-slate-800 leading-normal">
                                {lang === "EN"
                                  ? "Competence & Resources: Does the audit team possess the required maritime, trade logistics, and statutory professional certifications?"
                                  : "تقييم الكفاءة والقدرة المادية: هل يمتلك فريق التدقيق المشرف رخص المزاولة، الخبرة البحرية وصلاحيات الميناء لتنفيذ هذا الارتباط؟"}
                              </h5>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((choice) => (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() => updateForm("competenceAssurance", choice as any)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                      formA1.competenceAssurance === choice 
                                        ? "bg-slate-900 text-white shadow-sm" 
                                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                    }`}
                                  >
                                    {choice}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={formA1.competenceComments}
                                onChange={(e) => updateForm("competenceComments", e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500 text-xs"
                                placeholder="Detail team expertise and time allocation bounds..."
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setOpenAcceptanceCard(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                            >
                              {lang === "EN" ? "Discard" : "تراجع وإغلاق"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleCardSignoff("A1");
                                setOpenAcceptanceCard(null);
                              }}
                              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-md cursor-pointer transition-transform"
                            >
                              {lang === "EN" ? "Save & Sign-Off Form A1" : "حفظ وتوقيع نموذج القبول أ١"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* FORM A1.1: Independence Confirmation */}
                  {openAcceptanceCard === "A1.1" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto space-y-6 text-xs font-sans">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          <span>{lang === "EN" ? "Form A1.1: Team Independence Confirmation per ISQM 1" : "نموذج أ١.١: إقرار وتأكيد استقلالية فريق العمل بموجب معيار جودة الارتباط معيار رقم ١"}</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {lang === "EN" ? "Identify and document any threat to independence. Check client stock and board connections." : "تحديد وتوثيق أي تهديدات تحوم حول استقلالية التدقيق. فحص سجل الأسهم وعلاقات القرابة العائلية."}
                        </p>
                      </div>

                      <div className="space-y-4 font-sans font-medium text-slate-700">
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                          <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{lang === "EN" ? "Mandatory Independence Log Rules" : "شروط الاستقلالية المقررة والمعلنة"}</span>
                          </h4>
                          <p className="text-[10px] leading-relaxed text-slate-650">
                            {lang === "EN" 
                              ? "The engagement team must be independent of Mr. Ali For Import during the period of audit. Zero assets ownership, zero legal representation, and partner rotation compliance."
                              : "يتعين على جميع المراجعين التوقيع على الامتناع عن أي مصالح مالية أو تجارية أو تمثيل عائلي يؤثر على موضوعية وصدق فحص المركز والقوائم المالية."}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { labelEn: "Zero holdings or stock shares inside Ali For Import by any engagement team members.", labelAr: "عدم امتلاك أي مراجع بالفريق لأي حصص، أسهم، أو تداولات جارية مع شركة علي للاستيراد." },
                            { labelEn: "No closest relatives or spouses serve on executive managerial tiers inside the client organization.", labelAr: "عدم وجود أي روابط قرابة من الدرجة الأولى مع المدير المالي أو الملاك المباشرين للمجموعة." },
                            { labelEn: "Prior year audit rotation parameters are green: Partner Sami Al-Dabour is on Year 3 of standard 7-year rotational term.", labelAr: "شروط التدوير المهني مستوفاة بالكامل: شريك المراجعة سامي الدبور في السنة الثالثة من الحد الأقصى مهنياً (٧ سنوات)." }
                          ].map((rule, idx) => (
                            <div key={idx} className="flex gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl items-start">
                              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer h-4 w-4 shrink-0" />
                              <span className="text-xs leading-normal font-bold text-slate-800">
                                {lang === "EN" ? rule.labelEn : rule.labelAr}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Conflicts / Rotations Remarks" : "ملاحظات إضافية حول فحص تضارب المصالح"}</label>
                          <textarea
                            defaultValue="Full independence scrubs performed in global network broker files on May 19, 2026. Zero negative alerts active."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-mono text-xs focus:outline-none text-slate-800 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => setOpenAcceptanceCard(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
                        >
                          {lang === "EN" ? "Cancel" : "إلغاء"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleCardSignoff("A1.1");
                            setOpenAcceptanceCard(null);
                          }}
                          className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-black shadow-md cursor-pointer text-xs"
                        >
                          {lang === "EN" ? "Sign & Authorize Independence" : "إقرار وتوقيع الاستقلالية المهنية"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM B1: Engagement Letter Real-time Split Tool */}
                  {openAcceptanceCard === "B1" && (() => {
                    const formB1 = clientFormB1[selectedClientId] || {
                      auditPeriod: "2026",
                      scopeOfAudit: "Statutory Financial Statements Audit under ISAs",
                      mgmtResponsibilities: "Preparation of the financial statements in accordance with IFRS, maintaining accurate accounting journals, guarding corporate physical inventory assets, and implementing preventative internal control frameworks.",
                      auditorResponsibilities: "Formulate and express an independent audit opinion on the fairness of the financial presentation, conduct sample validation of import documents, verify bank confirmations, and direct substantive stock count audits under ISA 501.",
                      reportingFramework: "IFRS for SMEs / Regional GAAP",
                      feesArrangement: "Agreement of total audit fee of USD 45,000. 30% mobilization advance received and recorded.",
                      timeline: "Interim checks: June 2026, Fieldwork: August 2026, Final Sign-off: September 2026",
                      approvedByPartner: "Sami Al-Dabour, FCA"
                    };

                    const updateFormB = (key: keyof typeof formB1, val: string) => {
                      setClientFormB1(prev => ({
                        ...prev,
                        [selectedClientId]: { ...(prev[selectedClientId] || formB1), [key]: val }
                      }));
                    };

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Editor Form Left panel */}
                        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <span>{lang === "EN" ? "Form B1: Audit Engagement Details (ISA 210)" : "نموذج ب١: شروط العقد وبنود خطاب المراجعة (معيار ٢١٠)"}</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {lang === "EN" ? "Generate, negotiate, and store the formal terms of engagement representing statutory guidelines." : "تثبيت وتحرير بنود الخطاب القانوني الذي يحكم مراجعتنا مع شركة علي للاستيراد."}
                            </p>
                          </div>

                          <div className="space-y-3 font-sans font-medium text-slate-700">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Target Period" : "الفترة المحاسبية المغطاة"}</label>
                                <input
                                  type="text"
                                  value={formB1.auditPeriod}
                                  onChange={(e) => updateFormB("auditPeriod", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Audit Partner FCA" : "شريك الارتباط المعتمد"}</label>
                                <input
                                  type="text"
                                  value={formB1.approvedByPartner}
                                  onChange={(e) => updateFormB("approvedByPartner", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Scope of Audit Statement" : "نطاق وهيكل التدقيق المعتمد"}</label>
                              <input
                                type="text"
                                value={formB1.scopeOfAudit}
                                onChange={(e) => updateFormB("scopeOfAudit", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Management's Core Responsibilities" : "مسؤوليات إدارة العميل الرئيسية"}</label>
                              <textarea
                                value={formB1.mgmtResponsibilities}
                                onChange={(e) => updateFormB("mgmtResponsibilities", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-semibold text-slate-800 text-xs focus:outline-none leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Auditor's Statutory Responsibilities" : "مسؤوليات مراجع الحسابات القانونية"}</label>
                              <textarea
                                value={formB1.auditorResponsibilities}
                                onChange={(e) => updateFormB("auditorResponsibilities", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-semibold text-slate-800 text-xs focus:outline-none leading-relaxed"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Professional Fees & Billing Schedule" : "أتعاب التدقيق المهنية ومواعيد الفوترة"}</label>
                              <input
                                type="text"
                                value={formB1.feesArrangement}
                                onChange={(e) => updateFormB("feesArrangement", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Reporting Framework" : "إطار التقرير والمعيار"}</label>
                                <input
                                  type="text"
                                  value={formB1.reportingFramework}
                                  onChange={(e) => updateFormB("reportingFramework", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-600 mb-1 font-bold">{lang === "EN" ? "Core Timeline Boundaries" : "الجدول الزمني للارتباط"}</label>
                                <input
                                  type="text"
                                  value={formB1.timeline}
                                  onChange={(e) => updateFormB("timeline", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Document Preview Right panel */}
                        <div className="lg:col-span-6 bg-[#fafafa] border border-slate-300 rounded-2xl p-6 shadow-inner relative text-slate-800 font-serif leading-relaxed text-xs space-y-4">
                          <div className="absolute top-4 right-4 bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border border-orange-200">
                            <Sparkles className="w-3 h-3 text-orange-600 animate-pulse" />
                            <span>{lang === "EN" ? "ISA 210 Signed & Locked" : "تم التوقيع معيار ٢١٠"}</span>
                          </div>

                          <div className="border-b border-double border-slate-300 pb-3 text-center">
                            <h2 className="text-sm font-bold tracking-wider text-slate-900 flex justify-center items-center gap-1.5 uppercase font-sans">
                              <span>AL-DABOUR & ASSOCIATES</span>
                            </h2>
                            <p className="text-[9px] text-slate-500 font-sans tracking-tight uppercase mt-0.5">Chartered Statutory Auditors • Licensed Port Advisors</p>
                          </div>

                          <div className="space-y-3 pl-2 max-h-[460px] overflow-y-auto pr-2 select-text font-serif">
                            <p className="text-[10px] font-sans text-slate-400">Ref: EL-{currentClient.id}-FY{formB1.auditPeriod} • Date: May 22, 2026</p>
                            
                            <p className="font-bold font-sans text-slate-900 text-[11px]">
                              {lang === "EN" ? "To: Board of Directors and Mr. Ali" : "العناية: مجلس الإدارة والسيد علي المحترمين"}
                              <br />
                              <span className="font-sans text-slate-700 font-extrabold">{lang === "EN" ? currentClient.name : currentClient.arabicName}</span>
                            </p>

                            <p className="italic">
                              {lang === "EN" 
                                ? "We are writing to confirm our acceptance and our understanding of this statutory audit engagement. Our audit will be conducted with the objective of expressing our opinion on the financial statement transparency."
                                : "يسرنا أن نؤكد قبولنا وفهمنا لمهمة تدقيق ومراجعة الحسابات لشركتكم الجديرة بالاهتمام. حيث يتم العمل والنزول الميداني بهدف إصدار رأي مهني مستقل."}
                            </p>

                            <h5 className="font-bold text-slate-900 font-sans text-[10px] uppercase border-b border-slate-200 pb-0.5 mt-2">1. Scope of the Work & Standards</h5>
                            <p className="text-[11px] leading-relaxed">
                              {lang === "EN" 
                                ? `Our services are directed toward conducting independent auditing under ${formB1.scopeOfAudit}. We will run substantive checks and sampling under International Standards on Auditing (ISAs).`
                                : `تنصب أعمالنا ومطابقتنا الفنية الموجهة لقوائمكم تحت نطاق مالي: ${formB1.scopeOfAudit}. وسيتم تنفيذ موازين المطابقة وفق بنود معايير المراجعة الدولية المعتمدة من الهيئة.`}
                            </p>

                            <h5 className="font-bold text-slate-900 font-sans text-[10px] uppercase border-b border-slate-200 pb-0.5 mt-2">2. Management Responsibilities</h5>
                            <p className="text-[11px] text-slate-650 leading-relaxed text-left">
                              {formB1.mgmtResponsibilities}
                            </p>

                            <h5 className="font-bold text-slate-900 font-sans text-[10px] uppercase border-b border-slate-200 pb-0.5 mt-2">3. Auditor Responsibilities & Sample Vetting</h5>
                            <p className="text-[11px] text-slate-650 leading-relaxed text-left">
                              {formB1.auditorResponsibilities}
                            </p>

                            <h5 className="font-bold text-slate-900 font-sans text-[10px] uppercase border-b border-slate-200 pb-0.5">4. Fees, Mobilization & Billing Condition</h5>
                            <p className="text-[11px] font-sans font-bold text-indigo-950 bg-indigo-50/50 p-2 rounded border border-indigo-150/40">
                              {formB1.feesArrangement}
                            </p>
                            
                            <p className="text-[10px] text-slate-400 mt-2 font-sans border-t border-slate-200 pt-2 text-justify select-text">
                              {lang === "EN"
                                ? "Please sign and return the attached copy of this agreement to indicate your formal acceptance. Digitally logged as verified."
                                : "يرجى التوقيع وإرجاع نسخة موقعة ومختومة لتأكيد الموافقة وبدء تزويدنا بالمقاصات الجمركية وموازين الفروع."}
                            </p>

                            <div className="pt-4 flex justify-between items-center text-center font-sans">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black">Prepared & Signed</p>
                                <div className="mt-1 flex items-center gap-1 bg-[#f4f4f4] px-2 py-1 rounded border border-slate-200">
                                  <div className="w-3 h-3 bg-indigo-600 rounded-full text-white font-bold text-[8px] flex items-center justify-center">S</div>
                                  <span className="font-bold text-[9px] text-slate-800">{formB1.approvedByPartner}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-slate-400 uppercase font-black">Authorized Stamp</p>
                                <span className="bg-[#fff] px-2.5 py-1 text-emerald-700 font-black border border-emerald-500 rounded text-[9px] inline-block mt-1">APPROVED PORTAL</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-slate-200 font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                window.print();
                              }}
                              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{lang === "EN" ? "Print Contract" : "طباعة العقد وبنود السعة"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleCardSignoff("B1");
                                setOpenAcceptanceCard(null);
                              }}
                              className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-black cursor-pointer flex-1 transition-transform"
                            >
                              {lang === "EN" ? "Save & Lock Engagement Letter" : "حفظ وإبرام وتسييد خطاب المراجعة"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* FORM PAF: Permanent Audit Files */}
                  {openAcceptanceCard === "PAF" && (() => {
                    const paf = clientPAF[selectedClientId] || {
                      legalCharter: "Port Import Agency License No: IMP-7781-A.",
                      corporateStatute: "Articles of Association registered.",
                      taxCertificate: "VAT cert SC40192-A.",
                      shareholdingStructure: "Mr. Ali Al-Ghamdi (85%), Mubarak Logistics (15%).",
                      customTransitDeeds: "Port bonded storage leasing contract No: bond-909."
                    };

                    const updatePAF = (key: keyof typeof paf, val: string) => {
                      setClientPAF(prev => ({
                        ...prev,
                        [selectedClientId]: { ...(prev[selectedClientId] || paf), [key]: val }
                      }));
                    };

                    return (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6 text-xs text-justify">
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                              <Folder className="w-5 h-5 text-indigo-600" />
                              <span>{lang === "EN" ? "Permanent Audit File (PAF) - Standard Core Index" : "الملف الدائم للتدقيق (PAF) - الفهرس القانوني لشركة الاستيراد الجديدة"}</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {lang === "EN" ? "Permanent records detailing entity legal bylaws, corporate charter deeds, tax registrations, and UBO structures." : "الوثائق والتراخيص القانونية المستديمة التي تحكم عمل الشركة والتخليص الجمركي واستيراد البضائع."}
                            </p>
                          </div>
                          
                          <span className="text-[10px] text-slate-500 bg-indigo-50 px-2.5 py-1 border border-indigo-200/50 font-black rounded-lg">PAF REGISTRY</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Item 1 */}
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                            <span className="text-[9px] bg-slate-250 text-slate-755 font-bold font-mono px-2 py-0.5 rounded border border-slate-300">REF: PAF-L101</span>
                            <h4 className="font-bold text-slate-900">{lang === "EN" ? "Establishment License & Port Agency Registry" : "رخصة التأسيس والسجل التجاري لهيئة الموانئ الجمركية"}</h4>
                            <textarea
                              value={paf.legalCharter}
                              onChange={(e) => updatePAF("legalCharter", e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-slate-200 p-2 rounded font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Item 2 */}
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                            <span className="text-[9px] bg-slate-250 text-slate-755 font-bold font-mono px-2 py-0.5 rounded border border-slate-300">REF: PAF-C102</span>
                            <h4 className="font-bold text-slate-900">{lang === "EN" ? "Articles of Association & Legal Bylaws" : "عقد التأسيس والنظام الأساسي للشركة المستوردة"}</h4>
                            <textarea
                              value={paf.corporateStatute}
                              onChange={(e) => updatePAF("corporateStatute", e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-slate-200 p-2 rounded font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Item 3 */}
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                            <span className="text-[9px] bg-slate-250 text-slate-755 font-bold font-mono px-2 py-0.5 rounded border border-slate-300">REF: PAF-T103</span>
                            <h4 className="font-bold text-slate-900">{lang === "EN" ? "Zakat, VAT, & Sanction Board Certificates" : "شهادة الزكاة وضريبة القيمة المضافة وخطابات براءة الذمة"}</h4>
                            <textarea
                              value={paf.taxCertificate}
                              onChange={(e) => updatePAF("taxCertificate", e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-slate-200 p-2 rounded font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Item 4 */}
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                            <span className="text-[9px] bg-slate-250 text-slate-755 font-bold font-mono px-2 py-0.5 rounded border border-slate-300">REF: PAF-U104</span>
                            <h4 className="font-bold text-slate-900">{lang === "EN" ? "Ultimate Beneficial Owners (UBO) Struct" : "الشركاء والشفافية وتصريح الملاك المستفيدين النهائيين (UBO)"}</h4>
                            <textarea
                              value={paf.shareholdingStructure}
                              onChange={(e) => updatePAF("shareholdingStructure", e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-slate-200 p-2 rounded font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Item 5 */}
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 md:col-span-2">
                            <span className="text-[9px] bg-slate-250 text-slate-755 font-bold font-mono px-2 py-0.5 rounded border border-slate-300">REF: PAF-P105</span>
                            <h4 className="font-bold text-slate-900">{lang === "EN" ? "Seaport Bonded Land Warehouses Leasing Deeds" : "عقود استئجار مخازن ساحة ميناء الحاويات المستقر بموجب عقد مبرم"}</h4>
                            <textarea
                              value={paf.customTransitDeeds}
                              onChange={(e) => updatePAF("customTransitDeeds", e.target.value)}
                              rows={2}
                              className="w-full bg-white border border-slate-200 p-2 rounded font-semibold text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* File Upload interface inside PAF */}
                        <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <h5 className="font-bold text-slate-700 mb-1">{lang === "EN" ? "Drag & drop corporate legal PAF files here" : "اسحب وأدرج مستندات الشركة القانونية المستديمة هنا"}</h5>
                          <span className="text-[10px] text-slate-400 font-semibold">{lang === "EN" ? "Supports PDF, DOCX, scanned jpg up to 30mb per file" : "يدعم قراءة وفحص ملفات المقاصة والترخيص والتوثيق"}</span>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => setOpenAcceptanceCard(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                          >
                            {lang === "EN" ? "Close" : "الإغلاق"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCardSignoff("PAF");
                              setOpenAcceptanceCard(null);
                            }}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                          >
                            {lang === "EN" ? "Apply PAF Updates & Sign-Off" : "تحديث وحفظ وتوقيع الملف الدائم"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Acceptance Workspace Grid (Image 1) */
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-center shadow-md">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-550/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <span className="text-orange-400 font-bold text-xs tracking-widest uppercase mb-1">
                      {lang === "EN" ? "PHASE I: PRE-ENGAGEMENT & ACCEPTANCE AUDIT CHECKLISTS" : "المرحلة الأولى: لوحة قبول ورخص وتغطية الالتزام قبل بدء التدقيق والمراجعة"}
                    </span>
                    <h3 className="text-xl font-black mb-2">
                      {lang === "EN" ? `Acceptance Workspace Control Room` : `غرفة ومظلة قبول وبدء الارتباط لشركة علي للاستيراد`}
                    </h3>
                    <p className="text-slate-300 max-w-2xl text-[11px] leading-relaxed animate-pulse">
                      {lang === "EN"
                        ? "Execute background scrubs, establish the professional terms of contract (ISA 210), screen Beneficial Owners against AML lists, confirm network independence, and structure the Permanent Legal File (PAF) before proceeding to strategy modeling."
                        : "قم بإجراء فحص النزاهة وتحري أخلاقيات الإدارة والتحقق من الملاك المستفيدين (UBO) وتوقيع خطاب الارتباط وإثبات هيكل الاستقلالية مع تكوين الفهارس الدائمة."}
                    </p>
                  </div>

                  {/* RESTORED ENTERPRISE KPI DASHBOARD CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* KPI 1: Audit Progress */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-orange-50 text-orange-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {t.kpiProgress}
                        </span>
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {computedProgressPercent}%
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> +12%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full transition-all duration-550"
                          style={{ width: `${computedProgressPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        {lang === "EN" ? "Weighted progress across active modules" : "معدل الإنجاز الموزون بناءً على نشاط دورات الحسابات"}
                      </p>
                    </div>

                    {/* KPI 2: Open Findings */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-red-50 text-red-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {t.kpiFindings}
                        </span>
                        <AlertOctagon className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {currentClient.openFindings}
                        </span>
                        <span className="text-[9px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                          {lang === "EN" ? "Partner Review" : "مراجعة الشريك"}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                        {lang === "EN" 
                          ? `${currentClient.openFindings} transactions flagged for analytical investigation` 
                          : `تم تحديد عدد ${currentClient.openFindings} موازين معلقة في مصفوفة التدقيق`}
                      </p>
                    </div>

                    {/* KPI 3: Completed Tasks */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {t.kpiTasks}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {preEngagementItems.filter((i) => i.status === "Completed").length}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          / {preEngagementItems.length} {lang === "EN" ? "items" : "بند"}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                        {lang === "EN" 
                          ? `${preEngagementItems.filter((i) => i.status === "Completed").length} legal quality procedures fully validated` 
                          : `إجراءات وتأكيدات قانونية ومطابقة جودة منجزة بالكامل`}
                      </p>
                    </div>

                    {/* KPI 4: Compliance Score */}
                    <button
                      type="button"
                      onClick={() => setShowCompliancePanel(true)}
                      className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      title={lang === "EN" ? "Show ISQM 1 Pass drivers" : "عرض مكونات نسبة الامتثال"}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {t.kpiCompliance}
                        </span>
                        <Shield className="w-4 h-4 text-indigo-550" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {preEngagementItems.length ? Math.round((preEngagementItems.filter((i) => i.status === "Completed").length / preEngagementItems.length) * 100) : 0}%
                        </span>
                        <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">
                          ISQM 1 Pass
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-4 font-medium leading-normal">
                        {lang === "EN"
                          ? "Quality check rules & strict independent auditor allocation"
                          : "التزام الكادر بمعايير الرقابة وأخلاقيات الاستقلال المتبعة"}
                      </p>
                    </button>

                  </div>

                                    {/* 8 Acceptance Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      {
                        id: "A1",
                        titleEn: "Client Acceptance & Continuance",
                        titleAr: "قبول العميل واستمرار الارتباط",
                        ref: "Form A1",
                        descEn: "Evaluate client integrity, competence, time constraints, and ethical backgrounds.",
                        descAr: "تقييم نزاهة العميل، الملاك، قدرة الفريق المادية، وأثر السمعة المالية السابقة.",
                        routeType: "open"
                      },
                      {
                        id: "A1.1",
                        titleEn: "Independence Confirmation",
                        titleAr: "تأكيد واستقلال فريق العمل",
                        ref: "Form A1.1",
                        descEn: "Confirm team independence, zero financial holdings, and partner rotation compliance.",
                        descAr: "فحص وتوثيق استقلالية الكادر وضمان عدم وجود خلاف أو تعارض في المصالح المالية.",
                        routeType: "open"
                      },
                      {
                        id: "A2",
                        titleEn: "AML & Beneficial Owners (UBO)",
                        titleAr: "غسيل الأموال والملاك المستفيدين (UBO)",
                        ref: "Form A2 (AML)",
                        descEn: "Screen ultimate beneficial owners against corporate registries & restricted lists.",
                        descAr: "مراجعة هياكل الملكية وتدقيق هويات المساهمين الأعم ضد لوائح مكافحة غسيل الأموال.",
                        routeType: "link",
                        targetTab: "planning"
                      },
                      {
                        id: "A3",
                        titleEn: "Engagement Resource Map (ISA 220)",
                        titleAr: "توزيع المهام والموارد البشرية للعملية",
                        ref: "Form A3 (ISA 220)",
                        descEn: "Assign licensed auditors and team senior reviewers to operational risk accounts in real-time.",
                        descAr: "هيكلية توزيع المساعدين والمدير المسؤول وتوثيق الإشراف التقني والتحقق المهني.",
                        routeType: "link",
                        targetTab: "planning"
                      },
                      {
                        id: "B1",
                        titleEn: "Audit Engagement details (ISA 210)",
                        titleAr: "تفاصيل وبنود خطاب الارتباط (معيار ٢١٠)",
                        ref: "Form B1",
                        descEn: "Establish actual audit objectives, scoping, fees, and client-partner responsibilities.",
                        descAr: "توقيع وإصدار وثيقة خطاب الارتباط الذي يحكم واجبات العميل والمسؤولية للمكتب.",
                        routeType: "open"
                      },
                      {
                        id: "C1",
                        titleEn: "Overall Materiality & Strategy",
                        titleAr: "الأهمية النسبية واستراتيجية التدقيق العام",
                        ref: "Form C1",
                        descEn: "Set overall planning materiality values, tolerable error, and scope performance metrics.",
                        descAr: "حساب نسب الأهمية النسبية والأخطاء المقبولة بناء على صافي الأصول والمبيعات الكلية.",
                        routeType: "link",
                        targetTab: "workpapers"
                      },
                      {
                        id: "PAF",
                        titleEn: "Permanent Audit Files index",
                        titleAr: "الملف الدائم للتدقيق (PAF)",
                        ref: "Form PAF",
                        descEn: "Review establishment licenses, corporate statutes, and long-standing legal deeds.",
                        descAr: "تحديث وحفظ عقود تأسيس الشركة وعقد الإيجار وملخص التراخيص التجارية الجمركية.",
                        routeType: "open"
                      },
                      {
                        id: "CAF",
                        titleEn: "Current Audit Files ledger",
                        titleAr: "ملف التدقيق الجاري للعام الحالي (CAF)",
                        ref: "Form CAF",
                        descEn: "Synchronize working lead sheets with financial trial balances dynamically.",
                        descAr: "مراجعة التسويات المحاسبية المتكررة ومطابقة حسابات ميزان المراجعة النشط تفصيلياً.",
                        routeType: "link",
                        targetTab: "workpapers"
                      }
                    ].map((card) => {
                      const isSignedOff = (phasesSignoff[selectedClientId]?.[card.id] || "PENDING") === "SIGNED OFF";
                      return (
                        <div
                          key={card.id}
                          className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                {card.ref}
                              </span>
                              
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                                isSignedOff ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-550"
                              }`}>
                                {isSignedOff ? (
                                  <>
                                    <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                                    <span>{lang === "EN" ? "SIGNED OFF" : "تم التوافق والتوقيع"}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertOctagon className="w-2.5 h-2.5 text-amber-550" />
                                    <span>{lang === "EN" ? "PENDING" : "مسودة / غير موقع"}</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-slate-900 leading-tight mb-2.5">
                              {lang === "EN" ? card.titleEn : card.titleAr}
                            </h4>

                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              {lang === "EN" ? card.descEn : card.descAr}
                            </p>
                          </div>

                          <div className="pt-3.5 border-t border-slate-100 mt-2">
                            {card.routeType === "open" ? (
                              <button
                                type="button"
                                onClick={() => setOpenAcceptanceCard(card.id)}
                                className="w-full py-1.5 bg-slate-900 hover:bg-orange-500 hover:text-white text-white font-extrabold rounded-lg text-[9px] cursor-pointer transition-colors"
                              >
                                {lang === "EN" ? "OPEN DIRECT FORM" : "فتح ومراجعة وثيقة النموذج"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (card.targetTab) {
                                    // "planning" is merged into this screen - scroll to the
                                    // Team Hub section instead of switching tabs.
                                    const target = card.targetTab as AnyTab;
                                    setActiveTab(target === "planning" ? "overview" : target);
                                    if (target === "planning") {
                                      window.setTimeout(() => {
                                        document
                                          .getElementById("team-hub-anchor")
                                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }, 150);
                                    }
                                  }
                                }}
                                className="w-full py-1.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-750 font-extrabold rounded-lg text-[9px] border border-slate-200 cursor-pointer transition-colors"
                              >
                                {lang === "EN" ? "LINK TO INTEGRATED WORKSPACE" : "الانتقال لساحة التدقيق المرتبطة"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  
{/* Sami AI Quick Assistant on Dashboard & CasoWare settings */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-4">
                    {/* Sami AI Partner Companion (Span 5) */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-[#f25c05] rounded-full"></span>
                            {lang === "EN" ? "Sami AI Live Copilot Advisor" : "المستشار الفني والتحليلي المباشر (سامي)"}
                          </h4>
                          
                          <button
                            onClick={() => setActiveTab("sami-ai")}
                            className="text-[10px] text-orange-500 font-extrabold hover:underline cursor-pointer"
                          >
                            {lang === "EN" ? "Launch Panel →" : "لوحة المساعد ←"}
                          </button>
                        </div>

                        <SamiAICopilot
                          lang={lang}
                          onApplyProcedures={handleApplySamiProcedures}
                          onApplyWorkpaper={handleApplySamiWorkpaper}
                          currentClientIndustry={currentClient.industry}
                        />
                      </div>
                    </div>

                    {/* RESTORED VISUAL ANALYTICS GRAPH (Span 4) */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span>{lang === "EN" ? "Lead Sheet & File Stats" : "إحصائيات أوراق وملفات الحساب"}</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          {lang === "EN" ? "Current distribution of Lead Sheets matching active audit files." : "التوزيع الحالي للأوراق المعينة ومطابقتها للمتمتطلبات الإجرائية الحقيقية للسنة الحالية."}
                        </p>
                      </div>

                      {/* Concentric / Bar Gauges */}
                      <div className="space-y-4 font-sans my-2 flex-1 flex flex-col justify-center">
                        {/* Completed Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-605 mb-1">
                            <span>{lang === "EN" ? "Completed / Approved" : "تم تدقيقه واعتمد"}</span>
                            <span className="text-green-600 font-extrabold">
                              {workpapers.filter(w => w.status === "Completed").length} / {workpapers.length || 1} ({Math.round((workpapers.filter(w => w.status === "Completed").length / (workpapers.length || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.round((workpapers.filter(w => w.status === "Completed").length / (workpapers.length || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* In Review Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-605 mb-1">
                            <span>{lang === "EN" ? "In Review Status" : "قيد الفحص والمراجعة"}</span>
                            <span className="text-amber-500 font-extrabold">
                              {workpapers.filter(w => w.status === "In Review").length} / {workpapers.length || 1} ({Math.round((workpapers.filter(w => w.status === "In Review").length / (workpapers.length || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.round((workpapers.filter(w => w.status === "In Review").length / (workpapers.length || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Draft Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-605 mb-1">
                            <span>{lang === "EN" ? "Drafts / Working Docs" : "مسودات / أوراق مراجعة معلقة"}</span>
                            <span className="text-blue-500 font-extrabold">
                              {workpapers.filter(w => w.status === "Draft" || !w.status).length} / {workpapers.length || 1} ({Math.round((workpapers.filter(w => w.status === "Draft" || !w.status).length / (workpapers.length || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.round((workpapers.filter(w => w.status === "Draft" || !w.status).length / (workpapers.length || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>{lang === "EN" ? "Overall Files Quality Pass" : "نسبة جودة وتأكيد أوراق العمل المعتمدة"}</span>
                        <span className="text-emerald-600 font-black">{Math.round((workpapers.filter(w => w.status === "Completed").length / (workpapers.length || 1)) * 100)}%</span>
                      </div>
                    </div>

                    {/* Left corner: CASOWARE Audit configuration settings (Span 3) */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-1.5">
                          <Settings className="w-4 h-4 text-orange-500" />
                          <span>PwC CaseWare™ Setup</span>
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                          {lang === "EN" ? "Establish overall standards constraints and ledger connections." : "تحديث محددات المعايير التدقيقية الحاكمة ومطابقة الأرصدة."}
                        </p>
                      </div>

                      <div className="space-y-3 text-[10px] font-sans flex-1 flex flex-col justify-center">
                        <div>
                          <label className="block text-slate-500 mb-1 font-bold">{lang === "EN" ? "Standards Frame" : "الإطار التنظيمي الحاكم"}</label>
                          <select
                            value={clientEngagements[selectedClientId]?.engagementType || "External Statutory Audit (ISA 200)"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientEngagements(prev => ({
                                ...prev,
                                [selectedClientId]: { ...prev[selectedClientId], engagementType: val }
                              }));
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="External Statutory Audit (ISA 200)">External Statutory Audit (ISA 200)</option>
                            <option value="Limited Assurance Financial Review (ISRE 2400)">Limited Assurance (ISRE 2400)</option>
                            <option value="Tax & Zakat Audit Regulations">Tax & Zakat Regulations Audit</option>
                          </select>
                        </div>

                        {/* Linked Ledger status */}
                        <div>
                          <label className="block text-slate-500 mb-1 font-bold">{lang === "EN" ? "Trial Balance (Audit Mapped)" : "ميزان المراجعة المرتبط"}</label>
                          {activeLocalLedger ? (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2.5 mt-1">
                              <div className="font-extrabold flex items-center gap-1 text-[9px]">
                                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[170px]">{activeLocalLedger.fileName}</span>
                              </div>
                              <div className="text-[8px] text-slate-500 mt-0.5 font-bold">Revenue: ${activeLocalLedger.totalRevenue?.toLocaleString() || "0"}</div>
                            </div>
                          ) : (
                            <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-2.5 mt-1 flex flex-col items-center justify-center text-center">
                              <AlertOctagon className="w-4 h-4 text-red-500 mb-1 shrink-0 animate-bounce" />
                              <span className="font-extrabold text-[9px]">{lang === "EN" ? "No Ledger Mapped" : "ميزان المراجعة معلق"}</span>
                              <button 
                                onClick={() => setIsConnectLedgerOpen(true)}
                                className="mt-1 px-2.5 py-1 bg-red-650 text-white font-extrabold rounded text-[8px] cursor-pointer"
                              >
                                {lang === "EN" ? "Connect Ledger" : "ربط ميزان مراجعة"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Pre-Engagement Checklist (ISA 210, 220, ISQM 1) */}
          {activeTab === "pre-engagement" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.isaChecklist}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === "EN"
                      ? "Execution of Quality checks, Engagement boundaries acceptances and Partner direct verification statements checklist prior to substantial execution."
                      : "تنفيذ شروط قبول العميل وتقييم استقلالية فريق العمل مسبقاً قبل نزول المدققين للموقع الحقل."}
                  </p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-xs font-bold">
                  ISA 210 / ISA 220 Framework
                </div>
              </div>

              {/* Checklist list */}
              <div className="space-y-4">
                {preEngagementItems.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black rounded-md">
                          {item.section}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{lang === "EN" ? "Quality Standard Requirement" : "متطلبات معايير الجودة"}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {lang === "EN" ? item.label : item.labelAr}
                      </h4>
                      <input
                        type="text"
                        placeholder={t.labelComments}
                        value={item.comments}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreEngagementItems((prev) => {
                            const updated = prev.map((i) => (i.id === item.id ? { ...i, comments: val } : i));
                            setClientPreEngagementItems((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                            return updated;
                          });
                        }}
                        className="w-full mt-2 bg-white border border-slate-200 text-xs text-slate-700 px-3 py-1 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">{t.labelStatus}</label>
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setPreEngagementItems((prev) => {
                              const updated = prev.map((i) => (i.id === item.id ? { ...i, status: val, signee: val === "Completed" ? "SD" : i.signee } : i));
                              setClientPreEngagementItems((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                              return updated;
                            });
                          }}
                          className="bg-white border border-slate-200 px-2 py-1 rounded-lg font-semibold text-xs focus:outline-none focus:border-orange-500 cursor-pointer text-slate-700"
                        >
                          <option value="Completed">{lang === "EN" ? "Completed" : "مكتمل"}</option>
                          <option value="In_Progress">{lang === "EN" ? "In Progress" : "قيد التنفيذ"}</option>
                          <option value="Not_Started">{lang === "EN" ? "Not Started" : "لم يبدأ بعد"}</option>
                          <option value="Not_Applicable">N/A</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">{t.labelSignee}</label>
                        <input
                          type="text"
                          value={item.signee || ""}
                          placeholder="Initials"
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreEngagementItems((prev) => {
                              const updated = prev.map((i) => (i.id === item.id ? { ...i, signee: val } : i));
                              setClientPreEngagementItems((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                              return updated;
                            });
                          }}
                          className="w-14 bg-white border border-slate-200 text-center px-1 py-1 rounded-lg text-xs focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    showToast(lang === "EN" ? "Engagement acceptance sign-off successfully submitted!" : "تم حفظ توقيع قبول شروط الارتباط بنجاح!", "success");
                  }}
                  className="bg-orange-500 text-white hover:bg-orange-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "EN" ? "Sign-Off Engagement Package" : "اعتماد وتوقيع خطاب الارتباط"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Materiality Estimator (ISA 320) */}
          {activeTab === "materiality" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-500" />
                  {t.matTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "EN"
                    ? "Establish overall audit materiality level according to ISA 320 relative to gross values like Profit Before Tax, Total Revenues, or Balance Assets."
                    : "تحديد الأهمية المادية العامة وتجزئة مادية الأداء في القوائم المالية بناءً على المعيار الدولي ٣٢٠."}
                </p>
              </div>

              {materiality.customValue === 0 && (
                <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      {lang === "EN" ? "No Trial Balance uploaded yet" : "لم يتم رفع ميزان مراجعة بعد"}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {lang === "EN"
                        ? "Upload the client's Trial Balance under \"TB & Analysis\" to auto-calculate materiality based on ISA 320 — no manual entry needed."
                        : "قم برفع ميزان مراجعة العميل من شاشة \"الميزان والتحليل\" لحساب الأهمية النسبية تلقائياً وفقاً لمعيار ٣٢٠ دون الحاجة لإدخال يدوي."}
                    </p>
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className="mt-2 text-xs font-bold text-amber-800 underline underline-offset-2 cursor-pointer"
                    >
                      {lang === "EN" ? "Go to TB & Analysis →" : "الذهاب إلى الميزان والتحليل ←"}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Inputs area */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.matBenchmark}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "ProfitBeforeTax", label: lang === "EN" ? "Profit Before Tax (3% - 7%)" : "صافي الأرباح قبل الضريبة (٣٪ - ٧٪)" },
                        { key: "TotalAssets", label: lang === "EN" ? "Total Assets (0.5% - 2%)" : "إجمالي الأصول (٠.٥٪ - ٢٪)" },
                        { key: "Revenue", label: lang === "EN" ? "Total Revenues (0.5% - 1.5%)" : "إجمالي الإيرادات (٠.٥٪ - ١.٥٪)" },
                        { key: "TotalEquity", label: lang === "EN" ? "Total Equity (1% - 5%)" : "إجمالي حقوق الملكية (١٪ - ٥٪)" },
                      ].map((bench) => (
                        <button
                          key={bench.key}
                          type="button"
                          onClick={() => {
                            let defaultPct = 1.0;
                            if (bench.key === "ProfitBeforeTax") defaultPct = 5.0;
                            else if (bench.key === "TotalAssets") defaultPct = 1.0;
                            else if (bench.key === "TotalEquity") defaultPct = 2.0;

                            // Automatically suggest custom value from connected ledger if available
                            let customVal = materiality.customValue;
                            if (activeLocalLedger) {
                              if (bench.key === "Revenue") customVal = activeLocalLedger.totalRevenue || 12000000;
                              else if (bench.key === "TotalAssets") customVal = activeLocalLedger.assets || 22000000;
                              else if (bench.key === "ProfitBeforeTax") customVal = Math.round((activeLocalLedger.totalRevenue || 12000000) * 0.12);
                              else if (bench.key === "TotalEquity") customVal = Math.round((activeLocalLedger.assets || 22000000) * 0.45);
                            }

                            setMateriality((prev) => {
                              const updated = {
                                ...prev,
                                benchmark: bench.key as any,
                                overallPercentage: defaultPct,
                                customValue: customVal,
                              };
                              setClientMaterialities((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                              return updated;
                            });
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            materiality.benchmark === bench.key
                              ? "border-orange-500 bg-orange-50 text-orange-900 font-bold shadow-sm"
                              : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                          }`}
                        >
                          <div className="font-bold">{bench.label}</div>
                          {activeLocalLedger && (
                            <span className="block text-[9px] text-slate-500 mt-1 font-semibold">
                              {bench.key === "Revenue" && `Ledger val: $${(activeLocalLedger.totalRevenue || 0).toLocaleString()}`}
                              {bench.key === "TotalAssets" && `Ledger val: $${(activeLocalLedger.assets || 0).toLocaleString()}`}
                              {bench.key === "ProfitBeforeTax" && `Est. Ledger val: $${Math.round((activeLocalLedger.totalRevenue || 0) * 0.12).toLocaleString()}`}
                              {bench.key === "TotalEquity" && `Est. Ledger val: $${Math.round((activeLocalLedger.assets || 0) * 0.45).toLocaleString()}`}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.matBenchVal}
                    </label>
                    <input
                      type="number"
                      value={materiality.customValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setMateriality((prev) => {
                          const updated = { ...prev, customValue: val };
                          setClientMaterialities((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                          return updated;
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {t.matOverallPct}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={materiality.overallPercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setMateriality((prev) => {
                            const updated = { ...prev, overallPercentage: val };
                            setClientMaterialities((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                            return updated;
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-1 flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {t.matPerfPct}
                      </label>
                      <input
                        type="number"
                        value={materiality.performancePercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setMateriality((prev) => {
                            const updated = { ...prev, performancePercentage: val };
                            setClientMaterialities((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                            return updated;
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {t.matTrivialPct}
                      </label>
                      <input
                        type="number"
                        value={materiality.trivialPercentage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setMateriality((prev) => {
                            const updated = { ...prev, trivialPercentage: val };
                            setClientMaterialities((prevCls) => ({ ...prevCls, [selectedClientId]: updated }));
                            return updated;
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Computational outputs area */}
                <div className="md:col-span-6 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-md">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-widest text-orange-400 mb-4">
                      {lang === "EN" ? "CALCULATED MATERIALITY VALUES" : "القيم المحتسبة للأهمية المادية"}
                    </h4>

                    <div className="space-y-4">
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-semibold">{t.matOverallResult}</span>
                          <p className="text-[10px] text-slate-400 font-medium">({materiality.overallPercentage}% of benchmark)</p>
                        </div>
                        <div className="text-xl font-black text-white">
                          ${computedOutputs.overallAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase text-orange-400 font-bold">{t.matPerfResult}</span>
                          <p className="text-[10px] text-slate-400 font-medium">({materiality.performancePercentage}% of overall limit)</p>
                        </div>
                        <div className="text-xl font-black text-orange-400">
                          ${computedOutputs.performanceAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase text-emerald-400 font-bold">{t.matTrivialResult}</span>
                          <p className="text-[10px] text-slate-400 font-medium">({materiality.trivialPercentage}% of performance limit)</p>
                        </div>
                        <div className="text-lg font-black text-emerald-400">
                          ${computedOutputs.trivialAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">{t.matAdvice}</p>
                    <p>
                      {lang === "EN"
                        ? `The selected threshold ($${computedOutputs.performanceAmount.toLocaleString()}) acts as the sampling limit for all workpaper test plans. Sami AI advises focusing additional checks on deferred balances exceed this limit.`
                        : `يتم اتخاذ القيمة ($${computedOutputs.performanceAmount.toLocaleString()}) كحد أدنى لاختيار عينات الفحص والتدقيق الميداني بموجب معايير المراجعة الدولية.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const memo = `### Materiality Assessment Memorandum
**Client**: ${currentClient.name}
**Year End**: 31-Dec-2026

*   Chosen Benchmark: **${materiality.benchmark}**
*   Benchmark Value: **$${materiality.customValue.toLocaleString()}**
*   Planned Overall Materiality Amount: **$${computedOutputs.overallAmount.toLocaleString()}**
*   Performance Materiality Amount: **$${computedOutputs.performanceAmount.toLocaleString()}**
*   Clearly Trivial Limit Amount: **$${computedOutputs.trivialAmount.toLocaleString()}**`;

                    handleApplySamiWorkpaper("Materiality Estimation FY26 Memo", memo);
                  }}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === "EN" ? "Save Calculations as Workpaper File" : "حفظ الحسابات في ورقة عمل في الخزانة"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Risk Matrix Assessment (ISA 315) */}
          {activeTab === "risk-matrix" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Risks layout intro card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.riskTitle}</h3>
                    <p className="text-xs text-slate-500">
                      {lang === "EN"
                        ? "Registering risks of major balance sheet and income discrepancies, planning standard procedures responses to address potential fraudulent cycles."
                        : "حصر وتقييم مخاطر الأخطاء الجوهرية على مستوى القوائم والحسابات وتوثيق طرائق استجابة المراجعة لها."}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg uppercase">
                    ISA 315 Evaluation Model
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Heatmap visualization grid - perfect CSS matrix */}
                  <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-widest text-orange-400 mb-4">
                        {t.riskMatrixGrid}
                      </h4>

                      <div className="grid grid-cols-6 gap-1 text-center font-bold text-[10px]">
                        {/* Row for Impact headers */}
                        <div></div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">1 (Lw)</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold text-indigo-250">2</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">3 (Md)</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-500">4</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">5 (Hi)</div>

                        {/* Outer loop for Likelihood values (Y-axis desc) */}
                        {[5, 4, 3, 2, 1].map((l) => (
                          <React.Fragment key={l}>
                            <div className="text-[9px] text-slate-400 flex items-center justify-end pr-2 py-2">
                              L-{l}
                            </div>
                            {[1, 2, 3, 4, 5].map((imp) => {
                              const score = l * imp;
                              const count = riskGridCounts[`${l}-${imp}`] || 0;
                              let bg = "bg-green-800/20 text-green-400 hover:bg-green-700/30";
                              if (score >= 15) bg = "bg-red-800/45 text-red-400 hover:bg-red-700/60";
                              else if (score >= 8) bg = "bg-amber-800/35 text-amber-400 hover:bg-amber-700/50";

                              return (
                                <div
                                  key={imp}
                                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border border-slate-800/65 ${bg} transition-all relative cursor-pointer group`}
                                  title={`Likelihood ${l} x Impact ${imp}`}
                                >
                                  <span className="text-xs font-black">{count}</span>
                                  <div className="absolute bottom-0 text-[7px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    S:{score}
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-400">
                      <div className="flex items-center gap-4 justify-center">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-650 rounded-full inline-block"></span>
                          High (Score ≥ 15)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-550 rounded-full inline-block"></span>
                          Medium (Score ≥ 8)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-650 rounded-full inline-block"></span>
                          Low (Score &lt; 8)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add interactive creation form */}
                  <div className="lg:col-span-7 bg-slate-50/50 p-5 rounded-xl border border-dashed border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-700 mb-4 uppercase">{t.riskAdd}</h4>
                    <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{t.riskDesc}</label>
                        <textarea
                          rows={2}
                          value={newRiskDesc}
                          onChange={(e) => setNewRiskDesc(e.target.value)}
                          placeholder="e.g. Valuation mismatch in slow-moving inventories due to outdated pricing indexes."
                          className="w-full bg-white border border-slate-200 p-2 rounded-lg font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">{t.riskAssert}</label>
                          <input
                            type="text"
                            value={newRiskAssertion}
                            onChange={(e) => setNewRiskAssertion(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">{t.riskLikelihood}</label>
                          <select
                            value={newRiskLikelihood}
                            onChange={(e) => setNewRiskLikelihood(parseInt(e.target.value) as any)}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-bold"
                          >
                            <option value={1}>1 - Low</option>
                            <option value={2}>2</option>
                            <option value={3}>3 - Med</option>
                            <option value={4}>4</option>
                            <option value={5}>5 - High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">{t.riskImpact}</label>
                          <select
                            value={newRiskImpact}
                            onChange={(e) => setNewRiskImpact(parseInt(e.target.value) as any)}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-bold"
                          >
                            <option value={1}>1 - Low</option>
                            <option value={2}>2</option>
                            <option value={3}>3 - Med</option>
                            <option value={4}>4</option>
                            <option value={5}>5 - High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{t.riskResponse}</label>
                        <input
                          type="text"
                          value={newRiskResponse}
                          onChange={(e) => setNewRiskResponse(e.target.value)}
                          placeholder="Audit Substantive Procedure Code"
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">
                            {lang === "EN" ? "Assigned Auditor" : "المكلف بالتدقيق"}
                          </label>
                          <select
                            value={newRiskAuditor}
                            onChange={(e) => setNewRiskAuditor(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-bold"
                          >
                            {team.map((mem) => (
                              <option key={mem.id} value={mem.name}>
                                {mem.name} ({mem.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">
                            {lang === "EN" ? "Internal Control Description" : "وصف الرقابة الداخلية"}
                          </label>
                          <input
                            type="text"
                            value={newRiskControlDesc}
                            onChange={(e) => setNewRiskControlDesc(e.target.value)}
                            placeholder={lang === "EN" ? "e.g. Monthly reconciliation with double signature limits" : "مثال: مراجعة شهرية مطابقة بحدود التوقيع الثنائي"}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1 font-semibold">
                            {lang === "EN" ? "PY Risk Score Trend" : "مقارنة مع العام السابق"}
                          </label>
                          <select
                            value={newRiskTrend}
                            onChange={(e) => setNewRiskTrend(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-bold"
                          >
                            <option value="stable">→ {lang === "EN" ? "Stable" : "مستقر"}</option>
                            <option value="up">↑ {lang === "EN" ? "Increased" : "مزداد"}</option>
                            <option value="down">↓ {lang === "EN" ? "Decreased" : "متناقص"}</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-orange-600 cursor-pointer transition-colors"
                      >
                        {lang === "EN" ? "Incorporate Risk to Registry" : "تسجيل الخطر كبند مالي"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Risks Registry table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
                  <h4 className="text-sm font-bold text-slate-800">
                    {lang === "EN" ? "ISA 315 Identified Misstatements Registry" : "سجل الأخطاء والمخاطر المحددة للمعيار ٣١٥"}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Persistent Filter Segmented Toggle Bar */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                      {[
                        { key: "All", label: lang === "EN" ? "All" : "الكل", count: risks.length, colorActive: "bg-white text-slate-800 shadow-xs", colorInActive: "text-slate-500 hover:text-slate-800" },
                        { key: "High", label: lang === "EN" ? "High" : "مرتفع", count: risks.filter(r => r.inherentRisk === "High").length, colorActive: "bg-red-50 text-red-700 border border-red-200/50 shadow-xs", colorInActive: "text-slate-500 hover:text-red-650" },
                        { key: "Medium", label: lang === "EN" ? "Medium" : "متوسط", count: risks.filter(r => r.inherentRisk === "Medium").length, colorActive: "bg-amber-50 text-amber-700 border border-amber-200/50 shadow-xs", colorInActive: "text-slate-500 hover:text-amber-650" },
                        { key: "Low", label: lang === "EN" ? "Low" : "منخفض", count: risks.filter(r => r.inherentRisk === "Low").length, colorActive: "bg-green-50 text-green-700 border border-green-200/50 shadow-xs", colorInActive: "text-slate-500 hover:text-green-650" },
                      ].map((item) => {
                        const isActive = riskFilter === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setRiskFilter(item.key as any)}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 leading-none ${
                              isActive ? item.colorActive + " scale-[1.02] font-extrabold" : item.colorInActive + " font-bold"
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                              isActive 
                                ? (item.key === "High" ? "bg-red-200/50 text-red-800" : item.key === "Medium" ? "bg-amber-200/50 text-amber-800" : item.key === "Low" ? "bg-green-200/50 text-green-800" : "bg-slate-200 text-slate-700")
                                : "bg-slate-200/60 text-slate-400"
                            }`}>
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                      <span className="text-[10px] text-slate-550 pl-2 pr-1 uppercase tracking-wider font-extrabold">
                        {lang === "EN" ? "Sort By" : "ترتيب حسب"}
                      </span>
                      <select
                        value={riskSortField}
                        onChange={(e) => setRiskSortField(e.target.value as any)}
                        className="bg-white text-slate-800 py-1 px-2 rounded-lg border-0 text-[10px] focus:outline-none focus:ring-0 cursor-pointer font-bold"
                      >
                        <option value="none">{lang === "EN" ? "Default" : "الافتراضي"}</option>
                        <option value="inherentRisk">{lang === "EN" ? "Inherent Risk" : "الخطر الملازم"}</option>
                        <option value="likelihood">{lang === "EN" ? "Likelihood" : "الأرجحية"}</option>
                        <option value="impact">{lang === "EN" ? "Impact" : "الأثر"}</option>
                        <option value="score">{lang === "EN" ? "Risk Score (Likelihood x Imp)" : "مستوى الخطورة"}</option>
                      </select>
                      {riskSortField !== "none" && (
                        <button
                          type="button"
                          onClick={() => setRiskSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                          className="p-1 hover:bg-slate-250 text-slate-700 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold"
                          title={lang === "EN" ? "Toggle Direction" : "عكس اتجاه الترتيب"}
                        >
                          <ArrowUpDown className="w-3 h-3 text-orange-500" />
                          <span className="text-[9px] uppercase tracking-wider font-extrabold ml-1 font-mono">
                            {riskSortOrder}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="risk-matrix-table min-w-full text-xs text-left" dir={isRtl ? "rtl" : "ltr"}>
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold select-none">
                        <th 
                          onClick={() => handleHeaderSort("inherentRisk")}
                          className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center justify-center gap-1.5 mx-auto">
                            <span>{t.riskInherent}</span>
                            <ArrowUpDown className={`w-3 h-3 transition-colors ${riskSortField === "inherentRisk" ? "text-orange-500 font-black scale-110" : "text-slate-350 opacity-45 group-hover:opacity-100"}`} />
                          </div>
                        </th>
                        <th className="px-4 py-3">{t.riskDesc}</th>
                        <th className="px-4 py-3">{t.riskAssert}</th>
                        <th className="px-4 py-3">{t.riskResponse}</th>
                        <th 
                          onClick={() => handleHeaderSort("score")}
                          className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center justify-center gap-1.5 mx-auto">
                            <span>{lang === "EN" ? "Likelihood x Imp" : "الاحتمالية × الأثر"}</span>
                            <ArrowUpDown className={`w-3 h-3 transition-colors ${riskSortField === "score" ? "text-orange-500 font-black scale-110" : "text-slate-350 opacity-45 group-hover:opacity-100"}`} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const filteredRisks = risks.filter((r) => riskFilter === "All" || r.inherentRisk === riskFilter);
                        
                        let sortedRisks = [...filteredRisks];
                        if (riskSortField !== "none") {
                          const orderMult = riskSortOrder === "asc" ? 1 : -1;
                          const inherentOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
                          
                          sortedRisks.sort((a, b) => {
                            if (riskSortField === "inherentRisk") {
                              const valA = inherentOrder[a.inherentRisk] || 0;
                              const valB = inherentOrder[b.inherentRisk] || 0;
                              return (valA - valB) * orderMult;
                            }
                            if (riskSortField === "likelihood") {
                              return (a.likelihood - b.likelihood) * orderMult;
                            }
                            if (riskSortField === "impact") {
                              return (a.impact - b.impact) * orderMult;
                            }
                            if (riskSortField === "score") {
                              const scoreA = a.likelihood * a.impact;
                              const scoreB = b.likelihood * b.impact;
                              return (scoreA - scoreB) * orderMult;
                            }
                            return 0;
                          });
                        }

                        if (sortedRisks.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-450 font-medium font-sans">
                                {lang === "EN" 
                                  ? `No ${riskFilter === "All" ? "" : riskFilter.toLowerCase() + " "}risks registered for this client.` 
                                  : `لا توجد مخاطر ${riskFilter === "All" ? "" : (riskFilter === "High" ? "مرتفعة" : (riskFilter === "Medium" ? "متوسطة" : "منخفضة"))} مسجلة لهذا العميل.`}
                              </td>
                            </tr>
                          );
                        }
                        return sortedRisks.map((r) => {
                          const score = r.likelihood * r.impact;
                          let textClass = "bg-green-100 text-green-800";
                          let cellBgClass = isRtl 
                            ? "bg-emerald-50/30 text-emerald-950 border-l border-emerald-100/40" 
                            : "bg-emerald-50/30 text-emerald-950 border-r border-emerald-100/40";
                          
                          if (score >= 15) {
                            textClass = "bg-red-100 text-red-800 font-bold";
                            cellBgClass = isRtl 
                              ? "bg-rose-50/40 text-rose-950 border-l border-rose-100/40" 
                              : "bg-rose-50/40 text-rose-950 border-r border-rose-100/40";
                          } else if (score >= 8) {
                            textClass = "bg-amber-100 text-amber-800";
                            cellBgClass = isRtl 
                              ? "bg-amber-50/30 text-amber-950 border-l border-amber-100/40" 
                              : "bg-amber-50/30 text-amber-950 border-r border-amber-100/40";
                          }

                          return (
                            <tr
                              key={r.id}
                              onClick={() => setSelectedRiskDetail(r)}
                              className="hover:bg-slate-50/95 border-b border-slate-100 transition-all duration-150 cursor-pointer relative group/row active:bg-slate-100"
                              onMouseEnter={() => setHoveredRiskId(r.id)}
                              onMouseLeave={() => setHoveredRiskId(null)}
                            >
                              <td className={`px-4 py-3 text-center transition-all ${cellBgClass}`}>
                                <div className="flex flex-col items-center gap-1 justify-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${textClass}`}>
                                    {r.inherentRisk}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 border ${
                                    r.trend === "up" ? "bg-rose-50 text-rose-700 border-rose-200/60" :
                                    r.trend === "down" ? "bg-emerald-50 text-emerald-700 border-emerald-250/60" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                                  }`} title={lang === "EN" ? "Inherent Risk Score Trend vs Prior Period" : "تصنيف اتجاه الخطر مقارنة بالفترة السابقة"}>
                                    {r.trend === "up" ? (
                                      <TrendingUp className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                    ) : r.trend === "down" ? (
                                      <TrendingDown className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <span className="text-slate-400 font-extrabold px-0.5 leading-none">→</span>
                                    )}
                                    <span className="text-[8px] font-mono leading-none">
                                      {r.trend === "up" ? (lang === "EN" ? "PY ↑" : "سابق ↑") :
                                       r.trend === "down" ? (lang === "EN" ? "PY ↓" : "سابق ↓") :
                                       (lang === "EN" ? "PY ↔" : "سابق ↔")}
                                    </span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-800 font-semibold max-w-xs relative">
                                <div className="flex flex-col">
                                  <span className="font-bold underline decoration-slate-300 decoration-dotted underline-offset-2 group-hover/row:decoration-indigo-400 group-hover/row:text-indigo-950 transition-colors">
                                    {r.description}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                    {lang === "EN" ? "Click to view full assessment details" : "انقر لعرض تفاصيل التقييم الكاملة"}
                                  </span>
                                </div>

                                {hoveredRiskId === r.id && (
                                  <div
                                    className={`absolute z-50 ${isRtl ? "right-2" : "left-2"} top-full mt-2 w-80 bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-2xl pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-top-1`}
                                    style={{ minHeight: "100px" }}
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                      <span className="font-extrabold text-white flex items-center gap-1">
                                        <AlertOctagon className="w-4 h-4 text-orange-400" />
                                        <span>{lang === "EN" ? "Risk & Control Assessment" : "تفاصيل تقييم المخاطر وجدول الرقابة"}</span>
                                      </span>
                                    </div>
                                    <div className="space-y-3 font-medium text-left" dir={lang === "AR" ? "rtl" : "ltr"}>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 text-left">
                                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold mb-1">
                                            {lang === "EN" ? "Inherent Risk" : "خطر الملازمة"}
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase ${
                                            r.inherentRisk === "High" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                            r.inherentRisk === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                            "bg-green-500/20 text-green-400 border border-green-500/30"
                                          }`}>
                                            {r.inherentRisk}
                                          </span>
                                        </div>

                                        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 text-left">
                                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold mb-1">
                                            {lang === "EN" ? "Control Risk" : "مخاطر الرقابة"}
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase ${
                                            (r.controlRisk || "Medium") === "High" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                            (r.controlRisk || "Medium") === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                            "bg-green-500/20 text-green-400 border border-green-500/30"
                                          }`}>
                                            {r.controlRisk || "Medium"}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-left">
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold mb-1">
                                          {lang === "EN" ? "Planned Audit Response" : "الاستجابة المخططة للتدقيق"}
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-300 font-bold whitespace-normal">
                                          {r.plannedResponse}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 pt-1.5 border-t border-slate-800 text-[9px] text-slate-500 text-center font-bold">
                                      {lang === "EN" ? "Risk Registry Quick Summary" : "ملخص سريع لسجل المخاطر"}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-bold">{r.assertion}</td>
                              <td className="px-4 py-3 text-slate-700">{r.plannedResponse}</td>
                              <td className="px-4 py-3 text-center font-bold">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                                  score >= 15 ? "bg-red-50 text-red-700 border-red-250/70" :
                                  score >= 8 ? "bg-amber-50 text-amber-700 border-amber-250/70" :
                                  "bg-green-50 text-green-700 border-green-250/70"
                                }`}>
                                  <span>{r.likelihood} × {r.impact}</span>
                                  <span className="opacity-40 font-normal">|</span>
                                  <span className="text-[10px]">
                                    {lang === "EN" ? "Score" : "النتيجة"}: {score}
                                  </span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRisks((prev) => prev.filter((x) => x.id !== r.id));
                                  }}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer p-1 transition-colors relative z-10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: AML Screening (PEP & Sanctions) */}
          {activeTab === "aml" && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto space-y-6">
              
              {/* Header Title section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-500 animate-pulse animate-duration-1000" />
                      <span>{lang === "EN" ? "AML compliance & UBO Background Screening" : t.amlTitle}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === "EN"
                        ? "Execute ultimate beneficial owner (UBO) identity scans against restricted lists, PEP registers, and Central Bank databases (Required for Acceptance Phase)."
                        : "لوحة الفحص والتحقق لمكافحة غسيل الأموال والأشخاص المعرضين سياسياً (PEP) لضمان نزاهة وقبول العملاء الجدد."}
                    </p>
                  </div>

                  {/* Compliance Sign-off Indicator */}
                  <div>
                    {amlReportSignOffs[selectedClientId] ? (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2.5">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-black text-emerald-800 uppercase leading-none">
                            {lang === "EN" ? "APPROVED COMPLIANCE REPORT" : "تم اعتماد تقرير الالتزام"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 font-mono">
                            {amlReportSignOffs[selectedClientId]?.hash}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center gap-2.5 animate-pulse">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xs">
                          !
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-black text-amber-800 uppercase leading-none">
                            {lang === "EN" ? "PENDING AUDITOR SIGN-OFF" : "بانتظار توقيع واعتماد المراجع"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500">
                            {lang === "EN" ? "Checklist Item PE-6 is Pending" : "بند فحص غسيل الأموال معلق"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Educational Insight: How large commercial systems operate and where are files checked */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-xl text-white text-xs">
                  <div className="space-y-2" dir={isRtl ? "rtl" : "ltr"}>
                    <span className="font-extrabold text-orange-400 text-[10px] tracking-wide uppercase block">
                      {lang === "EN" ? "💡 SYSTEM INSIGHT & DATABASE LOGIC" : "💡 كيف تعمل هذه الشاشة في الأنظمة والبرامج الكبرى؟"}
                    </span>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {lang === "EN" 
                        ? "In standard enterprise tools (like Caseware, World-Check or Dow Jones Risk), this screen serves to execute database inquiries, document justifications for matches, and record a legal audit trail." 
                        : "في البرامج والشركات الكبرى (مثل Big 4 و World-Check و Caseware)، تُستخدم هذه الشاشة لإرسال استعلامات وفحص الملاك المستفيدين (UBO) ومن ثم كتابة مبررات مهنية في حال ظهور تطابق لمنع المسائلات القانونية."}
                    </p>
                    <div className="text-[10px] text-slate-300 font-semibold bg-white/10 p-2 rounded-lg leading-normal">
                      <strong>{lang === "EN" ? "Search Source:" : "مكان البحث:"}</strong>{" "}
                      {lang === "EN" 
                        ? "Currently configured to query offline database objects. Searching 'دبور' or 'Dabour' matches Sami Al-Dabour pre-populated PEP profile defined within 'AML_MOCK_DATABASE' inside our application package code."
                        : "النظام مبرمج للاستعلام من مصفوفة مبرمجة برمجية. لذا عند كتابة 'دبور' أو 'Dabour' سيطابق سجل 'Sami Al-Dabour' المحفوظ مسبقاً في كود البرنامج لتوضيح كيف تظهر الإنذارات والتحذيرات."}
                    </div>
                  </div>

                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-2 md:pt-0" dir={isRtl ? "rtl" : "ltr"}>
                    <span className="font-extrabold text-indigo-300 text-[10px] tracking-wide uppercase block">
                      {lang === "EN" ? "🎯 THE MANDATORY AUDITOR STEPS" : "🎯 الخطوات الإلزامية التي يقوم بها المراجع"}
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-[11px] list-none">
                      <li className="flex items-start gap-1">
                        <span className="text-orange-400">1.</span>
                        <span>{lang === "EN" ? "Screen Name of Directors & Owners." : "إدخال أسماء الملاك والمديرين للفحص الفوري."}</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-orange-400">2.</span>
                        <span>{lang === "EN" ? "Draft a Professional Justification ('مبرر') for any matches." : "كتابة مبرر مهني وواقعي تفصيلي عند ظهور أي تنبيه أو اشتباه."}</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-orange-400">3.</span>
                        <span>{lang === "EN" ? "Sign-off on the active client's report, linking to Pre-Engagement PE-6." : "توقيع واعتماد النتيجة لترحل تلقائياً لملف قبول العميل."}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AML Search & Scanner Controller Interface */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-2">
                  {lang === "EN" ? "STEP 1: DATABASE QUERY SEARCH" : "الخطوة الأولى: إدخال الاسم للبحث والاستعلام الأمني"}
                </span>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className={`absolute top-3 w-4 h-4 text-slate-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
                    <input
                      type="text"
                      value={amlSearch}
                      onChange={(e) => setAmlSearch(e.target.value)}
                      placeholder={lang === "EN" ? "Enter shareholder name, national ID, or company entity..." : "اكتب اسم الشريك المساهم، أو اسم الكيان التجاري، أو رقم تحقيق الهوية..."}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") triggerAMLSearch();
                      }}
                      className={`w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl py-2.5 text-xs font-bold text-slate-900 transition-all outline-none ${
                        isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={amlScoringLoading || !amlSearch.trim()}
                    onClick={triggerAMLSearch}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-orange-600/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {amlScoringLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === "EN" ? "Scanning registries..." : "جاري فحص القوائم..."}</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>{lang === "EN" ? "Execute Active Scan" : "تشغيل الفحص الأمني السريع"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Databases simulated labels */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">{lang === "EN" ? "Active Databases:" : "قواعد البيانات المفحوصة:"}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">UN Security Council Restriced List</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">US OFAC Consolidated SDN</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">EU Financial Freeze Directives</span>
                  <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 animate-pulse">
                    {lang === "EN" ? "Egyptian Terrorists & Restrictive Watchlists Law 8/2015" : "قوائم الكيانات الإرهابية ومكافحة غسل الأموال المصرية"}
                  </span>
                </div>
              </div>

              {/* AML Scan Loader Animation */}
              {amlScoringLoading && (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 flex flex-col items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-orange-500 animate-spin" />
                  <p className="text-xs font-black text-slate-800 animate-pulse">
                    {lang === "EN" 
                      ? "Interrogating international Interpol registries & Egyptian security directories..." 
                      : "جاري تفنيد ومطابقة الاسم مع السجلات القضائية المصرية والمنشورات الرسمية للنائب العام والبنك المركزي..."}
                  </p>
                  <div className="w-64 bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bg-orange-500 h-full animate-infinite animate-duration-1000 w-1/2 rounded-full"></div>
                  </div>
                </div>
              )}

              {/* AML Scan Output and Results Container */}
              {hasSearchedAML && !amlScoringLoading && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-lg">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wide font-sans">
                      {lang === "EN" ? "INTELLIGENCE REPORT SECTOR ANALYSIS" : "نتائج تقصى الحقائق وفحص الهوية"}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      {lang === "EN" ? `Found ${amlResults.length} match(es) for query` : `تطابقة مع تصفية البحث: ${amlResults.length}`}
                    </span>
                  </div>

                  {amlResults.map((res) => {
                    const resultKey = `${selectedClientId}_${res.fullName}`;
                    const customJustificationText = amlJustifications[resultKey] || "";
                    const isFlagged = res.status === "Flagged" && !amlVerifiedStatus[resultKey];
                    const isJustified = amlVerifiedStatus[resultKey] === "Justified";

                    return (
                      <div
                        key={res.id}
                        className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                          isFlagged
                            ? "border-red-350 shadow-sm"
                            : isJustified
                            ? "border-emerald-300 shadow-sm"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Core Match Card Header */}
                        <div className={`p-5 flex flex-col md:flex-row justify-between gap-4 ${
                          isFlagged ? "bg-red-50/40" : isJustified ? "bg-emerald-50/10" : "bg-white"
                        }`}>
                          <div className="flex-grow space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                              {isJustified ? (
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{lang === "EN" ? "RESOLVED / JUSTIFIED" : "تم التبرير وقبول الوضع"}</span>
                                </span>
                              ) : isFlagged ? (
                                <span className="bg-red-650 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                  ⚠ {res.status}
                                </span>
                              ) : (
                                <span className="bg-emerald-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full">
                                  {res.status}
                                </span>
                              )}

                              <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 border px-1.5 py-0.5 rounded">
                                Database Source: {res.listSource}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-slate-900">{res.fullName}</h4>
                            <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200" dir={isRtl ? "rtl" : "ltr"}>
                              {res.details}
                            </p>

                            {res.sources && res.sources.length > 0 && (
                              <div className="mt-3.5 space-y-2 p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 text-right" dir={isRtl ? "rtl" : "ltr"}>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pb-1">
                                  {lang === "EN" ? "🔍 Grounding Verification Sources:" : "🔍 مصادر معلومات التحقق المدعومة:"}
                                </span>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {res.sources.map((src, idx) => (
                                    <a
                                      key={idx}
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                                    >
                                      <Globe className="w-3.5 h-3.5" />
                                      <span>{src.title}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4 text-xs font-semibold text-slate-500 pt-2">
                              <span>{t.amlNationality}: <strong className="text-slate-800">{res.nationality}</strong></span>
                              <span>{lang === "EN" ? "Asset Profile" : "نوع الكيان"}: <strong className="text-slate-800">{res.type}</strong></span>
                            </div>
                          </div>

                          {/* Risk gauge or rating score */}
                          <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400">{t.amlScore}</span>
                            <span
                              className={`text-3xl font-black ${
                                isJustified ? "text-emerald-650" : res.riskScore > 70 ? "text-red-650" : "text-emerald-600"
                              }`}
                            >
                              {res.riskScore}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold block mt-1">
                              {isJustified 
                                ? (lang === "EN" ? "Risk mitigated" : "تم تخفيف الخطر")
                                : res.riskScore > 70 
                                ? (lang === "EN" ? "Extreme Alert Risk" : "خطر تنبيه حاد") 
                                : (lang === "EN" ? "Low clear profile" : "ملف آمن وسليم")}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Justification Box Form for Flagged Statuses */}
                        {isFlagged ? (
                          <div className="bg-red-50/20 border-t border-red-150 p-4 space-y-3 text-right" dir="rtl">
                            <div className="bg-red-50/80 p-3 rounded-lg border border-red-100 text-red-950 text-xs flex gap-2">
                              <AlertOctagon className="w-5 h-5 text-red-655 shrink-0" />
                              <div className="text-right">
                                <span className="font-extrabold block">
                                  {lang === "EN" ? "ACTION REQUIRED: Submit auditor professional justification!" : "طلب إجراء فوري: إدخال مبرر فوري للمراجعة المهنية ورفع التنبيه!"}
                                </span>
                                <span className="text-[11px] block text-red-900 leading-normal pt-0.5">
                                  {lang === "EN"
                                    ? "To proceed with this client and clear this alert, you must explicitly formulate the business or matching justification (e.g. Mismatched birthdate, identical namesake index check)."
                                    : "للسماح بالارتباط وغلق التنبيه، يُشترط دستورياً كتابة مستند المبرر المهني (مثل: تشابه أسماء ثلاثي فقط تم التحقق من هويته وجواز السفر واجتياز الوضع، أو مخاطر مقبولة مع مراقبة معتمدة من الشريك)."}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs font-semibold">
                              <label className="block text-slate-700 font-bold text-right">
                                {lang === "EN" ? "Auditor Professional Justification & Rationale Document" : "صياغة المبرر الفني المهني للملف الرقابي وتأشيرة القبول والاشتباه"}
                              </label>
                              <textarea
                                value={amlJustificationDrafts[res.fullName] || ""}
                                onChange={(e) => {
                                  const textVal = e.target.value;
                                  setAmlJustificationDrafts(prev => ({ ...prev, [res.fullName]: textVal }));
                                }}
                                placeholder={lang === "EN" 
                                  ? "Write precise argument. e.g. Birthdate of owner is 1985/05, whereas flagged entity was born in 1962. Discrepancy checked and approved by partner." 
                                  : "مثال: تم مضاهاة الرقم القومي للملاك وبينات محكمة الجنايات وتبين عدم تطابق الرقم القومي وتواريخ الميلاد والصفة القانونية؛ تشابه أسماء ثلاثي فقط."}
                                rows={3}
                                className="w-full bg-white border-2 border-slate-300 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-900 transition-all outline-none text-right font-medium"
                              />
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                disabled={!(amlJustificationDrafts[res.fullName] || "").trim()}
                                onClick={() => {
                                  const textVal = amlJustificationDrafts[res.fullName].trim();
                                  setAmlJustifications(prev => ({ ...prev, [resultKey]: textVal }));
                                  setAmlVerifiedStatus(prev => ({ ...prev, [resultKey]: "Justified" }));
                                  showToast(
                                    lang === "EN"
                                      ? `Justification saved for ${res.fullName}`
                                      : `تم تسجيل المبرر المهني الفني للاسم "${res.fullName}" واجتاز التحذير المكتوب!`,
                                    "success"
                                  );
                                }}
                                className="bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-black px-5 py-2 rounded-xl transition-all shadow-md shadow-indigo-650/10 cursor-pointer"
                              >
                                {lang === "EN" ? "✔ Save Justification & Clear Warning" : "✔ حفظ واعتماد المبرر وإغلاق التنبيه للملاءمة"}
                              </button>
                            </div>
                          </div>
                        ) : isJustified ? (
                          <div className="bg-emerald-50/30 border-t border-emerald-250 p-4 space-y-2 text-right animate-in fade-in active:slide-in-from-top-1" dir="rtl">
                            <span className="text-[10px] font-black text-emerald-800 uppercase block tracking-wider text-right">
                              {lang === "EN" ? "Saved compliance justification (Locked)" : "المبرر الرقابي المحفوظ للارتباط (معتمد وموثق)"}
                            </span>
                            <div className="bg-white/80 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 space-y-2 relative">
                              <p className="font-bold leading-relaxed text-right">{customJustificationText}</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                                <span className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>{lang === "EN" ? "Standard Compliance File Lock" : "مغلق بملف الالتزام العام"}</span>
                                </span>
                                <span>
                                  {lang === "EN" ? "Officer Status Stamp:" : "ختم الضابط المسؤول:"}{" "}
                                  <strong className="text-emerald-700 uppercase font-mono">Approved</strong>
                                </span>
                              </div>

                              {/* Button to edit or revoke the justified status */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAmlVerifiedStatus(prev => {
                                    const cpy = { ...prev };
                                    delete cpy[resultKey];
                                    return cpy;
                                  });
                                  showToast(lang === "EN" ? "Justification unlocked." : "تم إعادة فتح التنبيه للتعديل أو المسح وقبول فحص جديد.", "info");
                                }}
                                className="absolute top-2.5 right-2.5 text-[9px] text-red-655 hover:underline font-extrabold"
                              >
                                {lang === "EN" ? "Edit" : "تعديل المبرر"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AML Sign-Off Workflow Section - Connects directly with Pre-Engagement checklist item PE-6 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block">
                  {lang === "EN" ? "STEP 2: FORMAL REPORT COMPLIANCE SIGN-OFF" : "الخطوة الثانية: توقيع واعتماد تقرير فحص غسيل الأموال للعميل"}
                </span>

                {amlReportSignOffs[selectedClientId] ? (
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-250 p-6 rounded-2xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="inline-block bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-0.5 rounded-full uppercase">
                          {lang === "EN" ? "✔ COMPLIANCE SECURED (ISA 210/PE-6)" : "✔ تم التوقيع والاعتماد والتحقق للارتباط"}
                        </span>
                        <h4 className="text-base font-black text-slate-900 pt-1">
                          {lang === "EN" ? "Report authorized by Lead Engagement Officer" : "تم اعتماد سلامة الوضع بواسطة الشريك المسؤول"}
                        </h4>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-755 font-extrabold px-3 py-1 rounded-xl border border-emerald-250 font-mono">
                        {amlReportSignOffs[selectedClientId]?.hash}
                      </span>
                    </div>

                    <div className="bg-white/80 border border-slate-200/60 rounded-xl p-4 text-xs font-medium text-slate-800 space-y-2 text-right" dir="rtl">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">
                          {lang === "EN" ? "Authorized Signee & Status Details" : "الموقع وتوثيق الهوية للمعتمد"}
                        </span>
                        <span className="text-xs font-black text-slate-900 block pt-0.5 text-right">
                          {amlReportSignOffs[selectedClientId]?.signee}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">
                          {lang === "EN" ? "Authorization Timestamp" : "تاريخ ووقت التوقيع الرقمي الموثق"}
                        </span>
                        <span className="text-[11px] font-bold font-mono text-slate-700 block text-right">
                          {amlReportSignOffs[selectedClientId]?.timestamp}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">
                          {lang === "EN" ? "General Compliance Note" : "ملاحظات وإيضاحات المسؤول عن الالتزام"}
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed text-slate-900 text-right">
                          {amlReportSignOffs[selectedClientId]?.notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-3.5 rounded-xl gap-3">
                      <div className="text-[10px] text-slate-600 text-right" dir={isRtl ? "rtl" : "ltr"}>
                        {lang === "EN" 
                          ? "💡 Info: Pre-Engagement Checklist (Row A2 / PE-6) is linked. Re-opening this report will revert PE-6 status."
                          : "💡 توضيح: البند السادس (PE-6) بقائمة المتطلبات قبل بدء الارتباط تم إغلاقه مع التوقيع. إذا تراجعت عن التوقيع سيُفتح البند تلقائياً ليكون غير مكتمل."}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const revokeAMLReport = () => {
                            setAmlReportSignOffs(prev => ({
                              ...prev,
                              [selectedClientId]: null
                            }));

                            // Revert pe6 in active state
                            setPreEngagementItems(prev => {
                              const updated = prev.map(item => {
                                if (item.id === "pe6") {
                                  return {
                                    ...item,
                                    status: "In_Progress" as const,
                                    signee: "Pending",
                                    comments: lang === "EN" ? "Re-opened for additional screening scan files." : "تم إعادة فتح البند للمراجعة والتحقق."
                                  };
                                }
                                return item;
                              });

                              setClientPreEngagementItems(prevCls => ({
                                ...prevCls,
                                [selectedClientId]: updated
                              }));

                              return updated;
                            });

                            showToast(
                              lang === "EN" ? "Signature revoked. Report re-opened." : "تم إلغاء التوقيع المرفق. الملف مفتوح الآن لإعادة التحقق والتعديل.",
                              "info"
                            );
                          };
                          revokeAMLReport();
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-655 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer border border-red-200 whitespace-nowrap"
                      >
                        {lang === "EN" ? "Revoke Signature & Re-open Scan" : "إلغاء التوقيع لإعادة فحص الملف"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-250 p-5 space-y-4 font-sans text-xs">
                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-3.5 text-slate-800 leading-relaxed flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-650 shrink-0" />
                      <div className="text-right" dir="rtl">
                        <span className="font-extrabold block text-indigo-950">
                          {lang === "EN" ? "Approved and Stamped Compliance File Status" : "اعتماد النتيجة والتوقيع الرقمي للملف"}
                        </span>
                        <span className="text-[11px] text-slate-700 block leading-normal pt-0.5">
                          {lang === "EN"
                            ? "Upon completing the screening log verification and clearing potential flags via professional justification notes, sign the report below to commit the result to the Pre-Engagement Control Checklist (PE-6)."
                            : "عند الانتهاء من فحص الأسماء المستهدفة وتبرير أي تطابق، اكتب اسمك وملاحظتك بالأسفل ثم اضغط على 'توقيع التقرير' ليتم قفل البند (PE-6) وتحديث قائمة متطلبات القبول تلقائياً."}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-right md:col-span-2 space-y-2" dir="rtl">
                        <label className="block text-slate-750 font-black text-right text-xs">
                          {lang === "EN" ? "Lead Signatory Name & Title" : "اسم وتوقيع مراجع الالتزام المعتمد بالشركة"}
                        </label>
                        <input
                          type="text"
                          value={amlSigneeInput}
                          onChange={(e) => setAmlSigneeInput(e.target.value)}
                          placeholder="e.g. Jinan Kabbani, ACCA"
                          className="w-full max-w-md bg-white border border-slate-250 px-3,5 py-2.5 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-500 text-right"
                        />
                      </div>

                      <div className="text-right md:col-span-2 space-y-3.5" dir="rtl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <label className="block text-slate-755 font-black text-xs text-right">
                            {lang === "EN" ? "Ultimate Review Compliance Notes (Collapsible Standard Presets)" : "أوراق وملخص اعتماد الالتزام الرقابي (اسطمبات معتمدة كالمقاييس العالمية)"}
                          </label>
                          
                          {/* Template Dropdown Button */}
                          <div className="relative inline-block text-right w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                              className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-850 text-[11px] font-black px-4 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer text-right shadow-sm"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-650 animate-ping"></span>
                                <span>{lang === "EN" ? "📋 Select Standard Audit Preset / Stamps" : "📋 اختر من اسطمبات صياغة الالتزام النموذجية"}</span>
                              </span>
                              <ChevronDown className={`w-4 h-4 text-indigo-705 transition-transform ${showTemplateDropdown ? "rotate-180" : ""}`} />
                            </button>

                            {showTemplateDropdown && (
                              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-250 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all max-h-[350px] overflow-y-auto w-full sm:w-[500px] border-indigo-150">
                                <div className="bg-slate-55 px-4 py-2.5 border-b border-slate-150 flex justify-between items-center">
                                  <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wide font-sans">
                                    {lang === "EN" ? "Refinitiv/Lexis International Standards" : "اسطمبات وصيغ الالتزام المعيارية والنموذجية للملف"}
                                  </span>
                                  <span className="text-[9px] font-extrabold text-slate-400">
                                    {lang === "EN" ? "4 Templates Available" : "٤ قوالب جاهزة"}
                                  </span>
                                </div>
                                <div className="divide-y divide-slate-150">
                                  {[
                                    {
                                      id: "clean",
                                      title: lang === "EN" ? "Stamp 1: Ultimate Clean Direct Pass" : "صيغة ١: اجتياز فحص الالتزام السليم (خالٍ من المشتبهات)",
                                      desc: lang === "EN" ? "Verified clear profile against FBI, Interpol, and Egyptian databases." : "تم المطابقة والتحقق ضد مصلحة الأمن، والإنتربول، ومكتب الفيدرالي FBI، والوضع سليم تماماً.",
                                      text: lang === "EN"
                                        ? "Ultimate Law and Regulatory compliance audit successfully completed. The target entity was extensively screened against: (1) FBI Wanted & Regulatory lists, (2) Interpol Red Notices & Diffusions, (3) Egyptian Police & Ministry of Interior criminal records database, and (4) Egyptian Court judgments and official Gazettes of Terrorist lists. No active criminal indictments, money laundering, asset freezes, or terrorism designations detected. Status is verified CLEAR."
                                        : "تم إكمال التحقق الأمني والفحص الرقابي الشامل بنجاح مطلق لمكافحة غسيل الأموال وتمويل الإرهاب. تم عمل مطابقة فاعلة للاسم والتحقق منه بشكل متقاطع ومباشر ضد السجلات التالية: (1) قاعدة بيانات المطلوبين ومحاذير مكتب التحقيقات الفيدرالي الأمريكي FBI، (2) النشرات الحمراء لشرطة الجنايات الدولية (Interpol)، (3) قواعد بيانات وزارة الداخلية المصرية ومصالح الأمن العام (الشرطة المصرية)، (4) السجلات الرسمية لأحكام المحاكم المصرية والجنايات والجريدة الرسمية لقرارات إدراج الكيانات الإرهابية. النتيجة: لم يتم رصد أي سوابق جنائية، أو قضايا لغسيل الأموال، أو تجميد الأصول، أو إدراج نشط بقوائم الإرهاب. الاسم نظيف تماماً ومطابق لمعايير الامتثال الرقابي والأخلاقي."
                                    },
                                    {
                                      id: "namesake",
                                      title: lang === "EN" ? "Stamp 2: Namesake Discrepancy Mitigated" : "صيغة ٢: معالجة تشابه الأسماء وتبريره مهنياً",
                                      desc: lang === "EN" ? "Mismatched birth date or National ID confirms clean profile." : "اشتباه أولي بسبب تشابه الأسماء، وتم التحقق بطلب الرقم القومي وبطاقة الهوية وتاريخ الميلاد ومطابقتها وعزل الاشتباه.",
                                      text: lang === "EN"
                                        ? "Initial search query triggered a tentative namesake alert with high-profile records. After request and verification of official Identification documents (National ID/Passport) and comparison of birth dates against the security index logs, it is conclusively verified that this is a false-positive naming similarity. The true target has no relation to any listed individual, and the alert is closed with high auditor assurance."
                                        : "تم رصد اشتباه أولي نتيجة تشابه أسماء مع أشخاص مدرجين بقوائم الحظر. وبتحليل وثائق الهوية، الرقم القومي، ومقارنة تواريخ الميلاد وبيانات مصلحة الأحوال المدنية والأمن العام؛ تأكدنا بضمانة مهنية كاملة أنه تشابه أسماء ثلاثي/رباعي والاسم مستثنى من أي إجراء عقابي ورقابي ولا صلة له بالشخص المستهدف بملف القوائم."
                                    },
                                    {
                                      id: "entity",
                                      title: lang === "EN" ? "Stamp 3: Corporate Standing Clear Screen" : "صيغة ٣: فحص الكيانات القانونية والشركات السليمة",
                                      desc: lang === "EN" ? "Verify commercial registry against blacklists, shell indicators, & FRA." : "مطابق للسجلات التجارية وهيكل الملاك للشركات، ومعتمد ككيان قانوني سليم غير معطل بنظام الرقابة المالية والأمن العام.",
                                      text: lang === "EN"
                                        ? "The corporate legal entity was verified against the FRA (Financial Regulatory Authority) Warning Register, Central Bank of Egypt shell corporation blacklist, and international sanctions catalogs. Structural ownership was mapped and checked against military and public prohibited procurement lists. Legal standing is fully active and compliant; zero blacklistings or prohibited transaction indicators are detected."
                                        : "تم فحص الكيان القانوني للشركة وهيكل ملاكها ومقارنته بقواعد بيانات الهيئة العامة للرقابة المالية، وقوائم الجزاءات المشتركة، وقوائم شركات الظل الصادرة عن البنك المركزي المصري. الوضع القانوني للمنشأة سليم ونشط ومرخص بالكامل بالدولة، وتصنف بأنها منعدمة المخاطر وبلا مؤشرات سلبية تماماً."
                                    },
                                    {
                                      id: "edd",
                                      title: lang === "EN" ? "Stamp 4: Enhanced Due Diligence (EDD)" : "صيغة ٤: تفعيل العناية الواجبة المشددة والمتابعة المستمرة",
                                      desc: lang === "EN" ? "Recommend continuous monitoring due to high-risk business sectors." : "لم يتم العثور على مطابقة جنائية مباشرة، ولكن يوضع تحت المتابعة المشددة لنشاطه عالي السيولة أو علاقات PEP.",
                                      text: lang === "EN"
                                        ? "Enhanced Due Diligence (EDD) screening conducted under ISQM 1 procedures. While direct query returned no active sanctions listings across FBI, Interpol, or Egyptian Police files, the target operates in high-risk sectors or shares close exposure with Politically Exposed Persons (PEPs). Periodic screening and manual wire auditing are recommended under active engagement manager oversight."
                                        : "تم إجراء العناية المشددة المطلوبة للملف (EDD). فرغم خلو فحص الاسم بملف الإنتربول ومكتب التحقيقات الفيدرالي FBI وسجلات الشرطة والمحاكم المصرية من أي قرارات قضائية أو أمنية نشطة؛ إلا أن طبيعة المعاملات أو صلات القرابة تقتضي تفعيل فحص متكرر والتدقيق اليدوي المستمر بالمرفقات ربع السنوية."
                                    }
                                  ].map((tmpl) => (
                                    <button
                                      key={tmpl.id}
                                      type="button"
                                      onClick={() => {
                                        setAmlSignOffNotesInput(tmpl.text);
                                        setShowTemplateDropdown(false);
                                        showToast(
                                          lang === "EN" 
                                            ? `Template stamp applied: ${tmpl.id}` 
                                            : `تم تطبيق اسطمبة صياغة الالتزام بنجاح!`,
                                          "success"
                                        );
                                      }}
                                      className="w-full text-right p-3 hover:bg-slate-50 transition-colors block cursor-pointer border-b last:border-0"
                                    >
                                      <span className="block text-xs font-black text-indigo-900 mb-0.5">{tmpl.title}</span>
                                      <span className="block text-[10px] text-slate-500 font-medium leading-normal">{tmpl.desc}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={amlSignOffNotesInput}
                          onChange={(e) => setAmlSignOffNotesInput(e.target.value)}
                          placeholder={lang === "EN" ? "Select a preset stamp from the dropdown or type in custom compliance notes..." : "اختر كلمة 'اسطمبة' من الزر بالأعلى ليتم ملء التقرير نموذجياً، أو قم بكتابة وتعديل أوراق المراجعة ورأي مراجع الالتزام يدوياً..."}
                          className="w-full bg-white border border-slate-250 p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 text-right leading-relaxed border-2"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={!amlSigneeInput.trim()}
                        onClick={() => {
                          const signOffAMLReport = (signee: string, notes: string) => {
                            const hash = `AML-SHA256-REG-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                            const timestamp = new Date().toLocaleString(lang === "EN" ? "en-US" : "ar-EG");
                            
                            const signOffObj = {
                              signee,
                              timestamp,
                              hash,
                              notes: notes || "AML scan complete. Verified local and international risks clear or fully justified according to ISQM 1 procedures."
                            };

                            setAmlReportSignOffs(prev => ({
                              ...prev,
                              [selectedClientId]: signOffObj
                            }));

                            // Update Item pe6 in active state
                            setPreEngagementItems(prev => {
                              const updated = prev.map(item => {
                                if (item.id === "pe6") {
                                  return {
                                    ...item,
                                    status: "Completed" as const,
                                    signee: signee.split(",")[0].trim().slice(0, 5).toUpperCase(),
                                    comments: `${lang === "EN" ? "Approved by" : "تم الاعتماد بواسطة"} ${signee}. Hash: ${hash}. Note: ${notes}`
                                  };
                                }
                                return item;
                              });
                              
                              // Sync back to client dictionary as well
                              setClientPreEngagementItems(prevCls => ({
                                ...prevCls,
                                [selectedClientId]: updated
                              }));

                              return updated;
                            });

                            showToast(
                              lang === "EN"
                                ? `Successfully signed off AML Screening! Checklist Item Form A2/PE-6 has been verified and stamped.`
                                : `تم توقيع واعتماد الفحص الأمني لغسيل الأموال بنجاح! تم قفل وتعديل بند التحقق (PE-6) بقائمة المتطلبات.`,
                              "success"
                            );
                          };
                          signOffAMLReport(amlSigneeInput, amlSignOffNotesInput);
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-650/10 cursor-pointer flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{lang === "EN" ? "Authorize & Sign-Off Report" : "توقيع التقرير الأمني وإقفال البند رقابياً"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Query Archives logs */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-3.5">
                  {lang === "EN" ? "WORKSPACE AUDIT LOG HISTORY" : "أرشيف وسجل تاريخ الفحص المؤرشف للعملية الحالية"}
                </span>

                {!(amlSearchHistory[selectedClientId] || []).length ? (
                  <div className="border border-dashed border-slate-250 rounded-xl p-5 text-center text-slate-400 text-xs">
                    {lang === "EN"
                      ? "Empty log. Execute your first background screening queries to build the audit evidence trail."
                      : "لا توجد عمليات باحث سابقة محفوظة في الأرشيف للعميل التجاري المفتوح حالياً."}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-150 text-[10px] uppercase font-bold text-right">
                          <th className="px-4 py-2.5 text-right">{lang === "EN" ? "Query" : "الاسم المفحوص"}</th>
                          <th className="px-4 py-2.5 text-center">{lang === "EN" ? "Timestamp" : "تاريخ الفحص الفوري"}</th>
                          <th className="px-4 py-2.5 text-center">{lang === "EN" ? "Hits Counter" : "عدد التطابقات"}</th>
                          <th className="px-4 py-2.5 text-center">{lang === "EN" ? "Risk State" : "أعلى درجة خطر"}</th>
                          <th className="px-4 py-2.5 text-center">{lang === "EN" ? "Result Status" : "حالة الاجتياز النهائي"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {(amlSearchHistory[selectedClientId] || []).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-black text-slate-800 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setAmlSearch(log.query);
                                  showToast(lang === "EN" ? `Copied "${log.query}" to search field.` : `تم نسخ "${log.query}" لحقل البحث الرئيسي.`, "info");
                                }}
                                className="hover:underline text-indigo-650 cursor-pointer"
                              >
                                {log.query}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 font-mono text-[10px]">{log.timestamp}</td>
                            <td className="px-4 py-3 text-center text-slate-700">{log.resultsCount}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                log.highestRisk > 70 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                              }`}>
                                {log.highestRisk}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] ${
                                log.status.includes("alert") || log.status.includes("Alert") || log.status.includes("تنبيه")
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-50 text-emerald-800"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 6: Audit Programs & Procedures */}
          {activeTab === "procedures" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-6xl mx-auto">
              {/* Drag and Drop Zone Block */}
              <div 
                onDragEnter={(e) => {
                  e.preventDefault();
                  setProceduresDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setProceduresDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setProceduresDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setProceduresDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    processProceduresFile(file);
                  }
                }}
                onClick={() => !isReadingProcedures && document.getElementById("procedures-file-uploader")?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all flex flex-col items-center justify-center relative overflow-hidden cursor-pointer ${
                  isReadingProcedures ? "border-orange-500 bg-orange-50/50 cursor-wait" :
                  proceduresDragActive ? "border-orange-500 bg-orange-50/50" : "border-slate-250 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/10"
                }`}
              >
                <input
                  type="file"
                  id="procedures-file-uploader"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={handleImportProceduresFile}
                />

                {isReadingProcedures ? (
                  <div className="w-full h-full flex flex-col items-center justify-center py-2">
                    <RefreshCw className="w-9 h-9 text-orange-500 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-800 mb-1 leading-snug">
                      {lang === "EN" ? `Reading Procedures Data: ${proceduresReadingFileName}` : `جاري معالجة وقراءة إجراءات الملف: ${proceduresReadingFileName}`}
                    </p>
                    <p className="text-xs text-orange-600 font-extrabold mb-3">
                      {proceduresReadProgress}%
                    </p>
                    <div className="w-full bg-slate-250/80 h-1.5 rounded-full overflow-hidden max-w-[280px]">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-150 rounded-full" 
                        style={{ width: `${proceduresReadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {lang === "EN" ? "Sami AI ingesting custom guidelines & mapping testing assertions..." : "يقوم معالج سامي الذكي بربط البنود وفحص توجيهات المراجعة للتحقق الفني..."}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-xs border border-slate-100 mb-2">
                      <Upload className="w-7 h-7 text-orange-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 mb-1">
                      {lang === "EN" ? "Drag & Drop Substantive Procedures Ledger File Here" : "اسحب وأفلت ملف إجراءات التدقيق أو المراجعة الميدانية هنا"}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-md">
                      {lang === "EN" 
                        ? "Supports CSV/Excel. Drop your workbook to map smart audit procedures, or click to browse manually." 
                        : "يدعم ملفات إكسل و CSV المحتوية على بنود التدقيق والتحقق من أرصدة القوائم المالية لمطابقتها فوراً."}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.progTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === "EN"
                      ? "Full lists of substantive procedures checks, mapped directly to financial balance sheet assertions with auditor sign-offs."
                      : "سجل متكامل لكافة إجراءات المراجعة الميدانية والتحققات الحقلية الموزعة حسب الحسابات المالية وعمليات توقيع الموظفين."}
                  </p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <button
                    onClick={() => setLibraryOpen(true)}
                    className="p-2 rounded-xl text-white bg-gradient-to-r from-slate-900 to-slate-700 hover:from-black hover:to-slate-800 items-center justify-center inline-flex gap-1.5 text-xs font-bold cursor-pointer shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    {lang === "EN" ? "Ready-made Programs (Big-4)" : "برامج جاهزة (مكتبة البيغ فور)"}
                  </button>

                  <button
                    onClick={() => document.getElementById("procedures-file-uploader")?.click()}
                    className="p-2 border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 items-center justify-center inline-flex gap-1.5 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-4 h-4 text-orange-500" />
                    {lang === "EN" ? "Import Excel/CSV" : "استيراد ملف إكسل"}
                  </button>

                  <button
                    onClick={() => exportProceduresToCSV(false)}
                    className="p-2 border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 items-center justify-center inline-flex gap-1.5 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    {lang === "EN" ? "Export Filtered" : "تصدير المعروض"}
                  </button>
                </div>
              </div>

              {/* Filters + Selection toolbar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                  <FilterIcon className="w-3.5 h-3.5" />
                  {lang === "EN" ? "Filters:" : "تصفية:"}
                </div>
                <select
                  value={procFilterSection}
                  onChange={(e) => setProcFilterSection(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">{lang === "EN" ? "All cycles" : "كل الدورات"}</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Cash">Cash</option>
                  <option value="Assets">Assets</option>
                  <option value="Equity">Equity</option>
                </select>
                <select
                  value={procFilterStatus}
                  onChange={(e) => setProcFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">{lang === "EN" ? "All statuses" : "كل الحالات"}</option>
                  <option value="Pending">{lang === "EN" ? "Pending" : "معلق"}</option>
                  <option value="In Progress">{lang === "EN" ? "In Progress" : "قيد التنفيذ"}</option>
                  <option value="Completed">{lang === "EN" ? "Completed" : "مكتمل"}</option>
                </select>

                <span className="ml-2 text-slate-500 font-semibold">
                  {lang === "EN"
                    ? `${filteredProcedures.length} visible · ${selectedProcIds.size} selected`
                    : `${filteredProcedures.length} ظاهر · ${selectedProcIds.size} محدد`}
                </span>

                <div className="ms-auto flex flex-wrap gap-1.5">
                  <button
                    onClick={selectAllFiltered}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold inline-flex items-center gap-1 hover:bg-black"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-orange-400" />
                    {lang === "EN" ? "Select all filtered" : "تحديد الكل (المعروض)"}
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={selectedProcIds.size === 0}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold inline-flex items-center gap-1 disabled:opacity-40"
                  >
                    <Square className="w-3.5 h-3.5" />
                    {lang === "EN" ? "Clear" : "مسح"}
                  </button>
                  <button
                    onClick={saveSelectedToProject}
                    disabled={selectedProcIds.size === 0}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold inline-flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-40"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {lang === "EN" ? "Save to project" : "حفظ في المشروع"}
                  </button>
                  <button
                    onClick={loadSavedFromProject}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold inline-flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    {lang === "EN" ? "Load saved" : "تحميل المحفوظة"}
                  </button>
                  <button
                    onClick={() => exportProceduresToCSV(true)}
                    disabled={selectedProcIds.size === 0}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold inline-flex items-center gap-1 hover:bg-orange-600 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === "EN" ? "Export selected (CSV)" : "تصدير المحدد (CSV)"}
                  </button>
                </div>
              </div>

              {/* Add Custom Procedure bar */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 mb-6 text-xs">
                <h4 className="text-xs font-extrabold text-slate-700 mb-3 uppercase">{t.progAdd}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{t.progArea}</label>
                    <select
                      value={newProcArea}
                      onChange={(e) => setNewProcArea(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-semibold focus:outline-none focus:border-orange-500 text-slate-700"
                    >
                      <option value="Revenue">Revenue & Sales Cycle</option>
                      <option value="Cash">Cash & Bank Accounts</option>
                      <option value="Assets">Assets & PPE Additions</option>
                      <option value="Equity">Equity, Reserves & Debts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{t.progRef}</label>
                    <input
                      type="text"
                      value={newProcRef}
                      onChange={(e) => setNewProcRef(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{t.progAssertion}</label>
                    <input
                      type="text"
                      value={newProcAssertion}
                      onChange={(e) => setNewProcAssertion(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-orange-550 font-semibold text-slate-700"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newProcDesc.trim()) return;
                      const added: AuditProcedure = {
                        id: `p-${Date.now()}`,
                        section: newProcArea,
                        ref: newProcRef,
                        description: newProcDesc,
                        descriptionAr: `إجراء مخصص: ${newProcDesc}`,
                        assertion: newProcAssertion,
                        evidence: newProcEvidence || "Logistics records",
                        status: "Pending",
                      };
                      setProcedures((prev) => [...prev, added]);
                      setNewProcDesc("");
                      setNewProcEvidence("");
                      showToast(lang === "EN" ? "Procedure recorded!" : "تم تسجيل إجراء التدقيق بنجاح!", "success");
                    }}
                    className="bg-orange-500 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-orange-600 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 h-[34px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "EN" ? "Record" : "تسجيل البند"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{t.progDescription}</label>
                    <input
                      type="text"
                      value={newProcDesc}
                      onChange={(e) => setNewProcDesc(e.target.value)}
                      placeholder="e.g. Draw dynamic testing invoice schedules, compare shipping parameters to customer ledgers..."
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">{lang === "EN" ? "Expected Testing Evidence" : "أدلة الإثبات المطلوبة للفحص"}</label>
                    <input
                      type="text"
                      value={newProcEvidence}
                      onChange={(e) => setNewProcEvidence(e.target.value)}
                      placeholder="e.g. direct SWIFT statements logs, third-party courier dispatch records"
                      className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-semibold text-slate-700 opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* Procedures listings catalog */}
              <div className="space-y-6">
                {["Revenue", "Cash", "Assets", "Equity"].map((sect) => {
                  const filtered = filteredProcedures.filter((p) => p.section === sect);
                  if (filtered.length === 0) return null;
                  const allSelected = filtered.every(p => selectedProcIds.has(p.id));
                  const toggleSection = () => {
                    setSelectedProcIds(prev => {
                      const next = new Set(prev);
                      if (allSelected) filtered.forEach(p => next.delete(p.id));
                      else filtered.forEach(p => next.add(p.id));
                      return next;
                    });
                  };

                  return (
                    <div key={sect} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">{sect} Testing Cycle Programs</span>
                        <span className="text-[10px] text-slate-400 font-medium">({filtered.length} checks standard)</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left" dir={isRtl ? "rtl" : "ltr"}>
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold">
                              <th className="px-3 py-2.5 w-8">
                                <button onClick={toggleSection} title={lang === "EN" ? "Select all in section" : "تحديد الكل في القسم"}>
                                  {allSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                                </button>
                              </th>
                              <th className="px-4 py-2.5">Reference ID</th>
                              <th className="px-4 py-2.5">{t.progDescription}</th>
                              <th className="px-4 py-2.5">{t.progAssertion}</th>
                              <th className="px-4 py-2.5">{t.progEvidence}</th>
                              <th className="px-4 py-2.5">{t.progStatus}</th>
                              <th className="px-4 py-2.5">{t.progSignoff}</th>
                              <th className="px-4 py-2.5 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filtered.map((p) => (
                              <tr key={p.id} className={`hover:bg-slate-50/50 ${selectedProcIds.has(p.id) ? "bg-orange-50/40" : ""}`}>
                                <td className="px-3 py-3">
                                  <button onClick={() => toggleProcSelected(p.id)}>
                                    {selectedProcIds.has(p.id)
                                      ? <CheckSquare className="w-4 h-4 text-orange-500" />
                                      : <Square className="w-4 h-4 text-slate-400" />}
                                  </button>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-800 shrink-0">{p.ref}</td>
                                <td className="px-4 py-3 font-medium text-slate-800 max-w-sm">
                                  {lang === "EN" ? p.description : p.descriptionAr}
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono font-bold">{p.assertion}</td>
                                <td className="px-4 py-3 text-slate-500 italic font-sans">{p.evidence}</td>
                                <td className="px-4 py-3">
                                  <select
                                    value={p.status}
                                    onChange={(e) => {
                                      const val = e.target.value as any;
                                      setProcedures((prev) =>
                                        prev.map((item) =>
                                          item.id === p.id
                                            ? {
                                                ...item,
                                                status: val,
                                                signOffBy: val === "Completed" ? "Sami Al-Dabour" : "",
                                              }
                                            : item
                                        )
                                      );

                                      // Real automation: completing a procedure auto-generates
                                      // (or updates) its linked workpaper — no manual data entry,
                                      // matching how PwC Aura / TeamMate link fieldwork to the file.
                                      if (val === "Completed") {
                                        const wpRef = p.workpaperRef || `WP-${p.ref}`;
                                        setWorkpapers((prevWp) => {
                                          const existing = prevWp.find((w) => w.ref === wpRef);
                                          if (existing) {
                                            return prevWp.map((w) =>
                                              w.ref === wpRef
                                                ? {
                                                    ...w,
                                                    status: "Completed",
                                                  }
                                                : w
                                            );
                                          }
                                          const autoWp: Workpaper = {
                                            id: `wp-auto-${p.id}`,
                                            ref: wpRef,
                                            title: lang === "EN" ? p.description : p.descriptionAr,
                                            section: p.section,
                                            status: "Completed",
                                            contentMarkdown: `### ${p.description}\n**Audit Program Ref**: ${p.ref}\n**Assertion**: ${p.assertion}\n**Evidence Obtained**: ${p.evidence}\n**Prepared/Signed off by**: Sami Al-Dabour\n\n#### Objective\nTest the "${p.assertion}" assertion for the "${p.section}" audit area per the planned procedure.\n\n#### Work Performed\nAuto-generated from the completed audit program step. Procedure marked Completed and evidence referenced above obtained and reviewed.\n\n#### Conclusion\nBased on procedures performed, no exceptions were noted that would require further audit attention beyond what is documented in the Findings register.`,
                                            contentMarkdownAr: `### ${p.descriptionAr}\n**مرجع برنامج المراجعة**: ${p.ref}\n**الإقرار محل الفحص**: ${p.assertion}\n**الأدلة التي تم الحصول عليها**: ${p.evidence}\n**تم الإعداد والتوقيع بواسطة**: سامي الدبور\n\n#### الهدف\nاختبار إقرار "${p.assertion}" لمجال "${p.section}" وفقاً للإجراء المخطط.\n\n#### العمل المنفذ\nتم توليدها تلقائياً من خطوة برنامج المراجعة المكتملة. تم تحديد الإجراء كمكتمل ومراجعة الأدلة المشار إليها أعلاه.\n\n#### الخلاصة\nبناءً على الإجراءات المنفذة، لم تُلاحظ استثناءات جوهرية تستوجب إجراءات إضافية بخلاف ما هو موثق في سجل الملاحظات.`,
                                          };
                                          return [...prevWp, autoWp];
                                        });
                                      }
                                    }}
                                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-bold text-[10px] text-slate-700 cursor-pointer"
                                  >
                                    <option value="Completed">{lang === "EN" ? "Completed" : "مكتمل"}</option>
                                    <option value="In Progress">{lang === "EN" ? "In Progress" : "قيد التنفيذ"}</option>
                                    <option value="Pending">{lang === "EN" ? "Pending" : "معلق"}</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700 font-sans">
                                  {p.signOffBy ? (
                                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      {p.signOffBy}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">Not Approved</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => setProcedures((prev) => prev.filter((x) => x.id !== p.id))}
                                    className="text-slate-450 hover:text-red-500 cursor-pointer p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              <ProceduresLibraryModal
                open={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                lang={lang}
                existingRefs={procedures.map(p => p.ref)}
                onAdd={(newProcs) => {
                  setProcedures(prev => [...prev, ...newProcs]);
                  showToast(
                    lang === "EN"
                      ? `Added ${newProcs.length} Big-4 procedure(s) to the audit program.`
                      : `تم إضافة ${newProcs.length} إجراء من مكتبة البيغ فور إلى برنامج التدقيق.`,
                    "success"
                  );
                }}
              />
            </div>
          )}

          {/* Tab 7: Workpaper Locker Storage */}
          {activeTab === "workpapers" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
              
              {/* Left Locker files sidebar */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <h4 className="text-sm font-black text-slate-900">{lang === "EN" ? "Workpaper Locker Cabinet" : "خزانة أوراق العمل الحقلية"}</h4>
                  <button
                    onClick={() => {
                      const titlePrompt = prompt(lang === "EN" ? "Audit paper reference Title name:" : "اسم موضوع ورقة العمل الجديد:");
                      if (titlePrompt) {
                        const newRef = `WP-DAB-${100 + workpapers.length + 1}`;
                        const customPaper: Workpaper = {
                          id: `wp-${Date.now()}`,
                          ref: newRef,
                          title: titlePrompt,
                          section: "Standard Audit Fieldwork",
                          status: "Draft",
                          contentMarkdown: `### ${titlePrompt}\n**Audit Program Reference Ref**: ${newRef}\n\n#### Testing Statement of Objective\n...\n\n#### Documentation of Substantive Vouching Work Done\n...`,
                        };
                        setWorkpapers((prev) => [...prev, customPaper]);
                        setSelectedWorkpaperId(customPaper.id);
                      }
                    }}
                    className="p-1 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg text-xs hover:text-orange-950 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{lang === "EN" ? "New" : "جديد"}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {workpapers.map((w) => {
                    const isSelected = w.id === selectedWorkpaperId;
                    return (
                      <div
                        key={w.id}
                        onClick={() => {
                          setSelectedWorkpaperId(w.id);
                          setIsEditingWorkpaper(false);
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/50 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono font-bold text-[10px] text-orange-655">{w.ref}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              w.status === "Completed"
                                ? "bg-green-150 text-green-750"
                                : w.status === "In Review"
                                ? "bg-amber-150 text-amber-750"
                                : "bg-blue-150 text-blue-750"
                            }`}
                          >
                            {lang === "AR" ? arWpStatus(w.status) : w.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-black text-slate-800 leading-snug">{lang === "AR" ? arWpTitle(w) : w.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-1">{lang === "AR" ? arWpSection(w) : w.section}</p>

                        {w.checkedBy && (
                          <div className="mt-2 text-[9px] text-slate-450 bg-slate-50 px-2 py-1 rounded-md inline-flex items-center gap-1 border border-slate-200/50">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span>{t.checkedOutBy}: <strong className="text-slate-700 font-black">{w.checkedBy}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Document visual Workspace with Markdown editable structure */}
              {!activeWorkpaper ? (
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col items-center justify-center h-[480px] gap-2 text-center px-6">
                  <FileText className="w-8 h-8 text-slate-300" />
                  <p className="text-sm font-black text-slate-500">
                    {lang === "EN" ? "No workpapers yet for this client" : "لا توجد أوراق عمل بعد لهذا العميل"}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {lang === "EN"
                      ? "Create a new workpaper from the panel on the left to get started."
                      : "قم بإنشاء ورقة عمل جديدة من اللوحة على اليسار للبدء."}
                  </p>
                </div>
              ) : (
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                <div className="bg-slate-900 px-5 py-3.5 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-orange-400 font-bold">{activeWorkpaper.ref}</span>
                    <h4 className="text-xs font-black text-slate-100">{lang === "AR" ? arWpTitle(activeWorkpaper) : activeWorkpaper.title}</h4>
                  </div>

                  <div className="flex gap-2">
                    {/* Check In / Out state indicators */}
                    {activeWorkpaper.checkedBy ? (
                      <button
                        onClick={() => {
                          setWorkpapers((prev) =>
                            prev.map((x) =>
                              x.id === activeWorkpaper.id ? { ...x, checkedBy: undefined, checkedOutAt: undefined } : x
                            )
                          );
                          setIsEditingWorkpaper(false);
                          showToast(lang === "EN" ? "File checked-in and changes synced successfully!" : "تمت إعادة تسليم الملف بنجاح وحفظ التعديلات!", "success");
                        }}
                        className="bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] items-center inline-flex gap-1 shadow-sm font-sans hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3" />
                        {t.checkin}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const userCode = prompt(lang === "EN" ? "Enter your Auditor code initials to check-out:" : "أدخل الرمز التعريفي للمدقق لسحب الملف:");
                          if (userCode) {
                            setWorkpapers((prev) =>
                              prev.map((x) =>
                                x.id === activeWorkpaper.id
                                  ? { ...x, checkedBy: userCode, checkedOutAt: new Date().toISOString() }
                                  : x
                              )
                            );
                            setEditingContent((lang === "AR" ? arWpContent(activeWorkpaper) : activeWorkpaper.contentMarkdown) || "");
                            setIsEditingWorkpaper(true);
                          }
                        }}
                        className="bg-orange-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] items-center inline-flex gap-1 shadow-sm font-sans hover:bg-orange-600 transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        {t.checkout}
                      </button>
                    )}

                    {/* Change Status select */}
                    <select
                      value={activeWorkpaper.status}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setWorkpapers((prev) =>
                          prev.map((x) => (x.id === activeWorkpaper.id ? { ...x, status: val } : x))
                        );
                      }}
                      className="bg-slate-800 text-white border-none text-[10px] px-2 py-1 rounded-lg font-bold outline-none cursor-pointer"
                    >
                      <option value="Draft">Draft status</option>
                      <option value="In Review">In Review status</option>
                      <option value="Completed">Completed status</option>
                    </select>
                  </div>
                </div>

                {/* Markdown editor work area */}
                {isEditingWorkpaper ? (
                  <div className="p-5 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {lang === "EN" ? "EDIT SKELETON (MARKDOWN PREVIEW SUPPORT)" : "مساحة تحرير القوالب المادية"}
                      </span>
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black">
                        {lang === "EN" ? "Locked for Single Editing" : "مفتوح حصرياً للتحرير الفردي للمدقق"}
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:bg-white focus:border-orange-500 flex-1"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditingWorkpaper(false);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        {lang === "EN" ? "Discard Changes" : "تراجع"}
                      </button>
                      <button
                        onClick={() => {
                          setWorkpapers((prev) =>
                            prev.map((x) =>
                              x.id === activeWorkpaper.id ? { ...x, contentMarkdown: editingContent } : x
                            )
                          );
                          setIsEditingWorkpaper(false);
                          showToast(lang === "EN" ? "Drafted workpaper edits saved!" : "تم حفظ التعديلات في مسودة ورقة العمل!", "success");
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        {lang === "EN" ? "Save Edits" : "حفظ التعديلات"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 h-[480px] overflow-y-auto bg-slate-50/15 text-justify font-sans select-text" dir={lang === "AR" ? "rtl" : "ltr"}>
                    {((lang === "AR" ? arWpContent(activeWorkpaper) : activeWorkpaper.contentMarkdown) || "").length > 0 ? (
                      ((lang === "AR" ? arWpContent(activeWorkpaper) : activeWorkpaper.contentMarkdown) || "").split("\n").map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("###")) {
                          return <h3 key={idx} className="text-base font-black text-slate-800 mt-4 mb-2 pb-1 border-b border-slate-100">{trimmed.replace("### ", "")}</h3>;
                        }
                        if (trimmed.startsWith("####")) {
                          return <h4 key={idx} className="text-sm font-bold text-slate-700 mt-3 mb-1.5">{trimmed.replace("#### ", "")}</h4>;
                        }
                        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                          return (
                            <ul key={idx} className="list-disc pl-5 my-1 text-xs text-slate-700 font-sans">
                              <li>{trimmed.replace(/^[\s*-]+/, "")}</li>
                            </ul>
                          );
                        }
                        if (trimmed.startsWith("|")) {
                          const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
                          if (line.includes("---")) return null;
                          return (
                            <div key={idx} className="overflow-x-auto border-b border-x border-slate-150/50 bg-white first:rounded-t last:rounded-b my-0.5">
                              <table className="min-w-full text-[11px]">
                                <tbody>
                                  <tr className="divide-x divide-slate-100">
                                    {cells.map((c, i) => (
                                      <td key={i} className="px-3 py-1.5 text-slate-850 font-medium">{c}</td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (trimmed.length > 0) {
                          return <p key={idx} className="text-xs text-slate-655 my-1.5 leading-relaxed">{trimmed}</p>;
                        }
                        return <div key={idx} className="h-2" />;
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">{lang === "AR" ? "لا يوجد محتوى مسجل بعد داخل قالب مساحة عمل هذا المستند." : "No content recorded yet inside this audit document template workspace."}</p>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
          )}

          {/* Findings & Observations — auto-generated from TB/FS analysis, flows into Final Report */}
          {activeTab === "findings" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-red-500" />
                      {lang === "EN" ? "Findings & Observations" : "الملاحظات والنتائج"}
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">
                      {lang === "EN"
                        ? "Auto-generated from Trial Balance & Financial Statement analysis (ISA 315/320/570). Automatically flows into the Final Report."
                        : "يتم توليدها تلقائياً من تحليل ميزان المراجعة والقوائم المالية. تنتقل تلقائياً إلى التقرير النهائي."}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-black">
                    {findings.filter(f => f.status === "Open").length} {lang === "EN" ? "Open" : "مفتوحة"}
                  </span>
                </div>

                {findings.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <AlertOctagon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold">
                      {lang === "EN" ? "No findings yet" : "لا توجد ملاحظات بعد"}
                    </p>
                    <p className="text-xs mt-1">
                      {lang === "EN"
                        ? "Upload a Trial Balance under TB & Analysis to auto-generate findings."
                        : "قم برفع ميزان المراجعة من شاشة الميزان والتحليل لتوليد الملاحظات تلقائياً."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {findings.map((f) => (
                      <div key={f.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              f.severity === "High" ? "bg-red-100 text-red-700" :
                              f.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
                            }`}>
                              {f.severity}
                            </span>
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">{f.area}</span>
                            {f.autoGenerated && (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-violet-600">
                                <Sparkles className="w-3 h-3" /> {lang === "EN" ? "Auto" : "تلقائي"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900">{lang === "AR" ? f.titleAr : f.title}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{lang === "AR" ? f.descriptionAr : f.description}</p>
                        </div>
                        <select
                          value={f.status}
                          onChange={(e) => {
                            const updated = findings.map(x => x.id === f.id ? { ...x, status: e.target.value as "Open" | "Resolved" } : x);
                            saveFindings(selectedClientId, updated);
                          }}
                          className="bg-white border border-slate-200 rounded px-2 py-1 font-bold text-[10px] text-slate-700 cursor-pointer shrink-0"
                        >
                          <option value="Open">{lang === "EN" ? "Open" : "مفتوحة"}</option>
                          <option value="Resolved">{lang === "EN" ? "Resolved" : "تمت المعالجة"}</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 8: Planning, team & milestones */}
          {(activeTab === "overview" || activeTab === "planning") && (
            <div id="team-hub-anchor" className="space-y-6 max-w-5xl mx-auto">
              
              {/* Timeline schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  {t.milestones}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {milestones.map((mil, idx) => (
                    <div key={mil.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Phase {idx + 1}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              mil.status === "Completed"
                                ? "bg-green-150 text-green-750"
                                : mil.status === "Active"
                                ? "bg-orange-150 text-orange-750"
                                : "bg-slate-200 text-slate-650"
                            }`}
                          >
                            {mil.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-slate-800 mb-3">
                          {lang === "EN" ? mil.title : mil.titleAr}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-150/50 mt-2 flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Due: {mil.dueDate}</span>
                        <span className="text-slate-700">{mil.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team members allocation program */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left col: Add new auditor form & quick tools */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
                      <UserPlus className="w-4 h-4 text-orange-500 font-bold" />
                      <span>{lang === "EN" ? "Join New Auditor" : "إضافة مراجع جديد للفريق"}</span>
                    </h3>

                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1 font-bold">
                          {lang === "EN" ? "Full Name" : "اسم المراجع الكامل"}
                        </label>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="e.g. Jinan Kabbani, ACCA"
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 font-bold">
                          {lang === "EN" ? "Audit Role Scale" : "الرتبة والمسؤولية في الارتباط"}
                        </label>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-orange-500"
                        >
                          <option value="Senior Auditor">{lang === "EN" ? "Senior Auditor" : "رئيس فريق مراجعين"}</option>
                          <option value="Audit Manager">{lang === "EN" ? "Audit Manager" : "مدير تدقيق مالي"}</option>
                          <option value="Junior Associate">{lang === "EN" ? "Junior Associate" : "مراجع مساعد"}</option>
                          <option value="Engagement Partner">{lang === "EN" ? "Engagement Partner" : "شريك الارتباط المسؤول"}</option>
                          <option value="Sami AI Copilot">{lang === "EN" ? "Sami AI Copilot" : "مساعد الذكاء الاصطناعي سامي"}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 font-bold">
                          {lang === "EN" ? "Initial Allocated Areas (comma-separated)" : "أوراق العمل والمهام الأولية (مفصولة بفاصلة)"}
                        </label>
                        <input
                          type="text"
                          value={newMemberAreas}
                          onChange={(e) => setNewMemberAreas(e.target.value)}
                          placeholder="Revenue & Receivables, Cash Testing..."
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                        <span className="text-[9px] text-slate-400 mt-1 block leading-relaxed">
                          {lang === "EN" ? "You can also allocate these areas dynamically below on the strategy board map." : "يمكنك أيضاً ربط المراجع بمجالات التدقيق مباشرة من خريطة العمل أدناه."}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{lang === "EN" ? "Deploy to Engagement Team" : "تعيين وإضافته للفريق مراجعاً"}</span>
                      </button>
                    </div>
                  </div>

                  {/* ISA & Planning Core Guidelines */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                      {lang === "EN" ? "Audit Strategy Rules (ISA 300)" : "استراتيجية وخطة المراجعة (معيار ٣٠٠)"}
                    </h3>
                    <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">
                      {lang === "EN"
                        ? "Under ISA 300, the auditor must establish an overall audit strategy that sets the scope, timing and direction of the audit, and guides the development of the audit plan."
                        : "يتطلب معيار التدقيق الدولي ٣٠٠ من شريك التدقيق رسم الاستراتيجية العامة التي تحدد نطاق وتوقيت وتوجيه فحص البيانات، وتوزيع المهام على فريق العمل لضمان توثيق كافي وتغطية متكاملة."}
                    </p>
                  </div>
                </div>

                {/* Right columns: Team list & Dynamic Mapping board */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Current Active Team */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span>{t.teamAssigned}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {team.map((mem) => {
                        const isEditing = editingMemberId === mem.id;
                        return (
                          <div key={mem.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-3 relative group">
                            
                            {!isEditing && (
                              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Edit team member button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMemberId(mem.id);
                                    setEditMemberName(mem.name);
                                    setEditMemberRole(mem.role);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-1 rounded cursor-pointer"
                                  title={lang === "EN" ? "Edit details" : "تعديل المراجع"}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete team member (safety constraint check) */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeamMember(mem.id)}
                                  className="text-slate-400 hover:text-red-650 transition-colors p-1 hover:bg-red-50 rounded cursor-pointer"
                                  title={lang === "EN" ? "Remove team member" : "إقصاء من الفريق"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                              {mem.name.split(" ")[0].substring(0, 1)}
                              {mem.name.split(" ")[1] ? mem.name.split(" ")[1].substring(0, 1) : ""}
                            </div>

                            <div className="space-y-2 flex-1 text-xs">
                              {isEditing ? (
                                <div className="space-y-2 font-sans">
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                      {lang === "EN" ? "Auditor Name" : "اسم المراجع"}
                                    </label>
                                    <input
                                      type="text"
                                      value={editMemberName}
                                      onChange={(e) => setEditMemberName(e.target.value)}
                                      className="w-full bg-white border border-slate-200 px-2.5 py-1 rounded text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                      {lang === "EN" ? "Role & Title" : "الرتبة والمسؤولية"}
                                    </label>
                                    <select
                                      value={editMemberRole}
                                      onChange={(e) => setEditMemberRole(e.target.value as any)}
                                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-[11px] font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-orange-500"
                                    >
                                      <option value="Senior Auditor">{lang === "EN" ? "Senior Auditor" : "رئيس فريق مراجعين"}</option>
                                      <option value="Audit Manager">{lang === "EN" ? "Audit Manager" : "مدير تدقيق مالي"}</option>
                                      <option value="Junior Associate">{lang === "EN" ? "Junior Associate" : "مراجع مساعد"}</option>
                                      <option value="Engagement Partner">{lang === "EN" ? "Engagement Partner" : "شريك الارتباط المسؤول"}</option>
                                      <option value="Sami AI Copilot">{lang === "EN" ? "Sami AI Copilot" : "مساعد الذكاء الاصطناعي سامي"}</option>
                                    </select>
                                  </div>
                                  <div className="flex gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveTeamMemberEdit(mem.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] cursor-pointer"
                                    >
                                      {lang === "EN" ? "Save" : "حفظ"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingMemberId(null)}
                                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[10px] cursor-pointer"
                                    >
                                      {lang === "EN" ? "Cancel" : "إلغاء"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="pr-12">
                                    <h4 className="font-bold text-slate-900 leading-tight">{mem.name}</h4>
                                    <span className="text-[9px] text-orange-700 font-extrabold block mt-0.5 uppercase tracking-wider">
                                      {mem.role === "Senior Auditor" && (lang === "EN" ? "Senior Auditor" : "رئيس فريق مراجعين")}
                                      {mem.role === "Audit Manager" && (lang === "EN" ? "Audit Manager" : "مدير تدقيق مالي")}
                                      {mem.role === "Junior Associate" && (lang === "EN" ? "Junior Associate" : "مراجع مساعد")}
                                      {mem.role === "Engagement Partner" && (lang === "EN" ? "Engagement Partner" : "شريك الارتباط المسؤول")}
                                      {mem.role === "Sami AI Copilot" && (lang === "EN" ? "Sami AI Copilot" : "مساعد الذكاء الاصطناعي سامي")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 pt-2 border-t border-slate-150">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Areas Coverage / المسؤوليات</span>
                                    <div className="flex flex-wrap gap-1">
                                      {mem.assignedAreas.map((area, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-bold text-slate-700 rounded-md flex items-center gap-1">
                                          <span>{area}</span>
                                          <button 
                                            type="button" 
                                            onClick={() => handleToggleAreaForMember(mem.id, area)}
                                            className="text-slate-400 hover:text-red-500 font-extrabold ml-0.5 text-[8px] cursor-pointer"
                                            title="Unassign area"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Audit Strategy Coverage & Risk Mapping Board */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span>{lang === "EN" ? "Interactive Audit Mapping & Strategy Board" : "خريطة موازنة مراجعي الفريق وتغطية أوراق العمل"}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">
                        {lang === "EN" 
                          ? "Deploy and map specific auditors to standard audit risk programs below. Unassigned programs trigger instant compliance alerts."
                          : "قم بتوجيه وإسناد المراجعين مباشرة إلى بنود أوراق العمل والخريطة أدناه للتأكد من تغطية الإيرادات والمطابقات الفنية."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: "Revenue & Receivables", labelAr: "الإيرادات والحسابات المدينة (بنود المبيعات)", labelEn: "Revenue & Receivables Verification" },
                        { key: "Substantive Cash Test", labelAr: "مطابقة النقدية والبنك والصندوق", labelEn: "Substantive Cash Test & Confirmations" },
                        { key: "Vouching", labelAr: "مطابقة المصاريف والمستندات بالفواتير (المشتريات والمصاريف المباشرة)", labelEn: "Vouching Purchases & Direct Expenses" },
                        { key: "Inventory & Stock Count", labelAr: "المخزون والجرد الميداني في المستودعات", labelEn: "Inventory Stock Count & Valuation" },
                        { key: "Fixed Assets & CapEx", labelAr: "مراجعة الأصول الثابتة والتحقق من المشتريات الرأسمالية", labelEn: "Fixed Assets & Capital Investment Testing" },
                        { key: "Pre-Engagement Checks", labelAr: "قبول التكليف وجودة الارتباط وشروط الاستقلالية", labelEn: "Pre-Engagement checks & ISQM compliance" },
                        { key: "Risk Map", labelAr: "تقييم خريطة ومصفوفة المخاطر الملازمة", labelEn: "Inherent Risk Map Modeling" },
                        { key: "Materiality Review", labelAr: "مراجعة نطاق وأوراق عمل الأهمية النسبية", labelEn: "Materiality Review & Performance Threshold" }
                      ].map((area) => {
                        // Find who is assigned
                        const assignedMembers = team.filter(m => 
                          m.assignedAreas.some(a => a.toLowerCase().includes(area.key.toLowerCase()) || area.key.toLowerCase().includes(a.toLowerCase()))
                        );

                        // Find who is available to assign
                        const unassignedMembers = team.filter(m => 
                          !m.assignedAreas.some(a => a.toLowerCase().includes(area.key.toLowerCase()) || area.key.toLowerCase().includes(a.toLowerCase()))
                        );

                        return (
                          <div key={area.key} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs leading-normal">
                            <div className="space-y-1 flex-1">
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                {area.key}
                              </span>
                              <h4 className="font-bold text-slate-800 font-sans mt-1">
                                {lang === "EN" ? area.labelEn : area.labelAr}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* List currently assigned */}
                              <div className="flex items-center gap-1">
                                {assignedMembers.length === 0 ? (
                                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{lang === "EN" ? "Gap - Unassigned" : "فجوة - غير مسند لأحد"}</span>
                                  </span>
                                ) : (
                                  assignedMembers.map(m => (
                                    <div 
                                      key={m.id} 
                                      className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200/50 text-indigo-950 font-extrabold text-[9px] flex items-center gap-1"
                                      title={`${m.name} (${m.role})`}
                                    >
                                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[8px] uppercase">
                                        {m.name.charAt(0)}
                                      </div>
                                      <span>{m.name.normalize()}</span>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Assign Dropdown actions */}
                              <div>
                                {unassignedMembers.length > 0 ? (
                                  <select
                                    onChange={(e) => {
                                      const memId = e.target.value;
                                      if (memId) {
                                        handleToggleAreaForMember(memId, area.key);
                                        e.target.value = ""; // reset
                                        showToast(lang === "EN" ? "Auditor mapped to strategy list!" : "تم ربط وتعيين المراجع في خريطة التدقيق بنجاح!", "success");
                                      }
                                    }}
                                    defaultValue=""
                                    className="bg-white border border-slate-200 text-[10px] font-black px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700"
                                  >
                                    <option value="" disabled>
                                      {lang === "EN" ? "+ Map Auditor" : "+ إسناد مراجع"}
                                    </option>
                                    {unassignedMembers.map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.name}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[9px] text-slate-400 font-semibold">{lang === "EN" ? "All team mapped" : "جميع مراجعي الفريق مسندين مسبقاً"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Tab: Analysis Workspace — interactive analytics + files */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              {/* IDEA 13 / PwC Halo launcher */}
              <div className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-5 flex items-center justify-between text-white" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7" />
                  <div>
                    <h3 className="text-base font-black">
                      {lang === "EN" ? "Sami & Zaza — CAATs Suite" : "أدوات سامي وظاظا — تقنيات التدقيق بالحاسوب"}
                    </h3>
                    <p className="text-xs opacity-90">
                      {lang === "EN"
                        ? "Benford · Duplicates · Sequence gaps · MUS · Random sample · Stratification · Weekend & round-number tests"
                        : "بنفورد · المكرر · فجوات التسلسل · MUS · العشوائية · التقسيم الطبقي · قيود نهاية الأسبوع والمدوّرة"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIdeaHalo(true)}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 shadow"
                >
                  <Sparkles className="w-4 h-4" />
                  {lang === "EN" ? "Open Tools" : "افتح الأدوات"}
                </button>
              </div>

              <AnalysisWorkspace
                clientId={selectedClientId}
                clientName={lang === "EN" ? currentClient.name : currentClient.arabicName}
                clientIndustry={currentClient.industry}
                lang={lang}
              />


              {/* Client-attached files (kept from before) */}
              <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-orange-500" />
                    <span>
                      {lang === "EN" ? "Files attached to this client" : "الملفات المرفقة بملف هذا العميل"}
                    </span>
                  </h3>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === "EN" ? "Attach file" : "إرفاق ملف"}</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        const newOnes: ClientFile[] = files.map((f, i) => ({
                          id: `f-${Date.now()}-${i}`,
                          name: f.name,
                          size: f.size,
                          addedAt: new Date().toISOString(),
                        }));
                        setClientFiles((prev) => ({
                          ...prev,
                          [selectedClientId]: [...(prev[selectedClientId] || []), ...newOnes],
                        }));
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {(clientFiles[selectedClientId] || []).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    {lang === "EN"
                      ? "No files attached yet. Use Attach file or Roll-Forward to add."
                      : "لا توجد ملفات مرفقة بعد. استخدم زر إرفاق ملف أو نافذة الترحيل لإضافتها."}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {(clientFiles[selectedClientId] || []).map((f) => (
                      <li key={f.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 truncate">{f.name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>{(f.size / 1024).toFixed(1)} KB</span>
                              {f.taskId && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                                  {PRIOR_YEAR_REVIEW_TASKS.find((t) => t.id === f.taskId)?.isa}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setClientFiles((prev) => ({
                              ...prev,
                              [selectedClientId]: (prev[selectedClientId] || []).filter((x) => x.id !== f.id),
                            }))
                          }
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Prior-year review status */}
              <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6" dir={isRtl ? "rtl" : "ltr"}>
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  <span>
                    {lang === "EN"
                      ? "Prior-year audit tasks (ISA compliance)"
                      : "مهام مراجعة السنة السابقة (وفق معايير ISA)"}
                  </span>
                </h3>
                <div className="space-y-2">
                  {PRIOR_YEAR_REVIEW_TASKS.map((task) => {
                    const checked = !!clientPriorReview[selectedClientId]?.[task.id];
                    return (
                      <label
                        key={task.id}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          checked ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-150 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setClientPriorReview((prev) => ({
                              ...prev,
                              [selectedClientId]: {
                                ...(prev[selectedClientId] || {}),
                                [task.id]: e.target.checked,
                              },
                            }))
                          }
                          className="mt-0.5 accent-emerald-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800">
                            {lang === "EN" ? task.en : task.ar}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{task.isa}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            checked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {checked
                            ? lang === "EN" ? "Reviewed" : "تمت المراجعة"
                            : lang === "EN" ? "Pending" : "قيد المراجعة"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ISA 570: Going Concern ── */}
          {activeTab === "going-concern" && (
            <GoingConcernScreen lang={lang} clientName={lang === "EN" ? currentClient.name : currentClient.arabicName} isRtl={isRtl} />
          )}

          {/* ── ISA 550: Related Parties ── */}
          {activeTab === "related-parties" && (
            <RelatedPartiesScreen lang={lang} clientName={lang === "EN" ? currentClient.name : currentClient.arabicName} isRtl={isRtl} />
          )}

          {/* ── ISA 580: Management Representations ── */}
          {activeTab === "mgmt-rep" && (
            <MgmtRepScreen lang={lang} clientName={lang === "EN" ? currentClient.name : currentClient.arabicName} isRtl={isRtl} />
          )}

          {activeTab === "final-reporting" && (
            <div className="max-w-7xl mx-auto">
              <FinalReportingScreen
                lang={lang}
                client={currentClient}
                materiality={materiality}
                risks={risks}
                procedures={procedures}
                workpapers={workpapers}
                preEngagementItems={preEngagementItems}
              />
            </div>
          )}



          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6" dir={isRtl ? "rtl" : "ltr"}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  <span>{lang === "EN" ? "Application Settings" : "إعدادات التطبيق"}</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  {lang === "EN"
                    ? "Manage application language and users."
                    : "إدارة لغة التطبيق والمستخدمين."}
                </p>

                {/* Language */}
                <div className="border border-slate-200 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    {lang === "EN" ? "Interface Language" : "لغة الواجهة"}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setLang("AR"); try { localStorage.setItem("dabour-lang", "AR"); } catch {} }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border ${lang === "AR" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
                    >
                      العربية (كامل)
                    </button>
                    <button
                      onClick={() => { setLang("EN"); try { localStorage.setItem("dabour-lang", "EN"); } catch {} }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border ${lang === "EN" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
                    >
                      English
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {lang === "EN"
                      ? "Choosing Arabic switches the whole interface to right-to-left Arabic."
                      : "اختيار العربية يحوّل الواجهة بالكامل إلى اللغة العربية مع اتجاه من اليمين إلى اليسار."}
                  </p>
                </div>

                {/* Users */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    {lang === "EN" ? "Users Management" : "إدارة المستخدمين"}
                  </h4>

                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={lang === "EN" ? "Username (e.g. sami.ahmed)" : "اسم المستخدم (مثل: sami.ahmed)"}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Partner">{lang === "EN" ? "Partner" : "شريك"}</option>
                      <option value="Manager">{lang === "EN" ? "Manager" : "مدير"}</option>
                      <option value="Auditor">{lang === "EN" ? "Auditor" : "مدقق"}</option>
                      <option value="Junior">{lang === "EN" ? "Junior" : "مساعد"}</option>
                    </select>
                    <button
                      onClick={() => {
                        const u = newUsername.trim();
                        if (!u) return;
                        const next: AppUser = { id: `u-${Date.now()}`, username: u, role: newUserRole, addedAt: new Date().toISOString() };
                        const list = [...appUsers, next];
                        setAppUsers(list);
                        try { localStorage.setItem("dabour-app-users", JSON.stringify(list)); } catch {}
                        setNewUsername("");
                      }}
                      className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {lang === "EN" ? "Add User" : "إضافة مستخدم"}
                    </button>
                  </div>

                  {appUsers.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      {lang === "EN" ? "No users added yet." : "لا يوجد مستخدمون مضافون بعد."}
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                      {appUsers.map((u) => (
                        <li key={u.id} className="px-3 py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{u.username}</div>
                              <div className="text-[10px] text-slate-500">{u.role}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const list = appUsers.filter((x) => x.id !== u.id);
                              setAppUsers(list);
                              try { localStorage.setItem("dabour-app-users", JSON.stringify(list)); } catch {}
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            aria-label="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sami-ai" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center border border-slate-800 shadow-md">
                <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
                  <span className="text-orange-400 font-bold text-xs tracking-wider uppercase">Sami Premium AI Terminal</span>
                </div>
                <h3 className="text-lg font-black mb-1">{t.copilotName} Terminal Integration</h3>
                <p className="text-slate-400 text-xs">
                  {lang === "EN"
                    ? "Sami has full visibility of current client data including industry sectors, registered materiality baseline, risk matriculation scores, and key account procedures templates. Type prompts or execute special pre-engagement memos below."
                    : "يتمتع مساعد سامي بإمكانية الوصول لبيانات العميل النشط لحساب الأهمية المادية وهيكلة برامج أوراق العمل بجودة عالية."}
                </p>
              </div>

              <SamiAICopilot
                lang={lang}
                onApplyProcedures={handleApplySamiProcedures}
                onApplyWorkpaper={handleApplySamiWorkpaper}
                currentClientIndustry={currentClient.industry}
              />
            </div>
          )}

        </div>
      </main>

      {/* Add Client Dialog Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-sm font-black flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-400" />
                <span>{t.addClient}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddClientModal(false);
                  setShowPartnerDropdown(false);
                }}
                className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
 
            <form onSubmit={handleRegisterClient} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Name (English)</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Al-Dabour General Operations PLC"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.8 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
 
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الشركة (العربية)</label>
                <input
                  type="text"
                  value={newClientArName}
                  onChange={(e) => setNewClientArName(e.target.value)}
                  placeholder="مثال: شركة الدبور للعمليات العامة المساهمة"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.8 rounded-xl font-semibold text-slate-800 text-right focus:outline-none focus:border-orange-500"
                />
              </div>
 
              <div>
                <label className="block text-slate-700 font-bold mb-1">Industry Sector</label>
                <select
                  value={newClientIndustry}
                  onChange={(e) => setNewClientIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-1.8 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Tech & Software Solutions">Tech & Software Solutions</option>
                  <option value="Heavy Manufacturing">Heavy Manufacturing</option>
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="Real Estate & Holding">Real Estate & Holding</option>
                  <option value="Healthcare & Labs">Healthcare & Labs</option>
                </select>
              </div>
 
              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50 space-y-2 mb-3">
                <div className="text-[10px] font-bold text-orange-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{lang === "EN" ? "Lead Engagement Partner Selector & Input" : "تحديد وإدخال الشريك المسؤول عن الارتباط"}</span>
                </div>
                
                <p className="text-[10px] text-slate-600 leading-normal">
                  {lang === "EN" 
                    ? "💡 Tip: You can type the partner's name directly into the field below, choose from our certified partner list, or insert a newly certified partner at the bottom."
                    : "💡 تلميح: يمكنك كتابة اسم الشريك مراجع الحسابات مباشرة في الحقل أدناه، أو اختياره من القائمة المنسدلة المتاحة، أو إضافة اسم جديد بالأسفل."}
                </p>
              </div>

              <div className="relative">
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>{lang === "EN" ? "Lead Engagement Partner" : "شريك الارتباط المسؤول (Partner)"}</span>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    {lang === "EN" ? "Interactive List" : "قائمة تفاعلية"}
                  </span>
                </label>
                
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    id="partner-name-input-box"
                    value={newClientPartner}
                    onChange={(e) => {
                      setNewClientPartner(e.target.value);
                      setShowPartnerDropdown(true);
                    }}
                    onFocus={() => setShowPartnerDropdown(true)}
                    placeholder={lang === "EN" ? "Type Partner's name directly here..." : "اكتب اسم الشريك المسؤول هنا مباشرة..."}
                    className="w-full bg-slate-50 border-2 border-orange-200/60 pl-3 pr-10 py-2 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-1.5 focus:outline-none cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
 
                {/* Dropdown Menu */}
                {showPartnerDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-1.5 max-h-56 overflow-y-auto text-left" dir="ltr">
                    <div className="text-[10px] font-bold text-slate-400 px-2 pb-1 bg-white flex items-center justify-between">
                      <span>{lang === "EN" ? "Choose Certified Partner" : "اختر من القائمة المعتمدة"}</span>
                      <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">
                        {lang === "EN" ? "Or type directly in input box" : "أو اكتب فوق مباشرة"}
                      </span>
                    </div>
 
                    {/* Pre-engagement Partner list options */}
                    <div className="space-y-0.5">
                      {auditPartnersList.map((partner, idx) => {
                        const isSelected = newClientPartner === partner;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewClientPartner(partner);
                              setShowPartnerDropdown(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isSelected ? "bg-orange-50 text-orange-700 font-bold" : "text-slate-700"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                              {partner}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit separate Add Custom Partner form field */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-250 mt-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-700 block text-left">
                  {lang === "EN" ? "Option 2: Register a New Partner Name To System List" : "الخيار الثاني: تسجيل وحفظ اسم شريك جديد بالقائمة المعتمدة"}
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPartnerInput}
                    onChange={(e) => setCustomPartnerInput(e.target.value)}
                    placeholder={lang === "EN" ? "Type new partner name..." : "اكتب اسم شريك جديد هنا..."}
                    className="flex-1 bg-white border border-slate-250 px-3 py-1.8 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimVal = customPartnerInput.trim();
                        if (trimVal) {
                          if (!auditPartnersList.includes(trimVal)) {
                            setAuditPartnersList(prev => [...prev, trimVal]);
                          }
                          setNewClientPartner(trimVal);
                          setCustomPartnerInput("");
                          showToast(lang === "EN" ? `Added "${trimVal}" to system lead partners!` : `تم إدراج الشريك "${trimVal}" في القائمة المعتمدة!`, "success");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimVal = customPartnerInput.trim();
                      if (trimVal) {
                        if (!auditPartnersList.includes(trimVal)) {
                          setAuditPartnersList(prev => [...prev, trimVal]);
                        }
                        setNewClientPartner(trimVal);
                        setCustomPartnerInput("");
                        showToast(lang === "EN" ? `Added "${trimVal}" to system lead partners!` : `تم إدراج الشريك "${trimVal}" في القائمة المعتمدة!`, "success");
                      }
                    }}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white px-3.5 py-1.8 rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-xs"
                  >
                    {lang === "EN" ? "Add to List" : "إضافة للقائمة"}
                  </button>
                </div>
              </div>
 
              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddClientModal(false);
                    setShowPartnerDropdown(false);
                  }}
                  className="bg-slate-150 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer font-bold"
                >
                  {lang === "EN" ? "Cancel" : "إلغاء"}
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 font-bold transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  {lang === "EN" ? "Register Office Client" : "تسجيل العميل كلياً"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roll-Forward to New Audit Year Dialog Modal */}
      {showRollForwardModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto flex flex-col" dir={isRtl ? "rtl" : "ltr"}>

            <div className="bg-indigo-950 p-4 text-white flex justify-between items-center border-b border-indigo-900">
              <h3 className="text-sm font-black flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>{lang === "EN" ? "Roll-Forward Audit (Start New FY)" : "ترحيل الملف وبدء سنة مالية جديدة"}</span>
              </h3>
              <button
                onClick={() => {
                  setShowRollForwardModal(false);
                  setRollForwardDropdownOpen(false);
                }}
                className="text-indigo-300 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRollForwardClient} className="p-6 space-y-4 text-xs font-sans">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-1.5 text-left" dir={isRtl ? "rtl" : "ltr"}>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === "EN" ? "Originating Client" : "الملف الأصلي المصدر"}</div>
                <div className="font-bold text-slate-900 text-sm whitespace-normal break-words">{lang === "EN" ? currentClient.name : currentClient.arabicName}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-4">
                  <span>{lang === "EN" ? `Industry: ${currentClient.industry}` : `القطاع العملي: ${currentClient.industry}`}</span>
                  <span className="font-bold text-indigo-650">{lang === "EN" ? `Prior FY: ${currentClient.financialYear}` : `السنة المالية السابقة: ${currentClient.financialYear}`}</span>
                </div>
              </div>

              <div className="text-left" dir={isRtl ? "rtl" : "ltr"}>
                <label className="block text-slate-700 font-bold mb-1">
                  {lang === "EN" ? "Target Financial Year" : "السنة المالية الجديدة المستهدفة"}
                </label>
                <select
                  required
                  value={rollForwardTargetYear}
                  onChange={(e) => setRollForwardTargetYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer text-left"
                >
                  <option value="2027">2027 (FY27)</option>
                  <option value="2028">2028 (FY28)</option>
                  <option value="2029">2029 (FY29)</option>
                </select>
                <p className="text-[9px] text-slate-400 mt-1">
                  {lang === "EN" 
                    ? "In accordance with professional guidelines, this closes the current FY as a stable archive and establishes a fresh period." 
                    : "وفقاً لمعايير التدقيق الدولية، سيتم قفل ملف السنة الحالية كأرشيف معتمد، وفتح سنة مالية جديدة كلياً."}
                </p>
              </div>

              {/* Engagement Lead Partner Dropdown inside Rollforward */}
              <div className="relative text-left animate-none" dir={isRtl ? "rtl" : "ltr"}>
                <label className="block text-slate-700 font-bold mb-1">
                  {lang === "EN" ? "Responsible Engagement Partner (EP)" : "الشريك المسؤول عن الارتباط الجديد"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={rollForwardPartner}
                    onChange={(e) => {
                      setRollForwardPartner(e.target.value);
                      setRollForwardDropdownOpen(true);
                    }}
                    onFocus={() => setRollForwardDropdownOpen(true)}
                    placeholder={lang === "EN" ? "Select or type partner..." : "اختر أو اكتب اسم الشريك..."}
                    className="w-full bg-slate-50 border border-slate-200 pl-3 pr-10 py-2 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setRollForwardDropdownOpen(!rollForwardDropdownOpen)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-1.5 focus:outline-none cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {rollForwardDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-1.5 max-h-48 overflow-y-auto text-left" dir="ltr">
                    <div className="text-[10px] font-bold text-slate-400 px-2 pb-1 bg-white flex items-center justify-between">
                      <span>{lang === "EN" ? "Available Partners" : "الشركاء المتاحون بالمنصة"}</span>
                    </div>
                    <div className="space-y-0.5">
                      {auditPartnersList.map((partner, idx) => {
                        const isSelected = rollForwardPartner === partner;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRollForwardPartner(partner);
                              setRollForwardDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isSelected ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700"
                            }`}
                          >
                            <span>{partner}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-1 space-y-1.5">
                      <div className="flex gap-1.5 px-1 pb-1">
                        <input
                          type="text"
                          value={rollForwardCustomPartnerInput}
                          onChange={(e) => setRollForwardCustomPartnerInput(e.target.value)}
                          placeholder={lang === "EN" ? "Add Partner..." : "إضافة شريك..."}
                          className="flex-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-800 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const trimVal = rollForwardCustomPartnerInput.trim();
                              if (trimVal && !auditPartnersList.includes(trimVal)) {
                                setAuditPartnersList(prev => [...prev, trimVal]);
                                setRollForwardPartner(trimVal);
                                setRollForwardCustomPartnerInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimVal = rollForwardCustomPartnerInput.trim();
                            if (trimVal && !auditPartnersList.includes(trimVal)) {
                              setAuditPartnersList(prev => [...prev, trimVal]);
                              setRollForwardPartner(trimVal);
                              setRollForwardCustomPartnerInput("");
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        >
                          {lang === "EN" ? "Add" : "إضافة"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Big 4 Roll-forward features checklist */}
              <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 space-y-2 text-left" dir={isRtl ? "rtl" : "ltr"}>
                <div className="text-[9px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === "EN" ? "Automated Roll-Over Protocols" : "بروتوكولات الترحيل الآلية الذكية"}</span>
                </div>
                
                <div className="space-y-1.5 text-[10px] text-indigo-950 font-medium leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{lang === "EN" ? "Lock previous period as verified, read-only audit archive." : "قفل وأرشفة ملف السنة السابقة آلياً كملف مقارنة مرجعي غير قابل للتعديل."}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{lang === "EN" ? "Carryover corporate baseline & client identity." : "ترحيل الهوية المؤسسية ومعلمات العميل الدائمة تلقائياً."}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{lang === "EN" ? "Initialize fresh, clean 0% workspace for the current year." : "تجهيز مساحة عمل ومؤشرات إنجاز فارغة تماماً (0%) لبدء العمل الميداني للسنة الجديدة بجدارة."}</span>
                  </div>
                </div>
              </div>

              {/* Prior-year ISA review checklist */}
              <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-100 space-y-2 text-left" dir={isRtl ? "rtl" : "ltr"}>
                <div className="text-[9px] font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === "EN" ? "Prior-Year Pending Review (ISA)" : "مهام مراجعة السنة السابقة (وفق ISA)"}</span>
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {PRIOR_YEAR_REVIEW_TASKS.map((task) => {
                    const checked = !!rollPriorReview[task.id];
                    return (
                      <label
                        key={task.id}
                        className={`flex items-start gap-2 p-1.5 rounded-md cursor-pointer text-[10px] ${
                          checked ? "bg-white border border-emerald-200" : "hover:bg-white/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setRollPriorReview((prev) => ({ ...prev, [task.id]: e.target.checked }))
                          }
                          className="mt-0.5 accent-emerald-600"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">
                            {lang === "EN" ? task.en : task.ar}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">{task.isa}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Client file attachments for the new engagement */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-2 text-left" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-orange-500" />
                    <span>{lang === "EN" ? "Attach files to new client folder" : "إرفاق ملفات بملف العميل الجديد"}</span>
                  </div>
                  <label className="cursor-pointer text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{lang === "EN" ? "Add" : "إضافة"}</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        const newOnes: ClientFile[] = files.map((f, i) => ({
                          id: `rf-${Date.now()}-${i}`,
                          name: f.name,
                          size: f.size,
                          addedAt: new Date().toISOString(),
                        }));
                        setRollFiles((prev) => [...prev, ...newOnes]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {rollFiles.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    {lang === "EN" ? "No files attached yet." : "لا توجد ملفات مرفقة بعد."}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {rollFiles.map((f) => (
                      <li key={f.id} className="flex items-center justify-between text-[10px] bg-white rounded px-2 py-1 border border-slate-150">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate font-semibold text-slate-700">{f.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRollFiles((prev) => prev.filter((x) => x.id !== f.id))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRollForwardModal(false);
                    setRollForwardDropdownOpen(false);
                  }}
                  className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer font-bold animate-none"
                >
                  {lang === "EN" ? "Cancel" : "إلغاء"}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer animate-none"
                >
                  {lang === "EN" ? "Confirm Roll-Forward" : "تأكيد الترحيل للسنة الجديدة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Assessment Sheet (Interactive Slide-Over) */}
      {selectedRiskDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedRiskDetail(null)}
          />

          {/* Slide-over Content Container */}
          <div
            className={`relative w-full max-w-xl h-full bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col z-10 overflow-hidden transition-transform duration-300 animate-in ${
              isRtl 
                ? "left-0 slide-in-from-left" 
                : "right-0 slide-in-from-right"
            }`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Slide-over Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-slate-800 border border-slate-700`}>
                  <AlertOctagon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
                      {selectedRiskDetail.id}
                    </span>
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
                      ISA 315
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1">
                    {lang === "EN" ? "In-depth Risk & Control Diagnostic" : "التشخيص المفصل للمخاطر والضوابط"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRiskDetail(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide-over Body (Scrollable Wrapper) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-slate-700">
              
              {/* Core Misstatement / Description */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === "EN" ? "Identified Audit Misstatement Risk" : "مخاطر الأخطاء المالية المحددة للتأكيد"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{lang === "EN" ? "Active Assessment" : "التقييم النشط"}</span>
                  </div>
                </div>
                <p className="text-xs font-extrabold text-slate-900 leading-relaxed md:text-sm">
                  {selectedRiskDetail.description}
                </p>
                
                {/* Assertion Badges */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold mr-1.5">{lang === "EN" ? "Target Assertion:" : "التأكيد المستهدف:"}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-black text-[11px] border border-indigo-100">
                      {selectedRiskDetail.assertion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Heatmap / Risk Rating Matrix (LIKELIHOOD & IMPACT) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-sans">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span>{lang === "EN" ? "Inherent Risk Estimation Matrix" : "مصفوفة تقدير مخاطر الملازمة"}</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                      {lang === "EN" ? "Likelihood Score (1-5)" : "احتمالية الحدوث (١-٥)"}
                    </label>
                    <select
                      value={selectedRiskDetail.likelihood}
                      onChange={(e) => updateRiskField(selectedRiskDetail.id, "likelihood", parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:ring-1 focus:ring-orange-500 focus:outline-none text-slate-800 font-sans"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>
                          {v} - {v === 1 ? (lang === "EN" ? "Rare" : "نادر جداً") : v === 3 ? (lang === "EN" ? "Possible" : "محتمل") : v === 5 ? (lang === "EN" ? "Almost Certain" : "مؤكد حدوثه") : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                      {lang === "EN" ? "Impact Severity (1-5)" : "شدة الأثر وقوة الضرر (١-٥)"}
                    </label>
                    <select
                      value={selectedRiskDetail.impact}
                      onChange={(e) => updateRiskField(selectedRiskDetail.id, "impact", parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:ring-1 focus:ring-orange-500 focus:outline-none text-slate-800 font-sans"
                    >
                      {[1, 2, 3, 4, 5].map(v => (
                        <option key={v} value={v}>
                          {v} - {v === 1 ? (lang === "EN" ? "Negligible" : "هامشي") : v === 3 ? (lang === "EN" ? "Moderate" : "متوسط الأثر") : v === 5 ? (lang === "EN" ? "Catastrophic" : "كارثي جسيم") : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Score Summary Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50/50 border border-orange-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none">
                      {lang === "EN" ? "Calculated Risk Score" : "حساب نتيجة الخطر الإجمالية"}
                    </span>
                    <span className="text-xs text-slate-600 font-medium font-sans">
                      {lang === "EN" ? "Inherent risk rating dynamically calculated" : "تم احتساب تقييم الخطر الملازم تلقائياً"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-orange-700">
                      {selectedRiskDetail.likelihood} × {selectedRiskDetail.impact} = {selectedRiskDetail.likelihood * selectedRiskDetail.impact}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase shadow-xs ${
                      selectedRiskDetail.likelihood * selectedRiskDetail.impact >= 15 ? "bg-red-100 text-red-800 border-red-200/50 border" :
                      selectedRiskDetail.likelihood * selectedRiskDetail.impact >= 8 ? "bg-amber-100 text-amber-800 border-amber-200/50 border" :
                      "bg-green-100 text-green-800 border-green-200/50 border"
                    }`}>
                      {selectedRiskDetail.inherentRisk}
                    </span>
                  </div>
                </div>

                {/* Score Trend Selector */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                    {lang === "EN" ? "Prior Period Trend (Trendline vs Previous Audit Period)" : "اتجاه الخطر الملازم مقارنة بفترة التدقيق السابقة"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "stable", icon: "→", label: lang === "EN" ? "Stable" : "مستقر", bg: "hover:bg-slate-100", activeBg: "bg-slate-100 text-slate-800 border-slate-350" },
                      { value: "up", icon: "↑", label: lang === "EN" ? "Increased" : "متزايد", bg: "hover:bg-rose-50 hover:text-rose-700", activeBg: "bg-rose-50 text-rose-700 border-rose-300" },
                      { value: "down", icon: "↓", label: lang === "EN" ? "Decreased" : "متناقص", bg: "hover:bg-emerald-50 hover:text-emerald-700", activeBg: "bg-emerald-50 text-emerald-700 border-emerald-300" }
                    ].map((opt) => {
                      const isActive = (selectedRiskDetail.trend || "stable") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateRiskField(selectedRiskDetail.id, "trend", opt.value)}
                          className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isActive ? opt.activeBg + " border shadow-xs" : "border-slate-200 text-slate-500 " + opt.bg
                          }`}
                        >
                          <span className="text-sm font-sans">{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Control Environment Assessment Grid */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-sans">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{lang === "EN" ? "Internal Controls Verification" : "التحقق من البيئة الرقابة الداخلية للعميل"}</span>
                </h4>

                {/* Control description input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                    {lang === "EN" ? "Control Checkpoint Description" : "تفاصيل ووصف الضوابط الرقابية"}
                  </label>
                  <textarea
                    rows={3}
                    value={selectedRiskDetail.controlDescription || ""}
                    onChange={(e) => updateRiskField(selectedRiskDetail.id, "controlDescription", e.target.value)}
                    placeholder={lang === "EN" ? "e.g. Daily system match ledger logs and signature levels." : "أدخل تفاصيل الضوابط الرقابية وسير العمل... "}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold font-sans focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:bg-white transition-all text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                      {lang === "EN" ? "Control Risk Level" : "مستوى مخاطر الرقابة"}
                    </label>
                    <select
                      value={selectedRiskDetail.controlRisk || "Medium"}
                      onChange={(e) => updateRiskField(selectedRiskDetail.id, "controlRisk", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 font-sans"
                    >
                      <option value="High">{lang === "EN" ? "High (Controls ineffective/unreviewed)" : "مرتفع (ضوابط غير فعّالة)"}</option>
                      <option value="Medium">{lang === "EN" ? "Medium (Controls exist but depend on manual steps)" : "متوسط (ضوابط تعتمد على تدخل يدوي)"}</option>
                      <option value="Low">{lang === "EN" ? "Low (Highly automated system controls)" : "منخفض (ضوابط ومطابقات آلية بالكامل)"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                      {lang === "EN" ? "Detection Risk" : "مخاطر عدم الاكتشاف المخططة"}
                    </label>
                    <select
                      value={selectedRiskDetail.detectionRisk || "Medium"}
                      onChange={(e) => updateRiskField(selectedRiskDetail.id, "detectionRisk", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800 font-sans"
                    >
                      <option value="High">{lang === "EN" ? "High (Minimum sampling required)" : "مرتفع (بحاجة لأدنى عينات تدقيق)"}</option>
                      <option value="Medium">{lang === "EN" ? "Medium (Standard sampling size)" : "متوسط (حجم عينة قياسي)"}</option>
                      <option value="Low">{lang === "EN" ? "Low (Extensive comprehensive verification)" : "منخفض (يتطلب فحص موسع ومكثف)"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assigned Auditors (The Team Module Integration) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-sans">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{lang === "EN" ? "Assigned Auditors & Ownership" : "المكلفون بالتدقيق والمسؤولية"}</span>
                </h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs">
                    {team.map((auditor) => {
                      const currentAssigned = selectedRiskDetail.assignedAuditors || [];
                      const isAssigned = currentAssigned.includes(auditor.name);

                      return (
                        <button
                          key={auditor.id}
                          type="button"
                          onClick={() => {
                            const newAssigned = isAssigned
                              ? currentAssigned.filter(name => name !== auditor.name)
                              : [...currentAssigned, auditor.name];
                            updateRiskField(selectedRiskDetail.id, "assignedAuditors", newAssigned);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer leading-tight ${
                            isAssigned
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-bold"
                              : "bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/50 text-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] uppercase shrink-0 ${
                              isAssigned ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}>
                              {auditor.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-extrabold truncate">{auditor.name}</div>
                              <div className="text-[8px] text-slate-400 font-semibold font-sans mt-0.5">{auditor.role}</div>
                            </div>
                          </div>
                          <div className="shrink-0 ml-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                              isAssigned ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-200/80 text-slate-400 font-semibold"
                            }`}>
                              {isAssigned ? (lang === "EN" ? "Assigned" : "مكلف") : (lang === "EN" ? "Unassigned" : "متاح")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Substantive Response Strategy Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-sans">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>{lang === "EN" ? "Planned Substantive Audit Response" : "الاستجابة المخططة لبرنامج ومطابقات المراجعة"}</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">
                    {lang === "EN" ? "Audit Response Program Details" : "تفاصيل برنامج وخطة عمل الاستجابة"}
                  </label>
                  <textarea
                    rows={4}
                    value={selectedRiskDetail.plannedResponse}
                    onChange={(e) => updateRiskField(selectedRiskDetail.id, "plannedResponse", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white text-slate-800 transition-all font-sans leading-relaxed"
                  />
                </div>

                <div className="p-3.5 bg-slate-55 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 leading-relaxed font-sans font-medium">
                  <span className="font-extrabold text-slate-705 text-slate-705 block mb-1">
                    {lang === "EN" ? "💡 Sami AI Integration Tip" : "💡 نصيحة مساعد الذكاء الاصطناعي سامي"}
                  </span>
                  {lang === "EN" 
                    ? "Updating these responses updates your overall workpapers blueprint maps instantly. Select 'Sami AI Copilot' to auto-synthesize fully typed disclosures from these files."
                    : "تعديل الاستجابة ينعكس تلقائياً في مخطط أوراق العمل وسجل فحص المعاملات. اختر المساعد الذكاء الاصطناعي لتأكيد الصياغة المناسبة."}
                </div>
              </div>

              {/* Collaborative Auditor Notes & Comments Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 font-sans">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>{lang === "EN" ? "Collaborative Auditor Notes & Reviews" : "ملاحظات ومناقشات المدققين الفورية"}</span>
                </h4>

                {/* List Existing Comments */}
                {!(selectedRiskDetail.comments && selectedRiskDetail.comments.length > 0) ? (
                  <div className="text-center py-6 text-slate-400 font-medium">
                    <MessageSquare className="w-8 h-8 mx-auto stroke-1 opacity-50 mb-2 text-slate-300" />
                    <span className="text-[11px] block">{lang === "EN" ? "No notes reported yet. Be the first to leave feedback below!" : "لا توجد ملاحظات مسجلة على هذا الخطر حتى الآن. أضف أول تعليق أدناه!"}</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedRiskDetail.comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150/80 flex flex-col gap-1.5 text-xs relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-[9px] uppercase">
                              {comment.author.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px] sm:max-w-none">{comment.author}</span>
                            {comment.author === "Sami AI Copilot" && (
                              <span className="bg-indigo-120 bg-indigo-100 text-indigo-700 text-[8px] font-black px-1.5 py-0.2 rounded-md border border-indigo-200/50">AI</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 font-medium">{comment.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRiskComment(selectedRiskDetail.id, comment.id)}
                              className="text-slate-400 hover:text-red-600 transition-all cursor-pointer opacity-0 group-hover:opacity-100 p-0.5 rounded"
                              title={lang === "EN" ? "Delete note" : "حذف الملاحظة"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pl-6">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Field Form */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {lang === "EN" ? "Post comment as:" : "التوقيع والتعليق باسم:"}
                    </span>
                    <select
                      value={activeCommentAuthor}
                      onChange={(e) => setActiveCommentAuthor(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-[10px] font-black rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Jinan Kabbani, ACCA">Jinan Kabbani (Senior Auditor)</option>
                      <option value="Mubarak Al-Harthy">Mubarak Al-Harthy (Audit Manager)</option>
                      <option value="Rami Dabour">Rami Dabour (Junior Associate)</option>
                      <option value="Sami Al-Dabour, FCA">Sami Al-Dabour (Engagement Partner)</option>
                      <option value="Sami AI Copilot">Sami AI Copilot (AI Applet Assistant)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={draftCommentText}
                      onChange={(e) => setDraftCommentText(e.target.value)}
                      placeholder={lang === "EN" ? "Add auditor note or diagnostic feedback..." : "اكتب ملاحظة فنية أو توثيقاً إضافياً..."}
                      className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold font-sans focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all text-slate-800 leading-relaxed placeholder:font-normal"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddRiskComment(selectedRiskDetail.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!draftCommentText.trim()}
                      onClick={() => handleAddRiskComment(selectedRiskDetail.id)}
                      className={`px-4.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center text-white shrink-0 gap-1.5 ${
                        draftCommentText.trim() 
                          ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md" 
                          : "bg-slate-300 cursor-not-allowed text-slate-100"
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{lang === "EN" ? "Send" : "نشر"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Slide-over Footer Actions */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRiskDetail(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold hover:bg-slate-300 transition-all cursor-pointer shadow-xs font-sans"
              >
                {lang === "EN" ? "Dismiss Diagnostic Sheet" : "إغلاق نافذة الفحص"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRiskDetail(null);
                  showToast(lang === "EN" ? "Audit Risk Assessment file updated in the ledger map!" : "تم حفظ وتحديث مصفوفة تقييم هذا الخطر بنجاح!", "success");
                }}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 font-sans"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === "EN" ? "Confirm & Sync Changes" : "تأكيد ومزامنة التغييرات"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Floating Toast Notification HUD */}
      {toastNotification && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-slate-900 border border-slate-800 text-white rounded-2xl py-3.5 px-6 shadow-2xl flex items-center gap-3 max-w-md w-[90%]"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="p-1.5 bg-orange-500 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold leading-snug flex-1">{toastNotification.message}</p>
        </div>
      )}

      {/* Modals Mounting */}
      <IdeaHaloToolsModal open={showIdeaHalo} onClose={() => setShowIdeaHalo(false)} lang={lang} />

      {/* ISQM 1 Pass — Compliance breakdown modal */}
      {showCompliancePanel && (() => {
        const total = preEngagementItems.length;
        const completed = preEngagementItems.filter(i => i.status === "Completed").length;
        const inProgress = preEngagementItems.filter(i => i.status === "In_Progress").length;
        const notStarted = preEngagementItems.filter(i => i.status === "Not_Started").length;
        const pct = total ? Math.round((completed / total) * 100) : 0;
        const sections = Array.from(new Set(preEngagementItems.map(i => i.section)));
        const bySection = sections.map(sec => {
          const items = preEngagementItems.filter(i => i.section === sec);
          const done = items.filter(i => i.status === "Completed").length;
          return { sec, done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0, items };
        });
        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCompliancePanel(false)}>
            <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <div>
                    <h2 className="text-base font-black">{lang === "EN" ? "ISQM 1 Pass — Compliance Drivers" : "مكونات نسبة الامتثال — ISQM 1"}</h2>
                    <p className="text-[11px] text-white/80">{currentClient?.name} · {completed}/{total} {lang === "EN" ? "completed" : "مكتمل"} = {pct}%</p>
                  </div>
                </div>
                <button onClick={() => setShowCompliancePanel(false)} className="p-1.5 hover:bg-white/15 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-700">{completed}</div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">{lang === "EN" ? "Completed" : "مكتمل"}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-700">{inProgress}</div>
                    <div className="text-[10px] font-bold text-amber-700 uppercase">{lang === "EN" ? "In Progress" : "قيد التنفيذ"}</div>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-slate-700">{notStarted}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase">{lang === "EN" ? "Not Started" : "لم يبدأ"}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {bySection.map(s => (
                    <div key={s.sec} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{s.sec}</span>
                        <span className="text-[11px] font-bold text-indigo-700">{s.done}/{s.total} · {s.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5"><div className="h-1.5 bg-indigo-500" style={{ width: `${s.pct}%` }} /></div>
                      <ul className="divide-y divide-slate-100">
                        {s.items.map(it => (
                          <li key={it.id} className="px-4 py-2 flex items-start gap-2 text-[11px]">
                            {it.status === "Completed"
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              : it.status === "In_Progress"
                                ? <Loader2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 mt-0.5 flex-shrink-0" />}
                            <span className="text-slate-700">{lang === "AR" && it.labelAr ? it.labelAr : it.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-900">
                  {lang === "EN"
                    ? `Formula: completed checklist items (${completed}) ÷ total items (${total}) × 100 = ${pct}%. Adding a new client resets these counters to 0%.`
                    : `المعادلة: عدد البنود المكتملة (${completed}) ÷ إجمالي البنود (${total}) × ١٠٠ = ${pct}٪. عند إضافة عميل جديد تصبح القيمة 0٪.`}
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      <ConnectLedgerModal
        isOpen={isConnectLedgerOpen}
        onClose={() => setIsConnectLedgerOpen(false)}
        lang={lang}
        onConnectSuccess={(ledger) => {
          setActiveLocalLedger(ledger);
          setClientLedgers((prev) => ({
            ...prev,
            [selectedClientId]: ledger,
          }));

          setMateriality((prev) => {
            const overall = Math.round(ledger.totalRevenue * (prev.overallPercentage / 100));
            const performance = Math.round(overall * (prev.performancePercentage / 100));
            const trivial = Math.round(performance * (prev.trivialPercentage / 100));
            return {
              ...prev,
              customValue: ledger.totalRevenue,
              overallMateriality: overall,
              performanceMateriality: performance,
              clearlyTrivial: trivial,
            };
          });

          showToast(
            lang === "EN"
              ? `Ledger mapped successfully! Matched overall materiality benchmark: $${ledger.totalRevenue.toLocaleString()}`
              : `تم سحب الحسابات بنجاح ومطابقة معيار التدقيق الإيرادي بقيمة: $${ledger.totalRevenue.toLocaleString()}`,
            "success"
          );
        }}
      />

      <ZazaDocsModal
        isOpen={isZazaDocsOpen}
        onClose={() => setIsZazaDocsOpen(false)}
        lang={lang}
        onIncorporateRiskAndProcedure={(risk, procedure) => {
          // Add newly scanned risk directly to reactive state
          setRisks((prev) => [
            ...prev,
            {
              id: `r-zaza-${Date.now()}`,
              description: risk.description,
              assertion: risk.assertion,
              likelihood: risk.inherentRisk === "High" ? 4 : 3,
              impact: risk.inherentRisk === "High" ? 4 : 3,
              inherentRisk: risk.inherentRisk,
              controlRisk: "Medium",
              detectionRisk: "Medium",
              plannedResponse: risk.plannedResponse
            }
          ]);

          // Add newly recommended substantive procedure directly to active work program list
          setProcedures((prev) => [
            ...prev,
            {
              id: `p-zaza-${Date.now()}`,
              section: procedure.cycleArea === "Fixed Assets / Leases" ? "Assets" : "Inventories",
              ref: procedure.id === "doc2" ? "SAMI-INV-22" : "SAMI-LSE-31",
              description: procedure.vouchInstructions,
              descriptionAr: `إجراء مدمج آلياً: ${procedure.vouchInstructions}`,
              assertion: procedure.fsAssertion,
              evidence: procedure.evidenceObtained,
              status: "Pending"
            }
          ]);

          showToast(
            lang === "EN"
              ? "Sami AI scanned document and successfully incorporated designated audit risk to program!"
              : "قام ذكاء سامي بفحص مستندات زازا وإدراج الخطر وتدابير الاستجابة للملف بنجاح!",
            "success"
          );
        }}
      />

      <SamiCopilotModal
        isOpen={isSamiCopilotOpen}
        onClose={() => setIsSamiCopilotOpen(false)}
        lang={lang}
        currentClientIndustry={currentClient.industry}
        onApplyProcedures={handleApplySamiProcedures}
        onApplyWorkpaper={handleApplySamiWorkpaper}
      />

    </div>
  );
}

// ─── ISA 570: Going Concern Screen ───────────────────────────────────────────

type GCIndicator = { id: string; category: string; indicator: string; indicatorAr: string; present: boolean | null; severity: "High" | "Medium" | "Low"; notes: string; };

function GoingConcernScreen({ lang, clientName, isRtl }: { lang: Language; clientName: string; isRtl: boolean }) {
  const STORAGE_KEY = `dabour:going-concern:${clientName}`;
  const initial: GCIndicator[] = [
    { id: "gc1", category: "Financial", indicator: "Net current liabilities", indicatorAr: "صافي الالتزامات المتداولة", present: null, severity: "High", notes: "" },
    { id: "gc2", category: "Financial", indicator: "Recurring operating losses", indicatorAr: "خسائر تشغيلية متكررة", present: null, severity: "High", notes: "" },
    { id: "gc3", category: "Financial", indicator: "Inability to pay suppliers on due dates", indicatorAr: "عجز عن سداد الموردين في مواعيدهم", present: null, severity: "High", notes: "" },
    { id: "gc4", category: "Financial", indicator: "Loan covenant breach / waivers sought", indicatorAr: "خرق شروط القروض أو طلب تنازلات", present: null, severity: "High", notes: "" },
    { id: "gc5", category: "Financial", indicator: "Negative cash flow from operations", indicatorAr: "تدفقات نقدية تشغيلية سالبة", present: null, severity: "Medium", notes: "" },
    { id: "gc6", category: "Financial", indicator: "Significant loss of key customers", indicatorAr: "خسارة عملاء رئيسيين مهمين", present: null, severity: "Medium", notes: "" },
    { id: "gc7", category: "Operational", indicator: "Key management departures (no replacements)", indicatorAr: "مغادرة الإدارة الرئيسية دون بدائل", present: null, severity: "Medium", notes: "" },
    { id: "gc8", category: "Operational", indicator: "Loss of a major supplier or franchise", indicatorAr: "فقدان مورد رئيسي أو امتياز تجاري", present: null, severity: "Medium", notes: "" },
    { id: "gc9", category: "Operational", indicator: "Labor strikes or industrial disputes", indicatorAr: "إضرابات عمالية أو نزاعات صناعية", present: null, severity: "Low", notes: "" },
    { id: "gc10", category: "Legal", indicator: "Legal proceedings that may jeopardize operations", indicatorAr: "إجراءات قانونية قد تهدد استمرار العمليات", present: null, severity: "High", notes: "" },
    { id: "gc11", category: "Legal", indicator: "Changes in legislation that impact entity's business model", indicatorAr: "تغييرات تشريعية تؤثر على نموذج العمل", present: null, severity: "Medium", notes: "" },
  ];

  const [items, setItems] = React.useState<GCIndicator[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  type Conclusion = "appropriate" | "doubt" | "inappropriate" | "";
  const [conclusion, setConclusion] = React.useState<Conclusion>(() => {
    try { return (localStorage.getItem(STORAGE_KEY + ":conclusion") || "") as Conclusion; } catch { return ""; }
  });
  const [mitigations, setMitigations] = React.useState(() => {
    try { return localStorage.getItem(STORAGE_KEY + ":mitigations") || ""; } catch { return ""; }
  });

  const save = (next: GCIndicator[], conc: typeof conclusion, mit: string) => {
    setItems(next); setConclusion(conc); setMitigations(mit);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); localStorage.setItem(STORAGE_KEY + ":conclusion", conc); localStorage.setItem(STORAGE_KEY + ":mitigations", mit); } catch {}
  };

  const toggle = (id: string, val: boolean | null) => save(items.map(i => i.id === id ? { ...i, present: val } : i), conclusion, mitigations);
  const setNote = (id: string, notes: string) => save(items.map(i => i.id === id ? { ...i, notes } : i), conclusion, mitigations);

  const highRisk = items.filter(i => i.present && i.severity === "High");
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="max-w-5xl mx-auto space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black">{lang === "EN" ? "Going Concern — ISA 570" : "استمرارية المنشأة — ISA 570"}</h2>
            </div>
            <p className="text-[11px] text-slate-300 max-w-xl">
              {lang === "EN"
                ? `Evaluate whether ${clientName} has the ability to continue as a going concern for at least 12 months beyond the balance sheet date. Document indicators, management's plans, and auditor conclusion.`
                : `تقييم مدى قدرة ${clientName} على الاستمرار كمنشأة مستمرة لمدة لا تقل عن 12 شهراً من تاريخ الميزانية. وثّق المؤشرات وخطط الإدارة واستنتاج المراجع.`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {highRisk.length > 0 && (
              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {highRisk.length} {lang === "EN" ? "High Risk Indicators" : "مؤشرات عالية الخطورة"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicators by Category */}
      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${cat === "Financial" ? "bg-rose-100 text-rose-700" : cat === "Operational" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{cat}</span>
            {lang === "EN" ? "Indicators" : "المؤشرات"}
          </h3>
          <div className="space-y-2">
            {items.filter(i => i.category === cat).map(item => (
              <div key={item.id} className={`rounded-xl border p-3 transition-colors ${item.present === true ? "bg-rose-50 border-rose-200" : item.present === false ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{lang === "EN" ? item.indicator : item.indicatorAr}</div>
                    <div className={`text-[9px] font-black mt-0.5 ${item.severity === "High" ? "text-rose-600" : item.severity === "Medium" ? "text-amber-600" : "text-slate-500"}`}>{item.severity} Risk</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggle(item.id, item.present === true ? null : true)} className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-colors ${item.present === true ? "bg-rose-500 text-white border-rose-500" : "bg-white text-rose-600 border-rose-300 hover:bg-rose-50"}`}>
                      {lang === "EN" ? "Present" : "موجود"}
                    </button>
                    <button onClick={() => toggle(item.id, item.present === false ? null : false)} className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-colors ${item.present === false ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50"}`}>
                      {lang === "EN" ? "N/A" : "لا ينطبق"}
                    </button>
                  </div>
                </div>
                {item.present === true && (
                  <input
                    value={item.notes}
                    onChange={e => setNote(item.id, e.target.value)}
                    placeholder={lang === "EN" ? "Auditor notes / evidence reference..." : "ملاحظات المراجع / مرجع الدليل..."}
                    className="mt-2 w-full text-[11px] bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-rose-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Management's Plans & Mitigations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-black text-slate-900 mb-3">{lang === "EN" ? "Management's Plans to Mitigate Concerns" : "خطط الإدارة للتخفيف من المخاوف"}</h3>
        <textarea
          value={mitigations}
          onChange={e => save(items, conclusion, e.target.value)}
          placeholder={lang === "EN" ? "Document management's plans, e.g. refinancing, asset disposals, cost reduction, capital injection, new equity issuance..." : "وثّق خطط الإدارة مثل إعادة التمويل، بيع الأصول، تخفيض التكاليف، ضخ رأس مال..."}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[100px] focus:outline-none focus:border-cyan-400 text-slate-800 resize-y"
        />
      </div>

      {/* Auditor Conclusion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-black text-slate-900 mb-3">{lang === "EN" ? "Auditor Conclusion (ISA 570.18)" : "استنتاج المراجع (ISA 570.18)"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { val: "appropriate" as const, label: lang === "EN" ? "Going Concern Appropriate" : "الاستمرارية مناسبة", labelAr: "الاستمرارية مناسبة", color: "emerald" },
            { val: "doubt" as const, label: lang === "EN" ? "Material Uncertainty Exists" : "عدم يقين جوهري", color: "amber" },
            { val: "inappropriate" as const, label: lang === "EN" ? "GC Basis Inappropriate" : "أساس الاستمرارية غير ملائم", color: "rose" },
          ].map(opt => (
            <button key={opt.val} onClick={() => save(items, conclusion === opt.val ? "" : opt.val, mitigations)}
              className={`rounded-xl border-2 p-3 text-xs font-black transition-all ${conclusion === opt.val
                ? opt.color === "emerald" ? "bg-emerald-500 text-white border-emerald-500" : opt.color === "amber" ? "bg-amber-500 text-white border-amber-500" : "bg-rose-500 text-white border-rose-500"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {conclusion && (
          <div className={`mt-3 text-[11px] font-bold p-3 rounded-lg ${conclusion === "appropriate" ? "bg-emerald-50 text-emerald-800" : conclusion === "doubt" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-800"}`}>
            {conclusion === "appropriate" && (lang === "EN" ? "✓ No material uncertainty identified. GC basis is appropriate." : "✓ لم يُحدَّد أي عدم يقين جوهري. أساس الاستمرارية مناسب.")}
            {conclusion === "doubt" && (lang === "EN" ? "⚠ Material uncertainty exists — ensure adequate disclosure in FS per IAS 1 / ISA 570.21." : "⚠ يوجد عدم يقين جوهري — تأكد من الإفصاح الكافي في القوائم المالية وفق IAS 1 / ISA 570.21.")}
            {conclusion === "inappropriate" && (lang === "EN" ? "✗ Going concern basis is inappropriate — consider modified audit opinion per ISA 705." : "✗ أساس الاستمرارية غير ملائم — فكر في تعديل رأي المراجع وفق ISA 705.")}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ISA 550: Related Parties Screen ────────────────────────────────────────

type RPEntry = { id: string; partyName: string; relationship: string; transactionType: string; amount: number; currency: string; terms: string; armLength: boolean | null; disclosed: boolean | null; notes: string; };

function RelatedPartiesScreen({ lang, clientName, isRtl }: { lang: Language; clientName: string; isRtl: boolean }) {
  const STORAGE_KEY = `dabour:related-parties:${clientName}`;
  const [entries, setEntries] = React.useState<RPEntry[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState<Omit<RPEntry, "id">>({ partyName: "", relationship: "Subsidiary", transactionType: "", amount: 0, currency: "SAR", terms: "", armLength: null, disclosed: null, notes: "" });

  const persist = (next: RPEntry[]) => {
    setEntries(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const addEntry = () => {
    persist([...entries, { ...form, id: `rp-${Date.now()}` }]);
    setForm({ partyName: "", relationship: "Subsidiary", transactionType: "", amount: 0, currency: "SAR", terms: "", armLength: null, disclosed: null, notes: "" });
    setShowAdd(false);
  };

  const issues = entries.filter(e => e.armLength === false || e.disclosed === false);

  return (
    <div className="max-w-5xl mx-auto space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black">{lang === "EN" ? "Related Party Transactions — ISA 550" : "معاملات الأطراف ذات الصلة — ISA 550"}</h2>
            </div>
            <p className="text-[11px] text-slate-300 max-w-xl">
              {lang === "EN"
                ? `Identify and assess related party transactions for ${clientName}. Verify arm's-length terms, proper authorization, and adequate disclosure per IAS 24.`
                : `حدد وقيّم معاملات الأطراف ذات الصلة لـ ${clientName}. تحقق من شروط السوق العادية، والتفويض المناسب، والإفصاح الكافي وفق IAS 24.`}
            </p>
          </div>
          {issues.length > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              {issues.length} {lang === "EN" ? "issue(s) flagged" : "معاملة تحتاج مراجعة"}
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-black text-slate-900 mb-3">{lang === "EN" ? "Auditor Procedures — ISA 550" : "إجراءات المراجع — ISA 550"}</h3>
        <div className="space-y-2">
          {[
            [lang === "EN" ? "Inquire management about related party relationships and transactions" : "استفسر من الإدارة عن علاقات الأطراف ذات الصلة ومعاملاتها", "ISA 550.12"],
            [lang === "EN" ? "Review board minutes for disclosed related party transactions" : "راجع محاضر مجلس الإدارة للمعاملات المفصح عنها", "ISA 550.14"],
            [lang === "EN" ? "Review bank confirmations for undisclosed related parties" : "راجع تأكيدات البنوك لاكتشاف الأطراف غير المفصح عنها", "ISA 550.14"],
            [lang === "EN" ? "Inspect significant contracts with related parties" : "افحص العقود المهمة مع الأطراف ذات الصلة", "ISA 550.16"],
            [lang === "EN" ? "Assess whether transactions are on arm's-length terms" : "قيّم ما إذا كانت المعاملات بشروط السوق العادية", "ISA 550.23"],
            [lang === "EN" ? "Verify adequate disclosure per IAS 24 requirements" : "تحقق من كفاية الإفصاح وفق متطلبات IAS 24", "ISA 550.25"],
          ].map(([txt, ref], i) => (
            <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="font-semibold text-slate-800">{txt}</div>
              <span className="text-[9px] text-slate-400 font-mono shrink-0">{ref}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-purple-600" />
            {lang === "EN" ? "Identified Related Party Transactions" : "معاملات الأطراف ذات الصلة المُحددة"}
          </h3>
          <button onClick={() => setShowAdd(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {lang === "EN" ? "Add Transaction" : "إضافة معاملة"}
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">{lang === "EN" ? "Related Party Name" : "اسم الطرف ذي الصلة"}</label>
                <input value={form.partyName} onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))} className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 focus:outline-none" placeholder={lang === "EN" ? "e.g. ABC Holding" : "مثال: شركة ABC القابضة"} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">{lang === "EN" ? "Relationship" : "العلاقة"}</label>
                <select value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
                  {["Subsidiary", "Associate", "Joint Venture", "Parent", "Key Management", "Director", "Shareholder"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">{lang === "EN" ? "Transaction Type" : "نوع المعاملة"}</label>
                <input value={form.transactionType} onChange={e => setForm(f => ({ ...f, transactionType: e.target.value }))} className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 focus:outline-none" placeholder={lang === "EN" ? "e.g. Loan, Sales, Services" : "مثال: قرض، مبيعات، خدمات"} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">{lang === "EN" ? "Amount" : "المبلغ"}</label>
                <input type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 focus:outline-none" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">{lang === "EN" ? "Terms" : "الشروط"}</label>
                <input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} className="w-full text-xs bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 focus:outline-none" placeholder={lang === "EN" ? "e.g. Interest-free, 6% pa" : "مثال: بدون فائدة، 6% سنوياً"} />
              </div>
              <div className="flex gap-3 items-end">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.armLength === true} onChange={e => setForm(f => ({ ...f, armLength: e.target.checked ? true : null }))} />
                  {lang === "EN" ? "Arm's-Length" : "بشروط السوق"}
                </label>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.disclosed === true} onChange={e => setForm(f => ({ ...f, disclosed: e.target.checked ? true : null }))} />
                  {lang === "EN" ? "Disclosed in FS" : "مُفصح عنه"}
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addEntry} className="bg-purple-600 text-white text-[11px] font-black px-4 py-1.5 rounded-xl hover:bg-purple-700">{lang === "EN" ? "Save" : "حفظ"}</button>
              <button onClick={() => setShowAdd(false)} className="text-[11px] font-bold text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50">{lang === "EN" ? "Cancel" : "إلغاء"}</button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">{lang === "EN" ? "No related party transactions recorded yet." : "لم يتم تسجيل أي معاملات بعد."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] text-slate-500 uppercase border-b-2 border-slate-200">
                <tr>
                  <th className="py-2 text-left">{lang === "EN" ? "Party" : "الطرف"}</th>
                  <th className="py-2 text-left">{lang === "EN" ? "Relationship" : "العلاقة"}</th>
                  <th className="py-2 text-left">{lang === "EN" ? "Type" : "النوع"}</th>
                  <th className="py-2 text-right">{lang === "EN" ? "Amount" : "المبلغ"}</th>
                  <th className="py-2 text-center">{lang === "EN" ? "Arm's-Length" : "شروط السوق"}</th>
                  <th className="py-2 text-center">{lang === "EN" ? "Disclosed" : "مُفصح عنه"}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className={`border-b border-slate-100 ${e.armLength === false || e.disclosed === false ? "bg-amber-50/40" : ""}`}>
                    <td className="py-2 font-bold text-slate-900">{e.partyName}</td>
                    <td className="py-2 text-slate-600">{e.relationship}</td>
                    <td className="py-2 text-slate-600">{e.transactionType}</td>
                    <td className="py-2 text-right font-mono tabular-nums font-bold">{e.amount.toLocaleString()} {e.currency}</td>
                    <td className="py-2 text-center">{e.armLength === true ? <span className="text-emerald-600 font-black">✓</span> : e.armLength === false ? <span className="text-rose-600 font-black">✗</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="py-2 text-center">{e.disclosed === true ? <span className="text-emerald-600 font-black">✓</span> : e.disclosed === false ? <span className="text-rose-600 font-black">✗</span> : <span className="text-slate-400">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ISA 580: Management Representations Screen ───────────────────────────────

type MgmtRepItem = { id: string; category: string; representation: string; representationAr: string; obtained: boolean; signedDate: string; notes: string; };

function MgmtRepScreen({ lang, clientName, isRtl }: { lang: Language; clientName: string; isRtl: boolean }) {
  const STORAGE_KEY = `dabour:mgmt-rep:${clientName}`;
  const standard: MgmtRepItem[] = [
    { id: "mr1", category: "General", representation: "Financial statements are prepared in accordance with the applicable financial reporting framework", representationAr: "تم إعداد القوائم المالية وفقاً لإطار التقارير المالية المنطبق", obtained: false, signedDate: "", notes: "" },
    { id: "mr2", category: "General", representation: "Management has fulfilled its responsibilities for the preparation of the financial statements", representationAr: "أوفت الإدارة بمسؤولياتها في إعداد القوائم المالية", obtained: false, signedDate: "", notes: "" },
    { id: "mr3", category: "General", representation: "All information relevant to the audit has been provided to the auditor", representationAr: "تم تزويد المراجع بجميع المعلومات ذات الصلة بعملية المراجعة", obtained: false, signedDate: "", notes: "" },
    { id: "mr4", category: "Completeness", representation: "All transactions have been recorded and reflected in the financial statements", representationAr: "تم تسجيل جميع المعاملات وإدراجها في القوائم المالية", obtained: false, signedDate: "", notes: "" },
    { id: "mr5", category: "Completeness", representation: "Management is not aware of any undisclosed related party transactions", representationAr: "لا تعلم الإدارة بوجود أي معاملات أطراف ذات صلة غير مُفصح عنها", obtained: false, signedDate: "", notes: "" },
    { id: "mr6", category: "Fraud", representation: "Management has disclosed to the auditor all known or suspected instances of fraud", representationAr: "أفصحت الإدارة للمراجع عن جميع حالات الاحتيال المعروفة أو المشتبه بها", obtained: false, signedDate: "", notes: "" },
    { id: "mr7", category: "Fraud", representation: "Management has no knowledge of any allegations of fraud or suspected fraud", representationAr: "ليس لدى الإدارة أي علم بادعاءات احتيال أو احتيال مشتبه به", obtained: false, signedDate: "", notes: "" },
    { id: "mr8", category: "Liabilities", representation: "All known actual and contingent liabilities have been recorded or disclosed", representationAr: "تم تسجيل أو الإفصاح عن جميع الالتزامات الفعلية والطارئة المعروفة", obtained: false, signedDate: "", notes: "" },
    { id: "mr9", category: "Liabilities", representation: "There are no unasserted claims or assessments by taxing authorities that are probable", representationAr: "لا توجد مطالبات ضريبية محتملة غير مُدرجة", obtained: false, signedDate: "", notes: "" },
    { id: "mr10", category: "Going Concern", representation: "Management has included all relevant going concern disclosures in the financial statements", representationAr: "أدرجت الإدارة جميع إفصاحات استمرارية المنشأة ذات الصلة في القوائم المالية", obtained: false, signedDate: "", notes: "" },
    { id: "mr11", category: "Events", representation: "All subsequent events requiring adjustment or disclosure have been adjusted or disclosed", representationAr: "تم تسوية أو الإفصاح عن جميع الأحداث اللاحقة التي تستلزم تسوية أو إفصاحاً", obtained: false, signedDate: "", notes: "" },
  ];

  const [items, setItems] = React.useState<MgmtRepItem[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : standard; } catch { return standard; }
  });
  const [letterDate, setLetterDate] = React.useState(() => {
    try { return localStorage.getItem(STORAGE_KEY + ":letter-date") || ""; } catch { return ""; }
  });

  const persist = (next: MgmtRepItem[], ld: string) => {
    setItems(next); setLetterDate(ld);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); localStorage.setItem(STORAGE_KEY + ":letter-date", ld); } catch {}
  };

  const toggle = (id: string) => persist(items.map(i => i.id === id ? { ...i, obtained: !i.obtained } : i), letterDate);
  const setNote = (id: string, notes: string) => persist(items.map(i => i.id === id ? { ...i, notes } : i), letterDate);

  const obtained = items.filter(i => i.obtained).length;
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="max-w-5xl mx-auto space-y-5" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-950 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-black">{lang === "EN" ? "Management Representations — ISA 580" : "إقرارات الإدارة — ISA 580"}</h2>
            </div>
            <p className="text-[11px] text-slate-300 max-w-xl">
              {lang === "EN"
                ? `Obtain written representations from management of ${clientName} as part of audit evidence. Mark each representation as obtained and note the Management Representation Letter date.`
                : `احصل على إقرارات خطية من إدارة ${clientName} كجزء من أدلة المراجعة. حدد كل إقرار تم الحصول عليه ووثّق تاريخ خطاب الإقرار.`}
            </p>
          </div>
          <div className="text-center bg-teal-500/20 border border-teal-500/40 rounded-xl px-4 py-2 shrink-0">
            <div className="text-2xl font-black text-teal-300">{obtained}/{items.length}</div>
            <div className="text-[9px] text-teal-400 font-bold uppercase">{lang === "EN" ? "Obtained" : "تم الحصول عليها"}</div>
          </div>
        </div>
      </div>

      {/* Letter Date */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-black text-slate-900">{lang === "EN" ? "Management Representation Letter Date" : "تاريخ خطاب إقرارات الإدارة"}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{lang === "EN" ? "Must not be earlier than the audit report date (ISA 580.20)" : "يجب ألا يسبق تاريخ تقرير المراجع (ISA 580.20)"}</p>
        </div>
        <input type="date" value={letterDate} onChange={e => persist(items, e.target.value)} className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 bg-slate-50" />
      </div>

      {/* Representations by Category */}
      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-[9px] font-black bg-teal-100 text-teal-700 px-2 py-0.5 rounded">{cat}</span>
            {lang === "EN" ? "Representations" : "الإقرارات"}
          </h3>
          <div className="space-y-2">
            {items.filter(i => i.category === cat).map(item => (
              <div key={item.id} className={`rounded-xl border p-3 transition-colors ${item.obtained ? "bg-emerald-50/60 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(item.id)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${item.obtained ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white hover:border-teal-400"}`}
                  >
                    {item.obtained && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold leading-relaxed ${item.obtained ? "text-emerald-900" : "text-slate-800"}`}>
                      {lang === "EN" ? item.representation : item.representationAr}
                    </div>
                    {!item.obtained && (
                      <input
                        value={item.notes}
                        onChange={e => setNote(item.id, e.target.value)}
                        placeholder={lang === "EN" ? "Note reason not yet obtained..." : "ملاحظة سبب عدم الحصول عليه..."}
                        className="mt-1.5 w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-400"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ISA 580 Warning */}
      {obtained < items.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
          <div className="font-black text-amber-800 flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" />
            {lang === "EN" ? "ISA 580 — Outstanding Representations" : "ISA 580 — إقرارات معلقة"}
          </div>
          <p className="text-amber-700">
            {lang === "EN"
              ? `${items.length - obtained} representation(s) not yet obtained. Per ISA 580.20, the auditor shall not issue the audit report until all required written representations have been received.`
              : `${items.length - obtained} إقرار لم يتم الحصول عليه بعد. وفقاً لـ ISA 580.20، لا يجوز للمراجع إصدار تقرير المراجعة حتى تتلقى جميع الإقرارات الخطية المطلوبة.`}
          </p>
        </div>
      )}
    </div>
  );
}
