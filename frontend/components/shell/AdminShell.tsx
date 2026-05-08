"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Database,
  GraduationCap,
  LogOut,
  Network,
  Search,
  ScrollText,
  Settings,
  Shield,
  Sliders,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";

type Item = { href: string; label: string; icon: React.ReactNode };

const NAV: Item[] = [
  { href: "/admin", label: "Directorio de Usuarios", icon: <Users size={14} /> },
  { href: "/admin/teams", label: "Control de Equipos", icon: <Network size={14} /> },
  { href: "/admin/academy", label: "Gestión de Academia", icon: <GraduationCap size={14} /> },
  { href: "/admin/challenges", label: "Catálogo de Retos", icon: <Target size={14} /> },
  { href: "/admin/sandbox", label: "Infraestructura Sandbox", icon: <Database size={14} /> },
  { href: "/admin/scoring", label: "Lógica de Puntuación", icon: <Sliders size={14} /> },
  { href: "/admin/scoreboard", label: "Scoreboard y Rankings", icon: <Trophy size={14} /> },
  { href: "/admin/audit", label: "Auditoría y Logs", icon: <ScrollText size={14} /> },
];

const TOP_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/teams", label: "Usuarios" },
  { href: "/admin/audit", label: "Seguridad" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="brand-cyberquest flex min-h-screen bg-[#08080b] text-zinc-200">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-900 bg-[#0a0a0e]">
        <div className="px-5 pb-4 pt-6">
          <span className="font-display text-sm font-black tracking-[0.18em] text-zinc-100">
            ADMIN CONSOLE
          </span>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            Superuser Access
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
          {NAV.map((it) => {
            const active = path === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  active
                    ? "inline-flex items-center gap-3 rounded-md border-l-2 border-red-500 bg-red-500/10 px-3 py-2.5 font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-red-300"
                    : "inline-flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2.5 font-mono text-[10px] uppercase leading-tight tracking-[0.18em] text-zinc-500 hover:border-red-500/30 hover:bg-zinc-900/40 hover:text-zinc-100"
                }
              >
                <span className={active ? "text-red-400" : "text-zinc-600"}>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-zinc-900 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-300">
            <Shield size={12} />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200">
              OPERATOR_01
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
              Superuser
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="text-zinc-500 hover:text-zinc-200"
            aria-label="Settings"
          >
            <Settings size={12} />
          </Link>
          <Link
            href="/login"
            className="text-zinc-500 hover:text-rose-300"
            aria-label="Logout"
          >
            <LogOut size={12} />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-red opacity-20" />

        {/* Topbar */}
        <header className="relative z-10 flex items-center justify-between border-b border-zinc-900 bg-[#0a0a0e]/60 px-8 py-3.5 backdrop-blur">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-display text-base font-black tracking-tight text-red-500"
            >
              <Shield size={16} /> OBSIDIAN.ADMIN
            </Link>
            <nav className="flex items-center gap-5">
              {TOP_NAV.map((t) => {
                const active =
                  t.href === "/admin"
                    ? path === "/admin"
                    : path.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={
                      active
                        ? "border-b-2 border-red-500 pb-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-100"
                        : "border-b-2 border-transparent pb-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200"
                    }
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-2">
              <Search size={12} className="text-zinc-500" />
              <input
                placeholder="Buscar operativo, ID o correo..."
                className="w-64 bg-transparent font-mono text-xs uppercase tracking-[0.18em] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button className="relative rounded-full border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400 hover:text-zinc-100">
              <Bell size={13} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <Link
              href="/admin/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            >
              <User size={13} />
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="relative z-10 flex min-h-[calc(100vh-58px)] flex-col">
          <div className="flex-1">{children}</div>

          <footer className="border-t border-zinc-900 bg-[#0a0a0e]/40 px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  CYBERQUEST PROTOCOL V2.4.0 // OBSIDIAN ADMIN INTERFACE
                </span>
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-700">
                  Sistema seguro de gestión de operativos autorizados
                </p>
              </div>
              <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                <Link href="/admin/audit" className="hover:text-zinc-200">
                  Security Policy
                </Link>
                <Link href="/admin/audit" className="hover:text-zinc-200">
                  Access Logs
                </Link>
                <a className="hover:text-zinc-200" href="#">
                  API Docs
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
