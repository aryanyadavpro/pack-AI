from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from app.db.session import get_db
from app.services.ai_chat.llm_parser import process_ai_chat_query

router = APIRouter(prefix="/chat", tags=["AI Packaging Chatbot"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User free-text inquiry or formulation question", json_schema_extra={"example": "I run an organic cow ghee brand in Rajasthan (40°C). What certified compostable pouch can give me 9 months shelf life without rancidity?"})

class ChatResponse(BaseModel):
    text: str
    extracted_parameters: Optional[Dict[str, Any]] = None
    commodity: Optional[Dict[str, Any]] = None
    ml_packaging: Optional[Dict[str, Any]] = None
    ml_shelf_life: Optional[Dict[str, Any]] = None
    suggestion_advisory: Optional[Dict[str, Any]] = None
    top_3_materials: Optional[List[Dict[str, Any]]] = None
    math_trace: Optional[Dict[str, Any]] = None
    vendor_quotes: Optional[List[Dict[str, Any]]] = None

@router.post("", response_model=ChatResponse)
def chat_with_biopack_ai(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Conversational AI Co-Pilot:
    1. Parses user free-text query with NLP
    2. Runs inference using ML Models trained on the 5,000-sample CSV datasets
    3. Solves deterministic mass transfer physical equations
    4. Audits statutory FSSAI 2018 clauses and BIS IS 9845 test simulants
    5. Returns conversational markdown text + structured interactive cards
    """
    res = process_ai_chat_query(request.message, db)
    return ChatResponse(**res)
