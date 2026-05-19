"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  FileText,
  Gauge,
  KeyRound,
  Loader2,
  MessageSquare,
  Settings as SettingsIcon,
} from "lucide-react";
import { ai } from "@/lib/api";
import type { AISettingsOut, ConsumptionSummaryOut } from "@/lib/types";

const CARDS = [
  {
    href: "/admin/ai/config",
    label: "Configurar API",
    description:
      "Proveedor, modelo y claves. Al guardar se prueba la conexión.",
    icon: <KeyRound size={18} />,
  },
  {
    href: "/admin/ai/prompts",
    label: "Prompts",
    description: "Gestionar prompts del sistema por modo.",
    icon: <MessageSquare size={18} />,
  },
  {
    href: "/admin/ai/limits",
    label: "Limitar consultas",
    description: "Cuota diaria por usuario.",
    icon: <Gauge size={18} />,
  },
  {
    href: "/admin/ai/consumption",
    label: "Monitorear consumo",
    description: "Métricas en tiempo real.",
    icon: <Activity size={18} />,
  },
  {
    href: "/admin/ai/documents",
    label: "Documentos",
    description: "Subir e indexar fuentes para RAG.",
    icon: <FileText size={18} />,
  },
];

export default function AdminAIHubPage() {
  const [settings, setSettings] = useState<AISettingsOut | null>(null);
  const [consumption, setConsumption] =
    useState<ConsumptionSummaryOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ai.getConfig().catch(() => null),
      ai.consumption().catch(() => null),
    ])
      .then(([s, c]) => {
        setSettings(s);
        setConsumption(c);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-10 py-8">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // ASISTENCIA IA
        </span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
          PANEL DE IA
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Configura, monitorea y gestiona todos los aspectos del asistente IA.
        </p>
      </header>

      {/* Summary */}
      {loading ? (
        <div className="mt-8 flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Estado conexión"
            value={settings?.last_connection_ok ? "OK" : "—"}
            accent={
              settings?.last_connection_ok
                ? "text-emerald-300"
                : "text-zinc-500"
            }
          />
          <SummaryCard
            label="Cuota diaria/usuario"
            value={settings ? `${settings.daily_quota_per_user}` : "—"}
          />
          <SummaryCard
            label="Consultas hoy"
            value={consumption ? `${consumption.requests_today}` : "—"}
          />
          <SummaryCard
            label="Usuarios activos hoy"
            value={consumption ? `${consumption.active_users_today}` : "—"}
          />
        </section>
      )}

      {/* Cards */}
      <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-red-500/40"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-300">
              {c.icon}
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-50 group-hover:text-red-300">
                {c.label}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">{c.description}</p>
            </div>
            <ArrowRight
              size={14}
              className="ml-auto text-zinc-500 group-hover:text-red-300"
            />
          </Link>
        ))}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
        {label}
      </span>
      <p
        className={`mt-2 font-display text-2xl font-black ${accent ?? "text-zinc-50"}`}
      >
        {value}
      </p>
    </article>
  );
}
