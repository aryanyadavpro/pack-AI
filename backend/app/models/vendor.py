from sqlalchemy import Column, Integer, String, Float
from app.db.base import Base

class VendorSKU(Base):
    __tablename__ = "vendor_skus"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String(128), nullable=False, index=True)
    material_trade_name = Column(String(256), nullable=False, index=True)
    sku_code = Column(String(64), unique=True, nullable=False, index=True)
    polymer_family = Column(String(64), nullable=False)
    nominal_gauge_um = Column(Float, nullable=False)
    barrier_otr = Column(Float, nullable=False)
    barrier_wvtr = Column(Float, nullable=False)
    min_order_qty_units = Column(Integer, default=5000)
    price_per_kg_inr = Column(Float, nullable=False)
    price_per_unit_inr = Column(Float, nullable=False)
    lead_time_days = Column(Integer, default=10)
    supplier_location = Column(String(128), default="India")
    cpcb_cert_number = Column(String(64), default="CPCB/PWM/CAT-IV/2024/0981")
