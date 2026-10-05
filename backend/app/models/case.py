import uuid
from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, utcnow
from app.models.category import Category
from app.models.triage import Triage, TriageLevel
from app.models.user import User

if TYPE_CHECKING:
    from app.models.appointment import Appointment

REFERENCE_PREFIX = "STU-"
_REFERENCE_OFFSET = 1000


def _str_enum(enum_cls: type[StrEnum]) -> Enum:
    return Enum(
        enum_cls, native_enum=False, length=32, values_callable=lambda e: [m.value for m in e]
    )


class CaseStatus(StrEnum):
    RECEIVED = "received"
    ASSIGNED = "assigned"
    APPOINTMENT_SCHEDULED = "appointment_scheduled"
    RESOLVED = "resolved"


class ContactMethod(StrEnum):
    EMAIL = "email"
    PHONE = "phone"
    IN_APP = "in_app"


class CaseEventKind(StrEnum):
    CREATED = "created"
    ESCALATED = "escalated"
    ASSIGNED = "assigned"
    STATUS_CHANGED = "status_changed"
    PRIORITY_CHANGED = "priority_changed"
    TEAM_CHANGED = "team_changed"
    APPOINTMENT_SCHEDULED = "appointment_scheduled"
    NOTE = "note"


class Case(TimestampMixin, Base):
    __tablename__ = "cases"
    __table_args__ = (
        CheckConstraint("priority BETWEEN 1 AND 4", name="priority_range"),
        Index("ix_cases_status_priority", "status", "priority"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    triage_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("triages.id"), unique=True)
    # Null for anonymous safety escalations raised before the student signed in.
    student_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    priority: Mapped[int]
    status: Mapped[CaseStatus] = mapped_column(_str_enum(CaseStatus), default=CaseStatus.RECEIVED)
    escalated: Mapped[bool] = mapped_column(default=False)

    contact_name: Mapped[str | None] = mapped_column(String(120))
    student_number: Mapped[str | None] = mapped_column(String(32))
    preferred_contact: Mapped[ContactMethod | None] = mapped_column(_str_enum(ContactMethod))
    contact_detail: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)

    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    respond_by: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    first_response_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), onupdate=utcnow
    )

    triage: Mapped[Triage] = relationship(lazy="joined")
    category: Mapped[Category] = relationship(lazy="joined")
    student: Mapped[User | None] = relationship(foreign_keys=[student_id], lazy="joined")
    assigned_to: Mapped[User | None] = relationship(foreign_keys=[assigned_to_id], lazy="joined")
    events: Mapped[list["CaseEvent"]] = relationship(
        back_populates="case", order_by="CaseEvent.id", lazy="selectin"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        order_by="Appointment.starts_at", lazy="selectin"
    )

    @property
    def reference(self) -> str:
        return format_reference(self.id)

    @property
    def priority_level(self) -> TriageLevel:
        return TriageLevel(self.priority)


class CaseEvent(TimestampMixin, Base):
    """Timeline entry for a case; doubles as the audit trail."""

    __tablename__ = "case_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    kind: Mapped[CaseEventKind] = mapped_column(_str_enum(CaseEventKind))
    message: Mapped[str] = mapped_column(Text)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    visible_to_student: Mapped[bool] = mapped_column(default=True)

    case: Mapped[Case] = relationship(back_populates="events")
    actor: Mapped[User | None] = relationship(lazy="joined")


def format_reference(case_id: int) -> str:
    return f"{REFERENCE_PREFIX}{case_id + _REFERENCE_OFFSET}"


def parse_reference(reference: str) -> int | None:
    """Map 'STU-1042' to its case id; None if the string is not a valid reference."""
    if not reference.upper().startswith(REFERENCE_PREFIX):
        return None
    number = reference[len(REFERENCE_PREFIX) :]
    if not number.isdigit():
        return None
    case_id = int(number) - _REFERENCE_OFFSET
    return case_id if case_id > 0 else None
