// Lightweight event-driven bus for the audit app (Single Source of Truth).
// Bridges localStorage-backed analysis data to any screen that needs reactive updates.

import { useEffect, useState } from "react";
import type { MaterialityState, RiskItem } from "../types";

// ─── Arabic normaliser (mirrors the one in AnalysisWorkspace) ───────────────
function normAr(s: string): string {
  return s
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // Remove diacritics and TATWEEL
    .replace(/[\-_()،,.\s\/\\]+/g, "") // Remove punctuation, spaces, dashes
    .trim();
}

// ─── IFRS FS Line Item Definitions ──────────────────────────────────────────
// Each definition maps a set of TB account name/code patterns to a single
// standard IFRS FS line item. generateFSFromTB aggregates all matching TB
// rows into one line — so "بنك الأهلي", "بنك مصر", "الصندوق" all become
// one line: "النقدية وما في حكمها".
export type FSSection = "currentAssets" | "nonCurrentAssets" | "currentLiabilities" | "nonCurrentLiabilities" | "equity" | "revenue" | "expense";

export interface FSLineDef {
  id: string;
  labelAr: string;
  labelEn: string;
  section: FSSection;
  pattern: RegExp;  // applied to normAr(code + " " + name) — must be single-line
  sortOrder: number;
  /** If set, this line is a contra account — its value is SUBTRACTED from the target line. */
  contraFor?: string;
}

