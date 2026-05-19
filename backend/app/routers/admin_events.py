"""Módulo 10 — Eventos CTF v2: endpoints reservados al Administrador.

Casos de uso (Admin):
- Crear evento
- Configurar reglas
- Controlar evento (start / pause / resume / end / schedule)
- Otorgar recompensas  <<include>>  Notificar ganador  (ejecutado automáticamente en la misma transacción)
"""

import re
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import require_admin
from app.db.session import get_db
from app.models.event import (
    Event,
    EventAnnouncement,
    EventReward,
    EventRule,
    EventStatusEnum,
    RewardKindEnum,
)
from app.models.team import Team
from app.models.user import User
from app.schemas.event_extras import (
    EventAdminOut,
    EventControlRequest,
    EventCreateRequest,
    EventRuleOut,
    EventRulesUpdateRequest,
    EventUpdateRequest,
    RewardCreateRequest,
    RewardOut,
)

router = APIRouter(prefix="/admin/events", tags=["admin-events"])


_VALID_TRANSITIONS = {
    "schedule": (
        {EventStatusEnum.draft.value},
        EventStatusEnum.scheduled.value,
    ),
    "start": (
        {EventStatusEnum.draft.value, EventStatusEnum.scheduled.value, EventStatusEnum.paused.value},
        EventStatusEnum.active.value,
    ),
    "pause": (
        {EventStatusEnum.active.value},
        EventStatusEnum.paused.value,
    ),
    "resume": (
        {EventStatusEnum.paused.value},
        EventStatusEnum.active.value,
    ),
    "end": (
        {EventStatusEnum.active.value, EventStatusEnum.paused.value},
        EventStatusEnum.ended.value,
    ),
}


