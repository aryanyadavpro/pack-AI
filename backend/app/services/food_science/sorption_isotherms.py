import math

# Calibrated GAB isotherm parameters: (M0: monolayer moisture %, C: Guggenheim constant, K: factor)
CATEGORY_GAB_PARAMS = {
    "Indian Snacks & Namkeen": {"M0": 2.8, "C": 14.5, "K": 0.85},
    "Traditional Sweets (Mithai)": {"M0": 8.5, "C": 8.2, "K": 0.90},
    "Grains & Flours": {"M0": 6.5, "C": 18.0, "K": 0.78},
    "Spices & Condiments": {"M0": 5.2, "C": 12.0, "K": 0.82},
    "Dairy Products": {"M0": 4.5, "C": 10.5, "K": 0.88},
    "Pulses & Legumes": {"M0": 5.8, "C": 16.0, "K": 0.80},
    "Default": {"M0": 5.0, "C": 12.0, "K": 0.82}
}

def moisture_to_water_activity(moisture_pct: float, category: str) -> float:
    """
    Inverts the GAB sorption isotherm to estimate water activity a_w (0.0 to 1.0)
    from moisture content (pct dry/wet basis approximation).
    """
    params = CATEGORY_GAB_PARAMS.get(category, CATEGORY_GAB_PARAMS["Default"])
    m0 = params["M0"]
    c = params["C"]
    k = params["K"]

    # Clamp moisture to valid positive range
    m = max(moisture_pct, 0.2)

    # Quadratic solution for a_w in GAB equation:
    # M = (M0 * C * K * aw) / ((1 - K*aw) * (1 - K*aw + C*K*aw))
    # Let y = K * aw. Then M = (M0 * C * y) / ((1 - y) * (1 + (C - 1)*y))
    # M * (1 + (C - 2)*y - (C - 1)*y^2) = M0 * C * y
    # (C - 1)*M * y^2 - [M*(C - 2) - M0*C]*y - M = 0
    alpha = (c - 1.0) * m
    beta = -(m * (c - 2.0) - m0 * c)
    gamma = -m

    disc = beta * beta - 4.0 * alpha * gamma
    if disc < 0:
        return min(max(m / 25.0, 0.05), 0.98)

    sqrt_disc = math.sqrt(disc)
    # Physical root lies between 0 and 1
    y1 = (-beta + sqrt_disc) / (2.0 * alpha) if abs(alpha) > 1e-6 else m / (m0 * c)
    y2 = (-beta - sqrt_disc) / (2.0 * alpha) if abs(alpha) > 1e-6 else 0.0

    y = y1 if (0.0 <= y1 <= 1.0) else y2
    aw = y / k if k > 0 else 0.5
    return min(max(round(aw, 3), 0.05), 0.99)

def water_activity_to_moisture(aw: float, category: str) -> float:
    """
    Computes equilibrium moisture content (%) from water activity a_w using GAB equation.
    """
    params = CATEGORY_GAB_PARAMS.get(category, CATEGORY_GAB_PARAMS["Default"])
    m0 = params["M0"]
    c = params["C"]
    k = params["K"]

    aw = min(max(aw, 0.01), 0.98)
    denom = (1.0 - k * aw) * (1.0 - k * aw + c * k * aw)
    if denom <= 0:
        return 20.0
    m = (m0 * c * k * aw) / denom
    return round(m, 2)
