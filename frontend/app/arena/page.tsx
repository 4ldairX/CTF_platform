"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import {
  auth as authApi,
  challenges as challengesApi,
  teams as teamsApi,
  leaderboard as leaderboardApi,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  ChallengeOut,
  LeaderboardUser,
  MyStats,
  MySubmission,
  TeamDetailOut,
} from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  pwn: "Pwn",
  crypto: "Cripto",
  reverse: "Reversing",
  forensics: "Forense",
  misc: "Misc",
  osint: "OSINT",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
  insane: "Insano",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-orange-400",
  insane: "text-rose-400",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function ArenaHomePage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeOut[]>([]);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [team, setTeam] = useState<TeamDetailOut | null>(null);
  const [rank, setRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      challengesApi.list(),
      authApi.myStats().catch(() => null),
      authApi.mySubmissions(10).catch(() => []),
      teamsApi.myTeam().catch(() => null),
      leaderboardApi.users().catch(() => []),
    ])
      .then(([ch, st, subs, t, lb]) => {
        setChallenges(ch);
        setStats(st);
        setSubmissions(subs);
        setTeam(t);
        const me = lb.find((u) => u.user_id === user?.id);
        setRank(me ?? null);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const featured = challenges.filter((c) => c.is_featured).slice(0, 3);
  const recent = submissions.slice(0, 5);
  const displayName = user?.display_name ?? user?.username ?? "Competidor";

  return (
    <div className="px-10 py-8">
      {/* Hero */}
      <header className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-orange-950/20 p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Bienvenido de vuelta
            </span>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
              Hola, <span className="text-orange-400">{displayName}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              {rank
                ? `Estás en el puesto #${rank.rank} de la clasificación global. ¡Sigue resolviendo retos para subir!`
                : "Empieza tu camino resolviendo tu primer reto."}
            </p>
          </div>
          <Link
            href="/arena/challenges"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
          >
            Ver retos <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Stat cards */}
      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Trophy size={16} className="text-amber-400" />}
          label="Puntos totales"
          value={loading ? "…" : (stats?.points ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<CheckCircle2 size={16} className="text-emerald-400" />}
          label="Retos resueltos"
          value={loading ? "…" : (stats?.correct_submissions ?? 0).toString()}
        />
        <StatCard
          icon={<Target size={16} className="text-cyan-400" />}
          label="Precisión"
          value={loading ? "…" : `${stats?.accuracy ?? 0}%`}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-orange-400" />}
          label="Ranking global"
          value={loading ? "…" : rank ? `#${rank.rank}` : "—"}
        />
      </section>

      {/* Two-column main */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left: featured + recent activity */}
        <div className="flex flex-col gap-6">
          {/* Featured challenges */}
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
                  <Flame size={11} /> Retos destacados
                </span>
                <h2 className="mt-1 text-lg font-bold text-zinc-100">
                  Empieza por aquí
                </h2>
              </div>
              <Link
                href="/arena/challenges"
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-300 hover:text-orange-200"
              >
                Ver todos →
              </Link>
            </div>

            {loading ? (
              <div className="mt-4 flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-zinc-500" />
              </div>
            ) : featured.length === 0 ? (
              <p className="mt-4 py-8 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                No hay retos destacados por ahora
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {featured.map((c) => (
                  <Link
                    key={c.id}
                    href={`/arena/challenges/${c.id}`}
                    className="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-orange-500/40"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-300">
                      {CATEGORY_LABEL[c.category] ?? c.category}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-zinc-100 group-hover:text-orange-300">
                      {c.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {c.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                      <span className={DIFFICULTY_COLOR[c.difficulty] ?? "text-zinc-400"}>
                        {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
                      </span>
                      <span className="text-zinc-300">{c.points} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          {/* Recent activity */}
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
                Actividad reciente
              </h2>
              <Link
                href="/audit"
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-300 hover:text-orange-200"
              >
                Ver historial →
              </Link>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-zinc-500" />
              </div>
            ) : recent.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles size={20} className="mx-auto mb-2 text-zinc-700" />
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                  Aún no tienes envíos. ¡Resuelve tu primer reto!
                </p>
                <Link
                  href="/arena/challenges"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                >
                  Explorar retos <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <ul>
                {recent.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-4 border-b border-zinc-900/80 px-6 py-3 last:border-b-0"
                  >
                    <span
                      className={
                        s.is_correct
                          ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-300"
                          : "rounded-md border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300"
                      }
                    >
                      {s.is_correct ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                    </span>
                    <Link
                      href={`/arena/challenges/${s.challenge_id}`}
                      className="flex-1 truncate text-sm text-zinc-200 hover:text-orange-300"
                    >
                      {s.is_correct ? "Resolviste" : "Intento fallido en"}{" "}
                      <span className="font-bold">{s.challenge_title}</span>
                    </Link>
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                      {relativeTime(s.submitted_at)}
                    </span>
                    {s.is_correct && (
                      <span className="font-mono text-xs font-bold text-emerald-300">
                        +{s.challenge_points}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        {/* Right: team + quick info */}
        <div className="flex flex-col gap-6">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              <Users size={14} className="text-orange-400" /> Mi equipo
            </h2>

            {loading ? (
              <div className="mt-4 flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-zinc-500" />
              </div>
            ) : team ? (
              <div className="mt-4">
                <h3 className="font-display text-xl font-black uppercase text-zinc-50">
                  {team.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {team.member_count}{" "}
                  {team.member_count === 1 ? "miembro" : "miembros"} ·{" "}
                  {team.total_points.toLocaleString()} pts
                </p>
                <Link
                  href="/arena/teams"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
                >
                  Ver equipo <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 py-6 text-center">
                <Users size={24} className="text-zinc-700" />
                <p className="text-xs text-zinc-500">
                  Aún no perteneces a un equipo
                </p>
                <Link
                  href="/arena/teams"
                  className="rounded-full bg-orange-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                >
                  Unirme o crear equipo
                </Link>
              </div>
            )}
          </article>

          {/* Quick stats card */}
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              Atajos
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              <QuickLink href="/arena/challenges" label="Catálogo de retos" />
              <QuickLink href="/arena/progress" label="Mi progreso" />
              <QuickLink href="/leaderboard" label="Clasificación" />
              <QuickLink href="/arena/events" label="Eventos CTF" />
              <QuickLink href="/profile" label="Mi perfil" />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-2 font-display text-3xl font-black text-zinc-50">
        {value}
      </p>
    </article>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-300"
    >
      {label}
      <ArrowRight size={12} />
    </Link>
  );
}
