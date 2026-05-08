"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Filter,
  Search,
  Skull,
  Trash2,
  X,
} from "lucide-react";

type Team = {
  id: string;
  name: string;
  invite: string;
  members: number;
  cap: number;
  points: number;
  status: "ACTIVE" | "INACTIVE";
  emblem: string;
};

const TEAMS: Team[] = [
  {
    id: "t1",
    name: "Shadow Reapers",
    invite: "CQ-SHDW-2024",
    members: 5,
    cap: 5,
    points: 12_450,
    status: "ACTIVE",
    emblem: "from-rose-500 to-red-900",
  },
  {
    id: "t2",
    name: "Neural Net",
    invite: "CQ-NET-9912",
    members: 3,
    cap: 5,
    points: 8_120,
    status: "INACTIVE",
    emblem: "from-zinc-500 to-zinc-900",
  },
  {
    id: "t3",
    name: "Void Walkers",
    invite: "CQ-VOID-0001",
    members: 4,
    cap: 5,
    points: 15_900,
    status: "ACTIVE",
    emblem: "from-cyan-400 to-zinc-900",
  },
  {
    id: "t4",
    name: "Aegis Prime",
    invite: "CQ-AEGS-X99",
    members: 5,
    cap: 5,
    points: 6_430,
    status: "ACTIVE",
    emblem: "from-amber-400 to-rose-700",
  },
];

export default function AdminTeamsPage() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Team | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const filtered = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const canDissolve = confirmText.trim().toUpperCase() === "CONFIRMAR";

  function handleDissolve() {
    if (!canDissolve || !target) return;
    console.info("[OBSIDIAN.ADMIN] Equipo disuelto", target.name);
    setTarget(null);
    setConfirmText("");
  }

  return (
    <div className="px-10 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em]">
            <span className="text-zinc-500">ADMIN</span>
            <ChevronRight size={11} className="text-zinc-700" />
            <span className="text-red-400">CONTROL DE EQUIPOS</span>
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50">
            Coordinación de Equipos
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Total Teams" value="128" delta="+12%" />
        <StatCard label="Active Competitors" value="1,024" delta="+5.2%" />
        <StatCard label="Avg Score" value="856" suffix="pts / team" />
      </div>

      {/* Listado */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 px-6 py-4">
          <h2 className="text-base font-bold text-zinc-50">
            Listado General de Equipos
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
              <Search size={12} className="text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-44 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
              <Filter size={12} /> Filter
            </button>
          </div>
        </header>

        <div className="grid grid-cols-[2fr_1.4fr_0.7fr_1.2fr_0.9fr_0.7fr] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Team Name</span>
          <span>Invitation Code</span>
          <span>Members</span>
          <span>Accumulated Points</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <ul>
          {filtered.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[2fr_1.4fr_0.7fr_1.2fr_0.9fr_0.7fr] items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.emblem} text-zinc-50`}
                >
                  <Skull size={14} />
                </div>
                <h4 className="text-sm font-bold text-zinc-50">{t.name}</h4>
              </div>
              <span className="inline-flex w-fit rounded-md bg-red-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-red-300">
                {t.invite}
              </span>
              <span className="font-mono text-xs text-zinc-300">
                {t.members} <span className="text-zinc-600">/ {t.cap}</span>
              </span>
              <span className="font-mono text-sm font-bold text-zinc-50">
                {t.points.toLocaleString()}
              </span>
              <StatusPill status={t.status} />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setTarget(t)}
                  aria-label="Disolver equipo"
                  className="rounded-md border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
              // Sin equipos para el filtro actual
            </li>
          )}
        </ul>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Showing {filtered.length} of 128 teams
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-100">
              Previous
            </button>
            <button className="rounded-full bg-red-500 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:bg-red-400">
              Next
            </button>
          </div>
        </footer>
      </article>

      {/* Confirmation modal */}
      {target && (
        <DissolveModal
          team={target}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          canDissolve={canDissolve}
          onCancel={() => {
            setTarget(null);
            setConfirmText("");
          }}
          onConfirm={handleDissolve}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  suffix,
}: {
  label: string;
  value: string;
  delta?: string;
  suffix?: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
      <div className="absolute -right-12 top-0 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
      <span className="relative font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
        {label}
      </span>
      <div className="relative mt-3 flex items-end gap-2">
        <span className="font-display text-4xl font-black tracking-tight text-zinc-50">
          {value}
        </span>
        {delta && (
          <span className="pb-1 font-mono text-xs text-emerald-400">
            ↗{delta}
          </span>
        )}
        {suffix && (
          <span className="pb-1 font-mono text-xs text-zinc-500">{suffix}</span>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> Inactive
    </span>
  );
}

function DissolveModal({
  team,
  confirmText,
  setConfirmText,
  canDissolve,
  onCancel,
  onConfirm,
}: {
  team: Team;
  confirmText: string;
  setConfirmText: (v: string) => void;
  canDissolve: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-zinc-950 shadow-[0_0_60px_-12px_rgba(239,68,68,0.4)]">
        <button
          onClick={onCancel}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-md p-1 text-zinc-500 hover:text-zinc-100"
        >
          <X size={14} />
        </button>

        <div className="px-7 pb-6 pt-7">
          <div className="inline-flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1">
            <AlertTriangle size={11} className="text-red-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-red-300">
              Security Protocol HU-10
            </span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-black uppercase leading-tight tracking-tight text-zinc-50">
            CONFIRMACIÓN CRÍTICA:
            <br />
            DISOLUCIÓN DE EQUIPO
          </h2>

          <div className="mt-4 border-l-2 border-red-500 bg-red-500/5 px-4 py-3">
            <p className="text-sm leading-relaxed text-zinc-300">
              Esta acción es{" "}
              <span className="font-bold text-red-300">irreversible</span>. Al
              disolver el equipo{" "}
              <span className="font-bold text-zinc-50">{team.name}</span>, se
              liberará el nombre del equipo y todos los registros asociados. El
              grupo no podrá participar más en la competencia actual.
            </p>
          </div>

          <span className="mt-5 block font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Escriba 'CONFIRMAR' para proceder
          </span>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Escribe CONFIRMAR aquí..."
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/60 focus:outline-none"
          />

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onConfirm}
              disabled={!canDissolve}
              className={
                canDissolve
                  ? "inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
                  : "inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-800 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              }
            >
              <Trash2 size={12} /> Disolver Equipo
            </button>
            <button
              onClick={onCancel}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-zinc-100"
            >
              Cancelar
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-zinc-900 pt-3 font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-600">
            <span>EVENT: 2024_QA_NOV_22S</span>
            <span>AUTHENTICATION REQUIRED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
