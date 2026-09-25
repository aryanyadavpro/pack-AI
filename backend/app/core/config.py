from pydantic import BaseModel
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = BASE_DIR.parent

# Lightweight .env loader without external dependencies
def _load_env_files():
    for env_file in [
        WORKSPACE_DIR / ".env.local",
        WORKSPACE_DIR / ".env",
        BASE_DIR / ".env.local",
        BASE_DIR / ".env"
    ]:
        if env_file.exists():
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

_load_env_files()

class Settings(BaseModel):
    PROJECT_NAME: str = "PackCraft AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database - safely resolve SQLite path to avoid relative working directory issues
    DATABASE_URL: str = (
        f"sqlite:///{BASE_DIR / 'biopack.db'}"
        if not os.getenv("DATABASE_URL") or "biopack.db" in os.getenv("DATABASE_URL", "")
        else os.getenv("DATABASE_URL")
    )
    
    # Datasets with robust fallback resolution
    RECOMMENDATION_DATASET_PATH: str = os.getenv(
        "RECOMMENDATION_DATASET_PATH",
        next(
            (str(p) for p in [
                WORKSPACE_DIR / "fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv",
                BASE_DIR / "fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv",
                Path("/packAI") / "fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv",
                Path("/app") / "fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv",
            ] if p.exists()),
            str(WORKSPACE_DIR / "fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv")
        )
    )
    SIMULATION_DATASET_PATH: str = os.getenv(
        "SIMULATION_DATASET_PATH",
        next(
            (str(p) for p in [
                WORKSPACE_DIR / "fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv",
                BASE_DIR / "fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv",
                Path("/packAI") / "fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv",
                Path("/app") / "fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv",
            ] if p.exists()),
            str(WORKSPACE_DIR / "fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv")
        )
    )

    # Optional External LLM Integration (Gemini / OpenAI)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # "gemini", "openai", "local", or "auto"

    # Physics & Simulation Defaults
    DEFAULT_STEP_SIZE_DAYS: int = 1
    MAX_SIMULATION_DAYS: int = 730
    
    # Regulatory Migration Limit (IS 9845 / FSSAI 2018)
    MAX_OVERALL_MIGRATION_MG_DM2: float = 10.0
    MAX_OVERALL_MIGRATION_MG_KG: float = 60.0

settings = Settings()

