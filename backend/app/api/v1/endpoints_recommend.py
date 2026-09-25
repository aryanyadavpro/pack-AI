from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.db.session import get_db
from app.schemas.recommendation import PackagingRequirementRequest, RecommendationResponse
from app.services.recommendation.recommendation_service import generate_packaging_recommendation
from app.services.ai_chat.gemini_service import get_packaging_explanation

router = APIRouter(prefix="/recommend", tags=["Recommendation Engine"])

@router.post("", response_model=RecommendationResponse)
def get_packaging_recommendation(
    request: PackagingRequirementRequest,
    db: Session = Depends(get_db)
):
    """
    Two-Tier Decision Engine:
    1. Tier 1: Enforces FSSAI Packaging Reg 2018 (Cl. 3(2), Cl. 4(3) acid checks, OML < 10 mg/dm2)
    2. Tier 2: Vector-normalized TOPSIS MCDM scoring of certified compostable candidate films.
    """
    return generate_packaging_recommendation(request, db)


class PackagingExplainRequest(BaseModel):
    commodity_name: str
    net_weight_g: float = 200.0
    target_days: int = 150
    material_trade_name: str
    layer_structure: str
    temp_c: float = 35.0
    rh_pct: float = 75.0
    nitrogen_flush: bool = True


@router.post("/explain")
def explain_packaging_recommendation(request: PackagingExplainRequest):
    """
    Gemini 2.5 Flash plain-English packaging explainer:
    Translates chemical engineering specs into physical packaging formats,
    visual look & feel, layer functions, factory line steps, and a vendor RFQ.
    """
    return get_packaging_explanation(
        commodity_name=request.commodity_name,
        net_weight_g=request.net_weight_g,
        target_days=request.target_days,
        material_trade_name=request.material_trade_name,
        layer_structure=request.layer_structure,
        temp_c=request.temp_c,
        rh_pct=request.rh_pct,
        nitrogen_flush=request.nitrogen_flush
    )

