"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Gauge, Loader2, Save } from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import type { AISettingsOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

export default function AdminAILimitsPage() {
  const [settings, setSettings] = useState<AISettingsOut | null>(null);
  const [quota, setQuota] = useState("20");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  useEffect(() => {
    ai.getLimits()
      .then((s) => {
        setSettings(s);
        setQuota(String(s.daily_quota_per_user));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const q = Number(quota);
    if (isNaN(q) || q < 0) {
      setToast({ message: "Cuota inválida.", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const s = await ai.updateLimits({ daily_quota_per_user: q });
      setSettings(s);
      setToast({ message: "Cuota actualizada.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      <Link
        href="/admin/ai"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver
      </Link>

      <header className="mt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // LIMITAR CONSULTAS
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Cuota diaria
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Limita el número máximo de consultas que cada competidor puede hacer
          al asistente IA por día.
        </p>
      </header>

      <form
        onSubmit={handleSave}
        className="mt-8 max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
      >
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
          <Gauge size={14} className="text-red-400" /> Configuración
        </h2>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Consultas máximas por usuario / día
          </span>
          <input
            type="number"
            min="0"
            max="10000"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-2xl font-bold text-zinc-50 focus:border-red-500/40 focus:outline-none"
          />
          <p className="mt-2 text-xs text-zinc-500">
            0 = ilimitado. Valor actual:{" "}
            <span className="font-bold text-zinc-200">
              {settings?.daily_quota_per_user ?? 20}
            </span>
          </p>
        </label>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Guardar
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
