import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRoleEnum


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not all(c.isalnum() or c in ("_", "-") for c in v):
            raise ValueError("Username must contain only letters, numbers, underscores, or hyphens")
        return v.lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MFASetupResponse(BaseModel):
    secret: str
    uri: str
    qr_data_url: str  # Contains the provisioning URI for QR generation


class MFAVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class MFAValidateRequest(BaseModel):
    temp_token: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    country: Optional[str]
    role: UserRoleEnum
    is_active: bool
    mfa_enabled: bool
    points: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MFARequiredResponse(BaseModel):
    mfa_required: bool = True
    temp_token: str


class MFASetupRequiredResponse(BaseModel):
    """Returned when a privileged role logs in without MFA enabled."""
    mfa_setup_required: bool = True
    temp_token: str
    role: UserRoleEnum


class MFAForceSetupRequest(BaseModel):
    """Used during forced setup: temp_token + code from authenticator app."""
    temp_token: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class MFASetupChallengeRequest(BaseModel):
    """Initiates forced MFA setup using a temp token (no Bearer auth yet)."""
    temp_token: str


class UserUpdateRequest(BaseModel):
    role: Optional[UserRoleEnum] = None
    is_active: Optional[bool] = None
    display_name: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    """Self-service profile edit — users can change their own basic fields."""
    display_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    country: Optional[str] = Field(default=None, max_length=64)
    avatar_url: Optional[str] = Field(default=None, max_length=512)


class AdminUserOut(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    display_name: Optional[str]
    role: UserRoleEnum
    is_active: bool
    is_verified: bool
    mfa_enabled: bool
    points: int
    created_at: datetime

    model_config = {"from_attributes": True}
