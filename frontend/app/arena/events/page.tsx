"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarRange,
  Crosshair,
  DollarSign,
  Flag,
  Gauge,
  Layers,
  Trophy,
} from "lucide-react";

const MONTH_OPS = [
  {
    id: "neuralbank",
    title: "WEB INFILTRATION: NEURAL BANK",
    eyebrow: "BREACH · INTERMEDIATE",
    available: true,
    cta: "Participar",
  },
  {
    id: "binex",
    title: "BINARY EXPLOITATION WORKSHOP",
    eyebrow: "WORKSHOP · ADVANCED",
    available: true,
    cta: "Ver detalles",
  },
  {
    id: "crypto",
    title: "CRYPTOGRAPHIC KEYS DECRYPTION",
    eyebrow: "CIPHER · INTERMEDIATE",
    available: true,
    cta: "Ver detalles",
  },
  {
    id: "legacy",
    title: "LEGACY BREACH SIMULATION",
    eyebrow: "ARCHIVED · LOCKED",
    available: false,
    cta: "Bloqueado",
  },
];

export default function ArenaEventsPage() {
  const [seconds, setSeconds] = useState(4 * 3600 + 12 * 60 + 36);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="px-10 py-8">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
          Operations Calendar
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          CRONOGRAMA DE EVENTOS
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
          <span className="relative inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-950">
            <Activity size={10} /> En curso · Alta prioridad
          </span>
          <h2 className="relative mt-4 font-display text-4xl font-black leading-[0.9] tracking-tight text-zinc-50 md:text-5xl">
            OPERATION:
            <br />
            SHADOW PROTOCOL
          </h2>
          <p className="relative mt-3 max-w-md text-sm text-zinc-400">
            Global CTF Finals · Una guerra a gran escala en sistemas de
            telecomunicación crítica. Solo elite participa.
          </p>

          <div className="relative mt-6 flex flex-wrap items-end gap-6">
            <div className="grid grid-cols-3 gap-3 font-mono text-zinc-50">
              <CountdownCell value={hh} label="HORAS" />
              <CountdownCell value={mm} label="MIN" />
              <CountdownCell value={ss} label="SEG" />
            </div>
            <Link
              href="/arena/events/shadow/register"
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
            >
              <Crosshair size={14} /> Regístrate ahora
            </Link>
          </div>
        </article>

        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Estado del Sistema
            </span>
            <div className="mt-3 flex items-center gap-3">
              <Gauge size={20} className="text-emerald-400" />
              <div>
                <span className="text-sm font-semibold text-zinc-100">
                  Operativo
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Latencia 14ms · Carga 32%
                </p>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Recompensas Totales
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-zinc-50">
                $45,000
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                USD
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Distribución por equipos top 5 + premios individuales.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-zinc-100">
          Despliegues del mes
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {MONTH_OPS.map((op) => (
            <article
              key={op.id}
              className={
                op.available
                  ? "flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 transition hover:border-orange-500/30"
                  : "flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-950/60 px-5 py-4 opacity-50"
              }
            >
              <div className="flex items-center gap-4">
                <span className="rounded-md border border-orange-500/30 bg-orange-500/10 p-2 text-orange-400">
                  <Flag size={14} />
                </span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                    {op.eyebrow}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-zinc-100">
                    {op.title}
                  </h3>
                </div>
              </div>
              {op.available ? (
                <Link
                  href={`/arena/events/${op.id}/register`}
                  className={
                    op.cta === "Participar"
                      ? "inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                      : "inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 hover:border-orange-500/40"
                  }
                >
                  {op.cta} <ArrowRight size={12} />
                </Link>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                  {op.cta}
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-10 flex items-center justify-between border-t border-zinc-900 pt-5 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
        <span>OPS_LOG · 2026.05.MET.20</span>
        <Link href="/arena/library" className="text-orange-300 hover:text-orange-200">
          ARCHIVE →
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
