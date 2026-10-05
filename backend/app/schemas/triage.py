import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.config import EscalationContact
from app.models import TriageAction
from app.schemas.category import CategoryOut, Resource


class TriageRequest(BaseModel):
    message: str = Field(min_length=3, max_length=4000)
    category_hint: str | None = Field(
        default=None, description="Category slug if the student started from a category card"
    )


class Guidance(BaseModel):
    message: str
    resources: list[Resource]


class TriageResponse(BaseModel):
    id: uuid.UUID
    level: int
    level_label: str
    priority: str
    action: TriageAction
    category: CategoryOut
    secondary_category: CategoryOut | None
    recommended_team: str
    expected_response: str | None
    topics: list[str]
    reasons: list[str]
    confidence: float
    engine: str
    guidance: Guidance
    escalation_contacts: list[EscalationContact]
    case_reference: str | None = Field(description="Set when a case exists for this triage")
    created_at: datetime
