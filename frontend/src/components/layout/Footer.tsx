"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Award } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // On chat route, hide marketing footer to give full viewport to the copilot
  if (pathname === "/chat") {
    return null;
  }
  return (
    <footer className="border-t border-[#E8E1D5] bg-[#FAF7F2] text-[#546071] text-xs py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#2A45FE] flex items-center justify-center text-[10px] font-black text-white">
                BP
              </div>
              <span className="text-sm font-black text-[#141928] tracking-tight">BioPack AI</span>
              <span className="text-[10px] bg-[#F7D25C]/30 text-[#141928] border border-[#F7D25C] px-2 py-0.5 rounded-full font-bold">
                CPCB Category IV
              </span>
            </div>
            <p className="text-[#546071] max-w-md leading-relaxed text-[11px] font-medium">
              Deterministic food packaging recommendation and shelf-life prediction engine calibrated for Indian agro-climates, ICMR-NIN IFCT tables, FSSAI (Packaging) Regulations 2018, and IS/ISO 17088 certified compostable bioplastics.
            </p>
          </div>

          <div>
            <h4 className="text-[#141928] font-bold text-xs uppercase tracking-wider mb-3">Statutory Standards</h4>
            <ul className="space-y-2 text-[11px] font-medium">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#1F8756]" /> FSSAI Packaging Regulations, 2018</li>
              <li className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-[#2A45FE]" /> BIS IS/ISO 17088 : 2021 (Compostable)</li>
              <li className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-[#2A45FE]" /> BIS IS 9845 : 1998 (Overall Migration)</li>
              <li className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-[#2A45FE]" /> CPCB PWM Rules Category IV (Form-VI)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#141928] font-bold text-xs uppercase tracking-wider mb-3">Scientific Foundations</h4>
            <ul className="space-y-2 text-[11px] font-medium">
              <li>ICMR-National Institute of Nutrition (IFCT 2017)</li>
              <li>CSIR-CFTRI Mysore Food Engineering</li>
              <li>CIPHET Postharvest Respiration Studies</li>
              <li>GAB &amp; BET Moisture Sorption Isotherms</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E8E1D5] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium">
          <p>© {new Date().getFullYear()} BioPack AI. Engineered for Indian Agro-Food Processors &amp; MSMEs.</p>
          <div className="flex gap-4 font-bold text-[#141928]">
            <Link href="/recommend" className="hover:text-[#2A45FE] transition-colors">Recommender</Link>
            <Link href="/simulate" className="hover:text-[#2A45FE] transition-colors">Simulator</Link>
            <Link href="/chat" className="hover:text-[#2A45FE] transition-colors">AI Copilot</Link>
            <Link href="/audit" className="hover:text-[#2A45FE] transition-colors">Audit Certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