export const FS_LINE_DEFS: FSLineDef[] = [
  // ── Current Assets ────────────────────────────────────────────────────────
    { id: "cash",        labelAr: "النقدية وما في حكمها",             labelEn: "Cash and Cash Equivalents",           section: "currentAssets",       sortOrder: 10,  pattern: /نقد|كاش|صندوق|خزينه|خزينهبنك|بنك|مدفوعاتحكوميه|نقديه|نقدي|bankbalance|cashbalance|petty|cash(?!.*sale)|bank(?!.*loan|.*longterm)|accountcurrent|currentaccount/ },
  { id: "st-invest",   labelAr: "استثمارات قصيرة الأجل",           labelEn: "Short-term Investments",              section: "currentAssets",       sortOrder: 20,  pattern: /شهادهادخار|شهادهاستثمار|وديعهبنكيه|استثمارقصير|stinvest|shortteminvest|shortterminvest/ },
  { id: "receivables", labelAr: "الذمم المدينة / المدينون والعملاء", labelEn: "Trade Receivables",                 section: "currentAssets",       sortOrder: 30,  pattern: /ذمم|مدينون|مديون|عملاء(?!دفعاتمقدمه)|حسابعملاء|ذممدائنه|مديونيه|receivable|tradereceivable|accountreceivable|debtors|customerbalance|clientbalance/ },
  { id: "allowance-rec", labelAr: "مخصص الديون المشكوك فيها (مقابل العملاء)", labelEn: "Allowance for Doubtful Debts (contra)", section: "currentAssets", sortOrder: 31, pattern: /مخصص(ال)?(ديون|مديونيه|عملاء|ذمم)|allowancedoubtful|allowancebaddeb|provisiondoubtful|baddebts/, contraFor: "receivables" },
  { id: "inventory",   labelAr: "المخزون / البضاعة",               labelEn: "Inventories",                         section: "currentAssets",       sortOrder: 40,  pattern: /مخزون|بضاعه|موادخام|موادصرف|inventory|stock|goods|rawmaterial|merchandise/ },
  { id: "allowance-inv", labelAr: "مخصص هبوط قيمة المخزون (مقابل المخزون)", labelEn: "Inventory Write-down Allowance (contra)", section: "currentAssets", sortOrder: 41, pattern: /مخصص(ال)?(هبوط|مخزون)|allowanceinventory|inventoryimpairment|stockimpairment/, contraFor: "inventory" },
  { id: "prepaid",     labelAr: "المصروفات المدفوعة مقدماً",       labelEn: "Prepaid Expenses",                    section: "currentAssets",       sortOrder: 50,  pattern: /مصروفمقدم|دفعهمقدمه(?!.*عميل)|prepaid|advancepayment(?!.*customer)|prepayments/ },
  { id: "tax-rec",     labelAr: "الضريبة المستردة / VAT مدين",     labelEn: "Tax Receivable / VAT Receivable",     section: "currentAssets",       sortOrder: 60,  pattern: /ضريبهمستردده|ضريبخصمالمنبع|ضرائبخصمالمنبع|vatمدين|taxreceivable|vatreceivable|vatinput|inputtax/ },
  { id: "other-ca",    labelAr: "أصول متداولة أخرى",               labelEn: "Other Current Assets",                section: "currentAssets",       sortOrder: 99,  pattern: /othercurrentasset|اصولمتداولهاخري|مدفوعاتحكوميه|currentasset|shorttermasset/ },
  // ── Non-Current Assets ────────────────────────────────────────────────────
  { id: "ppe",         labelAr: "الممتلكات والمعدات والمنشآت - صافي", labelEn: "Property, Plant & Equipment, net", section: "nonCurrentAssets",    sortOrder: 110, pattern: /ثابت|اثاث|سياره|سيارات|معده|معدات|تجهيز|تجهيزات|ماكينه|ماكينات|مبني|مباني|ارض|اراضي|عقار|عقارات|تحتالتنفيذ|تحتالانشاء|تحتالانجاز|خطانتاج|خطوطانتاج|property|plant|equipment|machinery|vehicle|furniture|building|land|wip|construction|fixedasset|ppe/ },
  { id: "accum-dep",   labelAr: "مجمع الإهلاك (مقابل الأصول الثابتة)", labelEn: "Accumulated Depreciation (contra PP&E)", section: "nonCurrentAssets", sortOrder: 111, pattern: /مجمع(ال)?(اهلاك|استهلاك|هبوط)|(اهلاك|استهلاك)مجمع|اقساط(ال)?اهلاك|accumulateddep|accumdep|depreciationreserve/, contraFor: "ppe" },
  { id: "intangibles", labelAr: "الأصول غير الملموسة والشهرة",     labelEn: "Intangible Assets & Goodwill",        section: "nonCurrentAssets",    sortOrder: 120, pattern: /شهره|حقامتياز|براءهاختراع|برامج|نظام|موقعالكتروني|goodwill|intangible|software|patent|trademark|franchise|license/ },
  { id: "lt-invest",   labelAr: "الاستثمارات طويلة الأجل",         labelEn: "Long-term Investments",               section: "nonCurrentAssets",    sortOrder: 130, pattern: /استثمارطويل|حصهفيشركه|longteminvest|longterminvest|equityinvest|investmentinassociate/ },
  { id: "deposits",    labelAr: "التأمينات والودائع طويلة الأجل",  labelEn: "Security Deposits & Long-term Guarantees", section: "nonCurrentAssets", sortOrder: 140, pattern: /تامينات|تامين(?!.*حياه)|ضمانات|guarantee|securitydeposit|deposit|longtermdeposit/ },
  { id: "other-nca",   labelAr: "أصول غير متداولة أخرى",           labelEn: "Other Non-Current Assets",            section: "nonCurrentAssets",    sortOrder: 199, pattern: /othernoncurrentasset|اصولغيرمتداولهاخري|noncurrentasset/ },
  // ── Current Liabilities ───────────────────────────────────────────────────
  { id: "trade-pay",   labelAr: "الموردون والدائنون",               labelEn: "Trade Payables",                      section: "currentLiabilities",  sortOrder: 210, pattern: /دائنون|موردون|موردين|ذمم|ذمهدائنه|tradepayable|accountpayable|supplier|creditors|payables/ },
  { id: "st-loans",    labelAr: "قروض قصيرة الأجل وسحب على المكشوف", labelEn: "Short-term Loans & Bank Overdrafts", section: "currentLiabilities",  sortOrder: 220, pattern: /قرضقصير|سحبعليالمكشوف|مكشوف|overdraft|shorttermloan|shorttermdebt/ },
  { id: "accrued-sal", labelAr: "الرواتب والأجور المستحقة",         labelEn: "Accrued Salaries & Wages",            section: "currentLiabilities",  sortOrder: 230, pattern: /راتبمستحق|رواتبمستحقه|اجورمستحقه|مستحقللعاملين|accruedsal|accruedwage|salarypayable|wagespayable/ },
  { id: "tax-pay",     labelAr: "الضرائب المستحقة",                 labelEn: "Tax Payable",                         section: "currentLiabilities",  sortOrder: 240, pattern: /ضريب(?!ه?مؤجله|يهضريبيه?مؤجله)|taxpayable|incometaxpayable|vatpayable|taxespayable/ },
  { id: "cust-adv",    labelAr: "دفعات مقدمة من العملاء",           labelEn: "Customer Advances",                   section: "currentLiabilities",  sortOrder: 250, pattern: /دفعهمقدمهمنعملاء|دفعاتمقدمهعملاء|عملاءدفعاتمقدمه|مقدممنعميل|عربون|customeradvance|advancefromcustomer|advancesfromcustomers/ },
  { id: "owners-current", labelAr: "جاري أصحاب الحصص",              labelEn: "Owners Current Account",               section: "currentLiabilities",  sortOrder: 255, pattern: /جارياصحابالحصص|حسابجارياصحابالحصص|ownerscurrent/ },
  { id: "coop-liability", labelAr: "المساهمة التكافلية المستحقة",   labelEn: "Cooperative Contribution Payable",       section: "currentLiabilities",  sortOrder: 260, pattern: /^(?!.*مصروف)(?=.*مساهمهتكافليه).*$/ },
  { id: "other-cl",    labelAr: "التزامات متداولة أخرى",            labelEn: "Other Current Liabilities",           section: "currentLiabilities",  sortOrder: 299, pattern: /othercurrentliab|التزاماتمتداولهاخري|currentliability/ },
  // ── Non-Current Liabilities ───────────────────────────────────────────────
  { id: "lt-loans",    labelAr: "قروض طويلة الأجل",                 labelEn: "Long-term Loans",                     section: "nonCurrentLiabilities", sortOrder: 310, pattern: /قرضطويل|سندات|قرضبنكي|longterloan|longtermloan|bond|debenture|longtermdebt/ },
  { id: "eob",         labelAr: "مخصص مكافأة نهاية الخدمة",        labelEn: "End-of-Service Benefit Provision",    section: "nonCurrentLiabilities", sortOrder: 320, pattern: /مكافاهنهايهالخدمه|مكافأهنهايه|نهايهخدمه|endofservice|gratuity|severance|employeebenefit/ },
  { id: "other-ncl",   labelAr: "التزامات غير متداولة أخرى",        labelEn: "Other Non-Current Liabilities",       section: "nonCurrentLiabilities", sortOrder: 399, pattern: /othernoncurrentliab|التزاماتغيرمتداولهاخري|noncurrentliability/ },
  // ── Equity ────────────────────────────────────────────────────────────────
  { id: "paid-cap",    labelAr: "رأس المال المدفوع",                 labelEn: "Paid-up Capital",                     section: "equity",              sortOrder: 410, pattern: /راسالمال|sharecapital|paidupcapital|capital/ },
  { id: "share-prem",  labelAr: "علاوة الإصدار",                   labelEn: "Share Premium",                       section: "equity",              sortOrder: 420, pattern: /علاوهاصدار|sharepremium/ },
  { id: "reserves",    labelAr: "الاحتياطيات",                      labelEn: "Reserves",                            section: "equity",              sortOrder: 430, pattern: /احتياطي|احتياطيات|reserve|reserves/ },
  { id: "retained",    labelAr: "الأرباح المبقاة / الخسائر المتراكمة", labelEn: "Retained Earnings / Accumulated Losses", section: "equity",     sortOrder: 440, pattern: /ارباحمحتجزه|ارباحمبقاه|ارباحمرحله|خسارهمحتجزه|خسائرمتراكمه|retainedearning|accumulatedloss|retainedearnings/ },
  { id: "profit-year", labelAr: "أرباح العام",                     labelEn: "Profit for the Year",                  section: "equity",              sortOrder: 450, pattern: /ارباحالعام|ربحالعام|profitfortheyear|profitforthisyear/ },
  // ── Revenue ───────────────────────────────────────────────────────────────
  { id: "sales-rev",   labelAr: "إيرادات المبيعات والخدمات",        labelEn: "Sales & Service Revenue",             section: "revenue",             sortOrder: 510, pattern: /مبيعات|ايراد|دخل(?!.*ضريبه)|revenue|sales|income(?!.*tax)|turnover|serviceincome/ },
  { id: "other-inc",   labelAr: "الإيرادات الأخرى",                 labelEn: "Other Income",                        section: "revenue",             sortOrder: 590, pattern: /فائدهدائنه|فائده|ربحبيعاصل|ارباح|اربح|مكاسب|فوائض|فروق|ايرادات(?!.*مبيعات)|otherincome|interestincome|gainonsale|miscincome|فوائد|عنصرآخر|عنصراخر|مصلح|عائدآخر|عائداخر/ },
  // ── Expenses ──────────────────────────────────────────────────────────────
  { id: "cogs",        labelAr: "تكلفة المبيعات / البضاعة المباعة", labelEn: "Cost of Sales / COGS",               section: "expense",             sortOrder: 610, pattern: /تكلفهمبيعات|تكلفهبضاعه|تكلفهخدمات|تكلفهايرادات|تكلفهايراد|مصروفاتتشغيليه|costofsale|cogs|costofgood|costofsales|operatingcost/ },
  { id: "sal-exp",     labelAr: "الرواتب والأجور",                  labelEn: "Salaries & Wages",                    section: "expense",             sortOrder: 620, pattern: /راتب(?!.*مستحق)|رواتب(?!.*مستحق)|اجور(?!.*مستحق)|مرتبات|مرتب|مكافا|salary(?!.*payable)|wage(?!.*payable)|payroll|salaries/ },
  { id: "depr-exp",    labelAr: "مصاريف الاستهلاك والإهلاك",       labelEn: "Depreciation & Amortization",         section: "expense",             sortOrder: 630, pattern: /اهلاك|استهلاك|depreciation|amortization/ },
  { id: "sell-exp",    labelAr: "مصاريف البيع والتسويق والتوزيع",   labelEn: "Selling, Marketing & Distribution",   section: "expense",             sortOrder: 640, pattern: /مصروفبيع|مصاريفبيع|مصروفتسويق|مصاريفتسويق|مصروفتوزيع|sellingexp|marketingexp|distributionexp/ },
  { id: "ga-exp",      labelAr: "المصاريف الإدارية والعمومية",      labelEn: "General & Administrative Expenses",   section: "expense",             sortOrder: 650, pattern: /اداري|عموميه|تشغيل|عموم|administrative|overhead|generalexp|administrativeexpenses/ },
  { id: "fin-cost",    labelAr: "مصاريف التمويل والفوائد",          labelEn: "Finance Costs & Interest Expense",    section: "expense",             sortOrder: 660, pattern: /فائدهمدينه|فوائدبنك|فوائدقرض|مصروفتمويل|financecost|interestexp|interestexpense/ },
  { id: "tax-exp",     labelAr: "ضريبة الدخل",                     labelEn: "Income Tax Expense",                  section: "expense",             sortOrder: 670, pattern: /ضريبه(?:ال)?دخل|ضريبهدخل|ضرايب(?:ال)?دخل|ضرائب(?:ال)?دخل|incometax(?!.*payable|.*receivable)|incometaxexpense|taxexpense/ },
    { id: "other-exp",   labelAr: "مصاريف أخرى",                     labelEn: "Other Expenses",                      section: "expense",             sortOrder: 699, pattern: /مصروف|مصاريف|expense|cost(?!.*sale|.*good)|تكافل|تكاف|تأمين|تامين|تؤمين|تأمينات|تامينات|بريميوم|premium|تكافؤ|تأمينات/ },
  { id: "coop-liability", labelAr: "المساهمة التكافلية المستحقة",   labelEn: "Cooperative Contribution Payable",       section: "currentLiabilities",  sortOrder: 260, pattern: /^(?!.*مصروف)(?=.*مساهمهتكافليه).*$/ },
];

