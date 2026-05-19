import re
import uuid
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.team import Team, TeamMembership, TeamMemberRoleEnum
from app.models.user import User
from app.schemas.team import TeamCreate


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug[:120]


async def get_teams(db: AsyncSession) -> List[Team]:
    result = await db.execute(
        select(Team).where(Team.is_active == True).order_by(Team.created_at.desc())  # noqa: E712
    )
    return list(result.scalars().all())


async def get_team_by_id(db: AsyncSession, team_id: uuid.UUID) -> Optional[Team]:
    result = await db.execute(
        select(Team)
        .where(Team.id == team_id, Team.is_active == True)  # noqa: E712
        .options(selectinload(Team.memberships).selectinload(TeamMembership.user))
    )
    return result.scalar_one_or_none()


async def get_team_by_slug(db: AsyncSession, slug: str) -> Optional[Team]:
    result = await db.execute(select(Team).where(Team.slug == slug))
    return result.scalar_one_or_none()


async def get_user_team(db: AsyncSession, user_id: uuid.UUID) -> Optional[Team]:
    result = await db.execute(
        select(Team)
        .join(TeamMembership, TeamMembership.team_id == Team.id)
        .where(TeamMembership.user_id == user_id, Team.is_active == True)  # noqa: E712
        .options(selectinload(Team.memberships).selectinload(TeamMembership.user))
    )
    return result.scalar_one_or_none()


async def get_membership(
    db: AsyncSession, user_id: uuid.UUID, team_id: uuid.UUID
) -> Optional[TeamMembership]:
    result = await db.execute(
        select(TeamMembership).where(
            TeamMembership.user_id == user_id,
            TeamMembership.team_id == team_id,
        )
    )
    return result.scalar_one_or_none()


async def user_in_any_team(db: AsyncSession, user_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(TeamMembership)
        .join(Team, Team.id == TeamMembership.team_id)
        .where(TeamMembership.user_id == user_id, Team.is_active == True)  # noqa: E712
    )
    return result.scalar_one_or_none() is not None


async def create_team(
    db: AsyncSession, data: TeamCreate, captain: User
) -> Team:
    slug = _slugify(data.name)
    # Ensure slug uniqueness
    existing = await get_team_by_slug(db, slug)
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"

    team = Team(
        name=data.name,
        slug=slug,
        description=data.description,
        captain_id=captain.id,
        is_active=True,
    )
    db.add(team)
    await db.flush()

    membership = TeamMembership(
        team_id=team.id,
        user_id=captain.id,
        role=TeamMemberRoleEnum.captain,
    )
    db.add(membership)
    await db.flush()
    await db.refresh(team)
    return team


async def add_member(
    db: AsyncSession, team: Team, user: User
) -> TeamMembership:
    membership = TeamMembership(
        team_id=team.id,
        user_id=user.id,
        role=TeamMemberRoleEnum.member,
    )
    db.add(membership)
    await db.flush()
    await db.refresh(membership)
    return membership


async def dissolve_team(db: AsyncSession, team: Team) -> None:
    team.is_active = False
    db.add(team)
    await db.flush()


async def get_team_total_points(db: AsyncSession, team_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(User.points), 0))
        .join(TeamMembership, TeamMembership.user_id == User.id)
        .where(TeamMembership.team_id == team_id)
    )
    return int(result.scalar_one())


async def get_teams_leaderboard(db: AsyncSession, limit: int = 20) -> List[dict]:
    stmt = (
        select(
            Team.id,
            Team.name,
            Team.slug,
            func.count(TeamMembership.id).label("member_count"),
            func.coalesce(func.sum(User.points), 0).label("total_points"),
        )
        .join(TeamMembership, TeamMembership.team_id == Team.id)
        .join(User, User.id == TeamMembership.user_id)
        .where(Team.is_active == True)  # noqa: E712
        .group_by(Team.id, Team.name, Team.slug)
        .order_by(func.coalesce(func.sum(User.points), 0).desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "rank": idx + 1,
            "id": row.id,
            "name": row.name,
            "slug": row.slug,
            "member_count": row.member_count,
            "total_points": int(row.total_points),
        }
        for idx, row in enumerate(rows)
    ]
