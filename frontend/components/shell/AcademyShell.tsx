"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  GraduationCap,
  HeadphonesIcon,
  Layers,
  LifeBuoy,
  Settings,
  TrendingUp,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";

type Item = { href: string; label: string; icon: React.ReactNode };

const NAV: Item[] = [
  { href: "/academy", label: "Courses", icon: <BookOpen size={14} /> },
  { href: "/academy/library", label: "Library", icon: <Layers size={14} /> },
  {
    href: "/academy/certifications",
    label: "Certifications",
    icon: <GraduationCap size={14} />,
  },
  { href: "/academy/progress", label: "Progress", icon: <TrendingUp size={14} /> },
];

const FOOT: Item[] = [
  { href: "/academy/settings", label: "Settings", icon: <Settings size={14} /> },
  { href: "/academy/support", label: "Support", icon: <LifeBuoy size={14} /> },
];

export default function AcademyShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="brand-academy flex min-h-screen bg-[#0b0b10] text-zinc-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-900 bg-[#0e0d14]">
        <div className="px-5 pb-5 pt-6">
          <Link href="/academy" className="block">
            <Wordmark variant="academy" size="md" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((it) => {
            const active = path === it.href || path.startsWith(it.href + "/");
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
          <Link
            href="/select"
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-black hover:bg-orange-400"
          >
            <Compass size={14} /> Upgrade to Pro
          </Link>
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
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-orange opacity-60" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
