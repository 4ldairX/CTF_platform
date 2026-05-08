"use client";

import {
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  Lock,
  Medal,
  Shield,
  ShieldHalf,
  Sparkle,
  Star,
  Trophy,
  UserCheck,
  Zap,
} from "lucide-react";

const MEDALS = [
  { icon: <Trophy size={18} />, locked: false },
  { icon: <CheckCircle2 size={18} />, locked: false },
  { icon: <Medal size={18} />, locked: false },
  { icon: <Star size={18} />, locked: false },
  { icon: <Award size={18} />, locked: false },
  { icon: <Lock size={18} />, locked: true },
];

const FEED = [
  {
    icon: <Shield size={14} />,
    title: "Breach Neutralization // Sector 7",
    timestamp: "2 hours ago",
    body:
      "Successfully intercepted unauthorized lateral movement in the core database. 14 intrusion vectors terminated.",
  },
  {
    icon: <Zap size={14} />,
    title: "System Patch Deployment // Ver. 14.04",
    timestamp: "08:00",
    body:
      "Deployed security updates to node cluster. Node health verified at 100% across all 12 zones.",
  },
  {
    icon: <UserCheck size={14} />,
    title: "Session Initiated",
    timestamp: "Yesterday",
    body: "Remote session established via VPN-K9 from secure terminal.",
  },
];

export default function AdminProfilePage() {
  return (
    <div className="px-10 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // OPERATIVE STATUS: ACTIVE
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            PROFILE_0034
          </h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_-6px_rgba(239,68,68,0.6)] hover:bg-red-400">
          <Edit3 size={13} /> Edit Profile
        </button>
      </div>

      {/* Bento grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Identity card spans 2 cols */}
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-500/40 to-transparent" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[160px_1fr]">
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-br from-cyan-400/30 via-cyan-700/20 to-zinc-950 text-cyan-200">
              <Sparkle size={48} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Codename
              </span>
              <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-zinc-50">
                SHADOW_WALKER
              </h2>
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Encrypted Email
              </span>
              <p className="mt-1 font-mono text-sm text-zinc-300">
                s.walker@obsidian.internal
              </p>
              <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Bio / Tactical Profile
              </span>
              <p className="mt-1 max-w-md text-sm italic text-zinc-400">
                "Specialist in deep-packet inspection and kinetic
                neutralisation. Operating under zero-trace protocols since 2021.
                Tier 1 credential holder for obsidian-core systems."
              </p>
            </div>
          </div>
        </article>

        {/* LVL card */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Experience Progress
          </span>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-5xl font-black tracking-tight text-red-500">
              LVL 48
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Elite Operator
            </span>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[68%] bg-gradient-to-r from-red-500 to-amber-400" />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <span>12,800 XP</span>
            <span>18,000 XP</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-900 pt-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Global Rank
              </span>
              <p className="mt-1 font-display text-2xl font-bold text-zinc-50">
                #124
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Solved Challenges
              </span>
              <p className="mt-1 font-display text-2xl font-bold text-zinc-50">
                1,248
              </p>
            </div>
          </div>
        </article>

        {/* Achievement medals */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Achievement Medals
          </span>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {MEDALS.map((m, i) => (
              <div
                key={i}
                className={
                  m.locked
                    ? "flex aspect-square items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-700"
                    : "flex aspect-square items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300"
                }
              >
                {m.icon}
              </div>
            ))}
          </div>
        </article>

        {/* Tactical activity feed spans 2 cols */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 lg:col-span-2">
          <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Tactical Activity Feed
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
              98.2% SUCCESS RATE
            </span>
          </header>
          <ul>
            {FEED.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0"
              >
                <span className="mt-0.5 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-red-300">
                  {f.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-zinc-50">
                      {f.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                      <Clock size={10} /> {f.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
