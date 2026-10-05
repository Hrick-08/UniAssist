# Backend Build Guide — UniRoute

## Overview
The backend provides the API layer for UniRoute, handling triage analysis, case management, appointment scheduling, and admin operations.

## Tech Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL (with SQLAlchemy ORM)
- **Auth**: JWT (PyJWT)
- **Validation**: Pydantic v2
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
├── pyproject.toml
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

# LLM
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.3

# App
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

## Installation

### Using uv (recommended)
```bash
cd backend
uv sync
```

### Using pip
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Database Setup
```bash
# Create database
createdb uniroute

# Run migrations
alembic upgrade head

# Create initial data (categories, admin user)
python -m app.scripts.seed
```

## Development Server
```bash
# With uv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# With pip
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

## Running Tests
```bash
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
| GET | `/api/v1/appointments/available` | Get available slots |

### Admin-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/queue` | Triage queue with filters |
| GET | `/api/v1/admin/cases/{id}` | Admin case details |
| PATCH | `/api/v1/admin/cases/{id}` | Update case (assign, status) |
| POST | `/api/v1/admin/cases/{id}/appointments` | Schedule for student |
| GET | `/api/v1/admin/analytics` | Trends & insights |

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
- [ ] Set up Redis with persistence
- [ ] Configure CORS for production frontend domain
- [ ] Set up SSL/TLS (reverse proxy: nginx/Traefik)
- [ ] Configure logging aggregation
- [ ] Set up health checks (`/health`)
- [ ] Run migrations on deploy
- [ ] Seed production categories