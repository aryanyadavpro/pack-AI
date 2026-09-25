import math
from typing import Tuple, Optional

def estimate_pouch_surface_area(net_weight_g: float) -> float:
    """
    Estimates standard rectangular food packaging surface area (m2)
    based on product net weight (g) using standard flexible packaging empirical sizing.
    Typical 200g pouch ~ 0.045 m2 (e.g. 15cm x 15cm two-sided).
    """
    if net_weight_g <= 0:
        return 0.045
    # Empirical scale: Area ~ 0.045 * (Weight / 200) ^ (2/3)
    return round(0.045 * math.pow(net_weight_g / 200.0, 2.0 / 3.0), 4)

def calculate_allowable_wvtr(
    net_weight_g: float,
    initial_moisture_pct: float,
    critical_moisture_pct: float,
    surface_area_m2: float,
    target_shelf_life_days: int,
    ambient_rh_pct: float,
    food_aw: float
) -> float:
    """
    Calculates maximum permissible Water Vapor Transmission Rate (WVTR in g/m2.day)
    using steady-state Fickian diffusion across exposed surface area.
    """
    if surface_area_m2 <= 0:
        surface_area_m2 = estimate_pouch_surface_area(net_weight_g)
    if target_shelf_life_days <= 0:
        target_shelf_life_days = 30

    delta_m_pct = critical_moisture_pct - initial_moisture_pct
    delta_m_max_g = net_weight_g * (abs(delta_m_pct) / 100.0)

    # Relative humidity driving force
    internal_rh = food_aw * 100.0
    delta_rh_fraction = abs(ambient_rh_pct - internal_rh) / 100.0
    if delta_rh_fraction < 0.05:
        delta_rh_fraction = 0.05  # minimum gradient to prevent division by near-zero

    allowable_wvtr = delta_m_max_g / (surface_area_m2 * target_shelf_life_days * delta_rh_fraction)
    return max(round(allowable_wvtr, 2), 0.1)

def calculate_allowable_otr(
    net_weight_g: float,
    fat_pct: float,
    initial_pv: float,
    critical_pv: float,
    surface_area_m2: float,
    target_shelf_life_days: int,
    nitrogen_flushed: bool = True
) -> float:
    """
    Calculates maximum permissible Oxygen Transmission Rate (OTR in cc/m2.day.atm)
    for fat-rich foods based on allowable increase in Peroxide Value (meq O2/kg fat).
    """
    if fat_pct <= 0.5:
        # Non-fat food is not oxygen-oxidation limited; set liberal barrier limit
        return 150.0

    if surface_area_m2 <= 0:
        surface_area_m2 = estimate_pouch_surface_area(net_weight_g)
    if target_shelf_life_days <= 0:
        target_shelf_life_days = 30

    # Weight of fat in kg
    w_fat_kg = (net_weight_g * (fat_pct / 100.0)) / 1000.0
    delta_pv_meq_kg = max(critical_pv - initial_pv, 1.0)

    # Allowable O2 absorbed in milliequivalents
    allowable_o2_meq = delta_pv_meq_kg * w_fat_kg

    # 1 meq O2 = 0.008 g O2
    mass_o2_g = allowable_o2_meq * 0.008

    # Volume of O2 at STP (32 g/mol, 22,400 cc/mol)
    vol_o2_cc = (mass_o2_g / 32.0) * 22400.0

    # Driving force: Ambient O2 partial pressure = 0.2095 atm
    delta_p_o2 = 0.2095 if nitrogen_flushed else 0.15

    allowable_otr = vol_o2_cc / (surface_area_m2 * target_shelf_life_days * delta_p_o2)
    return max(round(allowable_otr, 2), 0.5)

def calculate_horticultural_map_rates(
    respiration_rate_mg_co2_kg_hr: float,
    net_weight_g: float,
    surface_area_m2: float,
    storage_temp_c: float
) -> Tuple[float, str]:
    """
    Calculates equilibrium MAP OTR requirement for respiring produce
    and recommends optimal gas mixture (3-5% O2, 5-8% CO2, balance N2).
    """
    if surface_area_m2 <= 0:
        surface_area_m2 = estimate_pouch_surface_area(net_weight_g)

    # Temperature sensitivity via Arrhenius Q10 = 2.2 (ref temp 10°C)
    q10 = 2.2
    resp_temp_adj = respiration_rate_mg_co2_kg_hr * math.pow(q10, (storage_temp_c - 10.0) / 10.0)

    # Convert mg CO2/kg.hr to cc O2/kg.hr (RQ ~ 1.0; 44g CO2 = 22400cc O2)
    resp_cc_o2_kg_hr = resp_temp_adj * (22400.0 / 44000.0)

    # Produce weight in kg
    w_kg = net_weight_g / 1000.0

    # Total O2 consumed per day = resp_cc_o2_kg_hr * w_kg * 24 hr
    total_o2_day_cc = resp_cc_o2_kg_hr * w_kg * 24.0

    # Target internal O2 = 4% (0.04 atm); driving force = 0.2095 - 0.04 = 0.1695 atm
    driving_force = 0.1695
    required_otr = total_o2_day_cc / (surface_area_m2 * driving_force)

    gas_rec = "5% O2, 8% CO2, balance N2 (MAP prevents anaerobic off-flavors & rapid senescence)"
    return max(round(required_otr, 1), 1000.0), gas_rec
