import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import accuracy_score, r2_score

from app.core.config import settings

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

def train_packaging_recommendation_model():
    print(f"\n[Model 1] Training on {settings.RECOMMENDATION_DATASET_PATH}...")
    df = pd.read_csv(settings.RECOMMENDATION_DATASET_PATH)

    # Features: commodity, chemistry, climate, logistics
    categorical_features = ['indian_commodity_name', 'supply_chain_logistics']
    numeric_features = [
        'moisture_content_pct', 'fat_content_pct', 'ph_level',
        'water_activity_aw', 'respiration_rate_mg_co2_kg_hr',
        'target_shelf_life_days', 'storage_temperature_c',
        'ambient_relative_humidity_pct'
    ]

    X = df[categorical_features + numeric_features]
    y_material = df['recommended_biodegradable_packaging']
    y_targets = df[['recommended_gauge_thickness_microns', 'target_otr_cc_m2_day_atm', 'target_wvtr_g_m2_day']]

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numeric_features)
        ]
    )

    # 1. Material Classifier
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42))
    ])
    clf.fit(X, y_material)
    y_pred_mat = clf.predict(X)
    acc = accuracy_score(y_material, y_pred_mat)
    print(f"Material Classifier Accuracy: {acc * 100:.2f}%")

    # 2. Multi-target Gauge & Barrier Regressor
    reg = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', MultiOutputRegressor(GradientBoostingRegressor(n_estimators=100, max_depth=6, random_state=42)))
    ])
    reg.fit(X, y_targets)
    y_pred_targets = reg.predict(X)
    r2 = r2_score(y_targets, y_pred_targets, multioutput='uniform_average')
    print(f"Gauge & Barrier Regressor R2 Score: {r2:.4f}")

    # Save artifacts
    model_payload = {
        'classifier': clf,
        'regressor': reg,
        'feature_names_cat': categorical_features,
        'feature_names_num': numeric_features
    }
    model_path = ARTIFACTS_DIR / "packaging_recommendation_model.joblib"
    joblib.dump(model_payload, model_path)
    print(f"Saved Model 1 to {model_path}")

def train_shelf_life_simulation_model():
    print(f"\n[Model 2] Training on {settings.SIMULATION_DATASET_PATH}...")
    df = pd.read_csv(settings.SIMULATION_DATASET_PATH)

    categorical_features = ['commodity_name', 'packaging_material_tested', 'headspace_gas_regime']
    numeric_features = [
        'initial_moisture_pct', 'initial_fat_pct', 'initial_ph',
        'water_activity_aw', 'actual_film_thickness_microns',
        'actual_film_otr_cc_m2_day_atm', 'actual_film_wvtr_g_m2_day',
        'storage_temperature_c', 'storage_rh_pct'
    ]

    X = df[categorical_features + numeric_features]
    y_days = df['measured_shelf_life_days']
    y_failure = df['primary_failure_mode']

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numeric_features)
        ]
    )

    # 1. Shelf-life Days Regressor
    reg = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=150, max_depth=6, random_state=42))
    ])
    reg.fit(X, y_days)
    y_pred_days = reg.predict(X)
    r2 = r2_score(y_days, y_pred_days)
    print(f"Shelf-Life Days Regressor R2 Score: {r2:.4f}")

    # 2. Failure Mode Classifier
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42))
    ])
    clf.fit(X, y_failure)
    y_pred_fail = clf.predict(X)
    acc = accuracy_score(y_failure, y_pred_fail)
    print(f"Failure Mode Classifier Accuracy: {acc * 100:.2f}%")

    model_payload = {
        'regressor': reg,
        'classifier': clf,
        'feature_names_cat': categorical_features,
        'feature_names_num': numeric_features
    }
    model_path = ARTIFACTS_DIR / "shelf_life_simulation_model.joblib"
    joblib.dump(model_payload, model_path)
    print(f"Saved Model 2 to {model_path}")

if __name__ == "__main__":
    train_packaging_recommendation_model()
    train_shelf_life_simulation_model()
