"use client";

import { useEffect, useState } from "react";
import { Medal, Shield, TrendingUp, Users } from "lucide-react";
import { leaderboard as leaderboardApi } from "@/lib/api";
import type { LeaderboardUser, LeaderboardTeam } from "@/lib/types";

type Tab = "users" | "teams";

export default function AdminScoreboardPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([leaderboardApi.users(), leaderboardApi.teams()])
      .then(([u, t]) => {
        setUsers(u);
        setTeams(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const RANK_COLOR = ["text-amber-400", "text-zinc-300", "text-orange-600"];

  return (
    <div className="px-10 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // SCOREBOARD Y RANKINGS
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            MARCADOR
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Clasificaciones en tiempo real por competidor y equipo.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
          {(["users", "teams"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                tab === t
                  ? "rounded-full bg-red-500 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-black"
                  : "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 hover:text-zinc-200"
              }
            >
              {t === "users" ? "Competidores" : "Equipos"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={14} />}
          label="Competidores"
          value={loading ? "…" : users.length.toString()}
        />
        <StatCard
          icon={<Shield size={14} />}
          label="Equipos"
          value={loading ? "…" : teams.length.toString()}
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          label="Líder (pts)"
          value={loading ? "…" : (users[0]?.points ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<Medal size={14} />}
          label="Equipo #1 (pts)"
          value={loading ? "…" : (teams[0]?.total_points ?? 0).toLocaleString()}
        />
      </div>

      <article className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="grid grid-cols-[56px_1fr_120px_120px] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          <span>#</span>
          <span>{tab === "users" ? "Competidor" : "Equipo"}</span>
          <span className="text-right">{tab === "users" ? "Soluciones" : "Miembros"}</span>
          <span className="text-right">Puntos</span>
        </header>

        {loading ? (
          <div className="py-16 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando rankings...
          </div>
        ) : tab === "users" ? (
          <ul>
            {users.map((u) => (
              <li
                key={u.user_id}
                className="grid grid-cols-[56px_1fr_120px_120px] items-center gap-4 border-b border-zinc-900/70 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <span
                  className={`font-display text-lg font-black ${RANK_COLOR[u.rank - 1] ?? "text-zinc-500"}`}
                >
                  {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `#${u.rank}`}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-50">{u.username}</p>
                  {u.team_name && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                      {u.team_name}
                    </p>
                  )}
                </div>
                <p className="text-right font-mono text-sm text-zinc-400">
                  {u.solves_count}
                </p>
                <p className="text-right font-mono text-sm font-bold text-emerald-300">
                  {u.points.toLocaleString()}
                </p>
              </li>
            ))}
            {users.length === 0 && (
              <li className="py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
                Sin datos de ranking
              </li>
            )}
          </ul>
        ) : (
          <ul>
            {teams.map((t) => (
              <li
                key={t.team_id}
                className="grid grid-cols-[56px_1fr_120px_120px] items-center gap-4 border-b border-zinc-900/70 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <span
                  className={`font-display text-lg font-black ${RANK_COLOR[t.rank - 1] ?? "text-zinc-500"}`}
                >
                  {t.rank <= 3 ? ["🥇", "🥈", "🥉"][t.rank - 1] : `#${t.rank}`}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-50">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {t.slug}
                  </p>
                </div>
                <p className="text-right font-mono text-sm text-zinc-400">
                  {t.member_count}
                </p>
                <p className="text-right font-mono text-sm font-bold text-emerald-300">
                  {t.total_points.toLocaleString()}
                </p>
              </li>
            ))}
            {teams.length === 0 && (
              <li className="py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
                Sin equipos registrados
              </li>
            )}
          </ul>
        )}
      </article>
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
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-2 font-display text-2xl font-black text-zinc-50">{value}</p>
    </article>
  );
}