export function getFSLineDef(id: string): FSLineDef | undefined {
  return FS_LINE_DEFS.find(d => d.id === id);
}

/**
 * Map a single TB row to its IFRS FS line item id.
 * Uses the category to narrow the search pool, then matches by keyword pattern.
 */
export function mapToFSLine(name: string, code: string, category: TBRow["category"], cy = 0): string {
  const s = normAr(`${code} ${name}`);

  // ── Pre-check: contra accounts override category-based matching ──────────
  // These accounts can appear with any balance/category label in the raw TB,
  // so we match them by name pattern BEFORE the category filter.
  for (const def of FS_LINE_DEFS) {
    if (def.contraFor && def.pattern.test(s)) return def.id;
  }
  if (/مصروفمساهمهتكافليه|مصروفالتكافل/.test(s)) return "other-exp";
  if (/المساهمهالتكافليه|مساهمهتكافليهالكوارث/.test(s)) return "other-cl";
  if (/ارباحراس|ربحراسمالي/.test(s)) return "retained";
  if (/الارباحالمرحله|ارباحمرحله|ارباحمبقاه/.test(s)) return "retained";
  if (/مصاريفبنكيه|مصروفاتبنكيه|bankcharges|bankfees|مصروفتسوياتفحصضريبي/.test(s)) return "ga-exp";
  if (/تكلفهايرادات|تكلفهايراد|costofrevenue/.test(s)) return "cogs";
  if (/مدفوعاتحكوميه/.test(s)) return "cash";
  if (/ارباحمرحله|ارباحمبقاه|retainedearning/.test(s)) return "retained";
  if (/تكلف.*ايراد|costofrevenue/.test(s)) return "cogs";
  if (/ضريب|tax/.test(s) && /مؤجله|deferred/.test(s)) return "other-ncl";
  if (cy < 0 && /تاميناتللغير|تامينلديالغير|تأميناتللغير/.test(s)) return "other-cl";

  const sectionsByCategory: Record<TBRow["category"], FSSection[]> = {
    Asset:     ["currentAssets", "nonCurrentAssets"],
    Liability: ["currentLiabilities", "nonCurrentLiabilities"],
    Equity:    ["equity"],
    Revenue:   ["revenue"],
    Expense:   ["expense"],
    Other:     ["currentAssets", "nonCurrentAssets", "currentLiabilities", "nonCurrentLiabilities", "revenue", "expense"],
  };

  const allowed = sectionsByCategory[category];
  // A keyword can belong to more than one accounting family. For example,
  // "ذمم" appears in both receivables and payables. Prefer the matching line
  // in the account's inferred section so a liability cannot become a customer
  // balance merely because the receivables definition appears first.
  const explicitMatches = FS_LINE_DEFS.filter(def =>
    allowed.includes(def.section) && def.pattern.test(s),
  );
  if (explicitMatches.length) {
    return explicitMatches.sort((a, b) => a.sortOrder - b.sortOrder)[0].id;
  }

  const candidates = FS_LINE_DEFS
    .filter(d => allowed.includes(d.section))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const def of candidates) {
    if (def.pattern.test(s)) return def.id;
  }

  // Catch-all fallbacks aligned with accounting conventions.
  if (category === "Asset") {
    const cur = /نقد|كاش|بنك|صندوق|مدينون|عملاء|مخزون|مقدم|cash|bank|receivable|inventory|prepaid|debtors|receivables/.test(s);
    return cur ? "other-ca" : "other-nca";
  }
  if (category === "Liability") {
    const cur = /مستحق|مكشوف|payable|accrued|shortterm|overdraft|creditors|supplier|payables/.test(s);
    return cur ? "other-cl" : "other-ncl";
  }
  if (category === "Equity") return "retained";
  if (category === "Revenue") return "sales-rev";
  if (category === "Expense") return "other-exp";
  return cy >= 0 ? "other-nca" : "other-ncl";
}

