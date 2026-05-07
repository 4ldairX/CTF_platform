"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Crosshair,
  LayoutGrid,
  LogOut,
  Network,
  Radar,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";

type Item = { href: string; label: string; icon: React.ReactNode };

const NAV: Item[] = [
  { href: "/select", label: "Command Center", icon: <LayoutGrid size={14} /> },
  { href: "/arena", label: "Network Node", icon: <Network size={14} /> },
  { href: "/tutor", label: "Threat Intel", icon: <Radar size={14} /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
  { href: "/profile", label: "Operator Profile", icon: <User size={14} /> },
];

export default function CyberQuestShell({
  children,
  topbar,
}: {
  children: React.ReactNode;
  topbar?: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <div className="brand-cyberquest flex min-h-screen bg-[#09090b] text-zinc-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-900 bg-[#0c0c10]">
        <div className="px-5 pb-5 pt-6">
          <Link href="/select" className="block">
            <Wordmark variant="cyberquest" size="lg" showSub={false} />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((it) => {
            const active = path === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  active
                    ? "inline-flex items-center gap-3 rounded-md border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-red-300"
                    : "inline-flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400 hover:border-red-500/40 hover:bg-zinc-900/40 hover:text-zinc-100"
                }
              >
                <span className={active ? "text-red-400" : "text-zinc-500"}>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <Link
            href="/arena/events"
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black hover:bg-red-400"
          >
            <Crosshair size={14} /> Deploy Mission
          </Link>
          <div className="flex flex-col gap-0.5 border-t border-zinc-900 pt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <span className="px-3 py-1.5 text-[10px] font-mono text-red-400">
              LEVEL 42 ACCESS
            </span>
            <Link
              href="/audit"
              className="inline-flex items-center gap-3 rounded-md px-3 py-1.5 hover:text-zinc-200"
            >
              <Settings size={14} /> System Logs
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-md px-3 py-1.5 hover:text-rose-300"
            >
              <LogOut size={14} /> Logout
            </Link>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-red opacity-30" />
        <div className="relative z-10 flex min-h-screen flex-col">
          {topbar ?? <CyberQuestTopbar />}
          <div className="flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}

function CyberQuestTopbar() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-900 px-8 py-4">
      <Wordmark variant="cyberquest" size="md" showSub={false} />
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-zinc-500 hover:text-zinc-100">
          <Bell size={14} />
        </button>
        <button className="rounded-md p-2 text-zinc-500 hover:text-zinc-100">
          <Settings size={14} />
        </button>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
        >
          <User size={14} />
        </Link>
      </div>
    </header>
  );
}
