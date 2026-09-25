"use client";

import Link from "next/link";
import { Sparkles, Leaf, Activity, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CommoditiesRedirectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-6 shadow-xs">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        Universal Formulation & Barrier Engine
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
        Formulate Packaging for <br />
        <span className="gradient-text-emerald">Any Custom Food Product</span>
      </h1>

      <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
        The database catalog has transitioned into a <strong className="text-slate-900 font-semibold">universal first-principles solver</strong>. The training CSV dataset is now embedded directly inside the AI models. You can test, simulate, and certify <strong className="text-slate-900 font-semibold">any food product, recipe, or custom lab chemistry</strong> directly in the platform.
      </p>

      {/* Feature Navigation Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
        <Link
          href="/recommend"
          className="manus-glass-card p-6 rounded-3xl hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Packaging Wizard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter any custom food name, moisture %, fat %, and pH to compute certified biopolymer barrier recommendations.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-emerald-700 gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Configure Recipe</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/chat"
          className="manus-glass-card p-6 rounded-3xl hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">AI Copilot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conversational reasoning that predicts food chemistry and compliance for any regional or artisanal delicacy.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-slate-900 gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Ask AI Assistant</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/simulate"
          className="manus-glass-card p-6 rounded-3xl hover:border-purple-500 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 mb-4 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Shelf-Life Simulator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulate GAB sorption and rancidity kinetics for any custom formulation under harsh Indian ambient profiles.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-purple-700 gap-1.5 group-hover:translate-x-1 transition-transform">
            <span>Run Kinetic Solver</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      <div className="mt-12 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600 border border-slate-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span>Universal First-Principles Chemistry Solver Active — Zero Hardcoded Food Database Constraints</span>
      </div>
    </div>
  );
}
