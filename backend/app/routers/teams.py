import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_competitor
from app.crud.team import (
    add_member,
    create_team,
    dissolve_team,
    get_team_by_id,
    get_team_total_points,
    get_teams,
    get_user_team,
    user_in_any_team,
    get_membership,
)
from app.db.session import get_db
from app.models.team import TeamMemberRoleEnum
from app.models.user import User
from app.schemas.team import MemberOut, TeamCreate, TeamDetailOut, TeamOut

router = APIRouter(prefix="/teams", tags=["teams"])


def _build_team_out(team, total_points: int) -> TeamOut:
    return TeamOut(
        id=team.id,
        name=team.name,
        slug=team.slug,
        description=team.description,
        is_active=team.is_active,
        created_at=team.created_at,
        member_count=len(team.memberships) if hasattr(team, "memberships") else 0,
        total_points=total_points,
    )


def _build_team_detail_out(team, total_points: int) -> TeamDetailOut:
    members = [
        MemberOut(
            user_id=m.user.id,
            username=m.user.username,
            role=m.role,
            points=m.user.points,
        )
        for m in team.memberships
    ]
    return TeamDetailOut(
        id=team.id,
        name=team.name,
        slug=team.slug,
        description=team.description,
        is_active=team.is_active,
        created_at=team.created_at,
        member_count=len(team.memberships),
        total_points=total_points,
        members=members,
    )


@router.get("/my", response_model=TeamDetailOut)
async def get_my_team(
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    team = await get_user_team(db, current_user.id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not in a team")
    total_points = await get_team_total_points(db, team.id)
    return _build_team_detail_out(team, total_points)


@router.get("/", response_model=List[TeamOut])
async def list_teams(db: AsyncSession = Depends(get_db)):
    teams = await get_teams(db)
    result = []
    for team in teams:
        total_points = await get_team_total_points(db, team.id)
        member_count = await _count_members(db, team.id)
        out = TeamOut(
            id=team.id,
            name=team.name,
            slug=team.slug,
            description=team.description,
            is_active=team.is_active,
            created_at=team.created_at,
            member_count=member_count,
            total_points=total_points,
        )
        result.append(out)
    return result


async def _count_members(db: AsyncSession, team_id: uuid.UUID) -> int:
    from sqlalchemy import func, select
    from app.models.team import TeamMembership

    result = await db.execute(
        select(func.count(TeamMembership.id)).where(TeamMembership.team_id == team_id)
    )
    return result.scalar_one()


@router.post("/", response_model=TeamDetailOut, status_code=status.HTTP_201_CREATED)
async def create_new_team(
    data: TeamCreate,
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    already_in_team = await user_in_any_team(db, current_user.id)
    if already_in_team:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already a member of a team",
        )
    team = await create_team(db, data, current_user)
    # Reload with memberships
    team = await get_team_by_id(db, team.id)
    total_points = await get_team_total_points(db, team.id)
    return _build_team_detail_out(team, total_points)


@router.get("/{team_id}", response_model=TeamDetailOut)
async def get_team(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    total_points = await get_team_total_points(db, team.id)
    return _build_team_detail_out(team, total_points)


@router.post("/{team_id}/join", response_model=TeamDetailOut)
async def join_team(
    team_id: uuid.UUID,
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    already_in_team = await user_in_any_team(db, current_user.id)
    if already_in_team:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already a member of a team",
        )

    existing_membership = await get_membership(db, current_user.id, team_id)
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already in this team",
        )

    await add_member(db, team, current_user)
    # Reload with memberships
    team = await get_team_by_id(db, team.id)
    total_points = await get_team_total_points(db, team.id)
    return _build_team_detail_out(team, total_points)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    team = await get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    if team.captain_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team captain can dissolve the team",
        )

    await dissolve_team(db, team)
