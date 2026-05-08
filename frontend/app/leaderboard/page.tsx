"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Filter,
  Flame,
  Medal,
  Search,
  ShieldHalf,
  Sparkle,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

const PODIUM = [
  {
    rank: 2,
    name: "v0id_walker",
    xp: 18420,
    rank_title: "ELITE",
    color: "from-zinc-300 to-zinc-500",
    height: "h-32",
  },
  {
    rank: 1,
    name: "Enigma",
    xp: 21980,
    rank_title: "LEGEND",
    color: "from-amber-300 to-amber-500",
    height: "h-44",
  },
  {
    rank: 3,
    name: "n3on_phantom",
    xp: 16210,
    rank_title: "ELITE",
    color: "from-orange-400 to-rose-500",
    height: "h-24",
  },
];

const ROWS = [
  {
    rank: 4,
    name: "kr4ken",
    xp: 14_980,
    rank_title: "VETERAN",
    streak: 12,
    delta: +2,
    flag: "🇧🇴",
  },
  {
    rank: 5,
    name: "hex_lordie",
    xp: 13_560,
    rank_title: "VETERAN",
    streak: 7,
    delta: -1,
    flag: "🇦🇷",
  },
  {
    rank: 6,
    name: "nullbyte_a1",
    xp: 12_840,
    rank_title: "VETERAN",
    streak: 5,
    delta: +4,
    flag: "🇧🇴",
  },
  {
    rank: 7,
    name: "ghostroot",
    xp: 11_920,
    rank_title: "OPERATIVE",
    streak: 3,
    delta: 0,
    flag: "🇨🇱",
  },
  {
    rank: 8,
    name: "bin_ripper",
    xp: 10_770,
    rank_title: "OPERATIVE",
    streak: 9,
    delta: -2,
    flag: "🇲🇽",
  },
  {
    rank: 9,
    name: "ze4l0t_x",
    xp: 9_640,
    rank_title: "OPERATIVE",
    streak: 2,
    delta: +1,
    flag: "🇧🇴",
  },
  {
    rank: 10,
    name: "0xscarred",
    xp: 8_250,
    rank_title: "RECRUIT",
    streak: 1,
    delta: -3,
    flag: "🇵🇪",
  },
];

const TABS = ["WEEKLY", "MONTHLY", "ALL-TIME"] as const;

export default function LeaderboardPage() {
  const [active, setActive] = useState<(typeof TABS)[number]>("WEEKLY");
  const [query, setQuery] = useState("");

  const filtered = ROWS.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // GLOBAL LEADERBOARD
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            TOP OPERATORS
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Ranking en tiempo real basado en XP, racha de retos y velocidad de
            captura de banderas.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                active === t
                  ? "rounded-full bg-red-500 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-black"
                  : "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 hover:text-zinc-200"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 via-red-500 to-rose-600" />
          <div className="absolute inset-0 cq-bg-grid opacity-10" />

          <div className="relative flex items-end justify-center gap-4 pt-4">
            {PODIUM.map((p) => (
              <div
                key={p.rank}
                className="flex w-1/3 flex-col items-center"
              >
                <div className="relative">
                  {p.rank === 1 && (
                    <Crown
                      size={22}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-300"
                    />
                  )}
                  <div
                    className={
                      p.rank === 1
                        ? "flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-300/30 via-amber-500/10 to-zinc-950 text-amber-200"
                        : p.rank === 2
                        ? "flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-400 bg-gradient-to-br from-zinc-300/20 to-zinc-900 text-zinc-200"
                        : "flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-400 bg-gradient-to-br from-orange-400/20 to-rose-700/20 text-orange-200"
                    }
                  >
                    <Sparkle size={p.rank === 1 ? 28 : 22} />
                  </div>
                </div>
                <h3
                  className={
                    p.rank === 1
                      ? "mt-3 font-display text-xl font-black text-zinc-50"
                      : "mt-3 font-display text-base font-bold text-zinc-100"
                  }
                >
                  {p.name}
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
                  {p.rank_title}
                </span>
                <span className="mt-1 font-mono text-xs text-red-300">
                  {p.xp.toLocaleString()} XP
                </span>

                <div
                  className={`mt-3 w-full rounded-t-md bg-gradient-to-t ${p.color} ${p.height} relative`}
                >
                  <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-black text-zinc-950/80">
                    {p.rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Side stats */}
        <div className="flex flex-col gap-3">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Tu posición
              </span>
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-red-300">
                Rank #1
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-500/10 text-amber-200">
                <Sparkle size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-50">
                  Enigma
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  21,980 XP · LEGEND
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <SmallStat icon={<Flame size={12} />} label="Streak" value="14d" />
              <SmallStat icon={<Target size={12} />} label="Solved" value="312" />
              <SmallStat
                icon={<TrendingUp size={12} />}
                label="Δ Week"
                value="+540"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Resumen del periodo
            </span>
            <div className="mt-3 space-y-3">
              <Row label="Operadores activos" value="1,284" icon={<ShieldHalf size={12} />} />
              <Row label="Banderas capturadas" value="9,422" icon={<Trophy size={12} />} />
              <Row label="XP repartido" value="2.1M" icon={<Star size={12} />} />
            </div>
          </article>
        </div>
      </section>

      {/* Search + filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2">
          <Search size={14} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar operador..."
            className="flex-1 bg-transparent font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
          <Filter size={12} /> Filtros
        </button>
      </div>

      {/* Table */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="grid grid-cols-[60px_1fr_120px_100px_100px_60px] items-center gap-3 border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Rank</span>
          <span>Operator</span>
          <span>XP</span>
          <span>Streak</span>
          <span>Tier</span>
          <span className="text-right">Δ</span>
        </header>
        <ul>
          {filtered.map((r) => (
            <li
              key={r.rank}
              className="grid grid-cols-[60px_1fr_120px_100px_100px_60px] items-center gap-3 border-b border-zinc-900/80 px-6 py-3 last:border-b-0 hover:bg-red-500/5"
            >
              <span className="font-mono text-sm font-bold text-zinc-200">
                #{r.rank}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                  <Sparkle size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-50">{r.name}</h4>
                  <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-600">
                    {r.flag} OPERATOR_ID:{String(r.rank).padStart(4, "0")}
                  </span>
                </div>
              </div>
              <span className="font-mono text-sm text-red-300">
                {r.xp.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-300">
                <Flame size={12} /> {r.streak}d
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
                {r.rank_title}
              </span>
              <span className="flex items-center justify-end gap-1 font-mono text-xs">
                {r.delta > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-300">
                    <ArrowUp size={12} />
                    {r.delta}
                  </span>
                )}
                {r.delta < 0 && (
                  <span className="inline-flex items-center gap-0.5 text-rose-300">
                    <ArrowDown size={12} />
                    {Math.abs(r.delta)}
                  </span>
                )}
                {r.delta === 0 && <span className="text-zinc-600">—</span>}
              </span>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            // No operator matches "{query}"
          </div>
        )}
      </article>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
        // Snapshot updated · {active} cycle · {filtered.length + 3} operators in
        view
      </p>
    </div>
  );
}

function SmallStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-2">
      <span className="flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-1 font-display text-sm font-bold text-zinc-50">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-950/40 px-3 py-2">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <span className="font-mono text-sm font-bold text-zinc-50">{value}</span>
    </div>
  );
}
