import { ShieldHalf } from "lucide-react";

export default function ArenaLibraryPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Tactical Resources
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Library
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Repositorio de cheatsheets, payloads, manuales de campo y referencias
        rápidas para operaciones en vivo.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          "Web Recon Cheatsheet",
          "Linux Privilege Escalation",
          "Active Directory Atlas",
          "Cryptography Pitfalls",
          "Reverse Engineering Loop",
          "OSINT Pivot Kit",
        ].map((t) => (
          <article
            key={t}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <ShieldHalf size={16} className="text-orange-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">{t}</h3>
            <p className="mt-1 text-xs text-zinc-500">PDF + repositorios anexos.</p>
          </article>
        ))}
      </div>
    </div>
  );
}
