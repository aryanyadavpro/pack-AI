"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  Activity, AlertTriangle, CheckCircle2, Thermometer, Droplets, 
  Layers, ShieldAlert, RefreshCw, TrendingUp, Award, Sparkles,
  Sliders, ChevronDown, ChevronUp, Beaker
} from "lucide-react";
import { runSimulation, fetchBenchmarkComparison } from "@/lib/api";
import { SimulationResponse, ComparisonMatrixResponse } from "@/lib/types";

interface FoodPreset {
  name: string;
  category: string;
  moisture: number;
  fat: number;
  ph: number;
  aw: number;
  respiration?: number;
  otr: number;
  wvtr: number;
  thickness: number;
}

const PRESET_ARCHETYPES: FoodPreset[] = [
  { name: "Bikaneri Bhujia", category: "bakery_snacks", moisture: 1.8, fat: 34.0, ph: 6.2, aw: 0.28, otr: 1.8, wvtr: 0.65, thickness: 65 },
  { name: "Fresh Strawberries", category: "produce", moisture: 91.0, fat: 0.3, ph: 3.5, aw: 0.98, respiration: 45.0, otr: 7500, wvtr: 42, thickness: 35 },
  { name: "Malai Paneer", category: "dairy", moisture: 54.0, fat: 26.0, ph: 6.4, aw: 0.97, otr: 2.0, wvtr: 1.2, thickness: 75 },
  { name: "Desi Cow Ghee", category: "fats_oils", moisture: 0.3, fat: 99.7, ph: 6.5, aw: 0.20, otr: 1.0, wvtr: 0.5, thickness: 70 },
  { name: "Spicy Roasted Makhana", category: "bakery_snacks", moisture: 2.2, fat: 12.0, ph: 6.3, aw: 0.25, otr: 2.5, wvtr: 0.8, thickness: 55 },
  { name: "Traditional Mango Achar", category: "pickles_fermented", moisture: 42.0, fat: 18.0, ph: 3.2, aw: 0.78, otr: 3.0, wvtr: 1.5, thickness: 80 }
];

const CATEGORIES = [
  { id: "produce", label: "Fresh Produce (Fruit & Veg)", defaultAw: 0.98, defaultPh: 4.8 },
  { id: "bakery_snacks", label: "Bakery & Savory Snacks", defaultAw: 0.30, defaultPh: 6.2 },
  { id: "dairy", label: "Dairy & Indian Sweets (Mithai)", defaultAw: 0.95, defaultPh: 6.4 },
  { id: "fats_oils", label: "Edible Oils & Desi Ghee", defaultAw: 0.20, defaultPh: 6.5 },
  { id: "pickles_fermented", label: "Pickles, Sauces & Fermented", defaultAw: 0.80, defaultPh: 3.4 },
  { id: "powders_spices", label: "Spices, Tea & Dry Powders", defaultAw: 0.40, defaultPh: 6.0 },
  { id: "confectionery", label: "Confectionery & Chocolates", defaultAw: 0.45, defaultPh: 6.0 }
];

