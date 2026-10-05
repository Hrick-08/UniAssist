from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import and_, func, select, true
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import utcnow
from app.models import Case, CaseStatus, Category, Triage, TriageLevel
from app.schemas.admin import (
    Analytics,
    CategoryTrend,
    DailyCount,
    DashboardStats,
    TeamResponse,
    TopicCount,
)

_FIRST_RESPONSE_SECONDS = func.extract("epoch", Case.first_response_at - Case.created_at)


def _hours(seconds: float | None) -> float | None:
    return round(float(seconds) / 3600, 1) if seconds is not None else None


async def dashboard(session: AsyncSession) -> DashboardStats:
    now = utcnow()
    is_open = Case.status != CaseStatus.RESOLVED

    triage_row = (
        await session.execute(
            select(
                func.count(Triage.id),
                func.count(Triage.id).filter(
                    and_(Triage.level == TriageLevel.GENERAL_GUIDANCE, Case.id.is_(None))
                ),
            ).outerjoin(Case, Case.triage_id == Triage.id)
        )
    ).one()

    case_row = (
        await session.execute(
            select(
                func.count(Case.id),
                func.count(Case.id).filter(is_open),
                func.count(Case.id).filter(is_open, Case.priority >= TriageLevel.PRIORITY_SUPPORT),
                func.count(Case.id).filter(is_open, Case.escalated.is_(True)),
                func.count(Case.id).filter(is_open, Case.assigned_to_id.is_(None)),
                func.count(Case.id).filter(
                    is_open, Case.first_response_at.is_(None), Case.respond_by < now
                ),
                func.count(Case.id).filter(Case.status == CaseStatus.RESOLVED),
                func.avg(_FIRST_RESPONSE_SECONDS),
            )
        )
    ).one()

    return DashboardStats(
        total_requests=triage_row[0],
        self_service_resolved=triage_row[1],
        total_cases=case_row[0],
        open_cases=case_row[1],
        high_priority_open=case_row[2],
        escalations_open=case_row[3],
        unassigned_open=case_row[4],
        overdue_open=case_row[5],
        resolved=case_row[6],
        avg_first_response_hours=_hours(case_row[7]),
    )


async def analytics(session: AsyncSession, days: int) -> Analytics:
    now = utcnow()
    since = now - timedelta(days=days)
    previous_since = since - timedelta(days=days)
    tz = get_settings().UNIVERSITY_TIMEZONE
    in_period = Triage.created_at >= since

    local_day = func.date(func.timezone(tz, Triage.created_at)).label("day")
    daily_rows = await session.execute(
        select(local_day, Category.slug, func.count(Triage.id))
        .join(Category, Category.id == Triage.category_id)
        .where(in_period)
        .group_by(local_day, Category.slug)
        .order_by(local_day)
    )
    by_day: dict[date, dict[str, int]] = defaultdict(dict)
    for day, slug, count in daily_rows:
        by_day[day][slug] = count
    requests_by_day = [
        DailyCount(date=day, total=sum(counts.values()), by_category=counts)
        for day, counts in by_day.items()
    ]

    trend_rows = await session.execute(
        select(
            Category.slug,
            func.count(Triage.id).filter(Triage.created_at >= since),
            func.count(Triage.id).filter(
                Triage.created_at >= previous_since, Triage.created_at < since
            ),
        )
        .outerjoin(Triage, Triage.category_id == Category.id)
        .group_by(Category.slug)
        .order_by(Category.slug)
    )
    trends = [
        CategoryTrend(
            category=slug,
            current=current,
            previous=previous,
            change_pct=round((current - previous) / previous * 100, 1) if previous else None,
        )
        for slug, current, previous in trend_rows
    ]

    level_rows = await session.execute(
        select(Triage.level, func.count(Triage.id)).where(in_period).group_by(Triage.level)
    )

    team_rows = await session.execute(
        select(
            Category.team_name,
            func.avg(_FIRST_RESPONSE_SECONDS).filter(Case.created_at >= since),
            func.count(Case.id).filter(Case.status != CaseStatus.RESOLVED),
        )
        .outerjoin(Case, Case.category_id == Category.id)
        .group_by(Category.team_name)
        .order_by(Category.team_name)
    )

    topic = func.jsonb_array_elements_text(Triage.topics).table_valued("value").render_derived()
    topic_rows = await session.execute(
        select(topic.c.value, func.count())
        .select_from(Triage)
        .join(topic, true())
        .where(in_period)
        .group_by(topic.c.value)
        .order_by(func.count().desc(), topic.c.value)
        .limit(10)
    )

    return Analytics(
        period_days=days,
        requests_by_day=requests_by_day,
        by_category={t.category: t.current for t in trends},
        by_level={level: count for level, count in level_rows},
        category_trends=trends,
        response_by_team=[
            TeamResponse(team_name=team, avg_first_response_hours=_hours(avg), open_cases=open_)
            for team, avg, open_ in team_rows
        ],
        top_topics=[TopicCount(topic=t, count=c) for t, c in topic_rows],
    )
