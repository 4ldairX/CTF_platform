"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { admin as adminApi } from "@/lib/api";
import type {
  ChallengeAdminOut,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeCreateRequest,
} from "@/lib/types";

const CATEGORIES: ChallengeCategory[] = [
  "web", "pwn", "crypto", "forensics", "reverse", "misc", "osint",
];
const DIFFICULTIES: ChallengeDifficulty[] = ["easy", "medium", "hard", "insane"];

const DIFF_COLORS: Record<ChallengeDifficulty, string> = {
  easy: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  hard: "text-orange-300 border-orange-500/30 bg-orange-500/10",
  insane: "text-rose-300 border-rose-500/30 bg-rose-500/10",
};

const DIFF_LABEL: Record<ChallengeDifficulty, string> = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
  insane: "Insano",
};

const EMPTY_FORM: ChallengeCreateRequest = {
  title: "",
  description: "",
  long_description: "",
  category: "web",
  difficulty: "easy",
  points: 100,
  flag: "",
  is_active: true,
  is_featured: false,
};

type ModalMode = "create" | "edit";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeAdminOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<ChallengeAdminOut | null>(null);
  const [form, setForm] = useState<ChallengeCreateRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .challenges()
      .then((data) => setChallenges(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(c: ChallengeAdminOut) {
    setForm({
      title: c.title,
      description: c.description,
      long_description: c.long_description,
      category: c.category,
      difficulty: c.difficulty,
      points: c.points,
      flag: "",
      attachment_url: c.attachment_url ?? undefined,
      max_attempts: c.max_attempts ?? undefined,
      is_active: c.is_active,
      is_featured: c.is_featured,
    });
    setEditTarget(c);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const created = await adminApi.createChallenge(form);
        setChallenges((prev) => [created, ...prev]);
      } else if (editTarget) {
        const updated = await adminApi.updateChallenge(editTarget.id, form);
        setChallenges((prev) =>
          prev.map((c) => (c.id === editTarget.id ? updated : c))
        );
      }
      setModalOpen(false);
    } catch {
      // ignore errors
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar el reto "${title}"? Esta acción es irreversible.`))
      return;
    try {
      await adminApi.deleteChallenge(id);
      setChallenges((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  }

  const filtered = challenges.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-10 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // CATÁLOGO DE RETOS
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50">
            Catálogo de Retos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Gestión de retos CTF, dificultades y categorías.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_-6px_rgba(239,68,68,0.6)] hover:bg-red-400"
        >
          <Plus size={14} /> Crear reto
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de retos" value={String(challenges.length)} />
        <StatCard label="Activos" value={String(challenges.filter((c) => c.is_active).length)} />
        <StatCard label="Destacados" value={String(challenges.filter((c) => c.is_featured).length)} />
        <StatCard label="Total de soluciones" value={String(challenges.reduce((a, c) => a + c.solvers_count, 0))} />
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
          <Search size={13} className="text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título..."
            className="flex-1 bg-transparent font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px_100px] items-center gap-3 border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          <span>Título</span>
          <span>Categoría</span>
          <span>Dificultad</span>
          <span>Pts</span>
          <span>Solves</span>
          <span>Estado</span>
          <span className="text-right">Acciones</span>
        </header>

        {loading ? (
          <div className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando retos...
          </div>
        ) : (
          <ul>
            {filtered.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px_100px] items-center gap-3 border-b border-zinc-900/80 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
              >
                <div>
                  <h4 className="text-sm font-bold text-zinc-50">{c.title}</h4>
                  <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
                    {c.id.slice(0, 8)}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                  {c.category}
                </span>
                <span
                  className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
                    DIFF_COLORS[c.difficulty] ?? "text-zinc-300 border-zinc-700 bg-zinc-900"
                  }`}
                >
                  {DIFF_LABEL[c.difficulty] ?? c.difficulty}
                </span>
                <span className="font-mono text-sm font-bold text-zinc-50">
                  {c.points}
                </span>
                <span className="font-mono text-xs text-amber-300">
                  {c.solvers_count}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                    c.is_active ? "text-emerald-300" : "text-zinc-500"
                  }`}
                >
                  {c.is_active ? "Activo" : "Inactivo"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    aria-label="Editar"
                    className="rounded-md border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400 hover:border-amber-500/40 hover:text-amber-300"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.title)}
                    aria-label="Eliminar"
                    className="rounded-md border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
                // Sin retos para el filtro actual
              </li>
            )}
          </ul>
        )}

        <footer className="flex items-center justify-between border-t border-zinc-900 px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Mostrando {filtered.length} de {challenges.length} retos
          </span>
        </footer>
      </article>

      {/* Modal */}
      {modalOpen && (
        <ChallengeModal
          mode={modalMode}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ChallengeModal({
  mode,
  form,
  setForm,
  saving,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  form: ChallengeCreateRequest;
  setForm: React.Dispatch<React.SetStateAction<ChallengeCreateRequest>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  function update(key: keyof ChallengeCreateRequest, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 hover:text-zinc-100"
        >
          <X size={16} />
        </button>

        <div className="border-b border-zinc-900 px-7 py-5">
          <h2 className="font-display text-2xl font-black tracking-tight text-zinc-50">
            {mode === "create" ? "Crear reto" : "Editar reto"}
          </h2>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(v) => update("title", v)}
                placeholder="Nombre del reto"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label>Descripción corta</Label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                placeholder="Breve descripción..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/40 focus:outline-none"
              />
            </div>

            {/* Long description */}
            <div className="md:col-span-2">
              <Label>Descripción larga (Briefing)</Label>
              <textarea
                value={form.long_description ?? ""}
                onChange={(e) => update("long_description", e.target.value)}
                rows={4}
                placeholder="Briefing de la misión..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/40 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <Label>Categoría</Label>
              <SelectInput
                value={form.category}
                onChange={(v) => update("category", v as ChallengeCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: c.toUpperCase() }))}
              />
            </div>

            {/* Difficulty */}
            <div>
              <Label>Dificultad</Label>
              <SelectInput
                value={form.difficulty}
                onChange={(v) => update("difficulty", v as ChallengeDifficulty)}
                options={DIFFICULTIES.map((d) => ({ value: d, label: DIFF_LABEL[d] }))}
              />
            </div>

            {/* Points */}
            <div>
              <Label>Puntos</Label>
              <Input
                type="number"
                value={String(form.points)}
                onChange={(v) => update("points", Number(v))}
                placeholder="100"
              />
            </div>

            {/* Flag */}
            <div>
              <Label>Flag {mode === "edit" && "(dejar vacío para no cambiar)"}</Label>
              <Input
                value={form.flag}
                onChange={(v) => update("flag", v)}
                placeholder="flag{...}"
              />
            </div>

            {/* Max attempts */}
            <div>
              <Label>Max intentos (opcional)</Label>
              <Input
                type="number"
                value={form.max_attempts !== undefined ? String(form.max_attempts) : ""}
                onChange={(v) => update("max_attempts", v ? Number(v) : undefined)}
                placeholder="Sin límite"
              />
            </div>

            {/* Attachment URL */}
            <div>
              <Label>URL de archivo adjunto (opcional)</Label>
              <Input
                value={form.attachment_url ?? ""}
                onChange={(v) => update("attachment_url", v || undefined)}
                placeholder="https://..."
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 md:col-span-2">
              <CheckboxField
                checked={form.is_active ?? true}
                onChange={(v) => update("is_active", v)}
                label="Activo"
              />
              <CheckboxField
                checked={form.is_featured ?? false}
                onChange={(v) => update("is_featured", v)}
                label="Destacado"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-900 px-7 py-5">
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-800 bg-zinc-900/60 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-zinc-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
          >
            {saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/40 focus:outline-none"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 pr-9 font-mono text-sm text-zinc-100 focus:border-red-500/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
      />
    </div>
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-red-500"
      />
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-300">
        {label}
      </span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
        {label}
      </span>
      <div className="mt-3">
        <span className="font-display text-4xl font-black tracking-tight text-zinc-50">
          {value}
        </span>
      </div>
    </article>
  );
}
