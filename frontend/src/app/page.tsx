import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  FileCheck,
  Star
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#141928] overflow-hidden">
      {/* Side Framing Pillars (Poster Look from Halo Lab reference) */}
      <div className="fixed inset-y-0 left-0 w-3 sm:w-6 md:w-10 bg-[#FCEEE9] border-r border-[#F0DCD4] z-20 pointer-events-none" />
      <div className="fixed inset-y-0 right-0 w-3 sm:w-6 md:w-10 bg-[#FCEEE9] border-l border-[#F0DCD4] z-20 pointer-events-none" />

      {/* Main Content Canvas */}
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-20">
        
        {/* Central Vertical Retro Tri-Color Stripe (Drops through hero) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-[580px] w-6 pointer-events-none -z-0 opacity-90">
          <div className="w-2 h-full bg-[#F7D25C]" />
          <div className="w-2 h-full bg-[#F3A286]" />
          <div className="w-2 h-full bg-[#70C5E2]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-6 sm:pt-10 pb-16 text-center z-10">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#141928] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#141928] shadow-xs mb-8">
            <span className="text-[#2A45FE]">✱</span>
            <span>Packaging Performance Platform</span>
            <span className="text-[#2A45FE]">✱</span>
          </div>

          {/* Yellow Sunburst Sticker (Top Right Floating Badge) */}
          <div className="hidden lg:flex absolute top-4 right-8 flex-col items-center justify-center h-28 w-28 rounded-full bg-[#F7D25C] text-[#141928] shadow-md border-2 border-dashed border-[#141928]/40 rotate-12 hover:rotate-6 transition-transform select-none">
            <span className="text-[10px] font-black uppercase tracking-tight">FSSAI 2018</span>
            <span className="text-xs font-extrabold uppercase">CERTIFIED</span>
            <span className="text-[9px] font-bold tracking-widest text-[#141928]/70">IS/ISO 17088</span>
          </div>

          {/* Wireframe Grid SVG in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] -z-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g stroke="#141928" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.25">
                <line x1="100" y1="50" x2="700" y2="50" />
                <line x1="50" y1="120" x2="750" y2="120" />
                <line x1="20" y1="200" x2="780" y2="200" />
                <line x1="50" y1="280" x2="750" y2="280" />
                <line x1="100" y1="350" x2="700" y2="350" />
                <line x1="200" y1="30" x2="160" y2="370" />
                <line x1="300" y1="30" x2="280" y2="370" />
                <line x1="400" y1="30" x2="400" y2="370" />
                <line x1="500" y1="30" x2="520" y2="370" />
                <line x1="600" y1="30" x2="640" y2="370" />
              </g>
            </svg>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[#141928] leading-[0.95] max-w-4xl mx-auto my-4">
            Packaging <br />
            That Works <br />
            <span className="relative inline-block text-[#141928]">
              For You
              {/* Subtle underline stroke */}
              <span className="absolute bottom-1 left-0 w-full h-2.5 bg-[#2A45FE]/15 -z-10 rounded-sm" />
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#4E5868] max-w-xl mx-auto font-medium leading-relaxed">
            Universal formulation engine for Indian agro-food commodities. Calculate barrier specifications (OTR, WVTR, gauge), simulate kinetic shelf-life, and enforce statutory FSSAI compliance without guesswork.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto sm:max-w-none">
            <Link
              href="/chat"
              className="btn-cobalt inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-bold w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch AI Assistant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/recommend"
              className="btn-ink-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold w-full sm:w-auto"
            >
              <Compass className="h-4 w-4 text-[#2A45FE]" />
              <span>Packaging Wizard</span>
            </Link>
            <Link
              href="/simulate"
              className="btn-ink-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold w-full sm:w-auto"
            >
              <Activity className="h-4 w-4 text-[#F3A286]" />
              <span>Simulate Curves</span>
            </Link>
          </div>

          {/* Social Proof & Floating Quotes (Halo Lab Style) */}
          <div className="mt-14 pt-8 border-t border-[#E8E1D5] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Left Testimonial Pill */}
            <div className="flex items-center gap-3.5 text-left bg-white p-3.5 rounded-2xl border border-[#E8E1D5] shadow-xs">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#F3A286] flex items-center justify-center text-white font-bold text-xs">
                🌾
              </div>
              <div>
                <p className="text-xs italic text-[#141928] font-semibold leading-snug">
                  &ldquo;Saved 4.2 tons of banned multi-layer plastics across our extruded snacks.&rdquo;
                </p>
                <span className="text-[10px] text-[#697586] font-medium">— Gujarat Snack Processor</span>
              </div>
            </div>

            {/* Center Royal Cobalt Metric Block (The "720+" style in Image 3) */}
            <div className="bg-[#2A45FE] text-white p-6 rounded-3xl shadow-lg shadow-blue-500/15 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                +380%
              </div>
              <div className="text-xs uppercase font-extrabold tracking-wider mt-1.5 text-white/90">
                Shelf-Life vs Single-Use Plastic
              </div>
              <div className="text-[11px] text-white/75 mt-1 font-medium">
                Certified Compostable Barrier Laminates
              </div>
            </div>

            {/* Right Review Stars Chip */}
            <div className="flex items-center gap-3.5 text-left bg-white p-3.5 rounded-2xl border border-[#E8E1D5] shadow-xs">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#D4BBFC] flex items-center justify-center text-[#141928] font-bold text-xs">
                🔬
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[#F7D25C] mb-0.5">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <p className="text-xs font-bold text-[#141928]">
                  5,000+ FSSAI Verified Samples
                </p>
                <span className="text-[10px] text-[#697586]">Trained ML Regressors &amp; TOPSIS</span>
              </div>
            </div>

          </div>

        </section>

        {/* Feature Grid with Tactile Cards (No Neon Blur Blobs) */}
        <section className="py-10 border-t border-[#E8E1D5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2A45FE]">
                <span>✱</span>
                <span>Deterministic Food Science</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#141928] tracking-tight uppercase mt-1">
                Engineered for Indian Food MSMEs
              </h2>
            </div>
            <Link 
              href="/recommend"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A45FE] hover:underline"
            >
              <span>Explore Recommender Engine</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Mass Transfer */}
            <div className="paper-card-hover p-7 rounded-3xl relative">
              <div className="h-11 w-11 rounded-2xl bg-[#70C5E2]/20 border border-[#70C5E2] flex items-center justify-center mb-5">
                <Layers className="h-5 w-5 text-[#141928]" />
              </div>
              <h3 className="text-base font-extrabold text-[#141928] uppercase tracking-tight mb-2">
                1. Mass Transfer Physics
              </h3>
              <p className="text-xs text-[#4E5868] leading-relaxed font-medium">
                Solves Fickian moisture diffusion for hygroscopic snacks, peroxide oxygen stoichiometry for roasted nuts and oils, and Arrhenius respiration kinetics for horticultural produce.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E1D5] flex items-center gap-2 text-[11px] font-bold text-[#141928]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1F8756]" />
                <span>Exact WVTR &amp; OTR Target Calculations</span>
              </div>
            </div>

            {/* Card 2: Regulatory Safety Gate */}
            <div className="paper-card-hover p-7 rounded-3xl relative border-[#2A45FE]/40">
              <div className="h-11 w-11 rounded-2xl bg-[#F7D25C]/30 border border-[#F7D25C] flex items-center justify-center mb-5">
                <ShieldCheck className="h-5 w-5 text-[#141928]" />
              </div>
              <h3 className="text-base font-extrabold text-[#141928] uppercase tracking-tight mb-2">
                2. Statutory FSSAI Gates
              </h3>
              <p className="text-xs text-[#4E5868] leading-relaxed font-medium">
                Automatically checks FSSAI Packaging Regulations 2018 (acid food contact, OML &le; 10 mg/dm&sup2; under IS 9845) and filters only CPCB Category IV certified compostable polymers.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E1D5] flex items-center gap-2 text-[11px] font-bold text-[#141928]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1F8756]" />
                <span>BIS IS/ISO 17088 Simulants Prescribed</span>
              </div>
            </div>

            {/* Card 3: Dynamic Simulation */}
            <div className="paper-card-hover p-7 rounded-3xl relative">
              <div className="h-11 w-11 rounded-2xl bg-[#F3A286]/30 border border-[#F3A286] flex items-center justify-center mb-5">
                <TrendingUp className="h-5 w-5 text-[#141928]" />
              </div>
              <h3 className="text-base font-extrabold text-[#141928] uppercase tracking-tight mb-2">
                3. Kinetic Solver &amp; Audit
              </h3>
              <p className="text-xs text-[#4E5868] leading-relaxed font-medium">
                Generates day-by-day deterioration curves across storage temperature and humidity, pinpointing the primary failure mechanism and exporting one-click printable audit certificates.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8E1D5] flex items-center gap-2 text-[11px] font-bold text-[#141928]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1F8756]" />
                <span>730-Day Multi-Curve Benchmarks</span>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Statutory Compliance Banner */}
        <section className="mt-6 p-6 rounded-3xl bg-white border border-[#E8E1D5] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-10 w-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex items-center justify-center text-[#2A45FE] shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#141928] uppercase tracking-tight">
                Need a Statutory Compliance Certificate for Retail?
              </h4>
              <p className="text-xs text-[#697586] font-medium">
                Generate an official audit document with prescribed BIS IS 9845 simulants and unique Certificate ID.
              </p>
            </div>
          </div>
          <Link
            href="/audit"
            className="btn-cobalt px-5 py-2.5 text-xs font-bold whitespace-nowrap shrink-0"
          >
            Generate Certificate &rarr;
          </Link>
        </section>

      </div>
    </div>
  );
}
