"""Pydantic schemas for Módulo 10 — Eventos CTF v2."""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.event import (
    EventStatusEnum,
    RegistrationStatusEnum,
    RewardKindEnum,
    TicketCategoryEnum,
    TicketStatusEnum,
)


# ---------------------------------------------------------------------------
# Event CRUD (Admin)
# ---------------------------------------------------------------------------


class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: str = Field(..., min_length=3, max_length=280)
    description: str = ""
    banner_url: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    max_teams: Optional[int] = None
    is_public: bool = True


class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    max_teams: Optional[int] = None
    is_public: Optional[bool] = None


class EventAdminOut(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: str
    banner_url: Optional[str]
    starts_at: datetime
    ends_at: datetime
    is_active: bool
    is_public: bool
    max_teams: Optional[int]
    status: EventStatusEnum
    created_at: datetime
    updated_at: datetime
    registered_teams_count: int = 0
    challenges_count: int = 0


# ---------------------------------------------------------------------------
# Reglas (Admin)
# ---------------------------------------------------------------------------


class EventRuleIn(BaseModel):
    key: str = Field(..., min_length=1, max_length=64)
    value: str


class EventRuleOut(BaseModel):
    id: uuid.UUID
    key: str
    value: str
    created_at: datetime


class EventRulesUpdateRequest(BaseModel):
    """Bulk replace all rules for an event."""
    rules: List[EventRuleIn]


# ---------------------------------------------------------------------------
# Control evento (Admin / Moderador)
# ---------------------------------------------------------------------------


class EventControlRequest(BaseModel):
    """Change event status (start, pause, end)."""
    action: str  # "start" | "pause" | "resume" | "end" | "schedule"


# ---------------------------------------------------------------------------
# Recompensas (Admin) — include notificar_ganador
# ---------------------------------------------------------------------------


class RewardCreateRequest(BaseModel):
    team_id: Optional[uuid.UUID] = None
    user_id: Optional[uuid.UUID] = None
    kind: RewardKindEnum
    title: str = Field(..., max_length=255)
    description: str = ""
    points_bonus: int = 0


class RewardOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    team_id: Optional[uuid.UUID]
    team_name: Optional[str] = None
    user_id: Optional[uuid.UUID]
    username: Optional[str] = None
    kind: RewardKindEnum
    title: str
    description: str
    points_bonus: int
    notified: bool
    notified_at: Optional[datetime]
    created_at: datetime


# ---------------------------------------------------------------------------
# Anuncios (Moderador — extend del control evento)
# ---------------------------------------------------------------------------


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    body: str
    pinned: bool = False


class AnnouncementOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    author_username: Optional[str] = None
    title: str
    body: str
    pinned: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Inscripciones (Moderador)
# ---------------------------------------------------------------------------


class RegistrationOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    team_id: uuid.UUID
    team_name: str
    status: RegistrationStatusEnum
    rejection_reason: Optional[str]
    registered_at: datetime
    validated_at: Optional[datetime]
    validated_by_username: Optional[str] = None


class RegistrationValidateRequest(BaseModel):
    """Approve or reject a registration."""
    approve: bool
    rejection_reason: Optional[str] = None


# ---------------------------------------------------------------------------
# Tickets (Competidor enviar / Moderador gestionar)
# ---------------------------------------------------------------------------


class TicketCreateRequest(BaseModel):
    subject: str = Field(..., max_length=255)
    body: str
    category: TicketCategoryEnum = TicketCategoryEnum.other


class TicketUpdateRequest(BaseModel):
    status: Optional[TicketStatusEnum] = None
    response: Optional[str] = None
    assigned_to_id: Optional[uuid.UUID] = None


class TicketOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    user_id: uuid.UUID
    username: str
    subject: str
    body: str
    category: TicketCategoryEnum
    status: TicketStatusEnum
    response: Optional[str]
    assigned_to_username: Optional[str] = None
    resolved_at: Optional[datetime]
    created_at: datetime


# ---------------------------------------------------------------------------
# Asignar retos (Moderador)
# ---------------------------------------------------------------------------


class ChallengeAssignRequest(BaseModel):
    challenge_id: uuid.UUID
    order: int = 0


class EventChallengeOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    title: str
    category: str
    difficulty: str
    points: int
    order: int


# ---------------------------------------------------------------------------
# Scoreboard (Moderador)
# ---------------------------------------------------------------------------


class ScoreboardEntry(BaseModel):
    team_id: uuid.UUID
    team_name: str
    points: int
    solves: int
    rank: int


class ScoreboardOut(BaseModel):
    event_id: uuid.UUID
    entries: List[ScoreboardEntry]
    generated_at: datetime
