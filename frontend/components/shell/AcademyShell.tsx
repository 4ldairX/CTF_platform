"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  GraduationCap,
  History,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Settings,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";
import { useAuth } from "@/lib/auth";

type Item = { href: string; label: string; icon: React.ReactNode };

const NAV: Item[] = [
  { href: "/academy", label: "Inicio", icon: <LayoutGrid size={14} /> },
  { href: "/academy/courses", label: "Cursos", icon: <BookOpen size={14} /> },
  {
    href: "/academy/ai-documents",
    label: "Documentos IA",
    icon: <FileText size={14} />,
  },
  {
    href: "/academy/ai-history",
    label: "Historial IA",
    icon: <History size={14} />,
  },
];

const FOOT: Item[] = [
  {
    href: "/academy/settings",
    label: "Configuración",
    icon: <Settings size={14} />,
  },
  { href: "/academy/support", label: "Soporte", icon: <LifeBuoy size={14} /> },
];

export default function AcademyShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="brand-academy flex min-h-screen bg-[#0b0b10] text-zinc-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-900 bg-[#0e0d14]">
        <div className="px-5 pb-5 pt-6">
          <Link href="/academy" className="block">
            <Wordmark variant="academy" size="md" />
          </Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Panel del instructor
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((it) => {
            const active =
              it.href === "/academy"
                ? path === "/academy"
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

        {/* Footer */}
        <div className="px-3 pb-5">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
              <GraduationCap size={12} />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200">
                {user?.display_name ?? user?.username ?? "—"}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
                Instructor
              </span>
            </div>
          </div>
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
        <div className="relative z-10 flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
