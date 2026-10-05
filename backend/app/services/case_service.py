from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import utcnow
from app.core.errors import ConflictError, InvalidRequestError, NotFoundError
from app.models import (
    Case,
    CaseEvent,
    CaseEventKind,
    CaseStatus,
    Category,
    Triage,
    TriageLevel,
    User,
)
from app.models.case import parse_reference
from app.schemas.admin import CaseUpdate
from app.schemas.case import CaseCreate
from app.services import notification_service

# Cases opened from a Level 1 triage still get a human; use the Level 2 target.
_DEFAULT_RESPONSE_HOURS = TriageLevel.SUPPORT_RECOMMENDED.response_hours or 72


def _response_hours(level: TriageLevel) -> int:
    return level.response_hours or _DEFAULT_RESPONSE_HOURS


def record_event(
    case: Case, kind: CaseEventKind, message: str, actor: User | None, visible: bool = True
) -> None:
    case.events.append(
        CaseEvent(kind=kind, message=message, actor=actor, visible_to_student=visible)
    )
    # First response = first staff action the student can see.
    if visible and actor is not None and actor.is_staff and case.first_response_at is None:
        case.first_response_at = utcnow()


async def get_case(session: AsyncSession, reference: str) -> Case:
    case_id = parse_reference(reference)
    case = await session.get(Case, case_id) if case_id else None
    if case is None:
        raise NotFoundError(f"Case {reference} not found")
    return case


async def get_student_case(session: AsyncSession, reference: str, student: User) -> Case:
    case = await get_case(session, reference)
    if case.student_id != student.id:
        # Same response as a missing case so references can't be probed.
        raise NotFoundError(f"Case {reference} not found")
    return case


async def find_case_for_triage(session: AsyncSession, triage: Triage) -> Case | None:
    return await session.scalar(select(Case).where(Case.triage_id == triage.id))


def _apply_contact(case: Case, student: User, data: CaseCreate) -> None:
    case.contact_name = data.contact_name or student.full_name
    case.student_number = data.student_number or student.student_number
    case.preferred_contact = data.preferred_contact
    case.contact_detail = data.contact_detail or student.email


async def create_escalation_case(
    session: AsyncSession, triage: Triage, student: User | None
) -> Case:
    """Open a critical case for a Level 4 triage, with or without a signed-in student."""
    case = Case(
        triage=triage,
        category=triage.category,
        student=student,
        priority=TriageLevel.SAFETY_ESCALATION,
        escalated=True,
        description=triage.message,
        contact_name=student.full_name if student else None,
        student_number=student.student_number if student else None,
        contact_detail=student.email if student else None,
        respond_by=utcnow() + timedelta(hours=_response_hours(TriageLevel.SAFETY_ESCALATION)),
        events=[],
        appointments=[],
    )
    record_event(
        case,
        CaseEventKind.ESCALATED,
        f"Escalated immediately to {triage.category.team_name}",
        actor=None,
    )
    session.add(case)
    await session.flush()
    notification_service.safety_escalation(case)
    return case


async def create_case(
    session: AsyncSession, triage: Triage | None, student: User, data: CaseCreate
) -> tuple[Case, bool]:
    """Create the support case for a triage. Returns (case, created)."""
    if triage is None or (triage.user_id is not None and triage.user_id != student.id):
        raise NotFoundError("Triage result not found")

    existing = await find_case_for_triage(session, triage)
    if existing is not None:
        if existing.escalated and existing.student_id is None:
            # A student who reported anonymously can attach their details so staff can reach them.
            existing.student = student
            triage.user_id = student.id
            _apply_contact(existing, student, data)
            record_event(existing, CaseEventKind.NOTE, "Student added contact details", student)
            return existing, False
        raise ConflictError(f"A case already exists for this request: {existing.reference}")

    level = triage.triage_level
    triage.user_id = student.id
    case = Case(
        triage=triage,
        category=triage.category,
        student=student,
        priority=level,
        description=data.description or triage.message,
        respond_by=utcnow() + timedelta(hours=_response_hours(level)),
        events=[],
        appointments=[],
    )
    _apply_contact(case, student, data)
    record_event(
        case, CaseEventKind.CREATED, f"Request received by {triage.category.team_name}", student
    )
    session.add(case)
    try:
        await session.flush()
    except IntegrityError as exc:
        raise ConflictError("A case already exists for this request") from exc
    notification_service.case_created(case)
    return case, True


async def update_case(session: AsyncSession, case: Case, actor: User, update: CaseUpdate) -> Case:
    fields = update.model_fields_set

    if update.category is not None and update.category != case.category.slug:
        category = await session.scalar(select(Category).where(Category.slug == update.category))
        if category is None:
            raise InvalidRequestError(f"Unknown category: {update.category}")
        case.category = category
        record_event(case, CaseEventKind.TEAM_CHANGED, f"Moved to {category.team_name}", actor)

    if "assigned_to_id" in fields:
        await _assign(session, case, actor, update)

    if update.priority is not None and update.priority != case.priority:
        level = TriageLevel(update.priority)
        case.priority = level
        case.respond_by = case.created_at + timedelta(hours=_response_hours(level))
        record_event(
            case,
            CaseEventKind.PRIORITY_CHANGED,
            f"Priority set to {level.priority}",
            actor,
            visible=False,
        )

    if update.status is not None and update.status != case.status:
        if update.status == CaseStatus.APPOINTMENT_SCHEDULED and not case.appointments:
            raise InvalidRequestError("Book an appointment to move a case to that status")
        case.status = update.status
        case.resolved_at = utcnow() if update.status == CaseStatus.RESOLVED else None
        label = update.status.value.replace("_", " ")
        record_event(case, CaseEventKind.STATUS_CHANGED, f"Status changed to {label}", actor)

    if update.note:
        record_event(
            case, CaseEventKind.NOTE, update.note, actor, visible=update.note_visible_to_student
        )

    await session.flush()
    return case


async def _assign(session: AsyncSession, case: Case, actor: User, update: CaseUpdate) -> None:
    if update.assigned_to_id is None:
        if case.assigned_to is not None:
            case.assigned_to = None
            record_event(case, CaseEventKind.ASSIGNED, "Unassigned", actor, visible=False)
        return

    if case.assigned_to_id == update.assigned_to_id:
        return
    assignee = await session.get(User, update.assigned_to_id)
    if assignee is None or not assignee.is_staff or not assignee.is_active:
        raise InvalidRequestError("Cases can only be assigned to active staff")
    case.assigned_to = assignee
    if case.status == CaseStatus.RECEIVED:
        case.status = CaseStatus.ASSIGNED
    record_event(
        case,
        CaseEventKind.ASSIGNED,
        f"Assigned to {assignee.full_name}, {case.category.team_name}",
        actor,
    )
