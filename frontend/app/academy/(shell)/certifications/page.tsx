import { Award, Lock } from "lucide-react";

const CERTS = [
  { code: "L1", name: "Operative Initiate", earned: true, points: 1200 },
  { code: "L2", name: "Network Apprentice", earned: true, points: 2400 },
  { code: "L3", name: "Tactical Specialist", earned: false, points: 4800 },
  { code: "L4", name: "Threat Hunter", earned: false, points: 9200 },
];

export default function AcademyCertificationsPage() {
  return (
    <div className="px-10 py-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Achievements
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Certifications
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Cada certificación valida una capa de tu progresión operativa. Los
        niveles más altos requieren ejercicios bajo presión real.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {CERTS.map((c) => (
          <article
            key={c.code}
            className={
              c.earned
                ? "rounded-xl border border-orange-500/30 bg-zinc-900/40 p-6"
                : "rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 opacity-90"
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
                  Level {c.code}
                </span>
                <h3 className="mt-1 text-xl font-bold text-zinc-50">
                  {c.name}
                </h3>
              </div>
              <span
                className={
                  c.earned
                    ? "rounded-md border border-orange-500/30 bg-orange-500/10 p-2 text-orange-300"
                    : "rounded-md border border-zinc-800 bg-zinc-900/60 p-2 text-zinc-600"
                }
              >
                {c.earned ? <Award size={16} /> : <Lock size={16} />}
              </span>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              {c.earned ? "Acreditado · firma criptográfica activa" : `${c.points} XP requeridos para desbloquear`}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