export interface TBRow {
  code: string;
  name: string;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "Other";
  py: number;
  cy: number;
  debit?: number;
  credit?: number;
  opening?: number;
  fsLineId?: string;    // IFRS FS line item id (set by parser, used by generateFSFromTB)
}
export interface JERow {
  id: string;
  date: string;
  time: string;
  account: string;
  debit: number;
  credit: number;
  preparedBy: string;
  description: string;
  flags: string[];
}
export interface AnalysisData {
  tb: TBRow[];
  je: JERow[];
  aiNotes: string;
}

export interface GeneratedFSRow {
  label: string;
  labelAr: string;
  labelEn?: string;
  cy: number;
  py: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  /** TB account names aggregated into this line — used for mapping review */
  tbAccounts?: string[];
  /** FS line def id */
  fsLineId?: string;
  /** Gross value before subtracting contra accounts (e.g. gross PP&E before accum. dep.) */
  grossCy?: number;
  /** Total of contra accounts subtracted (positive = amount deducted) */
  contraCy?: number;
  /** Names of contra accounts that were netted off */
  contraAccounts?: string[];
}

export interface GeneratedFS {
  generatedAt: string;
  clientId: string;
  balanceSheet: {
    currentAssets: GeneratedFSRow[];
    nonCurrentAssets: GeneratedFSRow[];
    currentLiabilities: GeneratedFSRow[];
    nonCurrentLiabilities: GeneratedFSRow[];
    equity: GeneratedFSRow[];
  };
  incomeStatement: {
    revenue: GeneratedFSRow[];
    expenses: GeneratedFSRow[];
  };
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface CompanyFSRow {
  label: string;
  value: number;       // CY value
  pyValue?: number;    // PY value (from multi-sheet Excel FS files)
  section: string;
}

export interface CompanyFS {
  uploadedAt: string;
  fileName: string;
  rows: CompanyFSRow[];
}

export const ANALYSIS_STORAGE_KEY = "dabour:analysis-data";
export const ANALYSIS_EVENT = "dabour:analysis-updated";
export const FS_STORAGE_KEY = "dabour:generated-fs";
export const COMPANY_FS_STORAGE_KEY = "dabour:company-fs";
export const FS_EVENT = "dabour:fs-updated";

const empty = (): AnalysisData => ({ tb: [], je: [], aiNotes: "" });

function loadAll(): Record<string, AnalysisData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAnalysisData(clientId: string): AnalysisData {
  return loadAll()[clientId] || empty();
}

export function emitAnalysisUpdated(clientId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ANALYSIS_EVENT, { detail: { clientId } }));
}

export function useAnalysisData(clientId: string): AnalysisData {
  const [data, setData] = useState<AnalysisData>(() => getAnalysisData(clientId));

  useEffect(() => {
    setData(getAnalysisData(clientId));
    const refresh = () => setData(getAnalysisData(clientId));
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<{ clientId?: string }>).detail;
      if (!detail?.clientId || detail.clientId === clientId) refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === ANALYSIS_STORAGE_KEY) refresh();
    };
    window.addEventListener(ANALYSIS_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ANALYSIS_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [clientId]);

  return data;
}

// ─── Generated Financial Statements ─────────────────────────────────────────

export function getGeneratedFS(clientId: string): GeneratedFS | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[clientId] || null;
  } catch { return null; }
}

export function saveGeneratedFS(clientId: string, fs: GeneratedFS) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(FS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[clientId] = fs;
    localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(FS_EVENT, { detail: { clientId } }));
  } catch {}
}

export function useGeneratedFS(clientId: string): GeneratedFS | null {
  const [fs, setFS] = useState<GeneratedFS | null>(() => getGeneratedFS(clientId));
  useEffect(() => {
    setFS(getGeneratedFS(clientId));
    const refresh = () => setFS(getGeneratedFS(clientId));
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ clientId?: string }>).detail;
      if (!detail?.clientId || detail.clientId === clientId) refresh();
    };
    window.addEventListener(FS_EVENT, onEvent);
    window.addEventListener(ANALYSIS_EVENT, onEvent);
    return () => {
      window.removeEventListener(FS_EVENT, onEvent);
      window.removeEventListener(ANALYSIS_EVENT, onEvent);
    };
  }, [clientId]);
  return fs;
}

// ─── Company-Provided Financial Statements ───────────────────────────────────

export function getCompanyFS(clientId: string): CompanyFS | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPANY_FS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[clientId] || null;
  } catch { return null; }
}

export function saveCompanyFS(clientId: string, fs: CompanyFS) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(COMPANY_FS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[clientId] = fs;
    localStorage.setItem(COMPANY_FS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(FS_EVENT, { detail: { clientId } }));
  } catch {}
}

export function useCompanyFS(clientId: string): CompanyFS | null {
  const [fs, setFS] = useState<CompanyFS | null>(() => getCompanyFS(clientId));
  useEffect(() => {
    setFS(getCompanyFS(clientId));
    const refresh = () => setFS(getCompanyFS(clientId));
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ clientId?: string }>).detail;
      if (!detail?.clientId || detail.clientId === clientId) refresh();
    };
    window.addEventListener(FS_EVENT, onEvent);
    return () => { window.removeEventListener(FS_EVENT, onEvent); };
  }, [clientId]);
  return fs;
}

