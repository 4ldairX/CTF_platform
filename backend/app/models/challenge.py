import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CategoryEnum(str, enum.Enum):
    web = "web"
    pwn = "pwn"
    crypto = "crypto"
    forensics = "forensics"
    reverse = "reverse"
    misc = "misc"
    osint = "osint"


class DifficultyEnum(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    insane = "insane"


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    long_description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[CategoryEnum] = mapped_column(
        Enum(CategoryEnum, name="category"), nullable=False
    )
    difficulty: Mapped[DifficultyEnum] = mapped_column(
        Enum(DifficultyEnum, name="difficulty"), nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    flag_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA256 hex
    attachment_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    max_attempts: Mapped[int | None] = mapped_column(Integer, nullable=True)  # None = unlimited
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    solvers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    first_blood_user_id: Mapped[uuid.UUID | None] = mapped_column(
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

    submissions: Mapped[list["Submission"]] = relationship(  # noqa: F821
        "Submission", back_populates="challenge", lazy="select"
    )
    hints: Mapped[list["Hint"]] = relationship(
        "Hint",
        back_populates="challenge",
        lazy="select",
        cascade="all, delete-orphan",
        order_by="Hint.order",
    )
    author: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[author_id], lazy="select"
    )
    first_blood_user: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[first_blood_user_id], lazy="select"
    )
    event_challenges: Mapped[list["EventChallenge"]] = relationship(  # noqa: F821
        "EventChallenge", back_populates="challenge", lazy="select"
    )


class Hint(Base):
    __tablename__ = "hints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    cost: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="hints")
    reveals: Mapped[list["ChallengeHintReveal"]] = relationship(
        "ChallengeHintReveal",
        back_populates="hint",
        lazy="select",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("challenge_id", "order", name="uq_hint_challenge_order"),
    )


class ChallengeHintReveal(Base):
    __tablename__ = "challenge_hint_reveals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hint_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hints.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    revealed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    hint: Mapped["Hint"] = relationship("Hint", back_populates="reveals")
    user: Mapped["User"] = relationship("User", back_populates="hint_reveals")  # noqa: F821

    __table_args__ = (
        UniqueConstraint("hint_id", "user_id", name="uq_hint_reveal_user"),
    )
