import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import OptionalUser, SessionDep
from app.api.serializers import triage_response
from app.models import Triage, TriageLevel
from app.schemas.triage import TriageRequest, TriageResponse
from app.services import case_service, triage_service

router = APIRouter(prefix="/triage", tags=["triage"])


@router.post("", response_model=TriageResponse, status_code=status.HTTP_201_CREATED)
async def create_triage(
    data: TriageRequest, session: SessionDep, user: OptionalUser
) -> TriageResponse:
    """Analyse a student's message. No sign-in needed: this is the front door.

    Level 4 (safety) results open an escalated case immediately, even for
    anonymous students, so staff see it without waiting for a form.
    """
    triage = await triage_service.run_triage(
        session, data.message, data.category_hint, user.id if user else None
    )
    case = None
    if triage.level == TriageLevel.SAFETY_ESCALATION:
        case = await case_service.create_escalation_case(session, triage, user)
    await session.commit()
    return triage_response(triage, case)


@router.get("/{triage_id}", response_model=TriageResponse)
async def get_triage(
    triage_id: uuid.UUID, session: SessionDep, user: OptionalUser
) -> TriageResponse:
    triage = await session.get(Triage, triage_id)
    owned_by_other = (
        triage is not None
        and triage.user_id is not None
        and (user is None or (user.id != triage.user_id and not user.is_staff))
    )
    if triage is None or owned_by_other:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Triage result not found")
    case = await case_service.find_case_for_triage(session, triage)
    return triage_response(triage, case)
