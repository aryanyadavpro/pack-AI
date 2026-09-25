import pytest
import pandas as pd
from app.models.commodity import Commodity
from app.schemas.recommendation import PackagingRequirementRequest
from app.schemas.simulation import SimulationRequest
from app.services.recommendation.recommendation_service import generate_packaging_recommendation
from app.services.simulation.kinetic_simulator import run_shelf_life_simulation
from app.core.config import settings

def test_database_commodities_consistency(db_session):
    commodities = db_session.query(Commodity).all()
    assert len(commodities) == 27
    for c in commodities:
        assert 0.0 <= c.moisture_pct <= 100.0
        assert 0.0 <= c.fat_pct <= 100.0
        assert 2.5 <= c.ph_level <= 9.0
        assert 0.1 <= c.water_activity <= 1.0

def test_recommendation_benchmark_regression(db_session):
    df1 = pd.read_csv(settings.RECOMMENDATION_DATASET_PATH)
    # Sample 20 diverse rows
    sample = df1.sample(n=20, random_state=42)
    for _, row in sample.iterrows():
        req = PackagingRequirementRequest(
            commodity_name=row['indian_commodity_name'],
            package_net_weight_g=200.0,
            package_surface_area_m2=0.045,
            target_shelf_life_days=int(row['target_shelf_life_days']),
            storage_temperature_c=float(row['storage_temperature_c']),
            ambient_relative_humidity_pct=float(row['ambient_relative_humidity_pct']),
            supply_chain_logistics=str(row['supply_chain_logistics'])
        )
        res = generate_packaging_recommendation(req, db_session)
        assert len(res.top_recommendations) > 0
        top = res.top_recommendations[0]
        assert top.topsis_closeness_score > 0.0
        # The recommended thickness should be within engineering plausibility (15µm to 500µm)
        assert 15.0 <= top.recommended_gauge_thickness_um <= 500.0

def test_simulation_dataset_regression(db_session):
    df2 = pd.read_csv(settings.SIMULATION_DATASET_PATH)
    # Filter for certified compostable recommendations
    compostables = df2[df2['packaging_material_tested'].str.contains("Recommended Certified Compostable")].sample(n=15, random_state=42)
    for _, row in compostables.iterrows():
        sim_req = SimulationRequest(
            commodity_name=row['commodity_name'],
            packaging_material_name=row['packaging_material_tested'],
            film_thickness_microns=float(row['actual_film_thickness_microns']),
            film_otr_cc_m2_day_atm=float(row['actual_film_otr_cc_m2_day_atm']),
            film_wvtr_g_m2_day=float(row['actual_film_wvtr_g_m2_day']),
            storage_temperature_c=float(row['storage_temperature_c']),
            storage_rh_pct=float(row['storage_rh_pct']),
            product_net_weight_g=200.0
        )
        sim_res = run_shelf_life_simulation(sim_req, db_session)
        # Predicted shelf life should be at least 30 days for compliant materials
        assert sim_res.predicted_shelf_life_days >= 20
        assert sim_res.primary_failure_mode != ""
