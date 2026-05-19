import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User, UserRoleEnum
from app.schemas.auth import RegisterRequest


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username.lower()))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: RegisterRequest) -> User:
    user = User(
        username=data.username.lower(),
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        display_name=data.display_name if data.display_name else None,
        role=UserRoleEnum.competitor,
        is_active=True,
        is_verified=False,
        mfa_enabled=False,
        points=0,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def set_mfa_secret(db: AsyncSession, user: User, secret: str) -> User:
    user.mfa_secret = secret
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def enable_mfa(db: AsyncSession, user: User) -> User:
    user.mfa_enabled = True
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def add_points(db: AsyncSession, user: User, points: int) -> User:
    user.points += points
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def list_users(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRoleEnum] = None,
    is_active: Optional[bool] = None,
) -> list[User]:
    stmt = select(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
    stmt = stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_user_fields(db: AsyncSession, user: User, **fields) -> User:
    for k, v in fields.items():
        if v is not None:
            setattr(user, k, v)
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User) -> None:
    await db.delete(user)
    await db.flush()