// ─── Defensive full wipe for a client id ─────────────────────────────────────
// Guarantees a brand-new client never inherits stale data left over in
// localStorage from a previously-deleted/orphaned client that happened to
// reuse the same id. Called once right after a new client is created.
export function clearClientData(clientId: string) {
  if (typeof window === "undefined") return;
  const keys = [
    ANALYSIS_STORAGE_KEY,
    FS_STORAGE_KEY,
    COMPANY_FS_STORAGE_KEY,
    FINDINGS_STORAGE_KEY,
  ];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const map = JSON.parse(raw);
      if (clientId in map) {
        delete map[clientId];
        localStorage.setItem(key, JSON.stringify(map));
      }
    } catch { /* ignore malformed storage */ }
  }
  emitAnalysisUpdated(clientId);
  window.dispatchEvent(new CustomEvent(FS_EVENT, { detail: { clientId } }));
}

// ─── Financial Position Deriver ──────────────────────────────────────────────

export function deriveFinancialPosition(tb: TBRow[], fallbackBase: number) {
  if (!tb || tb.length === 0) {
    const base = fallbackBase || 1_000_000;
    return {
      hasRealData: false,
      currentAssets: base * 0.45,
      nonCurrentAssets: base * 0.55,
      currentLiab: base * 0.3,
      nonCurrentLiab: base * 0.2,
      equity: base * 0.5,
      revenue: base * 0.8,
      expenses: base * 0.6,
    };
  }
  const sum = (pred: (r: TBRow) => boolean) =>
    tb.filter(pred).reduce((s, r) => s + (Number(r.cy) || 0), 0);

  const isCurrent = (r: TBRow) =>
    /(cash|bank|receivable|inventory|prepaid|short|نقد|بنك|مدينون|مخزون)/i.test(r.name);
  const isCurrentLiab = (r: TBRow) =>
    /(payable|accrued|short|tax payable|deferred|دائنون|مستحق|ضريبة مستحقة)/i.test(r.name);

  const assets = sum((r) => r.category === "Asset");
  const liab = sum((r) => r.category === "Liability");
  const equity = sum((r) => r.category === "Equity");
  const revenue = sum((r) => r.category === "Revenue");
  const expenses = sum((r) => r.category === "Expense");
  const currentAssets = sum((r) => r.category === "Asset" && isCurrent(r));
  const currentLiab = sum((r) => r.category === "Liability" && isCurrentLiab(r));

  return {
    hasRealData: true,
    currentAssets: currentAssets || assets * 0.45,
    nonCurrentAssets: assets - (currentAssets || assets * 0.45),
    currentLiab: currentLiab || liab * 0.6,
    nonCurrentLiab: liab - (currentLiab || liab * 0.6),
    equity,
    revenue,
    expenses,
  };
}

// ─── Generate FS from TB ─────────────────────────────────────────────────────

