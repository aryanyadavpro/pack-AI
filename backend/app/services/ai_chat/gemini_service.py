import json
import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings

CANONICAL_COMMODITIES = [
    "Bikaneri Bhujia",
    "Fresh Malai Paneer",
    "Desi Cow Ghee",
    "Traditional Mango Achar (In Mustard Oil)",
    "Chakki Fresh Whole Wheat Atta",
    "Besan (Gram Flour)",
    "Besan Ladoo",
    "Gujarati Khakhra",
    "Kerala Banana Chips (In Coconut Oil)",
    "Fresh Okra (Bhindi)",
    "Alphonso Mangoes (GI Tagged Ratnagiri)",
    "Dahi (Indian Curd)",
    "Indian Orthodox Black Tea",
    "Red Chilli Powder (Lal Mirch)",
    "Ground Turmeric (Haldi Powder)",
    "Toor Dal (Split Pigeon Peas)",
    "Cold-Pressed Mustard Oil (Kachi Ghani)",
    "Freshwater Fish (Rohu Steaks)",
    "Fresh Goat Meat (Chevon / Mutton)",
    "Roasted Urad Dal Papad",
    "Rasgulla (In Light Syrup)",
    "Gulab Jamun (In Sugar Syrup)",
    "Kaju Katli",
    "Khoa / Mawa (Desiccated Milk Solids)",
    "Nashik Red Onions",
    "Green Chillies (Hari Mirch)",
    "Basmati Rice (Aged)"
]

SYSTEM_PROMPT = """You are the BioPack AI Principal Food Packaging Scientist & Polymer Engineer.
You are calibrated for global and Indian agro-food commodities, polymer mass-transfer thermodynamics, and statutory FSSAI (Packaging) Regulations 2018 / BIS IS/ISO 17088.

YOUR CORE MANDATE:
You are a universal formulation engine. You must accept ANY food commodity, agricultural crop, processed food, beverage, or artisanal product that the user provides (e.g. strawberries, dragonfruit, cold-chain paneer, cashew butter, kombucha, spicy makhana, cookies, tempeh, fish steaks, microgreens, etc.).
NEVER force or map the user's food into a hardcoded static list or unrelated proxy. Always preserve and analyze the user's EXACT food product.

When a user speaks to you:
1. If the user is just saying hi/greeting or asking a general question not about packaging a food product, reply naturally and helpfully. Set "is_food_query": false, and write a friendly greeting in "greeting_reply".
2. If the user asks about packaging ANY food product:
   - Set "is_food_query": true
   - In "commodity_name": Keep the user's actual product name (e.g., "Fresh Organic Strawberries", "Artisanal Cow Ghee", "Spicy Roasted Makhana", "Cold-Brew Coffee Concentrate").
   - In "category": Classify into the most accurate food category among:
     ["Horticultural Produce & Fruits", "Bakery & Extruded Snacks", "Dairy & Plant Milks", "Confectionery & Sweets", "Pickles, Sauces & Ferments", "Pantry Staples & Grains", "Spices & Dry Powders", "Fats, Butters & Oils", "Meat, Fish & Proteins", "General Food Commodity"]
   - Accurately estimate or extract the food's baseline chemical & physical parameters:
     - "moisture_pct": float (0.0 to 100.0)
     - "fat_pct": float (0.0 to 100.0)
     - "ph_level": float (1.0 to 14.0)
     - "water_activity": float (0.05 to 1.0)
     - "respiration_rate": float (mg CO2/kg·hr, 0.0 for non-produce, 5.0 to 30.0 for respiring produce)
     - "critical_moisture_pct": float (spoilage / sogginess limit)
     - "critical_pv_meq_kg": float (typically 10.0 for snacks, 5.0 for pure fats)
   - Extract operational parameters:
     - "net_weight_g": float (extract from user or default 250.0)
     - "target_days": int (extract from user or default appropriately)
     - "temp_c": float (storage temperature in °C, e.g. 4.0 for cold-chain, 30.0 for ambient, 40.0 for extreme heat)
     - "rh_pct": float (relative humidity in %, e.g. 85.0 for humid/refrigerated, 65.0 standard, 35.0 arid)
   - In "context_note": Write a rich, expert 2-3 sentence technical food science advisory addressing their specific product (explaining moisture sorption, enzymatic browning, lipid rancidity, fungal rot, gas exchange, acid leaching, or seal integrity).

You MUST return valid JSON ONLY with the following schema:
{
  "is_food_query": true,
  "greeting_reply": "",
  "commodity_name": "Fresh Organic Strawberries",
  "category": "Horticultural Produce & Fruits",
  "moisture_pct": 90.5,
  "fat_pct": 0.3,
  "ph_level": 3.4,
  "water_activity": 0.98,
  "respiration_rate": 18.0,
  "critical_moisture_pct": 95.0,
  "critical_pv_meq_kg": 10.0,
  "net_weight_g": 250.0,
  "target_days": 12,
  "temp_c": 4.0,
  "rh_pct": 85.0,
  "context_note": "Fresh strawberries exhibit high metabolic respiration and active transpiration, making them vulnerable to Botrytis cinerea rot and condensation fogging. Micro-perforated bio-PBS/PLA films or sugarcane bagasse punnets provide optimal equilibrium modified atmosphere (EMA) and anti-fog moisture permeability without drying the fruit."
}
"""

