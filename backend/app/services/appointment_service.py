"""Appointment slots and booking.

Slots are generated from a fixed weekly template in the university's timezone
(no staff calendars in the prototype); bookings are real rows, and a unique
(team, start) constraint prevents double booking.
"""

from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import utcnow
from app.core.errors import ConflictError, InvalidRequestError
from app.models import Appointment, Case, CaseEventKind, CaseStatus, Category, User
from app.services import notification_service
from app.services.case_service import record_event

SLOT_START_TIMES = (time(9, 30), time(11, 0), time(14, 0), time(15, 30))
SLOT_LENGTH = timedelta(minutes=45)
BOOKING_WINDOW_WEEKDAYS = 5
MIN_NOTICE = timedelta(hours=2)


def _candidate_starts(now: datetime) -> list[datetime]:
    tz = get_settings().timezone
    day: date = now.astimezone(tz).date()
    starts: list[datetime] = []
    weekdays_seen = 0
    while weekdays_seen < BOOKING_WINDOW_WEEKDAYS:
        if day.weekday() < 5:
            weekdays_seen += 1
            for t in SLOT_START_TIMES:
                start = datetime.combine(day, t, tzinfo=tz).astimezone(UTC)
                if start >= now + MIN_NOTICE:
                    starts.append(start)
        day += timedelta(days=1)
    return starts


async def available_slots(
    session: AsyncSession, category: Category, now: datetime | None = None
) -> list[tuple[datetime, datetime]]:
    candidates = _candidate_starts(now or utcnow())
    if not candidates:
        return []
    booked = set(
        (
            await session.scalars(
                select(Appointment.starts_at).where(
                    Appointment.category_id == category.id,
                    Appointment.starts_at.between(candidates[0], candidates[-1]),
                )
            )
        ).all()
    )
    return [(s, s + SLOT_LENGTH) for s in candidates if s not in booked]


async def book(session: AsyncSession, case: Case, starts_at: datetime, actor: User) -> Appointment:
    now = utcnow()
    if case.status == CaseStatus.RESOLVED:
        raise InvalidRequestError("This case is resolved")
    if any(a.starts_at > now for a in case.appointments):
        raise ConflictError("This case already has an upcoming appointment")

    start = starts_at.astimezone(UTC)
    if start not in _candidate_starts(now):
        raise InvalidRequestError("That time is not an available appointment slot")

    appointment = Appointment(
        case_id=case.id,
        category=case.category,
        starts_at=start,
        ends_at=start + SLOT_LENGTH,
        booked_by_id=actor.id,
    )
    try:
        async with session.begin_nested():
            session.add(appointment)
    except IntegrityError as exc:
        raise ConflictError("That slot has just been booked; please choose another") from exc

    case.appointments.append(appointment)
    if case.status in (CaseStatus.RECEIVED, CaseStatus.ASSIGNED):
        case.status = CaseStatus.APPOINTMENT_SCHEDULED
    local = start.astimezone(get_settings().timezone)
    record_event(
        case,
        CaseEventKind.APPOINTMENT_SCHEDULED,
        f"Appointment with {case.category.team_name} on {local:%a %d %b, %H:%M}",
        actor,
    )
    await session.flush()
    notification_service.appointment_booked(case, appointment)
    return appointment
