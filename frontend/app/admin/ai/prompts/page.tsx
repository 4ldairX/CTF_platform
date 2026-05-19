"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import type { AIPromptKind, PromptOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const KIND_LABELS: Record<AIPromptKind, string> = {
  base: "Prompt base (chat general)",
  explain_concept: "Modo: Explicar concepto",
  recommend_challenge: "Modo: Recomendar reto",
  generate_feedback: "Modo: Generar retroalimentación",
};

const ALL_KINDS: AIPromptKind[] = [
  "base",
  "explain_concept",
  "recommend_challenge",
  "generate_feedback",
];

export default function AdminAIPromptsPage() {
  const [contents, setContents] = useState<Record<AIPromptKind, string>>({
    base: "",
    explain_concept: "",
    recommend_challenge: "",
    generate_feedback: "",
  });
  const [serverData, setServerData] = useState<PromptOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<AIPromptKind | null>(null);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  useEffect(() => {
    ai.listPrompts()
      .then((data) => {
        setServerData(data);
        const map: Record<AIPromptKind, string> = {
          base: "",
          explain_concept: "",
          recommend_challenge: "",
          generate_feedback: "",
        };
        data.forEach((p) => {
          map[p.kind] = p.content;
        });
        setContents(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(kind: AIPromptKind) {
    const content = contents[kind].trim();
    if (content.length < 10) {
      setToast({
        message: "El prompt debe tener al menos 10 caracteres.",
        variant: "error",
      });
      return;
    }
    setSaving(kind);
    try {
      const updated = await ai.upsertPrompt(kind, content);
      setServerData((prev) => {
        const filtered = prev.filter((p) => p.kind !== kind);
        return [...filtered, updated];
      });
      setToast({ message: "Prompt guardado.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSaving(null);
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
          // PROMPTS
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Gestionar prompts
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Un prompt por modo. Estos instruyen al modelo cómo responder según el
          tipo de consulta del competidor.
        </p>
      </header>

      <section className="mt-8 flex flex-col gap-4">
        {ALL_KINDS.map((kind) => {
          const meta = serverData.find((p) => p.kind === kind);
          return (
            <article
              key={kind}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <header className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-zinc-50">
                    {KIND_LABELS[kind]}
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    {meta
                      ? `Actualizado: ${new Date(meta.updated_at).toLocaleString("es-BO")} · por ${meta.updated_by_username ?? "—"}`
                      : "Sin guardar"}
                  </p>
                </div>
                <button
                  onClick={() => handleSave(kind)}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
                >
                  {saving === kind ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  Guardar
                </button>
              </header>
              <textarea
                rows={6}
                value={contents[kind]}
                onChange={(e) =>
                  setContents((c) => ({ ...c, [kind]: e.target.value }))
                }
                placeholder={`Instrucciones para el modo "${KIND_LABELS[kind]}"...`}
                className="mt-4 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-zinc-100 focus:border-red-500/40 focus:outline-none"
              />
            </article>
          );
        })}
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
