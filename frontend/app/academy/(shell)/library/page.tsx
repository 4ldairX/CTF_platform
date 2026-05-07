import { ScanLine } from "lucide-react";

export default function AcademyLibraryPage() {
  return (
    <div className="px-10 py-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Knowledge Base
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Library
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Repositorio editorial con referencias, hojas de ruta y artículos
        curados por instructores certificados.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <article
            key={n}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-orange-500/30"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              VOLUMEN {n.toString().padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-base font-semibold text-zinc-100">
              Threat Hunting Field Notes #{n}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Reportes de incidentes, IoCs y técnicas de hardening en lenguaje
              de campo.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 group-hover:text-orange-200">
              <ScanLine size={12} /> Open dossier →
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
