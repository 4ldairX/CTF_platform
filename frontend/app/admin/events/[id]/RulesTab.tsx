"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { adminEvents, ApiError } from "@/lib/api";

type Rule = { key: string; value: string };

const SUGGESTED_KEYS = [
  "team_size_max",
  "flag_format",
  "no_collab",
  "submission_cooldown_seconds",
  "hint_penalty_percent",
  "scoring_mode",
  "freeze_minutes",
];

export default function RulesTab({
  eventId,
  onToast,
}: {
  eventId: string;
  onToast: (msg: string, variant: "success" | "error") => void;
}) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminEvents
      .listRules(eventId)
      .then((data) => setRules(data.map((r) => ({ key: r.key, value: r.value }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  function update(idx: number, field: "key" | "value", value: string) {
    setRules((r) =>
      r.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule)),
    );
  }

  function remove(idx: number) {
    setRules((r) => r.filter((_, i) => i !== idx));
  }

  function add() {
    setRules((r) => [...r, { key: "", value: "" }]);
  }

  async function save() {
    const valid = rules.filter((r) => r.key.trim() && r.value.trim());
    setSaving(true);
    try {
      await adminEvents.configureRules(eventId, valid);
      onToast("Reglas guardadas.", "success");
      setRules(valid);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      onToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">Reglas del evento</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Clave–valor. Estas reglas son visibles para los participantes.
          </p>
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-red-500/40 hover:text-red-300"
        >
          <Plus size={11} /> Añadir regla
        </button>
      </header>

      <ul className="mt-5 flex flex-col gap-2">
        {rules.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-800 py-10 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
            Sin reglas configuradas
          </li>
        ) : (
          rules.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[200px_1fr_40px] items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
            >
              <input
                list={`keys-${eventId}`}
                value={r.key}
                onChange={(e) => update(i, "key", e.target.value)}
                placeholder="clave (ej. team_size_max)"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
              <input
                value={r.value}
                onChange={(e) => update(i, "value", e.target.value)}
                placeholder="valor"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
              <button
                onClick={() => remove(i)}
                className="justify-self-end rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Quitar"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))
        )}
      </ul>

      <datalist id={`keys-${eventId}`}>
        {SUGGESTED_KEYS.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>

      <div className="mt-5 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Save size={12} />
          )}
          Guardar reglas
        </button>
      </div>
    </article>
  );
}
