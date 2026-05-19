"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Crown,
  Loader2,
  Medal,
  Search,
  ShieldHalf,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { leaderboard as leaderboardApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { LeaderboardUser, LeaderboardTeam } from "@/lib/types";

type TabId = "USERS" | "TEAMS";

const TABS: { id: TabId; label: string }[] = [
  { id: "USERS", label: "Jugadores" },
  { id: "TEAMS", label: "Equipos" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [active, setActive] = useState<TabId>("USERS");
  const [query, setQuery] = useState("");
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

  const filteredUsers = users.filter((r) =>
    r.username.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredTeams = teams.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()),
  );

  const myRank = users.find((u) => u.user_id === user?.id);
  const totalSolves = users.reduce((a, u) => a + u.solves_count, 0);
  const totalPoints = users.reduce((a, u) => a + u.points, 0);

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Clasificación global
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Mejores jugadores
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Ranking actualizado según los puntos obtenidos al resolver retos.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={
                active === t.id
                  ? "rounded-full bg-orange-500 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-black"
                  : "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 hover:text-zinc-200"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="mt-16 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              icon={<Users size={14} />}
              label="Jugadores"
              value={users.length.toString()}
            />
            <SummaryCard
              icon={<ShieldHalf size={14} />}
              label="Equipos"
              value={teams.length.toString()}
            />
            <SummaryCard
              icon={<Target size={14} />}
              label="Retos resueltos"
              value={totalSolves.toString()}
            />
            <SummaryCard
              icon={<Star size={14} />}
              label="Puntos otorgados"
              value={totalPoints.toLocaleString()}
            />
          </section>

          {/* Top 3 highlights (only show when there are enough users with points) */}
          {active === "USERS" && users.length >= 3 && users[0].points > 0 && (
            <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              {users.slice(0, 3).map((u, i) => (
                <TopCard
                  key={u.user_id}
                  rank={u.rank}
                  name={u.username}
                  points={u.points}
                  solves={u.solves_count}
                  team={u.team_name}
                  isMe={u.user_id === user?.id}
                />
              ))}
            </section>
          )}

          {/* "Tu posición" pill */}
          {active === "USERS" && myRank && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/5 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/20 font-mono text-xs font-bold text-orange-300">
                  #{myRank.rank}
                </span>
                <div>
                  <p className="text-sm font-bold text-zinc-50">
                    Tu posición es <span className="text-orange-300">#{myRank.rank}</span>
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {myRank.points.toLocaleString()} pts · {myRank.solves_count} retos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mt-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2">
            <Search size={14} className="text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                active === "USERS"
                  ? "Buscar jugador..."
                  : "Buscar equipo..."
              }
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          {/* Table */}
          {active === "USERS" ? (
            <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <header className="grid grid-cols-[60px_1fr_120px_120px_140px] items-center gap-3 border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                <span>Pos</span>
                <span>Jugador</span>
                <span className="text-right">Puntos</span>
                <span className="text-right">Resueltos</span>
                <span>Equipo</span>
              </header>
              <ul>
                {filteredUsers.map((r) => (
                  <li
                    key={r.user_id}
                    className={
                      r.user_id === user?.id
                        ? "grid grid-cols-[60px_1fr_120px_120px_140px] items-center gap-3 border-b border-zinc-900/80 bg-orange-500/5 px-6 py-3 last:border-b-0"
                        : "grid grid-cols-[60px_1fr_120px_120px_140px] items-center gap-3 border-b border-zinc-900/80 px-6 py-3 last:border-b-0 hover:bg-zinc-900/40"
                    }
                  >
                    <RankCell rank={r.rank} />
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-[10px] font-bold text-white">
                        {r.username.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-50">
                          {r.username}
                        </span>
                        {r.user_id === user?.id && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-orange-300">
                            Tú
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-right font-mono text-sm font-bold text-orange-300">
                      {r.points.toLocaleString()}
                    </span>
                    <span className="text-right font-mono text-xs text-zinc-300">
                      {r.solves_count}
                    </span>
                    <span className="truncate font-mono text-[11px] text-zinc-500">
                      {r.team_name ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
              {filteredUsers.length === 0 && (
                <div className="px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
                  {query
                    ? `Ningún jugador coincide con "${query}"`
                    : "Sin jugadores registrados"}
                </div>
              )}
              <footer className="border-t border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "jugador" : "jugadores"}
              </footer>
            </article>
          ) : (
            <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <header className="grid grid-cols-[60px_1fr_120px_120px] items-center gap-3 border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                <span>Pos</span>
                <span>Equipo</span>
                <span className="text-right">Puntos</span>
                <span className="text-right">Miembros</span>
              </header>
              <ul>
                {filteredTeams.map((t) => (
                  <li
                    key={t.team_id}
                    className="grid grid-cols-[60px_1fr_120px_120px] items-center gap-3 border-b border-zinc-900/80 px-6 py-3 last:border-b-0 hover:bg-zinc-900/40"
                  >
                    <RankCell rank={t.rank} />
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                        <ShieldHalf size={14} />
                      </span>
                      <div>
                        <span className="text-sm font-bold text-zinc-50">
                          {t.name}
                        </span>
                        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
                          {t.slug}
                        </p>
                      </div>
                    </div>
                    <span className="text-right font-mono text-sm font-bold text-orange-300">
                      {t.total_points.toLocaleString()}
                    </span>
                    <span className="text-right font-mono text-xs text-zinc-300">
                      {t.member_count}
                    </span>
                  </li>
                ))}
              </ul>
              {filteredTeams.length === 0 && (
                <div className="px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
                  {query
                    ? `Ningún equipo coincide con "${query}"`
                    : "Sin equipos registrados"}
                </div>
              )}
              <footer className="border-t border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                {filteredTeams.length}{" "}
                {filteredTeams.length === 1 ? "equipo" : "equipos"}
              </footer>
            </article>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
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
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-2 font-display text-2xl font-black text-zinc-50">
        {value}
      </p>
    </article>
  );
}

function TopCard({
  rank,
  name,
  points,
  solves,
  team,
  isMe,
}: {
  rank: number;
  name: string;
  points: number;
  solves: number;
  team: string | null;
  isMe: boolean;
}) {
  const meta =
    rank === 1
      ? { icon: <Crown size={18} />, border: "border-amber-400/40", bg: "bg-amber-500/10", text: "text-amber-300" }
      : rank === 2
        ? { icon: <Medal size={18} />, border: "border-zinc-400/40", bg: "bg-zinc-500/10", text: "text-zinc-300" }
        : { icon: <Award size={18} />, border: "border-orange-600/40", bg: "bg-orange-700/10", text: "text-orange-400" };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${meta.border} bg-zinc-900/40 p-5 ${isMe ? "ring-1 ring-orange-500/40" : ""}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${meta.bg} ${meta.text}`}
        >
          {meta.icon}
        </span>
        <span className="font-display text-3xl font-black text-zinc-700">
          #{rank}
        </span>
      </div>
      <h3 className="mt-3 truncate font-display text-lg font-bold text-zinc-50">
        {name}
      </h3>
      {team && (
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          {team}
        </p>
      )}
      {isMe && (
        <span className="mt-2 inline-block rounded-full bg-orange-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-orange-300">
          Tu posición
        </span>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
            Puntos
          </p>
          <p className="font-mono text-sm font-bold text-orange-300">
            {points.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
            Resueltos
          </p>
          <p className="font-mono text-sm font-bold text-zinc-200">{solves}</p>
        </div>
      </div>
    </article>
  );
}

function RankCell({ rank }: { rank: number }) {
  const cls =
    rank === 1
      ? "text-amber-400"
      : rank === 2
        ? "text-zinc-300"
        : rank === 3
          ? "text-orange-600"
          : "text-zinc-500";
  return (
    <span className={`font-mono text-sm font-bold ${cls}`}>
      {rank <= 3 ? (
        <span className="inline-flex items-center gap-1">
          {rank === 1 ? <Trophy size={12} /> : null}#{rank}
        </span>
      ) : (
        `#${rank}`
      )}
    </span>
  );
}
