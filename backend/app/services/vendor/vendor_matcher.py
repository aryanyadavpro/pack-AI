from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.vendor import VendorSKU

INDIAN_SUPPLIER_CATALOG = [
    {
        "supplier_name": "Futamura Chemical India Pvt Ltd",
        "material_trade_name": "NatureFlex™ NVS (Futamura) + ITC Paperboards Indobev",
        "sku_code": "FUT-NF-NVS23",
        "polymer_family": "Regenerated Cellulose",
        "nominal_gauge_um": 32.0,
        "barrier_otr": 65.4,
        "barrier_wvtr": 4.6,
        "min_order_qty_units": 10000,
        "price_per_kg_inr": 380.0,
        "price_per_unit_inr": 1.45,
        "lead_time_days": 10,
        "supplier_location": "Gurugram, Haryana",
        "cpcb_cert_number": "CPCB/PWM/IV/2023/1029"
    },
    {
        "supplier_name": "ITC Limited (Paperboards & Specialty Papers Division)",
        "material_trade_name": "ITC Paperboards Indobarr / Mondi EcoVantage",
        "sku_code": "ITC-IND-BARR-80",
        "polymer_family": "FSC Virgin Kraft / Bio-PBS",
        "nominal_gauge_um": 103.0,
        "barrier_otr": 210.0,
        "barrier_wvtr": 5.4,
        "min_order_qty_units": 5000,
        "price_per_kg_inr": 220.0,
        "price_per_unit_inr": 2.10,
        "lead_time_days": 7,
        "supplier_location": "Kolkata, West Bengal / Secunderabad",
        "cpcb_cert_number": "CPCB/PWM/IV/2022/0481"
    },
    {
        "supplier_name": "Yash Pakka Limited (Chuk!)",
        "material_trade_name": "Pakka Chuk! Water-resistant Trays + NatureFlex™ NKME",
        "sku_code": "PAK-CHUK-TRAY88",
        "polymer_family": "Molded Sugarcane Bagasse",
        "nominal_gauge_um": 88.0,
        "barrier_otr": 2.4,
        "barrier_wvtr": 2.2,
        "min_order_qty_units": 5000,
        "price_per_kg_inr": 260.0,
        "price_per_unit_inr": 2.80,
        "lead_time_days": 7,
        "supplier_location": "Ayodhya, Uttar Pradesh",
        "cpcb_cert_number": "CPCB/PWM/IV/2023/3391"
    },
    {
        "supplier_name": "TIPA Sustainable Packaging India",
        "material_trade_name": "High-Barrier Metallized Cellulose / Bio-PBS Laminate Pouch",
        "sku_code": "TIP-302-MET-LAM",
        "polymer_family": "Cellulose / Bio-PBS Composite",
        "nominal_gauge_um": 63.0,
        "barrier_otr": 1.4,
        "barrier_wvtr": 0.7,
        "min_order_qty_units": 15000,
        "price_per_kg_inr": 420.0,
        "price_per_unit_inr": 2.45,
        "lead_time_days": 14,
        "supplier_location": "Mumbai, Maharashtra",
        "cpcb_cert_number": "CPCB/PWM/IV/2023/8821"
    },
    {
        "supplier_name": "TrueGreen Bioplastics Pvt Ltd",
        "material_trade_name": "High-Breathability Starch-PBAT Bio-Film with Engineered Laser Perforations",
        "sku_code": "TG-PBAT-PERF-28",
        "polymer_family": "PBAT / Starch Matrix",
        "nominal_gauge_um": 28.0,
        "barrier_otr": 7100.0,
        "barrier_wvtr": 42.0,
        "min_order_qty_units": 10000,
        "price_per_kg_inr": 290.0,
        "price_per_unit_inr": 0.95,
        "lead_time_days": 7,
        "supplier_location": "Bengaluru, Karnataka",
        "cpcb_cert_number": "CPCB/PWM/IV/2024/0119"
    },
    {
        "supplier_name": "Danimer / Ecolife Polymers India",
        "material_trade_name": "Amber 100% Bio-based PHA Rigid Jar with Bio-PBS Induction Wad",
        "sku_code": "ECO-PHA-JAR-300",
        "polymer_family": "PHA (Polyhydroxyalkanoate)",
        "nominal_gauge_um": 320.0,
        "barrier_otr": 1.4,
        "barrier_wvtr": 0.95,
        "min_order_qty_units": 3000,
        "price_per_kg_inr": 550.0,
        "price_per_unit_inr": 8.50,
        "lead_time_days": 15,
        "supplier_location": "Ahmedabad, Gujarat",
        "cpcb_cert_number": "CPCB/PWM/IV/2024/0592"
    },
    {
        "supplier_name": "TotalEnergies Corbion / EarthFirst India",
        "material_trade_name": "Thermoformed PLA / Mineralized Bio-Polymer Cup + Paper-PLA Peelable Lid",
        "sku_code": "COR-LUM-CUP380",
        "polymer_family": "PLA (Polylactic Acid)",
        "nominal_gauge_um": 380.0,
        "barrier_otr": 4.4,
        "barrier_wvtr": 2.1,
        "min_order_qty_units": 5000,
        "price_per_kg_inr": 310.0,
        "price_per_unit_inr": 3.20,
        "lead_time_days": 10,
        "supplier_location": "Pune, Maharashtra",
        "cpcb_cert_number": "CPCB/PWM/IV/2023/2180"
    }
]

def seed_vendor_skus(db: Session):
    if db.query(VendorSKU).count() == 0:
        for item in INDIAN_SUPPLIER_CATALOG:
            db.add(VendorSKU(**item))
        db.commit()

def match_vendor_skus_for_spec(
    material_name: str,
    db: Session,
    limit: int = 2
) -> List[Dict[str, Any]]:
    seed_vendor_skus(db)

    # Try matching by material name or polymer family
    results = db.query(VendorSKU).filter(
        (VendorSKU.material_trade_name.ilike(f"%{material_name[:20]}%")) |
        (VendorSKU.material_trade_name.ilike(f"%{material_name.split()[0]}%"))
    ).limit(limit).all()

    if not results:
        results = db.query(VendorSKU).limit(limit).all()

    matched = []
    for r in results:
        matched.append({
            "supplier_name": r.supplier_name,
            "sku_code": r.sku_code,
            "material_name": r.material_trade_name,
            "gauge_um": r.nominal_gauge_um,
            "price_per_unit_inr": r.price_per_unit_inr,
            "price_per_kg_inr": r.price_per_kg_inr,
            "min_order_qty": r.min_order_qty_units,
            "lead_time_days": r.lead_time_days,
            "supplier_location": r.supplier_location,
            "cpcb_license": r.cpcb_cert_number
        })
    return matched
