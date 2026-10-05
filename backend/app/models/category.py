from typing import Any

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Category(Base):
    """A support area and the team that owns it (e.g. wellbeing → Student Wellbeing Services).

    Staff belong to a team through their category, and appointments are booked
    against a category's team.
    """

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    team_name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    guidance: Mapped[str] = mapped_column(Text, default="")
    # Lower-case phrases used by rule-based triage to detect this category.
    keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    # [{"title": str, "url": str}] shown to students as self-service help.
    resources: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)
