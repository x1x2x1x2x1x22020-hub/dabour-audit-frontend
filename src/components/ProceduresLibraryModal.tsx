import React, { useMemo, useState } from "react";
import { X, Search, Library, CheckCircle2, Plus, Filter } from "lucide-react";
import {
  BIG4_PROCEDURES,
  SECTION_LABELS,
  FIRM_COLORS,
  type CycleSection,
  type Firm,
  type LibraryProcedure,
} from "../data/big4-procedures";
import { AuditProcedure } from "../types";
import { Language } from "../translations";

interface Props {
  open: boolean;
  onClose: () => void;
  lang: Language;
  existingRefs: string[]; // refs already in the program (to disable duplicates)
  onAdd: (procs: AuditProcedure[]) => void;
}

const FIRMS: ("ALL" | Firm)[] = ["ALL", "Deloitte", "PwC", "EY", "KPMG", "ISA"];

// Map library CycleSection → the AuditProcedure.section string the rest of the
// app filters on (Revenue / Cash / Assets / Equity). Unknown sections keep their key.
function mapSection(s: CycleSection): string {
  if (s === "Revenue" || s === "Cash" || s === "Assets" || s === "Equity") return s;
  if (s === "Receivables") return "Revenue";
  if (s === "Payables" || s === "Expenses" || s === "Payroll" || s === "Tax") return "Equity";
  if (s === "Inventory" || s === "Investments") return "Assets";
  if (s === "Debt") return "Equity";
  if (s === "JE_Testing" || s === "ITGC" || s === "Going_Concern") return "Equity";
  return "Revenue";
}

export default function ProceduresLibraryModal({
  open, onClose, lang, existingRefs, onAdd,
}: Props) {
  const isRtl = lang === "AR";
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<"ALL" | CycleSection>("ALL");
  const [firm, setFirm] = useState<"ALL" | Firm>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sections: ("ALL" | CycleSection)[] = useMemo(
    () => ["ALL", ...(Object.keys(SECTION_LABELS) as CycleSection[])],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIG4_PROCEDURES.filter(p =>
      (section === "ALL" || p.section === section) &&
      (firm === "ALL" || p.firm === firm) &&
      (q === "" ||
        p.description.toLowerCase().includes(q) ||
        p.descriptionAr.includes(q) ||
        p.ref.toLowerCase().includes(q) ||
        p.assertion.toLowerCase().includes(q) ||
        (p.isaRef || "").toLowerCase().includes(q))
    );
  }, [query, section, firm]);

  if (!open) return null;

  const toggle = (ref: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev);
      filtered.forEach(p => { if (!existingRefs.includes(p.ref)) next.add(p.ref); });
      return next;
    });
  };

  const handleAdd = () => {
    const picks: LibraryProcedure[] = BIG4_PROCEDURES.filter(p => selected.has(p.ref));
    const mapped: AuditProcedure[] = picks.map(p => ({
      id: `lib-${p.ref}-${Date.now()}`,
      section: mapSection(p.section),
      ref: p.ref,
      description: p.description,
      descriptionAr: p.descriptionAr,
      assertion: p.assertion,
      evidence: p.evidence,
      status: "Pending",
    }));
    onAdd(mapped);
    setSelected(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm p-2 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-slate-50 w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg backdrop-blur-sm">
              <Library className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {isRtl ? "مكتبة إجراءات التدقيق — البيغ فور & ISA" : "Big-4 & ISA Audit Procedures Library"}
              </h2>
              <p className="text-[11px] text-slate-300">
                {isRtl
                  ? `اختر من ${BIG4_PROCEDURES.length} إجراءً معياريًا من Deloitte AS/2 وPwC Aura وEY Canvas وKPMG Clara`
                  : `Pick from ${BIG4_PROCEDURES.length} standardised procedures across Deloitte AS/2, PwC Aura, EY Canvas, KPMG Clara`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isRtl ? "ابحث بالوصف أو المرجع أو التأكيد..." : "Search description, ref, assertion, ISA…"}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={section}
            onChange={e => setSection(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            {sections.map(s => (
              <option key={s} value={s}>
                {s === "ALL"
                  ? (isRtl ? "كل الدورات" : "All cycles")
                  : (isRtl ? SECTION_LABELS[s].ar : SECTION_LABELS[s].en)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
            {FIRMS.map(f => (
              <button
                key={f}
                onClick={() => setFirm(f)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide transition-all ${
                  firm === f ? "bg-slate-900 text-orange-400 shadow" : "text-slate-600 hover:bg-white"
                }`}
              >
                {f === "ALL" ? (isRtl ? "الكل" : "All") : f}
              </button>
            ))}
          </div>

          <button
            onClick={selectAllVisible}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 border border-slate-200 rounded-lg flex items-center gap-1"
          >
            <Filter className="w-3 h-3" />
            {isRtl ? "تحديد المعروض" : "Select visible"}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-12">
              {isRtl ? "لا توجد إجراءات مطابقة." : "No matching procedures."}
            </p>
          )}
          {filtered.map(p => {
            const isSelected = selected.has(p.ref);
            const isDup = existingRefs.includes(p.ref);
            return (
              <label
                key={p.ref}
                className={`flex gap-3 items-start p-3 rounded-xl border transition-all cursor-pointer ${
                  isDup ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                       : isSelected ? "bg-orange-50 border-orange-400 shadow-sm"
                       : "bg-white border-slate-200 hover:border-orange-300"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={isDup}
                  checked={isSelected}
                  onChange={() => toggle(p.ref)}
                  className="mt-1 w-4 h-4 accent-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{p.ref}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${FIRM_COLORS[p.firm]}`}>{p.firm}</span>
                    <span className="text-[9px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                      {isRtl ? SECTION_LABELS[p.section].ar : SECTION_LABELS[p.section].en}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600">{p.assertion}</span>
                    {p.isaRef && <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">{p.isaRef}</span>}
                    {isDup && (
                      <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />{isRtl ? "مضافة" : "Added"}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-800 font-medium leading-snug">
                    {isRtl ? p.descriptionAr : p.description}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    <span className="font-bold">{isRtl ? "الأدلة:" : "Evidence:"}</span> {p.evidence}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">
            {isRtl ? `محدد: ${selected.size} من ${filtered.length} ظاهر` : `${selected.size} selected · ${filtered.length} visible`}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-black hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {isRtl ? `إضافة ${selected.size} إجراء` : `Add ${selected.size} procedure(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
