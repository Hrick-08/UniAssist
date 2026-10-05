"""Test setup: runs against a real local Postgres database (JSONB, FILTER, etc. are used).

Set TEST_DATABASE_URL to override. The database is wiped between tests, so the
URL must point at a database whose name ends in "_test".
"""

import os

os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+asyncpg://localhost/uniroute_test"
)
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-123")
os.environ["ENVIRONMENT"] = "test"
os.environ["LLM_API_KEY"] = ""  # rule-based triage only: deterministic and offline

from collections.abc import AsyncIterator  # noqa: E402

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.scripts.seed import DEMO_PASSWORD, seed_categories, seed_demo_users  # noqa: E402

if not get_settings().async_database_url.rsplit("/", 1)[-1].endswith("_test"):
    raise RuntimeError("Refusing to run tests: database name must end in '_test'")


@pytest.fixture(scope="session", autouse=True)
async def _schema() -> AsyncIterator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest.fixture(autouse=True)
async def _clean_db() -> AsyncIterator[None]:
    tables = ", ".join(t.name for t in Base.metadata.sorted_tables)
    async with engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))
    async with SessionLocal() as session:
        categories = await seed_categories(session)
        await seed_demo_users(session, categories)
        await session.commit()
    yield


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def _login(client: AsyncClient, email: str) -> dict[str, str]:
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": DEMO_PASSWORD})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture
async def student(client: AsyncClient) -> dict[str, str]:
    return await _login(client, "student@uniroute.dev")


@pytest.fixture
async def staff(client: AsyncClient) -> dict[str, str]:
    return await _login(client, "wellbeing@uniroute.dev")


@pytest.fixture
async def admin(client: AsyncClient) -> dict[str, str]:
    return await _login(client, "admin@uniroute.dev")
