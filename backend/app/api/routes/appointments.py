from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.api.serializers import appointment_out
from app.core.config import get_settings
from app.models import Category
from app.schemas.appointment import AppointmentCreate, AppointmentOut, Availability, Slot
from app.services import appointment_service, case_service

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/available", response_model=Availability)
async def available(
    session: SessionDep,
    _: CurrentUser,
    category: str = Query(description="Category slug of the team to book with"),
) -> Availability:
    team = await session.scalar(select(Category).where(Category.slug == category))
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown category: {category}")
    slots = await appointment_service.available_slots(session, team)
    return Availability(
        category=team.slug,
        team_name=team.team_name,
        timezone=get_settings().UNIVERSITY_TIMEZONE,
        slots=[Slot(starts_at=s, ends_at=e) for s, e in slots],
    )


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
async def book(data: AppointmentCreate, session: SessionDep, user: CurrentUser) -> AppointmentOut:
    case = await case_service.get_student_case(session, data.case_reference, user)
    appointment = await appointment_service.book(session, case, data.starts_at, user)
    await session.commit()
    return appointment_out(appointment)
