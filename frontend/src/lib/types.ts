export interface CommoditySummary {
  id: number;
  name: string;
  category: string;
  ifct_code?: string | null;
  moisture_pct: number;
  fat_pct: number;
  ph_level: number;
  water_activity: number;
  respiration_rate: number;
}

export interface CommodityDetail extends CommoditySummary {
  critical_moisture_pct: number;
  critical_pv_meq_kg?: number | null;
  description?: string | null;
}

export interface PackagingRequirementRequest {
  commodity_name: string;
  commodity_category?: string;
  moisture_pct?: number;
  fat_pct?: number;
  ph_level?: number;
  water_activity?: number;
  respiration_rate?: number;
  critical_moisture_pct?: number;
  critical_pv_meq_kg?: number;
  package_net_weight_g: number;
  package_surface_area_m2?: number | null;
  target_shelf_life_days: number;
  storage_temperature_c: number;
  ambient_relative_humidity_pct: number;
  supply_chain_logistics?: string;
  nitrogen_flushing?: boolean;
}

export interface CandidateMaterialScore {
  rank: number;
  trade_name: string;
  polymer_family: string;
  layer_structure: string;
  recommended_gauge_thickness_um: number;
  target_otr_cc_m2_day_atm: number;
  target_wvtr_g_m2_day: number;
  topsis_closeness_score: number;
  sealing_mechanism: string;
  mechanical_strength_requirement: string;
  fssai_clause: string;
  prescribed_bis_is_standard: string;
  simulant_prescribed: string;
  cpcb_category: string;
  commercial_reference?: string | null;
}

export interface RecommendationResponse {
  commodity_name: string;
  commodity_category: string;
  computed_permissible_wvtr: number;
  computed_permissible_otr: number;
  map_gas_recommended?: string | null;
  candidates_evaluated: number;
  candidates_passed_tier1: number;
  top_recommendations: CandidateMaterialScore[];
  suggestion_advisory?: any;
}

export interface DegradationDataPoint {
  day: number;
  moisture_pct: number;
  peroxide_value_meq_kg: number;
  microbial_log_cfu_g: number;
  quality_retention_pct: number;
}

export interface SimulationRequest {
  commodity_name: string;
  commodity_category?: string;
  moisture_pct?: number;
  fat_pct?: number;
  ph_level?: number;
  water_activity?: number;
  respiration_rate?: number;
  critical_moisture_pct?: number;
  critical_pv_meq_kg?: number;
  packaging_material_name?: string;
  film_thickness_microns: number;
  film_otr_cc_m2_day_atm: number;
  film_wvtr_g_m2_day: number;
  storage_temperature_c: number;
  storage_rh_pct: number;
  product_net_weight_g?: number;
  package_surface_area_m2?: number;
}

export interface SimulationResponse {
  commodity_name: string;
  commodity_category: string;
  packaging_tested: string;
  predicted_shelf_life_days: number;
  primary_failure_mode: string;
  governing_kinetic_model: string;
  critical_threshold_breached: string;
  fssai_safety_verdict: string;
  degradation_curve: DegradationDataPoint[];
}

export interface MaterialComparisonResult {
  material_label: string;
  material_category: string;
  film_thickness_microns: number;
  film_otr: number;
  film_wvtr: number;
  predicted_shelf_life_days: number;
  primary_failure_mode: string;
  is_fssai_compliant: boolean;
  shelf_life_delta_pct: number;
}

export interface ComparisonMatrixResponse {
  commodity_name: string;
  storage_temperature_c: number;
  storage_rh_pct: number;
  comparisons: MaterialComparisonResult[];
}

export interface AuditClauseCheck {
  clause: string;
  requirement: string;
  status: string;
  details: string;
}

export interface AuditReportResponse {
  certificate_id: string;
  timestamp: string;
  commodity_name: string;
  commodity_category: string;
  packaging_material: string;
  layer_structure: string;
  overall_compliance_verdict: string;
  prescribed_is_standard: string;
  prescribed_simulant: string;
  simulant_description: string;
  test_condition: string;
  oml_certified_value: number;
  oml_statutory_limit: number;
  cpcb_category_iv_status: string;
  clauses_audited: AuditClauseCheck[];
}
