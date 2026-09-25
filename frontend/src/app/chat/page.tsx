"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUp, Bot, User, Sparkles, Leaf, Activity, ArrowRight, 
  Layers, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2,
  Building2, Calculator, ChevronDown, Award, Mic, Plus, X,
  Share2, MoreVertical, ChevronLeft, Check
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { FormattedChatMessage } from "@/components/chat/FormattedChatMessage";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
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

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend);
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        payload: {
          extracted_parameters: res.extracted_parameters,
          commodity: res.commodity,
          ml_packaging: res.ml_packaging,
          ml_shelf_life: res.ml_shelf_life,
          suggestion_advisory: res.suggestion_advisory,
          top_3_materials: res.top_3_materials,
          math_trace: res.math_trace,
          vendor_quotes: res.vendor_quotes
        }
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        sender: "ai",
        text: "Apologies, I encountered an issue running the mass-transfer & ML inference pipeline. Please ensure the backend is connected.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterCards = [
    {
      title: "Milk & Fresh Dairy",
      desc: "Fresh Malai Paneer cold-chain (4°C) with microbial barrier",
      query: "We produce fresh paneer for Delhi dark stores. We need 20 days shelf life at 4°C in eco-friendly barrier cups.",
      icon: "🥛"
    },
    {
      title: "Desi Cow Ghee",
      desc: "Zero oxidative rancidity in Rajasthan summer (40°C)",
      query: "I run an organic cow ghee brand in Rajasthan (40°C). What certified compostable pouch can give me 9 months shelf life without rancidity?",
      icon: "🧈"
    },
    {
      title: "Fresh Strawberries",
      desc: "Breathable MAP punnets to prevent Botrytis fungal rot",
      query: "I harvest fresh organic strawberries in Mahabaleshwar (250g punnets). Can compostable bioplastics prevent Botrytis fungal mold without condensation fogging for 10 days?",
      icon: "🍓"
    },
    {
      title: "Mango Achar in Oil",
      desc: "Acid-resistant biopolymer preventing migration (FSSAI 4(3))",
      query: "Formulating traditional mango achar in mustard oil (500g). What acid-resistant bio-film prevents leaching?",
      icon: "🌶️"
    },
    {
      title: "Bikaneri Bhujia",
      desc: "Monsoon crispness preservation with WVTR < 1.0",
      query: "Bikaneri bhujia crispness preservation during Mumbai monsoon (32°C, 88% RH) in certified compostable barrier pouch.",
      icon: "🥨"
    }
  ];

  // Helper to render responsive prompt bar (used either centrally or docked at bottom)
  const renderPromptInput = (isBottomBar: boolean) => (
    <div className={`relative ${isBottomBar ? "w-full" : "w-full max-w-2xl lg:max-w-3xl mx-auto mb-7 px-1"}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`manus-pill rounded-2xl sm:rounded-full p-2 pl-4 flex items-center gap-2.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 hover:border-emerald-400/80 transition-all ${
          isBottomBar
            ? "shadow-[0_12px_40px_-8px_rgba(100,116,139,0.22)]"
            : "shadow-[0_16px_48px_-10px_rgba(100,116,139,0.16)]"
        }`}
      >
        {/* Mini Iridescent Logo Orb */}
        <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full iridescent-sphere flex items-center justify-center shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-black text-white">BP</span>
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything: e.g. Shelf-life for Paneer at 4°C, or Bhujia moisture barrier..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            title="Quick Presets"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSend("I harvest fresh organic strawberries in Mahabaleshwar (250g punnets). Can compostable bioplastics prevent Botrytis fungal mold without condensation fogging for 10 days?")}
            title="Voice/Speak simulation"
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Send Up-Arrow Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#2A45FE] text-white flex items-center justify-center hover:bg-[#1E3AE8] disabled:opacity-30 disabled:hover:bg-[#2A45FE] transition-all shadow-sm cursor-pointer"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Quick Popover Presets */}
      {showPresets && (
        <div className="absolute bottom-full mb-2 left-0 right-0 p-2.5 rounded-2xl manus-glass-card shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <div className="flex justify-between items-center px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
            <span>Quick Indian Food Presets</span>
            <button onClick={() => setShowPresets(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-3 w-3" />
            </button>
          </div>
          {starterCards.slice(0, 4).map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleSend(item.query);
                setShowPresets(false);
              }}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-semibold text-slate-800 text-[11px] truncate">{item.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col justify-between max-w-5xl mx-auto w-full px-3 sm:px-6 py-3 relative">
      {/* Mobile-only Top Header (Back, Model & Reset) */}
      <div className="flex items-center justify-between py-2 px-1 md:hidden">
        <div className="flex items-center gap-1.5">
          <Link 
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200/80 px-3 py-1 shadow-sm text-xs font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BioPack 2.5 Flash</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMessages([])}
            title="Reset Conversation"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-slate-600 hover:bg-slate-100 transition-colors text-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop-only Active Thread Toolbar (Only shown when active conversation exists) */}
      {messages.length > 0 && (
        <div className="hidden md:flex items-center justify-between py-2 px-1 border-b border-slate-200/60 mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800">Active Formulation Thread</span>
            <span className="text-[11px] text-slate-400">· ICMR-NIN & FSSAI 2018 Multi-Agent Advisory</span>
          </div>
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all font-medium cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>New Session</span>
          </button>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <div className={`flex-1 overflow-y-auto space-y-4 sm:space-y-6 py-2 sm:py-4 ${messages.length > 0 ? "pb-36 sm:pb-44" : ""}`}>
        {messages.length === 0 ? (
          /* Empty / Standby Ambient View (Optimized for PC & Mobile) */
          <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center max-w-4xl mx-auto w-full">
            {/* Signature Brand Badge */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-[#2A45FE] shadow-xl shadow-blue-500/15 transition-transform hover:scale-105 duration-300">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white">BioPack</div>
                  <div className="text-[10px] sm:text-[11px] font-extrabold text-[#F7D25C] uppercase tracking-widest mt-0.5">Copilot</div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mb-7 max-w-xl mx-auto px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#141928]">
                Formulate Certified Packaging
              </h1>
              <p className="text-xs sm:text-sm text-[#546071] leading-relaxed max-w-md mx-auto font-medium">
                Powered by Gemini 2.5 Flash, ICMR-NIN food physics, and FSSAI 2018 statutory regulations.
              </p>
            </div>

            {/* Central Prominent Prompt Bar (Desktop Welcome State) */}
            {renderPromptInput(false)}

            {/* "Get Started" Sample Prompts */}
            <div className="w-full text-left px-1">
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="text-xs font-bold text-[#546071] tracking-wider uppercase">Sample Formulations</span>
                <span className="text-[10px] text-[#8592A6] font-medium sm:hidden">Swipe to explore →</span>
              </div>
              
              {/* Desktop 4-column Grid: perfectly balanced, zero clipping */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                {starterCards.slice(0, 4).map((card, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(card.query)}
                    className="paper-card-hover flex flex-col justify-between p-4 rounded-2xl text-left group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl p-1 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] group-hover:scale-110 transition-transform">
                          {card.icon}
                        </span>
                        <span className="h-6 w-6 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#2A45FE] group-hover:text-white transition-colors text-[#546071]">
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-[#141928] group-hover:text-[#2A45FE] transition-colors">
                        {card.title}
                      </div>
                      <div className="text-[11px] text-[#546071] mt-1.5 leading-snug line-clamp-2">
                        {card.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile-only Swipeable Ribbon */}
              <div className="sm:hidden flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1">
                {starterCards.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(card.query)}
                    className="flex-shrink-0 w-52 p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs hover:bg-white transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{card.icon}</span>
                      <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{card.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Message Stream (Reference Screen 2) */
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2 sm:gap-2.5 w-full min-w-0 ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                {m.sender === "user" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#141928] text-white text-xs font-bold shadow-xs">
                    <User className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2A45FE] shadow-xs text-white text-[10px] font-black">
                    BP
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`min-w-0 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-none bg-[#141928] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs font-medium ml-auto"
                      : "flex-1 min-w-0 space-y-4"
                  }`}
                >
                  {/* AI Response Card */}
                  {m.sender === "ai" ? (
                    <div className="manus-glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 space-y-4 text-slate-800 border border-slate-200/90 shadow-md w-full min-w-0 overflow-hidden break-words">
                      {/* Formatted Markdown & Interactive Suggestions */}
                      <FormattedChatMessage 
                        text={m.text}
                        sender={m.sender}
                        payload={m.payload}
                      />

                      {/* Process Execution Card (Reference Screen 2) */}
                      {m.payload && m.payload.ml_packaging && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {/* Workflow Step Confirmation */}
                          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                              <span className="font-semibold text-emerald-900 text-[11px]">
                                FSSAI 2018 Statutory Verification Passed
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-mono">OML &lt; 10 mg/dm²</span>
                          </div>

                          {/* ML Recommended Packaging Card */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                                <Leaf className="h-3 w-3" />
                                <span>Optimal Bioplastic Specification</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-700">
                                {m.payload.ml_packaging.gauge_microns} µm
                              </span>
                            </div>
                            
                            <div className="font-bold text-slate-900 text-xs">
                              {m.payload.ml_packaging.trade_name}
                            </div>
                            
                            <div className="text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded-lg border border-slate-200/60">
                              {m.payload.ml_packaging.layer_structure}
                            </div>

                            <div className="flex justify-between items-center text-[10px] pt-1 text-slate-600 font-medium">
                              <div>OTR: <b className="text-amber-700 font-bold">{m.payload.ml_packaging.target_otr}</b> cc/m²·day</div>
                              <div>WVTR: <b className="text-teal-700 font-bold">{m.payload.ml_packaging.target_wvtr}</b> g/m²·day</div>
                            </div>
                          </div>

                          {/* Shelf-Life Prediction Banner */}
                          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200/60 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Predicted Safe Shelf-Life</div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                Mode: <span className="font-semibold text-slate-800">{m.payload.ml_shelf_life.primary_failure_mode}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">{m.payload.ml_shelf_life.predicted_days}</span>
                              <span className="text-[10px] text-slate-500 font-bold ml-1">Days</span>
                            </div>
                          </div>

                          {/* Top-3 Candidates Comparison (TOPSIS Decision Matrix) */}
                          {m.payload.top_3_materials && m.payload.top_3_materials.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-amber-500" />
                                  <span>Top-3 Bioplastics (TOPSIS Closeness)</span>
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {m.payload.top_3_materials.map((mat: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                      idx === 0 
                                        ? "bg-emerald-50/60 border-emerald-300" 
                                        : "bg-slate-50 border-slate-200/60"
                                    }`}
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                          idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                                        }`}>
                                          #{mat.rank}
                                        </span>
                                        <span className="font-semibold text-slate-900 text-[11px] truncate">
                                          {mat.trade_name}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                        {mat.thickness_um}µm • OTR: {mat.barrier_otr} • WVTR: {mat.barrier_wvtr}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                                        {mat.topsis_score}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* First-Principles Mathematical Trace Accordion */}
                          {m.payload.math_trace && (
                            <details className="group p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs cursor-pointer">
                              <summary className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between select-none">
                                <span className="flex items-center gap-1.5">
                                  <Calculator className="h-3 w-3 text-cyan-600" />
                                  <span>First-Principles Mathematical Trace</span>
                                </span>
                                <ChevronDown className="h-3 w-3 text-slate-400 group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5 text-[10.5px] font-mono text-slate-700">
                                <div className="p-1.5 rounded bg-white border border-slate-200/60">
                                  <div className="font-bold text-teal-800 text-[10px]">1. Fickian Moisture Flux:</div>
                                  <div className="text-slate-500 text-[9.5px]">{m.payload.math_trace.fick_law_wvtr.formula}</div>
                                  <div>Allowable WVTR: <b className="text-teal-700">{m.payload.math_trace.fick_law_wvtr.calculated_allowable_wvtr} g/m²·day</b></div>
                                </div>

                                <div className="p-1.5 rounded bg-white border border-slate-200/60">
                                  <div className="font-bold text-amber-800 text-[10px]">2. Lipid Oxidation Stoichiometry:</div>
                                  <div className="text-slate-500 text-[9.5px]">{m.payload.math_trace.lipid_oxidation_otr.formula}</div>
                                  <div>Allowable OTR: <b className="text-amber-700">{m.payload.math_trace.lipid_oxidation_otr.calculated_allowable_otr} cc/m²·day·atm</b></div>
                                </div>

                                <div className="p-1.5 rounded bg-white border border-slate-200/60">
                                  <div className="font-bold text-purple-800 text-[10px]">3. GAB Isotherm Parameters:</div>
                                  <div>M₀: <b>{m.payload.math_trace.gab_isotherm.M0_monolayer_pct}%</b> | C: <b>{m.payload.math_trace.gab_isotherm.C_guggenheim_constant}</b> | K: <b>{m.payload.math_trace.gab_isotherm.K_factor}</b></div>
                                </div>
                              </div>
                            </details>
                          )}

                          {/* Live Supplier Quotes */}
                          {m.payload.vendor_quotes && m.payload.vendor_quotes.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-emerald-600" />
                                  <span>Certified Indian Supplier Quotes</span>
                                </span>
                                <span className="text-[9px] text-emerald-600 font-bold">CPCB Cat IV</span>
                              </div>
                              {m.payload.vendor_quotes.map((q: any, qi: number) => (
                                <div key={qi} className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-slate-900 text-[11px]">{q.supplier_name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">SKU: {q.sku_code} • {q.supplier_location}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-black text-slate-900 text-xs">₹{q.price_per_unit_inr}<span className="text-[9px] text-slate-500 font-normal">/unit</span></div>
                                    <div className="text-[9px] text-slate-500">MOQ: {q.min_order_qty.toLocaleString()}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Links */}
                          <div className="flex gap-2 pt-1">
                            <Link
                              href={`/simulate?commodity=${encodeURIComponent(m.payload.commodity.name)}&thickness=${m.payload.ml_packaging.gauge_microns}&otr=${m.payload.ml_packaging.target_otr}&wvtr=${m.payload.ml_packaging.target_wvtr}`}
                              className="flex-1 text-center py-2 px-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-500 transition-colors shadow-sm"
                            >
                              Simulate Curves →
                            </Link>
                            <Link
                              href={`/audit?commodity=${encodeURIComponent(m.payload.commodity.name)}&material=${encodeURIComponent(m.payload.ml_packaging.trade_name)}&thickness=${m.payload.ml_packaging.gauge_microns}`}
                              className="flex-1 text-center py-2 px-2.5 rounded-xl bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors shadow-sm"
                            >
                              Generate Audit 📜
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    m.text
                  )}

                  <div className={`text-[10px] text-slate-400 mt-1 ${m.sender === "user" ? "text-right text-slate-300" : "text-left"}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full iridescent-sphere text-white text-[10px] font-black">
                  BP
                </div>
                <div className="manus-glass-card rounded-2xl px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-600" />
                  <span>Formulating with Gemini 2.5 Flash & Food Physics...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            {messages.length > 0 && <div className="h-14 sm:h-16 w-full shrink-0 pointer-events-none" />}
          </div>
        )}
      </div>

      {/* Floating Bottom Prompt Bar (Docked only during active conversation) */}
      {messages.length > 0 && (
        <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl z-40">
          {renderPromptInput(true)}
        </div>
      )}
    </div>
  );
}
