import numpy as np
from typing import List, Dict, Any, Optional

# ──────────────────────────────────────────────────────────────────────
# Category-Aware TOPSIS Weight Profiles
# ──────────────────────────────────────────────────────────────────────
# Each profile has 6 criteria weights:
#   barrier_margin, gauge_thickness, cost_index,
#   mechanical_strength, compostability, format_suitability
#
# Criteria benefit flags (higher is better = True, lower is better = False):
#   barrier_margin    → True  (bigger margin = safer barrier)
#   gauge_thickness   → False (thinner = lighter, less material waste)
#   cost_index        → False (cheaper = better)
#   mechanical_strength → True  (stronger = better)
#   compostability    → True  (more compostable = better)
#   format_suitability → True  (better form-factor match = better)
# ──────────────────────────────────────────────────────────────────────

CRITERIA_BENEFIT_FLAGS = [True, False, False, True, True, True]

DEFAULT_WEIGHTS = {
    "barrier_margin": 0.30,
    "gauge_thickness": 0.10,
    "cost_index": 0.15,
    "mechanical_strength": 0.15,
    "compostability": 0.10,
    "format_suitability": 0.20
}

CATEGORY_WEIGHT_PROFILES: Dict[str, Dict[str, float]] = {
    # Crispy dry snacks: barrier is king (moisture sogginess & lipid rancidity)
    "Bakery & Extruded Snacks": {
        "barrier_margin": 0.35,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Confectionery: moisture + light barrier critical (sugar bloom, fat bloom)
    "Confectionery & Sweets": {
        "barrier_margin": 0.35,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Spices: aroma retention (OTR) + moisture (caking) critical
    "Spices & Dry Powders": {
        "barrier_margin": 0.35,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Fats/oils: extreme OTR sensitivity (auto-oxidation), amber light barrier
    "Fats, Butters & Oils": {
        "barrier_margin": 0.40,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.25
    },
    # Fresh produce: breathability over barrier; format matters (punnets/trays)
    "Horticultural Produce & Fruits": {
        "barrier_margin": 0.20,
        "gauge_thickness": 0.10,
        "cost_index": 0.15,
        "mechanical_strength": 0.15,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Dairy: high moisture + fat → dual barrier, thermoform trays
    "Dairy & Plant Milks": {
        "barrier_margin": 0.35,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Pickles/sauces: acid resistance + barrier; rigid/spouted format
    "Pickles, Sauces & Ferments": {
        "barrier_margin": 0.30,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.15,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
    # Grains/flours: bulk, cost-sensitive; sack format preferred
    "Pantry Staples & Grains": {
        "barrier_margin": 0.25,
        "gauge_thickness": 0.10,
        "cost_index": 0.20,
        "mechanical_strength": 0.15,
        "compostability": 0.10,
        "format_suitability": 0.20
    },
    # Meat/fish: extreme perishability; vacuum pouch format
    "Meat, Fish & Proteins": {
        "barrier_margin": 0.35,
        "gauge_thickness": 0.05,
        "cost_index": 0.10,
        "mechanical_strength": 0.10,
        "compostability": 0.10,
        "format_suitability": 0.30
    },
}


# ──────────────────────────────────────────────────────────────────────
# Format Suitability Scoring
# ──────────────────────────────────────────────────────────────────────
# Maps food categories → ideal packaging form-factor keywords.
# Materials whose trade_name/layer_structure match get high scores.
# ──────────────────────────────────────────────────────────────────────

CATEGORY_FORMAT_PREFERENCES: Dict[str, Dict[str, float]] = {
    "Bakery & Extruded Snacks": {
        # Best: metallized barrier pouches/laminates
        "pouch": 9.0, "laminate": 9.0, "bio-pouch": 9.0, "barrier": 8.5,
        "film": 8.0, "vacuum": 7.5, "box": 6.0,
        # Penalize: sacks, trays, mesh, jute, cups
        "sack": 3.0, "tray": 3.5, "punnet": 2.0, "mesh": 1.0,
        "jute": 1.0, "cup": 3.0, "bottle": 2.0, "jar": 2.0,
        "bag": 5.0,
    },
    "Confectionery & Sweets": {
        "pouch": 9.0, "laminate": 9.0, "box": 8.5, "bio-pouch": 9.0,
        "film": 8.0, "barrier": 8.5,
        "sack": 2.0, "tray": 5.0, "punnet": 2.0, "mesh": 1.0,
        "jute": 1.0, "cup": 4.0, "bottle": 2.0, "jar": 5.0,
        "bag": 5.0, "vacuum": 6.0,
    },
    "Spices & Dry Powders": {
        "pouch": 9.0, "laminate": 9.0, "bio-pouch": 9.0,
        "barrier": 8.5, "film": 8.0, "jar": 7.0,
        "sack": 3.0, "tray": 2.0, "punnet": 1.0, "mesh": 1.0,
        "jute": 2.0, "cup": 2.0, "bottle": 4.0,
        "bag": 5.0, "vacuum": 7.0, "box": 5.0,
    },
    "Fats, Butters & Oils": {
        "bottle": 9.5, "jar": 9.0, "pouch": 6.0, "spouted": 8.5,
        "can": 7.0, "barrier": 7.0,
        "sack": 1.0, "tray": 2.0, "punnet": 1.0, "mesh": 1.0,
        "jute": 1.0, "cup": 3.0, "laminate": 5.0,
        "bag": 2.0, "vacuum": 4.0, "box": 3.0, "film": 4.0,
    },
    "Horticultural Produce & Fruits": {
        "punnet": 9.5, "tray": 9.0, "mesh": 8.5, "perforated": 9.0,
        "breathab": 9.0, "bag": 7.0, "film": 7.0,
        "sack": 3.0, "pouch": 5.0, "laminate": 3.0,
        "jute": 5.0, "cup": 2.0, "bottle": 1.0, "jar": 1.0,
        "vacuum": 2.0, "box": 6.0, "barrier": 4.0,
    },
    "Dairy & Plant Milks": {
        "tray": 9.0, "cup": 8.5, "pouch": 8.0, "vacuum": 8.5,
        "barrier": 8.0, "film": 7.5, "laminate": 8.0, "bottle": 7.0,
        "sack": 1.0, "punnet": 3.0, "mesh": 1.0,
        "jute": 1.0, "jar": 6.0,
        "bag": 4.0, "box": 5.0,
    },
    "Pickles, Sauces & Ferments": {
        "jar": 9.5, "bottle": 9.0, "spouted": 9.0, "pouch": 7.5,
        "can": 8.0, "barrier": 7.0, "retort": 8.5,
        "sack": 1.0, "tray": 2.0, "punnet": 1.0, "mesh": 1.0,
        "jute": 1.0, "cup": 3.0, "laminate": 6.0,
        "bag": 3.0, "vacuum": 5.0, "box": 3.0, "film": 5.0,
    },
    "Pantry Staples & Grains": {
        "sack": 9.0, "bag": 8.5, "pouch": 8.0, "jute": 7.5,
        "barrier": 7.0, "laminate": 7.0, "box": 6.0,
        "tray": 3.0, "punnet": 1.0, "mesh": 2.0,
        "cup": 2.0, "bottle": 1.0, "jar": 3.0,
        "vacuum": 5.0, "film": 6.0,
    },
    "Meat, Fish & Proteins": {
        "vacuum": 9.5, "pouch": 9.0, "shrink": 9.0, "tray": 8.5,
        "barrier": 8.5, "laminate": 8.0, "film": 8.0, "retort": 8.0,
        "sack": 1.0, "punnet": 4.0, "mesh": 1.0,
        "jute": 1.0, "cup": 2.0, "bottle": 1.0, "jar": 2.0,
        "bag": 5.0, "box": 4.0,
    },
}


def _compute_format_suitability(
    trade_name: str,
    layer_structure: str,
    category: str
) -> float:
    """
    Scores how well a material's physical form-factor matches the
    packaging needs of the given food category (1.0–10.0 scale).

    Uses a two-tier keyword approach:
    - PRIMARY keywords (sack, pouch, tray, bottle, jar, cup, mesh, jute, punnet)
      define the physical form-factor and take highest priority.
    - SECONDARY keywords (barrier, laminate, film, vacuum, shrink)
      are descriptive modifiers that can only influence the score if
      no primary keyword was found.
    """
    prefs = CATEGORY_FORMAT_PREFERENCES.get(category, {})
    if not prefs:
        return 6.0  # Neutral default for unknown categories

    combined = (trade_name + " " + layer_structure).lower()

    # Primary form-factor identifiers (the physical packaging shape)
    PRIMARY_KEYWORDS = {
        "sack", "pouch", "bio-pouch", "tray", "punnet", "bottle", "jar",
        "cup", "mesh", "jute", "bag", "box", "can"
    }

    # Check primary keywords first
    primary_scores = []
    secondary_scores = []

    for keyword, score in prefs.items():
        if keyword in combined:
            if keyword in PRIMARY_KEYWORDS:
                primary_scores.append(score)
            else:
                secondary_scores.append(score)

    if primary_scores:
        # When multiple primary keywords match (e.g. "pouch" + "bag"),
        # use the weighted average, biased toward the best match
        primary_scores.sort(reverse=True)
        if len(primary_scores) == 1:
            return primary_scores[0]
        # Weighted: 70% best primary, 30% average of rest
        best = primary_scores[0]
        rest_avg = sum(primary_scores[1:]) / len(primary_scores[1:])
        return round(best * 0.7 + rest_avg * 0.3, 1)

    if secondary_scores:
        # No primary match; use best secondary but cap at 7.0
        # (descriptive keywords alone shouldn't score as high as a proper format match)
        return min(max(secondary_scores), 7.0)

    return 5.0  # Neutral default


def rank_materials_topsis(
    candidates_data: List[Dict[str, Any]],
    weights: Dict[str, float] = None,
    commodity_category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Ranks candidate packaging materials using the TOPSIS method
    (Technique for Order Preference by Similarity to Ideal Solution).

    Now category-aware: uses per-category weight profiles and a
    format_suitability criterion that penalises mismatched packaging
    form-factors (e.g. sacks for cookies, pouches for oils).
    """
    if not candidates_data:
        return []

    if len(candidates_data) == 1:
        candidates_data[0]["topsis_score"] = 0.95
        return candidates_data

    # Select weight profile
    if weights:
        w_dict = weights
    elif commodity_category and commodity_category in CATEGORY_WEIGHT_PROFILES:
        w_dict = CATEGORY_WEIGHT_PROFILES[commodity_category]
    else:
        w_dict = DEFAULT_WEIGHTS

    w_vec = np.array([
        w_dict["barrier_margin"],
        w_dict["gauge_thickness"],
        w_dict["cost_index"],
        w_dict["mechanical_strength"],
        w_dict["compostability"],
        w_dict["format_suitability"]
    ], dtype=float)
    # Ensure weights sum to 1.0
    w_vec = w_vec / np.sum(w_vec)

    # Construct decision matrix X (m x 6)
    matrix = []
    for item in candidates_data:
        mat = item.get("db_material")
        trade_name = getattr(mat, "trade_name", "") if mat else item.get("trade_name", "")
        layer_structure = getattr(mat, "layer_structure", "") if mat else item.get("layer_structure", "")
        fmt_score = _compute_format_suitability(
            trade_name=trade_name,
            layer_structure=layer_structure,
            category=commodity_category or ""
        )
        item["format_suitability"] = fmt_score  # store for debugging

        row = [
            float(item["barrier_margin"]),
            float(item["nominal_thickness_um"]),
            float(item["cost_index"]),
            float(item["puncture_strength_rating"]),
            float(item["compostability_score"]),
            float(fmt_score)
        ]
        matrix.append(row)

    X = np.array(matrix, dtype=float)
    m, n = X.shape

    # 1. Vector Normalization
    norms = np.sqrt(np.sum(X ** 2, axis=0))
    # Avoid zero division
    norms[norms == 0] = 1.0
    R = X / norms

    # 2. Weighted Normalized Matrix
    V = R * w_vec

    # 3. Determine Ideal Solutions (A+ and A-)
    ideal_positive = np.zeros(n)
    ideal_negative = np.zeros(n)

    for j in range(n):
        if CRITERIA_BENEFIT_FLAGS[j]:
            ideal_positive[j] = np.max(V[:, j])
            ideal_negative[j] = np.min(V[:, j])
        else:
            ideal_positive[j] = np.min(V[:, j])
            ideal_negative[j] = np.max(V[:, j])

    # 4. Compute Euclidean Distances to A+ and A-
    dist_pos = np.sqrt(np.sum((V - ideal_positive) ** 2, axis=1))
    dist_neg = np.sqrt(np.sum((V - ideal_negative) ** 2, axis=1))

    # 5. Calculate Relative Closeness to Ideal Solution C_i = S- / (S+ + S-)
    total_dist = dist_pos + dist_neg
    total_dist[total_dist == 0] = 1e-9
    closeness_scores = dist_neg / total_dist

    # Attach scores and rank
    ranked_candidates = []
    for i, item in enumerate(candidates_data):
        item_copy = dict(item)
        item_copy["topsis_score"] = round(float(closeness_scores[i]), 4)
        ranked_candidates.append(item_copy)

    # Sort descending by topsis_score
    ranked_candidates.sort(key=lambda x: x["topsis_score"], reverse=True)
    return ranked_candidates
