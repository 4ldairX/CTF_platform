"""Módulo 9 — Asistencia IA v2.

Casos de uso y reglas:

ADMIN:
- Gestionar prompts
- Limitar consultas
- Monitorear consumo
- Indexar documentos
- Configurar API  <<include>>  Probar conexión (al guardar)

ADMIN + INSTRUCTOR:
- Subir documentos
- Consultar historial (todas las conversaciones)

COMPETIDOR:
- Consultar asistente  <<include>>  Validar límite de consultas + Registrar consumo
- Consultar asistente  <<extend>>  modos: Explicar concepto / Recomendar reto / Generar retroalimentación
- Ver consultas (las suyas)
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import (
    get_current_user,
    require_admin,
    require_competitor,
    require_instructor_or_above,
)
from app.db.session import get_db
from app.models.ai import (
    AIConsumption,
    AIConversation,
    AIDocument,
    AIMessage,
    AIPrompt,
    AIPromptKindEnum,
    AIQueryModeEnum,
    AISettings,
)
from app.models.user import User
from app.schemas.ai import (
    AIConfigRequest,
    AILimitsRequest,
    AISettingsOut,
    AskRequest,
    AskResponse,
    ConsumptionSummaryOut,
    ConversationDetailOut,
    ConversationListOut,
    DocumentOut,
    DocumentUploadRequest,
    HistoryEntryOut,
    MessageOut,
    PromptIn,
    PromptOut,
)

router = APIRouter(prefix="/ai", tags=["ai"])


# ===========================================================================
# Helpers
# ===========================================================================


async def _get_or_create_settings(db: AsyncSession) -> AISettings:
    """The settings table is a singleton (id=1)."""
    result = await db.execute(select(AISettings).where(AISettings.id == 1))
    s = result.scalar_one_or_none()
    if s is None:
        s = AISettings(id=1)
        db.add(s)
        await db.flush()
        await db.refresh(s)
    return s


def _settings_out(s: AISettings) -> AISettingsOut:
    return AISettingsOut(
        provider=s.provider,
        model=s.model,
        api_base_url=s.api_base_url,
        api_key_set=bool(s.api_key_encrypted),
        max_tokens=s.max_tokens,
        temperature_x100=s.temperature_x100,
        daily_quota_per_user=s.daily_quota_per_user,
        last_connection_ok=s.last_connection_ok,
        last_connection_at=s.last_connection_at,
        last_connection_message=s.last_connection_message,
        updated_at=s.updated_at,
    )


async def _probar_conexion(db: AsyncSession, settings_row: AISettings) -> tuple[bool, str]:
    """<<include>> obligatorio al guardar configuración.

    En esta versión la prueba consiste en validar los campos mínimos.
    Cuando se integre un LLM real, aquí debería hacer una ping al provider.
    """
    if not settings_row.provider or not settings_row.model:
        msg = "Falta provider o model"
        settings_row.last_connection_ok = False
        settings_row.last_connection_message = msg
        settings_row.last_connection_at = datetime.now(timezone.utc)
        return False, msg
    if settings_row.max_tokens < 64:
        msg = "max_tokens demasiado bajo"
        settings_row.last_connection_ok = False
        settings_row.last_connection_message = msg
        settings_row.last_connection_at = datetime.now(timezone.utc)
        return False, msg
    settings_row.last_connection_ok = True
    settings_row.last_connection_message = "Configuración válida"
    settings_row.last_connection_at = datetime.now(timezone.utc)
    return True, "Configuración válida"


# ===========================================================================
# Gestionar prompts (Admin)
# ===========================================================================


@router.get("/prompts", response_model=List[PromptOut])
async def list_prompts(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIPrompt)
        .options(selectinload(AIPrompt.updated_by))
        .order_by(AIPrompt.kind)
    )
    return [
        PromptOut(
            id=p.id,
            kind=AIPromptKindEnum(p.kind),
            content=p.content,
            updated_at=p.updated_at,
            updated_by_username=p.updated_by.username if p.updated_by else None,
        )
        for p in result.scalars().all()
    ]


@router.put("/prompts", response_model=PromptOut)
async def upsert_prompt(
    payload: PromptIn,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create or update a prompt for the given kind."""
    result = await db.execute(
        select(AIPrompt).where(AIPrompt.kind == payload.kind.value)
    )
    p = result.scalar_one_or_none()
    if p is None:
        p = AIPrompt(kind=payload.kind.value, content=payload.content)
        db.add(p)
    else:
        p.content = payload.content
    p.updated_by_id = admin.id
    await db.flush()
    result = await db.execute(
        select(AIPrompt)
        .options(selectinload(AIPrompt.updated_by))
        .where(AIPrompt.id == p.id)
    )
    p = result.scalar_one()
    return PromptOut(
        id=p.id,
        kind=AIPromptKindEnum(p.kind),
        content=p.content,
        updated_at=p.updated_at,
        updated_by_username=p.updated_by.username if p.updated_by else None,
    )


