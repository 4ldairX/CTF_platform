"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ApiError, courses as coursesApi } from "@/lib/api";
import type { CourseOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const LEVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const LEVEL_COLOR: Record<string, string> = {
  basico: "text-emerald-300",
  intermedio: "text-amber-300",
  avanzado: "text-rose-300",
};

export default function AcademyCoursesListPage() {
  const [list, setList] = useState<CourseOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  async function reload() {
    try {
      setList(await coursesApi.list());
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al cargar.";
      setToast({ message: msg, variant: "error" });
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar el curso "${title}"?`)) return;
    try {
      await coursesApi.remove(id);
      setToast({ message: "Curso eliminado.", variant: "success" });
      await reload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    }
  }

  return (
    <div className="px-10 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Gestión de cursos
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Cursos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Crea, edita y publica cursos. Los competidores solo pueden ver los
            que están publicados.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
        >
          <Plus size={14} /> Nuevo curso
        </button>
      </header>

      {loading ? (
        <div className="mt-12 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-zinc-700" />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Aún no hay cursos
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
          >
            <Plus size={12} /> Crear primer curso
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <header className="grid grid-cols-[1fr_120px_120px_100px_120px_60px] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
            <span>Título</span>
            <span>Nivel</span>
            <span className="text-right">Duración</span>
            <span className="text-right">Módulos</span>
            <span>Estado</span>
            <span></span>
          </header>
          <ul>
            {list.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-[1fr_120px_120px_100px_120px_60px] items-center gap-4 border-b border-zinc-900/70 px-6 py-4 last:border-b-0 hover:bg-orange-500/5"
              >
                <Link
                  href={`/academy/courses/${c.id}`}
                  className="flex flex-col"
                >
                  <span className="text-sm font-bold text-zinc-50">
                    {c.title}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {c.slug} · por {c.author_username ?? "—"}
                  </span>
                </Link>
                <span
                  className={`font-mono text-[11px] uppercase tracking-[0.18em] ${LEVEL_COLOR[c.level] ?? "text-zinc-400"}`}
                >
                  {LEVEL_LABEL[c.level] ?? c.level}
                </span>
                <span className="text-right font-mono text-xs text-zinc-300">
                  {c.duration_hours}h
                </span>
                <span className="text-right font-mono text-xs text-zinc-300">
                  {c.modules_count}
                </span>
                <span
                  className={
                    c.is_published
                      ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                      : "inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                  }
                >
                  {c.is_published ? (
                    <>
                      <CheckCircle2 size={10} /> Publicado
                    </>
                  ) : (
                    "Borrador"
                  )}
                </span>
                <button
                  onClick={() => handleDelete(c.id, c.title)}
                  className="justify-self-end rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {createOpen && (
        <CreateCourseModal
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await reload();
            setToast({ message: "Curso creado.", variant: "success" });
          }}
          onError={(msg) => setToast({ message: msg, variant: "error" })}
        />
      )}

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

function CreateCourseModal({
  onClose,
  onCreated,
  onError,
}: {
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [level, setLevel] = useState("basico");
  const [durationHours, setDurationHours] = useState("4");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await coursesApi.create({
        title: title.trim(),
        summary: summary.trim(),
        level,
        duration_hours: Number(durationHours) || 0,
        is_published: false,
      });
      onCreated();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al crear.";
      setError(msg);
      onError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl font-black text-zinc-50">
            Nuevo curso
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Título *
            </span>
            <input
              required
              autoFocus
              minLength={3}
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fundamentos de Linux"
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Resumen
            </span>
            <textarea
              rows={2}
              maxLength={500}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Breve descripción del curso"
              className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Nivel
              </span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              >
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Duración (horas)
              </span>
              <input
                type="number"
                min="0"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </label>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Creando..." : "Crear curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
