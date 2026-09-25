from fastapi import APIRouter
from app.api.v1.endpoints_commodities import router as commodities_router
from app.api.v1.endpoints_recommend import router as recommend_router
from app.api.v1.endpoints_simulate import router as simulate_router
from app.api.v1.endpoints_regulations import router as regulations_router
from app.api.v1.endpoints_audit import router as audit_router
from app.api.v1.endpoints_chat import router as chat_router

api_router = APIRouter()

api_router.include_router(commodities_router)
api_router.include_router(recommend_router)
api_router.include_router(simulate_router)
api_router.include_router(regulations_router)
api_router.include_router(audit_router)
api_router.include_router(chat_router)
