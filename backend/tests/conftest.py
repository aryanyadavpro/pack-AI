import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal, get_db

@pytest.fixture(scope="session")
def db_session():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
