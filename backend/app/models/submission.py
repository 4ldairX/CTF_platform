import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    submitted_flag_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA256
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="submissions")  # noqa: F821
    challenge: Mapped["Challenge"] = relationship(  # noqa: F821
        "Challenge", back_populates="submissions"
    )
    team: Mapped["Team | None"] = relationship(  # noqa: F821
        "Team", foreign_keys=[team_id], lazy="select"
    )

    __table_args__ = (
        Index("ix_submissions_user_challenge", "user_id", "challenge_id"),
        Index("ix_submissions_user_id", "user_id"),
        Index("ix_submissions_challenge_id", "challenge_id"),
    )
