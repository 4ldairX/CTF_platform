import type { ReactNode } from "react";
import Link from "next/link";
import { HelpCircle, Lock, KeyRound } from "lucide-react";
import Logo from "./Logo";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cyber-bg">
      {/* Glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-radial-red"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-30 [background-size:38px_38px]"
      />
      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-mono text-sm tracking-widest text-red-500 hover:text-red-400"
        >
          CyberQuest
        </Link>
        <button
          type="button"
          aria-label="Ayuda"
          className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        >
          <HelpCircle size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center px-4 pb-16">
        <div className="mt-4 mb-8">
          <Logo />
        </div>

        <section className="w-full max-w-md animate-fade-up">
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/55 p-6 shadow-glow-red backdrop-blur md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-red-500/5"
            />
            {children}
          </div>

          {/* Feature row */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <FeatureBadge
              icon={<Lock size={14} />}
              title="END-TO-END"
              text="Comunicaciones cifradas y aislamiento por sesión."
            />
            <FeatureBadge
              icon={<KeyRound size={14} />}
              title="MFA READY"
              text="Listo para autenticación multifactor."
            />
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-2 pb-8 text-[11px] text-zinc-600">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono uppercase tracking-[0.18em]">
          <a className="hover:text-zinc-300" href="#">
            Privacy Policy
          </a>
          <span aria-hidden>·</span>
          <a className="hover:text-zinc-300" href="#">
            Terms of Service
          </a>
          <span aria-hidden>·</span>
          <a className="hover:text-zinc-300" href="#">
            Legal
          </a>
          <span aria-hidden>·</span>
          <a className="hover:text-zinc-300" href="#">
            Cookies
          </a>
        </nav>
        <p>© 2026 PEAC · Escuela Militar de Ingeniería · All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureBadge({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 backdrop-blur">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-red-500/30 bg-zinc-950 text-red-400">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] tracking-[0.22em] text-zinc-300">
          {title}
        </span>
        <span className="text-[11px] leading-snug text-zinc-500">{text}</span>
      </div>
    </div>
  );
}
