"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Crosshair,
  KeyRound,
  Layers,
  Shield,
  ShieldHalf,
  Skull,
  Terminal,
  Trophy,
} from "lucide-react";

const PATHS = [
  {
    id: "offensive",
    title: "Offensive Security",
    badge: "ASCENDANT",
    progress: "Resume Path",
    icon: <Skull size={16} />,
    accent: "from-rose-600/40 via-orange-500/20 to-transparent",
  },
  {
    id: "defensive",
    title: "Defensive Ops",
    badge: "GUARDIAN",
    progress: "Continue Mission",
    icon: <ShieldHalf size={16} />,
    accent: "from-emerald-500/30 via-cyan-400/15 to-transparent",
  },
  {
    id: "crypto",
    title: "Cryptography",
    badge: "CIPHER",
    progress: "Enroll Now",
    icon: <KeyRound size={16} />,
    accent: "from-indigo-500/30 via-purple-400/15 to-transparent",
  },
];

const LABS = [
  {
    id: "titans",
    title: "TITANS FALL: BROKEN API",
    description:
      "Infiltrate the internal logistics API of Titan Corp. Exploitation of improper authentication headers required for flag retrieval.",
    diff: "EXTREME",
    points: 500,
    featured: true,
  },
  { id: "xss", title: "Cross-Site Alchemy", category: "WEB", points: 280 },
  { id: "scoreboard", title: "Top Ranking", category: "MISC", points: 120 },
  { id: "prime", title: "Prime Suspects", category: "CRYPTO", points: 250 },
  { id: "bof", title: "Buffer Overflow 101", category: "PWN", points: 180 },
];

export default function ArenaHomePage() {
  return (
    <div className="px-10 py-8">
      {/* Hero greeting */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-50">
            Bienvenido <span className="text-orange-400">En!gm@</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your tactical overview is ready. System status: nominal.
          </p>
        </div>
      </header>

      {/* Status strip */}
      <section className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
        <div className="flex items-center gap-2 rounded-md bg-zinc-900/60 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
            VPN Status
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            CONNECTED
          </span>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-md bg-zinc-900/60 px-4 py-2">
          <Terminal size={14} className="text-orange-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300">
            UBUNTU_PENTEST_V4
          </span>
          <span className="font-mono text-[10px] text-zinc-500">/ 10.10.20.42</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            uptime 00:18:42
          </span>
        </div>
        <Link
          href="/arena/library"
          className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
        >
          Open Shell
        </Link>
      </section>

      {/* Learning Paths */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Mission Briefings
            </span>
            <h2 className="mt-2 text-base font-semibold text-zinc-100">
              Learning Paths
            </h2>
          </div>
          <Link
            href="/arena/progress"
            className="text-xs font-medium uppercase tracking-[0.2em] text-orange-300 hover:text-orange-200"
          >
            View All Paths →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PATHS.map((p) => (
            <article
              key={p.id}
              className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${p.accent} opacity-80`}
              />
              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
                  {p.badge}
                </span>
                <span className="rounded-md border border-zinc-800 bg-zinc-950/60 p-1.5 text-zinc-300">
                  {p.icon}
                </span>
              </div>
              <h3 className="relative mt-4 text-lg font-bold text-zinc-50">
                {p.title}
              </h3>
              <p className="relative mt-1 text-xs text-zinc-400">
                Become a master of the discipline. Tactical exercises, AI mentor,
                hands-on labs.
              </p>
              <Link
                href={`/arena/library`}
                className="relative mt-5 inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                {p.progress}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* CTF Labs */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Tactical Operations
            </span>
            <h2 className="mt-2 text-base font-semibold text-zinc-100">CTF Labs</h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            <span>Filtering · NEWEST</span>
            <span>·</span>
            <span>Category · ALL</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          {LABS.map((l, i) =>
            l.featured ? (
              <article
                key={l.id}
                className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-zinc-900/40 p-6 lg:row-span-2"
              >
                <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
                <span className="relative inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-300">
                  <Activity size={10} /> Featured Mission · Newest
                </span>
                <h3 className="relative mt-4 text-3xl font-black tracking-tight text-zinc-50">
                  {l.title}
                </h3>
                <p className="relative mt-3 max-w-md text-sm text-zinc-400">
                  {l.description}
                </p>
                <div className="relative mt-6 flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-rose-400">
                    Difficulty · {l.diff}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    {l.points} pts
                  </span>
                </div>
                <Link
                  href={`/arena/library`}
                  className="relative mt-6 inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                >
                  <Crosshair size={14} /> Deploy Lab
                </Link>
              </article>
            ) : (
              <article
                key={l.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-orange-500/30"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
                  {l.category}
                </span>
                <h4 className="mt-2 text-sm font-semibold text-zinc-100">
                  {l.title}
                </h4>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  <span>{l.points} pts</span>
                  <span className="text-orange-300">Deploy →</span>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
