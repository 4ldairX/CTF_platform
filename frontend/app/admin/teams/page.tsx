"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Filter,
  Search,
  Skull,
  Trash2,
  X,
} from "lucide-react";
import { teams as teamsApi } from "@/lib/api";
import type { TeamOut } from "@/lib/types";

export default function AdminTeamsPage() {
  const [allTeams, setAllTeams] = useState<TeamOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<TeamOut | null>(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    teamsApi
      .list()
      .then((data) => setAllTeams(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allTeams.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const canDissolve = confirmText.trim().toUpperCase() === "CONFIRMAR";

  async function handleDissolve() {
    if (!canDissolve || !target) return;
    try {
      // Note: DELETE /teams/{id} requires being captain; admin may get a permission error
      await teamsApi.list(); // placeholder – no admin delete endpoint
      setAllTeams((prev) => prev.filter((t) => t.id !== target.id));
    } catch {
      // show error silently for now
    }
    setTarget(null);
    setConfirmText("");
  }

  const TEAM_GRADIENTS = [
    "from-rose-500 to-red-900",
    "from-zinc-500 to-zinc-900",
    "from-cyan-400 to-zinc-900",
    "from-amber-400 to-rose-700",
    "from-indigo-400 to-purple-900",
    "from-emerald-400 to-zinc-900",
  ];

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
        <StatCard label="Total de equipos" value={loading ? "..." : String(allTeams.length)} />
        <StatCard
          label="Equipos Activos"
          value={loading ? "..." : String(allTeams.filter((t) => t.is_active).length)}
        />
        <StatCard
          label="Puntos Promedio"
          value={
            loading || allTeams.length === 0
              ? "..."
              : String(
                  Math.round(
                    allTeams.reduce((a, t) => a + t.total_points, 0) / allTeams.length
                  )
                )
          }
          suffix="pts / equipo"
        />
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
                placeholder="Buscar equipos..."
                className="w-44 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
              <Filter size={12} /> Filtrar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-[2fr_1fr_0.7fr_1.2fr_0.9fr_0.7fr] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Equipo</span>
          <span>Slug</span>
          <span>Miembros</span>
          <span>Puntos totales</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando equipos...
          </div>
        ) : (
          <ul>
            {filtered.map((t, idx) => (
              <li
                key={t.id}
                className="grid grid-cols-[2fr_1fr_0.7fr_1.2fr_0.9fr_0.7fr] items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${
                      TEAM_GRADIENTS[idx % TEAM_GRADIENTS.length]
                    } text-zinc-50`}
                  >
                    <Skull size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-50">{t.name}</h4>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                      {t.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  {t.slug}
                </span>
                <span className="font-mono text-xs text-zinc-300">
                  {t.member_count}
                </span>
                <span className="font-mono text-sm font-bold text-zinc-50">
                  {t.total_points.toLocaleString()}
                </span>
                <StatusPill status={t.is_active ? "ACTIVE" : "INACTIVE"} />
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
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Mostrando {filtered.length} de {allTeams.length} equipos
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-100">
              Anterior
            </button>
            <button className="rounded-full bg-red-500 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:bg-red-400">
              Siguiente
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
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Activo
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> Inactivo
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
  team: TeamOut;
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
              liberará el nombre del equipo y todos los registros asociados.
            </p>
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Miembros: {team.member_count} · Puntos: {team.total_points.toLocaleString()}
          </p>

          <span className="mt-5 block font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Escriba &apos;CONFIRMAR&apos; para proceder
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
            <span>ID_EQUIPO: {team.id.slice(0, 8)}</span>
            <span>AUTENTICACIÓN REQUERIDA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
