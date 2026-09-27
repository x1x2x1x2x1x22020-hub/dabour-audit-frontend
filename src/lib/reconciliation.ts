import { FS_LINE_DEFS, type GeneratedFS, type CompanyFSRow } from "./audit-bus";

// ─── General Trial-Balance ⇄ Financial-Statements Reconciliation ─────────────
// The old compare logic matched a TB line to an FS line purely by account-name
// similarity, which produced false "in Trial Balance only" findings when the TB
// line was actually:
//   1) merged inside a summary / aggregate FS line,
//   2) part of a net line whose contra account was removed,
//   3) a contra account (مجمع الإهلاك / مخصص) that reduces its parent net,
//   4) the result of a calculation (gross - contra = net),
//   5) a different name/synonym for the same economic item, or
//   6) at a different level of detail than the FS line.
//
// So before the engine marks a TB line as "in TB only" it runs an ordered probe
// chain. Each successful probe records WHY the line is explainable and WHICH
// accounts/values were used (an audit trail). Lines that are only *possibly*
// explainable are classified "needs review" rather than guessed.
//
// Nothing here is a hardcoded patch for the accumulated-depreciation case:
// every relationship derives from the same FS_LINE_DEFS the app already uses to
// generate FS, so new contra/net relationships are picked up automatically.
// ─────────────────────────────────────────────────────────────────────────────

export type ReconTbEntry = {
  label: string;
  cy: number;
  section: string;
  isAggregate: boolean;
};

export type ReconStatus = "matched" | "needs-review" | "unmatched";

export type ReconProbe =
  | "synonym"
  | "contained"
  | "netline"
  | "contra"
  | "calculation"
  | "level-diff"
  | "none";

export interface ReconTrace {
  reason_en: string;
  reason_ar: string;
  lineId: string | null;
  targetLabel: string;
  accountsUsed: string[];
  tbValue: number;
  targetValue?: number;
  difference?: number;
  probe: ReconProbe;
}

export interface ReconEntryResult {
  entry: ReconTbEntry;
  status: ReconStatus;
  trace: ReconTrace;
}

export interface ReconOutcome {
  matched: ReconEntryResult[];
  needsReview: ReconEntryResult[];
  unmatched: ReconEntryResult[];
  entries: ReconEntryResult[];
}

export interface ReconOptions {
  /** numeric tolerance for a calculation/sum (e.g. 0.1 = 10%) */
  tolerancePct?: number;
}

// ─── Normalisation & lexical helpers (mirror the app's canonical ones) ──────

export function normalizeAr(s: string): string {
  return s
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "")
    .trim();
}

export function isTotalLabel(label: string): boolean {
  const n = normalizeAr(label);
  return (
    /^(اجمالي|مجموع|صافي|net|total|grand)/i.test(n) ||
    /(اجمالي|مجموع|total|grand)/i.test(n.slice(0, 16))
  );
}

/** Dice bigram similarity (0..1). */
function similarity(a: string, b: string): number {
  const na = normalizeAr(a);
  const nb = normalizeAr(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    const shorter = Math.min(na.length, nb.length);
    const longer = Math.max(na.length, nb.length);
    return 0.5 + 0.45 * (shorter / longer);
  }
  const bigrams = (s: string): Set<string> => {
    const out = new Set<string>();
    for (let i = 0; i < s.length; i++) out.add(s.slice(i, i + 2));
    return out;
  };
  const ba = bigrams(na);
  const bb = bigrams(nb);
  if (!ba.size || !bb.size) return 0;
  let shared = 0;
  ba.forEach((g) => { if (bb.has(g)) shared++; });
  return (2 * shared) / (ba.size + bb.size);
}

