"use client";

import { useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  Lock,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

type Role = "ADMINISTRADOR" | "INSTRUCTOR" | "COMPETIDOR";
type Status = "ACTIVE" | "BLOCKED";

type User = {
  id: string;
  name: string;
  code: string;
  email: string;
  role: Role;
  status: Status;
  avatarColor: string;
};

const USERS: User[] = [
  {
    id: "u1",
    name: "Alex Mercer",
    code: "CQ-902-K",
    email: "a.mercer@cyberquest.sh",
    role: "ADMINISTRADOR",
    status: "ACTIVE",
    avatarColor: "from-rose-400 to-red-700",
  },
  {
    id: "u2",
    name: "Sarah Connor",
    code: "CQ-104-M",
    email: "s.connor@cyberquest.sh",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    avatarColor: "from-cyan-300 to-cyan-700",
  },
  {
    id: "u3",
    name: "Deckard Shaw",
    code: "CQ-711-X",
    email: "d.shaw@ext.corp",
    role: "COMPETIDOR",
    status: "BLOCKED",
    avatarColor: "from-zinc-400 to-zinc-800",
  },
  {
    id: "u4",
    name: "Ada Bishop",
    code: "CQ-503-A",
    email: "a.bishop@cyberquest.sh",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    avatarColor: "from-amber-300 to-rose-600",
  },
  {
    id: "u5",
    name: "Kael Ortega",
    code: "CQ-228-T",
    email: "k.ortega@cyberquest.sh",
    role: "COMPETIDOR",
    status: "ACTIVE",
    avatarColor: "from-emerald-300 to-emerald-700",
  },
];

const STATS = [
  { label: "Total Usuarios", value: "1,284", delta: "+12%", deltaColor: "text-emerald-400" },
  { label: "Administradores", value: "12", delta: null },
  { label: "Instructores", value: "48", delta: null },
  { label: "Accesos Bloqueados", value: "07", delta: null, accent: "text-red-400" },
];

export default function AdminDashboardPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filtered = USERS.filter((u) => {
    const matchesQ =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.code.toLowerCase().includes(query.toLowerCase());
    const matchesR = roleFilter === "ALL" || u.role === roleFilter;
    return matchesQ && matchesR;
  });

  return (
    <div className="px-10 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-zinc-50">
            Gestión Maestra de Operativos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Panel central de jerarquía, accesos y monitoreo de cuentas
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_-6px_rgba(239,68,68,0.6)] hover:bg-red-400">
          <UserPlus size={14} /> Alta de Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5"
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.32em] ${
                s.accent ?? "text-zinc-500"
              }`}
            >
              {s.label}
            </span>
            <div className="mt-3 flex items-end gap-2">
              <span
                className={`font-display text-4xl font-black tracking-tight ${
                  s.accent ?? "text-zinc-50"
                }`}
              >
                {s.value}
              </span>
              {s.delta && (
                <span className={`pb-1 font-mono text-xs ${s.deltaColor}`}>
                  {s.delta}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Filters bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
          <Search size={13} className="text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre de operativo, correo o UUID..."
            className="flex-1 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          Filtro Rol:
        </span>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "ALL")}
            className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 pr-9 font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 focus:outline-none"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="COMPETIDOR">Competidor</option>
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
          <Filter size={12} /> Filtros Avanzados
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-red-500/40 hover:text-red-300">
          <Download size={12} /> Exportar
        </button>
      </div>

      {/* Table */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1fr] gap-4 border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Operativo</span>
          <span>Correo</span>
          <span>Jerarquía (Rol)</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </header>

        <ul>
          {filtered.map((u) => (
            <li
              key={u.id}
              className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1fr] items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br ${u.avatarColor}`}
                >
                  <Users size={16} className="text-zinc-50/90" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-50">{u.name}</h4>
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                    {u.code}
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-300">{u.email}</span>
              <RolePill role={u.role} />
              <StatusPill status={u.status} />
              <div className="flex items-center justify-end gap-2">
                <ActionBtn label="Inspeccionar">
                  <Eye size={13} />
                </ActionBtn>
                <ActionBtn label="Bloquear" tone={u.status === "BLOCKED" ? "danger" : "neutral"}>
                  {u.status === "BLOCKED" ? <Lock size={13} /> : <Shield size={13} />}
                </ActionBtn>
                <ActionBtn label="Eliminar">
                  <Trash2 size={13} />
                </ActionBtn>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
              // Sin resultados para los filtros actuales
            </li>
          )}
        </ul>

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Mostrando 1-{filtered.length} de 1,284 operativos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-100"
            >
              ‹ Anterior
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={
                  page === n
                    ? "h-8 w-8 rounded-full bg-red-500 font-mono text-xs font-bold text-black"
                    : "h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950/60 font-mono text-xs text-zinc-400 hover:text-zinc-100"
                }
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(3, page + 1))}
              className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:text-zinc-100"
            >
              Siguiente ›
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    ADMINISTRADOR: "bg-red-500/15 text-red-300 border-red-500/30",
    INSTRUCTOR: "bg-zinc-800 text-zinc-300 border-zinc-700",
    COMPETIDOR: "bg-zinc-900 text-zinc-400 border-zinc-800",
  };
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${map[role]}`}
    >
      {role} <ChevronDown size={10} />
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-rose-300">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Blocked
    </span>
  );
}

function ActionBtn({
  children,
  label,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  tone?: "neutral" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-red-500/40 hover:text-red-300";
  return (
    <button
      aria-label={label}
      title={label}
      className={`rounded-md border px-2.5 py-1.5 ${cls}`}
    >
      {children}
    </button>
  );
}
