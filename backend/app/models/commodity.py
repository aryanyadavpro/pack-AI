from sqlalchemy import Column, Integer, String, Float, Text
from app.db.base import Base

class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    ifct_code = Column(String(32), nullable=True)
    moisture_pct = Column(Float, nullable=False)
    fat_pct = Column(Float, nullable=False)
    ph_level = Column(Float, nullable=False)
    water_activity = Column(Float, nullable=False)
    respiration_rate = Column(Float, default=0.0)
    critical_moisture_pct = Column(Float, nullable=False)
    critical_pv_meq_kg = Column(Float, nullable=True, default=10.0)
    description = Column(Text, nullable=True)
