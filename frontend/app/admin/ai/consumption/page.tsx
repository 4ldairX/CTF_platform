"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { ai } from "@/lib/api";
import type { ConsumptionSummaryOut } from "@/lib/types";

export default function AdminAIConsumptionPage() {
  const [data, setData] = useState<ConsumptionSummaryOut | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setData(await ai.consumption());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="px-10 py-8">
      <Link
        href="/admin/ai"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // MONITOREO
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Consumo del asistente IA
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Métricas en tiempo real del uso de la IA por todos los usuarios.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-red-500/40 hover:text-red-300"
        >
          <RefreshCw size={11} /> Refrescar
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : !data ? (
        <p className="mt-8 text-zinc-500">Sin datos.</p>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Activity size={14} />}
              label="Total de consultas"
              value={data.total_requests.toString()}
            />
            <StatCard
              icon={<ArrowUpRight size={14} />}
              label="Consultas hoy"
              value={data.requests_today.toString()}
              accent="text-cyan-300"
            />
            <StatCard
              icon={<Users size={14} />}
              label="Usuarios activos hoy"
              value={data.active_users_today.toString()}
              accent="text-emerald-300"
            />
            <StatCard
              icon={<Zap size={14} />}
              label="Tokens (entrada/salida)"
              value={`${data.total_tokens_in.toLocaleString()} / ${data.total_tokens_out.toLocaleString()}`}
              accent="text-amber-300"
            />
          </section>

          <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-bold text-zinc-50">
              Top usuarios (últimos 7 días)
            </h2>
            {data.top_users.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                Sin actividad en la última semana
              </p>
            ) : (
              <ul className="mt-5 flex flex-col gap-2">
                {data.top_users.map((u, i) => (
                  <li
                    key={u.user_id}
                    className="grid grid-cols-[40px_1fr_120px_120px] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                  >
                    <span className="font-mono text-sm font-bold text-zinc-200">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-bold text-zinc-50">
                      {u.username}
                    </span>
                    <span className="text-right font-mono text-xs text-zinc-300">
                      {u.requests} consultas
                    </span>
                    <span className="text-right font-mono text-xs text-zinc-400">
                      {u.tokens.toLocaleString()} tokens
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <p
        className={`mt-2 font-display text-2xl font-black ${accent ?? "text-zinc-50"}`}
      >
        {value}
      </p>
    </article>
  );
}
