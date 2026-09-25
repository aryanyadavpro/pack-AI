from pydantic import BaseModel, Field
from typing import List, Optional

class PackagingRequirementRequest(BaseModel):
    commodity_name: str = Field(..., description="Food product name (e.g. Bikaneri Bhujia, Paneer, or custom food product)")
    commodity_category: Optional[str] = Field(None, description="Food category (e.g. Dairy, Snacks, Produce, Beverages, etc.)")
    moisture_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Custom Moisture Content %")
    fat_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Custom Fat Content %")
    ph_level: Optional[float] = Field(None, ge=1.0, le=14.0, description="Custom Food pH")
    water_activity: Optional[float] = Field(None, ge=0.05, le=1.0, description="Custom Water Activity (Aw)")
    respiration_rate: Optional[float] = Field(None, ge=0.0, description="Respiration rate in mg CO2/kg·hr (for fresh produce)")
    critical_moisture_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Critical spoilage moisture threshold %")
    critical_pv_meq_kg: Optional[float] = Field(None, ge=0.0, description="Critical peroxide value limit in meq/kg")
    package_net_weight_g: float = Field(..., gt=0.0, description="Net weight of packaged food in grams", json_schema_extra={"example": 200.0})
    package_surface_area_m2: Optional[float] = Field(None, gt=0.0, description="Surface area in m2; auto-computed if omitted", json_schema_extra={"example": 0.045})
    target_shelf_life_days: int = Field(..., gt=0, le=730, description="Target shelf life in days", json_schema_extra={"example": 120})
    storage_temperature_c: float = Field(..., ge=-20.0, le=55.0, description="Ambient/storage temperature in °C", json_schema_extra={"example": 35.0})
    ambient_relative_humidity_pct: float = Field(..., ge=10.0, le=100.0, description="Ambient Relative Humidity %", json_schema_extra={"example": 75.0})
    supply_chain_logistics: str = Field(
        default="Standard Urban Distribution (City Logistics / Dark Store E-Commerce)",
        description="Distribution route stress profile"
    )
    nitrogen_flushing: bool = Field(default=True, description="Headspace nitrogen flush applied")

class CandidateMaterialScore(BaseModel):
    rank: int
    trade_name: str
    polymer_family: str
    layer_structure: str
    recommended_gauge_thickness_um: float
    target_otr_cc_m2_day_atm: float
    target_wvtr_g_m2_day: float
    topsis_closeness_score: float
    sealing_mechanism: str
    mechanical_strength_requirement: str
    fssai_clause: str
    prescribed_bis_is_standard: str
    simulant_prescribed: str
    cpcb_category: str
    commercial_reference: Optional[str] = None

class RecommendationResponse(BaseModel):
    commodity_name: str
    commodity_category: str
    computed_permissible_wvtr: float
    computed_permissible_otr: float
    map_gas_recommended: Optional[str]
    candidates_evaluated: int
    candidates_passed_tier1: int
    top_recommendations: List[CandidateMaterialScore]
    suggestion_advisory: Optional[dict] = None
