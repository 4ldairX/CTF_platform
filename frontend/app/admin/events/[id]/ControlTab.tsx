"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Loader2,
  PauseCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { adminEvents, ApiError, moderatorEvents } from "@/lib/api";
import type { EventAdminOut, EventControlAction, EventStatus } from "@/lib/types";

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Borrador",
  scheduled: "Programado",
  active: "En curso",
  paused: "Pausado",
  ended: "Finalizado",
};

type Action = {
  id: EventControlAction;
  label: string;
  icon: React.ReactNode;
  allowedFrom: EventStatus[];
  cls: string;
};

const ACTIONS: Action[] = [
  {
    id: "schedule",
    label: "Programar",
    icon: <CalendarCheck size={14} />,
    allowedFrom: ["draft"],
    cls: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
  },
  {
    id: "start",
    label: "Iniciar",
    icon: <PlayCircle size={14} />,
    allowedFrom: ["draft", "scheduled", "paused"],
    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  },
  {
    id: "pause",
    label: "Pausar",
    icon: <PauseCircle size={14} />,
    allowedFrom: ["active"],
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
  },
  {
    id: "resume",
    label: "Reanudar",
    icon: <PlayCircle size={14} />,
    allowedFrom: ["paused"],
    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  },
  {
    id: "end",
    label: "Finalizar",
    icon: <StopCircle size={14} />,
    allowedFrom: ["active", "paused"],
    cls: "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
  },
];

export default function ControlTab({
  event,
  role,
  onChange,
  onToast,
}: {
  event: EventAdminOut;
  role: "admin" | "moderator";
  onChange: () => Promise<void>;
  onToast: (msg: string, variant: "success" | "error") => void;
}) {
  const [busy, setBusy] = useState<EventControlAction | null>(null);

  // Moderator no puede "programar" (eso es admin only)
  const availableActions =
    role === "moderator" ? ACTIONS.filter((a) => a.id !== "schedule") : ACTIONS;

  async function handleAction(action: EventControlAction) {
    if (!confirm(`¿Confirmas la acción "${actionLabel(action)}"?`)) return;
    setBusy(action);
    try {
      if (role === "admin") {
        await adminEvents.control(event.id, action);
      } else {
        await moderatorEvents.control(event.id, action);
      }
      onToast(`Acción "${actionLabel(action)}" aplicada.`, "success");
      await onChange();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    } finally {
      setBusy(null);
    }
  }

  function actionLabel(a: EventControlAction): string {
    return ACTIONS.find((x) => x.id === a)?.label ?? a;
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-zinc-50">Control de evento</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Estado actual:{" "}
        <span className="font-bold text-zinc-200">
          {STATUS_LABEL[event.status]}
        </span>
        . Solo se muestran las acciones válidas para este estado.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {availableActions.map((a) => {
          const allowed = a.allowedFrom.includes(event.status);
          return (
            <button
              key={a.id}
              onClick={() => handleAction(a.id)}
              disabled={!allowed || busy !== null}
              className={
                allowed
                  ? `inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] ${a.cls} disabled:opacity-50`
                  : "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700"
              }
            >
              {busy === a.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                a.icon
              )}
              {a.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-500">
        <p>
          <span className="font-bold text-zinc-300">Flujo:</span> Borrador →
          Programado → En curso ⇄ Pausado → Finalizado
        </p>
      </div>
    </article>
  );
}
