"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Filter,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";
import { auth as authApi } from "@/lib/api";
import type { MyStats, MySubmission } from "@/lib/types";

type Filter = "ALL" | "CORRECT" | "WRONG";

const FILTERS: Filter[] = ["ALL", "CORRECT", "WRONG"];

const CATEGORY_LABEL: Record<string, string> = {
  web: "WEB",
  pwn: "PWN",
  crypto: "CRYPTO",
  forensics: "FORENSICS",
  reverse: "REVERSE",
  misc: "MISC",
  osint: "OSINT",
};

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function dateOf(iso: string): string {
  return new Date(iso).toLocaleDateString("es-BO");
}

export default function AuditPage() {
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [subs, st] = await Promise.all([
        authApi.mySubmissions(100),
        authApi.myStats(),
      ]);
      setSubmissions(subs);
      setStats(st);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter === "CORRECT" && !s.is_correct) return false;
    if (filter === "WRONG" && s.is_correct) return false;
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      s.challenge_title.toLowerCase().includes(q) ||
      s.challenge_category.toLowerCase().includes(q)
    );
  });

  const STATS = [
    {
      label: "Intentos",
      value: stats?.total_submissions.toString() ?? "0",
      icon: <Terminal size={14} />,
      accent: "text-zinc-300",
    },
    {
      label: "Resueltos",
      value: stats?.correct_submissions.toString() ?? "0",
      icon: <CheckCircle2 size={14} />,
      accent: "text-emerald-300",
    },
    {
      label: "Precisión",
      value: stats ? `${stats.accuracy}%` : "0%",
      icon: <Target size={14} />,
      accent: "text-cyan-300",
    },
    {
      label: "XP Total",
      value: stats?.points.toLocaleString() ?? "0",
      icon: <Zap size={14} />,
      accent: "text-orange-300",
    },
  ];

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // OPERATION_LOGS · MI ACTIVIDAD
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            AUDIT TRAIL
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Tu historial completo de operaciones — submissions correctas e incorrectas
            firmadas y verificadas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 hover:border-red-500/40 hover:text-red-300"
          >
            <RefreshCw size={12} /> Recargar
          </button>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
              STREAM_LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4"
          >
            <span className={`flex items-center gap-2 ${s.accent}`}>
              {s.icon}
              <span className="font-mono text-[10px] uppercase tracking-[0.32em]">
                {s.label}
              </span>
            </span>
            <p className="mt-2 font-display text-2xl font-black text-zinc-50">
              {loading ? "…" : s.value}
            </p>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2">
          <Search size={14} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep reto, categoría..."
            className="flex-1 bg-transparent font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "rounded-full bg-red-500 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-black"
                  : "rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 hover:text-zinc-200"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal feed */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
        <header className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              tail -f /var/log/cyberquest/operations.log
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <Lock size={11} /> SIGNED · SHA256
          </span>
        </header>

        {loading ? (
          <div className="px-5 py-16 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            // cargando registros...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            // {submissions.length === 0
              ? "No tienes operaciones registradas. ¡A romper retos!"
              : "No hay eventos que coincidan con el filtro"}
          </div>
        ) : (
          <ul className="font-mono text-xs">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[90px_72px_110px_1fr_80px] items-start gap-3 border-b border-zinc-900/80 px-5 py-3 last:border-b-0 hover:bg-red-500/5"
              >
                <span className="text-zinc-600">[{timeOf(s.submitted_at)}]</span>
                <SeverityPill correct={s.is_correct} />
                <span className="inline-flex items-center gap-1 uppercase tracking-[0.18em] text-zinc-500">
                  {CATEGORY_LABEL[s.challenge_category] ?? s.challenge_category}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-200">
                    {s.is_correct ? "Flag aceptada" : "Flag rechazada"} ·{" "}
                    {s.challenge_title}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                    submitted :: {dateOf(s.submitted_at)} · evt_id :: {s.id.slice(0, 8)}
                  </span>
                </div>
                <span
                  className={
                    s.is_correct
                      ? "text-right font-bold text-emerald-300"
                      : "text-right text-zinc-600"
                  }
                >
                  {s.is_correct ? `+${s.challenge_points}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <footer className="border-t border-zinc-900 bg-zinc-950 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          // showing {filtered.length} of {submissions.length} events
        </footer>
      </article>
    </div>
  );
}

function SeverityPill({ correct }: { correct: boolean }) {
  return correct ? (
    <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-emerald-300">
      <CheckCircle2 size={10} /> SOLVED
    </span>
  ) : (
    <span className="inline-flex w-fit items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-rose-300">
      <XCircle size={10} /> FAIL
    </span>
  );
}
