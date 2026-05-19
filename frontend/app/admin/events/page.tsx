"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarRange,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { adminEvents, ApiError } from "@/lib/api";
import type { EventAdminOut, EventStatus } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Borrador",
  scheduled: "Programado",
  active: "En curso",
  paused: "Pausado",
  ended: "Finalizado",
};

const STATUS_COLOR: Record<EventStatus, string> = {
  draft: "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  scheduled: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  paused: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  ended: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventAdminOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  async function reload() {
    try {
      const list = await adminEvents.list();
      setEvents(list);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al cargar.";
      setToast({ message: msg, variant: "error" });
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar el evento "${title}"?`)) return;
    try {
      await adminEvents.remove(id);
      setToast({ message: "Evento eliminado.", variant: "success" });
      await reload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al eliminar.";
      setToast({ message: msg, variant: "error" });
    }
  }

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // GESTIÓN DE EVENTOS
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            EVENTOS CTF
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Crear, configurar, controlar y otorgar recompensas de eventos.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
        >
          <Plus size={14} /> Crear evento
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
          <CalendarRange size={32} className="mx-auto mb-3 text-zinc-700" />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Sin eventos registrados
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
          >
            <Plus size={12} /> Crear el primero
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <header className="grid grid-cols-[1fr_120px_140px_100px_80px_80px] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
            <span>Evento</span>
            <span>Estado</span>
            <span>Inicio</span>
            <span className="text-right">Equipos</span>
            <span className="text-right">Retos</span>
            <span></span>
          </header>
          <ul>
            {events.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-[1fr_120px_140px_100px_80px_80px] items-center gap-4 border-b border-zinc-900/70 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <Link
                  href={`/admin/events/${e.id}`}
                  className="flex flex-col"
                >
                  <span className="text-sm font-bold text-zinc-50">
                    {e.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {e.slug}
                  </span>
                </Link>
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] ${STATUS_COLOR[e.status]}`}
                >
                  {STATUS_LABEL[e.status]}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {new Date(e.starts_at).toLocaleDateString("es-BO")}
                </span>
                <span className="text-right font-mono text-sm text-zinc-200">
                  {e.registered_teams_count}
                  {e.max_teams ? (
                    <span className="text-zinc-600">/{e.max_teams}</span>
                  ) : null}
                </span>
                <span className="text-right font-mono text-sm text-zinc-200">
                  {e.challenges_count}
                </span>
                <button
                  onClick={() => handleDelete(e.id, e.title)}
                  className="justify-self-end rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {createOpen && (
        <CreateEventModal
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await reload();
            setToast({ message: "Evento creado.", variant: "success" });
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

function CreateEventModal({
  onClose,
  onCreated,
  onError,
}: {
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!startsAt || !endsAt) {
      setError("Fechas de inicio y fin son obligatorias.");
      return;
    }
    if (new Date(startsAt) >= new Date(endsAt)) {
      setError("La fecha de inicio debe ser anterior a la de fin.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await adminEvents.create({
        title: title.trim(),
        slug: (slug || title).trim(),
        description: description.trim(),
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        max_teams: maxTeams ? Number(maxTeams) : null,
        is_public: true,
      });
      onCreated();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.detail : "Error al crear el evento.";
      setError(msg);
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
        onClick={(ev) => ev.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
              // NUEVO EVENTO
            </span>
            <h2 className="mt-1 font-display text-2xl font-black text-zinc-50">
              Crear evento CTF
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Field label="Nombre *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              placeholder="Hackathon EMI 2026"
            />
          </Field>
          <Field label="Slug (opcional)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              placeholder="hackathon-emi-2026"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio *">
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field label="Fin *">
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
          </div>
          <Field label="Máximo equipos (vacío = sin límite)">
            <input
              type="number"
              min="1"
              value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>

          {error && <p className="text-xs text-rose-400">{error}</p>}

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
              {saving ? "Creando..." : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
