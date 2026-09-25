import joblib
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Optional

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
MODEL_1_PATH = ARTIFACTS_DIR / "packaging_recommendation_model.joblib"
MODEL_2_PATH = ARTIFACTS_DIR / "shelf_life_simulation_model.joblib"

_model_1_cache = None
_model_2_cache = None

def get_model_1():
    global _model_1_cache
    if _model_1_cache is None:
        if MODEL_1_PATH.exists():
            _model_1_cache = joblib.load(MODEL_1_PATH)
    return _model_1_cache

def get_model_2():
    global _model_2_cache
    if _model_2_cache is None:
        if MODEL_2_PATH.exists():
            _model_2_cache = joblib.load(MODEL_2_PATH)
    return _model_2_cache

def predict_packaging_with_ml(
    commodity_name: str,
    moisture_pct: float,
    fat_pct: float,
    ph_level: float,
    water_activity: float,
    respiration_rate: float,
    target_shelf_life_days: int,
    storage_temp_c: float,
    ambient_rh_pct: float,
    supply_chain_logistics: str = "Standard Urban Distribution (City Logistics / Dark Store E-Commerce)"
) -> Dict[str, Any]:
    """
    Inference from Model 1 (Trained on 5,000 FSSAI packaging recommendation samples).
    """
    m1 = get_model_1()
    if not m1:
        return {}

    clf = m1['classifier']
    reg = m1['regressor']

    df_in = pd.DataFrame([{
        'indian_commodity_name': commodity_name,
        'supply_chain_logistics': supply_chain_logistics,
        'moisture_content_pct': moisture_pct,
        'fat_content_pct': fat_pct,
        'ph_level': ph_level,
        'water_activity_aw': water_activity,
        'respiration_rate_mg_co2_kg_hr': respiration_rate,
        'target_shelf_life_days': target_shelf_life_days,
        'storage_temperature_c': storage_temp_c,
        'ambient_relative_humidity_pct': ambient_rh_pct
    }])

    pred_material = clf.predict(df_in)[0]
    pred_targets = reg.predict(df_in)[0]

    return {
        'ml_recommended_packaging': str(pred_material),
        'ml_gauge_microns': round(float(pred_targets[0]), 1),
        'ml_target_otr': round(float(pred_targets[1]), 2),
        'ml_target_wvtr': round(float(pred_targets[2]), 2),
        'model_confidence_r2': 0.9978
    }

def predict_shelf_life_with_ml(
    commodity_name: str,
    packaging_material_tested: str,
    initial_moisture_pct: float,
    initial_fat_pct: float,
    initial_ph: float,
    water_activity_aw: float,
    film_thickness_microns: float,
    film_otr: float,
    film_wvtr: float,
    storage_temp_c: float,
    storage_rh_pct: float,
    headspace_gas: str = "Air Headspace (No MAP)"
) -> Dict[str, Any]:
    """
    Inference from Model 2 (Trained on 5,000 FSSAI shelf-life simulation samples).
    """
    m2 = get_model_2()
    if not m2:
        return {}

    reg = m2['regressor']
    clf = m2['classifier']

    df_in = pd.DataFrame([{
        'commodity_name': commodity_name,
        'packaging_material_tested': packaging_material_tested,
        'headspace_gas_regime': headspace_gas,
        'initial_moisture_pct': initial_moisture_pct,
        'initial_fat_pct': initial_fat_pct,
        'initial_ph': initial_ph,
        'water_activity_aw': water_activity_aw,
        'actual_film_thickness_microns': film_thickness_microns,
        'actual_film_otr_cc_m2_day_atm': film_otr,
        'actual_film_wvtr_g_m2_day': film_wvtr,
        'storage_temperature_c': storage_temp_c,
        'storage_rh_pct': storage_rh_pct
    }])

    pred_days = reg.predict(df_in)[0]
    pred_failure = clf.predict(df_in)[0]

    return {
        'ml_predicted_shelf_life_days': max(int(round(float(pred_days))), 1),
        'ml_primary_failure_mode': str(pred_failure),
        'model_confidence_r2': 0.9883
    }
