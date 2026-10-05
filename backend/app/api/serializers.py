"""Map ORM objects to API schemas (where shapes differ from the tables)."""

from datetime import datetime

from app.core.config import get_settings
from app.core.database import utcnow
from app.models import Appointment, Case, CaseStatus, Category, Triage, TriageLevel, User
from app.models.case import format_reference
from app.schemas.admin import (
    AdminCaseDetail,
    QueueItem,
    StaffOut,
    StudentContact,
    TriageDetail,
)
from app.schemas.appointment import AppointmentOut
from app.schemas.case import CaseEventOut, CaseOut, CaseSummary, StepState, TimelineStep
from app.schemas.category import CategoryOut, Resource
from app.schemas.triage import Guidance, TriageResponse

_STATUS_ORDER = [
    CaseStatus.RECEIVED,
    CaseStatus.ASSIGNED,
    CaseStatus.APPOINTMENT_SCHEDULED,
    CaseStatus.RESOLVED,
]


def expected_response(level: TriageLevel) -> str | None:
    hours = level.response_hours
    if hours is None:
        return None
    if hours <= 1:
        return "Immediately"
    return f"Within {hours} hours"


def category_out(category: Category) -> CategoryOut:
    return CategoryOut.model_validate(category)


def _guidance(triage: Triage) -> Guidance:
    level = triage.triage_level
    category = triage.category
    team = category.team_name
    resources = [Resource.model_validate(r) for r in category.resources]
    if level == TriageLevel.SAFETY_ESCALATION:
        return Guidance(
            message=(
                "This sounds like something that needs immediate human help. Please contact "
                "one of the emergency or safety contacts below now. Your report has been "
                f"sent to {team} as a priority."
            ),
            resources=[],
        )
    if level == TriageLevel.PRIORITY_SUPPORT:
        message = (
            f"This may benefit from timely human support. We recommend {team}; you can create "
            "a priority request and book an appointment."
        )
    elif level == TriageLevel.SUPPORT_RECOMMENDED:
        message = (
            f"Here are some resources that may help. Would you also like to speak with {team}?"
        )
    else:
        message = category.guidance or f"Here is some guidance from {team}."
    return Guidance(message=message, resources=resources)


def triage_response(triage: Triage, case: Case | None) -> TriageResponse:
    level = triage.triage_level
    is_escalation = level == TriageLevel.SAFETY_ESCALATION
    return TriageResponse(
        id=triage.id,
        level=level,
        level_label=level.label,
        priority=level.priority,
        action=level.action,
        category=category_out(triage.category),
        secondary_category=(
            category_out(triage.secondary_category) if triage.secondary_category else None
        ),
        recommended_team=triage.category.team_name,
        expected_response=expected_response(level),
        topics=triage.topics,
        reasons=triage.reasons,
        confidence=triage.confidence,
        engine=triage.engine,
        guidance=_guidance(triage),
        escalation_contacts=get_settings().ESCALATION_CONTACTS if is_escalation else [],
        case_reference=case.reference if case else None,
        created_at=triage.created_at,
    )


def timeline(case: Case) -> list[TimelineStep]:
    reached = _STATUS_ORDER.index(case.status)
    resolved = case.status == CaseStatus.RESOLVED
    done = {
        "received": True,
        "assigned": case.assigned_to_id is not None or reached >= 1,
        "appointment": bool(case.appointments),
        "resolved": resolved,
    }
    labels = {
        "received": "Request received",
        "assigned": "Assigned",
        "appointment": "Appointment",
        "resolved": "Resolved",
    }
    steps: list[TimelineStep] = []
    current_set = False
    for key, label in labels.items():
        state: StepState
        if done[key]:
            state = "done"
        elif resolved:
            state = "skipped"
        elif not current_set:
            state, current_set = "current", True
        else:
            state = "upcoming"
        steps.append(TimelineStep.model_validate({"key": key, "label": label, "state": state}))
    return steps


def appointment_out(appointment: Appointment) -> AppointmentOut:
    return AppointmentOut(
        id=appointment.id,
        case_reference=format_reference(appointment.case_id),
        team_name=appointment.category.team_name,
        starts_at=appointment.starts_at,
        ends_at=appointment.ends_at,
    )


def _summary_fields(case: Case) -> dict[str, object]:
    level = case.priority_level
    return {
        "reference": case.reference,
        "status": case.status,
        "priority": level,
        "priority_label": level.priority,
        "category": category_out(case.category),
        "assigned_team": case.category.team_name,
        "escalated": case.escalated,
        "respond_by": case.respond_by,
        "created_at": case.created_at,
        "timeline": timeline(case),
    }


def case_summary(case: Case) -> CaseSummary:
    return CaseSummary.model_validate(_summary_fields(case))


def _events(case: Case, include_internal: bool) -> list[CaseEventOut]:
    return [
        CaseEventOut(
            kind=e.kind,
            message=e.message,
            actor_name=e.actor.full_name if e.actor else None,
            created_at=e.created_at,
        )
        for e in case.events
        if include_internal or e.visible_to_student
    ]


def _detail_fields(case: Case, include_internal: bool) -> dict[str, object]:
    return {
        **_summary_fields(case),
        "description": case.description,
        "expected_response": expected_response(case.priority_level),
        "events": _events(case, include_internal),
        "appointments": [appointment_out(a) for a in case.appointments],
    }


def case_out(case: Case) -> CaseOut:
    return CaseOut.model_validate(_detail_fields(case, include_internal=False))


def staff_out(user: User) -> StaffOut:
    return StaffOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        team=category_out(user.category) if user.category else None,
    )


def _is_overdue(case: Case, now: datetime) -> bool:
    return (
        case.status != CaseStatus.RESOLVED
        and case.first_response_at is None
        and case.respond_by is not None
        and case.respond_by < now
    )


def queue_item(case: Case, now: datetime) -> QueueItem:
    level = case.priority_level
    return QueueItem(
        reference=case.reference,
        category=category_out(case.category),
        priority=level,
        priority_label=level.priority,
        status=case.status,
        escalated=case.escalated,
        student_name=case.contact_name,
        student_number=case.student_number,
        assigned_to=staff_out(case.assigned_to) if case.assigned_to else None,
        created_at=case.created_at,
        respond_by=case.respond_by,
        overdue=_is_overdue(case, now),
    )


def admin_case_detail(case: Case) -> AdminCaseDetail:
    triage = case.triage
    level = triage.triage_level
    return AdminCaseDetail.model_validate(
        {
            **_detail_fields(case, include_internal=True),
            "student": StudentContact(
                name=case.contact_name,
                email=case.student.email if case.student else None,
                student_number=case.student_number,
                preferred_contact=case.preferred_contact,
                contact_detail=case.contact_detail,
            ),
            "triage": TriageDetail(
                message=triage.message,
                level=level,
                level_label=level.label,
                topics=triage.topics,
                reasons=triage.reasons,
                confidence=triage.confidence,
                engine=triage.engine,
                secondary_category=(
                    category_out(triage.secondary_category) if triage.secondary_category else None
                ),
            ),
            "assigned_to": staff_out(case.assigned_to) if case.assigned_to else None,
            "first_response_at": case.first_response_at,
            "resolved_at": case.resolved_at,
            "overdue": _is_overdue(case, utcnow()),
        }
    )
