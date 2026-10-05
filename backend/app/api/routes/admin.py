from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import SessionDep, StaffUser
from app.api.serializers import admin_case_detail, appointment_out, queue_item, staff_out
from app.core.database import utcnow
from app.models import Case, CaseStatus, Category, Role, User
from app.schemas.admin import (
    AdminCaseDetail,
    Analytics,
    CaseUpdate,
    DashboardStats,
    QueuePage,
    StaffOut,
)
from app.schemas.appointment import AdminAppointmentCreate, AppointmentOut
from app.services import analytics_service, appointment_service, case_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(session: SessionDep, _: StaffUser) -> DashboardStats:
    return await analytics_service.dashboard(session)


@router.get("/queue", response_model=QueuePage)
async def queue(
    session: SessionDep,
    _: StaffUser,
    category: str | None = Query(default=None, description="Category slug"),
    min_priority: int | None = Query(default=None, ge=1, le=4),
    unassigned: bool = False,
    status_filter: CaseStatus | None = Query(default=None, alias="status"),
    include_resolved: bool = False,
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> QueuePage:
    """Open cases, escalations first, then highest priority, then oldest."""
    query = select(Case)
    if category:
        query = query.join(Category, Category.id == Case.category_id).where(
            Category.slug == category
        )
    if min_priority:
        query = query.where(Case.priority >= min_priority)
    if unassigned:
        query = query.where(Case.assigned_to_id.is_(None))
    if status_filter:
        query = query.where(Case.status == status_filter)
    elif not include_resolved:
        query = query.where(Case.status != CaseStatus.RESOLVED)

    total = await session.scalar(select(func.count()).select_from(query.subquery())) or 0
    cases = await session.scalars(
        query.order_by(Case.escalated.desc(), Case.priority.desc(), Case.created_at)
        .limit(limit)
        .offset(offset)
    )
    now = utcnow()
    return QueuePage(
        items=[queue_item(c, now) for c in cases], total=total, limit=limit, offset=offset
    )


@router.get("/cases/{reference}", response_model=AdminCaseDetail)
async def case_detail(reference: str, session: SessionDep, _: StaffUser) -> AdminCaseDetail:
    return admin_case_detail(await case_service.get_case(session, reference))


@router.patch("/cases/{reference}", response_model=AdminCaseDetail)
async def update_case(
    reference: str, data: CaseUpdate, session: SessionDep, staff: StaffUser
) -> AdminCaseDetail:
    case = await case_service.get_case(session, reference)
    await case_service.update_case(session, case, staff, data)
    await session.commit()
    return admin_case_detail(case)


@router.post(
    "/cases/{reference}/appointments",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
)
async def schedule_for_student(
    reference: str, data: AdminAppointmentCreate, session: SessionDep, staff: StaffUser
) -> AppointmentOut:
    case = await case_service.get_case(session, reference)
    appointment = await appointment_service.book(session, case, data.starts_at, staff)
    await session.commit()
    return appointment_out(appointment)


@router.get("/staff", response_model=list[StaffOut])
async def list_staff(
    session: SessionDep,
    _: StaffUser,
    category: str | None = Query(default=None, description="Only this team"),
) -> list[StaffOut]:
    query = select(User).where(User.role.in_([Role.STAFF, Role.ADMIN]), User.is_active.is_(True))
    if category:
        team = await session.scalar(select(Category.id).where(Category.slug == category))
        if team is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown category: {category}")
        query = query.where(User.category_id == team)
    users = await session.scalars(query.order_by(User.full_name))
    return [staff_out(u) for u in users]


@router.get("/analytics", response_model=Analytics)
async def analytics(
    session: SessionDep, _: StaffUser, days: int = Query(default=30, ge=1, le=365)
) -> Analytics:
    return await analytics_service.analytics(session, days)
