from fastapi import APIRouter, Response, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.api.serializers import case_out, case_summary
from app.models import Case, Triage
from app.schemas.case import CaseCreate, CaseOut, CaseSummary
from app.services import case_service

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post(
    "",
    response_model=CaseOut,
    status_code=status.HTTP_201_CREATED,
    responses={200: {"description": "Contact details added to an existing safety escalation"}},
)
async def create_case(
    data: CaseCreate, session: SessionDep, user: CurrentUser, response: Response
) -> CaseOut:
    """Request human support for a triage result. Category and priority come from triage."""
    triage = await session.get(Triage, data.triage_id)
    case, created = await case_service.create_case(session, triage, user, data)
    await session.commit()
    if not created:
        response.status_code = status.HTTP_200_OK
    return case_out(case)


@router.get("", response_model=list[CaseSummary])
async def list_my_cases(session: SessionDep, user: CurrentUser) -> list[CaseSummary]:
    cases = await session.scalars(
        select(Case).where(Case.student_id == user.id).order_by(Case.created_at.desc())
    )
    return [case_summary(c) for c in cases]


@router.get("/{reference}", response_model=CaseOut)
async def get_my_case(reference: str, session: SessionDep, user: CurrentUser) -> CaseOut:
    case = await case_service.get_student_case(session, reference, user)
    return case_out(case)
