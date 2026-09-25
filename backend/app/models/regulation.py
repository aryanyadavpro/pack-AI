from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class RegulationClause(Base):
    __tablename__ = "regulation_clauses"

    id = Column(Integer, primary_key=True, index=True)
    authority = Column(String(32), nullable=False)  # FSSAI, BIS, CPCB
    clause_reference = Column(String(64), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    prescribed_simulant = Column(String(32), nullable=True)  # Simulant A, B, C, D
    migration_limit = Column(String(64), nullable=True)
    applicable_categories = Column(String(256), default="All")
