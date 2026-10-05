from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Role, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _token(user: User) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id, user.role),
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: SessionDep) -> TokenOut:
    """Create a student account. Staff and admin accounts are provisioned by an admin."""
    email = data.email.lower()
    if await session.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="An account with this email exists")
    user = User(
        email=email,
        full_name=data.full_name,
        student_number=data.student_number,
        hashed_password=hash_password(data.password),
        role=Role.STUDENT,
    )
    session.add(user)
    await session.commit()
    return _token(user)


@router.post("/login", response_model=TokenOut)
async def login(data: LoginRequest, session: SessionDep) -> TokenOut:
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if (
        user is None
        or not user.is_active
        or not verify_password(data.password, user.hashed_password)
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return _token(user)


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> User:
    return user