export function generateFSFromTB(clientId: string, tb: TBRow[]): GeneratedFS {
  // ── Step 1: resolve each TB row's IFRS FS line id ─────────────────────────
  const mapped = tb.map(r => ({
    ...r,
    // Recompute mappings so previously stored rows pick up corrected rules.
    _lineId: mapToFSLine(r.name, r.code, r.category, r.cy),
  }));

  // ── DEBUG: Log each TB row categorization and mapping ───────────────────────
  console.log("[generateFSFromTB] Starting FS generation from TB", { tbRowCount: tb.length });
  const tbMappingTrace = tb.map(r => {
    const lineId = r.fsLineId || mapToFSLine(r.name, r.code, r.category, r.cy);
    const lineDef = getFSLineDef(lineId);
    return {
      code: r.code,
      name: r.name,
      category: r.category,
      cy: r.cy,
      mapped_to_fsLineId: lineId,
      mapped_to_fsLabel: lineDef?.labelAr || "UNMAPPED",
      mapped_to_section: lineDef?.section || "UNKNOWN",
    };
  });
  console.log("[generateFSFromTB] TB Row Mapping Trace:", tbMappingTrace);

  // ── Step 2: group rows by FS line id, summing CY and PY ───────────────────
  // The accumulated group tracks the gross, the contra contributions and the
  // names of every account aggregated into the line (semantic grouping trail).
  const groups = new Map<string, { cy: number; py: number; accounts: string[]; def: FSLineDef; grossCy: number; contraCy: number }>();
  for (const r of mapped) {
    const def = getFSLineDef(r._lineId);
    if (!def) continue;
    if (!groups.has(r._lineId)) {
      groups.set(r._lineId, { cy: 0, py: 0, accounts: [], def, grossCy: 0, contraCy: 0 });
    }
    const g = groups.get(r._lineId)!;
    const absCy = Math.abs(r.cy || 0);
    const statementCy = def.section === "currentAssets" || def.section === "nonCurrentAssets"
      ? (r.cy || 0)
      : absCy;
    // Contra accounts are kept separate (they reduce the parent net), everything
    // else contributes to the gross and to the semantic-grouped account names.
    if (def.contraFor) {
      g.contraCy += absCy;
    } else {
      g.cy += statementCy;
      g.grossCy += statementCy;
    }
    g.py += Math.abs(r.py || 0);
    if (r.name) g.accounts.push(r.name);
  }

  // ── DEBUG: Log aggregation groups ─────────────────────────────────────────
  const groupsTrace = Array.from(groups.entries()).map(([id, g]) => ({
    fsLineId: id,
    fsLabel: g.def.labelAr,
    section: g.def.section,
    cy: g.cy,
    py: g.py,
    grossCy: g.grossCy,
    contraCy: g.contraCy,
    contraFor: g.def.contraFor,
    accountsCount: g.accounts.length,
    accounts: g.accounts.slice(0, 3), // show first 3 accounts
  }));
  console.log("[generateFSFromTB] Aggregated Groups Before Contra Application:", groupsTrace);

  // ── Step 2b: apply contra accounts with a full audit trail ────────────────
  // Contra accounts (مجمع الإهلاك, مخصص ديون مشكوك فيها, …) reduce their parent
  // net line. We record the gross, the amount subtracted and which contra
  // accounts were involved so the UI can show "Gross − Accum. Dep = Net".
  for (const [contraId, cg] of groups) {
    if (!cg.def.contraFor) continue;
    const parentId = cg.def.contraFor;
    const pg = groups.get(parentId);
    if (!pg) continue;
    // Subtract contra from parent (both cy and py)
    pg.cy = Math.max(0, pg.grossCy - cg.contraCy);
    pg.py = Math.max(0, pg.py - cg.py);
    // Record the subtracted amount on the parent for the UI breakdown trail
    pg.contraCy += cg.contraCy;
    // Attach contra account names to parent for the mapping/semantic trail
    pg.accounts.push(...cg.accounts.map(a => `(مقابلة) ${a}`));
    // Remove contra from groups so it doesn't emit a standalone line
    groups.delete(contraId);
  }

  // ── Step 3: build GeneratedFSRow list for a given section ─────────────────
  const getSection = (section: FSSection): GeneratedFSRow[] =>
    FS_LINE_DEFS
      .filter(d => d.section === section)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .flatMap(d => {
        const g = groups.get(d.id);
        if (!g || g.cy === 0) return [];
        return [{
          label:      d.labelAr,
          labelAr:    d.labelAr,
          labelEn:    d.labelEn,
          fsLineId:   d.id,
          cy:         g.cy,
          py:         g.py,
          indent:     1,
          tbAccounts: g.accounts,
          grossCy:    g.grossCy,
          contraCy:   g.contraCy,
          // Names of the contra accounts netted off this line (audit trail)
          contraAccounts: g.accounts.filter(a => a.startsWith("(مقابلة)")),
        } satisfies GeneratedFSRow];
      });

  const currentAssets        = getSection("currentAssets");
  const nonCurrentAssets     = getSection("nonCurrentAssets");
  const currentLiabilities   = getSection("currentLiabilities");
  const nonCurrentLiabilities= getSection("nonCurrentLiabilities");
  const equityRows           = getSection("equity");
  const revenueRows          = getSection("revenue");
  const expenseRows          = getSection("expense");

  const sum = (rows: GeneratedFSRow[]) => rows.reduce((s, r) => s + r.cy, 0);
  const totalRevenue          = sum(revenueRows);
  const totalExpenses         = sum(expenseRows);
  const netProfit             = totalRevenue - totalExpenses;
  const hasProfitForYear      = equityRows.some(row => row.fsLineId === "profit-year");
  if (!hasProfitForYear && netProfit !== 0) {
    equityRows.push({
      label: "أرباح العام",
      labelAr: "أرباح العام",
      labelEn: "Profit for the Year",
      fsLineId: "profit-year",
      cy: netProfit,
      py: 0,
      indent: 1,
      isSubtotal: false,
      tbAccounts: ["صافي الربح المحسوب من قائمة الدخل"],
    });
  }
  const totalCurrentAssetsBeforeBalance = sum(currentAssets);
  const totalNonCurrentAssetsBeforeBalance = sum(nonCurrentAssets);
  const totalLiabilitiesBeforeBalance = sum(currentLiabilities) + sum(nonCurrentLiabilities);
  const totalEquityBeforeBalance = sum(equityRows);
  const balanceDifference = totalCurrentAssetsBeforeBalance + totalNonCurrentAssetsBeforeBalance
    - totalLiabilitiesBeforeBalance - totalEquityBeforeBalance;
  if (Math.abs(balanceDifference) > 0.01) {
    equityRows.push({
      label: "فرق ميزان المراجعة تحت التسوية",
      labelAr: "فرق ميزان المراجعة تحت التسوية",
      labelEn: "Trial Balance Suspense Difference",
      fsLineId: "retained",
      cy: balanceDifference,
      py: 0,
      indent: 1,
      tbAccounts: ["فرق التوازن المحسوب من أرصدة الميزان"],
    });
  }
  const totalCurrentAssets    = sum(currentAssets);
  const totalNonCurrentAssets = sum(nonCurrentAssets);
  const totalAssets           = totalCurrentAssets + totalNonCurrentAssets;
  const totalCurrentLiab      = sum(currentLiabilities);
  const totalNonCurrentLiab   = sum(nonCurrentLiabilities);
  const totalLiabilities      = totalCurrentLiab + totalNonCurrentLiab;
  const totalEquity           = sum(equityRows);

  // ── DEBUG: Log final FS summary ───────────────────────────────────────────
  console.log("[generateFSFromTB] FINAL GENERATED FS TOTALS", {
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalCurrentLiab,
    totalNonCurrentLiab,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netProfit,
    balanceSheetCheck: `Assets(${totalAssets}) = Liab(${totalLiabilities}) + Equity(${totalEquity})? ${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 ? '✓ OK' : '✗ MISMATCH'}`,
  });

  console.log("[generateFSFromTB] Income Statement Details", {
    revenueLines: revenueRows.map(r => ({ label: r.label, cy: r.cy })),
    expenseLines: expenseRows.map(r => ({ label: r.label, cy: r.cy })),
  });

  return {
    generatedAt: new Date().toISOString(),
    clientId,
    balanceSheet: { currentAssets, nonCurrentAssets, currentLiabilities, nonCurrentLiabilities, equity: equityRows },
    incomeStatement: { revenue: revenueRows, expenses: expenseRows },
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netProfit,
  };
}

// ─── Auto Materiality (ISA 320) ──────────────────────────────────────────────
// Automatically derives an ISA 320-compliant materiality assessment straight
// from the uploaded Trial Balance — no manual entry required. Re-runs every
// time a new TB (or FS) is uploaded for the client.

export interface AutoMaterialityResult {
  state: MaterialityState;
  basisLabel: string;
  basisLabelAr: string;
}

