from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.models.commodity import Commodity
from app.models.packaging_material import PackagingMaterial
from app.schemas.recommendation import PackagingRequirementRequest, RecommendationResponse, CandidateMaterialScore
from app.core.exceptions import CommodityNotFoundError
from app.services.food_science.barrier_calculator import (
    calculate_allowable_wvtr,
    calculate_allowable_otr,
    calculate_horticultural_map_rates,
    estimate_pouch_surface_area
)
from app.services.regulatory.safety_filter import evaluate_tier1_safety
from app.services.regulatory.simulant_matrix import get_prescribed_is9845_simulant
from app.services.recommendation.topsis_engine import rank_materials_topsis
from app.services.food_science.commodity_resolver import get_or_synthesize_commodity

def generate_packaging_recommendation(
    req: PackagingRequirementRequest,
    db: Session
) -> RecommendationResponse:
    # 1. Fetch or Synthesize Commodity (supports any user-defined food or custom chemistry)
    commodity = get_or_synthesize_commodity(
        db=db,
        commodity_name=req.commodity_name,
        category=req.commodity_category,
        moisture_pct=req.moisture_pct,
        fat_pct=req.fat_pct,
        ph_level=req.ph_level,
        water_activity=req.water_activity,
        respiration_rate=req.respiration_rate,
        critical_moisture_pct=req.critical_moisture_pct,
        critical_pv_meq_kg=req.critical_pv_meq_kg
    )

    # 2. Package Surface Area
    surface_area = req.package_surface_area_m2 or estimate_pouch_surface_area(req.package_net_weight_g)

    # 3. Deterministic Mass Transfer Calculations
    is_respiring = commodity.respiration_rate > 1.0 or "Horticultural" in commodity.category

    if is_respiring:
        permissible_otr, map_gas = calculate_horticultural_map_rates(
            respiration_rate_mg_co2_kg_hr=commodity.respiration_rate,
            net_weight_g=req.package_net_weight_g,
            surface_area_m2=surface_area,
            storage_temp_c=req.storage_temperature_c
        )
        permissible_wvtr = 45.0  # Breathable moisture range for produce
    else:
        map_gas = "100% N2 Flushing (prevents lipid auto-oxidation & mold proliferation)" if req.nitrogen_flushing and commodity.fat_pct > 2.0 else "Clean Ambient Air Headspace"
        permissible_wvtr = calculate_allowable_wvtr(
            net_weight_g=req.package_net_weight_g,
            initial_moisture_pct=commodity.moisture_pct,
            critical_moisture_pct=commodity.critical_moisture_pct,
            surface_area_m2=surface_area,
            target_shelf_life_days=req.target_shelf_life_days,
            ambient_rh_pct=req.ambient_relative_humidity_pct,
            food_aw=commodity.water_activity
        )
        permissible_otr = calculate_allowable_otr(
            net_weight_g=req.package_net_weight_g,
            fat_pct=commodity.fat_pct,
            initial_pv=1.0,
            critical_pv=commodity.critical_pv_meq_kg or 10.0,
            surface_area_m2=surface_area,
            target_shelf_life_days=req.target_shelf_life_days,
            nitrogen_flushed=req.nitrogen_flushing
        )

    # 4. Fetch all candidate packaging materials
    all_materials: List[PackagingMaterial] = db.query(PackagingMaterial).all()

    # 5. Tier 1: Hard Regulatory & Safety Filtering
    passed_candidates_data = []
    fallback_candidates_data = []

    for mat in all_materials:
        is_safe, violations = evaluate_tier1_safety(
            material=mat,
            commodity=commodity,
            allowable_wvtr=permissible_wvtr,
            allowable_otr=permissible_otr,
            storage_temp_c=req.storage_temperature_c,
            is_respiring=is_respiring
        )

        # Barrier margin calculation for TOPSIS: higher is safer
        wvtr_margin = permissible_wvtr / max(mat.barrier_wvtr, 0.05)
        otr_margin = permissible_otr / max(mat.barrier_otr, 0.05) if not is_respiring else (mat.barrier_otr / 1000.0)
        barrier_margin = round((wvtr_margin + otr_margin) / 2.0, 3)

        cand_dict = {
            "db_material": mat,
            "barrier_margin": max(barrier_margin, 0.01),
            "nominal_thickness_um": mat.nominal_thickness_um,
            "cost_index": mat.cost_index,
            "puncture_strength_rating": mat.puncture_strength_rating,
            "compostability_score": mat.compostability_score
        }

        if is_safe:
            passed_candidates_data.append(cand_dict)
        else:
            fallback_candidates_data.append(cand_dict)

    # If too few passed Tier 1 (e.g. extreme shelf life or temperature), fallback to closest surviving
    candidates_to_rank = passed_candidates_data if len(passed_candidates_data) >= 2 else (passed_candidates_data + fallback_candidates_data[:5])
    candidates_passed_count = len(passed_candidates_data)

    # 6. Tier 2: TOPSIS MCDM Ranking
    ranked_results = rank_materials_topsis(candidates_to_rank, commodity_category=commodity.category)

    # 7. Prescribe IS 9845 simulant & map to response schema
    simulant_info = get_prescribed_is9845_simulant(
        category=commodity.category,
        ph_level=commodity.ph_level,
        fat_pct=commodity.fat_pct
    )

    top_recommendations: List[CandidateMaterialScore] = []
    for rank_idx, item in enumerate(ranked_results[:5], start=1):
        mat: PackagingMaterial = item["db_material"]
        top_recommendations.append(
            CandidateMaterialScore(
                rank=rank_idx,
                trade_name=mat.trade_name,
                polymer_family=mat.polymer_family,
                layer_structure=mat.layer_structure,
                recommended_gauge_thickness_um=mat.nominal_thickness_um,
                target_otr_cc_m2_day_atm=mat.barrier_otr,
                target_wvtr_g_m2_day=mat.barrier_wvtr,
                topsis_closeness_score=item["topsis_score"],
                sealing_mechanism=mat.sealing_mechanism,
                mechanical_strength_requirement=mat.mechanical_strength_requirement or "Standard Drop & Tear Resistance",
                fssai_clause=mat.fssai_clause,
                prescribed_bis_is_standard=mat.prescribed_bis_is_standard,
                simulant_prescribed=f"{simulant_info['simulant']} ({simulant_info['composition']})",
                cpcb_category=mat.cpcb_category,
                commercial_reference=mat.commercial_trade_reference
            )
        )

    # 8. Build detailed practical suggestion advisory for Top 1 Recommendation
    top_mat = top_recommendations[0] if top_recommendations else None
    suggestion_advisory = None
    if top_mat:
        # Intelligent format selection based on category + material type
        CATEGORY_FORMAT_MAP = {
            "Bakery & Extruded Snacks": "High-Barrier Metallized Stand-Up Pouch (Doypack) with Hermetic Fin-Seal & N₂ Flush",
            "Confectionery & Sweets": "High-Barrier Metallized Flow-Wrap Pouch with Hermetic Lap-Seal & Light-Block Layer",
            "Spices & Dry Powders": "Metallized High-Barrier Stand-Up Pouch with Reclosable Bio-Zipper & Aroma-Lock Seal",
            "Fats, Butters & Oils": "Amber UV-Block Bio-PHA Rigid Bottle / AlOx-PLA Spouted Pouch with Induction Wad Seal",
            "Horticultural Produce & Fruits": "Laser-Microperforated Breathable Pouch with Molded Agri-Residue Bagasse Punnet",
            "Dairy & Plant Milks": "Thermoformed High-Barrier Compostable Tray with Peelable Hermetic Lidding Film",
            "Pickles, Sauces & Ferments": "Acid-Resistant AlOx-PLA Spouted Pouch / Wide-Mouth Bio-PHA Jar with Induction Seal",
            "Pantry Staples & Grains": "4-ply Block-Bottom Kraft Gusset Sack with Hermetic Inner Bio-Barrier Sealant",
            "Meat, Fish & Proteins": "High-Barrier Vacuum Shrink Pouch (Cellulose/AlOx-PLA) with Modified Atmosphere",
            "General Food Commodity": "Stand-Up Barrier Pouch (Doypack) with Hermetic Fin-Seal",
        }
        packaging_format = CATEGORY_FORMAT_MAP.get(commodity.category, CATEGORY_FORMAT_MAP["General Food Commodity"])

        # Fine-tune for specific commodity names
        name_lower = commodity.name.lower()
        if any(k in name_lower for k in ["pickle", "achar"]):
            packaging_format = "Acid-Resistant AlOx-PLA Spouted Pouch / Wide-Mouth Bio-PHA Jar with Induction Seal"
        elif any(k in name_lower for k in ["paneer", "curd", "dahi", "yogurt"]):
            packaging_format = "Thermoformed High-Barrier Compostable Tray with Peelable Hermetic Lidding Film"
        elif any(k in name_lower for k in ["ghee", "oil", "butter"]):
            packaging_format = "Amber UV-Block Bio-PHA Rigid Bottle / AlOx-PLA Spouted Pouch with Induction Wad Seal"

        science_points = []
        if commodity.fat_pct >= 10.0:
            science_points.append(
                f"With {commodity.fat_pct}% fat content, lipid auto-oxidation is the primary quality hazard. Atmospheric oxygen splits unsaturated fatty acids into hydroperoxides and volatile hexanals. The vacuum-metallized barrier (OTR ≤ {top_mat.target_otr_cc_m2_day_atm} cc/m²·day·atm) blocks 99.5% of oxygen and prevents photo-oxidation."
            )
        if commodity.moisture_pct <= 6.0:
            science_points.append(
                f"Initial moisture is low ({commodity.moisture_pct}%), and exceeding critical moisture ({commodity.critical_moisture_pct or 4.0}%) causes rapid loss of crispness. The WVTR barrier (≤ {top_mat.target_wvtr_g_m2_day} g/m²·day) preserves crunchiness even under ambient humidity ({req.ambient_relative_humidity_pct}% RH)."
            )
        if commodity.ph_level <= 4.5:
            science_points.append(
                f"Acidic formulation (pH {commodity.ph_level}) triggers FSSAI Clause 4(3) requiring bio-sealants free from heavy metal crosslinkers to prevent acid corrosion."
            )
        if not science_points:
            science_points.append(
                f"Formulated for balanced moisture-oxygen barrier defense against ambient stresses ({req.storage_temperature_c}°C, {req.ambient_relative_humidity_pct}% RH) maintaining product freshness."
            )

        suggestion_advisory = {
            "packaging_format": packaging_format,
            "food_science_rationale": " ".join(science_points),
            "machine_parameters": {
                "jaw_temp_c": "118°C – 128°C",
                "jaw_temp_note": "Bio-PBS / compostable sealants melt at 115°C–125°C (substantially lower than fossil PE's 140°C–160°C). Calibrate jaws downward to avoid film embrittlement or burn-through.",
                "dwell_time_s": "0.7s – 0.9s",
                "dwell_time_note": "Provides complete thermal conduction through the duplex structure without scorching outer cellulose.",
                "pressure_bar": "3.2 – 3.8 bar",
                "pressure_note": "Uniform pneumatic sealing jaw pressure prevents micro-channel leaks along fin-seal folds.",
                "nitrogen_flushing_protocol": "Food-Grade Nitrogen (N₂ 99.5%+ purity) injected at 0.35 bar backpressure for 0.30s. Target residual headspace O₂ < 0.5%." if req.nitrogen_flushing else "Ambient air headspace with hermetic sealing.",
                "leak_testing": "Perform ASTM D3078 underwater vacuum bubble test (at -25 kPa for 30s) on 2 samples per production shift."
            },
            "storage_logistics_advice": (
                f"Maintain unsealed rollstock/pouches below 28°C and <60% RH. Acclimate rolls for 24h prior to line changeover. "
                f"For distribution, use 5-ply corrugated master cartons (burst test ≥ 12 kg/cm²) with inner bio-liner bags to prevent transit puncture and moisture absorption."
            ),
            "regulatory_roadmap": [
                f"Step 1: Overall Migration Test (OML) per BIS IS 9845 using {simulant_info['simulant']} ({simulant_info['composition']}) — ensure migration ≤ 10 mg/dm² (FSSAI 2018 Cl. 4(4)).",
                "Step 2: Compostability & Ecotoxicity certification per BIS IS/ISO 17088 : 2021 (>90% biodegradation in 180 days; heavy metals within safe thresholds).",
                "Step 3: Central Pollution Control Board (CPCB) Form-VI registration under PWM Rules Category IV for certified compostable packaging.",
                "Step 4: Statutory pack labeling with FSSAI license number, CPCB registration code, and '100% COMPOSTABLE - IS/ISO 17088' marking."
            ],
            "procurement_advice": {
                "converters": "Futamura NatureFlex (cellulose barrier film), TrueGreen / TIPA (flexible bio-films), Chuk! / Pakka (bagasse & agri-residue pulp).",
                "commercial_tip": "Duplex metallized cellulose/Bio-PBS offers 18–22% cost savings over triplex structures while achieving identical barrier protection. Typical converter MOQ is ~10,000 pre-formed pouches.",
                "rfq_brief": f"RFQ: Seeking certified compostable high-barrier laminate for {req.package_net_weight_g}g {commodity.name}. Spec: {top_mat.trade_name} ({top_mat.layer_structure}, gauge ~{top_mat.recommended_gauge_thickness_um}µm). Required WVTR ≤ {top_mat.target_wvtr_g_m2_day} g/m²·day, OTR ≤ {top_mat.target_otr_cc_m2_day_atm} cc/m²·day. Compliance: BIS IS/ISO 17088 & FSSAI Packaging Regulations 2018."
            }
        }

    return RecommendationResponse(
        commodity_name=commodity.name,
        commodity_category=commodity.category,
        computed_permissible_wvtr=round(permissible_wvtr, 2),
        computed_permissible_otr=round(permissible_otr, 2),
        map_gas_recommended=map_gas,
        candidates_evaluated=len(all_materials),
        candidates_passed_tier1=candidates_passed_count,
        top_recommendations=top_recommendations,
        suggestion_advisory=suggestion_advisory
    )
