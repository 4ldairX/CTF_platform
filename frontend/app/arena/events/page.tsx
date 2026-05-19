"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarRange,
  Crosshair,
  Flag,
  Layers,
} from "lucide-react";
import { events as eventsApi } from "@/lib/api";
import type { EventOut } from "@/lib/types";

export default function ArenaEventsPage() {
  const [eventsList, setEventsList] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    eventsApi
      .list()
      .then((data) => setEventsList(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeEvent = eventsList.find((e) => e.is_active) ?? null;
  const monthOps = eventsList;

  const remaining = activeEvent
    ? Math.max(0, Math.floor((new Date(activeEvent.ends_at).getTime() - now) / 1000))
    : 0;
  const hh = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="px-10 py-8">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
          Calendario
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Eventos CTF
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Visualiza y planifica tu participación en los próximos despliegues
          tácticos. El control es la clave del éxito.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl" />
          <div className="absolute -right-24 -bottom-32 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
          {activeEvent ? (
            <>
              <span className="relative inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-950">
                <Activity size={10} /> En curso · Alta prioridad
              </span>
              <h2 className="relative mt-4 font-display text-4xl font-black leading-[0.9] tracking-tight text-zinc-50 md:text-5xl">
                {activeEvent.title.toUpperCase()}
              </h2>
              <p className="relative mt-3 max-w-md text-sm text-zinc-400">
                {activeEvent.description}
              </p>
              <div className="relative mt-6 flex flex-wrap items-end gap-6">
                <div className="grid grid-cols-3 gap-3 font-mono text-zinc-50">
                  <CountdownCell value={hh} label="HORAS" />
                  <CountdownCell value={mm} label="MIN" />
                  <CountdownCell value={ss} label="SEG" />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                >
                  <Crosshair size={14} /> Regístrate ahora
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="relative inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
                <CalendarRange size={10} /> Sin evento activo
              </span>
              <h2 className="relative mt-4 font-display text-4xl font-black leading-[0.9] tracking-tight text-zinc-400 md:text-5xl">
                PRÓXIMAMENTE
              </h2>
              <p className="relative mt-3 max-w-md text-sm text-zinc-500">
                No hay eventos activos en este momento. Mantente atento al cronograma.
              </p>
            </>
          )}
        </article>

        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Total de eventos
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-zinc-50">
                {loading ? "..." : eventsList.length}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                registrados
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {eventsList.filter((e) => e.is_active).length} activos actualmente.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Próximos
            </span>
            <p className="mt-3 text-sm text-zinc-300">
              Mantente atento al cronograma para inscribirte con anticipación a
              los siguientes eventos CTF.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-zinc-100">
          Próximos eventos
        </h2>
        {loading ? (
          <div className="mt-4 py-8 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando eventos...
          </div>
        ) : monthOps.length === 0 ? (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-center">
            <Layers size={32} className="mx-auto mb-3 text-zinc-700" />
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              No hay eventos registrados
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {monthOps.map((op) => (
              <Link
                key={op.id}
                href={`/arena/events/${op.id}`}
                className={
                  op.is_active
                    ? "flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 transition hover:border-orange-500/30"
                    : "flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-950/60 px-5 py-4 opacity-60 transition hover:border-orange-500/30 hover:opacity-100"
                }
              >
                <div className="flex items-center gap-4">
                  <span className="rounded-md border border-orange-500/30 bg-orange-500/10 p-2 text-orange-400">
                    <Flag size={14} />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                      {op.starts_at
                        ? new Date(op.starts_at).toLocaleDateString("es-BO")
                        : "Fecha por confirmar"}
                      {op.max_teams ? ` · Máx ${op.max_teams} equipos` : ""}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-zinc-100">
                      {op.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                      {op.description}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300">
                  Ver detalle <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-5 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
        <span>Registro · {new Date().toISOString().slice(0, 10)}</span>
        <Link href="/arena/library" className="text-orange-300 hover:text-orange-200">
          Biblioteca →
        </Link>
      </footer>
    </div>
  );
}

function CountdownCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/60 px-4 py-3 text-center">
      <div className="font-display text-3xl font-black leading-none tracking-tight text-zinc-50 md:text-4xl">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}