export function computeAutoMateriality(tb: TBRow[]): AutoMaterialityResult | null {
  if (!tb || tb.length === 0) return null;
  const sum = (pred: (r: TBRow) => boolean) =>
    tb.filter(pred).reduce((s, r) => s + Math.abs(Number(r.cy) || 0), 0);

  const revenue = sum((r) => r.category === "Revenue");
  const expenses = sum((r) => r.category === "Expense");
  const assets = sum((r) => r.category === "Asset");
  const equity = sum((r) => r.category === "Equity");
  const pbt = revenue - expenses;

  let benchmark: MaterialityState["benchmark"] = "Revenue";
  let benchmarkValue = revenue;
  let overallPercentage = 1.0;
  let basisLabel = "Total Revenue";
  let basisLabelAr = "إجمالي الإيرادات";

  if (pbt > 0 && revenue > 0 && pbt / revenue >= 0.02) {
    // Stable profit-making entity → PBT is the most reliable benchmark (ISA 320.A3)
    benchmark = "ProfitBeforeTax";
    benchmarkValue = pbt;
    overallPercentage = 5.0;
    basisLabel = "Profit Before Tax";
    basisLabelAr = "صافي الربح قبل الضريبة";
  } else if (revenue <= 0 && assets > 0) {
    benchmark = "TotalAssets";
    benchmarkValue = assets;
    overallPercentage = 1.0;
    basisLabel = "Total Assets";
    basisLabelAr = "إجمالي الأصول";
  } else if (revenue <= 0 && equity > 0) {
    benchmark = "TotalEquity";
    benchmarkValue = equity;
    overallPercentage = 2.0;
    basisLabel = "Total Equity";
    basisLabelAr = "إجمالي حقوق الملكية";
  }

  if (benchmarkValue <= 0) return null;

  const state: MaterialityState = {
    benchmark,
    customValue: Math.round(benchmarkValue),
    overallPercentage,
    performancePercentage: 75.0,
    trivialPercentage: 5.0,
  };

  return { state, basisLabel, basisLabelAr };
}

// ─── Auto Risk Register (ISA 315 / 330) ──────────────────────────────────────
// Automatically flags material year-over-year fluctuations and structural
// financial-health warning signs directly from the uploaded TB — no manual
// entry required. IDs are prefixed "auto-risk-" so the UI can distinguish and
// safely replace them on every new TB upload while preserving manually added risks.

export const AUTO_RISK_PREFIX = "auto-risk-";

export function computeAutoRisks(tb: TBRow[]): RiskItem[] {
  if (!tb || tb.length === 0) return [];
  const risks: RiskItem[] = [];
  const materialityRef = tb.reduce((s, r) => s + Math.abs(Number(r.cy) || 0), 0) * 0.01 || 10000;

  tb.forEach((r, idx) => {
    const py = Math.abs(Number(r.py) || 0);
    const cy = Math.abs(Number(r.cy) || 0);
    if (cy < materialityRef * 0.5 && py < materialityRef * 0.5) return; // too small to matter

    const variance = py > 0 ? Math.abs(cy - py) / py : (cy > 0 ? 1 : 0);
    if (variance >= 0.4) {
      const isRevenueOrExpense = r.category === "Revenue" || r.category === "Expense";
      const pctStr = `${(variance * 100).toFixed(0)}%`;
      risks.push({
        id: `${AUTO_RISK_PREFIX}${r.code || idx}`,
        description: `Significant ${pctStr} year-over-year fluctuation in "${r.name}" balance ($${py.toLocaleString()} → $${cy.toLocaleString()})`,
        descriptionAr: `تقلب جوهري نسبته ${pctStr} سنة على سنة في رصيد "${r.name}" (${py.toLocaleString()} → ${cy.toLocaleString()} ج.م)`,
        assertion: isRevenueOrExpense ? "Occurrence & Accuracy" : "Valuation & Existence",
        likelihood: variance >= 1 ? 4 : 3,
        impact: cy >= materialityRef * 3 ? 5 : cy >= materialityRef ? 4 : 3,
        inherentRisk: variance >= 1 ? "High" : "Medium",
        controlRisk: "Medium",
        detectionRisk: "Medium",
        plannedResponse: `Perform substantive analytical procedures on "${r.name}"; obtain management explanation for the movement and vouch a sample of supporting transactions to source documents (ISA 520/330).`,
        plannedResponseAr: `إجراء إجراءات تحليلية جوهرية على "${r.name}"؛ الحصول على تفسير الإدارة للحركة والتحقق من عينة معاملات داعمة بالرجوع إلى المستندات الأصلية (ISA 520/330).`,
        controlDescription: "Auto-flagged by Sami AI Copilot from Trial Balance variance analysis (ISA 315).",
        controlDescriptionAr: "تم رصده تلقائياً بواسطة سامي AI من تحليل تباين ميزان المراجعة (ISA 315).",
        assignedAuditors: ["Sami AI Copilot"],
        trend: cy > py ? "up" : cy < py ? "down" : "stable",
        comments: [],
      });
    }
  });

  const totalEquity = tb.filter((r) => r.category === "Equity").reduce((s, r) => s + (Number(r.cy) || 0), 0);
  if (totalEquity < 0) {
    risks.push({
      id: `${AUTO_RISK_PREFIX}neg-equity`,
      description: "Total Equity is negative, indicating a potential going concern risk requiring auditor evaluation under ISA 570",
      descriptionAr: "إجمالي حقوق الملكية سالب، مما يشير إلى خطر محتمل على الاستمرارية يستوجب تقييم المراجع وفق ISA 570",
      assertion: "Going Concern",
      likelihood: 4,
      impact: 5,
      inherentRisk: "High",
      controlRisk: "Medium",
      detectionRisk: "Low",
      plannedResponse: "Evaluate management's going concern assessment, review cash flow forecasts, and consider the need for an Emphasis of Matter or Material Uncertainty paragraph.",
      plannedResponseAr: "تقييم تقدير الإدارة للاستمرارية، ومراجعة توقعات التدفق النقدي، والنظر في الحاجة لفقرة تأكيد على أمر أو شك جوهري.",
      controlDescription: "Auto-flagged by Sami AI Copilot from Trial Balance analysis (ISA 570).",
      controlDescriptionAr: "تم رصده تلقائياً بواسطة سامي AI من تحليل ميزان المراجعة (ISA 570).",
      assignedAuditors: ["Sami AI Copilot"],
      trend: "down",
      comments: [],
    });
  }

  return risks.slice(0, 15);
}

// ─── Auto Findings / Observations ────────────────────────────────────────────

export interface Finding {
  id: string;
  clientId: string;
  title: string;
  titleAr: string;
  severity: "High" | "Medium" | "Low";
  area: string;
  description: string;
  descriptionAr: string;
  autoGenerated: boolean;
  status: "Open" | "Resolved";
  createdAt: string;
}

