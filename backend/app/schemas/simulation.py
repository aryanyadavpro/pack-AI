from pydantic import BaseModel, Field
from typing import List, Optional

class SimulationRequest(BaseModel):
    commodity_name: str = Field(..., description="Food commodity name (supports any custom or unlisted food product)", json_schema_extra={"example": "Bikaneri Bhujia"})
    commodity_category: Optional[str] = Field(None, description="Food category")
    moisture_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Custom Moisture Content %")
    fat_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Custom Fat Content %")
    ph_level: Optional[float] = Field(None, ge=1.0, le=14.0, description="Custom Food pH")
    water_activity: Optional[float] = Field(None, ge=0.05, le=1.0, description="Custom Water Activity (Aw)")
    respiration_rate: Optional[float] = Field(None, ge=0.0, description="Respiration rate in mg CO2/kg·hr (for fresh produce)")
    critical_moisture_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Critical spoilage moisture threshold %")
    critical_pv_meq_kg: Optional[float] = Field(None, ge=0.0, description="Critical peroxide value limit in meq/kg")
    packaging_material_name: Optional[str] = Field(None, description="Packaging material name or custom specs", json_schema_extra={"example": "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch"})
    film_thickness_microns: float = Field(..., gt=0.0, description="Film thickness in microns", json_schema_extra={"example": 65.0})
    film_otr_cc_m2_day_atm: float = Field(..., ge=0.0, description="Film Oxygen Transmission Rate", json_schema_extra={"example": 1.8})
    film_wvtr_g_m2_day: float = Field(..., ge=0.0, description="Film Water Vapor Transmission Rate", json_schema_extra={"example": 0.65})
    storage_temperature_c: float = Field(..., ge=-20.0, le=55.0, description="Storage temperature in °C", json_schema_extra={"example": 37.0})
    storage_rh_pct: float = Field(..., ge=10.0, le=100.0, description="Storage Relative Humidity %", json_schema_extra={"example": 75.0})
    product_net_weight_g: float = Field(default=200.0, gt=0.0, description="Net weight in grams")
    package_surface_area_m2: Optional[float] = Field(None, gt=0.0, description="Package surface area in m2")

class DegradationDataPoint(BaseModel):
    day: int
    moisture_pct: float
    peroxide_value_meq_kg: float
    microbial_log_cfu_g: float
    quality_retention_pct: float

class SimulationResponse(BaseModel):
    commodity_name: str
    commodity_category: str
    packaging_tested: str
    predicted_shelf_life_days: int
    primary_failure_mode: str
    governing_kinetic_model: str
    critical_threshold_breached: str
    fssai_safety_verdict: str
    degradation_curve: List[DegradationDataPoint]

class MaterialComparisonResult(BaseModel):
    material_label: str
    material_category: str
    film_thickness_microns: float
    film_otr: float
    film_wvtr: float
    predicted_shelf_life_days: int
    primary_failure_mode: str
    is_fssai_compliant: bool
    shelf_life_delta_pct: float

class ComparisonMatrixResponse(BaseModel):
    commodity_name: str
    storage_temperature_c: float
    storage_rh_pct: float
    comparisons: List[MaterialComparisonResult]
