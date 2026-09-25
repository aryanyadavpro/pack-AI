"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Leaf, ShieldCheck, Award, ChevronRight, CheckCircle2, 
  Thermometer, Droplets, Truck, Layers, Info, ArrowRight, RefreshCw, AlertCircle,
  Wrench, Wind, Package, Copy, Check, Sparkles, ChevronDown, ChevronUp, FileCheck2
} from "lucide-react";
import { fetchCommodities, getPackagingRecommendation } from "@/lib/api";
import { CommoditySummary, RecommendationResponse, CandidateMaterialScore } from "@/lib/types";

export default function RecommendPage() {
  // Food Formulation & Chemistry Parameters (Universal Input for ANY food)
  const [commodityName, setCommodityName] = useState<string>("Bikaneri Bhujia");
  const [category, setCategory] = useState<string>("Bakery & Extruded Snacks");
  const [moisturePct, setMoisturePct] = useState<number>(3.0);
  const [fatPct, setFatPct] = useState<number>(22.0);
  const [phLevel, setPhLevel] = useState<number>(6.2);
  const [waterActivity, setWaterActivity] = useState<number>(0.25);
  const [respirationRate, setRespirationRate] = useState<number>(0.0);

  // Operational parameters
  const [netWeightG, setNetWeightG] = useState<number>(200);
  const [targetDays, setTargetDays] = useState<number>(150);
  const [tempC, setTempC] = useState<number>(35);
  const [rhPct, setRhPct] = useState<number>(75);
  const [nitrogenFlush, setNitrogenFlush] = useState<boolean>(true);
  const [logistics, setLogistics] = useState<string>("Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)");

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [activeAdvisoryTab, setActiveAdvisoryTab] = useState<"machine" | "preservation" | "logistics" | "statutory" | "rfq">("machine");
  const [copiedRfq, setCopiedRfq] = useState<boolean>(false);

  // Category-specific standard calibrated physical chemistry
  const CATEGORY_DEFAULTS: Record<string, { moisture: number; fat: number; ph: number; aw: number; resp: number; temp?: number; days?: number; logistics?: string }> = {
    "Meat, Fish & Proteins": { 
      moisture: 74.0, fat: 4.5, ph: 6.4, aw: 0.98, resp: 0.0, temp: 4, days: 14,
      logistics: "Fragile Insulated Cold Chain (2-8°C Refrigerated Reefer Tempo)"
    },
    "Horticultural Produce & Fruits": { 
      moisture: 88.0, fat: 0.4, ph: 3.8, aw: 0.98, resp: 15.0, temp: 12, days: 15,
      logistics: "Fragile Insulated Cold Chain (2-8°C Refrigerated Reefer Tempo)"
    },
    "Bakery & Extruded Snacks": { 
      moisture: 3.0, fat: 22.0, ph: 6.2, aw: 0.25, resp: 0.0, temp: 35, days: 150,
      logistics: "Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)"
    },
    "Dairy & Plant Milks": { 
      moisture: 54.0, fat: 24.0, ph: 5.9, aw: 0.94, resp: 0.0, temp: 4, days: 20,
      logistics: "Fragile Insulated Cold Chain (2-8°C Refrigerated Reefer Tempo)"
    },
    "Confectionery & Sweets": { 
      moisture: 8.0, fat: 16.0, ph: 6.0, aw: 0.45, resp: 0.0, temp: 25, days: 90,
      logistics: "Standard Urban Distribution (City Logistics / Dark Store E-Commerce)"
    },
    "Pickles, Sauces & Ferments": { 
      moisture: 65.0, fat: 12.0, ph: 3.2, aw: 0.88, resp: 0.0, temp: 35, days: 270,
      logistics: "Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)"
    },
    "Pantry Staples & Grains": { 
      moisture: 11.5, fat: 1.8, ph: 6.4, aw: 0.55, resp: 0.0, temp: 30, days: 180,
      logistics: "Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)"
    },
    "Spices & Dry Powders": { 
      moisture: 8.0, fat: 8.5, ph: 5.5, aw: 0.42, resp: 0.0, temp: 30, days: 365,
      logistics: "Standard Urban Distribution (City Logistics / Dark Store E-Commerce)"
    },
    "Fats, Butters & Oils": { 
      moisture: 0.2, fat: 99.5, ph: 6.5, aw: 0.20, resp: 0.0, temp: 35, days: 270,
      logistics: "Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)"
    },
    "General Food Commodity": { 
      moisture: 20.0, fat: 6.0, ph: 6.0, aw: 0.60, resp: 0.0, temp: 30, days: 90,
      logistics: "Standard Urban Distribution (City Logistics / Dark Store E-Commerce)"
    }
  };

  // Intelligent category and chemistry detector for ANY user typed food
  const inferCategoryAndChemistry = (text: string) => {
    const n = text.toLowerCase().trim();
    if (n.includes("fish") || n.includes("meat") || n.includes("mutton") || n.includes("prawn") || n.includes("chicken") || n.includes("seafood") || n.includes("chevon") || n.includes("rohu")) {
      return { category: "Meat, Fish & Proteins", ...CATEGORY_DEFAULTS["Meat, Fish & Proteins"] };
    }
    if (n.includes("strawberry") || n.includes("strawberries") || n.includes("berry") || n.includes("mango") || n.includes("apple") || n.includes("banana") || n.includes("tomato") || n.includes("fruit") || n.includes("vegetable") || n.includes("onion") || n.includes("chilli")) {
      return { category: "Horticultural Produce & Fruits", ...CATEGORY_DEFAULTS["Horticultural Produce & Fruits"] };
    }
    if (n.includes("paneer") || n.includes("milk") || n.includes("cheese") || n.includes("curd") || n.includes("dahi") || n.includes("yogurt") || n.includes("dairy") || n.includes("khoa") || n.includes("mawa")) {
      return { category: "Dairy & Plant Milks", ...CATEGORY_DEFAULTS["Dairy & Plant Milks"] };
    }
    if (n.includes("ghee") || n.includes("oil") || n.includes("butter") || n.includes("mustard oil") || n.includes("coconut oil")) {
      return { category: "Fats, Butters & Oils", ...CATEGORY_DEFAULTS["Fats, Butters & Oils"] };
    }
    if (n.includes("pickle") || n.includes("achar") || n.includes("sauce") || n.includes("chutney") || n.includes("vinegar") || n.includes("ferment")) {
      return { category: "Pickles, Sauces & Ferments", ...CATEGORY_DEFAULTS["Pickles, Sauces & Ferments"] };
    }
    if (n.includes("tea") || n.includes("coffee") || n.includes("spice") || n.includes("powder") || n.includes("masala") || n.includes("turmeric")) {
      return { category: "Spices & Dry Powders", ...CATEGORY_DEFAULTS["Spices & Dry Powders"] };
    }
    if (n.includes("atta") || n.includes("flour") || n.includes("rice") || n.includes("dal") || n.includes("grain") || n.includes("wheat") || n.includes("besan")) {
      return { category: "Pantry Staples & Grains", ...CATEGORY_DEFAULTS["Pantry Staples & Grains"] };
    }
    if (n.includes("sweet") || n.includes("mithai") || n.includes("chocolate") || n.includes("candy") || n.includes("ladoo") || n.includes("halwa") || n.includes("barfi") || n.includes("kaju katli")) {
      return { category: "Confectionery & Sweets", ...CATEGORY_DEFAULTS["Confectionery & Sweets"] };
    }
    if (n.includes("bhujia") || n.includes("snack") || n.includes("chips") || n.includes("makhana") || n.includes("namkeen") || n.includes("cookie") || n.includes("biscuit") || n.includes("wafer")) {
      return { category: "Bakery & Extruded Snacks", ...CATEGORY_DEFAULTS["Bakery & Extruded Snacks"] };
    }
    return null;
  };

  // Food Archetype Presets for 1-Tap Formulation
  const foodArchetypes = [
    { label: "Fresh Fish / Seafood", name: "Fresh Rohu Fish Fillets", category: "Meat, Fish & Proteins", moisture: 74.0, fat: 4.5, ph: 6.4, aw: 0.98, resp: 0.0, temp: 4, days: 14 },
    { label: "Crispy Bhujia / Snacks", name: "Bikaneri Bhujia", category: "Bakery & Extruded Snacks", moisture: 3.0, fat: 22.0, ph: 6.2, aw: 0.25, resp: 0.0, temp: 35, days: 150 },
    { label: "Fresh Paneer / Dairy", name: "Fresh Malai Paneer", category: "Dairy & Plant Milks", moisture: 54.0, fat: 24.0, ph: 5.9, aw: 0.94, resp: 0.0, temp: 4, days: 20 },
    { label: "Pure Ghee / Oil", name: "Desi Cow Ghee", category: "Fats, Butters & Oils", moisture: 0.2, fat: 99.5, ph: 6.5, aw: 0.20, resp: 0.0, temp: 35, days: 270 },
    { label: "Mango Achar (Acidic)", name: "Traditional Mango Achar", category: "Pickles, Sauces & Ferments", moisture: 65.0, fat: 12.0, ph: 3.2, aw: 0.88, resp: 0.0, temp: 35, days: 270 },
    { label: "Organic Strawberries", name: "Fresh Organic Strawberries", category: "Horticultural Produce & Fruits", moisture: 90.5, fat: 0.3, ph: 3.5, aw: 0.98, resp: 18.0, temp: 12, days: 15 },
    { label: "Roasted Makhana", name: "Spicy Roasted Makhana", category: "Bakery & Extruded Snacks", moisture: 4.0, fat: 14.0, ph: 6.4, aw: 0.28, resp: 0.0, temp: 35, days: 180 },
    { label: "Orthodox Black Tea", name: "Indian Black Tea", category: "Spices & Dry Powders", moisture: 8.0, fat: 2.0, ph: 5.5, aw: 0.40, resp: 0.0, temp: 30, days: 365 }
  ];

  const categories = [
    "Meat, Fish & Proteins",
    "Horticultural Produce & Fruits",
    "Bakery & Extruded Snacks",
    "Dairy & Plant Milks",
    "Confectionery & Sweets",
    "Pickles, Sauces & Ferments",
    "Pantry Staples & Grains",
    "Spices & Dry Powders",
    "Fats, Butters & Oils",
    "General Food Commodity"
  ];

  const handleCommodityNameChange = (newName: string) => {
    setCommodityName(newName);
    const inferred = inferCategoryAndChemistry(newName);
    if (inferred) {
      setCategory(inferred.category);
      setMoisturePct(inferred.moisture);
      setFatPct(inferred.fat);
      setPhLevel(inferred.ph);
      setWaterActivity(inferred.aw);
      setRespirationRate(inferred.resp);
      if (inferred.temp !== undefined) setTempC(inferred.temp);
      if (inferred.days !== undefined) setTargetDays(inferred.days);
      if (inferred.logistics) setLogistics(inferred.logistics);
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const def = CATEGORY_DEFAULTS[newCat];
    if (def) {
      setMoisturePct(def.moisture);
      setFatPct(def.fat);
      setPhLevel(def.ph);
      setWaterActivity(def.aw);
      setRespirationRate(def.resp);
      if (def.temp !== undefined) setTempC(def.temp);
      if (def.days !== undefined) setTargetDays(def.days);
      if (def.logistics) setLogistics(def.logistics);
    }
  };

  const handleApplyArchetype = (arch: typeof foodArchetypes[0]) => {
    setCommodityName(arch.name);
    setCategory(arch.category);
    setMoisturePct(arch.moisture);
    setFatPct(arch.fat);
    setPhLevel(arch.ph);
    setWaterActivity(arch.aw);
    setRespirationRate(arch.resp);
    if (arch.temp !== undefined) setTempC(arch.temp);
    if (arch.days !== undefined) setTargetDays(arch.days);
  };

  // Preset climate selection
  const applyClimatePreset = (preset: "monsoon" | "summer" | "plateau" | "cold") => {
    if (preset === "monsoon") {
      setTempC(32);
      setRhPct(88);
    } else if (preset === "summer") {
      setTempC(42);
      setRhPct(35);
    } else if (preset === "plateau") {
      setTempC(25);
      setRhPct(60);
    } else if (preset === "cold") {
      setTempC(4);
      setRhPct(85);
    }
  };

  // Submit recommendation
  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPackagingRecommendation({
        commodity_name: commodityName,
        commodity_category: category,
        moisture_pct: moisturePct,
        fat_pct: fatPct,
        ph_level: phLevel,
        water_activity: waterActivity,
        respiration_rate: respirationRate,
        package_net_weight_g: netWeightG,
        target_shelf_life_days: targetDays,
        storage_temperature_c: tempC,
        ambient_relative_humidity_pct: rhPct,
        supply_chain_logistics: logistics,
        nitrogen_flushing: nitrogenFlush,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to generate recommendation");
    } finally {
      setLoading(false);
    }
  };

  // Results are only generated when the user clicks the button

  const topRec: CandidateMaterialScore | undefined = result?.top_recommendations[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-14 pb-12 sm:pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-3 shadow-xs">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          Two-Tier Deterministic Recommendation Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Biodegradable Packaging <span className="gradient-text-emerald">Optimizer</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Formulate certified compostable packaging for ANY food product. Enter food chemistry lab values or choose an archetype to calculate allowable OTR & WVTR and rank bioplastic films using TOPSIS MCDM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="paper-card p-6 sm:p-7 rounded-3xl space-y-5">
            <h2 className="text-base font-bold text-[#141928] flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2A45FE] text-xs font-bold text-white">1</span>
              <span>Universal Food Formulation</span>
            </h2>

            {/* Food Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Food Product Name (Any Custom Food)</label>
              <input
                type="text"
                value={commodityName}
                onChange={(e) => handleCommodityNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleOptimize();
                  }
                }}
                placeholder="e.g. Fresh Rohu Fish, Malai Paneer, Strawberries, Roasted Makhana..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Press Enter or click button below to compute</span>
                {commodityName.toLowerCase() === "fish" && (
                  <span className="text-emerald-700 font-semibold">Detected: Meat, Fish & Proteins</span>
                )}
              </div>
            </div>

            {/* Quick Archetype Preset Buttons */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Quick Inspiration Archetypes:</div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-nowrap pb-1">
                {foodArchetypes.map((arch) => (
                  <button
                    key={arch.label}
                    type="button"
                    onClick={() => handleApplyArchetype(arch)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      commodityName === arch.name
                        ? "bg-[#141928] text-white shadow-xs"
                        : "bg-white border border-[#E8E1D5] text-[#546071] hover:text-[#141928] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {arch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Food Matrix Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-slate-900 bg-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Chemistry Controls */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Calibrated Physical Chemistry</span>
                <span className="text-[10px] text-slate-500 font-medium">Editable Lab Values</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Moisture %</div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    className="w-full text-center text-sm font-bold text-slate-900 mt-0.5 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fat %</div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={fatPct}
                    onChange={(e) => setFatPct(Number(e.target.value))}
                    className="w-full text-center text-sm font-bold text-amber-700 mt-0.5 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">pH Level</div>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    value={phLevel}
                    onChange={(e) => setPhLevel(Number(e.target.value))}
                    className="w-full text-center text-sm font-bold text-teal-700 mt-0.5 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Water Act.</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="1.0"
                    value={waterActivity}
                    onChange={(e) => setWaterActivity(Number(e.target.value))}
                    className="w-full text-center text-sm font-bold text-blue-700 mt-0.5 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {category.includes("Horticultural") && (
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Produce Respiration (mg CO2/kg·hr)</span>
                    <span className="text-xs font-bold text-emerald-700">{respirationRate}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={respirationRate}
                    onChange={(e) => setRespirationRate(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              {phLevel <= 4.5 && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>FSSAI Cl. 4(3) Active: Product pH &le; 4.5 requires acid corrosion barrier.</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOptimize}
              disabled={loading}
              className="btn-cobalt w-full flex items-center justify-center gap-2 text-xs py-3.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Computing Barrier Permeabilities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Compute Recommendations for &quot;{commodityName || 'Custom Food'}&quot;</span>
                </>
              )}
            </button>

            {/* Operational Inputs */}
            <div className="pt-2 border-t border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">2</span>
                Package & Shelf-Life Targets
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-semibold">Net Weight</span>
                    <span className="text-emerald-700 font-bold">{netWeightG}g</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={netWeightG}
                    onChange={(e) => setNetWeightG(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-semibold">Target Days</span>
                    <span className="text-emerald-700 font-bold">{targetDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="365"
                    step="15"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Headspace Flushing */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">Nitrogen Headspace Flush</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Displaces O2 to suppress autoxidation</div>
                </div>
                <input
                  type="checkbox"
                  checked={nitrogenFlush}
                  onChange={(e) => setNitrogenFlush(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Climatic Presets */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Indian Climate Regime</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => applyClimatePreset("monsoon")}
                    type="button"
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Monsoon
                  </button>
                  <button
                    onClick={() => applyClimatePreset("summer")}
                    type="button"
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Summer
                  </button>
                  <button
                    onClick={() => applyClimatePreset("plateau")}
                    type="button"
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => applyClimatePreset("cold")}
                    type="button"
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Cold Chain
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                      <span>Temperature</span>
                    </span>
                    <span className="text-sm font-bold text-rose-600">{tempC}°C</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value))}
                    className="w-full accent-rose-500 mt-1 cursor-pointer"
                  />
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Droplets className="h-3.5 w-3.5 text-sky-500" />
                      <span>Humidity</span>
                    </span>
                    <span className="text-sm font-bold text-sky-600">{rhPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="98"
                    value={rhPct}
                    onChange={(e) => setRhPct(Number(e.target.value))}
                    className="w-full accent-sky-500 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Logistics */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Distribution Logistics Stress</label>
                <select
                  value={logistics}
                  onChange={(e) => setLogistics(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
                >
                  <option value="Standard Urban Distribution (City Logistics / Dark Store E-Commerce)">
                    Standard Urban Distribution (City E-Commerce)
                  </option>
                  <option value="Non-AC Truck Cargo (Summer Highway Heat, 35-42°C, Stacking Stress)">
                    Non-AC Truck Cargo (Highway Heat & Drop Stress)
                  </option>
                  <option value="Interstate Indian Rail Freight (Parcel Van, High Drop Height)">
                    Interstate Rail Freight (High Drop Height)
                  </option>
                  <option value="Fragile Insulated Cold Chain (2-8°C Refrigerated Reefer Tempo)">
                    Fragile Insulated Cold Chain (2-8°C Reefer)
                  </option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="btn-cobalt w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Computing Mass Transfer & TOPSIS...</span>
                </>
              ) : (
                <>
                  <Leaf className="h-4 w-4 text-white" />
                  <span>Run PackCraft Formulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Optimization Results & Spec Sheet (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="paper-card p-4 rounded-2xl border-rose-300 bg-rose-50 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {result && topRec && (
            <>
              {/* Active Specification Header Banner */}
              <div className="paper-card p-4 sm:p-5 rounded-2xl border-2 border-[#2A45FE]/30 bg-[#2A45FE]/5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2A45FE]">
                      Active PackCraft Specification Generated For:
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#141928] mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{result.commodity_name}</span>
                      <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {result.commodity_category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Batch: <strong className="text-slate-800">{netWeightG}g</strong> | Target Lifespan: <strong className="text-slate-800">{targetDays} Days</strong> @ {tempC}°C, {rhPct}% RH
                    </div>
                  </div>
                  {result.commodity_name.toLowerCase() !== commodityName.toLowerCase() && (
                    <button
                      type="button"
                      onClick={handleOptimize}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Recalculate for &quot;{commodityName}&quot;</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Calculated Physical Limits Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="manus-glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Allowable WVTR</div>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1">{result.computed_permissible_wvtr}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">g/m²·day limit</div>
                </div>
                <div className="manus-glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Allowable OTR</div>
                  <div className="text-2xl font-extrabold text-amber-700 mt-1">{result.computed_permissible_otr}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">cc/m²·day·atm limit</div>
                </div>
                <div className="manus-glass-card p-4 rounded-2xl col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tier 1 Safety Gate</div>
                  <div className="text-2xl font-extrabold text-teal-700 mt-1">
                    {result.candidates_passed_tier1} / {result.candidates_evaluated}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Passed FSSAI & barrier filters</div>
                </div>
              </div>

              {/* Top 1 Recommendation Spec Sheet */}
              <div className="paper-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#2A45FE] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                      RANK #1 OPTIMAL
                    </span>
                    <span className="rounded-full bg-[#FAF7F2] text-[#141928] px-3.5 py-1 text-xs font-bold border border-[#E8E1D5]">
                      {topRec.polymer_family}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F7D25C]/25 px-3.5 py-1 rounded-full border border-[#F7D25C]">
                    <span className="text-xs text-[#546071] font-semibold">TOPSIS Score:</span>
                    <span className="text-sm font-black text-[#141928]">{(topRec.topsis_closeness_score * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black uppercase text-[#141928] mb-2 leading-tight tracking-tight">
                  {topRec.trade_name}
                </h3>
                
                {/* Visual Multilayer Cross-section (Clean Architectural Spec Box - No Black) */}
                <div className="my-5 p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#141928] mb-2.5 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#2A45FE]" />
                    <span>Engineered Biodegradable Layer Structure</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E8E1D5] text-xs sm:text-sm font-bold text-[#141928] leading-relaxed">
                    {topRec.layer_structure}
                  </div>
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5]">
                    <div className="text-[10px] uppercase font-bold text-[#546071] tracking-wider">Gauge Thickness</div>
                    <div className="text-base font-black text-[#141928] mt-0.5">{topRec.recommended_gauge_thickness_um} µm</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5]">
                    <div className="text-[10px] uppercase font-bold text-[#546071] tracking-wider">Target OTR</div>
                    <div className="text-base font-black text-[#F3A286] mt-0.5">{topRec.target_otr_cc_m2_day_atm}</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5]">
                    <div className="text-[10px] uppercase font-bold text-[#546071] tracking-wider">Target WVTR</div>
                    <div className="text-base font-black text-[#1F8756] mt-0.5">{topRec.target_wvtr_g_m2_day}</div>
                  </div>
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E1D5]">
                    <div className="text-[10px] uppercase font-bold text-[#546071] tracking-wider">Sealing Protocol</div>
                    <div className="text-xs font-bold text-[#141928] mt-1 truncate" title={topRec.sealing_mechanism}>
                      {topRec.sealing_mechanism}
                    </div>
                  </div>
                </div>

                {/* Regulatory Compliance Cards */}
                <div className="space-y-3 pt-4 border-t border-[#E8E1D5] text-xs">
                  <div className="flex items-start gap-2.5 text-[#546071]">
                    <ShieldCheck className="h-4 w-4 text-[#1F8756] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#141928]">Statutory IS 9845 Simulant: </span>
                      <span className="text-[#1F8756] font-bold">{topRec.simulant_prescribed}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-[#546071]">
                    <Award className="h-4 w-4 text-[#2A45FE] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#141928]">FSSAI Regulation: </span>
                      <span className="text-[#141928] font-medium">{topRec.fssai_clause}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-[#546071]">
                    <CheckCircle2 className="h-4 w-4 text-[#1F8756] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#141928]">CPCB Compliance: </span>
                      <span className="text-[#141928] font-medium">{topRec.cpcb_category}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/simulate?commodity=${encodeURIComponent(commodityName)}&thickness=${topRec.recommended_gauge_thickness_um}&otr=${topRec.target_otr_cc_m2_day_atm}&wvtr=${topRec.target_wvtr_g_m2_day}`}
                    className="btn-cobalt inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                  >
                    <span>Simulate Shelf-Life Curves</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/audit?commodity=${encodeURIComponent(commodityName)}&material=${encodeURIComponent(topRec.trade_name)}&thickness=${topRec.recommended_gauge_thickness_um}`}
                    className="btn-ink-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                  >
                    Generate FSSAI Audit Certificate
                  </Link>
                </div>
              </div>

              {/* Detailed Practical Packaging Suggestion & Engineering Advisory */}
              {result.suggestion_advisory && (
                <div className="manus-glass-card p-6 sm:p-7 rounded-3xl border border-sky-300 shadow-md space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                        <Wrench className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-sm sm:text-base font-extrabold text-slate-900">
                          Actionable Packaging & Processing Suggestion
                        </div>
                        <div className="text-xs text-sky-800 font-medium">
                          Industrial engineering parameters for {commodityName} ({netWeightG}g batch)
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
                      <span>Format:</span>
                      <span className="text-slate-900">{result.suggestion_advisory.packaging_format}</span>
                    </div>
                  </div>

                  {/* Food Science Vulnerability & Rationale */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-xs leading-relaxed text-slate-700">
                    <strong className="text-sky-950 font-bold block mb-1">🔬 Food Chemistry & Degradation Rationale:</strong>
                    {result.suggestion_advisory.food_science_rationale}
                  </div>

                  {/* Advisory Tabs (Mobile Swipeable Ribbon) */}
                  <div className="flex overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveAdvisoryTab("machine")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeAdvisoryTab === "machine"
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ⚙️ Machine & Sealing
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdvisoryTab("preservation")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeAdvisoryTab === "preservation"
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      💨 Gas Flushing & MAP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdvisoryTab("logistics")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeAdvisoryTab === "logistics"
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📦 Warehousing & Transit
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdvisoryTab("statutory")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeAdvisoryTab === "statutory"
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📜 Statutory Roadmap
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdvisoryTab("rfq")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeAdvisoryTab === "rfq"
                          ? "bg-white text-sky-900 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🛒 Supplier RFQ
                    </button>
                  </div>

                  {/* Tab Panes */}
                  {activeAdvisoryTab === "machine" && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jaw Temperature</div>
                          <div className="text-base font-extrabold text-sky-700 mt-1">{result.suggestion_advisory.machine_parameters.jaw_temp_c}</div>
                          <div className="text-[11px] text-slate-500 mt-1 leading-snug">{result.suggestion_advisory.machine_parameters.jaw_temp_note}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dwell Time</div>
                          <div className="text-base font-extrabold text-slate-900 mt-1">{result.suggestion_advisory.machine_parameters.dwell_time_s}</div>
                          <div className="text-[11px] text-slate-500 mt-1 leading-snug">{result.suggestion_advisory.machine_parameters.dwell_time_note}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pneumatic Jaw Pressure</div>
                          <div className="text-base font-extrabold text-slate-900 mt-1">{result.suggestion_advisory.machine_parameters.pressure_bar}</div>
                          <div className="text-[11px] text-slate-500 mt-1 leading-snug">{result.suggestion_advisory.machine_parameters.pressure_note}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 bg-sky-50/70 p-3 rounded-xl border border-sky-200 flex items-center gap-2.5">
                        <FileCheck2 className="h-4 w-4 text-sky-600 shrink-0" />
                        <span><strong>Quality Assurance Protocol:</strong> {result.suggestion_advisory.machine_parameters.leak_testing}</span>
                      </div>
                    </div>
                  )}

                  {activeAdvisoryTab === "preservation" && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Wind className="h-4 w-4 text-teal-600" />
                        <span>Headspace Flush & Atmosphere Modification</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {result.suggestion_advisory.machine_parameters.nitrogen_flushing_protocol}
                      </p>
                    </div>
                  )}

                  {activeAdvisoryTab === "logistics" && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-600" />
                        <span>Warehousing & Interstate Transit Strategy</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {result.suggestion_advisory.storage_logistics_advice}
                      </p>
                    </div>
                  )}

                  {activeAdvisoryTab === "statutory" && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Four-Step Statutory Compliance Roadmap</span>
                      </div>
                      {result.suggestion_advisory.regulatory_roadmap.map((step: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs text-slate-700 font-medium leading-relaxed">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeAdvisoryTab === "rfq" && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">Verified Indian Converters & Sourcing</div>
                          <div className="text-[11px] text-slate-500">{result.suggestion_advisory.procurement_advice.converters}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(result.suggestion_advisory.procurement_advice.rfq_brief);
                            setCopiedRfq(true);
                            setTimeout(() => setCopiedRfq(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
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

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed select-all">
                        {result.suggestion_advisory.procurement_advice.rfq_brief}
                      </div>

                      <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        💡 <strong>Commercial Tip:</strong> {result.suggestion_advisory.procurement_advice.commercial_tip}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Runner-up Candidates Table */}
              {result.top_recommendations.length > 1 && (
                <div className="manus-glass-card p-6 rounded-3xl">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <span>Alternative Ranked Bio-Plastics (TOPSIS Closeness)</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="pb-2.5">Rank</th>
                          <th className="pb-2.5">Trade Material</th>
                          <th className="pb-2.5">Thickness</th>
                          <th className="pb-2.5">OTR</th>
                          <th className="pb-2.5">WVTR</th>
                          <th className="pb-2.5 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.top_recommendations.slice(1).map((mat) => (
                          <tr key={mat.rank} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 font-bold text-slate-600">#{mat.rank}</td>
                            <td className="py-2.5 text-slate-900 font-semibold max-w-[200px] truncate" title={mat.trade_name}>
                              {mat.trade_name}
                            </td>
                            <td className="py-2.5 text-slate-700 font-medium">{mat.recommended_gauge_thickness_um} µm</td>
                            <td className="py-2.5 text-amber-700 font-semibold">{mat.target_otr_cc_m2_day_atm}</td>
                            <td className="py-2.5 text-emerald-700 font-semibold">{mat.target_wvtr_g_m2_day}</td>
                            <td className="py-2.5 text-right font-bold text-emerald-700">
                              {(mat.topsis_closeness_score * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
