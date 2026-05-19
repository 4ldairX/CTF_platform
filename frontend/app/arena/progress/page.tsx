"use client";

import { useEffect, useState } from "react";
import { Activity, Target } from "lucide-react";
import { auth as authApi } from "@/lib/api";
import type { MyStats, MySubmission } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  pwn: "Pwn",
  crypto: "Criptografía",
  forensics: "Forense",
  reverse: "Reversing",
  misc: "Misceláneo",
  osint: "OSINT",
};

export default function ArenaProgressPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authApi.myStats(), authApi.mySubmissions(200)])
      .then(([s, subs]) => {
        setStats(s);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const correctByCategory = submissions
    .filter((s) => s.is_correct)
    .reduce<Record<string, number>>((acc, s) => {
      acc[s.challenge_category] = (acc[s.challenge_category] ?? 0) + 1;
      return acc;
    }, {});

  const categories = Object.entries(correctByCategory).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...categories.map(([, c]) => c));

  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Specialization Index
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Progress
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Distribución real de retos resueltos por categoría táctica.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Target size={14} />}
          label="Precisión"
          value={loading ? "…" : `${stats?.accuracy ?? 0}%`}
        />
        <StatCard
          icon={<Activity size={14} />}
          label="Intentos"
          value={loading ? "…" : (stats?.total_submissions ?? 0).toString()}
        />
        <StatCard label="Resueltos" value={loading ? "…" : (stats?.correct_submissions ?? 0).toString()} />
        <StatCard label="XP" value={loading ? "…" : (stats?.points ?? 0).toLocaleString()} />
      </div>

      <div className="mt-8">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          Retos resueltos por categoría
        </h2>

        {loading ? (
          <div className="mt-4 py-8 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando progreso...
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Aún no has resuelto retos. Visita la arena.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {categories.map(([cat, count]) => {
              const pct = Math.round((count / maxCount) * 100);
              return (
                <article
                  key={cat}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <h3 className="font-semibold text-zinc-100">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </h3>
                    <span className="font-mono text-orange-300">
                      {count} {count === 1 ? "reto" : "retos"}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-2 font-display text-2xl font-black text-zinc-50">{value}</p>
    </article>
  );
}
