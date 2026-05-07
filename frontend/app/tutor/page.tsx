"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Activity,
  Bell,
  Bot,
  KeyRound,
  Lock,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";

const TABS = [
  { id: "tutor", label: "Tutor", href: "/tutor" },
  { id: "insights", label: "Insights", href: "/tutor" },
  { id: "challenges", label: "Challenges", href: "/arena" },
  { id: "labs", label: "Labs", href: "/arena/library" },
];

export default function TutorPage() {
  const [active] = useState("tutor");

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0d] text-zinc-100">
      <Topbar active={active} />
      <div className="grid flex-1 grid-cols-[260px_1fr_360px]">
        <SessionsSidebar />
        <ConsolePanel />
        <InsightsPanel />
      </div>
    </div>
  );
}

function Topbar({ active }: { active: string }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-8 py-4">
      <Link href="/select">
        <Wordmark variant="cyberquest" size="md" showSub={false} />
      </Link>
      <nav className="flex items-center gap-7 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={
              active === t.id
                ? "relative font-medium text-red-400"
                : "text-zinc-400 hover:text-zinc-100"
            }
          >
            {t.label}
            {active === t.id ? (
              <span className="absolute -bottom-[20px] left-0 right-0 h-0.5 rounded-full bg-red-500" />
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-zinc-400">
        <button className="rounded-md p-2 hover:text-zinc-100">
          <Bell size={14} />
        </button>
        <button className="rounded-md p-2 hover:text-zinc-100">
          <Settings size={14} />
        </button>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
        >
          <User size={14} />
        </Link>
      </div>
    </header>
  );
}

function SessionsSidebar() {
  const sessions = [
    { id: "current", label: "Current chat", icon: <MessageSquare size={14} />, active: true },
    { id: "history", label: "Session History", icon: <Activity size={14} /> },
    { id: "library", label: "Resource Library", icon: <ShieldCheck size={14} /> },
    { id: "achievements", label: "Achievement Feed", icon: <Trophy size={14} /> },
  ];
  return (
    <aside className="flex flex-col border-r border-zinc-900 bg-[#0c0c10] px-5 py-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-400" />
        CyberQuest AI
      </div>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        PR3T3C3L: ACTIVE
      </span>

      <button className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400">
        <Plus size={14} /> New Session
      </button>

      <nav className="mt-6 flex flex-col gap-0.5">
        {sessions.map((s) => (
          <button
            key={s.id}
            className={
              s.active
                ? "inline-flex items-center gap-3 rounded-md border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-red-300"
                : "inline-flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400 hover:border-red-500/40 hover:bg-zinc-900/40 hover:text-zinc-100"
            }
          >
            <span className={s.active ? "text-red-400" : "text-zinc-500"}>
              {s.icon}
            </span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-zinc-900 pt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
        <span className="inline-flex items-center gap-2 px-3 py-1.5">
          <Activity size={12} /> System Status
        </span>
      </div>
    </aside>
  );
}

function ConsolePanel() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "user" as const,
      content:
        "Can you explain how a buffer overflow attack works in the context of C programming? I'm having trouble visualizing the stack memory.",
      at: "14:02",
    },
    {
      from: "ai" as const,
      content:
        "Absolutely, Cadet. Think of the Stack as a literal stack of dinner plates. In C, when a function is called, it gets its own 'plate' (a stack frame) to store variables.\n\nA buffer overflow happens when you try to put more data into a buffer than it can hold. The extra data spills over and corrupts adjacent memory — including return addresses.",
      at: "14:03",
    },
  ]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      { from: "user", content: draft.trim(), at: "JUST NOW" },
      {
        from: "ai",
        content:
          "Procesando consulta… (respuesta simulada). En producción esto consume el RAG cifrado del módulo M9.",
        at: "JUST NOW",
      },
    ]);
    setDraft("");
  }

  return (
    <section className="flex flex-col">
      <header className="flex items-start justify-between border-b border-zinc-900 px-8 py-5">
        <div>
          <h2 className="text-base font-bold text-zinc-50">AI Tutoring Console</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Target · Linux Kernel Internals
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <ul className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <li
              key={i}
              className={
                m.from === "ai"
                  ? "flex max-w-[85%] gap-3"
                  : "flex max-w-[85%] gap-3 self-end"
              }
            >
              {m.from === "ai" ? (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-black">
                  <Bot size={14} />
                </span>
              ) : null}
              <div
                className={
                  m.from === "ai"
                    ? "flex flex-col gap-1 rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-200"
                    : "flex flex-col gap-1 rounded-2xl rounded-tr-sm bg-zinc-800/70 px-4 py-3 text-sm text-zinc-200"
                }
              >
                {m.content.split("\n").map((line, j) => (
                  <span key={j}>{line || <br />}</span>
                ))}
                <span className="self-end font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  {m.at}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-zinc-900 px-8 py-5">
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Inquire about security protocols…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button type="button" className="text-zinc-500 hover:text-zinc-200">
            <Paperclip size={14} />
          </button>
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-black hover:bg-red-400"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Secure channel encrypted (AES-256)
        </p>
      </form>
    </section>
  );
}

function InsightsPanel() {
  return (
    <aside className="flex flex-col border-l border-zinc-900 bg-[#0c0c10] px-5 py-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          AI Insights
        </h3>
        <button className="text-zinc-500 hover:text-zinc-200">
          <Share2 size={14} />
        </button>
      </div>

      {/* Challenge suggestion */}
      <article className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-rose-500 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-950">
            HARD
          </span>
          <span className="font-mono text-[10px] tracking-[0.28em] text-orange-300">
            500 XP
          </span>
        </div>
        <h4 className="mt-3 text-sm font-bold text-zinc-50">
          Buffer Overflow Challenge
        </h4>
        <p className="mt-1 text-xs text-zinc-500">
          Exploit a vulnerable binary to gain shell access on a legacy server.
        </p>
        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-800 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-100 hover:bg-zinc-700">
          Deploy Lab
        </button>
      </article>

      {/* Crypto mini-illustration */}
      <article className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h4 className="text-sm font-bold text-zinc-50">Asymmetric Encryption</h4>
        <p className="mt-1 text-xs text-zinc-500">
          The fundamental of modern PKI.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
              <KeyRound size={14} />
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              Public
            </span>
          </div>
          <div className="flex-1 px-3">
            <div className="relative h-px bg-gradient-to-r from-orange-500/0 via-orange-500/60 to-orange-500/0">
              <Lock
                size={12}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 p-0.5 text-orange-300"
              />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
              <KeyRound size={14} />
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              Private
            </span>
          </div>
        </div>
        <p className="mt-3 text-[11px] italic text-zinc-500">
          “One key to lock, another to unlock. Knowledge only flows one way without
          the pair.”
        </p>
      </article>

      {/* Weekly Goal */}
      <article className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Weekly Goal
          </span>
          <span className="font-display text-2xl font-black text-zinc-50">
            65<span className="text-zinc-500">%</span>
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-[65%] bg-red-500" />
        </div>
      </article>

      <div className="mt-auto pt-4">
        <button className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200">
          <MoreHorizontal size={14} /> View all insights
        </button>
      </div>
    </aside>
  );
}
