import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.challenge import CategoryEnum, DifficultyEnum


class HintOut(BaseModel):
    id: uuid.UUID
    cost: int
    text: Optional[str] = None  # None if not yet revealed
    revealed: bool

    model_config = {"from_attributes": True}


class ChallengeOut(BaseModel):
    id: uuid.UUID
    title: str
    category: CategoryEnum
    difficulty: DifficultyEnum
    points: int
    description: str
    solvers_count: int
    is_featured: bool

    model_config = {"from_attributes": True}


class ChallengeDetailOut(ChallengeOut):
    long_description: str
    hints: List[HintOut] = []
    first_blood_username: Optional[str] = None
    attachment_url: Optional[str] = None

    model_config = {"from_attributes": True}


class FlagSubmitRequest(BaseModel):
    flag: str


class FlagSubmitResponse(BaseModel):
    correct: bool
    message: str
    points_earned: int


class SolverOut(BaseModel):
    user_id: uuid.UUID
    username: str
    solved_at: datetime

    model_config = {"from_attributes": True}


class ChallengeCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str
    long_description: str = ""
    category: CategoryEnum
    difficulty: DifficultyEnum
    points: int = Field(default=100, ge=0)
    flag: str = Field(..., min_length=1)  # plaintext, will be hashed
    attachment_url: Optional[str] = None
    max_attempts: Optional[int] = None
    is_active: bool = True
    is_featured: bool = False


class ChallengeUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[CategoryEnum] = None
    difficulty: Optional[DifficultyEnum] = None
    points: Optional[int] = None
    flag: Optional[str] = None  # plaintext, will be hashed if provided
    attachment_url: Optional[str] = None
    max_attempts: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ChallengeAdminOut(BaseModel):
    id: uuid.UUID
    title: str
    category: CategoryEnum
    difficulty: DifficultyEnum
    points: int
    description: str
    long_description: str
    is_active: bool
    is_featured: bool
    solvers_count: int
    attachment_url: Optional[str]
    max_attempts: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
