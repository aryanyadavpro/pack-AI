from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.commodity import Commodity

CATEGORY_CHEMISTRY_DEFAULTS = {
    "Horticultural Produce & Fruits": {
        "moisture_pct": 88.0,
        "fat_pct": 0.4,
        "ph_level": 3.8,
        "water_activity": 0.98,
        "respiration_rate": 15.0,
        "critical_moisture_pct": 94.0,
        "critical_pv_meq_kg": 10.0,
        "description": "Perishable fresh agricultural produce characterized by respiration, high water activity, and condensation sensitivity."
    },
    "Bakery & Extruded Snacks": {
        "moisture_pct": 3.0,
        "fat_pct": 22.0,
        "ph_level": 6.2,
        "water_activity": 0.25,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 6.5,
        "critical_pv_meq_kg": 10.0,
        "description": "Crisp snack foods sensitive to moisture sorption sogginess and lipid oxidative rancidity."
    },
    "Dairy & Plant Milks": {
        "moisture_pct": 55.0,
        "fat_pct": 24.0,
        "ph_level": 5.8,
        "water_activity": 0.94,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 65.0,
        "critical_pv_meq_kg": 8.0,
        "description": "High-protein moisture-rich dairy matrix prone to microbiological proliferation and lipid oxidation."
    },
    "Confectionery & Sweets": {
        "moisture_pct": 8.0,
        "fat_pct": 16.0,
        "ph_level": 6.0,
        "water_activity": 0.45,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 12.0,
        "critical_pv_meq_kg": 10.0,
        "description": "Sugar and fat confectionery sensitive to sugar recrystallization, moisture gain, and fat bloom."
    },
    "Pickles, Sauces & Ferments": {
        "moisture_pct": 65.0,
        "fat_pct": 12.0,
        "ph_level": 3.2,
        "water_activity": 0.88,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 72.0,
        "critical_pv_meq_kg": 12.0,
        "description": "High-acid preservative medium requiring statutory FSSAI Cl. 4(3) acid-leaching proof barrier."
    },
    "Pantry Staples & Grains": {
        "moisture_pct": 11.5,
        "fat_pct": 1.8,
        "ph_level": 6.4,
        "water_activity": 0.55,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 14.5,
        "critical_pv_meq_kg": 10.0,
        "description": "Hygroscopic dry grains and milled flours requiring hermetic moisture and insect infestation barrier."
    },
    "Spices & Dry Powders": {
        "moisture_pct": 8.0,
        "fat_pct": 8.5,
        "ph_level": 5.5,
        "water_activity": 0.42,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 12.0,
        "critical_pv_meq_kg": 10.0,
        "description": "Volatile essential oil powders sensitive to aroma loss, light oxidation, and caking."
    },
    "Fats, Butters & Oils": {
        "moisture_pct": 0.2,
        "fat_pct": 99.5,
        "ph_level": 6.5,
        "water_activity": 0.20,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 0.8,
        "critical_pv_meq_kg": 5.0,
        "description": "Anhydrous lipid system governed exclusively by light and oxygen-induced autoxidation."
    },
    "Meat, Fish & Proteins": {
        "moisture_pct": 72.0,
        "fat_pct": 8.0,
        "ph_level": 5.9,
        "water_activity": 0.97,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 80.0,
        "critical_pv_meq_kg": 10.0,
        "description": "Perishable animal/plant protein cold-chain matrix vulnerable to anaerobic/aerobic spoilage."
    },
    "General Food Commodity": {
        "moisture_pct": 20.0,
        "fat_pct": 6.0,
        "ph_level": 6.0,
        "water_activity": 0.60,
        "respiration_rate": 0.0,
        "critical_moisture_pct": 26.0,
        "critical_pv_meq_kg": 10.0,
        "description": "Standard packaged food product."
    }
}

