import { Crosshair } from "lucide-react";

export default function ArenaCertificationsPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Field Operations
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Certifications
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Acreditaciones obtenidas en escenarios de combate. Cada nivel valida tu
        capacidad bajo presión real.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { name: "Red Team Initiate", state: "earned" },
          { name: "Tactical Analyst", state: "earned" },
          { name: "Senior Operative", state: "in_progress" },
          { name: "Threat Hunter Elite", state: "locked" },
        ].map((c) => (
          <article
            key={c.name}
            className={
              c.state === "earned"
                ? "rounded-xl border border-orange-500/30 bg-zinc-900/40 p-5"
                : c.state === "in_progress"
                  ? "rounded-xl border border-amber-400/40 bg-zinc-900/40 p-5"
                  : "rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 opacity-60"
            }
          >
            <Crosshair size={16} className="text-orange-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">{c.name}</h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              {c.state === "earned"
                ? "Acreditado"
                : c.state === "in_progress"
                  ? "En progreso"
                  : "Bloqueado"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
