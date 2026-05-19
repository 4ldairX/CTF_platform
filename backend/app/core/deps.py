from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
    except ValueError:
        raise credentials_exception

    if payload.get("type") != "access":
        raise credentials_exception

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    from app.crud.user import get_user_by_id
    import uuid

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    user = await get_user_by_id(db, uid)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account"
        )
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def require_admin_or_moderator(
    current_user: User = Depends(get_current_user),
) -> User:
    allowed = {UserRoleEnum.admin, UserRoleEnum.moderator}
    if current_user.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or moderator privileges required",
        )
    return current_user


async def require_instructor_or_above(
    current_user: User = Depends(get_current_user),
) -> User:
    allowed = {UserRoleEnum.admin, UserRoleEnum.instructor}
    if current_user.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor or admin privileges required",
        )
    return current_user


async def require_moderator(
    current_user: User = Depends(get_current_user),
) -> User:
    """Strict: only moderators (used for cases reserved to moderator)."""
    if current_user.role != UserRoleEnum.moderator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator privileges required",
        )
    return current_user


async def require_competitor(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRoleEnum.competitor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Competitor account required",
        )
    return current_user


async def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Returns the user if authenticated, or None if no valid token is provided."""
    try:
        return await get_current_user(token=token, db=db)
    except HTTPException:
        return None
