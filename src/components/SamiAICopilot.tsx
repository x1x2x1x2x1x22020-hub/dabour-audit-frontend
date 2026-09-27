import React, { useState } from "react";
import { Sparkles, Loader2, ArrowRight, Table, ShieldAlert, FileText, CheckCircle2, Copy } from "lucide-react";
import { Language, translations } from "../translations";

interface SamiAICopilotProps {
  lang: Language;
  onApplyProcedures?: (proceduresText: string) => void;
  onApplyWorkpaper?: (workpaperTitle: string, markdownContent: string) => void;
  currentClientIndustry: string;
}

export default function SamiAICopilot({
  lang,
  onApplyProcedures,
  onApplyWorkpaper,
  currentClientIndustry,
}: SamiAICopilotProps) {
  const t = translations[lang];
  const [selectedTool, setSelectedTool] = useState<"generate-procedures" | "analyze-financials" | "extract-risks" | "create-workpaper">("generate-procedures");
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>("");
  const [isSimulated, setIsSimulated] = useState(false);

  // Tool-specific input states
  const [procArea, setProcArea] = useState("Revenue Recognition");
  const [procStandard, setProcStandard] = useState("ISA 315");
  
  const [statementText, setStatementText] = useState(
    `Revenues: $4,500,000 (Prev: $4,200,000)\nAccounts Receivable: $980,000 (Prev: $540,000)\nAllowance for Credit Losses: $15,000 (Prev: $15,000)\nInventory: $620,000 (Prev: $590,000)\nNet Income before Tax: $120,000 (Prev: $320,000)`
  );
  
  const [textExcerpt, setTextExcerpt] = useState(
    `Section 8.4: The lessee may terminate this vehicle lease for convenience at any point after month 12 upon giving 60 days advance written notice, subject to a termination fee equal to 2 months of standard lease payments ($12,000). Section 9.1: The company warrants to keep overall current ratio above 2.1x relative to Bank lines.`
  );
  
  const [wpTitle, setWpTitle] = useState("Property, Plant & Equipment Vouching Template");
  const [auditorName, setAuditorName] = useState("Lead Audit Associate");
  const [wpObjective, setWpObjective] = useState("Test PPE additions over $50,000 for standard legal ownership and correct capitalization.");

  const handleRunTool = async () => {
    setLoading(true);
    setResultText("");
    
    let params = {};
    if (selectedTool === "generate-procedures") {
      params = { industry: currentClientIndustry || "General Consumer Goods", auditArea: procArea, complianceStandard: procStandard };
    } else if (selectedTool === "analyze-financials") {
      params = { statementText };
    } else if (selectedTool === "extract-risks") {
      params = { textExcerpt };
    } else if (selectedTool === "create-workpaper") {
      params = { prepTitle: wpTitle, auditorName, objective: wpObjective };
    }

    try {
      const response = await fetch("/api/sami-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: selectedTool, params }),
      });
      const data = await response.json();
      if (data.success) {
        setResultText(data.text);
        setIsSimulated(!!data.isSimulated);
      } else {
        setResultText(`Error: ${data.error || "Failed to process request."}`);
      }
    } catch (err: any) {
      setResultText(`Failed to connect to backend server. Reason: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Simple and highly effective Markdown parser for neat dashboard rendering
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Warning blockquote
      if (trimmed.startsWith(">")) {
        return (
          <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-3 my-3 text-xs text-orange-800 rounded">
            {trimmed.replace(/^>\s*\*\*Notice\*\*:/i, "").replace(/^>\s*/, "")}
          </div>
        );
      }

      // Headings
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-gray-900 mt-4 mb-2 flex items-center gap-1 border-b border-gray-100 pb-1">{trimmed.replace("### ", "")}</h4>;
      }
      if (trimmed.startsWith("####")) {
        return <h5 key={idx} className="text-xs font-bold text-gray-800 mt-3 mb-1">{trimmed.replace("#### ", "")}</h5>;
      }
      if (trimmed.startsWith("**")) {
        // Special highlighted lines like title
        return <p key={idx} className="text-xs font-semibold text-gray-900 my-1">{trimmed.replace(/\*\*/g, "")}</p>;
      }

      // Markdown Tables mapping
      if (trimmed.startsWith("|") && line.includes("---")) {
        return null; // Skip table border/divider lines
      }
      if (trimmed.startsWith("|")) {
        const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          return (
            <div key={idx} className="overflow-x-auto my-3 border border-gray-100 rounded">
              <table className="min-w-full text-xs text-left text-gray-600">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {tableHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2 font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          );
        }
        
        // This parses standard table cells
        return (
          <div key={idx} className="overflow-x-auto border-x border-b border-gray-100 last:rounded-b">
            <table className="min-w-full text-xs text-left text-gray-600">
              <tbody>
                <tr className="hover:bg-slate-50/50">
                  {cells.map((cell, i) => {
                    // check for bold inside cells
                    const isBold = cell.startsWith("**") && cell.endsWith("**");
                    const cleaned = cell.replace(/\*\*/g, "");
                    return (
                      <td key={i} className="px-3 py-2 border-r border-gray-50 last:border-0 text-gray-800 font-normal">
                        {isBold ? <strong className="font-semibold text-gray-900">{cleaned}</strong> : cleaned}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        );
      }

      inTable = false; // Reset table flag

      // Standard list items
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const bulletText = trimmed.replace(/^[\s*-]+/, "");
        // Highlight first words before colon if exists
        const colonIndex = bulletText.indexOf(":");
        if (colonIndex > 0) {
          const title = bulletText.substring(0, colonIndex);
          const body = bulletText.substring(colonIndex + 1);
          return (
            <ul key={idx} className="list-disc pl-5 my-1 text-xs text-gray-700">
              <li>
                <strong className="text-gray-900">{title}:</strong>{body}
              </li>
            </ul>
          );
        }
        return (
          <ul key={idx} className="list-disc pl-5 my-1 text-xs text-gray-700">
            <li>{bulletText}</li>
          </ul>
        );
      }

      // Plain paragraph
      if (trimmed.length > 0) {
        return <p key={idx} className="text-xs text-gray-700 my-1 line-height-relaxed">{trimmed}</p>;
      }

      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Copilot Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {t.copilotName}
              <span className="text-xs bg-orange-500 text-white font-normal px-2 py-0.5 rounded-full">v2.5</span>
            </h3>
            <p className="text-xs text-gray-500">{t.copilotSubtitle}</p>
          </div>
        </div>
        <div className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
          {lang === "EN" ? "Model: gemini-3.5-flash" : "النموذج: جيميناي ٣.٥ فلاش"}
        </div>
      </div>

      {/* Tool Toggles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => { setSelectedTool("generate-procedures"); setResultText(""); }}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            selectedTool === "generate-procedures"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-100 hover:border-gray-200 text-gray-600"
          }`}
        >
          <Table className="w-4 h-4 mb-2 text-orange-500" />
          <span className="text-xs font-semibold">{t.copilotToolProcedures}</span>
        </button>

        <button
          onClick={() => { setSelectedTool("analyze-financials"); setResultText(""); }}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            selectedTool === "analyze-financials"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-100 hover:border-gray-200 text-gray-600"
          }`}
        >
          <Sparkles className="w-4 h-4 mb-2 text-orange-500" />
          <span className="text-xs font-semibold">{t.copilotToolFinancial}</span>
        </button>

        <button
          onClick={() => { setSelectedTool("extract-risks"); setResultText(""); }}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            selectedTool === "extract-risks"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-100 hover:border-gray-200 text-gray-600"
          }`}
        >
          <ShieldAlert className="w-4 h-4 mb-2 text-orange-500" />
          <span className="text-xs font-semibold">{t.copilotToolRisk}</span>
        </button>

        <button
          onClick={() => { setSelectedTool("create-workpaper"); setResultText(""); }}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
            selectedTool === "create-workpaper"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-100 hover:border-gray-200 text-gray-600"
          }`}
        >
          <FileText className="w-4 h-4 mb-2 text-orange-500" />
          <span className="text-xs font-semibold">{t.copilotToolWorkpaper}</span>
        </button>
      </div>

      {/* Inputs Section */}
      <div className="bg-slate-50/60 p-4 rounded-xl mb-4 border border-dashed border-gray-200">
        {selectedTool === "generate-procedures" && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Audit Cycle / Target Area" : "دورة التدقيق المستهدفة"}</label>
              <input
                type="text"
                value={procArea}
                onChange={(e) => setProcArea(e.target.value)}
                className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded text-gray-800 font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Governing Standard" : "المعيار الحاكم"}</label>
              <select
                value={procStandard}
                onChange={(e) => setProcStandard(e.target.value)}
                className="w-full bg-white border border-gray-200 px-2 py-1.5 rounded text-gray-800 font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="ISA 315">ISA 315 - Assessing Risks</option>
                <option value="ISA 220">ISA 220 - Quality Control</option>
                <option value="ISA 210">ISA 210 - Engagement terms</option>
                <option value="ISA 320">ISA 320 - Materiality Level</option>
              </select>
            </div>
          </div>
        )}

        {selectedTool === "analyze-financials" && (
          <div className="text-xs">
            <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Input Trial Balance Excerpt / Account ledger summaries" : "أدخل ملخص ميزان المراجعة أو الحسابات"}</label>
            <textarea
              rows={4}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              className="w-full bg-white border border-gray-200 p-2 rounded text-gray-800 font-mono text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {selectedTool === "extract-risks" && (
          <div className="text-xs">
            <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Input Legal, Contract, or Board Minutes text excerpt" : "أدخل ملخص العقد أو محضر مجلس الإدارة المثير للقلق"}</label>
            <textarea
              rows={4}
              value={textExcerpt}
              onChange={(e) => setTextExcerpt(e.target.value)}
              className="w-full bg-white border border-gray-200 p-2 rounded text-gray-800 focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>
        )}

        {selectedTool === "create-workpaper" && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Workpaper Subject Title" : "عنوان ورقة العمل"}</label>
                <input
                  type="text"
                  value={wpTitle}
                  onChange={(e) => setWpTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold text-gray-800 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Dedicated Auditor" : "المدقق المسؤول"}</label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full bg-white border border-gray-200 px-3 py-1.5 rounded text-gray-800 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1 font-medium">{lang === "EN" ? "Audit Objective Statement" : "بيان هدف التدقيق"}</label>
              <textarea
                rows={2}
                value={wpObjective}
                onChange={(e) => setWpObjective(e.target.value)}
                className="w-full bg-white border border-gray-200 p-2 rounded text-gray-800 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Run Action */}
      <button
        onClick={handleRunTool}
        disabled={loading}
        className="w-full bg-orange-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 cursor-pointer disabled:bg-orange-300 transition-colors text-xs"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{lang === "EN" ? "Sami is computing..." : "سامي يقوم بالتحليل..."}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{t.copilotGenerateBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Result Workspace */}
      {resultText && (
        <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50 px-4 py-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              {lang === "EN" ? "Sami Smart Output" : "مخرجات سامي الذكية"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resultText);
                  alert(lang === "EN" ? "Copied to clipboard!" : "تم النسخ للحافظة!");
                }}
                className="p-1 hover:bg-white rounded border border-gray-150 inline-flex items-center gap-1 text-[10px] text-gray-600 font-semibold"
                title="Copy markdown text"
              >
                <Copy className="w-3 h-3 text-gray-500" />
                {lang === "EN" ? "Copy" : "نسخ"}
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[400px] text-justify bg-slate-50/20 font-sans border-b border-gray-100">
            {renderMarkdown(resultText)}
          </div>

          {/* Action Integration to Live State */}
          <div className="p-3 bg-white flex justify-end gap-2 text-xs">
            {selectedTool === "generate-procedures" && onApplyProcedures && (
              <button
                onClick={() => {
                  onApplyProcedures(resultText);
                }}
                className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-200 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === "EN" ? "Apply Procedures Checklist to Program" : "تطبيق هذا الإجراء على خطة العميل"}
              </button>
            )}

            {selectedTool === "create-workpaper" && onApplyWorkpaper && (
              <button
                onClick={() => {
                  onApplyWorkpaper(wpTitle, resultText);
                }}
                className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-200 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === "EN" ? "Store in Workpapers Cabinet" : "حفظ في ملفات العمل"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
