import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.commodity import Commodity
from app.schemas.simulation import SimulationRequest, SimulationResponse, DegradationDataPoint
from app.core.exceptions import CommodityNotFoundError
from app.services.food_science.barrier_calculator import estimate_pouch_surface_area
from app.services.food_science.sorption_isotherms import moisture_to_water_activity
from app.services.food_science.commodity_resolver import get_or_synthesize_commodity
from app.services.food_science.degradation_kinetics import (
    compute_lipid_oxidation_rate,
    compute_microbial_growth_rate
)

def run_shelf_life_simulation(
    req: SimulationRequest,
    db: Session
) -> SimulationResponse:
    # 1. Fetch or Synthesize Commodity Baseline (supports any custom or unlisted food product)
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

    surface_area = req.package_surface_area_m2 or estimate_pouch_surface_area(req.product_net_weight_g)
    w_prod_g = req.product_net_weight_g
    w_fat_kg = max((w_prod_g * (commodity.fat_pct / 100.0)) / 1000.0, 0.001)

    # Initial states
    current_moisture = commodity.moisture_pct
    current_pv = 1.0 if commodity.fat_pct > 0.5 else 0.0
    current_aw = commodity.water_activity

    crit_moisture = commodity.critical_moisture_pct
    crit_pv = commodity.critical_pv_meq_kg or 10.0

    # Anhydrous fats/oils (Ghee, Mustard oil) have aw < 0.3 and are immune to microbial proliferation
    if "Fats" in commodity.category or "Oils" in commodity.category or commodity.fat_pct > 80.0:
        current_log_cfu = 0.0
        crit_log_cfu = 99.0  # Microbial growth never governs pure fats
    elif "Dairy" in commodity.category or "Meat" in commodity.category or "Fish" in commodity.category:
        current_log_cfu = 1.0
        crit_log_cfu = 3.0  # FSSAI threshold for fresh perishable dairy/meat
    else:
        current_log_cfu = 2.0
        crit_log_cfu = 6.0  # Standard 10^6 CFU/g limit for staples and snacks

    is_respiring = commodity.respiration_rate > 1.0 or "Horticultural" in commodity.category

    # Precompute kinetic rates
    daily_pv_rate = compute_lipid_oxidation_rate(
        temp_c=req.storage_temperature_c,
        fat_pct=commodity.fat_pct,
        film_otr=req.film_otr_cc_m2_day_atm
    )

    curve_data: List[DegradationDataPoint] = []
    failed_day: int = 0
    failure_reason: str = ""
    kinetic_model: str = ""
    threshold_str: str = ""

    max_days = 730  # Max simulation horizon (2 years)

    # Day 0 initial point
    curve_data.append(
        DegradationDataPoint(
            day=0,
            moisture_pct=round(current_moisture, 2),
            peroxide_value_meq_kg=round(current_pv, 2),
            microbial_log_cfu_g=round(current_log_cfu, 2),
            quality_retention_pct=100.0
        )
    )

    for day in range(1, max_days + 1):
        # 1. Update Water Activity from Moisture
        current_aw = moisture_to_water_activity(current_moisture, commodity.category)

        # 2. Moisture Flux across film (Fickian daily mass gain/loss)
        # Driving force: ambient RH vs food aw * 100
        delta_rh = (req.storage_rh_pct - (current_aw * 100.0)) / 100.0
        daily_water_flux_g = req.film_wvtr_g_m2_day * surface_area * delta_rh
        daily_delta_m_pct = (daily_water_flux_g / w_prod_g) * 100.0
        current_moisture += daily_delta_m_pct

        # 3. Lipid Oxidation
        if commodity.fat_pct > 0.5:
            current_pv += daily_pv_rate

        # 4. Microbial Proliferation
        daily_microbial_rate = compute_microbial_growth_rate(
            temp_c=req.storage_temperature_c,
            aw=current_aw,
            ph=commodity.ph_level
        )
        current_log_cfu += daily_microbial_rate

        # Quality Retention Calculation (0 to 100%)
        m_loss = abs(current_moisture - commodity.moisture_pct) / max(abs(crit_moisture - commodity.moisture_pct), 0.5)
        pv_loss = (current_pv / crit_pv) if commodity.fat_pct > 0.5 else 0.0
        cfu_loss = (current_log_cfu - 2.0) / max(crit_log_cfu - 2.0, 1.0)
        max_degradation = max(m_loss, pv_loss, cfu_loss)
        quality_pct = max(round(100.0 * (1.0 - max_degradation), 1), 0.0)

        # Check for failure trigger
        if not failure_reason:
            if is_respiring:
                # Horticultural respiration failure
                if req.film_otr_cc_m2_day_atm < 500.0 and day >= 4:
                    failed_day = day
                    failure_reason = "Suffocation & Anaerobic Fermentation (Insufficient OTR for Respiration)"
                    kinetic_model = "Michaelis-Menten respiration kinetics"
                    threshold_str = "Headspace O2 < 1.0% causing anaerobic ethanol/acetaldehyde off-flavor"
                elif abs(current_moisture - commodity.moisture_pct) > 7.0:
                    failed_day = day
                    failure_reason = "Transpirational Weight Loss (>8% pod/fruit flaccidity & wilting)"
                    kinetic_model = "Transpirational vapor pressure deficit"
                    threshold_str = "Moisture deficit exceeding critical desiccation threshold"
                elif day >= 65:
                    failed_day = day
                    failure_reason = "Senescence, Anthracnose & Calyx Breakdown"
                    kinetic_model = "Chlorophyllase enzymatic breakdown"
                    threshold_str = "Reached natural postharvest storage lifespan limit"
            elif ("Namkeen" in commodity.category or "Snack" in commodity.category) and current_moisture >= crit_moisture:
                failed_day = day
                failure_reason = f"Loss of Crispness & Sogginess (Moisture > {crit_moisture:.1f}%)"
                kinetic_model = "GAB moisture sorption model"
                threshold_str = f"Critical Moisture threshold breached ({current_moisture:.2f}% >= {crit_moisture:.1f}%)"
            elif commodity.fat_pct > 15.0 and current_pv >= crit_pv:
                failed_day = day
                failure_reason = f"Lipid Oxidative Rancidity (Peroxide Value > {crit_pv:.1f} meq O2/kg)"
                kinetic_model = "First-order free radical auto-oxidation kinetics"
                threshold_str = f"PV threshold breached ({current_pv:.2f} >= {crit_pv:.1f} meq/kg)"
            elif ("Grains" in commodity.category or "Flour" in commodity.category) and current_moisture >= 14.0:
                failed_day = day
                failure_reason = "Moisture Caking (Moisture > 14.0%) & Weevil Growth Trigger"
                kinetic_model = "BET moisture sorption isotherm kinetics"
                threshold_str = f"FSSAI Cereals Moisture Limit breached ({current_moisture:.2f}% >= 14.0%)"
            elif current_log_cfu >= crit_log_cfu:
                failed_day = day
                failure_reason = "Microbial Proliferation (Yeast, Mold & Aerobic Plate Count Exceeded)"
                kinetic_model = "First-order microbial proliferation"
                threshold_str = f"Microbial load breached safe FSSAI limit (log10 CFU/g {current_log_cfu:.2f} >= {crit_log_cfu:.1f})"

        # Sample points: daily for first 15 days, every 3 days up to 60, then every 7 days
        sample_step = 1 if day <= 15 else (3 if day <= 60 else 7)
        if day % sample_step == 0 or (failed_day == day):
            curve_data.append(
                DegradationDataPoint(
                    day=day,
                    moisture_pct=round(current_moisture, 2),
                    peroxide_value_meq_kg=round(current_pv, 2),
                    microbial_log_cfu_g=round(current_log_cfu, 2),
                    quality_retention_pct=quality_pct
                )
            )

        # Stop simulation if failed and recorded 15 days past failure
        if failed_day > 0 and (day >= failed_day + 15 or quality_pct <= 0.0):
            break

    final_shelf_life = failed_day if failed_day > 0 else max_days
    if not failure_reason:
        failure_reason = "Product maintained commercial quality through full test horizon"
        kinetic_model = "Standard ambient steady-state stability"
        threshold_str = "Zero critical safety thresholds breached"

    verdict = "Compliant across specified shelf life" if final_shelf_life >= 90 else "Early failure: packaging barrier or gauge requires upgrade"

    return SimulationResponse(
        commodity_name=commodity.name,
        commodity_category=commodity.category,
        packaging_tested=req.packaging_material_name or f"Custom Film ({req.film_thickness_microns}µm, OTR={req.film_otr_cc_m2_day_atm}, WVTR={req.film_wvtr_g_m2_day})",
        predicted_shelf_life_days=final_shelf_life,
        primary_failure_mode=failure_reason,
        governing_kinetic_model=kinetic_model,
        critical_threshold_breached=threshold_str,
        fssai_safety_verdict=verdict,
        degradation_curve=curve_data
    )
