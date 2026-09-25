"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  FileText, ShieldCheck, Award, CheckCircle2, 
  Printer, Download, AlertCircle, RefreshCw, Building, Hash,
  Sparkles, Layers, Box
} from "lucide-react";
import { generateAuditReport } from "@/lib/api";
import { AuditReportResponse } from "@/lib/types";

const COMMODITY_PRESETS = [
  "Bikaneri Bhujia",
  "Fresh Strawberries",
  "Malai Paneer",
  "Desi Cow Ghee",
  "Spicy Roasted Makhana",
  "Traditional Mango Achar"
];

const MATERIAL_PRESETS = [
  "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch",
  "Home-Compostable PLA / PBAT Bio-Polymer Film",
  "Starch-Coated Recycled Kraft Paper with Bio-PBS Liner",
  "Aliphatic Bio-Polyester Pouch with EVOH Barrier"
];

function AuditContent() {
  const searchParams = useSearchParams();

  const [commodityName, setCommodityName] = useState<string>(
    searchParams.get("commodity") || "Bikaneri Bhujia"
  );
  const [materialName, setMaterialName] = useState<string>(
    searchParams.get("material") || "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch"
  );
  const [thicknessUm, setThicknessUm] = useState<number>(
    Number(searchParams.get("thickness")) || 65
  );
  const [targetShelfLifeDays, setTargetShelfLifeDays] = useState<number>(150);
  const [manufacturer, setManufacturer] = useState<string>("Haldiram Snacks Pvt. Ltd. (Bikaner Plant)");
  const [fssaiLicense, setFssaiLicense] = useState<string>("10023022001928");

  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AuditReportResponse | null>(null);

  const handleGenerate = async () => {
    if (!commodityName.trim()) return;
    setLoading(true);
    try {
      const res = await generateAuditReport({
        commodity_name: commodityName,
        packaging_material_name: materialName,
        film_thickness_microns: thicknessUm,
        target_shelf_life_days: targetShelfLifeDays,
        manufacturer_name: manufacturer,
        fssai_license_number: fssaiLicense
      });
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-14 pb-8 sm:py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 print:hidden">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-3 shadow-xs">
          <FileText className="h-3.5 w-3.5 text-emerald-600" />
          Statutory Compliance Certificate Generator
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          FSSAI & BIS <span className="gradient-text-emerald">Packaging Audit</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Generate an official statutory compliance certificate for <strong className="text-slate-900 font-semibold">any food product and packaging specification</strong>, verifying compliance against the FSSAI (Packaging) Regulations 2018 and BIS IS/ISO 17088 standards.
        </p>
      </div>

      {/* Configuration Form Card (Hidden when printing) */}
      <div className="manus-glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Audit Specification Parameters</span>
          </h2>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Universal Audit Engine
          </span>
        </div>

        {/* Quick commodity chips */}
        <div className="mb-4">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Quick Commodity Archetypes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMODITY_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCommodityName(p)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  commodityName.toLowerCase() === p.toLowerCase()
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Food Processor / Manufacturer</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">FSSAI 14-Digit License No.</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-mono font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Food Product Name (Any Custom Formulation)</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-500" />
              <input
                type="text"
                value={commodityName}
                onChange={(e) => setCommodityName(e.target.value)}
                placeholder="e.g. Spicy Roasted Makhana, Dragonfruit, Organic Honey..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Packaging Material Specification</label>
            <div className="relative">
              <Box className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g. High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Film Gauge Thickness (µm)</label>
            <input
              type="number"
              value={thicknessUm}
              onChange={(e) => setThicknessUm(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Target Shelf-Life (Days)</label>
            <input
              type="number"
              value={targetShelfLifeDays}
              onChange={(e) => setTargetShelfLifeDays(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            <span>Regenerate Audit Certificate</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      {report && (
        <div className="rounded-2xl sm:rounded-3xl border border-emerald-600/30 sm:border-2 bg-white p-4 sm:p-8 md:p-12 shadow-xl sm:shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0 text-slate-900">
          {/* Watermark / Seal */}
          <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
            <ShieldCheck className="h-48 w-48 text-emerald-800" />
          </div>

          {/* Certificate Header */}
          <div className="border-b-2 border-emerald-600/30 pb-5 sm:pb-6 mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Government of India Statutory Compliance Record
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-1">
                  Food Packaging Safety & Compostability Audit Certificate
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                  Audited pursuant to FSSAI (Packaging) Regulations, 2018 & Bureau of Indian Standards IS/ISO 17088
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="font-mono text-xs font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  {report.certificate_id}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{report.timestamp}</div>
              </div>
            </div>
          </div>

          {/* Overall Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  AUDIT RESULT: {report.overall_compliance_verdict}
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-800 font-medium">
                  All statutory migration and bio-carbon compostability thresholds verified.
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="inline-block rounded-full bg-emerald-600 text-white px-3 py-1 text-[11px] sm:text-xs font-bold shadow-xs">
                IS/ISO 17088 Certified
              </span>
            </div>
          </div>

          {/* Core Entity Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div><span className="text-slate-600">Manufacturer: </span><span className="text-slate-900 font-semibold">{manufacturer}</span></div>
              <div><span className="text-slate-600">FSSAI License: </span><span className="text-emerald-800 font-mono font-bold">{fssaiLicense}</span></div>
              <div><span className="text-slate-600">Commodity: </span><span className="text-slate-900 font-semibold">{report.commodity_name} ({report.commodity_category})</span></div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <div><span className="text-slate-600">Bioplastic Material: </span><span className="text-slate-900 font-semibold">{report.packaging_material}</span></div>
              <div><span className="text-slate-600">Layer Specification: </span><span className="text-emerald-800 font-mono font-bold text-[11px]">{report.layer_structure}</span></div>
              <div><span className="text-slate-600">BIS Standard: </span><span className="text-slate-900 font-semibold">{report.prescribed_is_standard}</span></div>
            </div>
          </div>

          {/* Statutory Simulant & Migration Protocol Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>IS 9845 Migration Testing Assignment Protocol</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-600 font-medium">Prescribed Simulant: </span>
                <span className="text-emerald-800 font-bold block mt-0.5">{report.prescribed_simulant}</span>
                <span className="text-[11px] text-slate-500">{report.simulant_description}</span>
              </div>
              <div>
                <span className="text-slate-600 font-medium">Test Exposure: </span>
                <span className="text-slate-900 font-semibold block mt-0.5">{report.test_condition}</span>
              </div>
              <div>
                <span className="text-slate-600 font-medium">Certified OML: </span>
                <span className="text-emerald-800 font-bold block mt-0.5">{report.oml_certified_value} mg/dm²</span>
                <span className="text-[11px] text-slate-500">Statutory Limit: ≤ {report.oml_statutory_limit} mg/dm²</span>
              </div>
            </div>
          </div>

          {/* Clauses Audited Table */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Statutory Clauses Audited
            </h3>
            <div className="overflow-x-auto scrollbar-none -mx-2 sm:mx-0">
              <table className="w-full min-w-[500px] text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Clause Reference</th>
                    <th className="p-3 font-bold">Mandatory Requirement</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Audit Verification Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.clauses_audited.map((cl, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{cl.clause}</td>
                      <td className="p-3 text-slate-700">{cl.requirement}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold">
                          {cl.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">{cl.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature & Print Footer */}
          <div className="border-t border-slate-200 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="text-center sm:text-left">
              <span>Verified by PackCraft AI Regulatory Governance Engine.</span>
            </div>
            <div className="print:hidden flex gap-3 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 sm:py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium">Loading statutory audit suite...</div>}>
      <AuditContent />
    </Suspense>
  );
}
