import React, { useState } from "react";
import { X, Sparkles, Send, Loader2, Copy, FileText, CheckCircle } from "lucide-react";
import { Language } from "../translations";

interface SamiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentClientIndustry: string;
  onApplyProcedures: (text: string) => void;
  onApplyWorkpaper: (title: string, markdown: string) => void;
}

interface Message {
  sender: "user" | "sami";
  text: string;
}

const TEMPLATE_PROMPTS = [
  {
    label: "Draft Audit Planning Memo",
    labelAr: "صياغة مذكرة تخطيط التدقيق",
    prompt: "Draft an audit planning memorandum under ISA 300 for a client in the [INDUSTRY] sector. Detail key inherent risk areas and professional skepticism rules.",
  },
  {
    label: "Generate Cash Substantive Workpaper",
    labelAr: "توليد ورقة عمل الفحص النقدي",
    prompt: "Create a cash verification and bank circularization (reconciliation) testing table template for a client in [INDUSTRY]. Include standard columns.",
  },
  {
    label: "Evaluate Revenue Risks (ISA 315)",
    labelAr: "تقييم مخاطر الإيرادات معيار ٣١٥",
    prompt: "Analyze typical risk profile factors related to revenue completeness and deferred licensing contracts under ISA 315.",
  }
];

export default function SamiCopilotModal({
  isOpen,
  onClose,
  lang,
  currentClientIndustry,
  onApplyProcedures,
  onApplyWorkpaper,
}: SamiCopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "sami",
      text: lang === "EN" 
        ? "Hello, I am Sami, your AI Audit Copilot. How can I assist you with your audit programs, materiality, or drafting technical workpapers today?"
        : "مرحباً، أنا سامي، مساعدك الذكي للتدقيق. كيف يمكنني مساعدتك في برامج المراجعة، وملاحظات الأهمية المادية، أو صياغة مسودات أوراق العمل اليوم؟"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedWp, setLastGeneratedWp] = useState<{ title: string; markdown: string } | null>(null);

  if (!isOpen) return null;

  const isRtl = lang === "AR";

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    if (!customPrompt) {
      setInputText("");
    }

    setMessages(prev => [...prev, { sender: "user", text: textToSend }]);
    setIsLoading(true);

    try {
      // Create request payload mapped to tool endpoint
      const response = await fetch("/api/sami-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "create-workpaper",
          params: {
            prepTitle: "AI Copilot Response Memorandum",
            auditorName: "Sami Copilot Interactive",
            objective: textToSend.replace("[INDUSTRY]", currentClientIndustry)
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: "sami", text: data.text }]);
        // Keep track of this as a possible workpaper file to save
        setLastGeneratedWp({
          title: "Sami AI Copilot Memo - " + currentClientIndustry,
          markdown: data.text
        });
      } else {
        setMessages(prev => [...prev, { sender: "sami", text: `Error: ${data.error || "Execution error."}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: "sami", text: `Failed to speak to Sami backend server: ${err.message || err}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncorporateWorkpaper = () => {
    if (!lastGeneratedWp) return;
    onApplyWorkpaper(lastGeneratedWp.title, lastGeneratedWp.markdown);
    setMessages(prev => [...prev, { 
      sender: "sami", 
      text: isRtl ? "✅ تم حفظ هذه المذكرة كورقة عمل رسمية بنجاح!" : "✅ Successfully incorporated this response memo directly into your private Workpapers Cabinet!" 
    }]);
    setLastGeneratedWp(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full transform transition-transform duration-300">
      
      {/* Header */}
      <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 rounded-xl text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-1.5">
              {isRtl ? "مساعد سامي الذكي الفوري" : "Sami AI Instant Copilot"}
              <span className="text-[10px] bg-orange-600 px-1.5 py-0.5 rounded-full font-normal">Active</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {isRtl ? "مساعد العمل الميداني والتدقيق وحلول معيار ISA" : "Dual-mode floating dialogue console for local audits."}
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

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col max-w-[85%] ${m.sender === "user" ? (isRtl ? "mr-auto items-start" : "ml-auto items-end") : (isRtl ? "ml-auto items-end" : "mr-auto items-start")}`}
          >
            <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">
              {m.sender === "user" ? (isRtl ? "أنت (المدقق)" : "You (Lead Auditor)") : (isRtl ? "المساعد سامي" : "Sami AI")}
            </span>
            <div 
              className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                m.sender === "user" 
                  ? "bg-orange-500 text-white rounded-br-none" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium"
              }`}
            >
              {m.text}
            </div>

            {/* If it is a sami memo response, allow copying or applying */}
            {m.sender === "sami" && idx === messages.length - 1 && lastGeneratedWp && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleIncorporateWorkpaper}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isRtl ? "حفظ كورقة عمل مدمجة" : "Incorporate to Locker Portfolio"}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            <span>{isRtl ? "جاري تدقيق الخوارزمية وصياغة بنود الاستجابة..." : "Sami AI is analyzing criteria and drafting memorandum..."}</span>
          </div>
        )}
      </div>

      {/* Quick Prompts shortcuts list */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none" dir={isRtl ? "rtl" : "ltr"}>
        {TEMPLATE_PROMPTS.map((tp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(tp.prompt.replace("[INDUSTRY]", currentClientIndustry))}
            disabled={isLoading}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 disabled:opacity-40 text-orange-950 font-bold text-[10px] rounded-xl border border-orange-100 cursor-pointer shrink-0 transition-colors"
          >
            {isRtl ? tp.labelAr : tp.label}
          </button>
        ))}
      </div>

      {/* Entry input panel */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2" dir={isRtl ? "rtl" : "ltr"}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) handleSendMessage();
          }}
          disabled={isLoading}
          placeholder={isRtl ? "اسأل سامي عن معالجة أو صياغة البنود..." : "Ask Sami to write memos, verify risks..."}
          className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-xs px-3.5 py-2.5 rounded-xl text-slate-800 font-medium focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
