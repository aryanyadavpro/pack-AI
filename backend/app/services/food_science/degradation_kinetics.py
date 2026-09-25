import math

GAS_CONSTANT_R = 8.314  # J / (mol * K)

def arrhenius_rate(k_ref: float, ea_j_mol: float, temp_c: float, temp_ref_c: float = 25.0) -> float:
    """
    Computes temperature-adjusted reaction rate constant using Arrhenius equation.
    """
    t_kelvin = temp_c + 273.15
    t_ref_kelvin = temp_ref_c + 273.15
    exponent = -(ea_j_mol / GAS_CONSTANT_R) * ((1.0 / t_kelvin) - (1.0 / t_ref_kelvin))
    # Cap exponent to avoid overflow
    exponent = min(max(exponent, -15.0), 15.0)
    return k_ref * math.exp(exponent)

def compute_lipid_oxidation_rate(temp_c: float, fat_pct: float, film_otr: float) -> float:
    """
    Computes daily Peroxide Value increase (meq O2/kg fat / day)
    governed by film oxygen ingress and temperature.
    Ea for lipid oxidation in fried Indian snacks is typically ~60 kJ/mol.
    """
    if fat_pct <= 0.5:
        return 0.0

    # Baseline daily PV increase at 25°C with OTR = 1.0 cc/m2.day.atm
    base_k = 0.035
    k_t = arrhenius_rate(base_k, 58000.0, temp_c, 25.0)
    
    # OTR dependency: higher OTR allows faster oxidation
    otr_factor = math.pow(film_otr / 2.0, 0.6) if film_otr > 0 else 0.1
    return round(k_t * otr_factor, 4)

def compute_microbial_growth_rate(temp_c: float, aw: float, ph: float) -> float:
    """
    Computes daily log10 CFU/g proliferation rate.
    Microbial growth is suppressed when aw < 0.60 or pH < 3.8.
    """
    if aw < 0.60:
        return 0.0  # Safe from microbial proliferation (dry foods)

    if temp_c < 0:
        return 0.005  # Frozen dormancy

    # Temperature factor
    if temp_c <= 4.0:
        temp_factor = 0.05  # Cold chain suppression
    elif temp_c <= 15.0:
        temp_factor = 0.25
    elif temp_c <= 37.0:
        temp_factor = 1.0  # Mesophilic optimum
    else:
        temp_factor = 0.7

    # Water activity factor
    aw_factor = max((aw - 0.60) / 0.39, 0.0)

    # pH factor (optimal ~ 6.5; inhibited below 4.0)
    ph_factor = min(max((ph - 3.5) / 3.0, 0.05), 1.0)

    max_daily_log_rate = 0.35  # Maximum log units per day under ambient conditions
    return round(max_daily_log_rate * temp_factor * aw_factor * ph_factor, 4)