# ===========================================================================
# Limitar consultas (Admin)
# ===========================================================================


@router.get("/limits", response_model=AISettingsOut)
async def get_limits(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return _settings_out(await _get_or_create_settings(db))


@router.put("/limits", response_model=AISettingsOut)
async def update_limits(
    payload: AILimitsRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    s = await _get_or_create_settings(db)
    s.daily_quota_per_user = payload.daily_quota_per_user
    await db.flush()
    await db.refresh(s)
    return _settings_out(s)


# ===========================================================================
# Configurar API (Admin)  <<include>>  Probar conexión
# ===========================================================================


@router.get("/config", response_model=AISettingsOut)
async def get_config(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return _settings_out(await _get_or_create_settings(db))


@router.put("/config", response_model=AISettingsOut)
async def update_config(
    payload: AIConfigRequest,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update API config + <<include>> probar_conexion (obligatorio, mismo flush)."""
    s = await _get_or_create_settings(db)
    s.provider = payload.provider
    s.model = payload.model
    s.api_base_url = payload.api_base_url
    if payload.api_key:
        # NOTE: in prod, encrypt. Here we just store the literal as a marker.
        s.api_key_encrypted = payload.api_key
    s.max_tokens = payload.max_tokens
    s.temperature_x100 = payload.temperature_x100

    # <<include>> Probar conexión — obligatorio dentro de la misma transacción
    ok, _msg = await _probar_conexion(db, s)
    await db.flush()
    await db.refresh(s)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Configuración inválida: {_msg}",
        )
    return _settings_out(s)


# ===========================================================================
# Indexar documentos / Subir documentos (Admin + Instructor)
# ===========================================================================


def _document_out(d: AIDocument) -> DocumentOut:
    return DocumentOut(
        id=d.id,
        title=d.title,
        description=d.description,
        source_url=d.source_url,
        indexed=d.indexed,
        indexed_at=d.indexed_at,
        uploaded_by_username=d.uploaded_by.username if d.uploaded_by else None,
        created_at=d.created_at,
        content_preview=(d.content[:200] + "...") if d.content and len(d.content) > 200 else d.content,
    )


@router.get("/documents", response_model=List[DocumentOut])
async def list_documents(
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIDocument)
        .options(selectinload(AIDocument.uploaded_by))
        .order_by(AIDocument.created_at.desc())
    )
    return [_document_out(d) for d in result.scalars().all()]


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    payload: DocumentUploadRequest,
    user: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    doc = AIDocument(
        title=payload.title,
        description=payload.description,
        source_url=payload.source_url,
        content=payload.content,
        uploaded_by_id=user.id,
    )
    db.add(doc)
    await db.flush()
    result = await db.execute(
        select(AIDocument)
        .options(selectinload(AIDocument.uploaded_by))
        .where(AIDocument.id == doc.id)
    )
    return _document_out(result.scalar_one())


@router.post("/documents/{document_id}/index", response_model=DocumentOut)
async def index_document(
    document_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Indexar documentos — solo admin. Stub que marca el documento como indexado."""
    doc = await db.get(AIDocument, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.indexed = True
    doc.indexed_at = datetime.now(timezone.utc)
    await db.flush()
    result = await db.execute(
        select(AIDocument)
        .options(selectinload(AIDocument.uploaded_by))
        .where(AIDocument.id == document_id)
    )
    return _document_out(result.scalar_one())


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(AIDocument, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)


# ===========================================================================
# Monitorear consumo (Admin)
# ===========================================================================


@router.get("/consumption", response_model=ConsumptionSummaryOut)
async def consumption_summary(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(select(func.count(AIConsumption.id)))
    total_in = await db.scalar(select(func.coalesce(func.sum(AIConsumption.tokens_in), 0)))
    total_out = await db.scalar(select(func.coalesce(func.sum(AIConsumption.tokens_out), 0)))

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    requests_today = await db.scalar(
        select(func.count(AIConsumption.id)).where(AIConsumption.created_at >= today_start)
    )
    active_today = await db.scalar(
        select(func.count(func.distinct(AIConsumption.user_id))).where(
            AIConsumption.created_at >= today_start
        )
    )

    # Top users (last 7 days)
    last_week = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(
            AIConsumption.user_id,
            User.username,
            func.count(AIConsumption.id).label("requests"),
            func.coalesce(func.sum(AIConsumption.tokens_in + AIConsumption.tokens_out), 0).label("tokens"),
        )
        .join(User, User.id == AIConsumption.user_id)
        .where(AIConsumption.created_at >= last_week)
        .group_by(AIConsumption.user_id, User.username)
        .order_by(func.count(AIConsumption.id).desc())
        .limit(10)
    )
    top = [
        {
            "user_id": str(r[0]),
            "username": r[1],
            "requests": int(r[2]),
            "tokens": int(r[3]),
        }
        for r in result.all()
    ]
    return ConsumptionSummaryOut(
        total_requests=total or 0,
        total_tokens_in=total_in or 0,
        total_tokens_out=total_out or 0,
        requests_today=requests_today or 0,
        active_users_today=active_today or 0,
        top_users=top,
    )


# ===========================================================================
# Consultar historial (Admin + Instructor)
# ===========================================================================


@router.get("/history", response_model=List[HistoryEntryOut])
async def query_history(
    limit: int = 50,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    limit = max(1, min(limit, 200))
    msg_count_sq = (
        select(
            AIMessage.conversation_id,
            func.count(AIMessage.id).label("cnt"),
        ).group_by(AIMessage.conversation_id)
    ).subquery()

    result = await db.execute(
        select(
            AIConversation.id,
            User.username,
            AIConversation.title,
            AIConversation.mode,
            func.coalesce(msg_count_sq.c.cnt, 0),
            AIConversation.updated_at,
        )
        .join(User, User.id == AIConversation.user_id)
        .outerjoin(msg_count_sq, msg_count_sq.c.conversation_id == AIConversation.id)
        .order_by(AIConversation.updated_at.desc())
        .limit(limit)
    )
    return [
        HistoryEntryOut(
            conversation_id=r[0],
            username=r[1],
            title=r[2],
            mode=r[3],
            message_count=int(r[4] or 0),
            updated_at=r[5],
        )
        for r in result.all()
    ]


# ===========================================================================
# Competidor — Consultar asistente, Ver consultas
# ===========================================================================


async def _validar_limite_consultas(
    db: AsyncSession, user: User, settings_row: AISettings
) -> int:
    """<<include>> middleware: enforce daily quota and return used count.

    Raises 429 if quota is exceeded.
    """
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    used_today = await db.scalar(
        select(func.count(AIConsumption.id)).where(
            AIConsumption.user_id == user.id,
            AIConsumption.created_at >= today_start,
        )
    )
    used_today = int(used_today or 0)
    if used_today >= settings_row.daily_quota_per_user:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Cuota diaria alcanzada ({used_today}/"
                f"{settings_row.daily_quota_per_user}). Intenta mañana."
            ),
        )
    return used_today


async def _registrar_consumo(
    db: AsyncSession,
    user: User,
    conversation: AIConversation,
    mode: str,
    tokens_in: int,
    tokens_out: int,
) -> None:
    """<<include>> middleware: log the consumption record."""
    db.add(
        AIConsumption(
            user_id=user.id,
            conversation_id=conversation.id,
            mode=mode,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
        )
    )


def _simulated_answer(message: str, mode: AIQueryModeEnum) -> str:
    """Placeholder LLM response until the real provider is wired in."""
    intros = {
        AIQueryModeEnum.chat: "Buena pregunta.",
        AIQueryModeEnum.explain_concept: "Te explico el concepto.",
        AIQueryModeEnum.recommend_challenge: "Te recomiendo este reto.",
        AIQueryModeEnum.generate_feedback: "Retroalimentación:",
    }
    return (
        f"{intros[mode]} (Respuesta simulada — el motor LLM aún no está conectado.) "
        f"Tu mensaje fue: \"{message[:120]}{'...' if len(message) > 120 else ''}\""
    )


@router.post("/ask", response_model=AskResponse)
async def ask_assistant(
    payload: AskRequest,
    user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    """Consultar asistente — Competidor.

    <<include>> Validar límite de consultas
    <<include>> Registrar consumo

    <<extend>> mode in {chat, explain_concept, recommend_challenge, generate_feedback}
    """
    settings_row = await _get_or_create_settings(db)

    # <<include>> Validar límite obligatoriamente al inicio
    quota_used = await _validar_limite_consultas(db, user, settings_row)

    # Get or create conversation
    if payload.conversation_id:
        conv = await db.get(AIConversation, payload.conversation_id)
        if not conv or conv.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        conv = AIConversation(
            user_id=user.id,
            title=(payload.message[:80] + "...") if len(payload.message) > 80 else payload.message,
            mode=payload.mode.value,
        )
        db.add(conv)
        await db.flush()

    # Persist user message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        mode=payload.mode.value,
        content=payload.message,
        tokens_in=len(payload.message) // 4,
        tokens_out=0,
    )
    db.add(user_msg)

    # Generate (simulated) answer
    answer = _simulated_answer(payload.message, payload.mode)
    tokens_in = len(payload.message) // 4
    tokens_out = len(answer) // 4
    asst_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        mode=payload.mode.value,
        content=answer,
        tokens_in=0,
        tokens_out=tokens_out,
    )
    db.add(asst_msg)

    # <<include>> Registrar consumo — obligatorio, misma transacción
    await _registrar_consumo(db, user, conv, payload.mode.value, tokens_in, tokens_out)

    await db.flush()
    return AskResponse(
        conversation_id=conv.id,
        message_id=asst_msg.id,
        answer=answer,
        mode=payload.mode,
        quota_used_today=quota_used + 1,
        quota_limit=settings_row.daily_quota_per_user,
    )


@router.get("/my-conversations", response_model=List[ConversationListOut])
async def list_my_conversations(
    user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    msg_count_sq = (
        select(
            AIMessage.conversation_id,
            func.count(AIMessage.id).label("cnt"),
        ).group_by(AIMessage.conversation_id)
    ).subquery()

    result = await db.execute(
        select(
            AIConversation.id,
            AIConversation.title,
            AIConversation.mode,
            AIConversation.created_at,
            AIConversation.updated_at,
            func.coalesce(msg_count_sq.c.cnt, 0),
        )
        .outerjoin(msg_count_sq, msg_count_sq.c.conversation_id == AIConversation.id)
        .where(AIConversation.user_id == user.id)
        .order_by(AIConversation.updated_at.desc())
    )
    return [
        ConversationListOut(
            id=r[0],
            title=r[1],
            mode=r[2],
            created_at=r[3],
            updated_at=r[4],
            message_count=int(r[5] or 0),
        )
        for r in result.all()
    ]


@router.get("/my-conversations/{conversation_id}", response_model=ConversationDetailOut)
async def get_my_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(require_competitor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if not conv or conv.user_id != user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationDetailOut(
        id=conv.id,
        title=conv.title,
        mode=conv.mode,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[
            MessageOut(
                id=m.id,
                role=m.role,
                mode=m.mode,
                content=m.content,
                created_at=m.created_at,
            )
            for m in conv.messages
        ],
    )
