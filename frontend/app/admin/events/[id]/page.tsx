"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bell,
  CheckCircle2,
  ClipboardList,
  Crosshair,
  Flag,
  Loader2,
  Megaphone,
  PauseCircle,
  PlayCircle,
  ScrollText,
  StopCircle,
  Trophy,
  Users,
} from "lucide-react";
import { adminEvents, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { EventAdminOut, EventControlAction, EventStatus } from "@/lib/types";
import Toast from "@/components/ui/Toast";
import RulesTab from "./RulesTab";
import RewardsTab from "./RewardsTab";
import ControlTab from "./ControlTab";
import ModeratorTabs from "./ModeratorTabs";

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

type TabId =
  | "control"
  | "rules"
  | "rewards"
  | "challenges"
  | "registrations"
  | "tickets"
  | "announcements"
  | "scoreboard";

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventAdminOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("control");
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  // Admin tabs (admin-only cases)
  const ADMIN_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "control", label: "Control", icon: <PlayCircle size={13} /> },
    { id: "rules", label: "Reglas", icon: <ScrollText size={13} /> },
    { id: "rewards", label: "Recompensas", icon: <Award size={13} /> },
  ];
  // Moderator tabs (control + mod-only operations)
  const MOD_TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "control", label: "Control", icon: <PlayCircle size={13} /> },
    { id: "challenges", label: "Retos asignados", icon: <Crosshair size={13} /> },
    { id: "registrations", label: "Inscripciones", icon: <Users size={13} /> },
    { id: "tickets", label: "Tickets", icon: <ClipboardList size={13} /> },
    { id: "announcements", label: "Anuncios", icon: <Megaphone size={13} /> },
    { id: "scoreboard", label: "Scoreboard", icon: <Trophy size={13} /> },
  ];

  // Admin sees all; moderator sees MOD_TABS only
  const visibleTabs = isAdmin
    ? [...ADMIN_TABS, ...MOD_TABS.filter((t) => t.id !== "control")]
    : isModerator
      ? MOD_TABS
      : [];

  async function reload() {
    try {
      setEvent(await adminEvents.get(params.id));
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
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
          href="/admin/events"
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
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
        href="/admin/events"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver al listado
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // EVENTO CTF
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            {event.title}
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            {event.slug}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {event.description || "Sin descripción."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] ${STATUS_COLOR[event.status]}`}
          >
            {STATUS_LABEL[event.status]}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            {new Date(event.starts_at).toLocaleDateString("es-BO")} →{" "}
            {new Date(event.ends_at).toLocaleDateString("es-BO")}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mt-8 flex flex-wrap gap-1 border-b border-zinc-900">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={
              activeTab === t.id
                ? "inline-flex items-center gap-2 border-b-2 border-red-500 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-red-300"
                : "inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 hover:text-zinc-200"
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <section className="mt-6">
        {activeTab === "control" && (isAdmin || isModerator) && (
          <ControlTab
            event={event}
            role={isAdmin ? "admin" : "moderator"}
            onChange={reload}
            onToast={(m, v) => setToast({ message: m, variant: v })}
          />
        )}
        {activeTab === "rules" && isAdmin && (
          <RulesTab
            eventId={event.id}
            onToast={(m, v) => setToast({ message: m, variant: v })}
          />
        )}
        {activeTab === "rewards" && isAdmin && (
          <RewardsTab
            eventId={event.id}
            onToast={(m, v) => setToast({ message: m, variant: v })}
          />
        )}
        {(activeTab === "challenges" ||
          activeTab === "registrations" ||
          activeTab === "tickets" ||
          activeTab === "announcements" ||
          activeTab === "scoreboard") && (
          <ModeratorTabs
            eventId={event.id}
            tab={activeTab}
            onToast={(m, v) => setToast({ message: m, variant: v })}
            onReload={reload}
          />
        )}
      </section>

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
