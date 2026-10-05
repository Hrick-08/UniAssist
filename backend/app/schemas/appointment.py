import uuid
from datetime import datetime

from pydantic import AwareDatetime, BaseModel


class Slot(BaseModel):
    starts_at: datetime
    ends_at: datetime


class Availability(BaseModel):
    category: str
    team_name: str
    timezone: str
    slots: list[Slot]


class AppointmentCreate(BaseModel):
    case_reference: str
    starts_at: AwareDatetime


class AdminAppointmentCreate(BaseModel):
    starts_at: AwareDatetime


class AppointmentOut(BaseModel):
    id: uuid.UUID
    case_reference: str
    team_name: str
    starts_at: datetime
    ends_at: datetime
