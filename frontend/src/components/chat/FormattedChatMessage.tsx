"use client";

import React, { useState } from "react";
import { 
  Lightbulb, Leaf, Clock, ShieldCheck, Wrench, Wind, 
  Package, FileCheck2, Copy, Check, ChevronDown, ChevronUp,
  AlertTriangle, ArrowRight, Layers, Sparkles
} from "lucide-react";

interface FormattedChatMessageProps {
  text: string;
  sender: "user" | "ai";
  payload?: {
    extracted_parameters?: any;
    commodity?: any;
    ml_packaging?: any;
    ml_shelf_life?: any;
    suggestion_advisory?: any;
    top_3_materials?: any[];
    math_trace?: any;
    vendor_quotes?: any[];
  };
}

export function FormattedChatMessage({ text, sender, payload }: FormattedChatMessageProps) {
  const [activeTab, setActiveTab] = useState<"machine" | "preservation" | "logistics" | "statutory" | "rfq">("machine");
  const [copiedRfq, setCopiedRfq] = useState<boolean>(false);
  const [showFullAdvisory, setShowFullAdvisory] = useState<boolean>(true);

  if (sender === "user") {
    return <div className="text-sm font-medium text-white">{text}</div>;
  }

  // Parse text components
  // 1. Check for Context Analysis (> 💡 **Context Analysis**: ...)
  let contextNote = "";
  let cleanText = text;

  const contextMatch = text.match(/>\s*💡\s*\*\*Context(?:\s+&?\s*Science)?\s*Analysis\*\*:\s*\*?([\s\S]*?)\*?(?=\n\n|$)/i);
  if (contextMatch) {
    contextNote = contextMatch[1].trim();
    cleanText = text.replace(contextMatch[0], "").trim();
  }

  // 2. Extract intro paragraph before the first heading ###
  const firstHeadingIdx = cleanText.indexOf("###");
  let introText = "";
  let sectionsText = cleanText;
  if (firstHeadingIdx !== -1) {
    introText = cleanText.substring(0, firstHeadingIdx).trim();
    sectionsText = cleanText.substring(firstHeadingIdx).trim();
  }

  // Split into sections by "### "
  const rawSections = sectionsText
    .split(/(?=###\s+)/)
    .filter((s) => s.trim().length > 0);

  const advisory = payload?.suggestion_advisory;

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedRfq(true);
    setTimeout(() => setCopiedRfq(false), 2000);
  };

  // Helper to render inline markdown (bold, code, etc.)
  const renderInlineFormatted = (str: string) => {
    // Split by code `...` and bold **...**
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 text-slate-800 w-full min-w-0 overflow-hidden break-words">
      {/* Context Analysis Glowing Banner */}
      {contextNote && (
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-teal-500/10 border border-amber-200/90 shadow-sm relative overflow-hidden min-w-0 break-words">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
              <Lightbulb className="h-3 w-3 stroke-[2.5]" />
            </span>
            <span className="truncate">Food Science Context & Vulnerability</span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium italic break-words">
            "{contextNote}"
          </p>
        </div>
      )}

      {/* Intro overview sentence */}
      {introText && (
        <div className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-medium px-0.5 break-words">
          {renderInlineFormatted(introText)}
        </div>
      )}

      {/* Render Parsed Sections */}
      {rawSections.length > 0 ? (
        <div className="space-y-3 w-full min-w-0">
          {rawSections.map((sec, idx) => {
            const lines = sec.split("\n").filter((l) => l.trim().length > 0);
            const headingLine = lines[0] || "";
            const contentLines = lines.slice(1);

            // Determine Section Type
            const isBioplastic = headingLine.includes("Recommended Bioplastic");
            const isShelfLife = headingLine.includes("Shelf-Life");
            const isSuggestions = headingLine.includes("Suggestions");
            const isRegulatory = headingLine.includes("Regulatory");

            let borderClass = "border-slate-200 bg-white";
            let headerIcon = <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />;
            let badgeBg = "bg-slate-100 text-slate-700";

            if (isBioplastic) {
              borderClass = "border-emerald-300 bg-emerald-50/40";
              headerIcon = <Leaf className="h-4 w-4 text-emerald-600 shrink-0" />;
              badgeBg = "bg-emerald-600 text-white";
            } else if (isShelfLife) {
              borderClass = "border-purple-200 bg-purple-50/30";
              headerIcon = <Clock className="h-4 w-4 text-purple-600 shrink-0" />;
              badgeBg = "bg-purple-600 text-white";
            } else if (isSuggestions) {
              borderClass = "border-sky-200 bg-sky-50/40";
              headerIcon = <Wrench className="h-4 w-4 text-sky-600 shrink-0" />;
              badgeBg = "bg-sky-600 text-white";
            } else if (isRegulatory) {
              borderClass = "border-teal-200 bg-teal-50/30";
              headerIcon = <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />;
              badgeBg = "bg-teal-700 text-white";
            }

            // Clean heading title
            const cleanHeading = headingLine.replace(/^###\s+/, "");

            return (
              <div 
                key={idx} 
                className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4.5 shadow-xs space-y-2.5 sm:space-y-3 transition-all min-w-0 overflow-hidden break-words ${borderClass}`}
              >
                {/* Section Header */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white shadow-xs border border-slate-200/80">
                    {headerIcon}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight break-words min-w-0 flex-1">
                    {renderInlineFormatted(cleanHeading)}
                  </h4>
                </div>

                {/* Section Bullet Content */}
                <div className="space-y-2 pt-1 min-w-0">
                  {contentLines.map((line, lIdx) => {
                    const cleanLine = line.replace(/^[-*]\s+/, "");
                    const isSubBullet = cleanLine.includes(":");
                    
                    if (isSubBullet) {
                      const [label, ...valParts] = cleanLine.split(":");
                      const val = valParts.join(":");
                      return (
                        <div key={lIdx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs text-slate-700 bg-white/70 p-2 sm:p-2.5 rounded-xl border border-slate-200/60 min-w-0 overflow-hidden break-words">
                          <span className="font-bold text-slate-900 sm:min-w-[170px] shrink-0 flex items-center gap-1.5 break-words">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            {renderInlineFormatted(label.replace(/^\*\*/, "").replace(/\*\*$/, ""))}
                          </span>
                          <span className="text-slate-700 font-medium leading-relaxed min-w-0 break-words flex-1">
                            {renderInlineFormatted(val.trim())}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={lIdx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2 bg-white/60 p-2 rounded-lg min-w-0 overflow-hidden break-words">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                        <span className="min-w-0 break-words flex-1">{renderInlineFormatted(cleanLine)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback for general conversation / greetings */
        <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed text-slate-800">
          {cleanText}
        </div>
      )}

      {/* Interactive Suggestion & Practical Engineering Advisory Panel */}
      {advisory && (
        <div className="rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-50/70 to-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                <Wrench className="h-4 w-4" />
              </span>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Industrial Implementation & Processing Suggestions
                </div>
                <div className="text-[11px] text-sky-800 font-medium">
                  Tailored engineering parameters for {payload?.commodity?.name || "your commodity"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFullAdvisory(!showFullAdvisory)}
              className="flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-xs transition-colors cursor-pointer"
            >
              <span>{showFullAdvisory ? "Collapse" : "Expand"}</span>
              {showFullAdvisory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {showFullAdvisory && (
            <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
              {/* Tab navigation (Mobile Swipeable Ribbon) */}
              <div className="flex overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("machine")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "machine"
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ⚙️ Sealing & Machine
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preservation")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "preservation"
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  💨 Gas / MAP Flush
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("logistics")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "logistics"
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📦 Warehouse & Shipping
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("statutory")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "statutory"
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📜 Statutory Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("rfq")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "rfq"
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🛒 Supplier RFQ
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "machine" && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jaw Temp Window</div>
                      <div className="text-sm font-extrabold text-sky-700 mt-0.5">{advisory.machine_parameters.jaw_temp_c}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">{advisory.machine_parameters.jaw_temp_note}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dwell Time</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{advisory.machine_parameters.dwell_time_s}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">{advisory.machine_parameters.dwell_time_note}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sealing Pressure</div>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">{advisory.machine_parameters.pressure_bar}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">{advisory.machine_parameters.pressure_note}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-sky-50/50 p-2.5 rounded-lg border border-sky-200/70 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-sky-600 shrink-0" />
                    <span><strong>Quality Assurance:</strong> {advisory.machine_parameters.leak_testing}</span>
                  </div>
                </div>
              )}

              {activeTab === "preservation" && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-teal-600" />
                    <span>Atmospheric Headspace Protocol</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {advisory.machine_parameters.nitrogen_flushing_protocol}
                  </p>
                  <div className="text-[11px] text-slate-600 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                    <strong>Science Rationale:</strong> {advisory.food_science_rationale}
                  </div>
                </div>
              )}

              {activeTab === "logistics" && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-amber-600" />
                    <span>Warehousing & Interstate Transit Strategy</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {advisory.storage_logistics_advice}
                  </p>
                </div>
              )}

              {activeTab === "statutory" && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Four-Step Statutory Compliance Roadmap</span>
                  </div>
                  {advisory.regulatory_roadmap.map((step: string, sIdx: number) => (
                    <div key={sIdx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="text-[11.5px] text-slate-700 font-medium leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "rfq" && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Verified Indian Converters & Sourcing</div>
                      <div className="text-[11px] text-slate-500">{advisory.procurement_advice.converters}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(advisory.procurement_advice.rfq_brief)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                    >
                      {copiedRfq ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied RFQ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy RFQ Brief</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-800 leading-relaxed select-all">
                    {advisory.procurement_advice.rfq_brief}
                  </div>

                  <div className="text-[11px] text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200/70">
                    💡 <strong>Commercial Tip:</strong> {advisory.procurement_advice.commercial_tip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