export const AUTO_FINDING_PREFIX = "auto-finding-";
export const FINDINGS_STORAGE_KEY = "dabour:findings";
export const FINDINGS_EVENT = "dabour:findings-updated";

function loadFindingsAll(): Record<string, Finding[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FINDINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getFindings(clientId: string): Finding[] {
  return loadFindingsAll()[clientId] || [];
}

export function saveFindings(clientId: string, findings: Finding[]) {
  if (typeof window === "undefined") return;
  try {
    const map = loadFindingsAll();
    map[clientId] = findings;
    localStorage.setItem(FINDINGS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(FINDINGS_EVENT, { detail: { clientId } }));
  } catch {}
}

export function useFindings(clientId: string): [Finding[], (f: Finding[]) => void] {
  const [findings, setFindingsState] = useState<Finding[]>(() => getFindings(clientId));
  useEffect(() => {
    setFindingsState(getFindings(clientId));
    const refresh = () => setFindingsState(getFindings(clientId));
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ clientId?: string }>).detail;
      if (!detail?.clientId || detail.clientId === clientId) refresh();
    };
    window.addEventListener(FINDINGS_EVENT, onEvent);
    return () => window.removeEventListener(FINDINGS_EVENT, onEvent);
  }, [clientId]);

  const setFindings = (f: Finding[]) => saveFindings(clientId, f);
  return [findings, setFindings];
}

// Auto-generates findings from the TB + generated FS. Merges with any manually
// added findings already saved for the client (auto findings are re-derived and
// replaced on every TB/FS upload; manual findings are always preserved).
export function generateFindingsFromTB(clientId: string, tb: TBRow[], fs: GeneratedFS | null): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();

  if (tb.some((r) => r.debit !== undefined || r.credit !== undefined)) {
    const totalDebit = tb.reduce((s, r) => s + (Number(r.debit) || 0), 0);
    const totalCredit = tb.reduce((s, r) => s + (Number(r.credit) || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > Math.max(totalDebit, totalCredit) * 0.001 && (totalDebit || totalCredit)) {
      findings.push({
        id: `${AUTO_FINDING_PREFIX}tb-imbalance`,
        clientId, autoGenerated: true, status: "Open", createdAt: now,
        severity: "High", area: "Trial Balance",
        title: "Trial Balance does not balance",
        titleAr: "ميزان المراجعة غير متوازن",
        description: `Total Debits ($${totalDebit.toLocaleString()}) do not equal Total Credits ($${totalCredit.toLocaleString()}). A difference of $${Math.abs(totalDebit - totalCredit).toLocaleString()} was detected — investigate before proceeding with substantive testing.`,
        descriptionAr: `إجمالي المدين ($${totalDebit.toLocaleString()}) لا يساوي إجمالي الدائن ($${totalCredit.toLocaleString()})، بفارق قدره $${Math.abs(totalDebit - totalCredit).toLocaleString()}. يجب مراجعة السبب قبل استكمال إجراءات الفحص.`,
      });
    }
  }

  if (fs && fs.totalEquity < 0) {
    findings.push({
      id: `${AUTO_FINDING_PREFIX}neg-equity`,
      clientId, autoGenerated: true, status: "Open", createdAt: now,
      severity: "High", area: "Going Concern",
      title: "Negative total equity — going concern indicator",
      titleAr: "حقوق ملكية سالبة — مؤشر على استمرارية المنشأة",
      description: `Total Equity of $${fs.totalEquity.toLocaleString()} is negative. This is a key indicator under ISA 570 and should be evaluated together with management's going concern assessment.`,
      descriptionAr: `إجمالي حقوق الملكية ($${fs.totalEquity.toLocaleString()}) سالب، وهو مؤشر رئيسي بموجب معيار المراجعة الدولي ٥٧٠ يستوجب تقييم افتراض الاستمرارية.`,
    });
  }

  if (fs) {
    const currentAssets = fs.balanceSheet.currentAssets.reduce((s, r) => s + r.cy, 0);
    const currentLiab = fs.balanceSheet.currentLiabilities.reduce((s, r) => s + r.cy, 0);
    if (currentLiab > 0 && currentAssets / currentLiab < 1) {
      findings.push({
        id: `${AUTO_FINDING_PREFIX}liquidity`,
        clientId, autoGenerated: true, status: "Open", createdAt: now,
        severity: "Medium", area: "Liquidity",
        title: "Current ratio below 1.0",
        titleAr: "نسبة التداول أقل من ١",
        description: `Current Assets ($${currentAssets.toLocaleString()}) are lower than Current Liabilities ($${currentLiab.toLocaleString()}), a current ratio of ${(currentAssets / currentLiab).toFixed(2)}. This may signal short-term liquidity pressure worth investigating.`,
        descriptionAr: `الأصول المتداولة ($${currentAssets.toLocaleString()}) أقل من الالتزامات المتداولة ($${currentLiab.toLocaleString()})، بنسبة تداول ${(currentAssets / currentLiab).toFixed(2)}. قد يشير هذا لضغط في السيولة قصيرة الأجل.`,
      });
    }
  }

  const autoRisks = computeAutoRisks(tb).filter((r) => r.inherentRisk === "High" && !r.id.includes("neg-equity"));
  autoRisks.slice(0, 5).forEach((r) => {
    findings.push({
      id: `${AUTO_FINDING_PREFIX}${r.id}`,
      clientId, autoGenerated: true, status: "Open", createdAt: now,
      severity: "Medium", area: "Analytical Review",
      title: r.description.split("$")[0].trim(),
      titleAr: "تذبذب جوهري في رصيد حساب يستوجب توضيحاً",
      description: `${r.description}. ${r.plannedResponse}`,
      descriptionAr: `تم رصد ${r.description}. يوصى بإجراء إجراءات تحليلية إضافية والحصول على تبرير الإدارة.`,
    });
  });

  return findings;
}

// Merges freshly auto-generated findings with previously saved findings for a
// client, replacing stale auto-generated entries while preserving manual ones.
export function refreshAutoFindings(clientId: string, tb: TBRow[], fs: GeneratedFS | null): Finding[] {
  const existing = getFindings(clientId);
  const manual = existing.filter((f) => !f.autoGenerated);
  const freshAuto = generateFindingsFromTB(clientId, tb, fs);
  const merged = [...freshAuto, ...manual];
  saveFindings(clientId, merged);
  return merged;
}
