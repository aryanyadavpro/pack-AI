import pytest
from app.models.packaging_material import PackagingMaterial
from app.models.commodity import Commodity
from app.services.regulatory.safety_filter import evaluate_tier1_safety

def test_tier1_oml_rejection():
    # Material with OML > 10.0 mg/dm2 must fail Tier 1
    unsafe_mat = PackagingMaterial(
        trade_name="Non-Compliant Leaching Film",
        polymer_family="Impure Resin",
        layer_structure="Monolayer 50µm",
        nominal_thickness_um=50.0,
        barrier_otr=2.0,
        barrier_wvtr=1.0,
        sealing_mechanism="Heat",
        certified_oml_mg_dm2=14.5,  # Exceeds 10.0 limit
        is_fssai_compliant=True,
        cpcb_category="CPCB Category IV"
    )
    commodity = Commodity(
        name="Test Atta",
        category="Grains & Flours",
        moisture_pct=11.0,
        fat_pct=1.5,
        ph_level=6.2,
        water_activity=0.55,
        respiration_rate=0.0,
        critical_moisture_pct=14.0
    )
    is_safe, violations = evaluate_tier1_safety(
        material=unsafe_mat,
        commodity=commodity,
        allowable_wvtr=2.0,
        allowable_otr=50.0,
        storage_temp_c=30.0,
        is_respiring=False
    )
    assert not is_safe
    assert any("OML exceeds statutory limit" in v for v in violations)

def test_tier1_acid_check():
    # Acid food (Mango Achar, pH 3.3) in unlined bare paper must fail
    unlined_mat = PackagingMaterial(
        trade_name="Bare Paper Pouch",
        polymer_family="Paper",
        layer_structure="Unlined 80gsm Kraft Paper",
        nominal_thickness_um=80.0,
        barrier_otr=500.0,
        barrier_wvtr=50.0,
        sealing_mechanism="Tape",
        certified_oml_mg_dm2=5.0,
        is_fssai_compliant=True,
        cpcb_category="CPCB Category IV"
    )
    acidic_commodity = Commodity(
        name="Traditional Mango Achar",
        category="Spices & Condiments",
        moisture_pct=48.0,
        fat_pct=22.0,
        ph_level=3.3,  # Acidic
        water_activity=0.78,
        respiration_rate=0.0,
        critical_moisture_pct=52.0
    )
    is_safe, violations = evaluate_tier1_safety(
        material=unlined_mat,
        commodity=acidic_commodity,
        allowable_wvtr=1.0,
        allowable_otr=1.0,
        storage_temp_c=30.0,
        is_respiring=False
    )
    assert not is_safe
    assert any("FSSAI Cl. 4(3)" in v for v in violations)
