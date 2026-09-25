from pydantic import BaseModel, Field
from typing import List, Optional

class AuditReportRequest(BaseModel):
    commodity_name: str = Field(..., json_schema_extra={"example": "Bikaneri Bhujia"})
    packaging_material_name: str = Field(..., json_schema_extra={"example": "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch"})
    film_thickness_microns: float = Field(..., json_schema_extra={"example": 65.0})
    target_shelf_life_days: int = Field(..., json_schema_extra={"example": 150})
    manufacturer_name: Optional[str] = Field(default="BioPack Verified Processor")
    fssai_license_number: Optional[str] = Field(default="10023022001928")

class AuditClauseCheck(BaseModel):
    clause: str
    requirement: str
    status: str  # PASS / FAIL / EXEMPT
    details: str

class AuditReportResponse(BaseModel):
    certificate_id: str
    timestamp: str
    commodity_name: str
    commodity_category: str
    packaging_material: str
    layer_structure: str
    overall_compliance_verdict: str  # FULLY COMPLIANT / CONDITIONAL / NON-COMPLIANT
    prescribed_is_standard: str
    prescribed_simulant: str
    simulant_description: str
    test_condition: str
    oml_certified_value: float
    oml_statutory_limit: float
    cpcb_category_iv_status: str
    clauses_audited: List[AuditClauseCheck]
