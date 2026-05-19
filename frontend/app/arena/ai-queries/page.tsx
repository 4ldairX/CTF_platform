"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Lightbulb,
  Loader2,
  MessageCircle,
  Sparkles,
  Target,
  User as UserIcon,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import type {
  AIQueryMode,
  ConversationDetailOut,
  ConversationListOut,
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

export default function ArenaAIQueriesPage() {
  const [list, setList] = useState<ConversationListOut[]>([]);
  const [detail, setDetail] = useState<ConversationDetailOut | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    ai.myConversations()
      .then((data) => {
        setList(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
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
      <Link
        href="/tutor"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver al tutor
      </Link>

      <header className="mt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
          Histórico
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Mis consultas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Todas tus conversaciones con el Tutor IA, agrupadas por sesión.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar list */}
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="px-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Sesiones ({list.length})
          </h2>
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={18} className="animate-spin text-zinc-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="mt-6 px-2 text-xs text-zinc-500">
              Aún no tienes consultas. Empieza una desde el{" "}
              <Link href="/tutor" className="text-orange-300 hover:text-orange-200">
                Tutor IA
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
              {list.map((c) => {
                const meta = modeMeta(c.mode);
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={
                        active
                          ? "w-full rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-left"
                          : "w-full rounded-md border border-transparent px-3 py-2 text-left hover:bg-zinc-800/40"
                      }
                    >
                      <div
                        className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] ${meta.color}`}
                      >
                        {meta.icon} {meta.label}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-zinc-100">
                        {c.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                        {c.message_count} msj ·{" "}
                        {new Date(c.updated_at).toLocaleDateString("es-BO")}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Detail */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          {!selectedId ? (
            <div className="flex h-full items-center justify-center py-16 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                Selecciona una conversación para ver el detalle
              </p>
            </div>
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
                  {new Date(detail.created_at).toLocaleString("es-BO")}
                </p>
              </header>

              <ul className="mt-6 flex flex-col gap-3">
                {detail.messages.map((m) => (
                  <li
                    key={m.id}
                    className={
                      m.role === "user" ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    <div
                      className={`flex max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <span
                        className={
                          m.role === "user"
                            ? "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-100"
                            : "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-black"
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
