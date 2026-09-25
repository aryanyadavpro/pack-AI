import {
  CommoditySummary,
  CommodityDetail,
  PackagingRequirementRequest,
  RecommendationResponse,
  SimulationRequest,
  SimulationResponse,
  ComparisonMatrixResponse,
  AuditReportResponse
} from "./types";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").endsWith("/api/v1")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${rawApiUrl.replace(/\/+$/, "")}/api/v1`;

export async function fetchCommodities(category?: string, search?: string): Promise<CommoditySummary[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE_URL}/commodities?${params.toString()}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch commodities");
  return res.json();
}

export async function fetchCommodityById(id: number): Promise<CommodityDetail> {
  const res = await fetch(`${API_BASE_URL}/commodities/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch commodity details");
  return res.json();
}

export async function getPackagingRecommendation(req: PackagingRequirementRequest): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate recommendation");
  }
  return res.json();
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run simulation");
  }
  return res.json();
}

export async function fetchBenchmarkComparison(
  commodityName: string,
  storageTempC: number = 35.0,
  storageRhPct: number = 75.0,
  productWeightG: number = 200.0
): Promise<ComparisonMatrixResponse> {
  const params = new URLSearchParams({
    commodity_name: commodityName,
    storage_temp_c: storageTempC.toString(),
    storage_rh_pct: storageRhPct.toString(),
    product_net_weight_g: productWeightG.toString()
  });

  const res = await fetch(`${API_BASE_URL}/simulate/compare?${params.toString()}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch benchmark comparison");
  return res.json();
}

export async function generateAuditReport(payload: {
  commodity_name: string;
  packaging_material_name: string;
  film_thickness_microns: number;
  target_shelf_life_days: number;
  manufacturer_name?: string;
  fssai_license_number?: string;
}): Promise<AuditReportResponse> {
  const res = await fetch(`${API_BASE_URL}/audit/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate statutory audit report");
  }
  return res.json();
}

export async function sendChatMessage(message: string): Promise<{
  text: string;
  extracted_parameters: any;
  commodity: any;
  ml_packaging: any;
  ml_shelf_life: any;
  suggestion_advisory?: any;
  top_3_materials?: any[];
  math_trace?: any;
  vendor_quotes?: any[];
}> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to process chat message");
  }
  return res.json();
}

