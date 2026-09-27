import { useMemo, useState } from "react";
import {
  X,
  Sigma,
  Copy as CopyIcon,
  Hash,
  Shuffle,
  Layers,
  AlertTriangle,
  BarChart3,
  Sparkles,
  TrendingUp,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

type Lang = "EN" | "AR";

interface Props {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}

type ToolKey =
  | "benford"
  | "duplicates"
  | "gaps"
  | "mus"
  | "random"
  | "stratify"
  | "weekend"
  | "roundnum";

const T = (lang: Lang, en: string, ar: string) => (lang === "AR" ? ar : en);

// ---------- helpers ----------
function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,;\n\r\t]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s.replace(/[^0-9.\-]/g, "")))
    .filter((n) => !Number.isNaN(n));
}

function parseRows(input: string): { ref: string; amount: number; date?: string; account?: string }[] {
  // Accept CSV-ish: ref,amount[,date][,account] OR just one number per line
  const out: { ref: string; amount: number; date?: string; account?: string }[] = [];
  input.split(/\r?\n/).forEach((line, idx) => {
    const t = line.trim();
    if (!t) return;
    const parts = t.split(/[\t,;|]/).map((x) => x.trim());
    if (parts.length === 1) {
      const n = Number(parts[0].replace(/[^0-9.\-]/g, ""));
      if (!Number.isNaN(n)) out.push({ ref: String(idx + 1), amount: n });
    } else {
      const amt = Number((parts[1] || "").replace(/[^0-9.\-]/g, ""));
      if (!Number.isNaN(amt))
        out.push({ ref: parts[0] || String(idx + 1), amount: amt, date: parts[2], account: parts[3] });
    }
  });
  return out;
}

// Benford expected % for leading digit 1..9
const BENFORD_EXPECTED = Array.from({ length: 9 }, (_, i) =>
  Math.log10(1 + 1 / (i + 1)) * 100
);

function firstDigit(n: number): number | null {
  const a = Math.abs(n);
  if (!isFinite(a) || a === 0) return null;
  const s = a.toExponential().split("e")[0].replace(".", "").replace(/^0+/, "");
  const d = parseInt(s[0] || "", 10);
  return d >= 1 && d <= 9 ? d : null;
}

function benford(nums: number[]) {
  const counts = Array(9).fill(0);
  let total = 0;
  nums.forEach((n) => {
    const d = firstDigit(n);
    if (d) {
      counts[d - 1]++;
      total++;
    }
  });
  const data = counts.map((c, i) => {
    const observed = total ? (c / total) * 100 : 0;
    const expected = BENFORD_EXPECTED[i];
    return {
      digit: String(i + 1),
      observed: Number(observed.toFixed(2)),
      expected: Number(expected.toFixed(2)),
      diff: Number((observed - expected).toFixed(2)),
      count: c,
    };
  });
  // chi-square goodness of fit
  let chi = 0;
  data.forEach((d) => {
    const exp = (d.expected / 100) * total;
    if (exp > 0) chi += Math.pow(d.count - exp, 2) / exp;
  });
  return { data, total, chi: Number(chi.toFixed(2)) };
}

function findDuplicates(rows: { ref: string; amount: number; account?: string; date?: string }[]) {
  const map = new Map<string, typeof rows>();
  rows.forEach((r) => {
    const key = `${r.amount.toFixed(2)}|${r.account || ""}|${r.date || ""}`;
    const arr = map.get(key) || [];
    arr.push(r);
    map.set(key, arr);
  });
  return Array.from(map.values()).filter((g) => g.length > 1);
}

function findGaps(refs: string[]) {
  const nums = refs.map((r) => Number(r.replace(/[^0-9]/g, ""))).filter((n) => !Number.isNaN(n));
  if (!nums.length) return [];
  const sorted = Array.from(new Set(nums)).sort((a, b) => a - b);
  const gaps: { from: number; to: number; missing: number }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > 1) {
      gaps.push({ from: sorted[i - 1], to: sorted[i], missing: sorted[i] - sorted[i - 1] - 1 });
    }
  }
  return gaps;
}

