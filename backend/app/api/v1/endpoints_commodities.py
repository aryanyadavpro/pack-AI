from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.commodity import Commodity
from app.schemas.commodity import CommodityResponse, CommoditySummary
from app.core.exceptions import CommodityNotFoundError

router = APIRouter(prefix="/commodities", tags=["Commodities"])

@router.get("", response_model=List[CommoditySummary])
def list_commodities(
    category: Optional[str] = Query(None, description="Filter by FSSAI category"),
    search: Optional[str] = Query(None, description="Search commodity name"),
    db: Session = Depends(get_db)
):
    query = db.query(Commodity)
    if category:
        query = query.filter(Commodity.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(Commodity.name.ilike(f"%{search}%"))
    return query.order_by(Commodity.name).all()

@router.get("/{commodity_id}", response_model=CommodityResponse)
def get_commodity_by_id(commodity_id: int, db: Session = Depends(get_db)):
    commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()
    if not commodity:
        raise CommodityNotFoundError(f"ID {commodity_id}")
    return commodity
