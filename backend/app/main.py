import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.errors import ServiceError

settings = get_settings()
logging.basicConfig(
    level=settings.LOG_LEVEL, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

app = FastAPI(
    title="UniRoute API",
    description="Student-support triage, case management and appointments.",
    version="0.1.0",
    # Interactive docs are a development aid; don't expose them in production.
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.exception_handler(ServiceError)
async def _service_error(_: Request, exc: ServiceError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.get("/health", tags=["health"])
async def health() -> JSONResponse:
    try:
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        logging.getLogger(__name__).exception("Health check failed")
        return JSONResponse(status_code=503, content={"status": "unavailable", "database": "down"})
    return JSONResponse(content={"status": "ok", "database": "ok"})
