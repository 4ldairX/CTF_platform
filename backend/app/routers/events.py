"""Módulo 10 — Eventos CTF v2: endpoints públicos / competidor.

Casos de uso:
- Listar eventos          → Admin, Mod, Instructor, Competidor (cualquier autenticado)
- Ver detalle del evento  → idem
- Inscribirse en evento   → Competidor (su equipo)
- Enviar ticket           → Competidor  <<include>>  Registrar ticket (automático)
- Ver anuncios            → cualquier autenticado
- Ver mis tickets         → Competidor
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, require_competitor
from app.crud.event import (
    get_event_by_id,
    get_events,
    get_registration,
    register_team,
)
from app.crud.team import get_membership
from app.db.session import get_db
from app.models.event import (
    EventAnnouncement,
    EventTicket,
    TicketCategoryEnum,
    TicketStatusEnum,
)
from app.models.user import User
from app.schemas.event import EventOut, EventRegisterRequest
from app.schemas.event_extras import (
    AnnouncementOut,
    TicketCreateRequest,
    TicketOut,
)

router = APIRouter(prefix="/events", tags=["events"])


def _build_event_out(event) -> EventOut:
    return EventOut(
        id=event.id,
        title=event.title,
        description=event.description,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
        is_active=event.is_active,
        max_teams=event.max_teams,
        registered_teams_count=len(event.registrations),
    )


# ---------------------------------------------------------------------------
# Listar / detalle (cualquier rol autenticado)
# ---------------------------------------------------------------------------


@router.get("/", response_model=List[EventOut])
async def list_events(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Listar eventos — Admin, Mod, Instructor, Competidor."""
    events = await get_events(db)
    return [_build_event_out(e) for e in events]


@router.get("/{event_id}", response_model=EventOut)
async def get_event(
    event_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return _build_event_out(event)


# ---------------------------------------------------------------------------
# Inscripción al evento (Competidor con equipo)
# ---------------------------------------------------------------------------


@router.post("/{event_id}/register", response_model=EventOut)
async def register_for_event(
    event_id: uuid.UUID,
    data: EventRegisterRequest,
    current_user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    if not event.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event is not currently active",
        )

    membership = await get_membership(db, current_user.id, data.team_id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of the specified team",
        )

    existing = await get_registration(db, event_id, data.team_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Team is already registered for this event",
        )

    if event.max_teams is not None and len(event.registrations) >= event.max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event has reached maximum team capacity",
        )

    await register_team(db, event_id, data.team_id)
    # Expire the cached event so the next read re-fetches registrations
    db.expire(event, ["registrations"])
    event = await get_event_by_id(db, event_id)
    return _build_event_out(event)


# ---------------------------------------------------------------------------
# Anuncios públicos del evento (cualquier autenticado)
# ---------------------------------------------------------------------------


@router.get("/{event_id}/announcements", response_model=List[AnnouncementOut])
async def list_announcements_public(
    event_id: uuid.UUID,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    result = await db.execute(
        select(EventAnnouncement)
        .options(selectinload(EventAnnouncement.author))
        .where(EventAnnouncement.event_id == event_id)
        .order_by(
            EventAnnouncement.pinned.desc(), EventAnnouncement.created_at.desc()
        )
    )
    return [
        AnnouncementOut(
            id=a.id,
            event_id=a.event_id,
            author_username=a.author.username if a.author else None,
            title=a.title,
            body=a.body,
            pinned=a.pinned,
            created_at=a.created_at,
        )
        for a in result.scalars().all()
    ]


# ---------------------------------------------------------------------------
# Tickets — Enviar (Competidor)  <<include>>  Registrar ticket (automático)
# ---------------------------------------------------------------------------


async def _registrar_ticket(db: AsyncSession, ticket: EventTicket) -> None:
    """<<include>> obligatorio en la misma transacción al recibir un ticket.

    El registro consiste en garantizar el estado inicial `open` y la
    persistencia del ticket; futuras integraciones pueden añadir auditoría
    o notificaciones, manteniendo el contrato del caso de uso.
    """
    ticket.status = TicketStatusEnum.open.value


@router.post(
    "/{event_id}/tickets",
    response_model=TicketOut,
    status_code=status.HTTP_201_CREATED,
)
async def send_ticket(
    event_id: uuid.UUID,
    data: TicketCreateRequest,
    user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    """Enviar ticket (Competidor) + <<include>> Registrar ticket (obligatorio)."""
    event = await get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    ticket = EventTicket(
        event_id=event_id,
        user_id=user.id,
        subject=data.subject,
        body=data.body,
        category=data.category.value,
        status=TicketStatusEnum.open.value,
    )
    db.add(ticket)
    await db.flush()

    # <<include>> Registrar ticket — automático, misma transacción
    await _registrar_ticket(db, ticket)
    await db.flush()

    result = await db.execute(
        select(EventTicket)
        .options(
            selectinload(EventTicket.user),
            selectinload(EventTicket.assigned_to),
        )
        .where(EventTicket.id == ticket.id)
    )
    return _ticket_out(result.scalar_one())


@router.get("/{event_id}/tickets/mine", response_model=List[TicketOut])
async def list_my_tickets(
    event_id: uuid.UUID,
    user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventTicket)
        .options(
            selectinload(EventTicket.user),
            selectinload(EventTicket.assigned_to),
        )
        .where(
            EventTicket.event_id == event_id,
            EventTicket.user_id == user.id,
        )
        .order_by(EventTicket.created_at.desc())
    )
    return [_ticket_out(t) for t in result.scalars().all()]


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