function musSample(rows: { ref: string; amount: number }[], interval: number, start: number) {
  const cum: { ref: string; amount: number; cum: number }[] = [];
  let total = 0;
  rows.forEach((r) => {
    total += Math.abs(r.amount);
    cum.push({ ...r, cum: total });
  });
  const picks: typeof cum = [];
  let cursor = start;
  while (cursor <= total) {
    const hit = cum.find((c) => c.cum >= cursor);
    if (hit && !picks.find((p) => p.ref === hit.ref)) picks.push(hit);
    cursor += interval;
  }
  return { population: total, sampled: picks };
}

function randomSample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

function stratify(rows: { ref: string; amount: number }[], buckets: number) {
  if (!rows.length) return [];
  const sorted = [...rows].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
  const size = Math.ceil(sorted.length / buckets);
  const out: { range: string; count: number; sum: number }[] = [];
  for (let i = 0; i < buckets; i++) {
    const slice = sorted.slice(i * size, (i + 1) * size);
    if (!slice.length) continue;
    const lo = Math.abs(slice[0].amount);
    const hi = Math.abs(slice[slice.length - 1].amount);
    out.push({
      range: `${lo.toFixed(0)} – ${hi.toFixed(0)}`,
      count: slice.length,
      sum: Number(slice.reduce((s, x) => s + Math.abs(x.amount), 0).toFixed(2)),
    });
  }
  return out;
}

function weekendEntries(rows: { ref: string; amount: number; date?: string }[]) {
  return rows.filter((r) => {
    if (!r.date) return false;
    const d = new Date(r.date);
    if (isNaN(d.getTime())) return false;
    const day = d.getDay(); // 0 Sun, 5 Fri, 6 Sat
    return day === 5 || day === 6 || day === 0;
  });
}

function roundNumbers(rows: { ref: string; amount: number }[]) {
  return rows.filter((r) => {
    const a = Math.abs(r.amount);
    return a >= 1000 && a % 1000 === 0;
  });
}

