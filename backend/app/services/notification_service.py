"""Outbound notifications.

The prototype records notifications in the application log; this module is the
single seam where email/SMS or ServiceNow notifications would be plugged in.
"""

import logging

from app.models import Appointment, Case

logger = logging.getLogger("uniroute.notifications")


def case_created(case: Case) -> None:
    logger.info(
        "Case %s created: team=%s priority=%s",
        case.reference,
        case.category.team_name,
        case.priority_level.priority,
    )


def safety_escalation(case: Case) -> None:
    # Highest severity so log-based alerting picks it up immediately.
    logger.critical(
        "SAFETY ESCALATION %s: team=%s student=%s",
        case.reference,
        case.category.team_name,
        case.student_id or "anonymous",
    )


def appointment_booked(case: Case, appointment: Appointment) -> None:
    logger.info(
        "Appointment for %s with %s at %s",
        case.reference,
        case.category.team_name,
        appointment.starts_at.isoformat(),
    )
