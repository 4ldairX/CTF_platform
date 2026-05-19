"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { DocumentOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

export default function AdminAIDocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [indexing, setIndexing] = useState<string | null>(null);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  const isAdmin = user?.role === "admin";

  async function reload() {
    try {
      setDocs(await ai.listDocuments());
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleIndex(id: string) {
    if (!isAdmin) return;
    setIndexing(id);
    try {
      await ai.indexDocument(id);
      await reload();
      setToast({ message: "Documento indexado.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setIndexing(null);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!isAdmin) return;
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    try {
      await ai.deleteDocument(id);
      await reload();
      setToast({ message: "Documento eliminado.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    }
  }

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
            // DOCUMENTOS
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Base de conocimiento (RAG)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Sube documentos que el asistente IA puede consultar. Los admin pueden
            indexarlos para hacerlos disponibles.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
        >
          <Upload size={13} /> Subir documento
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : docs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
          <Database size={32} className="mx-auto mb-3 text-zinc-700" />
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Sin documentos cargados
          </p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-50">
                    <FileText size={14} className="text-orange-400" /> {d.title}
                  </h3>
                  {d.description && (
                    <p className="mt-1 text-xs text-zinc-500">{d.description}</p>
                  )}
                  {d.content_preview && (
                    <p className="mt-2 line-clamp-2 font-mono text-[11px] text-zinc-600">
                      {d.content_preview}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {d.uploaded_by_username ?? "—"} ·{" "}
                    {new Date(d.created_at).toLocaleString("es-BO")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {d.indexed ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                      <CheckCircle2 size={11} /> Indexado
                    </span>
                  ) : isAdmin ? (
                    <button
                      onClick={() => handleIndex(d.id)}
                      disabled={indexing !== null}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
                    >
                      {indexing === d.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Database size={11} />
                      )}
                      Indexar
                    </button>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                      Pendiente
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
                      className="rounded-md p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={async () => {
            setUploadOpen(false);
            await reload();
            setToast({ message: "Documento subido.", variant: "success" });
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

function UploadModal({
  onClose,
  onUploaded,
  onError,
}: {
  onClose: () => void;
  onUploaded: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (content.trim().length < 20) {
      onError("El contenido debe tener al menos 20 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await ai.uploadDocument({
        title: title.trim(),
        description: description.trim(),
        source_url: sourceUrl.trim() || undefined,
        content: content.trim(),
      });
      onUploaded();
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
            Subir documento
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Field label="Título *">
            <input
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <Field label="URL fuente (opcional)">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <Field label="Contenido * (mínimo 20 caracteres)">
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el contenido del documento..."
              className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
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
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </form>
      </div>
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
