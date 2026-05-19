import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EventOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    starts_at: datetime
    ends_at: datetime
    is_active: bool
    max_teams: Optional[int]
    registered_teams_count: int

    model_config = {"from_attributes": True}


class EventRegisterRequest(BaseModel):
    team_id: uuid.UUID
