"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Crosshair,
  Loader2,
  Pin,
  Plus,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  ApiError,
  challenges as challengesApi,
  moderatorEvents,
} from "@/lib/api";
import type {
  AnnouncementOut,
  ChallengeOut,
  EventChallengeOut,
  RegistrationOut,
  ScoreboardEntry,
  TicketOut,
  TicketStatus,
} from "@/lib/types";

type Tab =
  | "challenges"
  | "registrations"
  | "tickets"
  | "announcements"
  | "scoreboard";

const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

const TICKET_STATUS_COLOR: Record<TicketStatus, string> = {
  open: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  in_progress: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  closed: "border-zinc-700 bg-zinc-800/60 text-zinc-400",
};

export default function ModeratorTabs({
  eventId,
  tab,
  onToast,
  onReload,
}: {
  eventId: string;
  tab: Tab;
  onToast: (msg: string, variant: "success" | "error") => void;
  onReload: () => Promise<void>;
}) {
  if (tab === "challenges")
    return <ChallengesTab eventId={eventId} onToast={onToast} onReload={onReload} />;
  if (tab === "registrations")
    return <RegistrationsTab eventId={eventId} onToast={onToast} />;
  if (tab === "tickets") return <TicketsTab eventId={eventId} onToast={onToast} />;
  if (tab === "announcements")
    return <AnnouncementsTab eventId={eventId} onToast={onToast} />;
  return <ScoreboardTab eventId={eventId} />;
}

// ===========================================================================
// CHALLENGES
// ===========================================================================

function ChallengesTab({
  eventId,
  onToast,
  onReload,
}: {
  eventId: string;
  onToast: (m: string, v: "success" | "error") => void;
  onReload: () => Promise<void>;
}) {
  const [assigned, setAssigned] = useState<EventChallengeOut[]>([]);
  const [available, setAvailable] = useState<ChallengeOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectId, setSelectId] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [a, all] = await Promise.all([
        moderatorEvents.listEventChallenges(eventId),
        challengesApi.list(),
      ]);
      setAssigned(a);
      setAvailable(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleAssign() {
    if (!selectId) return;
    try {
      await moderatorEvents.assignChallenge(
        eventId,
        selectId,
        assigned.length + 1,
      );
      setSelectId("");
      onToast("Reto asignado.", "success");
      await load();
      await onReload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    }
  }

  async function handleUnassign(challengeId: string) {
    if (!confirm("¿Quitar este reto del evento?")) return;
    try {
      await moderatorEvents.unassignChallenge(eventId, challengeId);
      onToast("Reto desasignado.", "success");
      await load();
      await onReload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    }
  }

  const assignedIds = new Set(assigned.map((a) => a.challenge_id));
  const candidates = available.filter((c) => !assignedIds.has(c.id));

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header>
        <h2 className="text-lg font-bold text-zinc-50">Retos asignados</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Selecciona retos del catálogo para incluirlos en este evento.
        </p>
      </header>

      <div className="mt-5 flex gap-2">
        <select
          value={selectId}
          onChange={(e) => setSelectId(e.target.value)}
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
        >
          <option value="">— Seleccionar reto —</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.category}, {c.difficulty}, {c.points} pts)
            </option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={!selectId}
          className="inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
        >
          <Plus size={12} /> Asignar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {assigned.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Sin retos asignados
            </li>
          ) : (
            assigned.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Crosshair size={14} className="text-orange-400" />
                  <div>
                    <p className="text-sm font-bold text-zinc-50">{c.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      {c.category} · {c.difficulty} · {c.points} pts · orden {c.order}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnassign(c.challenge_id)}
                  className="rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </article>
  );
}

// ===========================================================================
// REGISTRATIONS
// ===========================================================================

