"use client";

import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";

const NAV = [
  { href: "#network", label: "Network" },
  { href: "#threats", label: "Threats" },
  { href: "#inteligencia", label: "Inteligencia" },
  { href: "#maul", label: "Maul" },
];

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900/60 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="block">
          <Wordmark variant="cyberquest" size="md" showSub={false} />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              {it.label}
            </a>
          ))}
        </nav>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-glow-red transition hover:bg-red-400"
        >
          Join the Hunt
        </Link>
      </div>
    </header>
  );
}
