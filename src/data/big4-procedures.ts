// Big-4 / ISA Standard Audit Procedures Library
// Aggregated from Deloitte AS/2, PwC Aura, EY Canvas, KPMG Clara and ISA 315/330/500/530 guidance.
// Used by the ProceduresLibraryModal to let the auditor pick which procedures
// to push into the active engagement's Audit Program.

export type Firm = "Deloitte" | "PwC" | "EY" | "KPMG" | "ISA";
export type CycleSection =
  | "Revenue"
  | "Cash"
  | "Assets"
  | "Equity"
  | "Receivables"
  | "Inventory"
  | "Payables"
  | "Payroll"
  | "Expenses"
  | "Tax"
  | "Investments"
  | "Debt"
  | "JE_Testing"
  | "ITGC"
  | "Going_Concern";

export interface LibraryProcedure {
  ref: string;
  section: CycleSection;
  firm: Firm;
  assertion: string;     // E.g. Existence, Completeness, Valuation, Cut-Off, Rights & Obligations, Presentation
  description: string;   // EN
  descriptionAr: string; // AR
  evidence: string;
  isaRef?: string;       // e.g. ISA 330
}

export const BIG4_PROCEDURES: LibraryProcedure[] = [
  // ───────────────────────── REVENUE ─────────────────────────
  { ref: "REV-D-01", section: "Revenue", firm: "Deloitte", assertion: "Occurrence", isaRef: "ISA 240",
    description: "Vouch a stratified sample of revenue transactions to signed contracts, delivery notes and customer acknowledgements (Deloitte AS/2 RSL.01).",
    descriptionAr: "فحص عينة طبقية من معاملات الإيرادات بالرجوع إلى العقود الموقعة وإشعارات التسليم وإقرارات العملاء (ديلويت AS/2).",
    evidence: "Sales contracts, POD, customer ack" },
  { ref: "REV-P-02", section: "Revenue", firm: "PwC", assertion: "Cut-Off", isaRef: "ISA 330",
    description: "Examine revenue transactions 10 days pre/post year-end and trace to shipping/handover evidence (PwC Aura ROMM-Cut-Off).",
    descriptionAr: "فحص معاملات الإيرادات خلال العشرة أيام قبل/بعد نهاية السنة ومطابقتها بأدلة الشحن أو التسليم (PwC Aura).",
    evidence: "Shipping log, GRN" },
  { ref: "REV-E-03", section: "Revenue", firm: "EY", assertion: "Accuracy",
    description: "Perform predictive analytics on revenue by product/region; investigate variances > performance materiality (EY Canvas Helix Analytics).",
    descriptionAr: "تنفيذ تحليلات تنبؤية للإيرادات حسب المنتج/المنطقة وفحص الانحرافات التي تتجاوز الأهمية النسبية للأداء.",
    evidence: "GL extract, BI dashboards" },
  { ref: "REV-K-04", section: "Revenue", firm: "KPMG", assertion: "Completeness",
    description: "Three-way match between sales order, dispatch and invoice using full-population testing in KPMG Clara D&A.",
    descriptionAr: "مطابقة ثلاثية بين أمر البيع وإشعار الشحن والفاتورة عبر اختبار كامل المجتمع (KPMG Clara).",
    evidence: "ERP extracts" },
  { ref: "REV-I-05", section: "Revenue", firm: "ISA", assertion: "Occurrence", isaRef: "ISA 240.32",
    description: "Apply presumption of fraud risk in revenue recognition; design unpredictable substantive procedures.",
    descriptionAr: "تطبيق افتراض وجود خطر احتيال في إثبات الإيراد وتصميم إجراءات جوهرية غير متوقعة.",
    evidence: "Risk memo, JE sample" },
  { ref: "REV-D-06", section: "Revenue", firm: "Deloitte", assertion: "Valuation",
    description: "Test estimates of variable consideration (discounts, rebates, returns) under IFRS 15 — Deloitte iConfirm.",
    descriptionAr: "اختبار تقديرات المقابل المتغير (الخصومات، الحسومات، المرتجعات) وفق IFRS 15.",
    evidence: "Rebate schedules" },
  { ref: "REV-P-07", section: "Revenue", firm: "PwC", assertion: "Presentation",
    description: "Test disaggregation of revenue disclosures by performance obligation category (PwC Aura IFRS 15).",
    descriptionAr: "اختبار إفصاحات تصنيف الإيرادات حسب التزامات الأداء.",
    evidence: "Disclosure schedules" },

  // ───────────────────────── CASH ─────────────────────────
  { ref: "CSH-P-01", section: "Cash", firm: "PwC", assertion: "Existence", isaRef: "ISA 505",
    description: "Send PwC Confirmation.com external bank confirmations for 100% of accounts; reconcile to GL.",
    descriptionAr: "إرسال مصادقات بنكية خارجية لكافة الحسابات عبر منصة المصادقات وتسويتها مع دفتر الأستاذ.",
    evidence: "Bank confirms" },
  { ref: "CSH-D-02", section: "Cash", firm: "Deloitte", assertion: "Existence",
    description: "Obtain year-end bank reconciliations; trace reconciling items to subsequent statements (Deloitte AS/2 CSH.02).",
    descriptionAr: "الحصول على تسويات بنكية بنهاية السنة وتتبع البنود المسواة في الكشوف اللاحقة.",
    evidence: "Bank recs, subseq stmts" },
  { ref: "CSH-E-03", section: "Cash", firm: "EY", assertion: "Cut-Off",
    description: "Identify large/round/late deposits and withdrawals near year-end using EY Helix transaction-flow analyzer.",
    descriptionAr: "تحديد الإيداعات والسحوبات الكبيرة أو المستديرة بنهاية السنة باستخدام محلل تدفقات معاملات EY Helix.",
    evidence: "Bank ledger CSV" },
  { ref: "CSH-K-04", section: "Cash", firm: "KPMG", assertion: "Rights & Obligations",
    description: "Inspect bank confirmations for liens, pledges, compensating balances or restrictions (KPMG Clara).",
    descriptionAr: "فحص المصادقات البنكية لاكتشاف الرهون والكفالات والقيود على الحسابات.",
    evidence: "Confirmations" },
  { ref: "CSH-I-05", section: "Cash", firm: "ISA", assertion: "Completeness", isaRef: "ISA 500",
    description: "Cash count attended at multiple locations on year-end; reconcile to cash on hand subledger.",
    descriptionAr: "حضور جرد الخزينة في مواقع متعددة بنهاية السنة وتسويته مع دفتر النقدية بالصندوق.",
    evidence: "Count sheets" },

  // ───────────────────────── RECEIVABLES ─────────────────────────
  { ref: "AR-D-01", section: "Receivables", firm: "Deloitte", assertion: "Existence", isaRef: "ISA 505",
    description: "Positive AR confirmations for the largest 80% of balances + statistical sample of remaining (Deloitte AS/2 AR.01).",
    descriptionAr: "مصادقات إيجابية لأكبر 80% من أرصدة العملاء + عينة إحصائية للباقي.",
    evidence: "Customer confirmations" },
  { ref: "AR-P-02", section: "Receivables", firm: "PwC", assertion: "Valuation",
    description: "Test ECL model under IFRS 9: re-perform staging, PD, LGD, forward-looking adjustments (PwC Aura IFRS 9).",
    descriptionAr: "اختبار نموذج الخسائر الائتمانية المتوقعة وفق IFRS 9: مراحل الانتقال، احتمال التعثر، الخسارة عند التعثر.",
    evidence: "ECL workings" },
  { ref: "AR-E-03", section: "Receivables", firm: "EY", assertion: "Valuation",
    description: "Aging analytics + subsequent collections testing using EY Canvas aged-trial-balance dashboard.",
    descriptionAr: "تحليل أعمار الديون + اختبار التحصيلات اللاحقة باستخدام لوحة EY Canvas.",
    evidence: "Aged TB" },
  { ref: "AR-K-04", section: "Receivables", firm: "KPMG", assertion: "Cut-Off",
    description: "Sales returns testing 15 days post year-end and trace to credit notes (KPMG Clara).",
    descriptionAr: "اختبار مرتجعات المبيعات خلال 15 يومًا بعد نهاية السنة ومطابقتها بإشعارات الدائن.",
    evidence: "Credit notes" },

  // ───────────────────────── INVENTORY ─────────────────────────
  { ref: "INV-D-01", section: "Inventory", firm: "Deloitte", assertion: "Existence", isaRef: "ISA 501",
    description: "Attend physical inventory count; perform test counts in both directions (floor-to-sheet & sheet-to-floor).",
    descriptionAr: "حضور الجرد الفعلي للمخزون وتنفيذ عينات في الاتجاهين (من المخزن للكشف ومن الكشف للمخزن).",
    evidence: "Count sheets" },
  { ref: "INV-P-02", section: "Inventory", firm: "PwC", assertion: "Valuation",
    description: "Re-perform lower-of-cost-or-NRV testing on slow-moving / obsolete inventory (PwC Aura IFRS 2.30).",
    descriptionAr: "إعادة احتساب التقييم بالتكلفة أو صافي القيمة القابلة للتحقق للمخزون بطيء الحركة والمتقادم.",
    evidence: "NRV calc, sales prices" },
  { ref: "INV-E-03", section: "Inventory", firm: "EY", assertion: "Cut-Off",
    description: "Cut-off test on last 20 GRNs and first 20 GDNs post year-end (EY Canvas).",
    descriptionAr: "اختبار الفصل الزمني لآخر 20 إذن استلام وأول 20 إذن صرف بعد نهاية السنة.",
    evidence: "GRN/GDN" },
  { ref: "INV-K-04", section: "Inventory", firm: "KPMG", assertion: "Completeness",
    description: "Roll-forward count from interim date to year-end using KPMG Clara population testing.",
    descriptionAr: "ترحيل الجرد من التاريخ الوسيط إلى نهاية السنة عبر اختبار كامل المجتمع (KPMG Clara).",
    evidence: "Roll-forward sched" },

  // ───────────────────────── PAYABLES ─────────────────────────
  { ref: "AP-D-01", section: "Payables", firm: "Deloitte", assertion: "Completeness",
    description: "Search for unrecorded liabilities — inspect post year-end disbursements > materiality (Deloitte AS/2 AP.SUL).",
    descriptionAr: "البحث عن التزامات غير مسجلة من خلال فحص مدفوعات ما بعد نهاية السنة التي تتجاوز الأهمية النسبية.",
    evidence: "Subseq payments" },
  { ref: "AP-P-02", section: "Payables", firm: "PwC", assertion: "Existence",
    description: "Send supplier statement reconciliations for top suppliers (PwC Aura Vendor Confirms).",
    descriptionAr: "تسوية كشوف حسابات الموردين لأكبر الموردين بقيمة الرصيد.",
    evidence: "Supplier stmts" },
  { ref: "AP-E-03", section: "Payables", firm: "EY", assertion: "Valuation",
    description: "Test FX revaluation of foreign-currency payables to closing rate (EY Canvas FX engine).",
    descriptionAr: "اختبار إعادة تقييم الذمم الدائنة بالعملات الأجنبية وفق سعر الإقفال.",
    evidence: "FX rates, GL" },

  // ───────────────────────── PAYROLL ─────────────────────────
  { ref: "PAY-K-01", section: "Payroll", firm: "KPMG", assertion: "Occurrence",
    description: "Recompute payroll for sample employees; vouch to HR master file & bank disbursement (KPMG Clara D&A).",
    descriptionAr: "إعادة احتساب الرواتب لعينة موظفين ومطابقتها مع ملف الموارد البشرية والمصروفات البنكية.",
    evidence: "HR master, payslips" },
  { ref: "PAY-E-02", section: "Payroll", firm: "EY", assertion: "Completeness",
    description: "Test ghost-employee analytics: bank account dedup, leavers paid post-exit, missing IDs (EY Helix).",
    descriptionAr: "اختبار تحليل الموظفين الوهميين: تكرار الحسابات البنكية، رواتب بعد ترك الخدمة، أرقام هوية مفقودة.",
    evidence: "HR + payroll DB" },
  { ref: "PAY-D-03", section: "Payroll", firm: "Deloitte", assertion: "Accuracy",
    description: "Recalculate EOSB / pension accruals under IAS 19 (Deloitte EOSB calculator).",
    descriptionAr: "إعادة احتساب مكافأة نهاية الخدمة ومخصصات التقاعد وفق معيار IAS 19.",
    evidence: "EOSB sched" },

  // ───────────────────────── ASSETS (PPE) ─────────────────────────
  { ref: "PPE-D-01", section: "Assets", firm: "Deloitte", assertion: "Existence",
    description: "Physical inspection of high-value PPE additions; agree to vendor invoice and capitalisation memo.",
    descriptionAr: "المعاينة الفعلية لإضافات الأصول الثابتة عالية القيمة ومطابقتها بفاتورة المورد ومذكرة الرسملة.",
    evidence: "Invoices, asset tags" },
  { ref: "PPE-P-02", section: "Assets", firm: "PwC", assertion: "Valuation",
    description: "Recalculate depreciation per IAS 16 component approach; verify useful-life policy (PwC Aura).",
    descriptionAr: "إعادة احتساب الإهلاك وفق منهج المكونات IAS 16 والتحقق من سياسة العمر الإنتاجي.",
    evidence: "FA register" },
  { ref: "PPE-E-03", section: "Assets", firm: "EY", assertion: "Valuation",
    description: "Impairment indicator review IAS 36; assess CGU cash-flow forecasts and WACC (EY Canvas Valuation).",
    descriptionAr: "مراجعة مؤشرات الهبوط وفق IAS 36 وتقييم التوقعات النقدية للوحدة المنتجة للنقد والمتوسط المرجح للتكلفة.",
    evidence: "Impairment model" },
  { ref: "PPE-K-04", section: "Assets", firm: "KPMG", assertion: "Rights & Obligations",
    description: "Inspect title deeds/registration for land & buildings; verify mortgages disclosed (KPMG Clara).",
    descriptionAr: "فحص صكوك الملكية لتسجيلات الأراضي والمباني والتحقق من إفصاح الرهونات.",
    evidence: "Title deeds" },

  // ───────────────────────── INVESTMENTS ─────────────────────────
  { ref: "INV2-P-01", section: "Investments", firm: "PwC", assertion: "Valuation",
    description: "Independent re-pricing of Level 1/2 financial instruments at year-end (PwC Aura Pricing Tool).",
    descriptionAr: "إعادة تسعير مستقلة للأدوات المالية من المستوى 1 و2 بنهاية السنة.",
    evidence: "Market data feeds" },
  { ref: "INV2-E-02", section: "Investments", firm: "EY", assertion: "Valuation",
    description: "Test Level-3 fair value model inputs and sensitivity analysis (EY Canvas FV).",
    descriptionAr: "اختبار مدخلات نموذج القيمة العادلة من المستوى 3 وتحليل الحساسية.",
    evidence: "Valuation memo" },
  { ref: "INV2-D-03", section: "Investments", firm: "Deloitte", assertion: "Existence",
    description: "Obtain custodian confirmations for all marketable securities (Deloitte AS/2 INV.01).",
    descriptionAr: "الحصول على مصادقات أمين الحفظ لكافة الأوراق المالية القابلة للتداول.",
    evidence: "Custodian confirms" },

  // ───────────────────────── DEBT ─────────────────────────
  { ref: "DBT-K-01", section: "Debt", firm: "KPMG", assertion: "Completeness",
    description: "Confirm bank loan balances, interest rates, covenants & maturity directly with lenders.",
    descriptionAr: "مصادقة أرصدة القروض البنكية ومعدلات الفائدة والتعهدات وتواريخ الاستحقاق مباشرة من المقرضين.",
    evidence: "Lender confirms" },
  { ref: "DBT-D-02", section: "Debt", firm: "Deloitte", assertion: "Presentation",
    description: "Test debt covenant compliance — recompute ratios and assess waiver letters (Deloitte Covenant Tracker).",
    descriptionAr: "اختبار التزام تعهدات الديون عبر إعادة احتساب النسب وفحص خطابات التنازل.",
    evidence: "Covenant calc" },

  // ───────────────────────── EQUITY ─────────────────────────
  { ref: "EQ-D-01", section: "Equity", firm: "Deloitte", assertion: "Completeness",
    description: "Vouch movements in equity to board resolutions, dividend declarations and statutory filings.",
    descriptionAr: "فحص حركات حقوق الملكية بالرجوع إلى قرارات مجلس الإدارة وإعلانات الأرباح والإيداعات النظامية.",
    evidence: "Board minutes" },
  { ref: "EQ-P-02", section: "Equity", firm: "PwC", assertion: "Accuracy",
    description: "Recompute EPS (basic & diluted) per IAS 33 and agree to disclosures (PwC Aura).",
    descriptionAr: "إعادة احتساب ربحية السهم (الأساسي والمخفض) وفق IAS 33 ومطابقتها بالإفصاحات.",
    evidence: "EPS workings" },

  // ───────────────────────── EXPENSES ─────────────────────────
  { ref: "EXP-E-01", section: "Expenses", firm: "EY", assertion: "Occurrence",
    description: "Vendor master cleansing & duplicate-payment analytics across full population (EY Helix).",
    descriptionAr: "تنقية ملف الموردين وتحليل المدفوعات المكررة عبر كامل المجتمع.",
    evidence: "AP transactions" },
  { ref: "EXP-K-02", section: "Expenses", firm: "KPMG", assertion: "Classification",
    description: "Test capitalised vs expensed costs threshold ($/age) using KPMG Clara D&A.",
    descriptionAr: "اختبار حدود الرسملة مقابل المصروف للتكاليف باستخدام KPMG Clara.",
    evidence: "Capex memos" },

  // ───────────────────────── TAX ─────────────────────────
  { ref: "TAX-D-01", section: "Tax", firm: "Deloitte", assertion: "Completeness",
    description: "Recompute current & deferred tax provisions; reconcile effective tax rate (Deloitte iCount).",
    descriptionAr: "إعادة احتساب مخصصات الضرائب الجارية والمؤجلة وتسوية المعدل الفعلي للضريبة.",
    evidence: "Tax workings" },
  { ref: "TAX-P-02", section: "Tax", firm: "PwC", assertion: "Valuation",
    description: "Assess uncertain tax positions under IFRIC 23; review correspondence with tax authority.",
    descriptionAr: "تقييم المراكز الضريبية غير المؤكدة وفق IFRIC 23 ومراجعة المراسلات مع الهيئة الضريبية.",
    evidence: "Tax assessments" },

  // ───────────────────────── JOURNAL ENTRY TESTING ─────────────────────────
  { ref: "JE-I-01", section: "JE_Testing", firm: "ISA", assertion: "Occurrence", isaRef: "ISA 240.32",
    description: "Test journal entries using risk criteria: round-amount, weekend/holiday, year-end manual, unusual users.",
    descriptionAr: "اختبار قيود اليومية وفق معايير الخطر: مبالغ مستديرة، عطلات، قيود يدوية بنهاية السنة، مستخدمون غير معتادين.",
    evidence: "GL JE export" },
  { ref: "JE-K-02", section: "JE_Testing", firm: "KPMG", assertion: "Authorization",
    description: "Population-level test on all manual JEs > materiality; agree to approval workflow (KPMG Clara D&A).",
    descriptionAr: "اختبار كامل المجتمع لجميع القيود اليدوية التي تتجاوز الأهمية النسبية ومطابقتها لمسار الاعتماد.",
    evidence: "JE log + workflow" },
  { ref: "JE-D-03", section: "JE_Testing", firm: "Deloitte", assertion: "Occurrence",
    description: "Apply Benford's law on first-digit distribution of JE amounts (Deloitte Spotlight).",
    descriptionAr: "تطبيق قانون بنفورد على توزيع الرقم الأول لمبالغ القيود.",
    evidence: "JE dataset" },

  // ───────────────────────── ITGC ─────────────────────────
  { ref: "ITGC-E-01", section: "ITGC", firm: "EY", assertion: "Control Effectiveness",
    description: "Test logical access — privileged user listing, leavers' access removal, password policy (EY Canvas ITGC).",
    descriptionAr: "اختبار الوصول المنطقي: قائمة المستخدمين ذوي الصلاحيات، إزالة صلاحيات المنفصلين، سياسة كلمات المرور.",
    evidence: "AD export, HR leavers" },
  { ref: "ITGC-P-02", section: "ITGC", firm: "PwC", assertion: "Control Effectiveness",
    description: "Test change management — sample program changes traced to approval, dev/test, prod migration (PwC Aura).",
    descriptionAr: "اختبار إدارة التغيير: عينة من تغييرات البرامج متتبعة للاعتماد ومسار البيئة (تطوير/اختبار/إنتاج).",
    evidence: "Change tickets" },
  { ref: "ITGC-K-03", section: "ITGC", firm: "KPMG", assertion: "Control Effectiveness",
    description: "Test backup/restore procedures and DR testing evidence (KPMG Clara IT).",
    descriptionAr: "اختبار إجراءات النسخ الاحتياطي والاستعادة وأدلة اختبار التعافي من الكوارث.",
    evidence: "Backup logs" },

  // ───────────────────────── GOING CONCERN ─────────────────────────
  { ref: "GC-I-01", section: "Going_Concern", firm: "ISA", assertion: "Disclosure", isaRef: "ISA 570",
    description: "Evaluate 12-month cash-flow forecast, covenant headroom, sensitivity & reverse stress test.",
    descriptionAr: "تقييم توقعات التدفق النقدي لمدة 12 شهرًا وهامش التعهدات وتحليل الحساسية واختبار الضغط العكسي.",
    evidence: "Forecast model" },
  { ref: "GC-D-02", section: "Going_Concern", firm: "Deloitte", assertion: "Disclosure",
    description: "Obtain written representation on management's going-concern assessment (Deloitte AS/2 GC.WR).",
    descriptionAr: "الحصول على إقرار مكتوب من الإدارة بشأن تقييم الاستمرارية.",
    evidence: "Mgmt rep letter" },
];

