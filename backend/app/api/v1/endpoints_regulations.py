from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.db.session import get_db
from app.models.regulation import RegulationClause

router = APIRouter(prefix="/regulations", tags=["Regulations & BIS Standards"])

class RegulationClauseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    authority: str
    clause_reference: str
    title: str
    description: str
    prescribed_simulant: Optional[str] = None
    migration_limit: Optional[str] = None
    applicable_categories: Optional[str] = None

@router.get("", response_model=List[RegulationClauseSchema])
def list_regulations(
    authority: Optional[str] = Query(None, description="Filter by authority: FSSAI, BIS, or CPCB"),
    db: Session = Depends(get_db)
):
    query = db.query(RegulationClause)
    if authority:
        query = query.filter(RegulationClause.authority.ilike(f"%{authority}%"))
    return query.order_by(RegulationClause.authority, RegulationClause.clause_reference).all()