function semanticScore(a: string, b: string): number {
  const sa = normalizeAr(a);
  const sb = normalizeAr(b);
  if (!sa || !sb) return 0;
  const pairs: Array<[RegExp, RegExp]> = [
    [/نقد|كاش|بنك|صندوق|cash|bank/, /نقد|كاش|بنك|صندوق|cash|bank/],
    [/ذمم|مدين|عميل|debt|receivable|debtor/, /ذمم|مدين|عميل|debt|receivable|debtor/],
    [/مورد|دائن|payable|creditor|supplier/, /مورد|دائن|payable|creditor|supplier/],
    [/مخزون|بضاعه|stock|inventory|goods/, /مخزون|بضاعه|stock|inventory|goods/],
    [/ثابت|عقار|مبني|ارض|معد|معدات|سياره|property|plant|equipment|ppe|asset/, /ثابت|عقار|مبني|ارض|معد|معدات|سياره|property|plant|equipment|ppe|asset/],
    [/مجمع.*اهلاك|مجمع.*استهلاك|مجمعهبوط|accumulateddep|accumdep|depreciation/, /مجمع.*اهلاك|مجمع.*استهلاك|مجمعهبوط|accumulateddep|accumdep|depreciation/],
    [/مخصص.*ديون|مخصص.*مخزون|allowance|provision|baddeb|impairment/, /مخصص|allowance|provision|baddebt|impairment/],
    [/ايراد|مبيعات|دخل|revenue|sales|income|turnover/, /ايراد|مبيعات|دخل|revenue|sales|income|turnover/],
    [/مصروف|تكلفه|رواتب|اجور|expense|cost|salary|wage|payroll/, /مصروف|تكلفه|رواتب|اجور|expense|cost|salary|wage|payroll/],
    [/حقوق|راس|المال|retained|equity|reserve/, /حقوق|راس|المال|retained|equity|reserve/],
  ];
  for (const [ra, rb] of pairs) {
    if (ra.test(sa) && rb.test(sb)) return 0.96;
  }
  return 0;
}

// ─── FS_LINE_DEFS bucket resolution ──────────────────────────────────────────

export interface BucketResolved {
  id: string | null;
  parentId: string | null;
  isContra: boolean;
}

export function resolveBucket(label: string): BucketResolved {
  const n = normalizeAr(label);
  if (/ضريب(ه|ة)?القيم(ه|ة)المضافه|vat/.test(n)) {
    return { id: "vat-pay", parentId: null, isContra: false };
  }
  if (/ضريب(ه|ة)?كسبالعمل|payrolltax/.test(n)) {
    return { id: "payroll-tax", parentId: null, isContra: false };
  }
  if (/ضريب(ه|ة)?الخصموالاضافه|withholdingtax/.test(n)) {
    return { id: "withholding-pay", parentId: null, isContra: false };
  }
  if (/التزاماتضريبيه?مؤجله|ضريبهمؤجله|deferredtaxliabilit/.test(n)) {
    return { id: "other-ncl", parentId: null, isContra: false };
  }
  if (/عملاءدفعاتمقدمه|دفعهمقدمهمنعملاء|customeradvance/.test(n)) {
    return { id: "cust-adv", parentId: null, isContra: false };
  }
  for (const def of FS_LINE_DEFS) {
    if (def.pattern.test(n)) {
      return {
        id: def.contraFor ?? def.id,
        parentId: def.contraFor ?? null,
        isContra: !!def.contraFor,
      };
    }
  }
  return { id: null, parentId: null, isContra: false };
}

// ─── Company FS normalised groups ────────────────────────────────────────────
// Each company FS row is reduced to its accounting bucket + net value. Contra
// items are signed negative so they reduce their parent when summed.

interface CompanyGroup {
  bucket: string | null;
  label: string;
  value: number;
  isTotal: boolean;
  allLabels: string[];
}

function buildCompanyGroups(rows: CompanyFSRow[]): CompanyGroup[] {
  const map = new Map<string, CompanyGroup>();
  for (const r of rows) {
    const rb = resolveBucket(r.label);
    const definition = rb.id ? FS_LINE_DEFS.find((def) => def.id === rb.id) : undefined;
    const section = r.section.toLowerCase();
    const isBalanceSheetRow = /المركز|balance|financial position/.test(section);
    const isIncomeStatementRow = /الدخل|income|profit|loss/.test(section);
    if (definition && definition.section !== "revenue" && definition.section !== "expense" && isIncomeStatementRow) continue;
    if (definition && (definition.section === "revenue" || definition.section === "expense") && isBalanceSheetRow) continue;
    const key = rb.id ?? normalizeAr(r.label);
    const signedValue = rb.isContra ? -Math.abs(r.value || 0) : (r.value || 0);
    const existing = map.get(key);
    if (existing) {
      existing.value += signedValue;
      if (!existing.allLabels.includes(r.label)) existing.allLabels.push(r.label);
      if (isTotalLabel(r.label)) existing.isTotal = true;
    } else {
      map.set(key, {
        bucket: rb.id,
        label: r.label,
        value: signedValue,
        isTotal: isTotalLabel(r.label),
        allLabels: [r.label],
      });
    }
  }
  return [...map.values()];
}

// ─── Probe chain (ordered explanation probes with audit trail) ───────────────

