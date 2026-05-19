"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  Crosshair,
  Cpu,
  HardDrive,
  Loader2,
  ShieldHalf,
  UserPlus,
  X,
} from "lucide-react";
import { events as eventsApi, teams as teamsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { EventOut, TeamDetailOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

export default function EventRegistrationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventOut | null>(null);
  const [myTeam, setMyTeam] = useState<TeamDetailOut | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ev, team] = await Promise.all([
          eventsApi.get(params.id),
          teamsApi.myTeam(),
        ]);
        setEvent(ev);
        setMyTeam(team);
      } catch {
        // ignore
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accepted) {
      setToast({
        message: "Debes aceptar los Terms of Engagement.",
        variant: "error",
      });
      return;
    }
    if (!myTeam) {
      setToast({
        message: "Necesitas un equipo para inscribirte en un evento.",
        variant: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      await eventsApi.register(params.id, myTeam.id);
      setToast({
        message: "Inscripción registrada. Despliegue confirmado.",
        variant: "success",
      });
      window.setTimeout(() => router.push("/arena/events"), 900);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al inscribirse.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
          Evento no encontrado.
        </p>
        <Link
          href="/arena/events"
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400 hover:text-orange-300"
        >
          ← Volver a eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        OP. Registration
      </span>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50">
        Inscripción a Evento
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Inicia la secuencia de despliegue. Asegura tu posición antes de la brecha.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]"
      >
        {/* Event details */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            <CalendarRange size={12} /> Operación
          </span>
          <h2 className="mt-3 text-2xl font-black text-zinc-50 uppercase">
            {event.title}
          </h2>
          {event.description && (
            <p className="mt-2 text-sm text-zinc-400">{event.description}</p>
          )}
          <dl className="mt-5 flex flex-col gap-2">
            {event.starts_at && (
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <dt className="text-zinc-600">Inicio</dt>
                <dd className="text-zinc-300">
                  {new Date(event.starts_at).toLocaleString("es-BO")}
                </dd>
              </div>
            )}
            {event.ends_at && (
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <dt className="text-zinc-600">Fin</dt>
                <dd className="text-zinc-300">
                  {new Date(event.ends_at).toLocaleString("es-BO")}
                </dd>
              </div>
            )}
            {event.max_teams && (
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                <dt className="text-zinc-600">Equipos máx.</dt>
                <dd className="text-zinc-300">{event.max_teams}</dd>
              </div>
            )}
          </dl>
        </article>

        {/* Team identity */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            <ShieldHalf size={12} /> Tu equipo
          </span>
          {myTeam ? (
            <div className="mt-4">
              <p className="text-xl font-black uppercase text-zinc-50">{myTeam.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {myTeam.member_count} miembro{myTeam.member_count !== 1 ? "s" : ""} ·{" "}
                {myTeam.total_points.toLocaleString()} pts
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {myTeam.members.map((m) => (
                  <li
                    key={m.user_id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-[10px] font-bold text-white">
                      {m.username.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-zinc-300">{m.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-700 p-6 text-center">
              <p className="text-sm text-zinc-500">No perteneces a ningún equipo.</p>
              <Link
                href="/arena/teams"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                <UserPlus size={12} /> Crear o unirse a un equipo
              </Link>
            </div>
          )}
        </article>

        {/* Terms */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-orange-500"
            />
            <span>
              <span className="font-bold uppercase tracking-[0.18em] text-zinc-100">
                Acepto las reglas del evento.
              </span>{" "}
              Cualquier incumplimiento del reglamento puede resultar en la
              descalificación y revocación de credenciales.
            </span>
          </label>
        </article>

        <div className="flex items-center justify-end gap-3 lg:col-span-2">
          <Link
            href="/arena/events"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 hover:border-rose-500/40"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting || !myTeam}
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Crosshair size={14} />
            )}
            Inscribir equipo <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* Footer info cards */}
      <section className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
        <FooterCard
          icon={<HardDrive size={14} />}
          title="Tu historial"
          description="Consulta tu participación en eventos anteriores y los puntos obtenidos."
        />
        <FooterCard
          icon={<Cpu size={14} />}
          title="Entornos aislados"
          description="Cada equipo trabaja en su propio entorno de pruebas."
        />
        <FooterCard
          icon={<AlertTriangle size={14} />}
          title="Reglas del evento"
          description="Revisa con tu equipo las reglas y bonificaciones antes de iniciar."
        />
      </section>

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

function FooterCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-orange-400">
        {icon} {title}
      </span>
      <p className="mt-2 text-xs text-zinc-500">{description}</p>
    </article>
  );
}
