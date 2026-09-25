"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Award, Leaf } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // On chat route, hide marketing footer to give full viewport to the copilot
  if (pathname === "/chat") {
    return null;
  }
  return (
    <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-xl text-slate-500 text-xs py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full iridescent-sphere flex items-center justify-center text-[9px] font-black text-white">
                BP
              </div>
              <span className="text-sm font-bold text-slate-900">BioPack AI</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                CPCB Category IV
              </span>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed text-[11px]">
              Deterministic food packaging recommendation and shelf-life prediction engine calibrated for Indian agro-climates, ICMR-NIN IFCT tables, FSSAI (Packaging) Regulations 2018, and IS/ISO 17088 certified compostable bioplastics.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold text-xs mb-2.5">Statutory Standards</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-600" /> FSSAI Packaging Regulations, 2018</li>
              <li className="flex items-center gap-1.5"><Award className="h-3 w-3 text-emerald-600" /> BIS IS/ISO 17088 : 2021 (Compostable)</li>
              <li className="flex items-center gap-1.5"><Award className="h-3 w-3 text-emerald-600" /> BIS IS 9845 : 1998 (Overall Migration)</li>
              <li className="flex items-center gap-1.5"><Award className="h-3 w-3 text-emerald-600" /> CPCB PWM Rules Category IV (Form-VI)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-semibold text-xs mb-2.5">Scientific Foundations</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>ICMR-National Institute of Nutrition (IFCT 2017)</li>
              <li>CSIR-CFTRI Mysore Food Engineering</li>
              <li>CIPHET Postharvest Respiration Studies</li>
              <li>GAB & BET Moisture Sorption Isotherms</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} BioPack AI. Engineered for Indian Agro-Food Processors & MSMEs.</p>
          <div className="flex gap-4">
            <Link href="/recommend" className="hover:text-emerald-600 transition-colors">Recommender</Link>
            <Link href="/simulate" className="hover:text-emerald-600 transition-colors">Simulator</Link>
            <Link href="/chat" className="hover:text-emerald-600 transition-colors">AI Copilot</Link>
            <Link href="/audit" className="hover:text-emerald-600 transition-colors">Audit Certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