def infer_category_from_name(name: str) -> str:
    n = name.lower()
    if any(k in n for k in ["strawberry", "strawberries", "berry", "berries", "mango", "apple", "banana", "fruit", "onion", "okra", "bhindi", "chilli", "mirch", "tomato", "vegetable", "grape", "leaf", "herbal"]):
        return "Horticultural Produce & Fruits"
    if any(k in n for k in ["paneer", "milk", "cheese", "curd", "dahi", "yogurt", "khoa", "mawa", "kefir"]):
        return "Dairy & Plant Milks"
    if any(k in n for k in ["ghee", "oil", "butter", "mustard oil", "coconut oil", "fat"]):
        return "Fats, Butters & Oils"
    if any(k in n for k in ["bhujia", "chips", "khakhra", "cracker", "cookie", "biscuit", "puff", "makhana", "namkeen", "snack", "popcorn", "crisp"]):
        return "Bakery & Extruded Snacks"
    if any(k in n for k in ["ladoo", "laddu", "kaju", "katli", "sweet", "mithai", "chocolate", "candy", "halwa", "barfi", "rasgulla", "gulab jamun", "jamun"]):
        return "Confectionery & Sweets"
    if any(k in n for k in ["pickle", "achar", "sauce", "chutney", "ferment", "kombucha", "kimchi", "vinegar"]):
        return "Pickles, Sauces & Ferments"
    if any(k in n for k in ["atta", "flour", "besan", "rice", "dal", "grain", "wheat", "pulse", "lentil", "papad"]):
        return "Pantry Staples & Grains"
    if any(k in n for k in ["tea", "coffee", "haldi", "turmeric", "powder", "masala", "spice", "cardamom", "pepper"]):
        return "Spices & Dry Powders"
    if any(k in n for k in ["fish", "meat", "mutton", "chevon", "chicken", "prawn", "seafood", "tofu", "tempeh", "protein"]):
        return "Meat, Fish & Proteins"
    return "General Food Commodity"


# ──────────────────────────────────────────────────────────────────────
# Legacy → Canonical Category Normalization
# ──────────────────────────────────────────────────────────────────────
# The original CSV dataset used different category names than the
# canonical archetypes. This map translates them.
# ──────────────────────────────────────────────────────────────────────
CATEGORY_NORMALIZATION_MAP: Dict[str, str] = {
    # CSV / legacy names → canonical names
    "Fresh Horticultural Produce": "Horticultural Produce & Fruits",
    "Horticultural": "Horticultural Produce & Fruits",
    "produce": "Horticultural Produce & Fruits",
    "Grains & Flours": "Pantry Staples & Grains",
    "Pulses & Legumes": "Pantry Staples & Grains",
    "Indian Snacks & Namkeen": "Bakery & Extruded Snacks",
    "bakery_snacks": "Bakery & Extruded Snacks",
    "Traditional Sweets (Mithai)": "Confectionery & Sweets",
    "Dairy Products": "Dairy & Plant Milks",
    "Dairy Fats": "Fats, Butters & Oils",
    "Edible Vegetable Oils": "Fats, Butters & Oils",
    "Spices & Condiments": "Spices & Dry Powders",
    "Beverages & Plantation Crops": "Spices & Dry Powders",  # tea/coffee closest
}


def normalize_category(category: str, commodity_name: str = "") -> str:
    """
    Normalizes a category string to its canonical form.
    Falls back to name-based inference if unrecognized.
    """
    if category in CATEGORY_CHEMISTRY_DEFAULTS:
        return category  # Already canonical
    if category in CATEGORY_NORMALIZATION_MAP:
        return CATEGORY_NORMALIZATION_MAP[category]
    # Last resort: infer from commodity name
    if commodity_name:
        return infer_category_from_name(commodity_name)
    return "General Food Commodity"

