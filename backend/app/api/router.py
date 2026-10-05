from fastapi import APIRouter

from app.api.routes import admin, appointments, auth, cases, categories, triage

api_router = APIRouter(prefix="/api/v1")
for module in (auth, triage, cases, appointments, categories, admin):
    api_router.include_router(module.router)
