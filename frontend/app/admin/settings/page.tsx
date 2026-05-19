"use client";

import { useEffect, useState } from "react";
import { Bell, Globe, Loader2, Save, Shield } from "lucide-react";
import { admin as adminApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Toast from "@/components/ui/Toast";

const DEFAULTS: Record<string, string> = {
  platform_name: "CyberQuest",
  flag_prefix: "CQ",
  max_team_size: "4",
  allow_registration: "true",
  maintenance_mode: "false",
  mfa_required_all: "false",
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [original, setOriginal] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => {
        const merged = { ...DEFAULTS, ...data };
        setSettings(merged);
        setOriginal(merged);
      })
      .catch(() => {
        setToast({ message: "No se pudo cargar la configuración.", variant: "error" });
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(settings) !== JSON.stringify(original);

  function setVal(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function toggle(key: string) {
    setVal(key, settings[key] === "true" ? "false" : "true");
  }

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    try {
      const saved = await adminApi.updateSettings(settings);
      setSettings(saved);
      setOriginal(saved);
      setToast({ message: "Configuración guardada.", variant: "success" });
    } catch (err) {
      if (err instanceof ApiError) {
        setToast({ message: err.detail, variant: "error" });
      } else {
        setToast({ message: "Error de red.", variant: "error" });
      }
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
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // CONFIGURACIÓN DE LA PLATAFORMA
        </span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
          AJUSTES
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Preferencias de la plataforma y políticas globales.
          {!isAdmin && (
            <span className="ml-2 text-amber-400">
              Solo los administradores pueden modificar.
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Globe size={14} className="text-red-400" /> Plataforma
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Nombre de la plataforma">
              <input
                disabled={!isAdmin}
                value={settings.platform_name ?? ""}
                onChange={(e) => setVal("platform_name", e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="Prefijo de flags">
              <input
                disabled={!isAdmin}
                value={settings.flag_prefix ?? ""}
                onChange={(e) =>
                  setVal("flag_prefix", e.target.value.toUpperCase().slice(0, 8))
                }
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none disabled:opacity-60"
              />
            </Field>
            <Field label="Máximo de miembros por equipo">
              <input
                disabled={!isAdmin}
                type="number"
                min="1"
                max="10"
                value={settings.max_team_size ?? "4"}
                onChange={(e) => setVal("max_team_size", e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none disabled:opacity-60"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Shield size={14} className="text-red-400" /> Seguridad y Acceso
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <Toggle
              label="Permitir nuevos registros"
              description="Los usuarios pueden crear cuentas libremente."
              checked={settings.allow_registration === "true"}
              onChange={() => toggle("allow_registration")}
              disabled={!isAdmin}
            />
            <Toggle
              label="Modo mantenimiento"
              description="Bloquea el acceso a todos excepto administradores."
              checked={settings.maintenance_mode === "true"}
              onChange={() => toggle("maintenance_mode")}
              disabled={!isAdmin}
            />
            <Toggle
              label="MFA obligatorio (todos)"
              description="Todos los usuarios deben configurar 2FA al ingresar."
              checked={settings.mfa_required_all === "true"}
              onChange={() => toggle("mfa_required_all")}
              disabled={!isAdmin}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <Bell size={14} className="text-red-400" /> Sistema
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { key: "Versión API", val: "v1.0.0" },
              { key: "Base de datos", val: "PostgreSQL 16" },
              { key: "Entorno", val: "Producción" },
            ].map((s) => (
              <div key={s.key} className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                  {s.key}
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-zinc-200">{s.val}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {dirty && (
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
            · Cambios sin guardar
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={!dirty || saving || !isAdmin}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
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
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-zinc-200">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? "bg-red-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