def parse_with_gemini(user_message: str) -> Optional[Dict[str, Any]]:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"User Message: {user_message}\n\nRespond with valid JSON only."
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                raw_json = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                parsed = json.loads(raw_json)
                return parsed
    except Exception as e:
        print(f"[Gemini 2.5] API call error or timeout: {e}")
        return None

    return None


def explain_packaging_with_gemini(
    commodity_name: str,
    net_weight_g: float,
    target_days: int,
    material_trade_name: str,
    layer_structure: str,
    temp_c: float = 35.0,
    rh_pct: float = 75.0,
    nitrogen_flush: bool = True
) -> Optional[Dict[str, Any]]:
    """
    Translates chemical engineering specs into practical, plain-English manufacturer packaging guidance
    answering: What kind of box/pouch is this, how does it look and feel, why these layers work,
    factory packing steps, and a ready-to-send vendor procurement brief.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"""You are a senior packaging engineer and consumer food business expert.
A food business owner has a product: {net_weight_g}g of {commodity_name}.
They want a shelf life of {target_days} days under tropical Indian weather ({temp_c}°C, {rh_pct}% Relative Humidity).
Our food physics recommendation engine calculated this optimal bioplastic packaging:
- Trade Specification: {material_trade_name}
- Engineered Layers: {layer_structure}
- Headspace Flush: {"100% Food-Grade Nitrogen Flush (Displaces O2)" if nitrogen_flush else "Ambient Air"}

The business owner cannot understand polymer jargon (like "Met-PLA", "Bio-PBS", "OTR", "WVTR", "NatureFlex").
They ask: "What kind of box or packaging should I actually use from this data?"