async def _event_or_404(db: AsyncSession, event_id: uuid.UUID) -> Event:
    result = await db.execute(
        select(Event)
        .options(
            selectinload(Event.registrations),
            selectinload(Event.event_challenges),
        )
        .where(Event.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def _slugify(text: str) -> str:
    base = re.sub(r"[^a-z0-9-]+", "-", text.lower()).strip("-")
    return base[:280] or "event"


def _event_admin_out(event: Event) -> EventAdminOut:
    return EventAdminOut(
        id=event.id,
        title=event.title,
        slug=event.slug,
        description=event.description,
        banner_url=event.banner_url,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
        is_active=event.is_active,
        is_public=event.is_public,
        max_teams=event.max_teams,
        status=EventStatusEnum(event.status),
        created_at=event.created_at,
        updated_at=event.updated_at,
        registered_teams_count=len(event.registrations) if event.registrations else 0,
        challenges_count=len(event.event_challenges) if event.event_challenges else 0,
    )


# ---------------------------------------------------------------------------
# CRUD: Crear evento, listar, actualizar, eliminar
# ---------------------------------------------------------------------------


@router.get("/", response_model=List[EventAdminOut])
async def list_events_admin(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Event)
        .options(
            selectinload(Event.registrations),
            selectinload(Event.event_challenges),
        )
        .order_by(Event.created_at.desc())
    )
    events = result.scalars().all()
    return [_event_admin_out(e) for e in events]


@router.post("/", response_model=EventAdminOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if data.starts_at >= data.ends_at:
        raise HTTPException(
            status_code=400, detail="starts_at must be before ends_at"
        )
    slug = _slugify(data.slug or data.title)
    existing = await db.execute(select(Event).where(Event.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slug already in use")

    event = Event(
        title=data.title,
        slug=slug,
        description=data.description,
        banner_url=data.banner_url,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        max_teams=data.max_teams,
        is_public=data.is_public,
        is_active=True,
        status=EventStatusEnum.draft.value,
        created_by_id=admin.id,
    )
    db.add(event)
    await db.flush()
    return await _refresh(db, event.id)


@router.get("/{event_id}", response_model=EventAdminOut)
async def get_event_admin(
    event_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return _event_admin_out(await _event_or_404(db, event_id))


@router.put("/{event_id}", response_model=EventAdminOut)
async def update_event(
    event_id: uuid.UUID,
    data: EventUpdateRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    event = await _event_or_404(db, event_id)
    if data.title is not None:
        event.title = data.title
    if data.description is not None:
        event.description = data.description
    if data.banner_url is not None:
        event.banner_url = data.banner_url
    if data.starts_at is not None:
        event.starts_at = data.starts_at
    if data.ends_at is not None:
        event.ends_at = data.ends_at
    if data.max_teams is not None:
        event.max_teams = data.max_teams
    if data.is_public is not None:
        event.is_public = data.is_public
    if event.starts_at >= event.ends_at:
        raise HTTPException(
            status_code=400, detail="starts_at must be before ends_at"
        )
    await db.flush()
    return await _refresh(db, event.id)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    event = await _event_or_404(db, event_id)
    await db.delete(event)


# ---------------------------------------------------------------------------
# Configurar reglas (Admin)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/rules", response_model=List[EventRuleOut])
async def list_rules(
    event_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventRule).where(EventRule.event_id == event_id).order_by(EventRule.key)
    )
    rules = result.scalars().all()
    return [
        EventRuleOut(id=r.id, key=r.key, value=r.value, created_at=r.created_at)
        for r in rules
    ]


@router.put("/{event_id}/rules", response_model=List[EventRuleOut])
async def configure_rules(
    event_id: uuid.UUID,
    payload: EventRulesUpdateRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    # Replace all rules in one go (idempotent)
    await db.execute(
        EventRule.__table__.delete().where(EventRule.event_id == event_id)
    )
    for rule in payload.rules:
        db.add(EventRule(event_id=event_id, key=rule.key, value=rule.value))
    await db.flush()
    result = await db.execute(
        select(EventRule).where(EventRule.event_id == event_id).order_by(EventRule.key)
    )
    return [
        EventRuleOut(id=r.id, key=r.key, value=r.value, created_at=r.created_at)
        for r in result.scalars().all()
    ]


# ---------------------------------------------------------------------------
# Controlar evento (Admin)
# ---------------------------------------------------------------------------


@router.post("/{event_id}/control", response_model=EventAdminOut)
async def control_event_admin(
    event_id: uuid.UUID,
    payload: EventControlRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    event = await _event_or_404(db, event_id)
    transition = _VALID_TRANSITIONS.get(payload.action)
    if not transition:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action. Valid: {list(_VALID_TRANSITIONS.keys())}",
        )
    allowed_from, target = transition
    if event.status not in allowed_from:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot {payload.action} from status '{event.status}'",
        )
    event.status = target
    await db.flush()
    return await _refresh(db, event.id)


# ---------------------------------------------------------------------------
# Otorgar recompensas (Admin)  <<include>>  Notificar ganador
# ---------------------------------------------------------------------------


async def _notify_winner(
    db: AsyncSession, reward: EventReward, event: Event
) -> None:
    """<<include>> rule: mark the reward as notified and credit bonus points.

    Runs INSIDE the same transaction as the reward creation, so either both
    happen or both rollback.
    """
    # 1) Mark notified
    reward.notified = True
    reward.notified_at = datetime.now(timezone.utc)

    # 2) Credit bonus points to all members of the rewarded team (or user)
    if reward.points_bonus > 0:
        if reward.team_id:
            # Apply bonus to all members of the team
            from app.models.team import TeamMembership

            members = await db.execute(
                select(User)
                .join(TeamMembership, TeamMembership.user_id == User.id)
                .where(TeamMembership.team_id == reward.team_id)
            )
            for u in members.scalars().all():
                u.points = (u.points or 0) + reward.points_bonus
        elif reward.user_id:
            user = await db.get(User, reward.user_id)
            if user:
                user.points = (user.points or 0) + reward.points_bonus


@router.get("/{event_id}/rewards", response_model=List[RewardOut])
async def list_rewards(
    event_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventReward)
        .options(selectinload(EventReward.team), selectinload(EventReward.user))
        .where(EventReward.event_id == event_id)
        .order_by(EventReward.created_at.desc())
    )
    rewards = result.scalars().all()
    return [_reward_out(r) for r in rewards]


@router.post(
    "/{event_id}/rewards",
    response_model=RewardOut,
    status_code=status.HTTP_201_CREATED,
)
async def grant_reward(
    event_id: uuid.UUID,
    data: RewardCreateRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Grant a reward and AUTOMATICALLY notify the winner in the same transaction (<<include>>)."""
    event = await _event_or_404(db, event_id)
    if not data.team_id and not data.user_id:
        raise HTTPException(
            status_code=400, detail="Must provide team_id or user_id"
        )
    if data.team_id:
        team = await db.get(Team, data.team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
    if data.user_id:
        user = await db.get(User, data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    reward = EventReward(
        event_id=event_id,
        team_id=data.team_id,
        user_id=data.user_id,
        kind=data.kind.value,
        title=data.title,
        description=data.description,
        points_bonus=data.points_bonus,
        granted_by_id=admin.id,
    )
    db.add(reward)
    await db.flush()

    # <<include>> Notificar ganador — obligatorio, en la misma transacción
    await _notify_winner(db, reward, event)
    await db.flush()

    return await _reward_out_loaded(db, reward.id)


def _reward_out(r: EventReward) -> RewardOut:
    return RewardOut(
        id=r.id,
        event_id=r.event_id,
        team_id=r.team_id,
        team_name=r.team.name if r.team else None,
        user_id=r.user_id,
        username=r.user.username if r.user else None,
        kind=RewardKindEnum(r.kind),
        title=r.title,
        description=r.description,
        points_bonus=r.points_bonus,
        notified=r.notified,
        notified_at=r.notified_at,
        created_at=r.created_at,
    )


async def _reward_out_loaded(db: AsyncSession, reward_id: uuid.UUID) -> RewardOut:
    result = await db.execute(
        select(EventReward)
        .options(selectinload(EventReward.team), selectinload(EventReward.user))
        .where(EventReward.id == reward_id)
    )
    r = result.scalar_one()
    return _reward_out(r)


async def _refresh(db: AsyncSession, event_id: uuid.UUID) -> EventAdminOut:
    result = await db.execute(
        select(Event)
        .options(
            selectinload(Event.registrations),
            selectinload(Event.event_challenges),
        )
        .where(Event.id == event_id)
    )
    return _event_admin_out(result.scalar_one())
