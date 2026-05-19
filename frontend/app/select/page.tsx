"use client";

import Link from "next/link";
import { Crosshair, GraduationCap, LogOut, Settings } from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";

export default function SelectPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 cq-bg-rays opacity-90" />
      <div className="pointer-events-none absolute inset-0 cq-bg-grid opacity-25" />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <Wordmark variant="cyberquest" size="md" showSub={false} />
        <div className="flex items-center gap-2 text-zinc-400">
          <button
            type="button"
            className="rounded-full p-2 hover:text-zinc-100"
            title="Configuración"
          >
            <Settings size={16} />
          </button>
          <Link
            href="/login"
            className="rounded-full p-2 hover:text-rose-400"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-10">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-red-300">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-400" />
          Sesión autorizada · Usuario verificado
        </span>
        <h1 className="text-center text-3xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Selecciona tu modo
        </h1>
        <p className="mt-3 max-w-xl text-center text-sm text-zinc-500">
          Aprende la teoría desde cero o entra directo al campo de práctica.
        </p>

        <div className="mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <ModeCard
            href="/academy"
            icon={<GraduationCap size={28} />}
            title="ACADEMIA"
            sub="Aprende la teoría"
            description="Cursos guiados, tutor IA y certificaciones. Construye fundamentos sólidos antes de entrar al campo."
          />
          <ModeCard
            href="/arena"
            icon={<Crosshair size={28} />}
            title="ARENA"
            sub="Enfrenta los retos"
            description="Laboratorios, eventos CTF en vivo y marcador. Pon a prueba lo aprendido en escenarios reales."
            featured
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-center text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          <span className="font-mono">
            Privacidad · Términos · Estado · Contacto
          </span>
          <span className="font-mono">
            © 2026 CyberQuest · EMI
          </span>
        </div>
      </main>
    </div>
  );
}

function ModeCard({
  href,
  icon,
  title,
  sub,
  description,
  featured,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-7 transition hover:border-red-500/40"
    >
      <div className="pointer-events-none absolute inset-0 cq-bg-grid opacity-25" />
      <div
        className={
          featured
            ? "pointer-events-none absolute inset-0 bg-radial-red opacity-90"
            : "pointer-events-none absolute inset-0 bg-radial-red opacity-50"
        }
      />
      <div className="relative flex h-full flex-col">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 shadow-glow-red">
          {icon}
        </div>
        <div className="mt-auto">
          <h3 className="font-display text-4xl font-black leading-none tracking-tight text-zinc-50 md:text-5xl">
            {title}
          </h3>
          <span className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            {sub}
          </span>
          <p className="mt-4 text-sm text-zinc-400">{description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 transition group-hover:text-red-300">
            Entrar →
          </span>
        </div>
      </div>
    </Link>
  );
}
