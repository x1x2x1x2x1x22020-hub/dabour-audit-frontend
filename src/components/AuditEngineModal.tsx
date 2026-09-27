import React, { useMemo, useState, useEffect } from "react";
import {
  X, Lightbulb, Bot, Loader2, Sparkles, BarChart3, ShieldAlert,
  Layers, Users, Clock, Hash, AlertOctagon, TrendingUp, CheckCircle2,
} from "lucide-react";
import { Language } from "../translations";

interface TBRow {
  code: string; name: string; py: number; cy: number;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "Other";
}
interface JERow {
  id: string; date: string; time: string; account: string;
  debit: number; credit: number; preparedBy: string; description: string; flags: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  engine: "IDEA" | "HALO";
  lang: Language;
  clientName: string;
  clientIndustry: string;
  tb: TBRow[];
  je: JERow[];
}

// --- Analytics helpers (run fully client-side on the same data) ---

function benford(je: JERow[]) {
  const expected = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];
  const counts = new Array(9).fill(0);
  let total = 0;
  je.forEach(j => {
    const amt = Math.max(Math.abs(j.debit), Math.abs(j.credit));
    if (amt < 1) return;
    const first = parseInt(String(amt).replace(/[^0-9]/g, "")[0] || "0", 10);
    if (first >= 1 && first <= 9) { counts[first - 1]++; total++; }
  });
  return expected.map((e, i) => ({
    digit: i + 1,
    expected: e,
    actual: total ? (counts[i] / total) * 100 : 0,
    deviation: total ? Math.abs((counts[i] / total) * 100 - e) : 0,
  }));
}

function stratify(tb: TBRow[]) {
  const buckets = [
    { label: "0 – 100K", min: 0, max: 100_000, count: 0, sum: 0 },
    { label: "100K – 1M", min: 100_000, max: 1_000_000, count: 0, sum: 0 },
    { label: "1M – 5M", min: 1_000_000, max: 5_000_000, count: 0, sum: 0 },
    { label: "5M – 25M", min: 5_000_000, max: 25_000_000, count: 0, sum: 0 },
    { label: "> 25M", min: 25_000_000, max: Infinity, count: 0, sum: 0 },
  ];
  tb.forEach(r => {
    const v = Math.abs(r.cy);
    const b = buckets.find(x => v >= x.min && v < x.max);
    if (b) { b.count++; b.sum += v; }
  });
  return buckets;
}

