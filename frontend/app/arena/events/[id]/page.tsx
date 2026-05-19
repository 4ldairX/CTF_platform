"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  Loader2,
  Megaphone,
  Pin,
  Plus,
  Send,
  Ticket as TicketIcon,
  X,
  XCircle,
} from "lucide-react";
import { ApiError, events as eventsApi, eventsExt } from "@/lib/api";
import type {
  AnnouncementOut,
  EventOut,
  TicketCategory,
  TicketOut,
  TicketStatus,
} from "@/lib/types";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";

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

const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  technical: "Técnico",
  challenge: "Reto",
  dispute: "Disputa",
  other: "Otro",
};

export default function ArenaEventDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventOut | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementOut[]>([]);
  const [myTickets, setMyTickets] = useState<TicketOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  const isCompetitor = user?.role === "competitor";

  async function reload() {
    try {
      const [ev, ann] = await Promise.all([
        eventsApi.get(params.id),
        eventsExt.listAnnouncements(params.id).catch(() => []),
      ]);
      setEvent(ev);
      setAnnouncements(ann);
      if (isCompetitor) {
        eventsExt
          .myTickets(params.id)
          .then(setMyTickets)
          .catch(() => {});
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al cargar evento.";
      setToast({ message: msg, variant: "error" });
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-10 py-8">
        <Link
          href="/arena/events"
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500"
        >
          ← Volver
        </Link>
        <p className="mt-4 text-zinc-400">Evento no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      <Link
        href="/arena/events"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver a eventos
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Evento CTF
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {event.description || "Sin descripción."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300">
            <Clock size={11} />
            {new Date(event.starts_at).toLocaleDateString("es-BO")} →{" "}
            {new Date(event.ends_at).toLocaleDateString("es-BO")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            {event.registered_teams_count}
            {event.max_teams ? `/${event.max_teams}` : ""} equipos inscritos
          </span>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT — Announcements */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <header className="flex items-center gap-2">
            <Megaphone size={16} className="text-orange-400" />
            <h2 className="text-lg font-bold text-zinc-50">Anuncios</h2>
          </header>
          {announcements.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-zinc-800 py-12 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Aún no hay anuncios para este evento
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-3">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className={
                    a.pinned
                      ? "rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                      : "rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                  }
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-50">
                    {a.pinned && <Pin size={11} className="text-amber-400" />}
                    {a.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                    {a.body}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {a.author_username ?? "—"} ·{" "}
                    {new Date(a.created_at).toLocaleString("es-BO")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* RIGHT — Actions + my tickets */}
        <div className="flex flex-col gap-6">
          {isCompetitor && (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <header className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-50">
                  <TicketIcon size={16} className="text-orange-400" /> Mis tickets
                </h2>
                <button
                  onClick={() => setTicketOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                >
                  <Plus size={11} /> Enviar
                </button>
              </header>

              {myTickets.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-zinc-800 py-8 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                  Sin tickets enviados
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {myTickets.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-zinc-50">
                          {t.subject}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] ${TICKET_STATUS_COLOR[t.status]}`}
                        >
                          {TICKET_STATUS_LABEL[t.status]}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                        {TICKET_CATEGORY_LABEL[t.category]} ·{" "}
                        {new Date(t.created_at).toLocaleString("es-BO")}
                      </p>
                      {t.response && (
                        <div className="mt-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-200">
                          <strong className="font-mono text-[10px] uppercase tracking-[0.22em]">
                            Respuesta:
                          </strong>{" "}
                          {t.response}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )}

          {isCompetitor && (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-zinc-50">
                <CalendarRange size={14} className="text-orange-400" />{" "}
                Inscripción
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Inscribe tu equipo para participar oficialmente.
              </p>
              <Link
                href={`/arena/events/${event.id}/register`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                Inscribir mi equipo <ArrowRight size={12} />
              </Link>
            </article>
          )}
        </div>
      </section>

      {ticketOpen && (
        <SendTicketModal
          eventId={event.id}
          onClose={() => setTicketOpen(false)}
          onSent={async () => {
            setTicketOpen(false);
            await reload();
            setToast({
              message: "Ticket enviado. Registrado automáticamente.",
              variant: "success",
            });
          }}
          onError={(msg) => setToast({ message: msg, variant: "error" })}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function SendTicketModal({
  eventId,
  onClose,
  onSent,
  onError,
}: {
  eventId: string;
  onClose: () => void;
  onSent: () => void;
  onError: (msg: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<TicketCategory>("technical");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await eventsExt.sendTicket(eventId, {
        subject: subject.trim(),
        body: body.trim(),
        category,
      });
      onSent();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al enviar.";
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
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl font-black text-zinc-50">
            Enviar ticket
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Tu ticket será registrado automáticamente y enviado al moderador.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Categoría *
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            >
              {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map(
                (c) => (
                  <option key={c} value={c}>
                    {TICKET_CATEGORY_LABEL[c]}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Asunto *
            </span>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={255}
              placeholder="Resume el problema en una línea"
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Detalle *
            </span>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Explica el problema con detalle..."
              className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
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
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              Enviar ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
