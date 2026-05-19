import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.team import TeamMemberRoleEnum


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(default="", max_length=1000)


class MemberOut(BaseModel):
    user_id: uuid.UUID
    username: str
    role: TeamMemberRoleEnum
    points: int

    model_config = {"from_attributes": True}


class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    is_active: bool
    created_at: datetime
    member_count: int
    total_points: int

    model_config = {"from_attributes": True}


class TeamDetailOut(TeamOut):
    members: List[MemberOut] = []

    model_config = {"from_attributes": True}