function SimulateContent() {
  const searchParams = useSearchParams();

  const [commodityName, setCommodityName] = useState<string>(
    searchParams.get("commodity") || "Bikaneri Bhujia"
  );
  const [category, setCategory] = useState<string>("bakery_snacks");

  // Custom Chemistry Formulation
  const [showChemistry, setShowChemistry] = useState<boolean>(false);
  const [moisturePct, setMoisturePct] = useState<number>(1.8);
  const [fatPct, setFatPct] = useState<number>(34.0);
  const [phLevel, setPhLevel] = useState<number>(6.2);
  const [waterActivity, setWaterActivity] = useState<number>(0.28);
  const [respirationRate, setRespirationRate] = useState<number>(0.0);

  // Simulation ambient & barrier controls
  const [tempC, setTempC] = useState<number>(35);
  const [rhPct, setRhPct] = useState<number>(75);
  const [thicknessUm, setThicknessUm] = useState<number>(
    Number(searchParams.get("thickness")) || 65
  );
  const [otr, setOtr] = useState<number>(
    Number(searchParams.get("otr")) || 1.8
  );
  const [wvtr, setWvtr] = useState<number>(
    Number(searchParams.get("wvtr")) || 0.65
  );

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<ComparisonMatrixResponse | null>(null);
  const [activeMetric, setActiveMetric] = useState<"all" | "quality" | "moisture" | "pv">("all");

  const applyPreset = (preset: FoodPreset) => {
    setCommodityName(preset.name);
    setCategory(preset.category);
    setMoisturePct(preset.moisture);
    setFatPct(preset.fat);
    setPhLevel(preset.ph);
    setWaterActivity(preset.aw);
    setRespirationRate(preset.respiration || 0.0);
    setThicknessUm(preset.thickness);
    setOtr(preset.otr);
    setWvtr(preset.wvtr);
  };

  const handleSimulate = async () => {
    if (!commodityName.trim()) return;
    setLoading(true);
    try {
      const [simRes, cmpRes] = await Promise.all([
        runSimulation({
          commodity_name: commodityName,
          commodity_category: category,
          moisture_pct: moisturePct,
          fat_pct: fatPct,
          ph_level: phLevel,
          water_activity: waterActivity,
          respiration_rate: category === "produce" ? respirationRate : 0.0,
          film_thickness_microns: thicknessUm,
          film_otr_cc_m2_day_atm: otr,
          film_wvtr_g_m2_day: wvtr,
          storage_temperature_c: tempC,
          storage_rh_pct: rhPct,
          product_net_weight_g: 200.0
        }),
        fetchBenchmarkComparison(commodityName, tempC, rhPct, 200.0)
      ]);
      setSimResult(simRes);
      setBenchmarkResult(cmpRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSimulateAndMark = async () => {
    setHasSearched(true);
    await handleSimulate();
  };

  useEffect(() => {
    if (hasSearched) {
      handleSimulate();
    }
  }, [commodityName, category, moisturePct, fatPct, phLevel, waterActivity, respirationRate, tempC, rhPct, thicknessUm, otr, wvtr]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-14 pb-12 sm:pb-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-50/90 px-3.5 py-1 text-xs font-semibold text-teal-800 mb-3 shadow-xs">
          <Activity className="h-3.5 w-3.5 text-teal-600" />
          Universal Kinetic Simulation Sandbox
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Dynamic Shelf-Life <span className="gradient-text-emerald">Simulator</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Simulate degradation kinetics for <strong className="text-slate-900 font-semibold">any food product or lab formulation</strong> (GAB moisture sorption, lipid autoxidation, and microbial growth) under harsh temperature and humidity profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="manus-glass-card p-6 sm:p-7 rounded-3xl space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>Simulation Controls</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Any Food Formulation
              </span>
            </h2>

            {/* Presets Chips */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quick Formulation Archetypes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ARCHETYPES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      commodityName.toLowerCase() === p.name.toLowerCase()
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Food Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Food Product Name (Any Custom Recipe)
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                <input
                  type="text"
                  value={commodityName}
                  onChange={(e) => setCommodityName(e.target.value)}
                  placeholder="e.g. Kashmiri Saffron, Roasted Makhana, Artisanal Cheese..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Food Matrix Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  const matched = CATEGORIES.find(c => c.id === newCat);
                  if (matched) {
                    setWaterActivity(matched.defaultAw);
                    setPhLevel(matched.defaultPh);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expandable Custom Chemistry Sliders */}
            <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/60">
              <button
                type="button"
                onClick={() => setShowChemistry(!showChemistry)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Beaker className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Custom Lab Chemistry (M, F, pH, Aw)</span>
                </span>
                {showChemistry ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showChemistry && (
                <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 font-medium">Initial Moisture Content (M₀)</span>
                      <span className="font-bold text-slate-900">{moisturePct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="98"
                      step="0.1"
                      value={moisturePct}
                      onChange={(e) => setMoisturePct(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 font-medium">Lipid / Fat Content (F)</span>
                      <span className="font-bold text-slate-900">{fatPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={fatPct}
                      onChange={(e) => setFatPct(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 font-medium">Product pH Level</span>
                      <span className="font-bold text-slate-900">{phLevel}</span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="9.0"
                      step="0.1"
                      value={phLevel}
                      onChange={(e) => setPhLevel(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 font-medium">Water Activity (Aw)</span>
                      <span className="font-bold text-slate-900">{waterActivity}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.99"
                      step="0.01"
                      value={waterActivity}
                      onChange={(e) => setWaterActivity(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {category === "produce" && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600 font-medium">Respiration Rate (ml O₂/kg·h)</span>
                        <span className="font-bold text-slate-900">{respirationRate}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        value={respirationRate}
                        onChange={(e) => setRespirationRate(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ambient Conditions */}
            <div className="space-y-4 pt-3 border-t border-slate-200">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-rose-500" /> Storage Temp
                  </span>
                  <span className="text-rose-600 font-bold text-sm">{tempC}°C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-sky-500" /> Storage Humidity
                  </span>
                  <span className="text-sky-600 font-bold text-sm">{rhPct}% RH</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={rhPct}
                  onChange={(e) => setRhPct(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Packaging Film Barrier Sliders */}
            <div className="space-y-4 pt-3 border-t border-slate-200">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Film Thickness (Gauge)</span>
                  <span className="text-emerald-700 font-bold text-sm">{thicknessUm} µm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  value={thicknessUm}
                  onChange={(e) => setThicknessUm(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Film OTR (cc/m²·day·atm)</span>
                  <span className="text-amber-700 font-bold text-sm">{otr}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={otr}
                  onChange={(e) => setOtr(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-semibold">Film WVTR (g/m²·day)</span>
                  <span className="text-teal-700 font-bold text-sm">{wvtr}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="25"
                  step="0.2"
                  value={wvtr}
                  onChange={(e) => setWvtr(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateAndMark}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Recalculate Degradation</span>
            </button>
          </div>
        </div>

        {/* Charts & Simulation Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {simResult && (
            <>
              {/* Spoilage Days Alert Card */}
              <div className="manus-glass-card p-6 sm:p-7 rounded-3xl relative overflow-hidden border border-emerald-500/30 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Predicted Shelf-Life for {simResult.commodity_name}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-emerald-700">
                        {simResult.predicted_shelf_life_days}
                      </span>
                      <span className="text-xl font-bold text-slate-700">Days</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {simResult.fssai_safety_verdict}
                    </span>
                    <div className="text-[11px] text-slate-500 font-medium mt-1.5">
                      Model: {simResult.governing_kinetic_model}
                    </div>
                  </div>
                </div>

                {/* Primary Failure Trigger */}
                <div className="mt-5 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">Limiting Spoilage Failure Mode: </span>
                    <span className="text-amber-900 font-bold">{simResult.primary_failure_mode}</span>
                    <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{simResult.critical_threshold_breached}</div>
                  </div>
                </div>
              </div>

              {/* Degradation Curves Chart */}
              <div className="manus-glass-card p-6 sm:p-7 rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Degradation Kinetics Trajectory</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily numerical integration (t = 0 to {simResult.predicted_shelf_life_days + 15} days)</p>
                  </div>

                  {/* Metric Toggle */}
                  <div className="flex overflow-x-auto scrollbar-none flex-nowrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] w-full sm:w-auto">
                    <button
                      onClick={() => setActiveMetric("all")}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeMetric === "all" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      All Curves
                    </button>
                    <button
                      onClick={() => setActiveMetric("quality")}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeMetric === "quality" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      Quality %
                    </button>
                    <button
                      onClick={() => setActiveMetric("moisture")}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeMetric === "moisture" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      Moisture %
                    </button>
                    <button
                      onClick={() => setActiveMetric("pv")}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeMetric === "pv" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      Peroxide Value
                    </button>
                  </div>
                </div>

                {/* Recharts Component */}
                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simResult.degradation_curve} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Storage Days", position: "insideBottomRight", offset: -5, fill: "#64748b", fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.96)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "14px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px", color: "#475569" }} />
                      
                      {(activeMetric === "all" || activeMetric === "quality") && (
                        <Line type="monotone" dataKey="quality_retention_pct" name="Quality Retention %" stroke="#059669" strokeWidth={2.5} dot={false} />
                      )}
                      {(activeMetric === "all" || activeMetric === "moisture") && (
                        <Line type="monotone" dataKey="moisture_pct" name="Moisture Content %" stroke="#0284c7" strokeWidth={2} dot={false} />
                      )}
                      {(activeMetric === "all" || activeMetric === "pv") && (
                        <Line type="monotone" dataKey="peroxide_value_meq_kg" name="Peroxide Value (meq/kg)" stroke="#d97706" strokeWidth={2} dot={false} />
                      )}
                      {activeMetric === "all" && (
                        <Line type="monotone" dataKey="microbial_log_cfu_g" name="Log10 CFU/g" stroke="#e11d48" strokeWidth={1.5} dot={false} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side-by-Side Benchmark Comparison Table */}
              {benchmarkResult && (
                <div className="manus-glass-card p-6 sm:p-7 rounded-3xl">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span>Benchmark Comparison: BioPack vs Banned Polythene</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Under identical temperature ({tempC}°C) and relative humidity ({rhPct}%)</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="pb-2.5">Packaging Material</th>
                          <th className="pb-2.5">Gauge</th>
                          <th className="pb-2.5">Predicted Days</th>
                          <th className="pb-2.5">Delta %</th>
                          <th className="pb-2.5">Primary Failure Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {benchmarkResult.comparisons.map((row, idx) => (
                          <tr key={idx} className={idx === 0 ? "bg-emerald-50/80 font-semibold" : "hover:bg-slate-50/80 transition-colors"}>
                            <td className="py-3 text-slate-900">
                              <div className="flex items-center gap-1.5">
                                {idx === 0 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                <span className={idx === 0 ? "font-bold text-emerald-900" : "font-medium"}>{row.material_label}</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-700">{row.film_thickness_microns} µm</td>
                            <td className="py-3">
                              <span className={`text-sm font-extrabold ${idx === 0 ? "text-emerald-700" : "text-slate-800"}`}>
                                {row.predicted_shelf_life_days}d
                              </span>
                            </td>
                            <td className="py-3">
                              {row.shelf_life_delta_pct === 0 ? (
                                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">Baseline</span>
                              ) : (
                                <span className="text-rose-600 font-bold">{row.shelf_life_delta_pct}%</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-600 max-w-[220px] truncate" title={row.primary_failure_mode}>
                              {row.primary_failure_mode}
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

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading kinetic simulation sandbox...</div>}>
      <SimulateContent />
    </Suspense>
  );
}
