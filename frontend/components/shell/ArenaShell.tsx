"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  CalendarRange,
  Crosshair,
  GraduationCap,
  History,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Search,
  Settings,
  ShieldHalf,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";
import { useAuth } from "@/lib/auth";

type Item = { href: string; label: string; icon: React.ReactNode };

const NAV: Item[] = [
  { href: "/arena", label: "Inicio", icon: <LayoutGrid size={14} /> },
  { href: "/arena/challenges", label: "Retos", icon: <Crosshair size={14} /> },
  { href: "/arena/events", label: "Eventos", icon: <CalendarRange size={14} /> },
  { href: "/arena/teams", label: "Equipos", icon: <Users size={14} /> },
  { href: "/leaderboard", label: "Clasificación", icon: <Trophy size={14} /> },
  { href: "/arena/progress", label: "Mi progreso", icon: <TrendingUp size={14} /> },
  { href: "/arena/certifications", label: "Certificaciones", icon: <GraduationCap size={14} /> },
  { href: "/arena/library", label: "Biblioteca", icon: <ShieldHalf size={14} /> },
  { href: "/tutor", label: "Tutor IA", icon: <Bot size={14} /> },
  { href: "/arena/ai-queries", label: "Mis consultas IA", icon: <History size={14} /> },
];

const FOOT: Item[] = [
  { href: "/arena/settings", label: "Configuración", icon: <Settings size={14} /> },
  { href: "/arena/support", label: "Soporte", icon: <LifeBuoy size={14} /> },
];

export default function ArenaShell({
  children,
  topBar = true,
}: {
  children: React.ReactNode;
  topBar?: boolean;
}) {
  const path = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="brand-arena flex min-h-screen bg-[#0a0a0d] text-zinc-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-900 bg-[#0d0d12]">
        <div className="px-5 pb-5 pt-6">
          <Link href="/arena" className="block">
            <Wordmark variant="arena" size="md" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((it) => {
            const active =
              it.href === "/arena"
                ? path === "/arena"
                : path === it.href || path.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  active
                    ? "inline-flex items-center gap-3 rounded-md border-l-2 border-orange-500 bg-orange-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-300"
                    : "inline-flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400 hover:border-orange-500/40 hover:bg-zinc-900/40 hover:text-zinc-100"
                }
              >
                <span className={active ? "text-orange-400" : "text-zinc-500"}>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <div className="flex flex-col gap-0.5 border-t border-zinc-900 pt-3">
            {FOOT.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="inline-flex items-center gap-3 rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-200"
              >
                {it.icon} {it.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-3 rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-500 hover:text-rose-300"
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-orange opacity-50" />
        <div className="relative z-10 flex min-h-screen flex-col">
          {topBar ? <ArenaTopbar /> : null}
          <div className="flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}

function ArenaTopbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/arena/challenges?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <header className="flex items-center gap-4 border-b border-zinc-900 px-8 py-4">
      <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar retos…"
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500/40 focus:outline-none"
        />
      </form>
      <button
        type="button"
        aria-label="Notificaciones"
        className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-400 hover:text-zinc-100"
      >
        <Bell size={14} />
      </button>
      <Link
        href="/profile"
        aria-label="Mi perfil"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      >
        <User size={14} />
      </Link>
    </header>
  );
}