const MARGIN = 0.05; // 5% numeric reconciliation tolerance by default

function valuesClose(a: number, b: number, tolerance: number): boolean {
  if (a === b) return true;
  const base = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / base <= Math.max(tolerance, MARGIN);
}

interface ProbeCtx {
  tbDetails: ReconTbEntry[];
  tbAggregates: ReconTbEntry[];
  generatedFS: GeneratedFS | null;
  companyGroups: CompanyGroup[];
  companyByBucket: Map<string, CompanyGroup>;
  companyLabels: string[];
  tolerance: number;
}

function classifyEntry(entry: ReconTbEntry, ctx: ProbeCtx): ReconEntryResult {
  const bucket = resolveBucket(entry.label);
  const ownGroup = bucket.id ? ctx.companyByBucket.get(bucket.id) : undefined;
  const parentGroup = bucket.parentId ? ctx.companyByBucket.get(bucket.parentId) : undefined;

  // Probe 0 — Synonym: same economic item under a different name.
  if (!entry.isAggregate) {
    let bestScore = 0;
    let bestLabel: string | null = null;
    for (const cl of ctx.companyLabels) {
      const s = Math.max(similarity(entry.label, cl), semanticScore(entry.label, cl));
      if (s > bestScore) { bestScore = s; bestLabel = cl; }
    }
    if (bestLabel && bestScore >= 0.62) {
      const cg = ctx.companyGroups.find((g) => g.allLabels.includes(bestLabel!));
      const target = cg?.value ?? undefined;
      const lineId = resolveBucket(bestLabel).id ?? bucket.id;
      return {
        entry, status: "matched",
        trace: {
          probe: "synonym",
          reason_en: `Synonym / alternate name of "${bestLabel}" in the client FS`,
          reason_ar: `مرادف / اسم بديل لـ "${bestLabel}" في القوائم المالية`,
          lineId, targetLabel: bestLabel,
          accountsUsed: [entry.label, bestLabel],
          tbValue: entry.cy, targetValue: target,
          difference: target !== undefined ? target - entry.cy : undefined,
        },
      };
    }
  }

  // Probe 1: contra account — the parent NET line exists in the client FS.
  if (bucket.parentId && parentGroup) {
    return {
      entry, status: "matched",
      trace: {
        probe: "netline",
        reason_en: `Contra account netted off "${parentGroup.label}" (parent net line present)`,
        reason_ar: `حساب مقابل تتم تسويته من "${parentGroup.label}" (بند الصافي موجود)`,
        lineId: bucket.parentId, targetLabel: parentGroup.label,
        accountsUsed: [entry.label, parentGroup.label],
        tbValue: entry.cy, targetValue: parentGroup.value,
        difference: parentGroup.value - entry.cy,
      },
    };
  }

  // Probe 2: allowance/contra reduces a matched parent (e.g. receivables − allowance).
  if (bucket.isContra && parentGroup) {
    return {
      entry, status: "matched",
      trace: {
        probe: "contra",
        reason_en: `Allowance reduces net "${parentGroup.label}"`,
        reason_ar: `المخصص يُخصم من صافي "${parentGroup.label}"`,
        lineId: bucket.parentId, targetLabel: parentGroup.label,
        accountsUsed: [entry.label, parentGroup.label],
        tbValue: entry.cy, targetValue: parentGroup.value,
        difference: parentGroup.value - entry.cy,
      },
    };
  }

  // Probe 3: the TB line is a detail inside an aggregate/summary FS line.
  if (ownGroup) {
    const close = valuesClose(ownGroup.value, entry.cy, ctx.tolerance);
    return {
      entry, status: close ? "matched" : "needs-review",
      trace: {
        probe: "contained",
        reason_en: close
          ? `Inside summary item "${ownGroup.label}" (value reconciles)`
          : `Inside summary item "${ownGroup.label}" (value differs — review)`,
        reason_ar: close
          ? `مضمّن داخل البند التجميعي "${ownGroup.label}" (القيمة مطابقة)`
          : `مضمّن داخل البند التجميعي "${ownGroup.label}" (اختلاف في القيمة — يحتاج مراجعة)`,
        lineId: bucket.id, targetLabel: ownGroup.label,
        accountsUsed: [entry.label, ownGroup.label],
        tbValue: entry.cy, targetValue: ownGroup.value,
        difference: ownGroup.value - entry.cy,
      },
    };
  }

  // Probe 4: a calculation reconciles the line — gross − contra = net.
  const keyId = bucket.parentId ?? bucket.id;
  if (keyId) {
    const tbInBucket = ctx.tbDetails.filter((t) => {
      const rb = resolveBucket(t.label);
      return (rb.id ?? rb.parentId) === keyId;
    });
    const contraAccts = ctx.tbDetails.filter((t) => resolveBucket(t.label).parentId === keyId);
    const netTarget = ctx.companyByBucket.get(keyId);
    const multiLine = tbInBucket.length > 1 || contraAccts.length > 0 || ctx.tbAggregates.length > 0;
    if (multiLine && netTarget) {
      const gross = tbInBucket.reduce((s, t) => s + Math.abs(t.cy || 0), 0);
      const totalContra = contraAccts.reduce((s, t) => s + Math.abs(t.cy || 0), 0);
      const net = Math.max(0, gross - totalContra);
      const close = valuesClose(net, netTarget.value, ctx.tolerance);
      const eq = contraAccts.length || tbInBucket.length > 1;
      return {
        entry, status: close ? "matched" : "needs-review",
        trace: {
          probe: "calculation",
          reason_en: `${netTarget.label}: ${gross}${contraAccts.length ? ` − ${totalContra}` : ""} = ${net} ${close ? "≈" : "≠"} ${netTarget.value} [${eq ? "computed net" : "aggregate"}]`,
          reason_ar: `${netTarget.label}: ${gross}${contraAccts.length ? ` − ${totalContra}` : ""} = ${net} ${close ? "≈" : "≠"} ${netTarget.value}`,
          lineId: keyId, targetLabel: netTarget.label,
          accountsUsed: [entry.label, ...tbInBucket.map((t) => t.label), ...contraAccts.map((c) => c.label)],
          tbValue: entry.cy, targetValue: netTarget.value,
          difference: netTarget.value - entry.cy,
        },
      };
    }
  }

  // Probe 5: the parent net line exists, but the exact mapping is uncertain.
  if (parentGroup) {
    return {
      entry, status: "needs-review",
      trace: {
        probe: "level-diff",
        reason_en: `"${parentGroup.label}" exists in the client FS; exact TB→FS mapping uncertain`,
        reason_ar: `بند "${parentGroup.label}" موجود بقوائم العميل؛ لكن التطابق الدقيق ميزان→قوائم غير مؤكد`,
        lineId: bucket.parentId, targetLabel: parentGroup.label,
        accountsUsed: [entry.label, parentGroup.label],
        tbValue: entry.cy, targetValue: parentGroup.value,
        difference: parentGroup.value - entry.cy,
      },
    };
  }

  // Probe 6: nothing explains it — genuinely "in Trial Balance only".
  return {
    entry, status: "unmatched",
    trace: {
      probe: "none",
      reason_en: "No summary bucket, net-line, contra, calculation or synonym explains this line in the client FS",
      reason_ar: "لا يوجد بند تجميعي أو علاقة صافٍ/احتياطي أو عملية حسابية تبرّر وجود هذا الحساب في الميزان دون القوائم المالية",
      lineId: null, targetLabel: "",
      accountsUsed: [entry.label],
      tbValue: entry.cy,
    },
  };
}

