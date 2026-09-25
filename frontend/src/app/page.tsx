import Link from "next/link";
import { Leaf, ShieldCheck, Activity, Award, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pb-12">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] iridescent-orb pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 text-center">
        {/* Regulatory Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-md mb-6">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>FSSAI Packaging Regulations 2018 & BIS IS/ISO 17088</span>
        </div>

        {/* Central Iridescent Orb Mini Showcase */}
        <div className="flex justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full iridescent-sphere shadow-xl animate-bounce duration-1000">
            <span className="text-white font-black text-xl">BP</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Intelligent Biodegradable <br />
          <span className="gradient-text-iridescent">Food Packaging Engine</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Formulate packaging for any food product or custom lab chemistry. Compute certified compostable barrier specifications (OTR, WVTR, gauge) and kinetic shelf-life simulations in real time.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
          <Link
            href="/chat"
            className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-slate-900 px-6 py-3.5 sm:py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>Launch AI Copilot</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/recommend"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-slate-200 bg-white px-6 py-3.5 sm:py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition-all hover:scale-105"
          >
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span>Packaging Wizard</span>
          </Link>
          <Link
            href="/simulate"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-slate-200 bg-white px-6 py-3.5 sm:py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition-all hover:scale-105"
          >
            <Activity className="h-4 w-4 text-purple-600" />
            <span>Simulate Curves</span>
          </Link>
        </div>

        {/* Metric Callouts */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="manus-glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-emerald-600">+380%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Shelf-Life vs Basic LDPE</div>
          </div>
          <div className="manus-glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-slate-900">Universal</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Any Food / Custom Chemistry</div>
          </div>
          <div className="manus-glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-amber-600">&lt; 10 mg/dm²</div>
            <div className="text-[11px] text-slate-500 mt-0.5">OML Migration (IS 9845)</div>
          </div>
          <div className="manus-glass-card p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-teal-600">100%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">CPCB Category IV Certified</div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 border-t border-slate-200/60">
        <div className="text-center mb-10">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Deterministic Architecture</h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Two-Tier Decision & Simulation Engine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Mass Transfer */}
          <div className="manus-glass-card p-6 rounded-3xl relative hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Deterministic Mass Transfer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes exact permissible WVTR using Fickian moisture diffusion, OTR from peroxide stoichiometry for snacks & oils, and Arrhenius MAP gas transmission for produce.
            </p>
          </div>

          {/* Card 2: Two Tier Filter */}
          <div className="manus-glass-card p-6 rounded-3xl relative border-emerald-300 shadow-md">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Two-Tier MCDM Pipeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tier 1 enforces mandatory FSSAI 2018 acid leaching and OML &lt; 10 mg/dm² rules. Tier 2 uses TOPSIS Euclidean vector distance to rank certified bioplastics.
            </p>
          </div>

          {/* Card 3: Dynamic Simulation */}
          <div className="manus-glass-card p-6 rounded-3xl relative hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Dynamic Kinetic Solver</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrates multi-day decay curves for moisture sorption, lipid rancidity, and microbial proliferation, identifying the primary limiting failure mechanism and days until spoilage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

