import pytest

def test_api_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_list_commodities(client):
    res = client.get("/api/v1/commodities")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 20
    # Check commodity fields
    item = data[0]
    assert "name" in item
    assert "category" in item
    assert "moisture_pct" in item

def test_api_recommendation(client):
    payload = {
        "commodity_name": "Bikaneri Bhujia",
        "package_net_weight_g": 200.0,
        "package_surface_area_m2": 0.045,
        "target_shelf_life_days": 120,
        "storage_temperature_c": 35.0,
        "ambient_relative_humidity_pct": 70.0,
        "supply_chain_logistics": "Standard Urban Distribution",
        "nitrogen_flushing": True
    }
    res = client.post("/api/v1/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["commodity_name"] == "Bikaneri Bhujia"
    assert data["computed_permissible_wvtr"] > 0
    assert len(data["top_recommendations"]) > 0
    top = data["top_recommendations"][0]
    assert top["rank"] == 1
    assert "fssai_clause" in top
    assert "simulant_prescribed" in top
    assert 0.0 <= top["topsis_closeness_score"] <= 1.0

def test_api_simulation(client):
    payload = {
        "commodity_name": "Bikaneri Bhujia",
        "packaging_material_name": "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch",
        "film_thickness_microns": 65.0,
        "film_otr_cc_m2_day_atm": 1.8,
        "film_wvtr_g_m2_day": 0.65,
        "storage_temperature_c": 37.0,
        "storage_rh_pct": 75.0,
        "product_net_weight_g": 200.0
    }
    res = client.post("/api/v1/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_shelf_life_days"] > 0
    assert len(data["degradation_curve"]) > 0

def test_api_simulation_compare(client):
    res = client.get("/api/v1/simulate/compare?commodity_name=Bikaneri%20Bhujia&storage_temp_c=35.0&storage_rh_pct=75.0")
    assert res.status_code == 200
    data = res.json()
    assert len(data["comparisons"]) == 4
    # First material should be certified compostable and achieve longest shelf life
    bio_item = data["comparisons"][0]
    ldpe_item = [x for x in data["comparisons"] if "LDPE" in x["material_label"]][0]
    assert bio_item["predicted_shelf_life_days"] > ldpe_item["predicted_shelf_life_days"]

def test_api_audit_report(client):
    payload = {
        "commodity_name": "Bikaneri Bhujia",
        "packaging_material_name": "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch",
        "film_thickness_microns": 65.0,
        "target_shelf_life_days": 150
    }
    res = client.post("/api/v1/audit/report", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "BIOPACK-FSSAI-" in data["certificate_id"]
    assert data["overall_compliance_verdict"] == "FULLY COMPLIANT"
    assert len(data["clauses_audited"]) >= 4
