import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models import CaseEventKind, CaseStatus, ContactMethod
from app.schemas.appointment import AppointmentOut
from app.schemas.category import CategoryOut


class CaseCreate(BaseModel):
    triage_id: uuid.UUID
    contact_name: str | None = Field(default=None, max_length=120)
    student_number: str | None = Field(default=None, max_length=32)
    preferred_contact: ContactMethod = ContactMethod.IN_APP
    contact_detail: str | None = Field(
        default=None, max_length=255, description="Email or phone; defaults to account email"
    )
    description: str | None = Field(
        default=None, max_length=4000, description="Defaults to the message given at triage"
    )


StepState = Literal["done", "current", "upcoming", "skipped"]


class TimelineStep(BaseModel):
    key: Literal["received", "assigned", "appointment", "resolved"]
    label: str
    state: StepState


class CaseEventOut(BaseModel):
    kind: CaseEventKind
    message: str
    actor_name: str | None
    created_at: datetime


class CaseSummary(BaseModel):
    reference: str
    status: CaseStatus
    priority: int
    priority_label: str
    category: CategoryOut
    assigned_team: str
    escalated: bool
    respond_by: datetime | None
    created_at: datetime
    timeline: list[TimelineStep]


class CaseOut(CaseSummary):
    description: str
    expected_response: str | None
    events: list[CaseEventOut]
    appointments: list[AppointmentOut]
