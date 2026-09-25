from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    ComparisonMatrixResponse
)
from app.services.simulation.kinetic_simulator import run_shelf_life_simulation
from app.services.simulation.benchmark_comparator import compare_packaging_benchmarks

router = APIRouter(prefix="/simulate", tags=["Shelf-Life Simulator"])

@router.post("", response_model=SimulationResponse)
def simulate_shelf_life(
    request: SimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates daily degradation curves (Moisture, Peroxide Value, Microbial count, Quality Retention)
    and predicts exact shelf life in days with primary failure mode diagnosis.
    """
    return run_shelf_life_simulation(request, db)

@router.get("/compare", response_model=ComparisonMatrixResponse)
def compare_benchmarks(
    commodity_name: str = Query(..., example="Bikaneri Bhujia"),
    storage_temp_c: float = Query(default=35.0, ge=-20.0, le=55.0),
    storage_rh_pct: float = Query(default=75.0, ge=10.0, le=100.0),
    product_net_weight_g: float = Query(default=200.0, gt=0.0),
    db: Session = Depends(get_db)
):
    """
    Runs multi-material benchmark comparison:
    1. Recommended Certified Compostable Bio-packaging
    2. Under-gauged Compostable Film (-30% thickness)
    3. Conventional Plain LDPE Polybag (Banned Non-Barrier Baseline)
    4. Unsealed / Porous Paper Packaging
    """
    return compare_packaging_benchmarks(
        commodity_name=commodity_name,
        storage_temp_c=storage_temp_c,
        storage_rh_pct=storage_rh_pct,
        product_net_weight_g=product_net_weight_g,
        db=db
    )
