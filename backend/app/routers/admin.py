import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_admin, require_admin_or_moderator
from app.crud.challenge import (
    create_challenge,
    delete_challenge,
    get_all_challenges_admin,
    update_challenge,
)
from app.crud.user import (
    delete_user,
    get_user_by_id,
    list_users,
    update_user_fields,
)
from app.db.session import get_db
from app.models.challenge import Challenge
from app.models.platform_setting import PlatformSetting
from app.models.submission import Submission
from app.models.team import Team
from app.models.user import User, UserRoleEnum
from app.schemas.auth import AdminUserOut, UserUpdateRequest
from app.schemas.challenge import (
    ChallengeAdminOut,
    ChallengeCreateRequest,
    ChallengeUpdateRequest,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------


@router.get("/stats")
async def get_stats(
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    total_users = await db.scalar(select(func.count(User.id)))
    total_challenges = await db.scalar(select(func.count(Challenge.id)))
    total_teams = await db.scalar(select(func.count(Team.id)).where(Team.is_active == True))  # noqa: E712
    total_solves = await db.scalar(
        select(func.count(Submission.id)).where(Submission.is_correct == True)  # noqa: E712
    )

    admin_count = await db.scalar(
        select(func.count(User.id)).where(User.role == UserRoleEnum.admin)
    )
    instructor_count = await db.scalar(
        select(func.count(User.id)).where(User.role == UserRoleEnum.instructor)
    )
    moderator_count = await db.scalar(
        select(func.count(User.id)).where(User.role == UserRoleEnum.moderator)
    )
    competitor_count = await db.scalar(
        select(func.count(User.id)).where(User.role == UserRoleEnum.competitor)
    )

    return {
        "total_users": total_users or 0,
        "total_challenges": total_challenges or 0,
        "total_teams": total_teams or 0,
        "total_solves": total_solves or 0,
        "role_counts": {
            "admin": admin_count or 0,
            "instructor": instructor_count or 0,
            "moderator": moderator_count or 0,
            "competitor": competitor_count or 0,
        },
    }


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


@router.get("/users", response_model=List[AdminUserOut])
async def list_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    role: Optional[UserRoleEnum] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    users = await list_users(db, skip=skip, limit=limit, role=role, is_active=is_active)
    return [AdminUserOut.model_validate(u) for u in users]


@router.patch("/users/{user_id}", response_model=AdminUserOut)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own account via admin endpoint",
        )

    # If we are promoting a competitor to a non-competitor role (instructor/
    # moderator/admin), they MUST leave any team they belong to — non-competitor
    # roles cannot have a team or appear in the ranking.
    if (
        data.role is not None
        and user.role == UserRoleEnum.competitor
        and data.role != UserRoleEnum.competitor
    ):
        from app.models.team import TeamMembership

        await db.execute(
            TeamMembership.__table__.delete().where(TeamMembership.user_id == user.id)
        )

    updated = await update_user_fields(
        db,
        user,
        role=data.role,
        is_active=data.is_active,
        display_name=data.display_name,
    )
    return AdminUserOut.model_validate(updated)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    await delete_user(db, user)


# ---------------------------------------------------------------------------
# Challenges (CRUD completo para admins)
# ---------------------------------------------------------------------------


@router.get("/challenges", response_model=List[ChallengeAdminOut])
async def list_challenges_admin(
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    challenges = await get_all_challenges_admin(db)
    return [ChallengeAdminOut.model_validate(c) for c in challenges]


@router.post(
    "/challenges",
    response_model=ChallengeAdminOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_challenge_endpoint(
    data: ChallengeCreateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    challenge = await create_challenge(db, data, author_id=admin.id)
    return ChallengeAdminOut.model_validate(challenge)


@router.put("/challenges/{challenge_id}", response_model=ChallengeAdminOut)
async def update_challenge_endpoint(
    challenge_id: uuid.UUID,
    data: ChallengeUpdateRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    updated = await update_challenge(db, challenge, data)
    return ChallengeAdminOut.model_validate(updated)


@router.delete("/challenges/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge_endpoint(
    challenge_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    await delete_challenge(db, challenge)


# ---------------------------------------------------------------------------
# Submissions (audit trail)
# ---------------------------------------------------------------------------


@router.get("/submissions")
async def list_submissions_admin(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.user), selectinload(Submission.challenge))
        .order_by(Submission.submitted_at.desc())
        .offset(skip)
        .limit(limit)
    )
    submissions = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "username": s.user.username,
            "challenge_title": s.challenge.title,
            "challenge_category": s.challenge.category.value,
            "is_correct": s.is_correct,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in submissions
    ]


# ---------------------------------------------------------------------------
# Platform settings
# ---------------------------------------------------------------------------


DEFAULT_SETTINGS = {
    "platform_name": "CyberQuest",
    "flag_prefix": "CQ",
    "max_team_size": "4",
    "allow_registration": "true",
    "maintenance_mode": "false",
    "mfa_required_all": "false",
}


@router.get("/settings")
async def get_settings(
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PlatformSetting))
    rows = result.scalars().all()
    stored = {r.key: r.value for r in rows}
    # Merge defaults so the frontend always receives the full set
    return {**DEFAULT_SETTINGS, **stored}


@router.put("/settings")
async def update_settings(
    payload: dict[str, str],
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Whitelist allowed keys to avoid unbounded growth / injection
    allowed = set(DEFAULT_SETTINGS.keys())
    invalid = set(payload.keys()) - allowed
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown settings: {', '.join(sorted(invalid))}",
        )

    for key, value in payload.items():
        if not isinstance(value, str):
            value = str(value)
        result = await db.execute(
            select(PlatformSetting).where(PlatformSetting.key == key)
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.value = value
        else:
            db.add(PlatformSetting(key=key, value=value))

    await db.flush()
    result = await db.execute(select(PlatformSetting))
    rows = result.scalars().all()
    stored = {r.key: r.value for r in rows}
    return {**DEFAULT_SETTINGS, **stored}
