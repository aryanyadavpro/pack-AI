from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.seed import seed_database
from app.db.session import engine
from app.db.base import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and database is seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BioPack AI — Intelligent Decision Support Engine for Biodegradable Food Packaging and Shelf-Life Simulation in India.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: replace with specific client origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Root"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "regulatory_governance": "FSSAI (Packaging) Regulations 2018 & BIS IS/ISO 17088",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX
    }

@app.get(f"{settings.API_V1_PREFIX}/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "engine": "deterministic_physics_topsis_ready"
    }