function duplicates(je: JERow[]) {
  const map = new Map<string, JERow[]>();
  je.forEach(j => {
    const k = `${j.account}|${j.debit || j.credit}|${j.date}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(j);
  });
  return Array.from(map.values()).filter(arr => arr.length > 1);
}

function gaps(je: JERow[]) {
  const nums = je
    .map(j => parseInt(j.id.replace(/[^0-9]/g, ""), 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  const g: number[] = [];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] > 1) g.push(nums[i - 1] + 1);
  }
  return g;
}

function musSampleSize(population: number, materiality: number) {
  // Simple MUS approximation: n = ln(1 - confidence) / ln(1 - materiality/population)
  if (!population || !materiality) return 0;
  const conf = 0.95;
  return Math.max(1, Math.ceil(Math.log(1 - conf) / Math.log(1 - materiality / population)));
}

function userActivity(je: JERow[]) {
  const map = new Map<string, { count: number; flagged: number; total: number }>();
  je.forEach(j => {
    const u = j.preparedBy || "(unknown)";
    if (!map.has(u)) map.set(u, { count: 0, flagged: 0, total: 0 });
    const x = map.get(u)!;
    x.count++;
    x.flagged += j.flags.length > 0 ? 1 : 0;
    x.total += Math.max(j.debit, j.credit);
  });
  return Array.from(map.entries()).map(([user, v]) => ({ user, ...v }))
    .sort((a, b) => b.total - a.total);
}

function timeProfile(je: JERow[]) {
  const buckets = { offHours: 0, businessHours: 0, weekend: 0, yearEnd: 0 };
  je.forEach(j => {
    const h = parseInt((j.time.split(":")[0] || "12"), 10);
    if (!isNaN(h) && (h >= 22 || h <= 5)) buckets.offHours++;
    else buckets.businessHours++;
    if (j.date.endsWith("12-31")) buckets.yearEnd++;
    const d = new Date(j.date);
    if (!isNaN(d.getTime()) && (d.getDay() === 0 || d.getDay() === 6)) buckets.weekend++;
  });
  return buckets;
}

export default function AuditEngineModal({
  open, onClose, engine, lang, clientName, clientIndustry, tb, je,
}: Props) {
  const isRtl = lang === "AR";
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const isIDEA = engine === "IDEA";

  const ben = useMemo(() => benford(je), [je]);
  const strat = useMemo(() => stratify(tb), [tb]);
  const dups = useMemo(() => duplicates(je), [je]);
  const gp = useMemo(() => gaps(je), [je]);
  const totalRevenue = useMemo(() => tb.filter(r => r.category === "Revenue").reduce((a, r) => a + r.cy, 0), [tb]);
  const materiality = Math.round(totalRevenue * 0.005); // 0.5% revenue
  const mus = useMemo(() => musSampleSize(tb.reduce((a, r) => a + Math.abs(r.cy), 0), materiality), [tb, materiality]);
  const users = useMemo(() => userActivity(je), [je]);
  const tprof = useMemo(() => timeProfile(je), [je]);
  const flagged = je.filter(j => j.flags.length > 0);

  useEffect(() => {
    if (!open) { setAiText(""); return; }
    runAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, engine]);

  const runAI = async () => {
    if (!tb.length && !je.length) return;
    setLoading(true);
    try {
      const focus = isIDEA
        ? `Act as CaseWare IDEA data-analytics engine. Comment on stratification, Benford's law deviations, duplicates, gaps, and the MUS sample size below for ${clientName} (${clientIndustry}).`
        : `Act as PwC HALO full-population testing engine. Comment on user activity concentration, off-hours postings, round amounts, weekend / year-end entries, and key-control exceptions for ${clientName} (${clientIndustry}).`;
      const payload = `${focus}

Benford top deviation digits: ${[...ben].sort((a,b)=>b.deviation-a.deviation).slice(0,3).map(b=>`d${b.digit} ${b.actual.toFixed(1)}% vs ${b.expected}%`).join(", ")}
Stratification: ${strat.map(s=>`${s.label}:${s.count}`).join(" | ")}
Duplicates: ${dups.length} clusters · Gaps: ${gp.length}
Materiality (0.5% rev): ${materiality} · MUS sample: ${mus}
Top users by value: ${users.slice(0,3).map(u=>`${u.user}(${u.count})`).join(", ")}
Time profile: off-hours ${tprof.offHours}, weekend ${tprof.weekend}, year-end ${tprof.yearEnd}
Flagged JEs: ${flagged.length}/${je.length}`;
      const res = await fetch("/api/sami-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "analyze-financials", params: { statementText: payload } }),
      });
      const json = await res.json();
      setAiText(json.text || "(no response)");
    } catch (e: any) {
      setAiText(`Error: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const themeBar = isIDEA
    ? "bg-gradient-to-r from-violet-700 via-indigo-700 to-violet-600"
    : "bg-gradient-to-r from-sky-700 via-cyan-700 to-sky-600";
  const Icon = isIDEA ? Lightbulb : Bot;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm p-2 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-slate-50 w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-300">
        {/* header */}
        <div className={`${themeBar} text-white px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {isIDEA
                  ? (isRtl ? "Sami — محرك تحليل البيانات" : "Sami — Data Analytics Engine")
                  : (isRtl ? "Zaza — اختبار الجمهرة الكاملة" : "Zaza — Full-Population Testing")}

              </h2>
              <p className="text-[11px] text-white/80">{clientName} · {clientIndustry}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* toolbar */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-4 font-bold">
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-indigo-600" />TB rows: {tb.length}</span>
            <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-sky-600" />JE entries: {je.length}</span>
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-600" />Flagged: {flagged.length}</span>
          </div>
          <button
            onClick={runAI}
            disabled={loading}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 hover:bg-black disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isRtl ? "إعادة تشغيل التحليل" : "Re-run engine"}
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tb.length === 0 && je.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 text-sm font-bold flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" />
              {isRtl ? "ارفع ميزان المراجعة أو دفتر اليومية أولاً من شاشة التحليل." : "Upload a trial balance or journal in the Analysis screen first."}
            </div>
          ) : isIDEA ? (
            <IDEAPanels ben={ben} strat={strat} dups={dups} gp={gp} mus={mus} materiality={materiality} lang={lang} />
          ) : (
            <HALOPanels users={users} tprof={tprof} flagged={flagged} je={je} lang={lang} />
          )}

          {/* AI commentary */}
          {(tb.length > 0 || je.length > 0) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="text-xs font-black text-orange-900 flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                {isRtl ? "تعليق سامي AI" : "Sami AI Commentary"}
              </h3>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-orange-700"><Loader2 className="w-4 h-4 animate-spin" />Running engine…</div>
              ) : (
                <pre className="text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">{aiText || "—"}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children, badge }: { icon: React.ReactNode; title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">{icon}{title}</h3>
        {badge && <span className="text-[9px] font-bold text-slate-400 uppercase">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function IDEAPanels({ ben, strat, dups, gp, mus, materiality, lang }: any) {
  const fmt = (n: number) => new Intl.NumberFormat(lang === "AR" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(n);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card icon={<TrendingUp className="w-3.5 h-3.5 text-violet-600" />} title={lang === "AR" ? "قانون بنفورد — الأرقام الأولى" : "Benford's Law — First-Digit Test"} badge="Sami">
        <table className="w-full text-[11px]">
          <thead className="text-slate-500">
            <tr><th className="text-left">Digit</th><th className="text-right">Expected</th><th className="text-right">Actual</th><th className="text-right">Δ</th></tr>
          </thead>
          <tbody>
            {ben.map((b: any) => (
              <tr key={b.digit} className="border-t border-slate-100">
                <td className="py-1 font-bold">{b.digit}</td>
                <td className="text-right tabular-nums">{b.expected}%</td>
                <td className="text-right tabular-nums">{b.actual.toFixed(1)}%</td>
                <td className={`text-right tabular-nums font-bold ${b.deviation > 5 ? "text-rose-600" : "text-emerald-600"}`}>{b.deviation.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card icon={<Layers className="w-3.5 h-3.5 text-indigo-600" />} title={lang === "AR" ? "تقسيم الأرصدة (Stratification)" : "Balance Stratification"} badge="Sami">
        <table className="w-full text-[11px]">
          <thead className="text-slate-500"><tr><th className="text-left">Range</th><th className="text-right">Count</th><th className="text-right">Sum</th></tr></thead>
          <tbody>
            {strat.map((s: any) => (
              <tr key={s.label} className="border-t border-slate-100">
                <td className="py-1">{s.label}</td>
                <td className="text-right tabular-nums font-bold">{s.count}</td>
                <td className="text-right tabular-nums">{fmt(s.sum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card icon={<Hash className="w-3.5 h-3.5 text-rose-600" />} title={lang === "AR" ? "الازدواجية والفجوات" : "Duplicates & Gaps"} badge="Sami">
        <div className="text-[11px] space-y-2">
          <div><b>Duplicate clusters:</b> {dups.length}</div>
          {dups.slice(0, 5).map((arr: any[], i: number) => (
            <div key={i} className="bg-rose-50 border border-rose-100 rounded p-2">
              <span className="font-bold">{arr[0].account}</span> ×{arr.length} — {arr[0].date}
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100"><b>Gap sequences:</b> {gp.length === 0 ? "None" : gp.slice(0, 10).join(", ")}</div>
        </div>
      </Card>

      <Card icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />} title={lang === "AR" ? "أخذ العينات MUS" : "MUS Sampling Plan"} badge="Sami">
        <div className="text-[11px] space-y-2">
          <div className="flex justify-between"><span>Materiality (0.5% rev)</span><b className="tabular-nums">{fmt(materiality)}</b></div>
          <div className="flex justify-between"><span>Confidence</span><b>95%</b></div>
          <div className="flex justify-between"><span>Recommended sample size</span><b className="text-violet-700 text-base">{mus}</b></div>
          <div className="text-[10px] text-slate-500 pt-2">Monetary Unit Sampling estimate — ISA 530.</div>
        </div>
      </Card>
    </div>
  );
}

function HALOPanels({ users, tprof, flagged, je, lang }: any) {
  const fmt = (n: number) => new Intl.NumberFormat(lang === "AR" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(n);
  const coverage = je.length ? ((flagged.length / je.length) * 100).toFixed(1) : "0";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKpi label="Population tested" value={`${je.length}`} sub="100% coverage" tone="sky" />
        <MiniKpi label="Exceptions" value={`${flagged.length}`} sub={`${coverage}%`} tone="rose" />
        <MiniKpi label="Off-hours" value={`${tprof.offHours}`} sub="22:00 – 05:00" tone="amber" />
        <MiniKpi label="Year-end / Weekend" value={`${tprof.yearEnd}/${tprof.weekend}`} sub="cut-off risk" tone="violet" />
      </div>

      <Card icon={<Users className="w-3.5 h-3.5 text-sky-700" />} title={lang === "AR" ? "تركيز المستخدمين" : "User Activity Concentration"} badge="Zaza">
        <table className="w-full text-[11px]">
          <thead className="text-slate-500"><tr><th className="text-left">User</th><th className="text-right">Entries</th><th className="text-right">Flagged</th><th className="text-right">Value</th></tr></thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.user} className="border-t border-slate-100">
                <td className="py-1 font-bold">{u.user}</td>
                <td className="text-right tabular-nums">{u.count}</td>
                <td className={`text-right tabular-nums font-bold ${u.flagged ? "text-rose-600" : "text-emerald-600"}`}>{u.flagged}</td>
                <td className="text-right tabular-nums">{fmt(u.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card icon={<Clock className="w-3.5 h-3.5 text-amber-600" />} title={lang === "AR" ? "استثناءات الرقابة الرئيسية" : "Key-Control Exceptions"} badge="Zaza">
        <ul className="space-y-1.5 text-[11px]">
          {flagged.length === 0 && <li className="text-emerald-700 font-bold">No exceptions detected.</li>}
          {flagged.slice(0, 15).map((j: any) => (
            <li key={j.id} className="bg-rose-50 border border-rose-100 rounded px-2 py-1.5 flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-slate-800">{j.date} {j.time} · {j.account}</div>
                <div className="text-[10px] text-rose-700">{j.flags.join(" · ")}</div>
              </div>
              <div className="font-mono text-[10px] text-slate-500 shrink-0">D{fmt(j.debit)}/C{fmt(j.credit)} · {j.preparedBy}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function MiniKpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "sky" | "rose" | "amber" | "violet" }) {
  const map: any = {
    sky: "from-sky-50 to-cyan-50 border-sky-200 text-sky-900",
    rose: "from-rose-50 to-pink-50 border-rose-200 text-rose-900",
    amber: "from-amber-50 to-orange-50 border-amber-200 text-amber-900",
    violet: "from-violet-50 to-indigo-50 border-violet-200 text-violet-900",
  };
  return (
    <div className={`bg-gradient-to-br ${map[tone]} border rounded-xl p-3`}>
      <div className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-xl font-black tabular-nums mt-0.5">{value}</div>
      <div className="text-[10px] font-bold opacity-70">{sub}</div>
    </div>
  );
}
