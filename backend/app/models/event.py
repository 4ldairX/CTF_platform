import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Status values stored as String columns to avoid PG enum migration issues.
class EventStatusEnum(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    active = "active"
    paused = "paused"
    ended = "ended"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    banner_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_teams: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=EventStatusEnum.draft.value,
        server_default=EventStatusEnum.draft.value,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    registrations: Mapped[list["EventRegistration"]] = relationship(
        "EventRegistration",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    event_challenges: Mapped[list["EventChallenge"]] = relationship(
        "EventChallenge",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    rules: Mapped[list["EventRule"]] = relationship(
        "EventRule",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    tickets: Mapped[list["EventTicket"]] = relationship(
        "EventTicket",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    announcements: Mapped[list["EventAnnouncement"]] = relationship(
        "EventAnnouncement",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    rewards: Mapped[list["EventReward"]] = relationship(
        "EventReward",
        back_populates="event",
        lazy="select",
        cascade="all, delete-orphan",
    )
    created_by: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[created_by_id], lazy="select"
    )


class RegistrationStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=RegistrationStatusEnum.pending.value,
        server_default=RegistrationStatusEnum.pending.value,
    )
    validated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    validated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="registrations")
    team: Mapped["Team"] = relationship("Team", back_populates="event_registrations")  # noqa: F821
    validated_by: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[validated_by_id], lazy="select"
    )

    __table_args__ = (
        UniqueConstraint("event_id", "team_id", name="uq_event_registration"),
    )


class EventChallenge(Base):
    """Association between an event and its challenges."""

    __tablename__ = "event_challenges"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    assigned_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    event: Mapped["Event"] = relationship("Event", back_populates="event_challenges")
    challenge: Mapped["Challenge"] = relationship(  # noqa: F821
        "Challenge", back_populates="event_challenges"
    )

    __table_args__ = (
        UniqueConstraint("event_id", "challenge_id", name="uq_event_challenge"),
    )


class EventRule(Base):
    """Rules configured per event (configurar reglas — admin only)."""

    __tablename__ = "event_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    key: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="rules")

    __table_args__ = (
        UniqueConstraint("event_id", "key", name="uq_event_rule_key"),
    )


class TicketStatusEnum(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class TicketCategoryEnum(str, enum.Enum):
    technical = "technical"
    challenge = "challenge"
    dispute = "dispute"
    other = "other"


class EventTicket(Base):
    """Tickets sent by competitors during an event (enviar/gestionar tickets)."""

    __tablename__ = "event_tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[str] = mapped_column(
        String(20), nullable=False, default=TicketCategoryEnum.other.value,
        server_default=TicketCategoryEnum.other.value,
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=TicketStatusEnum.open.value,
        server_default=TicketStatusEnum.open.value,
    )
    response: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="tickets")
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[user_id], lazy="select"
    )
    assigned_to: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[assigned_to_id], lazy="select"
    )


class EventAnnouncement(Base):
    """Announcements published during an event (publicar anuncios — extend)."""

    __tablename__ = "event_announcements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="announcements")
    author: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[author_id], lazy="select"
    )


class RewardKindEnum(str, enum.Enum):
    first_place = "first_place"
    second_place = "second_place"
    third_place = "third_place"
    honorable = "honorable"
    special = "special"


class EventReward(Base):
    """Rewards granted to teams/users at the end of an event (otorgar recompensas)."""

    __tablename__ = "event_rewards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    kind: Mapped[str] = mapped_column(
        String(20), nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    points_bonus: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    granted_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    event: Mapped["Event"] = relationship("Event", back_populates="rewards")
    team: Mapped["Team | None"] = relationship(  # noqa: F821
        "Team", foreign_keys=[team_id], lazy="select"
    )
    user: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[user_id], lazy="select"
    )
    granted_by: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[granted_by_id], lazy="select"
    )
