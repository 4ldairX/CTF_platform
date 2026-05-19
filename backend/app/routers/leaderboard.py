from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.team import get_teams_leaderboard
from app.db.session import get_db
from app.models.submission import Submission
from app.models.team import Team, TeamMembership
from app.models.user import User, UserRoleEnum

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=List[Dict[str, Any]])
async def get_user_leaderboard(db: AsyncSession = Depends(get_db)):
    """
    Returns top 50 users ordered by points descending.
    Each entry: rank, user_id, username, points, solves_count, team_name.
    """
    # Subquery: count correct submissions per user
    solves_subq = (
        select(
            Submission.user_id,
            func.count(Submission.id).label("solves_count"),
        )
        .where(Submission.is_correct == True)  # noqa: E712
        .group_by(Submission.user_id)
        .subquery()
    )

    # Subquery: get team name for each user (if they are in one)
    team_subq = (
        select(
            TeamMembership.user_id,
            Team.name.label("team_name"),
        )
        .join(Team, Team.id == TeamMembership.team_id)
        .where(Team.is_active == True)  # noqa: E712
        .subquery()
    )

    stmt = (
        select(
            User.id,
            User.username,
            User.points,
            func.coalesce(solves_subq.c.solves_count, 0).label("solves_count"),
            team_subq.c.team_name,
        )
        .outerjoin(solves_subq, solves_subq.c.user_id == User.id)
        .outerjoin(team_subq, team_subq.c.user_id == User.id)
        .where(
            User.is_active == True,  # noqa: E712
            User.role == UserRoleEnum.competitor,  # only competitors in ranking
        )
        .order_by(User.points.desc(), User.username.asc())
        .limit(50)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "rank": idx + 1,
            "user_id": str(row.id),
            "username": row.username,
            "points": row.points,
            "solves_count": int(row.solves_count),
            "team_name": row.team_name,
        }
        for idx, row in enumerate(rows)
    ]


@router.get("/teams", response_model=List[Dict[str, Any]])
async def get_team_leaderboard(db: AsyncSession = Depends(get_db)):
    """Returns top 20 teams ordered by total points descending."""
    teams = await get_teams_leaderboard(db, limit=20)
    return [
        {
            "rank": t["rank"],
            "team_id": str(t["id"]),
            "name": t["name"],
            "slug": t["slug"],
            "member_count": t["member_count"],
            "total_points": t["total_points"],
        }
        for t in teams
    ]
