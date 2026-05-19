"use client";

import { useEffect, useState } from "react";
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
import { admin as adminApi } from "@/lib/api";
import type { AdminUserOut, Role } from "@/lib/types";

type RoleFilter = Role | "ALL";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  instructor: "Instructor",
  moderator: "Moderador",
  competitor: "Competidor",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/15 text-red-300 border-red-500/30",
  instructor: "bg-zinc-800 text-zinc-300 border-zinc-700",
  moderator: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  competitor: "bg-zinc-900 text-zinc-400 border-zinc-800",
};

const AVATAR_GRADIENTS = [
  "from-rose-400 to-red-700",
  "from-cyan-300 to-cyan-700",
  "from-zinc-400 to-zinc-800",
  "from-amber-300 to-rose-600",
  "from-emerald-300 to-emerald-700",
  "from-indigo-400 to-purple-700",
];

type AdminStats = {
  total_users: number;
  total_challenges: number;
  total_teams: number;
  total_solves: number;
  role_counts: {
    admin: number;
    instructor: number;
    moderator: number;
    competitor: number;
  };
};

export default function AdminDashboardPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, u] = await Promise.all([adminApi.stats(), adminApi.users()]);
        setStats(s);
        setUsers(u);
      } catch {
        // ignore errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const updated = await adminApi.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      // ignore
    }
  }

  async function handleToggleActive(userId: string, currentActive: boolean) {
    try {
      const updated = await adminApi.updateUser(userId, {
        is_active: !currentActive,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch {
      // ignore
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("¿Eliminar este usuario? Esta acción es irreversible.")) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      // ignore
    }
  }

  const filtered = users.filter((u) => {
    const matchesQ =
      !query ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.id.toLowerCase().includes(query.toLowerCase());
    const matchesR = roleFilter === "ALL" || u.role === roleFilter;
    return matchesQ && matchesR;
  });

  const STATS_CARDS = stats
    ? [
        {
          label: "Total de usuarios",
          value: String(stats.total_users),
          accent: undefined,
        },
        {
          label: "Retos",
          value: String(stats.total_challenges),
          accent: undefined,
        },
        {
          label: "Equipos",
          value: String(stats.total_teams),
          accent: undefined,
        },
        {
          label: "Soluciones totales",
          value: String(stats.total_solves),
          accent: undefined,
        },
      ]
    : [
        { label: "Total de usuarios", value: "...", accent: undefined },
        { label: "Retos", value: "...", accent: undefined },
        { label: "Equipos", value: "...", accent: undefined },
        { label: "Soluciones totales", value: "...", accent: undefined },
      ];

  return (
    <div className="px-10 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-zinc-50">
            Gestión de usuarios
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
        {STATS_CARDS.map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              {s.label}
            </span>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-4xl font-black tracking-tight text-zinc-50">
                {s.value}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Role counts */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(
            [
              { key: "admin", label: "Admins" },
              { key: "instructor", label: "Instructores" },
              { key: "moderator", label: "Moderadores" },
              { key: "competitor", label: "Competidores" },
            ] as const
          ).map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                {label}
              </span>
              <span className="font-mono text-sm font-bold text-zinc-100">
                {stats.role_counts[key]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filters bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
          <Search size={13} className="text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, correo o UUID..."
            className="flex-1 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          Filtro Rol:
        </span>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 pr-9 font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 focus:outline-none"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="admin">Administrador</option>
            <option value="instructor">Instructor</option>
            <option value="moderator">Moderador</option>
            <option value="competitor">Competidor</option>
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
          <span>Usuario</span>
          <span>Correo</span>
          <span>Jerarquía (Rol)</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </header>

        {loading ? (
          <div className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando usuarios...
          </div>
        ) : (
          <ul>
            {filtered.map((u, idx) => (
              <li
                key={u.id}
                className="grid grid-cols-[2fr_2fr_1.4fr_1fr_1fr] items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-br ${
                      AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                    }`}
                  >
                    <Users size={16} className="text-zinc-50/90" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-50">{u.username}</h4>
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                      {u.display_name ?? u.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-zinc-300">{u.email}</span>
                <div className="relative">
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className={`appearance-none rounded-md border px-3 py-1 pr-7 font-mono text-[10px] uppercase tracking-[0.18em] focus:outline-none ${
                      ROLE_COLORS[u.role] ?? "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="moderator">Moderador</option>
                    <option value="competitor">Competidor</option>
                  </select>
                  <ChevronDown
                    size={10}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                </div>
                <StatusPill isActive={u.is_active} />
                <div className="flex items-center justify-end gap-2">
                  <ActionBtn label="Toggle activo" tone={u.is_active ? "neutral" : "danger"} onClick={() => handleToggleActive(u.id, u.is_active)}>
                    {u.is_active ? <Shield size={13} /> : <Lock size={13} />}
                  </ActionBtn>
                  <ActionBtn label="Eliminar" tone="danger" onClick={() => handleDeleteUser(u.id)}>
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
        )}

        {/* Pagination */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Mostrando 1-{filtered.length} de {users.length} usuarios
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

function StatusPill({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Activo
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-rose-300">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Bloqueado
    </span>
  );
}

function ActionBtn({
  children,
  label,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  tone?: "neutral" | "danger";
  onClick?: () => void;
}) {
  const cls =
    tone === "danger"
      ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-red-500/40 hover:text-red-300";
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 ${cls}`}
    >
      {children}
    </button>
  );
}
