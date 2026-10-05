import uuid
from enum import IntEnum, StrEnum

from sqlalchemy import CheckConstraint, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin
from app.models.category import Category


class TriageAction(StrEnum):
    PROVIDE_GUIDANCE = "provide_guidance"
    RECOMMEND_SUPPORT = "recommend_support"
    CREATE_CASE_AND_PRIORITIZE = "create_case_and_prioritize"
    IMMEDIATE_ESCALATION = "immediate_escalation"


class TriageLevel(IntEnum):
    GENERAL_GUIDANCE = 1
    SUPPORT_RECOMMENDED = 2
    PRIORITY_SUPPORT = 3
    SAFETY_ESCALATION = 4

    @property
    def label(self) -> str:
        return _LEVEL_LABELS[self]

    @property
    def priority(self) -> str:
        return _LEVEL_PRIORITIES[self]

    @property
    def action(self) -> TriageAction:
        return _LEVEL_ACTIONS[self]

    @property
    def response_hours(self) -> int | None:
        """Target time to first human response; None means no case is expected."""
        return _LEVEL_RESPONSE_HOURS[self]


_LEVEL_LABELS = {
    TriageLevel.GENERAL_GUIDANCE: "General Guidance",
    TriageLevel.SUPPORT_RECOMMENDED: "Support Recommended",
    TriageLevel.PRIORITY_SUPPORT: "Priority Support",
    TriageLevel.SAFETY_ESCALATION: "Immediate Safety Concern",
}
_LEVEL_PRIORITIES = {
    TriageLevel.GENERAL_GUIDANCE: "low",
    TriageLevel.SUPPORT_RECOMMENDED: "medium",
    TriageLevel.PRIORITY_SUPPORT: "high",
    TriageLevel.SAFETY_ESCALATION: "critical",
}
_LEVEL_ACTIONS = {
    TriageLevel.GENERAL_GUIDANCE: TriageAction.PROVIDE_GUIDANCE,
    TriageLevel.SUPPORT_RECOMMENDED: TriageAction.RECOMMEND_SUPPORT,
    TriageLevel.PRIORITY_SUPPORT: TriageAction.CREATE_CASE_AND_PRIORITIZE,
    TriageLevel.SAFETY_ESCALATION: TriageAction.IMMEDIATE_ESCALATION,
}
_LEVEL_RESPONSE_HOURS: dict[TriageLevel, int | None] = {
    TriageLevel.GENERAL_GUIDANCE: None,
    TriageLevel.SUPPORT_RECOMMENDED: 72,
    TriageLevel.PRIORITY_SUPPORT: 24,
    TriageLevel.SAFETY_ESCALATION: 1,
}


class Triage(TimestampMixin, Base):
    __tablename__ = "triages"
    __table_args__ = (
        CheckConstraint("level BETWEEN 1 AND 4", name="level_range"),
        Index("ix_triages_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    message: Mapped[str] = mapped_column(Text)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    secondary_category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    level: Mapped[int]
    topics: Mapped[list[str]] = mapped_column(JSONB, default=list)
    reasons: Mapped[list[str]] = mapped_column(JSONB, default=list)
    confidence: Mapped[float] = mapped_column(Float)
    # "rules" or "llm" — which engine produced the result, for auditability.
    engine: Mapped[str] = mapped_column(String(16))

    category: Mapped[Category] = relationship(foreign_keys=[category_id], lazy="joined")
    secondary_category: Mapped[Category | None] = relationship(
        foreign_keys=[secondary_category_id], lazy="joined"
    )

    @property
    def triage_level(self) -> TriageLevel:
        return TriageLevel(self.level)
