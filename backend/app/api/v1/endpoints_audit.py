from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.audit import AuditReportRequest, AuditReportResponse
from app.services.audit.report_generator import generate_statutory_audit_report

router = APIRouter(prefix="/audit", tags=["FSSAI Compliance Audit"])

@router.post("/report", response_model=AuditReportResponse)
def create_statutory_audit_report(
    request: AuditReportRequest,
    db: Session = Depends(get_db)
):
    """
    Generates official FSSAI & BIS statutory compliance certificate,
    evaluating Clause 3(2), Clause 4(3), Overall Migration Limit (IS 9845),
    and CPCB Category IV Form-VI certification status.
    """
    return generate_statutory_audit_report(request, db)
