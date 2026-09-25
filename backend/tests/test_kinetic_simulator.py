import pytest
from app.schemas.simulation import SimulationRequest
from app.services.simulation.kinetic_simulator import run_shelf_life_simulation

def test_simulation_moisture_failure(db_session):
    # Simulate dry snack with poor barrier in hot humid environment
    req = SimulationRequest(
        commodity_name="Bikaneri Bhujia",
        packaging_material_name="Poor Barrier Test Pouch",
        film_thickness_microns=30.0,
        film_otr_cc_m2_day_atm=50.0,
        film_wvtr_g_m2_day=15.0,  # High moisture ingress
        storage_temperature_c=35.0,
        storage_rh_pct=85.0,
        product_net_weight_g=200.0
    )
    result = run_shelf_life_simulation(req, db_session)

    # Should fail in under 40 days due to moisture/crispness loss
    assert result.predicted_shelf_life_days < 40
    assert "Moisture" in result.primary_failure_mode or "Crispness" in result.primary_failure_mode
    assert len(result.degradation_curve) > 0
    # Day 0 quality must be 100%
    assert result.degradation_curve[0].quality_retention_pct == 100.0

def test_simulation_high_barrier_compostable(db_session):
    # Simulate Bikaneri Bhujia with certified high barrier compostable film
    req = SimulationRequest(
        commodity_name="Bikaneri Bhujia",
        packaging_material_name="Certified High-Barrier Metallized Cellulose",
        film_thickness_microns=65.0,
        film_otr_cc_m2_day_atm=1.5,
        film_wvtr_g_m2_day=0.60,
        storage_temperature_c=25.0,
        storage_rh_pct=60.0,
        product_net_weight_g=200.0
    )
    result = run_shelf_life_simulation(req, db_session)

    # High barrier should achieve > 100 days shelf life
    assert result.predicted_shelf_life_days >= 100
