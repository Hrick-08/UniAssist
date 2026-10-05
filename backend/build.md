# Backend Build Guide — UniRoute

## Overview
The backend provides the API layer for UniRoute, handling triage analysis, case management, appointment scheduling, and admin operations.

## Tech Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL (with SQLAlchemy ORM)
- **Auth**: JWT (PyJWT)
- **Validation**: Pydantic v2
- **LLM**: Groq (OpenAI-compatible API), optional — rule-based triage runs without it
- **Testing**: pytest + pytest-asyncio

## Prerequisites
- Python 3.11+
- PostgreSQL 15+
- pip / uv

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   ├── config.py        # Settings via pydantic-settings
│   │   ├── security.py      # JWT, password hashing
│   │   └── database.py      # SQLAlchemy engine/session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── case.py
│   │   ├── appointment.py
│   │   └── category.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── triage.py        # Request/response for triage
│   │   ├── case.py
│   │   ├── appointment.py
│   │   └── admin.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies (DB, auth, current_user)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── triage.py    # POST /triage, GET /triage/{id}
│   │   │   ├── cases.py     # CRUD for cases
│   │   │   ├── appointments.py
│   │   │   ├── admin.py     # Dashboard, queue, analytics
│   │   │   └── categories.py
│   │   └── router.py        # API router aggregation
│   ├── services/
│   │   ├── __init__.py
│   │   ├── triage_service.py      # LLM-based triage logic
│   │   ├── case_service.py
│   │   ├── appointment_service.py
│   │   └── notification_service.py
│   └── utils/
│       ├── __init__.py
│       └── llm_client.py          # OpenAI / local LLM wrapper
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_triage.py
│   ├── test_cases.py
│   └── test_admin.py
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── requirements.txt
├── requirements-dev.txt
├── pytest.ini
├── ruff.toml
├── mypy.ini
├── .env.example
└── Dockerfile
```

## Environment Variables
Create `.env` from `.env.example`:
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/uniroute

# Auth
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM via Groq (optional; rule-based triage is used when LLM_API_KEY is empty)
LLM_API_KEY=gsk_...
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-120b
LLM_TEMPERATURE=0.3

# App
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
UNIVERSITY_TIMEZONE=Europe/London
```

`DATABASE_URL` accepts plain `postgresql://...?sslmode=require` URLs (e.g. from Neon); they are converted for asyncpg.

## Installation

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt   # installs requirements.txt too, plus test/lint tools
# or, for a production install without dev/test tooling:
pip install -r requirements.txt
```

## Database Setup
```bash
# Create database
createdb uniroute

# Run migrations
alembic upgrade head

# Seed categories (idempotent); --demo also creates demo accounts
python -m app.scripts.seed --demo
```

Demo accounts (password `uniroute-demo`): `admin@uniroute.dev`, `wellbeing@uniroute.dev`,
`academic@uniroute.dev` (staff), `student@uniroute.dev`.

```bash
# After changing models
alembic revision --autogenerate -m "describe change"
```

## Development Server
```bash
# With the venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or directly, without activating
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000   # Windows: .venv\Scripts\uvicorn.exe
```

API docs available at: http://localhost:8000/docs

## Running Tests
Tests run against a real local Postgres database whose name must end in `_test`
(they truncate tables). They never use `DATABASE_URL`.
```bash
createdb uniroute_test   # once; override with TEST_DATABASE_URL

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=term-missing

# Specific test file
pytest tests/test_triage.py -v
```

## Linting & Type Checking
```bash
# Ruff (lint + format)
ruff check .
ruff format .

# MyPy
mypy app/
```

## Key API Endpoints

### Student-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/triage` | Submit problem for triage analysis |
| GET | `/api/v1/triage/{id}` | Get triage result |
| POST | `/api/v1/cases` | Create support case |
| GET | `/api/v1/cases` | List student's cases |
| GET | `/api/v1/cases/{id}` | Get case details |
| POST | `/api/v1/appointments` | Schedule appointment |
| GET | `/api/v1/appointments/available?category=` | Get available slots |
| POST | `/api/v1/auth/register` | Student sign-up |
| POST | `/api/v1/auth/login` | Sign in (JSON), returns bearer token |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/categories` | Categories, teams and resources |

### Admin-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/queue` | Triage queue with filters |
| GET | `/api/v1/admin/cases/{id}` | Admin case details |
| PATCH | `/api/v1/admin/cases/{id}` | Update case (assign, status) |
| POST | `/api/v1/admin/cases/{id}/appointments` | Schedule for student |
| GET | `/api/v1/admin/analytics` | Trends & insights |
| GET | `/api/v1/admin/staff` | Staff list (for assignment) |
| PATCH | `/api/v1/categories/{slug}` | Edit team/guidance/keywords (admin) |

## Triage Service Details
The triage service (`app/services/triage_service.py`) uses an LLM to:
1. Extract key topics from student input
2. Assess urgency level (1-4)
3. Determine category
4. Recommend team + response time
5. Provide confidence score

### Triage Levels
| Level | Name | Action |
|-------|------|--------|
| 1 | Instant Guidance | Return resources, no case |
| 2 | Support Recommended | Offer resources + human support option |
| 3 | Priority Support | Create case + appointment |
| 4 | Safety Escalation | Immediate escalation contacts |

## Deployment Checklist
- [ ] Set `ENVIRONMENT=production`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure production `DATABASE_URL`
- [ ] Configure CORS for production frontend domain
- [ ] Set up SSL/TLS (reverse proxy: nginx/Traefik)
- [ ] Configure logging aggregation
- [ ] Set up health checks (`/health`)
- [ ] Run migrations on deploy
- [ ] Seed production categories