/**
 * Reconcile trial-balance entries against client-provided financial statements.
 * Returns three pools plus a per-line audit trace (reason, accounts used,
 * target value and difference) so the auditor can verify every resolution.
 */
export function compareTrialBalanceWithFinancialStatements(
  tbDetails: ReconTbEntry[],
  tbAggregates: ReconTbEntry[],
  generatedFS: GeneratedFS | null,
  companyRows: CompanyFSRow[],
  options: ReconOptions = {},
): ReconOutcome {
  const tolerance = options.tolerancePct ?? MARGIN;
  const groups = buildCompanyGroups(companyRows);
  const companyByBucket = new Map<string, CompanyGroup>();
  for (const g of groups) {
    if (g.bucket) companyByBucket.set(g.bucket, g);
  }
  const companyLabels = companyRows.map((r) => r.label);

  const ctx: ProbeCtx = {
    tbDetails, tbAggregates, generatedFS,
    companyGroups: groups, companyByBucket, companyLabels, tolerance,
  };

  const entries: ReconEntryResult[] = [...tbDetails, ...tbAggregates].map((e) => classifyEntry(e, ctx));
  return {
    matched: entries.filter((r) => r.status === "matched"),
    needsReview: entries.filter((r) => r.status === "needs-review"),
    unmatched: entries.filter((r) => r.status === "unmatched"),
    entries,
  };
}