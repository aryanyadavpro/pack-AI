from typing import Tuple, List, Dict, Any
from app.models.packaging_material import PackagingMaterial
from app.models.commodity import Commodity

def evaluate_tier1_safety(
    material: PackagingMaterial,
    commodity: Commodity,
    allowable_wvtr: float,
    allowable_otr: float,
    storage_temp_c: float,
    is_respiring: bool
) -> Tuple[bool, List[str]]:
    """
    Tier 1: Hard Regulatory & Food Safety Gate.
    Returns (True, []) if compliant, or (False, [reasons]) if disqualified.
    """
    violations = []

    # 1. Overall Migration Limit (FSSAI Cl. 4(4) / IS 9845)
    if material.certified_oml_mg_dm2 > 10.0:
        violations.append(
            f"OML exceeds statutory limit: {material.certified_oml_mg_dm2} mg/dm2 > 10.0 mg/dm2 (FSSAI Cl. 4(4))"
        )

    # 2. Acid Compatibility Check (FSSAI Cl. 4(3))
    if commodity.ph_level <= 4.5:
        layer_lower = material.layer_structure.lower()
        trade_lower = material.trade_name.lower()
        has_acid_barrier = any(x in (layer_lower + " " + trade_lower) for x in ["alox", "bio-pbs", "spouted", "retort", "natureflex", "pla", "wax"])
        if not has_acid_barrier or ("unlined" in layer_lower):
            violations.append(
                f"Disqualified under FSSAI Cl. 4(3): Acid food (pH {commodity.ph_level}) requires inert non-reactive barrier (AlOx-PLA / Bio-PBS)."
            )

    # 3. Respiration Suitability vs High Barrier
    if is_respiring:
        # Respiring produce (Okra, Mangoes, Chillies, Onions) dies in airtight zero-barrier foil/AlOx
        if material.barrier_otr < 200.0:
            violations.append(
                "Disqualified: Respiring produce requires high-breathability micro-perforated film (OTR > 1000 cc/m2.day.atm) to avoid anaerobic fermentation."
            )
    else:
        # Non-respiring foods: check if film barrier is sufficient
        # WVTR check
        if material.barrier_wvtr > (allowable_wvtr * 1.50):
            violations.append(
                f"WVTR insufficient: Film WVTR ({material.barrier_wvtr} g/m2.day) exceeds allowable limit ({allowable_wvtr} g/m2.day)."
            )
        # OTR check for fat-rich foods
        if commodity.fat_pct > 2.0 and material.barrier_otr > (allowable_otr * 1.75):
            violations.append(
                f"OTR insufficient: Film OTR ({material.barrier_otr} cc/m2.day.atm) exceeds allowable limit ({allowable_otr} cc/m2.day.atm) for high-fat commodity."
            )

    # 4. Thermal Stability
    if storage_temp_c > 45.0 and "cup" in material.trade_name.lower():
        violations.append(
            f"Thermal deformation risk: Storage at {storage_temp_c}°C exceeds polymer softening threshold."
        )

    # 5. Statutory CPCB Category IV verification
    if not material.is_fssai_compliant or "Category IV" not in material.cpcb_category:
        violations.append(
            "Non-compliant with CPCB Plastic Waste Management Category IV (Certified Compostable Plastic, Form-VI)."
        )

    is_passed = len(violations) == 0
    return is_passed, violations
