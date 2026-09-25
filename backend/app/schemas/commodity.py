from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CommodityBase(BaseModel):
    name: str = Field(..., description="Indian food commodity name")
    category: str = Field(..., description="FSSAI commodity category")
    ifct_code: Optional[str] = Field(None, description="ICMR-NIN IFCT food code")
    moisture_pct: float = Field(..., ge=0.0, le=100.0)
    fat_pct: float = Field(..., ge=0.0, le=100.0)
    ph_level: float = Field(..., ge=1.0, le=14.0)
    water_activity: float = Field(..., ge=0.0, le=1.0)
    respiration_rate: float = Field(default=0.0, ge=0.0)
    critical_moisture_pct: float = Field(..., ge=0.0, le=100.0)
    critical_pv_meq_kg: Optional[float] = Field(default=10.0, ge=0.0)
    description: Optional[str] = None

class CommodityResponse(CommodityBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class CommoditySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    ifct_code: Optional[str] = None
    moisture_pct: float
    fat_pct: float
    ph_level: float
    water_activity: float
    respiration_rate: float
