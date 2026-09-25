from sqlalchemy import Column, Integer, String, Float, Text
from app.db.base import Base

class SimulationRecord(Base):
    __tablename__ = "simulation_records"

    id = Column(Integer, primary_key=True, index=True)
    commodity_name = Column(String(128), nullable=False, index=True)
    commodity_category = Column(String(64), nullable=False, index=True)
    initial_moisture_pct = Column(Float, nullable=False)
    initial_fat_pct = Column(Float, nullable=False)
    initial_ph = Column(Float, nullable=False)
    water_activity_aw = Column(Float, nullable=False)
    packaging_material_tested = Column(String(256), nullable=False, index=True)
    film_thickness_microns = Column(Float, nullable=False)
    film_otr = Column(Float, nullable=False)
    film_wvtr = Column(Float, nullable=False)
    storage_temperature_c = Column(Float, nullable=False)
    storage_rh_pct = Column(Float, nullable=False)
    headspace_gas_regime = Column(String(128), nullable=False)
    measured_shelf_life_days = Column(Integer, nullable=False)
    primary_failure_mode = Column(String(256), nullable=False)
    kinetic_reaction_order = Column(String(128), nullable=False)
    fssai_safety_compliance = Column(String(256), nullable=False)
    empirical_citation = Column(Text, nullable=True)