function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- component ----------
export default function IdeaHaloToolsModal({ open, onClose, lang }: Props) {
  const isRtl = lang === "AR";
  const [tool, setTool] = useState<ToolKey>("benford");
  const [input, setInput] = useState<string>("");
  const [musInterval, setMusInterval] = useState(10000);
  const [musStart, setMusStart] = useState(3000);
  const [randomN, setRandomN] = useState(25);
  const [strataN, setStrataN] = useState(5);

  const rows = useMemo(() => parseRows(input), [input]);
  const nums = useMemo(() => rows.map((r) => r.amount), [rows]);

  if (!open) return null;

  const tools: { key: ToolKey; icon: any; en: string; ar: string; desc_en: string; desc_ar: string }[] = [
    { key: "benford", icon: Sigma, en: "Benford's Law", ar: "قانون بنفورد", desc_en: "Fraud screening on first digits", desc_ar: "فحص احتيال على الأرقام الأولى" },
    { key: "duplicates", icon: CopyIcon, en: "Duplicate Entries", ar: "كشف القيود المكررة", desc_en: "Same amount + account + date", desc_ar: "نفس المبلغ والحساب والتاريخ" },
    { key: "gaps", icon: Hash, en: "Sequence Gaps", ar: "فجوات التسلسل", desc_en: "Missing voucher / invoice numbers", desc_ar: "أرقام مستندات مفقودة" },
    { key: "mus", icon: Layers, en: "MUS Sampling", ar: "عينة وحدة نقدية MUS", desc_en: "Monetary unit sampling", desc_ar: "عينة قائمة على المبلغ" },
    { key: "random", icon: Shuffle, en: "Random Sampling", ar: "عينة عشوائية", desc_en: "Fisher-Yates random pick", desc_ar: "اختيار عشوائي" },
    { key: "stratify", icon: BarChart3, en: "Stratification", ar: "التقسيم الطبقي", desc_en: "Bucket by amount range", desc_ar: "تقسيم حسب نطاق المبالغ" },
    { key: "weekend", icon: AlertTriangle, en: "Weekend / Holiday Entries", ar: "قيود عطلة نهاية الأسبوع", desc_en: "Posted on Fri/Sat/Sun", desc_ar: "قيود في الجمعة/السبت/الأحد" },
    { key: "roundnum", icon: TrendingUp, en: "Round Number Test", ar: "اختبار الأرقام المدوّرة", desc_en: "Amounts ending in 000", desc_ar: "مبالغ منتهية بـ 000" },
  ];

  const sample = `INV-001,12500,2024-03-04,Sales
INV-002,8750.50,2024-03-05,Sales
INV-003,12500,2024-03-04,Sales
INV-004,3200,2024-03-09,Cash
INV-005,15000,2024-03-10,Cash
INV-006,42100.75,2024-03-11,Bank
INV-007,1000,2024-03-16,Petty Cash
INV-008,98000,2024-03-17,Bank
INV-009,500,2024-03-18,Petty Cash
INV-012,7500,2024-03-20,Sales`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-black">
                {T(lang, "Sami & Zaza Tools", "أدوات سامي وظاظا")}
              </h2>
              <p className="text-xs opacity-90">
                {T(lang, "CAATs · Fraud detection · Data analytics", "تقنيات التدقيق بالحاسوب · كشف الاحتيال · تحليل البيانات")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* sidebar */}
          <div className="w-64 border-e border-slate-200 bg-slate-50 overflow-y-auto p-3 space-y-1">
            {tools.map((t) => {
              const Icon = t.icon;
              const active = tool === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTool(t.key)}
                  className={`w-full text-start p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                    active ? "bg-indigo-600 text-white shadow" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? "text-white" : "text-indigo-500"}`} />
                  <div className="min-w-0">
                    <div className="font-bold">{T(lang, t.en, t.ar)}</div>
                    <div className={`text-[10px] mt-0.5 ${active ? "text-white/80" : "text-slate-500"}`}>
                      {T(lang, t.desc_en, t.desc_ar)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* main */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* input */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  {T(lang, "Paste data (ref, amount, date, account) — one row per line", "ألصق البيانات (مرجع، مبلغ، تاريخ، حساب) — صف واحد لكل سطر")}
                </label>
                <button
                  onClick={() => setInput(sample)}
                  className="text-[11px] bg-white border border-slate-300 hover:border-indigo-400 px-2.5 py-1 rounded font-bold text-slate-600"
                >
                  {T(lang, "Load sample", "بيانات تجريبية")}
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                dir="ltr"
                className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="INV-001,12500,2024-03-04,Sales"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                {T(lang, `Parsed: ${rows.length} rows · ${nums.length} numeric`, `تم التحليل: ${rows.length} صف · ${nums.length} رقم`)}
              </div>
            </div>

            {/* tool body */}
            {tool === "benford" && <BenfordView nums={nums} lang={lang} />}
            {tool === "duplicates" && <DuplicatesView rows={rows} lang={lang} />}
            {tool === "gaps" && <GapsView refs={rows.map((r) => r.ref)} lang={lang} />}
            {tool === "mus" && (
              <MusView
                rows={rows}
                lang={lang}
                interval={musInterval}
                start={musStart}
                setInterval={setMusInterval}
                setStart={setMusStart}
              />
            )}
            {tool === "random" && (
              <RandomView rows={rows} lang={lang} n={randomN} setN={setRandomN} />
            )}
            {tool === "stratify" && (
              <StratifyView rows={rows} lang={lang} buckets={strataN} setBuckets={setStrataN} />
            )}
            {tool === "weekend" && <WeekendView rows={rows} lang={lang} />}
            {tool === "roundnum" && <RoundView rows={rows} lang={lang} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- views ----------
function SectionCard({ title, children, onExport }: { title: string; children: React.ReactNode; onExport?: () => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-slate-800">{title}</h4>
        {onExport && (
          <button onClick={onExport} className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1">
            <Download className="w-3 h-3" /> CSV
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function BenfordView({ nums, lang }: { nums: number[]; lang: Lang }) {
  const res = useMemo(() => benford(nums), [nums]);
  if (!nums.length) return <Empty lang={lang} />;
  const chiVerdict =
    res.chi < 15.51
      ? T(lang, "Within Benford expectation (95% CI). No anomaly flag.", "ضمن توقع بنفورد (ثقة 95%). لا توجد إشارة شذوذ.")
      : T(lang, "DEVIATES from Benford — investigate for manipulation / fraud.", "انحراف عن بنفورد — تحقق من احتمال التلاعب/الاحتيال.");
  return (
    <SectionCard title={T(lang, "Benford's Law — first digit distribution", "قانون بنفورد — توزيع الرقم الأول")} onExport={() => downloadCSV("benford.csv", res.data)}>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={res.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="digit" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="expected" fill="#94a3b8" name={T(lang, "Expected %", "المتوقع %")} />
            <Bar dataKey="observed" fill="#6366f1" name={T(lang, "Observed %", "الفعلي %")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`mt-3 p-3 rounded-lg text-xs font-bold ${res.chi < 15.51 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
        χ² = {res.chi} · {chiVerdict}
      </div>
    </SectionCard>
  );
}

function DuplicatesView({ rows, lang }: { rows: any[]; lang: Lang }) {
  const groups = useMemo(() => findDuplicates(rows), [rows]);
  if (!rows.length) return <Empty lang={lang} />;
  const flat = groups.flat();
  return (
    <SectionCard
      title={T(lang, `Duplicate entries — ${groups.length} groups (${flat.length} rows)`, `قيود مكررة — ${groups.length} مجموعة (${flat.length} صف)`)}
      onExport={() => downloadCSV("duplicates.csv", flat)}
    >
      {groups.length === 0 ? (
        <p className="text-xs text-emerald-600 font-bold">{T(lang, "✓ No duplicates detected.", "✓ لا توجد قيود مكررة.")}</p>
      ) : (
        <div className="space-y-2">
          {groups.map((g, i) => (
            <div key={i} className="border border-rose-200 bg-rose-50 rounded-lg p-2 text-xs">
              {g.map((r: any, j: number) => (
                <div key={j} className="font-mono">{r.ref} · {r.amount} · {r.date || "-"} · {r.account || "-"}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function GapsView({ refs, lang }: { refs: string[]; lang: Lang }) {
  const gaps = useMemo(() => findGaps(refs), [refs]);
  if (!refs.length) return <Empty lang={lang} />;
  return (
    <SectionCard
      title={T(lang, `Sequence gaps — ${gaps.reduce((s, g) => s + g.missing, 0)} missing numbers`, `فجوات تسلسل — ${gaps.reduce((s, g) => s + g.missing, 0)} رقم مفقود`)}
      onExport={() => downloadCSV("gaps.csv", gaps)}
    >
      {gaps.length === 0 ? (
        <p className="text-xs text-emerald-600 font-bold">{T(lang, "✓ No sequence gaps.", "✓ لا توجد فجوات.")}</p>
      ) : (
        <table className="w-full text-xs">
          <thead className="bg-slate-100">
            <tr><th className="p-2 text-start">{T(lang, "From", "من")}</th><th className="p-2 text-start">{T(lang, "To", "إلى")}</th><th className="p-2 text-start">{T(lang, "Missing", "مفقود")}</th></tr>
          </thead>
          <tbody>
            {gaps.map((g, i) => (
              <tr key={i} className="border-t"><td className="p-2 font-mono">{g.from}</td><td className="p-2 font-mono">{g.to}</td><td className="p-2 font-bold text-rose-600">{g.missing}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function MusView({ rows, lang, interval, start, setInterval, setStart }: any) {
  const res = useMemo(() => musSample(rows, interval, start), [rows, interval, start]);
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <SectionCard
      title={T(lang, `MUS — ${res.sampled.length} units picked from ${res.population.toFixed(2)}`, `MUS — تم اختيار ${res.sampled.length} وحدة من ${res.population.toFixed(2)}`)}
      onExport={() => downloadCSV("mus.csv", res.sampled)}
    >
      <div className="flex gap-3 mb-3 text-xs">
        <label className="flex items-center gap-2">
          {T(lang, "Interval", "الفاصل")}
          <input type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-28" />
        </label>
        <label className="flex items-center gap-2">
          {T(lang, "Start", "البداية")}
          <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-28" />
        </label>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-slate-100">
          <tr><th className="p-2 text-start">Ref</th><th className="p-2 text-start">{T(lang, "Amount", "المبلغ")}</th><th className="p-2 text-start">{T(lang, "Cumulative", "تراكمي")}</th></tr>
        </thead>
        <tbody>
          {res.sampled.map((r: any, i: number) => (
            <tr key={i} className="border-t"><td className="p-2 font-mono">{r.ref}</td><td className="p-2">{r.amount}</td><td className="p-2 text-slate-500">{r.cum.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function RandomView({ rows, lang, n, setN }: any) {
  const picks = useMemo(() => randomSample(rows, n), [rows, n]);
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <SectionCard
      title={T(lang, `Random sample — ${picks.length} of ${rows.length}`, `عينة عشوائية — ${picks.length} من ${rows.length}`)}
      onExport={() => downloadCSV("random.csv", picks)}
    >
      <label className="flex items-center gap-2 text-xs mb-3">
        {T(lang, "Sample size", "حجم العينة")}
        <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-24" />
      </label>
      <table className="w-full text-xs">
        <thead className="bg-slate-100"><tr><th className="p-2 text-start">Ref</th><th className="p-2 text-start">{T(lang, "Amount", "المبلغ")}</th></tr></thead>
        <tbody>
          {picks.map((r: any, i: number) => (
            <tr key={i} className="border-t"><td className="p-2 font-mono">{r.ref}</td><td className="p-2">{r.amount}</td></tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

function StratifyView({ rows, lang, buckets, setBuckets }: any) {
  const data = useMemo(() => stratify(rows, buckets), [rows, buckets]);
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <SectionCard title={T(lang, "Stratification", "التقسيم الطبقي")} onExport={() => downloadCSV("strata.csv", data)}>
      <label className="flex items-center gap-2 text-xs mb-3">
        {T(lang, "Buckets", "الطبقات")}
        <input type="number" value={buckets} onChange={(e) => setBuckets(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 w-20" />
      </label>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-xs mt-3">
        <thead className="bg-slate-100"><tr><th className="p-2 text-start">{T(lang, "Range", "النطاق")}</th><th className="p-2 text-start">{T(lang, "Count", "العدد")}</th><th className="p-2 text-start">{T(lang, "Sum", "الإجمالي")}</th></tr></thead>
        <tbody>{data.map((d, i) => (<tr key={i} className="border-t"><td className="p-2">{d.range}</td><td className="p-2">{d.count}</td><td className="p-2">{d.sum}</td></tr>))}</tbody>
      </table>
    </SectionCard>
  );
}

function WeekendView({ rows, lang }: { rows: any[]; lang: Lang }) {
  const flagged = useMemo(() => weekendEntries(rows), [rows]);
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <SectionCard title={T(lang, `Weekend / holiday entries — ${flagged.length}`, `قيود نهاية الأسبوع — ${flagged.length}`)} onExport={() => downloadCSV("weekend.csv", flagged)}>
      {flagged.length === 0 ? (
        <p className="text-xs text-emerald-600 font-bold">{T(lang, "✓ No weekend entries detected.", "✓ لا توجد قيود في نهاية الأسبوع.")}</p>
      ) : (
        <table className="w-full text-xs">
          <thead className="bg-slate-100"><tr><th className="p-2 text-start">Ref</th><th className="p-2 text-start">{T(lang, "Amount", "المبلغ")}</th><th className="p-2 text-start">{T(lang, "Date", "التاريخ")}</th></tr></thead>
          <tbody>{flagged.map((r: any, i) => (<tr key={i} className="border-t bg-amber-50"><td className="p-2 font-mono">{r.ref}</td><td className="p-2">{r.amount}</td><td className="p-2">{r.date}</td></tr>))}</tbody>
        </table>
      )}
    </SectionCard>
  );
}

function RoundView({ rows, lang }: { rows: any[]; lang: Lang }) {
  const flagged = useMemo(() => roundNumbers(rows), [rows]);
  if (!rows.length) return <Empty lang={lang} />;
  return (
    <SectionCard title={T(lang, `Round number entries — ${flagged.length}`, `قيود بأرقام مدوّرة — ${flagged.length}`)} onExport={() => downloadCSV("round.csv", flagged)}>
      {flagged.length === 0 ? (
        <p className="text-xs text-emerald-600 font-bold">{T(lang, "✓ No suspicious round numbers.", "✓ لا توجد أرقام مدوّرة مشبوهة.")}</p>
      ) : (
        <table className="w-full text-xs">
          <thead className="bg-slate-100"><tr><th className="p-2 text-start">Ref</th><th className="p-2 text-start">{T(lang, "Amount", "المبلغ")}</th></tr></thead>
          <tbody>{flagged.map((r: any, i) => (<tr key={i} className="border-t bg-amber-50"><td className="p-2 font-mono">{r.ref}</td><td className="p-2 font-bold">{r.amount}</td></tr>))}</tbody>
        </table>
      )}
    </SectionCard>
  );
}

function Empty({ lang }: { lang: Lang }) {
  return (
    <div className="text-center py-10 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
      {T(lang, "Paste data above to start the analysis.", "ألصق البيانات بالأعلى لبدء التحليل.")}
    </div>
  );
}
