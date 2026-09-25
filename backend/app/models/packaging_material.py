from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.db.base import Base

class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True)
    trade_name = Column(String(256), unique=True, nullable=False, index=True)
    polymer_family = Column(String(64), nullable=False)
    layer_structure = Column(String(256), nullable=False)
    nominal_thickness_um = Column(Float, nullable=False)
    barrier_otr = Column(Float, nullable=False)  # cc/m2.day.atm
    barrier_wvtr = Column(Float, nullable=False)  # g/m2.day
    sealing_mechanism = Column(String(128), nullable=False)
    mechanical_strength_requirement = Column(String(128), nullable=True)
    puncture_strength_rating = Column(Float, default=7.0)  # 1 to 10 scale
    compostability_score = Column(Float, default=8.0)      # 1 to 10 scale (Home vs Industrial)
    cost_index = Column(Float, default=5.0)                # 1 to 10 scale (relative market price)
    certified_oml_mg_dm2 = Column(Float, default=8.0)      # Must be <= 10.0 mg/dm2
    is_fssai_compliant = Column(Boolean, default=True)
    prescribed_bis_is_standard = Column(String(128), default="IS/ISO 17088, IS 9845")
    fssai_clause = Column(String(256), default="Cl. 3(2) & Cl. 4(4)")
    cpcb_category = Column(String(128), default="CPCB Category IV (Certified Compostable Plastic, Form-VI)")
    commercial_trade_reference = Column(String(256), nullable=True)
