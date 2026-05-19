"""Pydantic schemas — Módulo 9 Asistencia IA v2."""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.ai import AIPromptKindEnum, AIQueryModeEnum


# ---------------------------------------------------------------------------
# Prompts (Admin)
# ---------------------------------------------------------------------------


class PromptIn(BaseModel):
    kind: AIPromptKindEnum
    content: str = Field(..., min_length=10)


class PromptOut(BaseModel):
    id: uuid.UUID
    kind: AIPromptKindEnum
    content: str
    updated_at: datetime
    updated_by_username: Optional[str] = None


# ---------------------------------------------------------------------------
# Settings: límite + config API (Admin)
# ---------------------------------------------------------------------------


class AILimitsRequest(BaseModel):
    daily_quota_per_user: int = Field(..., ge=0, le=10000)


class AIConfigRequest(BaseModel):
    """Used in PUT /ai/config — must always trigger probar_conexion (<<include>>)."""
    provider: str = Field(..., min_length=2, max_length=40)
    model: str = Field(..., min_length=2, max_length=120)
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None  # only sent when rotating
    max_tokens: int = Field(..., ge=64, le=8192)
    temperature_x100: int = Field(..., ge=0, le=200)


class AISettingsOut(BaseModel):
    provider: str
    model: str
    api_base_url: Optional[str]
    api_key_set: bool
    max_tokens: int
    temperature_x100: int
    daily_quota_per_user: int
    last_connection_ok: bool
    last_connection_at: Optional[datetime]
    last_connection_message: Optional[str]
    updated_at: datetime


# ---------------------------------------------------------------------------
# Documents (Admin + Instructor)
# ---------------------------------------------------------------------------


class DocumentUploadRequest(BaseModel):
    title: str = Field(..., max_length=255)
    description: str = ""
    source_url: Optional[str] = None
    content: str = Field(..., min_length=20)


class DocumentOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    source_url: Optional[str]
    indexed: bool
    indexed_at: Optional[datetime]
    uploaded_by_username: Optional[str]
    created_at: datetime
    content_preview: Optional[str] = None  # first 200 chars


# ---------------------------------------------------------------------------
# Ask (Competidor)
# ---------------------------------------------------------------------------


class AskRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    mode: AIQueryModeEnum = AIQueryModeEnum.chat
    conversation_id: Optional[uuid.UUID] = None


class AskResponse(BaseModel):
    conversation_id: uuid.UUID
    message_id: uuid.UUID
    answer: str
    mode: AIQueryModeEnum
    quota_used_today: int
    quota_limit: int


# ---------------------------------------------------------------------------
# Conversations / Messages (Competidor "Ver consultas")
# ---------------------------------------------------------------------------


class MessageOut(BaseModel):
    id: uuid.UUID
    role: str
    mode: Optional[str]
    content: str
    created_at: datetime


class ConversationListOut(BaseModel):
    id: uuid.UUID
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class ConversationDetailOut(BaseModel):
    id: uuid.UUID
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut]


# ---------------------------------------------------------------------------
# Consumption monitoring (Admin)
# ---------------------------------------------------------------------------


class ConsumptionSummaryOut(BaseModel):
    total_requests: int
    total_tokens_in: int
    total_tokens_out: int
    requests_today: int
    active_users_today: int
    top_users: List[dict]


# ---------------------------------------------------------------------------
# History (Admin + Instructor)
# ---------------------------------------------------------------------------


class HistoryEntryOut(BaseModel):
    conversation_id: uuid.UUID
    username: str
    title: str
    mode: str
    message_count: int
    updated_at: datetime