Explain in clear, practical, vivid, easy-to-understand plain English.
Return valid JSON with exactly this structure:
{{
  "box_or_pouch_type": "Exact physical packaging format (e.g. Stand-Up Zipper Pouch (Doypack), Pillow Pouch, or Kraft Paper Carton Box with Inner Foil Liner Bag)",
  "appearance_and_touch": "Vivid description of what this looks and feels like in human hands and on store shelves (textures, colors, opacity, stiffness)",
  "plain_english_layers": [
    {{"layer": "Outside Layer (e.g. 70gsm Kraft Paper)", "role": "What it does in simple terms (e.g. natural brown eco-look, stiff shape, branding print surface)"}},
    {{"layer": "Middle Barrier (e.g. 19µm Met-PLA / NatureFlex)", "role": "What it does in simple terms (e.g. the shiny silver foil shield that keeps moisture out so food stays crunchy, and keeps air out so oil doesn't spoil)"}},
    {{"layer": "Inside Sealant (e.g. 30µm Bio-PBS)", "role": "What it does in simple terms (e.g. the food-contact heat seal layer that melts at 120°C to lock the bag airtight)"}}
  ],
  "why_this_works": "2-3 sentences explaining why this exact combo prevents spoilage (e.g. stops crisp snacks from becoming soggy in monsoon humidity and prevents fried oil rancidity)",
  "packaging_line_steps": [
    "Step 1: Weigh...",
    "Step 2: Fill...",
    "Step 3: Flush with Nitrogen...",
    "Step 4: Heat-seal...",
    "Step 5: Pack..."
  ],
  "vendor_procurement_rfq": "A ready-to-copy-paste 2-3 sentence purchase specification they can send on WhatsApp or Email to packaging suppliers/converters to get price quotes."
}}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        with httpx.Client(timeout=14.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                raw_json = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                parsed = json.loads(raw_json)
                return parsed
    except Exception as e:
        print(f"[Gemini 2.5 Packaging Explainer] Error: {e}")
        return None

    return None


def get_packaging_explanation(
    commodity_name: str,
    net_weight_g: float,
    target_days: int,
    material_trade_name: str,
    layer_structure: str,
    temp_c: float = 35.0,
    rh_pct: float = 75.0,
    nitrogen_flush: bool = True
) -> Dict[str, Any]:
    """
    Calls Gemini 2.5 Flash to generate plain-English packaging breakdown,
    falling back to calibrated deterministic guidance if LLM is offline.
    """
    res = explain_packaging_with_gemini(
        commodity_name=commodity_name,
        net_weight_g=net_weight_g,
        target_days=target_days,
        material_trade_name=material_trade_name,
        layer_structure=layer_structure,
        temp_c=temp_c,
        rh_pct=rh_pct,
        nitrogen_flush=nitrogen_flush
    )
    if res and res.get("box_or_pouch_type"):
        return res

    # Deterministic fallback
    is_snack = "Bhujia" in commodity_name or "Khakhra" in commodity_name or "Chips" in commodity_name or "Papad" in commodity_name
    format_type = "Stand-Up Zipper Pouch (Doypack) or Inner Sealed Barrier Liner Bag inside Paperboard Box" if is_snack else "Hermetically Sealed Thermoformed Bioplastic Tray / Multi-ply Barrier Pouch"
    
    return {
        "box_or_pouch_type": format_type,
        "appearance_and_touch": "Earthy natural Kraft paper finish on the exterior for a premium sustainable artisan look, with a bright mirror-like silver metallized barrier inside that feels substantial, crisp, and high-barrier.",
        "plain_english_layers": [
            {
                "layer": "Outer Layer (FSC Virgin Kraft Paper ~70gsm)",
                "role": "Gives structural rigidity, enables the pouch to stand upright on retail shelves, and provides an eco-friendly paper print surface for branding."
            },
            {
                "layer": "Middle Barrier (19µm Met-PLA / NatureFlex Metallized Cellulose)",
                "role": "The critical silver protective armor. Blocks 99.9% of humidity and oxygen so fried oils do not go rancid and the snack stays perfectly crisp even in monsoon humidity."
            },
            {
                "layer": "Inner Food Contact Layer (30µm Bio-PBS Sealant)",
                "role": "Certified food-safe compostable sealant that melts cleanly at 115°C–125°C on heat-sealing jaws to create an airtight hermetic seal holding the nitrogen flush."
            }
        ],
        "why_this_works": f"For {net_weight_g}g of {commodity_name}, the primary spoilage risk is moisture absorption (causing sogginess) and oil oxidation (causing foul rancid odor). This multi-ply laminate keeps moisture transmission below 0.65 g/m²·day and oxygen below 0.79 cc/m²·day, guaranteeing {target_days} days of crispness at {temp_c}°C.",
        "packaging_line_steps": [
            f"Step 1 (Weighing): Accurately dose {net_weight_g}g of {commodity_name} using a multi-head weigher into the open mouth of the pre-formed pouch.",
            "Step 2 (Nitrogen Purge): Insert a food-grade nitrogen gas injection nozzle for 0.3s to displace atmospheric oxygen down to < 1.0% residual O2.",
            "Step 3 (Heat Sealing): Clamp heat-seal jaws at 118°C–125°C with 0.8s dwell time and 3.5 bar pressure to fuse the inner Bio-PBS liner hermetically.",
            "Step 4 (Quality Inspection): Perform a quick underwater dunk bubble test on 1 of every 50 packs to verify zero pinhole seal leakage.",
            "Step 5 (Secondary Boxing): Pack 24 retail pouches into a corrugated master shipping carton for interstate logistics."
        ],
        "vendor_procurement_rfq": f"RFQ: Seeking certified compostable high-barrier laminate for {net_weight_g}g {commodity_name}. Specification: Multi-ply FSC Kraft Paper (70gsm) / Met-PLA or NatureFlex (19µm) / Bio-PBS (30µm). Required WVTR < 1.0 g/m²·day, OTR < 2.0 cc/m²·day. Compliance: BIS IS/ISO 17088 & FSSAI Packaging Regulations 2018."
    }


