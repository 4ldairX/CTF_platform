"use client";

import {
  Award,
  Bug,
  CheckCircle2,
  Edit3,
  Ghost,
  Lock,
  ShieldHalf,
  Sparkle,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";

const MEDALS = [
  { id: "first", label: "First Root", icon: <ShieldHalf size={18} /> },
  { id: "ghost", label: "Ghost", icon: <Ghost size={18} /> },
  { id: "top", label: "Top 1%", icon: <Star size={18} /> },
  { id: "locked", label: "Locked", icon: <Lock size={18} />, locked: true },
];

const SPECS = [
  { name: "Web Exploitation", value: 88 },
  { name: "Binary PWN", value: 64 },
  { name: "Cryptography", value: 92 },
];

const PERF_DAYS = [
  { d: "MON", v: 35 },
  { d: "TUE", v: 60 },
  { d: "WED", v: 48 },
  { d: "THU", v: 75 },
  { d: "FRI", v: 92 },
  { d: "SAT", v: 64 },
];

const LOGS = [
  {
    id: "1",
    title: "Rooted: Alpha_Node_4",
    category: "WEB EXPLOITATION · 12M AGO",
    state: "completed" as const,
    xp: 450,
    icon: <ShieldHalf size={14} />,
  },
  {
    id: "2",
    title: "Decrypted: RSA_Vault_X",
    category: "CRYPTOGRAPHY · 2H AGO",
    state: "completed" as const,
    xp: 800,
    icon: <Sparkle size={14} />,
  },
  {
    id: "3",
    title: "Debug: Kernel_Over_Flow",
    category: "PWN · 5H AGO",
    state: "failed" as const,
    xp: 0,
    icon: <Bug size={14} />,
  },
];

export default function ProfilePage() {
  return (
    <div className="px-10 py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Identity */}
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-500/40 to-transparent" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
            <div className="relative">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-br from-cyan-400/30 via-cyan-700/20 to-zinc-950">
                <Sparkle size={56} className="text-cyan-200" />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-red-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-950">
                LVL 42
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Operator Online
              </span>
              <h1 className="mt-3 font-display text-5xl font-black tracking-tight text-zinc-50">
                Enigma
              </h1>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Senior Security Architect specializing in cryptographic exploits
                and containerized node isolation.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400">
                  <Edit3 size={12} /> Edit Profile
                </button>
                <Stat label="XP" value="12,450" />
                <Stat label="Rank" value="ELITE" />
              </div>
            </div>
          </div>
        </article>

        {/* Medals */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Medals
            </span>
            <button className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400 hover:text-red-300">
              View All
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {MEDALS.map((m) => (
              <div
                key={m.id}
                className={
                  m.locked
                    ? "flex aspect-square flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-700"
                    : "flex aspect-square flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300"
                }
              >
                <span className={m.locked ? "text-zinc-600" : "text-red-300"}>
                  {m.icon}
                </span>
                <span
                  className={
                    m.locked
                      ? "mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-700"
                      : "mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-red-400"
                  }
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Operations Performance */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-50">
                Operations Performance
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Challenge Completion Velocity
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1 w-6 rounded-full bg-red-500" />
              <span className="h-1 w-6 rounded-full bg-zinc-700" />
              <span className="h-1 w-6 rounded-full bg-zinc-700" />
            </div>
          </div>

          <div className="mt-8 flex h-40 items-end gap-3">
            {PERF_DAYS.map((d) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-red-500/80 to-red-400"
                  style={{ height: `${d.v}%` }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                  {d.d}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Specialization */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-base font-bold text-zinc-50">Specialization Index</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Skill Point Allocation
          </span>

          <div className="mt-6 flex flex-col gap-4">
            {SPECS.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-300">
                    {s.name}
                  </span>
                  <span className="font-mono text-xs text-red-300">{s.value}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-zinc-400">
              Uptime consistent at{" "}
              <span className="font-bold text-zinc-100">99.98%</span> over last
              session cycle.
            </span>
          </div>
        </article>
      </div>

      {/* Engagement logs */}
      <article className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Recent Engagement Logs
          </h2>
          <button className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400 hover:text-red-300">
            EXPORT_JSON
          </button>
        </header>
        <ul>
          {LOGS.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0"
            >
              <span
                className={
                  l.state === "completed"
                    ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300"
                    : "rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300"
                }
              >
                {l.icon}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-zinc-50">{l.title}</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  {l.category}
                </span>
              </div>
              <div className="text-right">
                {l.state === "completed" ? (
                  <>
                    <span className="font-mono text-sm font-bold text-emerald-300">
                      +{l.xp} XP
                    </span>
                    <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
                      Completed
                    </p>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-sm font-bold text-rose-300">
                      Failed
                    </span>
                    <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
                      Retry in 01:24:02
                    </p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
        {label}
      </span>
      <p className="font-display text-sm font-bold text-zinc-50">{value}</p>
    </div>
  );
}
