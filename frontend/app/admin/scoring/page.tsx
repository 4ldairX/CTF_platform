"use client";

import { useState } from "react";
import { Calculator, Save, TrendingDown, Zap } from "lucide-react";
import Toast from "@/components/ui/Toast";

const DIFFICULTIES = [
  { key: "easy", label: "Fácil", basePoints: 100, color: "text-emerald-400" },
  { key: "medium", label: "Media", basePoints: 250, color: "text-amber-400" },
  { key: "hard", label: "Difícil", basePoints: 500, color: "text-orange-400" },
  { key: "insane", label: "Insano", basePoints: 1000, color: "text-rose-400" },
];

export default function AdminScoringPage() {
  const [points, setPoints] = useState<Record<string, number>>(
    Object.fromEntries(DIFFICULTIES.map((d) => [d.key, d.basePoints])),
  );
  const [dynamicScoring, setDynamicScoring] = useState(false);
  const [decayFactor, setDecayFactor] = useState("0.08");
  const [minPoints, setMinPoints] = useState("50");
  const [firstBloodBonus, setFirstBloodBonus] = useState("10");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  return (
    <div className="px-10 py-8">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // LÓGICA DE PUNTUACIÓN
        </span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
          MOTOR DE PUNTUACIÓN
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Configura las reglas de puntuación, multiplicadores y bonificaciones del sistema.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Base points per difficulty */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Calculator size={14} className="text-red-400" /> Puntos Base por Dificultad
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            {DIFFICULTIES.map((d) => (
              <div key={d.key} className="flex items-center justify-between gap-4">
                <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${d.color}`}>
                  {d.label}
                </span>
                <input
                  type="number"
                  min="10"
                  value={points[d.key]}
                  onChange={(e) =>
                    setPoints((p) => ({ ...p, [d.key]: Number(e.target.value) }))
                  }
                  className="w-32 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-right font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic scoring */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <TrendingDown size={14} className="text-red-400" /> Puntuación Dinámica
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-200">Activar puntuación dinámica</p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  Los puntos bajan conforme más equipos resuelven el reto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDynamicScoring((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  dynamicScoring ? "bg-red-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    dynamicScoring ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {dynamicScoring && (
              <>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Factor de decaimiento (0–1)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={decayFactor}
                    onChange={(e) => setDecayFactor(e.target.value)}
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Puntos mínimos garantizados
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={minPoints}
                    onChange={(e) => setMinPoints(e.target.value)}
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
                  />
                </label>
              </>
            )}
          </div>
        </section>

        {/* Bonuses */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Zap size={14} className="text-red-400" /> Bonificaciones
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Bono primera sangre (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={firstBloodBonus}
                onChange={(e) => setFirstBloodBonus(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </label>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                Ejemplo fácil + primera sangre
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-300">
                {Math.round(points.easy * (1 + Number(firstBloodBonus) / 100))} pts
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                Ejemplo insano + primera sangre
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-rose-300">
                {Math.round(points.insane * (1 + Number(firstBloodBonus) / 100))} pts
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() =>
            setToast({ message: "Reglas de puntuación guardadas.", variant: "success" })
          }
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
        >
          <Save size={14} /> Aplicar reglas
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
