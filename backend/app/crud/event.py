import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.event import Event, EventRegistration
from app.models.team import Team


async def get_events(db: AsyncSession) -> List[Event]:
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.registrations))
        .order_by(Event.starts_at.desc())
    )
    return list(result.scalars().all())


async def get_event_by_id(db: AsyncSession, event_id: uuid.UUID) -> Optional[Event]:
    result = await db.execute(
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.registrations))
    )
    return result.scalar_one_or_none()


async def get_registration(
    db: AsyncSession, event_id: uuid.UUID, team_id: uuid.UUID
) -> Optional[EventRegistration]:
    result = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.team_id == team_id,
        )
    )
    return result.scalar_one_or_none()


async def register_team(
    db: AsyncSession, event_id: uuid.UUID, team_id: uuid.UUID
) -> EventRegistration:
    registration = EventRegistration(event_id=event_id, team_id=team_id)
    db.add(registration)
    await db.flush()
    await db.refresh(registration)
    return registration