function RegistrationsTab({
  eventId,
  onToast,
}: {
  eventId: string;
  onToast: (m: string, v: "success" | "error") => void;
}) {
  const [regs, setRegs] = useState<RegistrationOut[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    try {
      setRegs(await moderatorEvents.listRegistrations(eventId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function validate(reg: RegistrationOut, approve: boolean) {
    let reason: string | undefined;
    if (!approve) {
      const r = prompt("Motivo del rechazo:");
      if (r === null) return;
      reason = r;
    }
    try {
      await moderatorEvents.validateRegistration(eventId, reg.id, {
        approve,
        rejection_reason: reason,
      });
      onToast(
        approve ? "Inscripción aprobada." : "Inscripción rechazada.",
        "success",
      );
      await reload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header>
        <h2 className="text-lg font-bold text-zinc-50">Inscripciones</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Valida o rechaza las inscripciones de equipos.
        </p>
      </header>

      {regs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Sin inscripciones aún
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {regs.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-bold text-zinc-50">{r.team_name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {new Date(r.registered_at).toLocaleString("es-BO")} · {r.status}
                  {r.rejection_reason && (
                    <span className="text-rose-400"> · {r.rejection_reason}</span>
                  )}
                </p>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => validate(r, false)}
                    className="rounded-md border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                  >
                    <XCircle size={14} />
                  </button>
                  <button
                    onClick={() => validate(r, true)}
                    className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                </div>
              ) : r.status === "approved" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                  Aprobado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-rose-300">
                  Rechazado
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ===========================================================================
// TICKETS
// ===========================================================================

function TicketsTab({
  eventId,
  onToast,
}: {
  eventId: string;
  onToast: (m: string, v: "success" | "error") => void;
}) {
  const [tickets, setTickets] = useState<TicketOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketOut | null>(null);

  async function reload() {
    try {
      setTickets(await moderatorEvents.listTickets(eventId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header>
        <h2 className="text-lg font-bold text-zinc-50">Tickets</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Gestiona los tickets enviados por los competidores.
        </p>
      </header>

      {tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Sin tickets registrados
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {tickets.map((t) => (
            <li
              key={t.id}
              className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 hover:border-red-500/40"
              onClick={() => setSelected(t)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-zinc-50">{t.subject}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {t.username} · {t.category} ·{" "}
                    {new Date(t.created_at).toLocaleString("es-BO")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] ${TICKET_STATUS_COLOR[t.status]}`}
                >
                  {TICKET_STATUS_LABEL[t.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <TicketDetailModal
          ticket={selected}
          eventId={eventId}
          onClose={() => setSelected(null)}
          onSaved={async () => {
            setSelected(null);
            await reload();
            onToast("Ticket actualizado.", "success");
          }}
          onError={(msg) => onToast(msg, "error")}
        />
      )}
    </article>
  );
}

function TicketDetailModal({
  ticket,
  eventId,
  onClose,
  onSaved,
  onError,
}: {
  ticket: TicketOut;
  eventId: string;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [response, setResponse] = useState(ticket.response ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await moderatorEvents.updateTicket(eventId, ticket.id, {
        status,
        response: response.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
              {ticket.username} · {ticket.category}
            </span>
            <h2 className="mt-1 font-display text-xl font-black text-zinc-50">
              {ticket.subject}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-4 whitespace-pre-line rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">
          {ticket.body}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Estado
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            >
              {(Object.keys(TICKET_STATUS_LABEL) as TicketStatus[]).map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Respuesta
            </span>
            <textarea
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===========================================================================
// ANNOUNCEMENTS
// ===========================================================================

function AnnouncementsTab({
  eventId,
  onToast,
}: {
  eventId: string;
  onToast: (m: string, v: "success" | "error") => void;
}) {
  const [items, setItems] = useState<AnnouncementOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  async function reload() {
    try {
      setItems(await moderatorEvents.listAnnouncements(eventId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function publish(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      await moderatorEvents.publishAnnouncement(eventId, {
        title: title.trim(),
        body: body.trim(),
        pinned,
      });
      setTitle("");
      setBody("");
      setPinned(false);
      onToast("Anuncio publicado.", "success");
      await reload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    } finally {
      setPosting(false);
    }
  }

  async function remove(annId: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    try {
      await moderatorEvents.deleteAnnouncement(eventId, annId);
      await reload();
      onToast("Anuncio eliminado.", "success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header>
        <h2 className="text-lg font-bold text-zinc-50">Anuncios</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Publica anuncios visibles para todos los participantes (extensión del
          control de evento).
        </p>
      </header>

      <form onSubmit={publish} className="mt-5 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del anuncio"
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
        />
        <textarea
          required
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Contenido..."
          className="resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-3 w-3 accent-red-500"
            />
            <Pin size={11} /> Fijar
          </label>
          <button
            type="submit"
            disabled={posting}
            className="inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
          >
            {posting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            Publicar
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Sin anuncios publicados
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-50">
                    {a.pinned && <Pin size={11} className="text-amber-400" />}
                    {a.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">
                    {a.body}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {a.author_username ?? "—"} ·{" "}
                    {new Date(a.created_at).toLocaleString("es-BO")}
                  </p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ===========================================================================
// SCOREBOARD
// ===========================================================================

function ScoreboardTab({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const sb = await moderatorEvents.scoreboard(eventId);
      setEntries(sb.entries);
      setGeneratedAt(sb.generated_at);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">Scoreboard del evento</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ranking calculado de los equipos aprobados.
          </p>
        </div>
        <button
          onClick={reload}
          className="rounded-full border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-red-500/40 hover:text-red-300"
        >
          Actualizar
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Sin equipos aprobados o sin solves todavía
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800">
          <header className="grid grid-cols-[60px_1fr_100px_100px] gap-3 border-b border-zinc-900 bg-zinc-950/40 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <span>Pos</span>
            <span>Equipo</span>
            <span className="text-right">Pts</span>
            <span className="text-right">Solves</span>
          </header>
          <ul>
            {entries.map((e) => (
              <li
                key={e.team_id}
                className="grid grid-cols-[60px_1fr_100px_100px] items-center gap-3 border-b border-zinc-900/70 px-5 py-2 last:border-b-0"
              >
                <span className="font-mono text-sm font-bold text-zinc-200">
                  #{e.rank}
                </span>
                <span className="text-sm text-zinc-100">{e.team_name}</span>
                <span className="text-right font-mono text-sm font-bold text-emerald-300">
                  {e.points}
                </span>
                <span className="text-right font-mono text-xs text-zinc-400">
                  {e.solves}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {generatedAt && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Generado: {new Date(generatedAt).toLocaleString("es-BO")}
        </p>
      )}
    </article>
  );
}
