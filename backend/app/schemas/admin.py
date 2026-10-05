import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models import CaseStatus, ContactMethod
from app.schemas.case import CaseOut
from app.schemas.category import CategoryOut


class StaffOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    team: CategoryOut | None


class QueueItem(BaseModel):
    reference: str
    category: CategoryOut
    priority: int
    priority_label: str
    status: CaseStatus
    escalated: bool
    student_name: str | None
    student_number: str | None
    assigned_to: StaffOut | None
    created_at: datetime
    respond_by: datetime | None
    overdue: bool


class QueuePage(BaseModel):
    items: list[QueueItem]
    total: int
    limit: int
    offset: int


class StudentContact(BaseModel):
    name: str | None
    email: str | None
    student_number: str | None
    preferred_contact: ContactMethod | None
    contact_detail: str | None


class TriageDetail(BaseModel):
    message: str
    level: int
    level_label: str
    topics: list[str]
    reasons: list[str]
    confidence: float
    engine: str
    secondary_category: CategoryOut | None


class AdminCaseDetail(CaseOut):
    student: StudentContact
    triage: TriageDetail
    assigned_to: StaffOut | None
    first_response_at: datetime | None
    resolved_at: datetime | None
    overdue: bool


class CaseUpdate(BaseModel):
    """Only fields that are sent are applied; send assigned_to_id=null to unassign."""

    status: CaseStatus | None = None
    priority: int | None = Field(default=None, ge=1, le=4)
    category: str | None = Field(default=None, description="Category slug; reassigns the team")
    assigned_to_id: uuid.UUID | None = None
    note: str | None = Field(default=None, min_length=1, max_length=4000)
    note_visible_to_student: bool = False


class DashboardStats(BaseModel):
    total_requests: int = Field(description="All triaged requests")
    self_service_resolved: int = Field(description="Level 1 requests answered without a case")
    total_cases: int
    open_cases: int
    high_priority_open: int
    escalations_open: int
    unassigned_open: int
    overdue_open: int
    resolved: int
    avg_first_response_hours: float | None


class DailyCount(BaseModel):
    date: date
    total: int
    by_category: dict[str, int]


class CategoryTrend(BaseModel):
    category: str
    current: int
    previous: int
    change_pct: float | None


class TeamResponse(BaseModel):
    team_name: str
    avg_first_response_hours: float | None
    open_cases: int


class TopicCount(BaseModel):
    topic: str
    count: int


class Analytics(BaseModel):
    period_days: int
    requests_by_day: list[DailyCount]
    by_category: dict[str, int]
    by_level: dict[int, int]
    category_trends: list[CategoryTrend]
    response_by_team: list[TeamResponse]
    top_topics: list[TopicCount]
