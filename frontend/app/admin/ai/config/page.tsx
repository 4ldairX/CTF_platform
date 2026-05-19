"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Save,
  XCircle,
  Zap,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import type { AISettingsOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

export default function AdminAIConfigPage() {
  const [settings, setSettings] = useState<AISettingsOut | null>(null);
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [maxTokens, setMaxTokens] = useState("1024");
  const [temperatureX100, setTemperatureX100] = useState("70");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  useEffect(() => {
    ai.getConfig()
      .then((s) => {
        setSettings(s);
        setProvider(s.provider);
        setModel(s.model);
        setApiBaseUrl(s.api_base_url ?? "");
        setMaxTokens(String(s.max_tokens));
        setTemperatureX100(String(s.temperature_x100));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const s = await ai.updateConfig({
        provider,
        model,
        api_base_url: apiBaseUrl || undefined,
        api_key: apiKey || undefined,
        max_tokens: Number(maxTokens),
        temperature_x100: Number(temperatureX100),
      });
      setSettings(s);
      setApiKey("");
      setToast({
        message:
          "Configuración guardada. La conexión fue probada automáticamente.",
        variant: "success",
      });
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
          // CONFIGURAR API
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Configuración del LLM
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Al guardar, la conexión con el proveedor se prueba automáticamente.
          Si falla, la configuración no se guarda.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <KeyRound size={14} className="text-red-400" /> Parámetros
          </h2>

          <div className="mt-5 flex flex-col gap-4">
            <Field label="Proveedor *">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              >
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
                <option value="azure">Azure OpenAI</option>
                <option value="local">Local / Ollama</option>
              </select>
            </Field>
            <Field label="Modelo *">
              <input
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="claude-haiku-4-5"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field label="URL base (opcional)">
              <input
                type="url"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://api.anthropic.com"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field
              label={`API Key ${settings?.api_key_set ? "(actualizar, dejar vacío para conservar)" : "*"}`}
            >
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  settings?.api_key_set
                    ? "•••••••••••• (oculta)"
                    : "sk-..."
                }
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tokens máximos *">
                <input
                  required
                  type="number"
                  min="64"
                  max="8192"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
                />
              </Field>
              <Field label="Temperatura × 100 *">
                <input
                  required
                  type="number"
                  min="0"
                  max="200"
                  value={temperatureX100}
                  onChange={(e) => setTemperatureX100(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Guardando + probando..." : "Guardar (prueba conexión)"}
            </button>
          </div>
        </form>

        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Zap size={14} className="text-red-400" /> Estado de conexión
          </h2>
          {settings ? (
            <>
              <div
                className={
                  settings.last_connection_ok
                    ? "mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                    : "mt-5 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-rose-300"
                }
              >
                {settings.last_connection_ok ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <XCircle size={11} />
                )}
                {settings.last_connection_ok ? "Conectado" : "Sin conexión"}
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                {settings.last_connection_message ?? "Sin mensajes."}
              </p>
              {settings.last_connection_at && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                  Última prueba:{" "}
                  {new Date(settings.last_connection_at).toLocaleString(
                    "es-BO",
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-xs text-zinc-500">Sin datos.</p>
          )}
        </aside>
      </section>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
