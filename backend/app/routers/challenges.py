import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_competitor
from app.core.security import hash_flag, verify_flag
from app.crud.challenge import (
    create_submission,
    get_challenge_by_id,
    get_challenge_solvers,
    get_challenges,
    get_existing_correct_submission,
    get_hint_by_id,
    get_revealed_hint_ids,
    has_revealed_hint,
    increment_solvers_and_set_blood,
    reveal_hint,
)
from app.crud.user import add_points
from app.db.session import get_db
from app.models.challenge import CategoryEnum, DifficultyEnum
from app.models.user import User
from app.schemas.challenge import (
    ChallengeDetailOut,
    ChallengeOut,
    FlagSubmitRequest,
    FlagSubmitResponse,
    HintOut,
    SolverOut,
)

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("/", response_model=List[ChallengeOut])
async def list_challenges(
    category: Optional[CategoryEnum] = Query(default=None),
    difficulty: Optional[DifficultyEnum] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    challenges = await get_challenges(db, category=category, difficulty=difficulty)
    return [ChallengeOut.model_validate(c) for c in challenges]


@router.get("/{challenge_id}", response_model=ChallengeDetailOut)
async def get_challenge(
    challenge_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge = await get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    revealed_ids = await get_revealed_hint_ids(db, current_user.id, challenge_id)
    hints_out = [
        HintOut(
            id=hint.id,
            cost=hint.cost,
            text=hint.text if hint.id in revealed_ids else None,
            revealed=hint.id in revealed_ids,
        )
        for hint in challenge.hints
    ]

    first_blood_username = (
        challenge.first_blood_user.username if challenge.first_blood_user else None
    )

    return ChallengeDetailOut(
        id=challenge.id,
        title=challenge.title,
        category=challenge.category,
        difficulty=challenge.difficulty,
        points=challenge.points,
        description=challenge.description,
        long_description=challenge.long_description,
        solvers_count=challenge.solvers_count,
        is_featured=challenge.is_featured,
        hints=hints_out,
        first_blood_username=first_blood_username,
        attachment_url=challenge.attachment_url,
    )


@router.post("/{challenge_id}/submit", response_model=FlagSubmitResponse)
async def submit_flag(
    challenge_id: uuid.UUID,
    data: FlagSubmitRequest,
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    challenge = await get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    # Check if user already solved this challenge
    existing_correct = await get_existing_correct_submission(db, current_user.id, challenge_id)
    if existing_correct:
        return FlagSubmitResponse(
            correct=True,
            message="You have already solved this challenge!",
            points_earned=0,
        )

    is_correct = verify_flag(data.flag, challenge.flag_hash)
    await create_submission(
        db,
        user_id=current_user.id,
        challenge_id=challenge_id,
        submitted_flag=data.flag,
        is_correct=is_correct,
    )

    if is_correct:
        await increment_solvers_and_set_blood(db, challenge, current_user)
        await add_points(db, current_user, challenge.points)
        return FlagSubmitResponse(
            correct=True,
            message="Correct flag! Well done!",
            points_earned=challenge.points,
        )
    else:
        return FlagSubmitResponse(
            correct=False,
            message="Incorrect flag. Keep trying!",
            points_earned=0,
        )


@router.post("/{challenge_id}/hints/{hint_id}", response_model=HintOut)
async def reveal_challenge_hint(
    challenge_id: uuid.UUID,
    hint_id: uuid.UUID,
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    challenge = await get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    hint = await get_hint_by_id(db, hint_id)
    if not hint or hint.challenge_id != challenge_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hint not found")

    already_revealed = await has_revealed_hint(db, current_user.id, hint_id)

    if not already_revealed:
        if hint.cost > 0:
            if current_user.points < hint.cost:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient points. This hint costs {hint.cost} points.",
                )
            # Deduct points
            current_user.points -= hint.cost
            db.add(current_user)
            await db.flush()

        await reveal_hint(db, current_user.id, hint_id)

    return HintOut(id=hint.id, cost=hint.cost, text=hint.text, revealed=True)


@router.get("/{challenge_id}/solvers", response_model=List[SolverOut])
async def get_solvers(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    from app.crud.challenge import get_challenge_by_id as _get

    challenge = await _get(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    solvers = await get_challenge_solvers(db, challenge_id)
    return [SolverOut(**s) for s in solvers]
