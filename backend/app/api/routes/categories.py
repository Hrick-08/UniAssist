from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import AdminUser, SessionDep
from app.models import Category
from app.schemas.category import CategoryAdmin, CategoryDetail, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


async def _get(session: SessionDep, slug: str) -> Category:
    category = await session.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown category: {slug}")
    return category


@router.get("", response_model=list[CategoryDetail])
async def list_categories(session: SessionDep) -> list[Category]:
    return list((await session.scalars(select(Category).order_by(Category.id))).all())


@router.get("/{slug}", response_model=CategoryDetail)
async def get_category(slug: str, session: SessionDep) -> Category:
    return await _get(session, slug)


@router.patch("/{slug}", response_model=CategoryAdmin)
async def update_category(
    slug: str, data: CategoryUpdate, session: SessionDep, _: AdminUser
) -> Category:
    """Edit a category's team, guidance, resources or triage keywords.

    Categories themselves are a fixed taxonomy (triage rules depend on the
    slugs), so there is no create/delete.
    """
    category = await _get(session, slug)
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    if "keywords" in changes:
        changes["keywords"] = sorted({k.strip().lower() for k in changes["keywords"] if k.strip()})
    for field, value in changes.items():
        setattr(category, field, value)
    await session.commit()
    return category
