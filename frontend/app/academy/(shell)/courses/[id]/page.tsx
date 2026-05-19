"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { ApiError, courses as coursesApi } from "@/lib/api";
import type { CourseDetailOut, ModuleOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const LEVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export default function AcademyCourseEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetailOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleOut | null>(null);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  // form fields (sync with course on load)
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("basico");
  const [durationHours, setDurationHours] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  async function reload() {
    try {
      const c = await coursesApi.get(params.id);
      setCourse(c);
      setTitle(c.title);
      setSummary(c.summary);
      setDescription(c.description);
      setLevel(c.level);
      setDurationHours(String(c.duration_hours));
      setIsPublished(c.is_published);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await coursesApi.update(params.id, {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        level,
        duration_hours: Number(durationHours) || 0,
        is_published: isPublished,
      });
      setCourse(updated);
      setToast({ message: "Curso guardado.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar este curso y todos sus módulos?`)) return;
    try {
      await coursesApi.remove(params.id);
      router.push("/academy/courses");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("¿Eliminar este módulo?")) return;
    try {
      await coursesApi.deleteModule(params.id, moduleId);
      await reload();
      setToast({ message: "Módulo eliminado.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="px-10 py-10">
        <p className="text-zinc-400">Curso no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-10">
      <Link
        href="/academy/courses"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver a cursos
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Editar curso
          </span>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
            {course.title}
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            {course.slug} · {LEVEL_LABEL[course.level] ?? course.level} ·{" "}
            {course.modules_count} módulos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              course.is_published
                ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                : "inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400"
            }
          >
            {course.is_published ? (
              <>
                <Eye size={11} /> Publicado
              </>
            ) : (
              <>
                <EyeOff size={11} /> Borrador
              </>
            )}
          </span>
          <button
            onClick={handleDelete}
            className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-rose-300 hover:bg-rose-500/20"
          >
            <Trash2 size={11} className="inline" /> Eliminar
          </button>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Detalles */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
        >
          <h2 className="text-lg font-bold text-zinc-50">Detalles</h2>
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Título *">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </Field>
            <Field label="Resumen corto">
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </Field>
            <Field label="Descripción detallada">
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivos, prerrequisitos, audiencia..."
                className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nivel">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </Field>
              <Field label="Duración (horas)">
                <input
                  type="number"
                  min="0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
                />
              </Field>
            </div>
            <label className="mt-2 flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-orange-500"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  Publicar curso
                </p>
                <p className="text-xs text-zinc-500">
                  Si está activado, los competidores podrán ver este curso.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              Guardar cambios
            </button>
          </div>
        </form>

        {/* Módulos */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <header className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-50">
              <BookOpen size={14} className="text-orange-400" /> Módulos
            </h2>
            <button
              onClick={() => {
                setEditingModule(null);
                setModuleOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black hover:bg-orange-400"
            >
              <Plus size={11} /> Añadir
            </button>
          </header>

          {course.modules.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-zinc-800 py-8 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Sin módulos
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-2">
              {course.modules.map((m, i) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-1 items-start gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-300">
                        #{m.order || i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-100">
                          {m.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                          {m.content || (
                            <span className="italic">Sin contenido</span>
                          )}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                          {m.duration_minutes}min
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setEditingModule(m);
                          setModuleOpen(true);
                        }}
                        className="rounded-md border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-orange-500/40"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(m.id)}
                        className="rounded-md p-1 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {moduleOpen && (
        <ModuleModal
          courseId={course.id}
          existing={editingModule}
          nextOrder={course.modules.length + 1}
          onClose={() => setModuleOpen(false)}
          onSaved={async () => {
            setModuleOpen(false);
            await reload();
            setToast({
              message: editingModule ? "Módulo actualizado." : "Módulo creado.",
              variant: "success",
            });
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

function ModuleModal({
  courseId,
  existing,
  nextOrder,
  onClose,
  onSaved,
  onError,
}: {
  courseId: string;
  existing: ModuleOut | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [order, setOrder] = useState(String(existing?.order ?? nextOrder));
  const [duration, setDuration] = useState(
    String(existing?.duration_minutes ?? 0),
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await coursesApi.updateModule(courseId, existing.id, {
          title: title.trim(),
          content: content.trim(),
          order: Number(order) || 0,
          duration_minutes: Number(duration) || 0,
        });
      } else {
        await coursesApi.addModule(courseId, {
          title: title.trim(),
          content: content.trim(),
          order: Number(order) || 0,
          duration_minutes: Number(duration) || 0,
        });
      }
      onSaved();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl font-black text-zinc-50">
            {existing ? "Editar módulo" : "Nuevo módulo"}
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
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Contenido (markdown / texto)
            </span>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Material del módulo..."
              className="mt-1.5 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Orden
              </span>
              <input
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Duración (min)
              </span>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
              />
            </label>
          </div>
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
              {existing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
