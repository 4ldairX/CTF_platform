"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Crosshair,
  GraduationCap,
  Layers,
  Mic,
  Search,
  ShieldCheck,
  Terminal,
  User,
} from "lucide-react";

const PATHS = [
  {
    id: "linux",
    title: "Fundamentos de Linux",
    subtitle: "Master the Terminal",
    progress: 65,
    icon: <Terminal size={16} />,
    cta: { label: "Resume Session", href: "/academy/courses/linux", primary: true },
  },
  {
    id: "redes",
    title: "Redes Ofensivas",
    subtitle: "Pivot, Tunnel, Persist",
    progress: 20,
    icon: <Crosshair size={16} />,
    cta: { label: "Continue Journey", href: "/academy/courses/redes", primary: false },
  },
];

export default function AcademyHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="px-10 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-50">
              The Academy
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Master the Theory.</p>
          </div>
        </header>

        {/* Learning Paths */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">Learning Paths</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              · Live Operations
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PATHS.map((p) => (
              <PathCard key={p.id} {...p} />
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    Criptografía Aplicada
                  </h3>
                  <p className="text-xs text-zinc-500">
                    0/8 Modules Completed · 4 Hours
                  </p>
                </div>
              </div>
              <Link
                href="/academy/courses/crypto"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200 hover:border-orange-500/40"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </section>

        {/* Recommended */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">
              Recommended Content
            </h2>
            <Link
              href="/academy/library"
              className="text-xs font-medium uppercase tracking-[0.18em] text-orange-400 hover:text-orange-300"
            >
              View All Archive →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
              <span className="relative inline-flex rounded-full bg-orange-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-950">
                Hot Topic
              </span>
              <h3 className="relative mt-4 text-2xl font-bold text-zinc-50">
                Advanced Intrusion Analysis 2024
              </h3>
              <p className="relative mt-2 max-w-md text-sm text-zinc-400">
                Deep dive into sophisticated threat actor techniques and how to
                neutralize them before they bypass the perimeter.
              </p>
              <Link
                href="/academy/library"
                className="relative mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 hover:text-orange-200"
              >
                Read More <ArrowRight size={14} />
              </Link>
            </article>

            <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex h-32 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-br from-amber-200 to-amber-400 text-amber-950">
                  <User size={22} />
                </div>
              </div>
              <h4 className="mt-4 text-sm font-semibold text-zinc-100">
                Exploiting Modern Web Architectures
              </h4>
              <p className="mt-1 text-xs text-zinc-500">Hosted by Maia Theme</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="flex items-center gap-4 border-b border-zinc-900 px-10 py-4">
      <div className="relative flex-1 max-w-2xl">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          placeholder="Search system network…"
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500/40 focus:outline-none"
        />
      </div>
      <button
        type="button"
        className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-400 hover:text-zinc-100"
      >
        <Bell size={14} />
      </button>
      <button
        type="button"
        className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-400 hover:text-zinc-100"
      >
        <Mic size={14} />
      </button>
      <Link
        href="/profile"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      >
        <User size={14} />
      </Link>
    </header>
  );
}

function PathCard({
  title,
  subtitle,
  progress,
  icon,
  cta,
}: {
  title: string;
  subtitle: string;
  progress: number;
  icon: React.ReactNode;
  cta: { label: string; href: string; primary: boolean };
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400">
            {icon}
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              {subtitle}
            </span>
            <h3 className="text-lg font-bold text-zinc-50">{title}</h3>
          </div>
        </div>
        <RingProgress value={progress} />
      </div>

      <div className="mt-6">
        {cta.primary ? (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
          >
            {cta.label}
          </Link>
        ) : (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 hover:text-orange-200"
          >
            {cta.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke="rgb(63 63 70 / 0.5)" strokeWidth="4" fill="transparent" />
        <circle
          cx="32"
          cy="32"
          r={r}
          stroke="rgb(255 91 58)"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative font-mono text-xs font-bold text-zinc-50">
        {value}%
      </span>
    </div>
  );
}
