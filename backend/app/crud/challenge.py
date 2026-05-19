import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import hash_flag
from app.models.challenge import CategoryEnum, Challenge, ChallengeHintReveal, DifficultyEnum, Hint
from app.models.submission import Submission
from app.models.user import User


async def get_challenges(
    db: AsyncSession,
    category: Optional[CategoryEnum] = None,
    difficulty: Optional[DifficultyEnum] = None,
) -> List[Challenge]:
    stmt = select(Challenge).where(Challenge.is_active == True)  # noqa: E712
    if category is not None:
        stmt = stmt.where(Challenge.category == category)
    if difficulty is not None:
        stmt = stmt.where(Challenge.difficulty == difficulty)
    stmt = stmt.order_by(Challenge.points.asc(), Challenge.created_at.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_challenge_by_id(
    db: AsyncSession, challenge_id: uuid.UUID
) -> Optional[Challenge]:
    stmt = (
        select(Challenge)
        .where(Challenge.id == challenge_id, Challenge.is_active == True)  # noqa: E712
        .options(selectinload(Challenge.hints), selectinload(Challenge.first_blood_user))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_revealed_hint_ids(
    db: AsyncSession, user_id: uuid.UUID, challenge_id: uuid.UUID
) -> set[uuid.UUID]:
    stmt = (
        select(ChallengeHintReveal.hint_id)
        .join(Hint, Hint.id == ChallengeHintReveal.hint_id)
        .where(
            ChallengeHintReveal.user_id == user_id,
            Hint.challenge_id == challenge_id,
        )
    )
    result = await db.execute(stmt)
    return set(result.scalars().all())


async def get_hint_by_id(db: AsyncSession, hint_id: uuid.UUID) -> Optional[Hint]:
    result = await db.execute(select(Hint).where(Hint.id == hint_id))
    return result.scalar_one_or_none()


async def has_revealed_hint(
    db: AsyncSession, user_id: uuid.UUID, hint_id: uuid.UUID
) -> bool:
    result = await db.execute(
        select(ChallengeHintReveal).where(
            ChallengeHintReveal.user_id == user_id,
            ChallengeHintReveal.hint_id == hint_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def reveal_hint(
    db: AsyncSession, user_id: uuid.UUID, hint_id: uuid.UUID
) -> ChallengeHintReveal:
    reveal = ChallengeHintReveal(user_id=user_id, hint_id=hint_id)
    db.add(reveal)
    await db.flush()
    return reveal


async def get_existing_correct_submission(
    db: AsyncSession, user_id: uuid.UUID, challenge_id: uuid.UUID
) -> Optional[Submission]:
    result = await db.execute(
        select(Submission).where(
            Submission.user_id == user_id,
            Submission.challenge_id == challenge_id,
            Submission.is_correct == True,  # noqa: E712
        )
    )
    return result.scalar_one_or_none()


async def create_submission(
    db: AsyncSession,
    user_id: uuid.UUID,
    challenge_id: uuid.UUID,
    submitted_flag: str,
    is_correct: bool,
    team_id: uuid.UUID | None = None,
) -> Submission:
    submission = Submission(
        user_id=user_id,
        challenge_id=challenge_id,
        team_id=team_id,
        submitted_flag_hash=hash_flag(submitted_flag),
        is_correct=is_correct,
    )
    db.add(submission)
    await db.flush()
    await db.refresh(submission)
    return submission


async def increment_solvers_and_set_blood(
    db: AsyncSession, challenge: Challenge, user: User
) -> Challenge:
    if challenge.solvers_count == 0:
        challenge.first_blood_user_id = user.id
    challenge.solvers_count += 1
    db.add(challenge)
    await db.flush()
    await db.refresh(challenge)
    return challenge


async def get_challenge_solvers(
    db: AsyncSession, challenge_id: uuid.UUID
) -> List[dict]:
    stmt = (
        select(Submission, User)
        .join(User, User.id == Submission.user_id)
        .where(
            Submission.challenge_id == challenge_id,
            Submission.is_correct == True,  # noqa: E712
        )
        .order_by(Submission.submitted_at.asc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [
        {
            "user_id": row.User.id,
            "username": row.User.username,
            "solved_at": row.Submission.submitted_at,
        }
        for row in rows
    ]


async def create_challenge(db: AsyncSession, data, author_id=None) -> Challenge:
    from app.schemas.challenge import ChallengeCreateRequest  # noqa: F401
    challenge = Challenge(
        title=data.title,
        description=data.description,
        long_description=data.long_description,
        category=data.category,
        difficulty=data.difficulty,
        points=data.points,
        flag_hash=hash_flag(data.flag),
        attachment_url=data.attachment_url,
        max_attempts=data.max_attempts,
        is_active=data.is_active,
        is_featured=data.is_featured,
        author_id=author_id,
    )
    db.add(challenge)
    await db.flush()
    await db.refresh(challenge)
    return challenge


async def update_challenge(db: AsyncSession, challenge: Challenge, data) -> Challenge:
    if data.title is not None:
        challenge.title = data.title
    if data.description is not None:
        challenge.description = data.description
    if data.long_description is not None:
        challenge.long_description = data.long_description
    if data.category is not None:
        challenge.category = data.category
    if data.difficulty is not None:
        challenge.difficulty = data.difficulty
    if data.points is not None:
        challenge.points = data.points
    if data.flag is not None:
        challenge.flag_hash = hash_flag(data.flag)
    if data.attachment_url is not None:
        challenge.attachment_url = data.attachment_url
    if data.max_attempts is not None:
        challenge.max_attempts = data.max_attempts
    if data.is_active is not None:
        challenge.is_active = data.is_active
    if data.is_featured is not None:
        challenge.is_featured = data.is_featured
    db.add(challenge)
    await db.flush()
    await db.refresh(challenge)
    return challenge


async def delete_challenge(db: AsyncSession, challenge: Challenge) -> None:
    await db.delete(challenge)
    await db.flush()


async def get_all_challenges_admin(db: AsyncSession) -> list[Challenge]:
    result = await db.execute(
        select(Challenge).order_by(Challenge.created_at.desc())
    )
    return list(result.scalars().all())
