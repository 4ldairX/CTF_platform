"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import type { DocumentOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

export default function AcademyAIDocumentsPage() {
  const [docs, setDocs] = useState<DocumentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  async function reload() {
    try {
      setDocs(await ai.listDocuments());
    } catch {}
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-400">
            // DOCUMENTOS IA
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Subir documentos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Aporta material para que el tutor IA pueda responder mejor a los
            competidores. La indexación es realizada por un administrador.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-emerald-400"
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
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-50">
                    <FileText size={14} className="text-emerald-400" />{" "}
                    {d.title}
                  </h3>
                  {d.description && (
                    <p className="mt-1 text-xs text-zinc-500">{d.description}</p>
                  )}
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {d.uploaded_by_username ?? "—"} ·{" "}
                    {new Date(d.created_at).toLocaleString("es-BO")}
                  </p>
                </div>
                {d.indexed ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                    <CheckCircle2 size={11} /> Indexado
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                    Pendiente
                  </span>
                )}
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
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Título *
            </span>
            <input
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Descripción
            </span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              URL fuente (opcional)
            </span>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Contenido * (min 20 chars)
            </span>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el contenido..."
              className="mt-1.5 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-50 focus:border-emerald-500/40 focus:outline-none"
            />
          </label>
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
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-emerald-400 disabled:opacity-50"
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
