"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  History,
  Lightbulb,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Target,
  User as UserIcon,
} from "lucide-react";
import { ai, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AIQueryMode, MessageOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

type LocalMessage = {
  role: "user" | "assistant";
  content: string;
  mode?: AIQueryMode;
  at: string;
};

const MODE_META: Record<
  AIQueryMode,
  { label: string; icon: React.ReactNode; description: string }
> = {
  chat: {
    label: "Conversación",
    icon: <MessageCircle size={12} />,
    description: "Pregunta libre",
  },
  explain_concept: {
    label: "Explicar concepto",
    icon: <Lightbulb size={12} />,
    description: "Pide una explicación de un concepto",
  },
  recommend_challenge: {
    label: "Recomendar reto",
    icon: <Target size={12} />,
    description: "Sugerencia de un reto según tu nivel",
  },
  generate_feedback: {
    label: "Retroalimentación",
    icon: <Sparkles size={12} />,
    description: "Pide feedback sobre tu progreso",
  },
};

function timestamp(): string {
  return new Date().toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TutorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<AIQueryMode>("chat");
  const [thinking, setThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(
    null,
  );
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (messages.length === 0) {
      const name = user?.display_name ?? user?.username ?? "competidor";
      setMessages([
        {
          role: "assistant",
          content: `¡Hola, ${name}! Soy tu tutor de IA. Puedes hacerme preguntas libres o usar los botones especializados (Explicar concepto, Recomendar reto, Retroalimentación). ¿Por dónde empezamos?`,
          at: timestamp(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  async function send(text: string, modeUsed: AIQueryMode) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    setMessages((m) => [
      ...m,
      { role: "user", content: trimmed, mode: modeUsed, at: timestamp() },
    ]);
    setDraft("");
    setThinking(true);

    try {
      const res = await ai.ask({
        message: trimmed,
        mode: modeUsed,
        conversation_id: conversationId,
      });
      setConversationId(res.conversation_id);
      setQuota({ used: res.quota_used_today, limit: res.quota_limit });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          mode: res.mode,
          at: timestamp(),
        },
      ]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setToast({ message: err.detail, variant: "error" });
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `⚠ ${err.detail}`,
            at: timestamp(),
          },
        ]);
      } else {
        const msg = err instanceof ApiError ? err.detail : "Error de red.";
        setToast({ message: msg, variant: "error" });
      }
    } finally {
      setThinking(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(draft, mode);
  }

  function newConversation() {
    setConversationId(undefined);
    setMessages([
      {
        role: "assistant",
        content: "Empecé una nueva conversación. ¿En qué te ayudo?",
        at: timestamp(),
      },
    ]);
    setMode("chat");
  }

  function useExtend(extendMode: AIQueryMode) {
    setMode(extendMode);
    // Don't send yet — let the user type their topic
    setToast({
      message: `Modo activo: ${MODE_META[extendMode].label}. Escribe tu consulta.`,
      variant: "success",
    });
  }

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-900 px-10 py-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Asistente
          </span>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-black tracking-tight text-zinc-50">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/20 text-orange-300">
              <Bot size={18} />
            </span>
            Tutor IA
          </h1>
          {quota && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Cuota hoy: {quota.used}/{quota.limit}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newConversation}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
          >
            <Plus size={11} /> Nueva
          </button>
          <Link
            href="/arena/ai-queries"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
          >
            <History size={11} /> Mis consultas
          </Link>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-10 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} />
          ))}
          {thinking && (
            <div className="flex items-center gap-3 self-start rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-black">
                <Bot size={12} />
              </span>
              <Loader2 size={14} className="animate-spin text-zinc-500" />
              <span className="font-mono text-xs text-zinc-500">
                escribiendo...
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Extend mode buttons */}
      <div className="border-t border-zinc-900 px-10 py-3">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <Sparkles size={11} /> Modos
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODE_META) as AIQueryMode[]).map((m) => {
              const meta = MODE_META[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => useExtend(m)}
                  title={meta.description}
                  className={
                    active
                      ? "inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-black"
                      : "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
                  }
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-900 px-10 py-5"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 focus-within:border-orange-500/40">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              mode === "chat"
                ? "Pregunta lo que necesites..."
                : `Tu consulta para "${MODE_META[mode].label}"...`
            }
            disabled={thinking}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!draft.trim() || thinking}
            aria-label="Enviar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Cada consulta consume tu cuota diaria · respuestas en simulación
          mientras se integra el motor LLM
        </p>
      </form>

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

function ChatBubble({ message }: { message: LocalMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`flex max-w-[80%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <span
          className={
            isUser
              ? "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-100"
              : "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-black"
          }
        >
          {isUser ? <UserIcon size={12} /> : <Bot size={12} />}
        </span>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-zinc-800/80 px-4 py-3"
              : "rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3"
          }
        >
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
            {message.content}
          </p>
          <p
            className={`mt-1 font-mono text-[10px] uppercase tracking-[0.22em] ${
              isUser ? "text-right text-zinc-500" : "text-zinc-600"
            }`}
          >
            {message.mode && message.mode !== "chat"
              ? `${MODE_META[message.mode].label} · `
              : ""}
            {message.at}
          </p>
        </div>
      </div>
    </div>
  );
}
