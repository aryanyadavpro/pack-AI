from typing import Dict, Any

def get_prescribed_is9845_simulant(category: str, ph_level: float, fat_pct: float) -> Dict[str, Any]:
    """
    Returns prescribed IS 9845 food simulant, testing composition,
    and exposure parameters according to FSSAI (Packaging) Regulations 2018.
    """
    # 1. Acidic foods (pH <= 4.5)
    if ph_level <= 4.5 or "Achar" in category or "Pickle" in category:
        return {
            "simulant": "Simulant B",
            "composition": "3% Acetic Acid (w/v) in distilled water",
            "test_condition": "40°C for 10 days (or 100°C for 2 hours for hot-fill/retort)",
            "rationale": "FSSAI Cl. 4(3) Acid Leaching Constraint: Verifies zero acid degradation of bio-liner.",
            "statutory_limit": "OML <= 10.0 mg/dm2 or 60.0 mg/kg"
        }

    # 2. Fatty foods (fat > 10% or edible oils)
    if fat_pct >= 10.0 or "Oils" in category or "Fats" in category or "Snacks" in category or "Namkeen" in category:
        return {
            "simulant": "Simulant D",
            "composition": "Rectified Olive Oil / n-Heptane / Iso-octane",
            "test_condition": "38°C for 30 minutes (n-Heptane) or 40°C for 10 days (Olive Oil)",
            "rationale": "FSSAI Schedule II Fatty Contact Rule: Verifies barrier non-dissolution under lipid contact.",
            "statutory_limit": "OML <= 10.0 mg/dm2 or 60.0 mg/kg"
        }

    # 3. Dairy solids or alcoholic/aqueous emulsions
    if "Dairy" in category or "Meat" in category or "Fish" in category:
        return {
            "simulant": "Simulant C",
            "composition": "15% Ethanol (v/v) in distilled water",
            "test_condition": "40°C for 10 days (or 50°C for 24 hours)",
            "rationale": "FSSAI Schedule I Dairy & Animal Protein Rule: Tests emulsion solvent resistance.",
            "statutory_limit": "OML <= 10.0 mg/dm2 or 60.0 mg/kg"
        }

    # 4. Standard aqueous non-acid foods
    return {
        "simulant": "Simulant A",
        "composition": "Distilled Water",
        "test_condition": "40°C for 10 days (or 70°C for 2 hours)",
        "rationale": "FSSAI Cl. 4(4) Aqueous Contact Baseline: Overall migration test for cereals and staples.",
        "statutory_limit": "OML <= 10.0 mg/dm2 or 60.0 mg/kg"
    }
