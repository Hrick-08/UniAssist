import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin
from app.models.category import Category


class Appointment(TimestampMixin, Base):
    __tablename__ = "appointments"
    # A team can hold one appointment per slot; the DB enforces no double booking.
    __table_args__ = (UniqueConstraint("category_id", "starts_at"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    booked_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    category: Mapped[Category] = relationship(lazy="joined")
