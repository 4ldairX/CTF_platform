"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Filter,
  Lock,
  Search,
  Server,
  ShieldAlert,
  Terminal,
  Zap,
} from "lucide-react";

type Severity = "INFO" | "WARN" | "ERROR" | "CRIT";
type LogEntry = {
  id: string;
  timestamp: string;
  severity: Severity;
  source: string;
  message: string;
  user?: string;
};

const LOGS: LogEntry[] = [
  {
    id: "0001",
    timestamp: "12:42:01",
    severity: "INFO",
    source: "AUTH",
    message: "Operator 'Enigma' authenticated via MFA challenge.",
    user: "enigma",
  },
  {
    id: "0002",
    timestamp: "12:41:33",
    severity: "INFO",
    source: "VPN",
    message: "Tunnel UBUNTU_PENTEST_V4 established · 10.10.42.18 → 51ms RTT.",
    user: "enigma",
  },
  {
    id: "0003",
    timestamp: "12:38:12",
    severity: "WARN",
    source: "FW",
    message: "Egress rate-limit triggered on lab-net :: 4,820 req/s (threshold 4,500).",
  },
  {
    id: "0004",
    timestamp: "12:35:50",
    severity: "ERROR",
    source: "SCORE",
    message: "Submission rejected — flag format mismatch in challenge GHOST_SHELL_V2.",
    user: "kr4ken",
  },
  {
    id: "0005",
    timestamp: "12:30:21",
    severity: "CRIT",
    source: "INTRUSION",
    message: "Unauthorized SSH attempt detected from 198.51.100.42 (5 retries).",
  },
  {
    id: "0006",
    timestamp: "12:24:09",
    severity: "INFO",
    source: "CHALLENGE",
    message: "Challenge ALPHA_NODE_4 booted on container alpha-node-04.",
  },
  {
    id: "0007",
    timestamp: "12:18:44",
    severity: "WARN",
    source: "HW",
    message: "GPU thermal slope rising · node-7 currently at 74°C.",
  },
  {
    id: "0008",
    timestamp: "12:11:02",
    severity: "INFO",
    source: "CHALLENGE",
    message: "Operator 'n3on_phantom' captured flag CRYPTO::RSA_VAULT_X (+800 XP).",
    user: "n3on_phantom",
  },
  {
    id: "0009",
    timestamp: "12:04:51",
    severity: "ERROR",
    source: "API",
    message: "Health probe failed for /v1/scoreboard — gateway 502 (auto-retry).",
  },
  {
    id: "0010",
    timestamp: "11:58:30",
    severity: "INFO",
    source: "SYS",
    message: "Periodic snapshot saved · 1.2GB · vault://snapshots/2026-05-07.tar.zst.",
  },
];

const FILTERS: Array<"ALL" | Severity> = ["ALL", "INFO", "WARN", "ERROR", "CRIT"];

const STATS = [
  {
    label: "Eventos · 24h",
    value: "12,480",
    icon: <Terminal size={14} />,
    accent: "text-zinc-300",
  },
  {
    label: "Alertas",
    value: "32",
    icon: <ShieldAlert size={14} />,
    accent: "text-amber-300",
  },
  {
    label: "Críticos",
    value: "3",
    icon: <Zap size={14} />,
    accent: "text-rose-300",
  },
  {
    label: "Uptime",
    value: "99.98%",
    icon: <Server size={14} />,
    accent: "text-emerald-300",
  },
];

export default function AuditPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");

  const filtered = LOGS.filter((l) => {
    const matchesFilter = filter === "ALL" || l.severity === filter;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      l.message.toLowerCase().includes(q) ||
      l.source.toLowerCase().includes(q) ||
      (l.user ?? "").toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // SYSTEM_LOGS · LIVE_FEED
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            AUDIT TRAIL
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Eventos firmados criptográficamente — autenticación, retos,
            infraestructura y reglas de seguridad.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
            STREAM_LIVE
          </span>
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
              {s.value}
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
            placeholder="grep events, sources, operators..."
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
        <button className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
          <Filter size={12} /> Avanzado
        </button>
      </div>

      {/* Terminal feed */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
        <header className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              tail -f /var/log/cyberquest/audit.log
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <Lock size={11} /> SIGNED · ED25519
          </span>
        </header>

        <ul className="font-mono text-xs">
          {filtered.map((l) => (
            <li
              key={l.id}
              className="grid grid-cols-[80px_70px_110px_1fr] items-start gap-3 border-b border-zinc-900/80 px-5 py-3 last:border-b-0 hover:bg-red-500/5"
            >
              <span className="text-zinc-600">[{l.timestamp}]</span>
              <SeverityPill severity={l.severity} />
              <span className="inline-flex items-center gap-1 text-zinc-500">
                <Cpu size={10} /> {l.source}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-200">{l.message}</span>
                {l.user && (
                  <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                    actor :: {l.user} · evt_id :: {l.id}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            // No events match current filter
          </div>
        )}

        <footer className="border-t border-zinc-900 bg-zinc-950 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          // showing {filtered.length} of {LOGS.length} events · stream paused
          for review
        </footer>
      </article>
    </div>
  );
}

function SeverityPill({ severity }: { severity: Severity }) {
  const map: Record<
    Severity,
    { cls: string; icon: React.ReactNode }
  > = {
    INFO: {
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      icon: <CheckCircle2 size={10} />,
    },
    WARN: {
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      icon: <AlertTriangle size={10} />,
    },
    ERROR: {
      cls: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      icon: <ShieldAlert size={10} />,
    },
    CRIT: {
      cls: "border-red-500/40 bg-red-500/20 text-red-300",
      icon: <Zap size={10} />,
    },
  };
  const m = map[severity];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] ${m.cls}`}
    >
      {m.icon} {severity}
    </span>
  );
}
