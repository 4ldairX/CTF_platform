"""Módulo 10 — Eventos CTF v2: endpoints del Moderador.

Casos de uso (Moderador):
- Controlar evento  <<extend>>  Publicar anuncios  (oferta de UI manual)
- Validar inscripción / Aprobar equipos
- Gestionar inscripciones
- Gestionar tickets
- Gestionar scoreboard
- Asignar retos
"""

import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import require_admin_or_moderator, require_moderator
from app.db.session import get_db
from app.models.challenge import Challenge
from app.models.event import (
    Event,
    EventAnnouncement,
    EventChallenge,
    EventRegistration,
    EventTicket,
    EventStatusEnum,
    RegistrationStatusEnum,
    TicketCategoryEnum,
    TicketStatusEnum,
)
from app.models.submission import Submission
from app.models.team import Team
from app.models.user import User
from app.schemas.event_extras import (
    AnnouncementCreateRequest,
    AnnouncementOut,
    ChallengeAssignRequest,
    EventAdminOut,
    EventChallengeOut,
    EventControlRequest,
    RegistrationOut,
    RegistrationValidateRequest,
    ScoreboardEntry,
    ScoreboardOut,
    TicketOut,
    TicketUpdateRequest,
)

router = APIRouter(prefix="/moderator/events", tags=["moderator-events"])


# Same transitions as admin but reduced: mod cannot put back to draft
_MOD_TRANSITIONS = {
    "start": (
        {EventStatusEnum.scheduled.value, EventStatusEnum.paused.value},
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
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


# ---------------------------------------------------------------------------
# Controlar evento (Moderador)
# ---------------------------------------------------------------------------


@router.post("/{event_id}/control")
async def control_event_moderator(
    event_id: uuid.UUID,
    payload: EventControlRequest,
    _: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    event = await _event_or_404(db, event_id)
    transition = _MOD_TRANSITIONS.get(payload.action)
    if not transition:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action. Valid: {list(_MOD_TRANSITIONS.keys())}",
        )
    allowed_from, target = transition
    if event.status not in allowed_from:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot {payload.action} from status '{event.status}'",
        )
    event.status = target
    await db.flush()
    return {"status": event.status, "action": payload.action}


# ---------------------------------------------------------------------------
# Publicar anuncios (Moderador — <<extend>> de controlar evento, opcional)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/announcements", response_model=List[AnnouncementOut])
async def list_announcements_mod(
    event_id: uuid.UUID,
    _: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventAnnouncement)
        .options(selectinload(EventAnnouncement.author))
        .where(EventAnnouncement.event_id == event_id)
        .order_by(EventAnnouncement.pinned.desc(), EventAnnouncement.created_at.desc())
    )
    return [_announcement_out(a) for a in result.scalars().all()]


