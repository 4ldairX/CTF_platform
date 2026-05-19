from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_temp_token,
    decode_token,
    generate_mfa_secret,
    get_mfa_uri,
    verify_mfa_code,
    verify_password,
)
from app.crud.user import (
    create_user,
    enable_mfa,
    get_user_by_email,
    get_user_by_id,
    get_user_by_username,
    set_mfa_secret,
)
from app.db.session import get_db
from app.models.user import User
from app.models.user import UserRoleEnum
from app.schemas.auth import (
    LoginRequest,
    MFAForceSetupRequest,
    MFARequiredResponse,
    MFASetupChallengeRequest,
    MFASetupRequiredResponse,
    MFASetupResponse,
    MFAValidateRequest,
    MFAVerifyRequest,
    ProfileUpdateRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)


PRIVILEGED_ROLES = {UserRoleEnum.admin, UserRoleEnum.moderator}

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_token_response(user: User) -> TokenResponse:
    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check uniqueness
    existing_email = await get_user_by_email(db, data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    existing_username = await get_user_by_username(db, data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    user = await create_user(db, data)
    return _build_token_response(user)


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    if user.mfa_enabled:
        temp_token = create_temp_token({"sub": str(user.id)})
        return MFARequiredResponse(mfa_required=True, temp_token=temp_token)

    # Privileged roles must enable MFA before they can complete login.
    if user.role in PRIVILEGED_ROLES:
        temp_token = create_temp_token({"sub": str(user.id), "purpose": "mfa_setup"})
        return MFASetupRequiredResponse(
            mfa_setup_required=True,
            temp_token=temp_token,
            role=user.role,
        )

    return _build_token_response(user)


@router.post("/mfa/setup", response_model=MFASetupResponse)
async def mfa_setup(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled",
        )
    secret = generate_mfa_secret()
    await set_mfa_secret(db, current_user, secret)
    uri = get_mfa_uri(secret, current_user.email, settings.MFA_ISSUER)
    return MFASetupResponse(secret=secret, uri=uri, qr_data_url=uri)


@router.post("/mfa/verify", response_model=TokenResponse)
async def mfa_verify(
    data: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm TOTP code and enable MFA for the authenticated user."""
    if current_user.mfa_secret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup not initiated. Call /auth/mfa/setup first.",
        )
    if not verify_mfa_code(current_user.mfa_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code",
        )
    await enable_mfa(db, current_user)
    return _build_token_response(current_user)


@router.post("/mfa/force-setup/start", response_model=MFASetupResponse)
async def mfa_force_setup_start(
    data: MFASetupChallengeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate a TOTP secret using a temp token (no Bearer auth required).

    Only valid when the temp_token was issued with purpose=mfa_setup
    (i.e. a privileged role logged in without MFA).
    """
    import uuid

    try:
        payload = decode_token(data.temp_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired temporary token",
        )
    if payload.get("type") != "mfa_temp" or payload.get("purpose") != "mfa_setup":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        uid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_id(db, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.role not in PRIVILEGED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forced setup only available for privileged roles",
        )
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA already enabled — use /auth/login then /auth/mfa/validate",
        )

    secret = generate_mfa_secret()
    await set_mfa_secret(db, user, secret)
    uri = get_mfa_uri(secret, user.email, settings.MFA_ISSUER)
    return MFASetupResponse(secret=secret, uri=uri, qr_data_url=uri)


@router.post("/mfa/force-setup/confirm", response_model=TokenResponse)
async def mfa_force_setup_confirm(
    data: MFAForceSetupRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify the TOTP code and enable MFA for the privileged user."""
    import uuid

    try:
        payload = decode_token(data.temp_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired temporary token",
        )
    if payload.get("type") != "mfa_temp" or payload.get("purpose") != "mfa_setup":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    try:
        uid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_id(db, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.role not in PRIVILEGED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forced setup only available for privileged roles",
        )
    if user.mfa_secret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call /auth/mfa/force-setup/start first",
        )
    if not verify_mfa_code(user.mfa_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code",
        )
    await enable_mfa(db, user)
    return _build_token_response(user)


@router.post("/mfa/validate", response_model=TokenResponse)
async def mfa_validate(data: MFAValidateRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a temp_token + TOTP code for full access/refresh tokens."""
    try:
        payload = decode_token(data.temp_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired temporary token",
        )
    if payload.get("type") != "mfa_temp":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    import uuid

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        uid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_id(db, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="MFA not configured"
        )
    if not verify_mfa_code(user.mfa_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid TOTP code"
        )
    return _build_token_response(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(data.refresh_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
        )

    import uuid

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        uid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_user_by_id(db, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access = create_access_token({"sub": str(user.id)})
    new_refresh = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.display_name is not None:
        current_user.display_name = data.display_name.strip() or None
    if data.bio is not None:
        current_user.bio = data.bio.strip() or None
    if data.country is not None:
        current_user.country = data.country.strip() or None
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url.strip() or None

    await db.flush()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.get("/me/submissions")
async def get_my_submissions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from app.models.submission import Submission

    limit = max(1, min(limit, 200))
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.challenge))
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.submitted_at.desc())
        .limit(limit)
    )
    submissions = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "challenge_id": str(s.challenge_id),
            "challenge_title": s.challenge.title,
            "challenge_category": s.challenge.category.value,
            "challenge_points": s.challenge.points,
            "is_correct": s.is_correct,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in submissions
    ]


@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import func, select

    from app.models.submission import Submission

    total_submissions = await db.scalar(
        select(func.count(Submission.id)).where(Submission.user_id == current_user.id)
    )
    correct_submissions = await db.scalar(
        select(func.count(Submission.id)).where(
            Submission.user_id == current_user.id,
            Submission.is_correct == True,  # noqa: E712
        )
    )
    wrong_submissions = (total_submissions or 0) - (correct_submissions or 0)

    return {
        "total_submissions": total_submissions or 0,
        "correct_submissions": correct_submissions or 0,
        "wrong_submissions": wrong_submissions,
        "points": current_user.points,
        "accuracy": round(
            (correct_submissions or 0) / total_submissions * 100, 2
        )
        if total_submissions
        else 0.0,
    }
