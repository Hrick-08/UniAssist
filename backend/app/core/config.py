from functools import cached_property, lru_cache
from typing import Any, Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# libpq query params that asyncpg rejects; sslmode is translated, the rest dropped.
_LIBPQ_ONLY_PARAMS = {"sslmode", "channel_binding"}


class EscalationContact(BaseModel):
    name: str
    phone: str
    available: str
    description: str


# Shown to students on Level 4 escalations. Override with ESCALATION_CONTACTS
# (a JSON list) to configure the university's own numbers.
DEFAULT_ESCALATION_CONTACTS = [
    EscalationContact(
        name="Emergency services",
        phone="999",
        available="24/7",
        description="If you or someone else is in immediate danger.",
    ),
    EscalationContact(
        name="Campus Security",
        phone="+44 20 7946 0000",
        available="24/7",
        description="On-campus emergencies and urgent safety concerns.",
    ),
    EscalationContact(
        name="Samaritans",
        phone="116 123",
        available="24/7, free",
        description="Confidential support from a trained listener.",
    ),
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Any OpenAI-compatible endpoint; defaults to Groq.
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.groq.com/openai/v1"
    LLM_MODEL: str = "openai/gpt-oss-120b"
    LLM_TEMPERATURE: float = 0.3
    LLM_TIMEOUT_SECONDS: float = 8.0

    ENVIRONMENT: Literal["development", "test", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "http://localhost:3000"
    UNIVERSITY_TIMEZONE: str = "Europe/London"
    ESCALATION_CONTACTS: list[EscalationContact] = DEFAULT_ESCALATION_CONTACTS

    @field_validator("UNIVERSITY_TIMEZONE")
    @classmethod
    def _valid_timezone(cls, value: str) -> str:
        ZoneInfo(value)
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def timezone(self) -> ZoneInfo:
        return ZoneInfo(self.UNIVERSITY_TIMEZONE)

    @property
    def llm_enabled(self) -> bool:
        return bool(self.LLM_API_KEY)

    @cached_property
    def _db(self) -> tuple[str, dict[str, Any]]:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def async_database_url(self) -> str:
        return self._db[0]

    @property
    def database_connect_args(self) -> dict[str, Any]:
        return self._db[1]


def normalize_database_url(url: str) -> tuple[str, dict[str, Any]]:
    """Return an asyncpg SQLAlchemy URL plus connect_args.

    Accepts plain libpq URLs (as given by Neon, Heroku, etc.) so the same
    value can be pasted from a provider dashboard.
    """
    parts = urlsplit(url)
    scheme = parts.scheme
    if scheme in ("postgres", "postgresql"):
        scheme = "postgresql+asyncpg"
    elif scheme != "postgresql+asyncpg":
        raise ValueError(f"Unsupported database scheme: {parts.scheme}")

    query = dict(parse_qsl(parts.query))
    connect_args: dict[str, Any] = {}
    sslmode = query.get("sslmode")
    if sslmode and sslmode not in ("disable", "allow", "prefer"):
        connect_args["ssl"] = "require"
    kept = {k: v for k, v in query.items() if k not in _LIBPQ_ONLY_PARAMS}

    return urlunsplit((scheme, parts.netloc, parts.path, urlencode(kept), "")), connect_args


@lru_cache
def get_settings() -> Settings:
    return Settings()