def get_or_synthesize_commodity(
    db: Session,
    commodity_name: str,
    category: Optional[str] = None,
    moisture_pct: Optional[float] = None,
    fat_pct: Optional[float] = None,
    ph_level: Optional[float] = None,
    water_activity: Optional[float] = None,
    respiration_rate: Optional[float] = None,
    critical_moisture_pct: Optional[float] = None,
    critical_pv_meq_kg: Optional[float] = None
) -> Commodity:
    """
    Universal Commodity Resolver:
    1. Checks if the commodity exists in the database.
    2. If found and no custom chemistry overrides are provided, returns it.
    3. If not found or if custom chemistry is provided, dynamically instantiates
       and persists the user's custom product with verified food science archetypes.
    """
    clean_name = commodity_name.strip()
    has_custom_overrides = any(v is not None for v in [moisture_pct, fat_pct, ph_level, water_activity, respiration_rate])

    # Normalize user-provided category if present
    if category:
        category = normalize_category(category, clean_name)

    # Try finding existing commodity
    existing = db.query(Commodity).filter(Commodity.name == clean_name).first()
    if not existing:
        existing = db.query(Commodity).filter(Commodity.name.ilike(f"%{clean_name}%")).first()

    # Always normalize DB-stored categories to canonical form
    if existing:
        canonical = normalize_category(existing.category, existing.name)
        if canonical != existing.category:
            existing.category = canonical
            db.commit()
            db.refresh(existing)

    # If the user explicitly provided a category that differs from the stored one,
    # treat it as a custom override so the stale category gets corrected
    if existing and category and existing.category != category:
        has_custom_overrides = True

    if existing and not has_custom_overrides:
        return existing

    # Infer category if not provided
    resolved_category = category or (existing.category if existing else infer_category_from_name(clean_name))
    # Final safety: normalize once more
    resolved_category = normalize_category(resolved_category, clean_name)
    defaults = CATEGORY_CHEMISTRY_DEFAULTS.get(resolved_category, CATEGORY_CHEMISTRY_DEFAULTS["General Food Commodity"])

    # Resolve each parameter (Custom argument > Existing in DB > Archetype default)
    r_moisture = moisture_pct if moisture_pct is not None else (existing.moisture_pct if existing else defaults["moisture_pct"])
    r_fat = fat_pct if fat_pct is not None else (existing.fat_pct if existing else defaults["fat_pct"])
    r_ph = ph_level if ph_level is not None else (existing.ph_level if existing else defaults["ph_level"])
    r_aw = water_activity if water_activity is not None else (existing.water_activity if existing else defaults["water_activity"])
    r_resp = respiration_rate if respiration_rate is not None else (existing.respiration_rate if existing else defaults["respiration_rate"])
    r_crit_moist = critical_moisture_pct if critical_moisture_pct is not None else (
        existing.critical_moisture_pct if existing else defaults["critical_moisture_pct"]
    )
    r_crit_pv = critical_pv_meq_kg if critical_pv_meq_kg is not None else (
        existing.critical_pv_meq_kg if existing else defaults["critical_pv_meq_kg"]
    )

    if existing and has_custom_overrides:
        # Update existing record
        existing.category = resolved_category
        existing.moisture_pct = float(r_moisture)
        existing.fat_pct = float(r_fat)
        existing.ph_level = float(r_ph)
        existing.water_activity = float(r_aw)
        existing.respiration_rate = float(r_resp)
        existing.critical_moisture_pct = float(r_crit_moist)
        existing.critical_pv_meq_kg = float(r_crit_pv)
        db.commit()
        db.refresh(existing)
        return existing

    # Create new custom commodity and persist to database
    new_commodity = Commodity(
        name=clean_name,
        category=resolved_category,
        ifct_code=f"CUSTOM-{hash(clean_name) % 10000:04d}",
        moisture_pct=float(r_moisture),
        fat_pct=float(r_fat),
        ph_level=float(r_ph),
        water_activity=float(r_aw),
        respiration_rate=float(r_resp),
        critical_moisture_pct=float(r_crit_moist),
        critical_pv_meq_kg=float(r_crit_pv),
        description=f"User-formulated custom commodity: {clean_name} ({resolved_category})."
    )

    db.add(new_commodity)
    try:
        db.commit()
        db.refresh(new_commodity)
        return new_commodity
    except Exception:
        db.rollback()
        # In case of duplicate race, query again
        found = db.query(Commodity).filter(Commodity.name == clean_name).first()
        if found:
            return found
        return new_commodity
