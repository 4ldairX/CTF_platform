"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Bot,
  Code2,
  Lightbulb,
  MoreVertical,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

const LESSONS: Record<
  string,
  {
    courseTitle: string;
    moduleIdx: string;
    moduleTitle: string;
    objective: string;
    title: string;
    intro: string;
    blocks: { id: string; title: string; body: string; code: string[] }[];
  }
> = {
  "01": {
    courseTitle: "Linux",
    moduleIdx: "MODULE 01",
    moduleTitle: "Introduction to the Linux Kernel",
    objective: "Learning Objective",
    title: "Anatomy of a Modern Kernel",
    intro:
      "The kernel is the heart of any Linux system. In this lesson you'll inspect how it boots, how it speaks to user-space and how operatives can leverage that knowledge.",
    blocks: [
      {
        id: "b1",
        title: "Boot Sequence",
        body: "Once the bootloader hands off control, the kernel decompresses, sets up architecture-specific code and starts the scheduler. Learning each step of this dance gives you targets for tampering.",
        code: ["$ dmesg | head -n 20", "[    0.000000] Linux version 6.1.0-12-amd64", "[    0.000001] Command line: BOOT_IMAGE=/boot/vmlinuz..."],
      },
      {
        id: "b2",
        title: "Process 1: init",
        body: "Once the kernel finishes its preamble, it spawns PID 1. systemd, OpenRC or your custom init: this is the first process you can interact with from user-space.",
        code: ["$ ps -p 1 -o pid,cmd", "  PID CMD", "    1 /sbin/init splash"],
      },
    ],
  },
  "02": {
    courseTitle: "Linux",
    moduleIdx: "MODULE 02",
    moduleTitle: "Filesystem Navigation Master",
    objective: "Learning Objective",
    title: "Mastering the 'ls' and 'cd' Commands",
    intro:
      "Navigating the Linux filesystem is the fundamental skill of any terminal warrior. You'll learn to move through directories and inspect their contents with surgical precision.",
    blocks: [
      {
        id: "b1",
        title: "The List Command (ls)",
        body: "The ls command is your eyes in the dark. It reveals the contents of your current working directory. Use flags to reveal hidden files or detailed metadata.",
        code: [
          "$ ls",
          "$ ls -la",
          "# Long format with hidden files",
          "$ ls -la /var/log",
        ],
      },
      {
        id: "b2",
        title: "Change Directory (cd)",
        body: "Moving through the directory tree requires the cd command. You can move into a specific child folder or go back to the parent using the .. alias.",
        code: [
          "$ cd Documents",
          "$ cd ..",
          "# Move up one level",
          "$ cd ../../",
        ],
      },
    ],
  },
};

export default function LessonPage() {
  const params = useParams<{ id: string; lid: string }>();
  const lesson = LESSONS[params.lid] ?? LESSONS["02"];

  return (
    <div className="grid min-h-screen grid-cols-1 bg-zinc-950 text-zinc-100 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col">
        <LessonTopbar courseId={params.id} module={lesson.moduleIdx} title={lesson.moduleTitle} />
        <article className="flex-1 px-12 py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-300">
            <Sparkles size={12} /> {lesson.objective}
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-zinc-50">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">{lesson.intro}</p>

          <div className="mt-8 flex flex-col gap-5">
            {lesson.blocks.map((b) => (
              <section
                key={b.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
              >
                <h2 className="text-lg font-bold text-zinc-50">{b.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">{b.body}</p>
                <div className="mt-5 overflow-hidden rounded-lg border border-zinc-800 bg-black/70">
                  <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500/70" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      terminal
                    </span>
                  </div>
                  <pre className="p-4 font-mono text-[12px] leading-relaxed text-zinc-200">
                    {b.code.map((line, i) => (
                      <div key={i}>
                        {line.startsWith("#") ? (
                          <span className="text-zinc-500">{line}</span>
                        ) : line.startsWith("$") ? (
                          <span>
                            <span className="text-emerald-400">$</span>
                            <span className="text-zinc-200">{line.slice(1)}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">{line}</span>
                        )}
                      </div>
                    ))}
                  </pre>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
            <Link
              href={`/academy/courses/${params.id}`}
              className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-100"
            >
              ← Previous module
            </Link>
            <Link
              href={`/academy/courses/${params.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
            >
              Mark Complete & Continue
            </Link>
          </div>
        </article>
      </div>

      <AssistantPanel />
    </div>
  );
}

function LessonTopbar({
  courseId,
  module,
  title,
}: {
  courseId: string;
  module: string;
  title: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-8 py-4">
      <Link
        href={`/academy/courses/${courseId}`}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40"
      >
        <ArrowLeft size={12} /> Exit Lesson
      </Link>
      <div className="flex flex-col items-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          {module}
        </span>
        <h2 className="text-sm font-bold tracking-wide text-zinc-100">
          {title.toUpperCase()}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-orange-300">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-orange-400" />
          AI Analysis Active
        </span>
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100"
        >
          <User size={14} />
        </Link>
      </div>
    </header>
  );
}

function AssistantPanel() {
  const [messages, setMessages] = useState([
    {
      from: "ai" as const,
      content:
        "Hello user. I see you're looking at filesystem navigation. Would you like me to explain the difference between absolute and relative paths?",
      at: "09:41 AM",
    },
    {
      from: "user" as const,
      content:
        "Yes, please. How does 'cd ..' work specifically when I'm nested three levels deep?",
      at: "09:42 AM",
    },
    {
      from: "ai" as const,
      content:
        "When you use 'cd ..', you move back to the immediate parent. To jump three levels back instantly, you can chain them like this: cd ../../../",
      at: "JUST NOW",
      insight: true,
    },
  ]);
  const [draft, setDraft] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", content: draft.trim(), at: "JUST NOW" },
      {
        from: "ai",
        content:
          "Recibido. Procesando contexto del módulo… (respuesta simulada).",
        at: "JUST NOW",
      },
    ]);
    setDraft("");
  }

  return (
    <aside className="flex flex-col border-l border-zinc-900 bg-[#0d0c10]">
      <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-black">
            <Bot size={16} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-zinc-50">CyberQuest AI</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Assistant V2.4
            </span>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-zinc-200">
          <MoreVertical size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <ul className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <li
              key={i}
              className={
                m.from === "ai"
                  ? "max-w-[88%] self-start"
                  : "max-w-[88%] self-end"
              }
            >
              {m.from === "ai" && "insight" in m ? (
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-orange-300">
                  <Zap size={10} /> Generating Insight
                </span>
              ) : null}
              <div
                className={
                  m.from === "ai"
                    ? "rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
                    : "rounded-2xl rounded-tr-sm bg-orange-500/15 px-4 py-3 text-sm text-orange-100"
                }
              >
                {m.content}
              </div>
              <span className="mt-1 inline-block font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">
                {m.at}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-900 bg-[#0a090d] px-6 py-4"
      >
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask CyberQuest AI..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-black hover:bg-orange-400"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-orange-300"
          >
            <Code2 size={12} /> Explain code
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-orange-300"
          >
            <Lightbulb size={12} /> Get hint
          </button>
        </div>
      </form>
    </aside>
  );
}
