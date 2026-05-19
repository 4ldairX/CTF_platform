"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  History,
  Lightbulb,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
  User as UserIcon,
} from "lucide-react";
import { ai } from "@/lib/api";
import type {
  AIQueryMode,
  ConversationDetailOut,
  HistoryEntryOut,
} from "@/lib/types";

const MODE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  chat: {
    label: "Conversación",
    icon: <MessageCircle size={12} />,
    color: "text-zinc-300",
  },
  explain_concept: {
    label: "Explicar concepto",
    icon: <Lightbulb size={12} />,
    color: "text-amber-300",
  },
  recommend_challenge: {
    label: "Recomendar reto",
    icon: <Target size={12} />,
    color: "text-cyan-300",
  },
  generate_feedback: {
    label: "Retroalimentación",
    icon: <Sparkles size={12} />,
    color: "text-violet-300",
  },
};

function modeMeta(mode: string) {
  return MODE_META[mode] ?? MODE_META.chat;
}

export default function AcademyAIHistoryPage() {
  const [list, setList] = useState<HistoryEntryOut[]>([]);
  const [detail, setDetail] = useState<ConversationDetailOut | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function reload() {
    setLoadingList(true);
    try {
      const data = await ai.history(100);
      setList(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].conversation_id);
      }
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    ai.conversation(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-400">
            // HISTORIAL IA
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Consultar historial
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Revisa las conversaciones de los competidores con el asistente IA.
            Útil para entender qué dudas tienen y mejorar el material.
          </p>
        </div>
        <button
          onClick={reload}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300"
        >
          <RefreshCw size={11} /> Refrescar
        </button>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="flex items-center gap-2 px-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <History size={11} /> Conversaciones ({list.length})
          </h2>
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={18} className="animate-spin text-zinc-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="mt-6 px-2 text-xs text-zinc-500">
              Sin conversaciones aún.
            </p>
          ) : (
            <ul className="mt-3 flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
              {list.map((h) => {
                const meta = modeMeta(h.mode);
                const active = h.conversation_id === selectedId;
                return (
                  <li key={h.conversation_id}>
                    <button
                      onClick={() => setSelectedId(h.conversation_id)}
                      className={
                        active
                          ? "w-full rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-left"
                          : "w-full rounded-md border border-transparent px-3 py-2 text-left hover:bg-zinc-800/40"
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] ${meta.color}`}
                        >
                          {meta.icon} {meta.label}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                          {h.message_count} msj
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                        {h.username}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-100">
                        {h.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                        {new Date(h.updated_at).toLocaleDateString("es-BO")}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          {!selectedId ? (
            <p className="py-16 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Selecciona una conversación
            </p>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-zinc-500" />
            </div>
          ) : !detail ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              No se pudo cargar la conversación
            </p>
          ) : (
            <>
              <header>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] ${modeMeta(detail.mode).color}`}
                >
                  {modeMeta(detail.mode).icon} {modeMeta(detail.mode).label}
                </span>
                <h2 className="mt-2 text-xl font-bold text-zinc-50">
                  {detail.title}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                  {new Date(detail.created_at).toLocaleString("es-BO")} ·{" "}
                  {detail.messages.length} mensajes
                </p>
              </header>

              <ul className="mt-6 flex flex-col gap-3">
                {detail.messages.map((m) => (
                  <li
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={`flex max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <span
                        className={
                          m.role === "user"
                            ? "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-100"
                            : "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black"
                        }
                      >
                        {m.role === "user" ? (
                          <UserIcon size={12} />
                        ) : (
                          <Bot size={12} />
                        )}
                      </span>
                      <div
                        className={
                          m.role === "user"
                            ? "rounded-2xl rounded-tr-sm bg-zinc-800/80 px-4 py-3"
                            : "rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                        }
                      >
                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                          {m.content}
                        </p>
                        <p
                          className={`mt-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
                            m.role === "user"
                              ? "text-right text-zinc-500"
                              : "text-zinc-600"
                          }`}
                        >
                          {new Date(m.created_at).toLocaleString("es-BO")}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </section>
    </div>
  );
}
