import pytest
from app.services.food_science.barrier_calculator import (
    calculate_allowable_wvtr,
    calculate_allowable_otr,
    calculate_horticultural_map_rates,
    estimate_pouch_surface_area
)

def test_pouch_surface_area_estimation():
    # 200g pouch should approximate 0.045 m2
    area_200g = estimate_pouch_surface_area(200.0)
    assert abs(area_200g - 0.045) < 0.005

    # 1000g pouch should scale with 2/3 power law
    area_1kg = estimate_pouch_surface_area(1000.0)
    assert area_1kg > area_200g
    assert 0.12 <= area_1kg <= 0.16

def test_allowable_wvtr_dry_snack():
    # Bikaneri Bhujia test: 200g, moisture 1.6% -> 4.0%, 150 days, 75% RH, aw=0.22
    wvtr = calculate_allowable_wvtr(
        net_weight_g=200.0,
        initial_moisture_pct=1.6,
        critical_moisture_pct=4.0,
        surface_area_m2=0.045,
        target_shelf_life_days=150,
        ambient_rh_pct=75.0,
        food_aw=0.22
    )
    # Permissible WVTR should be strict (< 2.0 g/m2.day)
    assert 0.1 <= wvtr <= 2.5

def test_allowable_otr_fatty_food():
    # Ghee / Bhujia test: 200g, 35% fat, initial PV 1.0 -> 10.0 meq/kg, 150 days
    otr = calculate_allowable_otr(
        net_weight_g=200.0,
        fat_pct=35.0,
        initial_pv=1.0,
        critical_pv=10.0,
        surface_area_m2=0.045,
        target_shelf_life_days=150,
        nitrogen_flushed=True
    )
    # OTR must be <= 5.0 cc/m2.day.atm
    assert 0.5 <= otr <= 5.0

def test_horticultural_map_rates():
    # Fresh Okra: resp rate ~60 mg CO2/kg.hr, 500g, 10°C
    map_otr, gas = calculate_horticultural_map_rates(
        respiration_rate_mg_co2_kg_hr=60.0,
        net_weight_g=500.0,
        surface_area_m2=0.07,
        storage_temp_c=10.0
    )
    # Produce needs high OTR (> 1000 cc/m2.day.atm) to avoid suffocation
    assert map_otr >= 1000.0
    assert "5% O2, 8% CO2" in gas
