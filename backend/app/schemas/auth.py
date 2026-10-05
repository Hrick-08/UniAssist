import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import Role
from app.schemas.category import CategoryOut


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=120)
    student_number: str | None = Field(default=None, max_length=32)

    @field_validator("password")
    @classmethod
    def _bcrypt_limit(cls, value: str) -> str:
        if len(value.encode()) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    student_number: str | None
    role: Role
    category: CategoryOut | None = Field(description="Staff team, if any")


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
