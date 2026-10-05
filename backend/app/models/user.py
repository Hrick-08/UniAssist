import uuid
from enum import StrEnum

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin
from app.models.category import Category


class Role(StrEnum):
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    full_name: Mapped[str] = mapped_column(String(120))
    student_number: Mapped[str | None] = mapped_column(String(32))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(
        Enum(Role, native_enum=False, length=16, values_callable=lambda e: [m.value for m in e]),
        default=Role.STUDENT,
    )
    # Staff team membership; null for students and for admins without a team.
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    is_active: Mapped[bool] = mapped_column(default=True)

    category: Mapped[Category | None] = relationship(lazy="joined")

    @property
    def is_staff(self) -> bool:
        return self.role in (Role.STAFF, Role.ADMIN)