@router.post(
    "/{event_id}/announcements",
    response_model=AnnouncementOut,
    status_code=status.HTTP_201_CREATED,
)
async def publish_announcement(
    event_id: uuid.UUID,
    data: AnnouncementCreateRequest,
    mod: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    """<<extend>> Manual option offered to the moderator during event control."""
    await _event_or_404(db, event_id)
    ann = EventAnnouncement(
        event_id=event_id,
        author_id=mod.id,
        title=data.title,
        body=data.body,
        pinned=data.pinned,
    )
    db.add(ann)
    await db.flush()
    result = await db.execute(
        select(EventAnnouncement)
        .options(selectinload(EventAnnouncement.author))
        .where(EventAnnouncement.id == ann.id)
    )
    return _announcement_out(result.scalar_one())


@router.delete(
    "/{event_id}/announcements/{ann_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_announcement(
    event_id: uuid.UUID,
    ann_id: uuid.UUID,
    _: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    ann = await db.get(EventAnnouncement, ann_id)
    if not ann or ann.event_id != event_id:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await db.delete(ann)


def _announcement_out(a: EventAnnouncement) -> AnnouncementOut:
    return AnnouncementOut(
        id=a.id,
        event_id=a.event_id,
        author_username=a.author.username if a.author else None,
        title=a.title,
        body=a.body,
        pinned=a.pinned,
        created_at=a.created_at,
    )


# ---------------------------------------------------------------------------
# Gestionar inscripciones + Validar inscripción + Aprobar equipos (Moderador)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/registrations", response_model=List[RegistrationOut])
async def list_registrations(
    event_id: uuid.UUID,
    _: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventRegistration)
        .options(
            selectinload(EventRegistration.team),
            selectinload(EventRegistration.validated_by),
        )
        .where(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.registered_at)
    )
    return [_registration_out(r) for r in result.scalars().all()]


@router.post(
    "/{event_id}/registrations/{reg_id}/validate",
    response_model=RegistrationOut,
)
async def validate_registration(
    event_id: uuid.UUID,
    reg_id: uuid.UUID,
    payload: RegistrationValidateRequest,
    mod: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    reg = await db.get(EventRegistration, reg_id)
    if not reg or reg.event_id != event_id:
        raise HTTPException(status_code=404, detail="Registration not found")

    reg.status = (
        RegistrationStatusEnum.approved.value
        if payload.approve
        else RegistrationStatusEnum.rejected.value
    )
    reg.validated_by_id = mod.id
    reg.validated_at = datetime.now(timezone.utc)
    if not payload.approve:
        reg.rejection_reason = payload.rejection_reason or "Sin motivo especificado"
    await db.flush()
    result = await db.execute(
        select(EventRegistration)
        .options(
            selectinload(EventRegistration.team),
            selectinload(EventRegistration.validated_by),
        )
        .where(EventRegistration.id == reg_id)
    )
    return _registration_out(result.scalar_one())


def _registration_out(r: EventRegistration) -> RegistrationOut:
    return RegistrationOut(
        id=r.id,
        event_id=r.event_id,
        team_id=r.team_id,
        team_name=r.team.name if r.team else "",
        status=RegistrationStatusEnum(r.status),
        rejection_reason=r.rejection_reason,
        registered_at=r.registered_at,
        validated_at=r.validated_at,
        validated_by_username=r.validated_by.username if r.validated_by else None,
    )


# ---------------------------------------------------------------------------
# Gestionar tickets (Moderador)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/tickets", response_model=List[TicketOut])
async def list_tickets_mod(
    event_id: uuid.UUID,
    _: User = Depends(require_admin_or_moderator),  # admins can view too
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventTicket)
        .options(selectinload(EventTicket.user), selectinload(EventTicket.assigned_to))
        .where(EventTicket.event_id == event_id)
        .order_by(EventTicket.created_at.desc())
    )
    return [_ticket_out(t) for t in result.scalars().all()]


@router.put("/{event_id}/tickets/{ticket_id}", response_model=TicketOut)
async def manage_ticket(
    event_id: uuid.UUID,
    ticket_id: uuid.UUID,
    data: TicketUpdateRequest,
    mod: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    ticket = await db.get(EventTicket, ticket_id)
    if not ticket or ticket.event_id != event_id:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if data.status is not None:
        ticket.status = data.status.value
        if data.status in (TicketStatusEnum.resolved, TicketStatusEnum.closed):
            ticket.resolved_at = datetime.now(timezone.utc)
    if data.response is not None:
        ticket.response = data.response
    if data.assigned_to_id is not None:
        ticket.assigned_to_id = data.assigned_to_id
    await db.flush()
    result = await db.execute(
        select(EventTicket)
        .options(selectinload(EventTicket.user), selectinload(EventTicket.assigned_to))
        .where(EventTicket.id == ticket_id)
    )
    return _ticket_out(result.scalar_one())


def _ticket_out(t: EventTicket) -> TicketOut:
    return TicketOut(
        id=t.id,
        event_id=t.event_id,
        user_id=t.user_id,
        username=t.user.username if t.user else "",
        subject=t.subject,
        body=t.body,
        category=TicketCategoryEnum(t.category),
        status=TicketStatusEnum(t.status),
        response=t.response,
        assigned_to_username=t.assigned_to.username if t.assigned_to else None,
        resolved_at=t.resolved_at,
        created_at=t.created_at,
    )


# ---------------------------------------------------------------------------
# Asignar retos (Moderador)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/challenges", response_model=List[EventChallengeOut])
async def list_event_challenges(
    event_id: uuid.UUID,
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    result = await db.execute(
        select(EventChallenge)
        .options(selectinload(EventChallenge.challenge))
        .where(EventChallenge.event_id == event_id)
        .order_by(EventChallenge.order)
    )
    return [
        EventChallengeOut(
            id=ec.id,
            challenge_id=ec.challenge_id,
            title=ec.challenge.title,
            category=ec.challenge.category.value,
            difficulty=ec.challenge.difficulty.value,
            points=ec.challenge.points,
            order=ec.order,
        )
        for ec in result.scalars().all()
    ]


@router.post(
    "/{event_id}/challenges",
    response_model=EventChallengeOut,
    status_code=status.HTTP_201_CREATED,
)
async def assign_challenge(
    event_id: uuid.UUID,
    data: ChallengeAssignRequest,
    mod: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    challenge = await db.get(Challenge, data.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    # Avoid duplicate
    existing = await db.execute(
        select(EventChallenge).where(
            EventChallenge.event_id == event_id,
            EventChallenge.challenge_id == data.challenge_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail="Challenge already assigned to this event"
        )
    ec = EventChallenge(
        event_id=event_id,
        challenge_id=data.challenge_id,
        order=data.order,
        assigned_by_id=mod.id,
    )
    db.add(ec)
    await db.flush()
    return EventChallengeOut(
        id=ec.id,
        challenge_id=ec.challenge_id,
        title=challenge.title,
        category=challenge.category.value,
        difficulty=challenge.difficulty.value,
        points=challenge.points,
        order=ec.order,
    )


@router.delete(
    "/{event_id}/challenges/{challenge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unassign_challenge(
    event_id: uuid.UUID,
    challenge_id: uuid.UUID,
    _: User = Depends(require_moderator),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventChallenge).where(
            EventChallenge.event_id == event_id,
            EventChallenge.challenge_id == challenge_id,
        )
    )
    ec = result.scalar_one_or_none()
    if not ec:
        raise HTTPException(status_code=404, detail="Assignment not found")
    await db.delete(ec)


# ---------------------------------------------------------------------------
# Gestionar scoreboard (Moderador) — read-only computed view
# ---------------------------------------------------------------------------


@router.get("/{event_id}/scoreboard", response_model=ScoreboardOut)
async def get_event_scoreboard(
    event_id: uuid.UUID,
    _: User = Depends(require_admin_or_moderator),
    db: AsyncSession = Depends(get_db),
):
    await _event_or_404(db, event_id)
    # Sum points and solves per team (correct submissions for challenges
    # belonging to this event), restricted to teams approved for the event.
    sub_q = (
        select(
            Submission.team_id.label("team_id"),
            func.sum(Challenge.points).label("points"),
            func.count(Submission.id).label("solves"),
        )
        .join(Challenge, Challenge.id == Submission.challenge_id)
        .join(EventChallenge, EventChallenge.challenge_id == Challenge.id)
        .where(
            Submission.is_correct == True,  # noqa: E712
            Submission.team_id.is_not(None),
            EventChallenge.event_id == event_id,
        )
        .group_by(Submission.team_id)
    ).subquery()

    result = await db.execute(
        select(
            Team.id,
            Team.name,
            sub_q.c.points,
            sub_q.c.solves,
        )
        .join(EventRegistration, EventRegistration.team_id == Team.id)
        .outerjoin(sub_q, sub_q.c.team_id == Team.id)
        .where(
            EventRegistration.event_id == event_id,
            EventRegistration.status == RegistrationStatusEnum.approved.value,
        )
    )
    rows = result.all()
    sorted_rows = sorted(rows, key=lambda r: (-(r[2] or 0), -(r[3] or 0)))
    entries = [
        ScoreboardEntry(
            team_id=r[0],
            team_name=r[1],
            points=int(r[2] or 0),
            solves=int(r[3] or 0),
            rank=i + 1,
        )
        for i, r in enumerate(sorted_rows)
    ]
    return ScoreboardOut(
        event_id=event_id,
        entries=entries,
        generated_at=datetime.now(timezone.utc),
    )
