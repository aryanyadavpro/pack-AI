from typing import List
from sqlalchemy.orm import Session

from app.models.commodity import Commodity
from app.models.packaging_material import PackagingMaterial
from app.schemas.simulation import ComparisonMatrixResponse, MaterialComparisonResult, SimulationRequest
from app.services.simulation.kinetic_simulator import run_shelf_life_simulation
from app.services.food_science.commodity_resolver import get_or_synthesize_commodity

def compare_packaging_benchmarks(
    commodity_name: str,
    storage_temp_c: float,
    storage_rh_pct: float,
    product_net_weight_g: float,
    db: Session
) -> ComparisonMatrixResponse:
    commodity = get_or_synthesize_commodity(db=db, commodity_name=commodity_name)

    # Find the recommended certified material for this commodity category
    rec_mat = db.query(PackagingMaterial).filter(
        PackagingMaterial.is_fssai_compliant == True
    ).first()

    # Define benchmark materials to simulate
    benchmark_configs = [
        {
            "label": "Recommended Certified Compostable (BioPack Optimal)",
            "category": "Certified Bio-Polymer (IS/ISO 17088)",
            "thickness": 65.0,
            "otr": 1.8 if commodity.respiration_rate == 0 else 7500.0,
            "wvtr": 0.70 if commodity.respiration_rate == 0 else 42.0,
            "is_compliant": True
        },
        {
            "label": "Under-Gauged Compostable Film (-30% Gauge)",
            "category": "Down-gauged Bio-Polymer (Risk of Early Permeation)",
            "thickness": 40.0,
            "otr": 5.5 if commodity.respiration_rate == 0 else 12000.0,
            "wvtr": 2.8 if commodity.respiration_rate == 0 else 95.0,
            "is_compliant": False
        },
        {
            "label": "Conventional Plain LDPE Polybag (Banned Non-Barrier Baseline)",
            "category": "Single-Use Plastic (Non-Compliant PWM Rules)",
            "thickness": 45.0,
            "otr": 11000.0,
            "wvtr": 59.8,
            "is_compliant": False
        },
        {
            "label": "Unsealed / Porous Paper Packaging (No Bio-Barrier Liner)",
            "category": "Unsealed Porous Fiber (Rapid Environmental Equilibration)",
            "thickness": 75.0,
            "otr": 16800.0,
            "wvtr": 224.0,
            "is_compliant": False
        }
    ]

    results: List[MaterialComparisonResult] = []
    base_shelf_life = None

    for cfg in benchmark_configs:
        sim_req = SimulationRequest(
            commodity_name=commodity.name,
            packaging_material_name=cfg["label"],
            film_thickness_microns=cfg["thickness"],
            film_otr_cc_m2_day_atm=cfg["otr"],
            film_wvtr_g_m2_day=cfg["wvtr"],
            storage_temperature_c=storage_temp_c,
            storage_rh_pct=storage_rh_pct,
            product_net_weight_g=product_net_weight_g
        )
        sim_res = run_shelf_life_simulation(sim_req, db)

        if base_shelf_life is None:
            base_shelf_life = max(sim_res.predicted_shelf_life_days, 1)
            delta_pct = 0.0
        else:
            delta_pct = round(((sim_res.predicted_shelf_life_days - base_shelf_life) / base_shelf_life) * 100.0, 1)

        results.append(
            MaterialComparisonResult(
                material_label=cfg["label"],
                material_category=cfg["category"],
                film_thickness_microns=cfg["thickness"],
                film_otr=cfg["otr"],
                film_wvtr=cfg["wvtr"],
                predicted_shelf_life_days=sim_res.predicted_shelf_life_days,
                primary_failure_mode=sim_res.primary_failure_mode,
                is_fssai_compliant=cfg["is_compliant"],
                shelf_life_delta_pct=delta_pct
            )
        )

    return ComparisonMatrixResponse(
        commodity_name=commodity.name,
        storage_temperature_c=storage_temp_c,
        storage_rh_pct=storage_rh_pct,
        comparisons=results
    )
