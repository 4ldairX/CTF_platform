"""Módulo 9 — Asistencia IA v2.

Modelos para:
- AIPrompt: prompts del sistema (gestionar prompts - admin)
- AISettings: configuración global (limitar consultas, configurar API - admin)
- AIDocument: documentos indexados para RAG (indexar/subir documentos)
- AIConversation + AIMessage: historial de conversaciones del competidor
- AIConsumption: log de consumo (monitorear consumo)
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer, String, Text, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AIPromptKindEnum(str, enum.Enum):
    """The role/purpose of each system prompt."""
    base = "base"
    explain_concept = "explain_concept"
    recommend_challenge = "recommend_challenge"
    generate_feedback = "generate_feedback"


class AIQueryModeEnum(str, enum.Enum):
    """Mode used by the competitor when calling /ai/ask (<<extend>>)."""
    chat = "chat"
    explain_concept = "explain_concept"
    recommend_challenge = "recommend_challenge"
    generate_feedback = "generate_feedback"


class AIPrompt(Base):
    """System prompts managed by admin (gestionar prompts)."""

    __tablename__ = "ai_prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    kind: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    updated_by: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[updated_by_id], lazy="select"
    )


class AISettings(Base):
    """Singleton-style table holding the AI runtime configuration.

    Includes the rate limit (limitar consultas), the API config
    (configurar API + probar conexión) and the connection check result.
    """

    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    # API config (configurar API)
    provider: Mapped[str] = mapped_column(String(40), nullable=False, default="anthropic")
    model: Mapped[str] = mapped_column(String(120), nullable=False, default="claude-haiku-4-5")
    api_base_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    api_key_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=800)
    temperature_x100: Mapped[int] = mapped_column(Integer, nullable=False, default=70)  # 0.70

    # Limit (limitar consultas)
    daily_quota_per_user: Mapped[int] = mapped_column(Integer, nullable=False, default=20)

    # Probar conexión (<<include>> al guardar configuración)
    last_connection_ok: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_connection_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_connection_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class AIDocument(Base):
    """Documents indexed for RAG (indexar/subir documentos)."""

    __tablename__ = "ai_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    source_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    indexed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    indexed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    uploaded_by: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[uploaded_by_id], lazy="select"
    )


class AIConversation(Base):
    """A conversation between a competitor and the assistant (ver consultas)."""

    __tablename__ = "ai_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Consulta")
    mode: Mapped[str] = mapped_column(String(40), nullable=False, default="chat")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[user_id], lazy="select"
    )
    messages: Mapped[list["AIMessage"]] = relationship(
        "AIMessage",
        back_populates="conversation",
        lazy="select",
        cascade="all, delete-orphan",
        order_by="AIMessage.created_at",
    )


class AIMessage(Base):
    """A single message inside an AIConversation (user or assistant)."""

    __tablename__ = "ai_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" | "assistant"
    mode: Mapped[str | None] = mapped_column(String(40), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_in: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    conversation: Mapped["AIConversation"] = relationship(
        "AIConversation", back_populates="messages"
    )


class AIConsumption(Base):
    """One row per ask request — used to monitor consumption and enforce limits."""

    __tablename__ = "ai_consumption"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="SET NULL"), nullable=True
    )
    mode: Mapped[str] = mapped_column(String(40), nullable=False, default="chat")
    tokens_in: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[user_id], lazy="select"
    )