export const SECTION_LABELS: Record<CycleSection, { en: string; ar: string }> = {
  Revenue: { en: "Revenue & Sales", ar: "الإيرادات والمبيعات" },
  Cash: { en: "Cash & Bank", ar: "النقدية والبنوك" },
  Assets: { en: "Property, Plant & Equipment", ar: "الأصول الثابتة" },
  Equity: { en: "Equity & Reserves", ar: "حقوق الملكية والاحتياطيات" },
  Receivables: { en: "Receivables / AR", ar: "الذمم المدينة" },
  Inventory: { en: "Inventory", ar: "المخزون" },
  Payables: { en: "Payables / AP", ar: "الذمم الدائنة" },
  Payroll: { en: "Payroll & HR", ar: "الرواتب والموارد البشرية" },
  Expenses: { en: "Operating Expenses", ar: "المصروفات التشغيلية" },
  Tax: { en: "Income Tax & VAT", ar: "ضريبة الدخل والقيمة المضافة" },
  Investments: { en: "Financial Investments", ar: "الاستثمارات المالية" },
  Debt: { en: "Loans & Borrowings", ar: "القروض والاقتراضات" },
  JE_Testing: { en: "Journal Entry Testing", ar: "اختبار قيود اليومية" },
  ITGC: { en: "IT General Controls", ar: "الضوابط العامة لتقنية المعلومات" },
  Going_Concern: { en: "Going Concern", ar: "الاستمرارية" },
};

export const FIRM_COLORS: Record<Firm, string> = {
  Deloitte: "bg-emerald-100 text-emerald-800 border-emerald-300",
  PwC:      "bg-orange-100 text-orange-800 border-orange-300",
  EY:       "bg-yellow-100 text-yellow-900 border-yellow-300",
  KPMG:     "bg-sky-100 text-sky-800 border-sky-300",
  ISA:      "bg-slate-200 text-slate-800 border-slate-300",
};
