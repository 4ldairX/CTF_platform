"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Flag,
  Lightbulb,
  Loader2,
  Send,
  Skull,
  Users,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";
import { challenges as challengesApi, ApiError } from "@/lib/api";
import type { ChallengeDetailOut } from "@/lib/types";

const DIFF_META: Record<string, { label: string; cls: string }> = {
  easy: {
    label: "Fácil",
    cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  },
  medium: {
    label: "Media",
    cls: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  },
  hard: {
    label: "Difícil",
    cls: "text-orange-300 border-orange-500/30 bg-orange-500/10",
  },
  insane: {
    label: "Insano",
    cls: "text-rose-300 border-rose-500/30 bg-rose-500/10",
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  pwn: "Pwn",
  crypto: "Cripto",
  reverse: "Reversing",
  forensics: "Forense",
  misc: "Misc",
  osint: "OSINT",
};

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();

  const [challenge, setChallenge] = useState<ChallengeDetailOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [solvers, setSolvers] = useState<
    Array<{ user_id: string; username: string; solved_at: string }>
  >([]);
  const [hints, setHints] = useState<ChallengeDetailOut["hints"]>([]);

  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  useEffect(() => {
    challengesApi
      .get(params.id)
      .then((c) => {
        setChallenge(c);
        setHints(c.hints);
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    challengesApi
      .solvers(params.id)
      .then((data) => setSolvers(data))
      .catch(() => {});
  }, [params.id]);

  async function handleFlagSubmit(e: FormEvent) {
    e.preventDefault();
    if (!challenge || solved) return;
    const trimmed = flagInput.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const result = await challengesApi.submit(challenge.id, trimmed);
      if (result.correct) {
        setSolved(true);
        setToast({
          message: `¡Correcto! Ganaste +${result.points_earned} puntos.`,
          variant: "success",
        });
        // Refresh solvers
        challengesApi
          .solvers(challenge.id)
          .then((data) => setSolvers(data))
          .catch(() => {});
      } else {
        setToast({
          message: "Flag incorrecta. Sigue intentándolo.",
          variant: "error",
        });
      }
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.detail : "Error al verificar la flag.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSubmitting(false);
      setFlagInput("");
    }
  }

  async function handleRevealHint(hintId: string) {
    if (!challenge) return;
    try {
      const updated = await challengesApi.revealHint(challenge.id, hintId);
      setHints((prev) => prev.map((h) => (h.id === hintId ? updated : h)));
      setToast({
        message: `Pista revelada (−${updated.cost} XP).`,
        variant: "success",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.detail : "No se pudo revelar la pista.";
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

  if (!challenge) return null;

  const diff = DIFF_META[challenge.difficulty] ?? {
    label: challenge.difficulty,
    cls: "text-zinc-300 border-zinc-700 bg-zinc-900/60",
  };
  const categoryLabel = CATEGORY_LABEL[challenge.category] ?? challenge.category;

  return (
    <div className="px-10 py-8">
      <Link
        href="/arena/challenges"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        <ArrowLeft size={12} /> Volver al catálogo
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            {categoryLabel}
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            {challenge.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            {challenge.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill label="Dificultad" value={diff.label} cls={diff.cls} />
          <Pill
            label="Puntos"
            value={`${challenge.points}`}
            cls="text-orange-300 border-orange-500/30 bg-orange-500/10"
          />
          <Pill
            label="Resoluciones"
            value={`${challenge.solvers_count}`}
            cls="text-zinc-300 border-zinc-700 bg-zinc-900/60"
            icon={<Users size={11} />}
          />
          {challenge.first_blood_username ? (
            <Pill
              label="Primera sangre"
              value={challenge.first_blood_username}
              cls="text-rose-300 border-rose-500/30 bg-rose-500/10"
              icon={<Skull size={11} />}
            />
          ) : null}
        </div>
      </header>

      {solved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-emerald-200">
          <CheckCircle2 size={18} />
          <div>
            <p className="text-sm font-bold">¡Reto completado!</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
              Puntos acreditados · {challenge.points} XP
            </p>
          </div>
        </div>
      )}

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT: descripción, pistas, recursos */}
        <div className="flex flex-col gap-6">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
            <h2 className="text-base font-semibold text-zinc-100">
              Descripción
            </h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-zinc-400">
              {challenge.long_description || challenge.description}
            </p>
          </article>

          {hints.length > 0 && (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
              <header className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Pistas</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Cada pista descuenta XP al resolverlo
                </span>
              </header>
              <ul className="mt-4 flex flex-col gap-2">
                {hints.map((h, i) => {
                  const open = h.revealed;
                  return (
                    <li
                      key={h.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-orange-400">
                          <Lightbulb size={12} /> Pista {i + 1}
                        </span>
                        {open ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300">
                            <Eye size={11} /> Revelada · −{h.cost} XP
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevealHint(h.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40 hover:text-orange-300"
                          >
                            <EyeOff size={11} /> Revelar · −{h.cost} XP
                          </button>
                        )}
                      </div>
                      <p
                        className={
                          open
                            ? "mt-3 text-sm text-zinc-300"
                            : "mt-3 select-none text-sm text-zinc-700 blur-sm"
                        }
                      >
                        {open
                          ? h.text
                          : "█████████ ████ ████████ ███████ ██ ███."}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}

          {challenge.attachment_url && (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
              <h2 className="text-base font-semibold text-zinc-100">Recursos</h2>
              <ul className="mt-4 flex flex-col gap-2">
                <li className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-300">
                    <Download size={12} /> Archivo adjunto
                  </span>
                  <a
                    href={challenge.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300 hover:text-orange-200"
                  >
                    Descargar
                  </a>
                </li>
              </ul>
            </article>
          )}
        </div>

        {/* RIGHT: envío de flag + top solvers */}
        <div className="flex flex-col gap-6">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-base font-semibold text-zinc-100">
              Enviar flag
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Formato: CQ&#123;...&#125;
            </p>
            <form
              onSubmit={handleFlagSubmit}
              className="mt-4 flex flex-col gap-3"
            >
              <div className="relative">
                <Flag
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  disabled={solved || submitting}
                  placeholder="CQ{tu_flag_aqui}"
                  autoComplete="off"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 py-2.5 pl-9 pr-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={solved || submitting || !flagInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {solved ? (
                  <>
                    <CheckCircle2 size={14} /> Resuelto
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Enviar flag
                  </>
                )}
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">
                Primeros en resolver
              </h2>
              <Link
                href="/leaderboard"
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-300 hover:text-orange-200"
              >
                Clasificación →
              </Link>
            </header>
            <ul className="mt-4 flex flex-col gap-2">
              {solvers.length === 0 ? (
                <li className="py-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                  Nadie lo ha resuelto aún. ¡Sé el primero!
                </li>
              ) : (
                solvers.slice(0, 8).map((s, i) => (
                  <li
                    key={s.user_id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          i === 0
                            ? "font-mono text-[10px] font-bold text-amber-400"
                            : i === 1
                              ? "font-mono text-[10px] font-bold text-zinc-300"
                              : i === 2
                                ? "font-mono text-[10px] font-bold text-orange-600"
                                : "font-mono text-[10px] font-bold text-zinc-500"
                        }
                      >
                        #{i + 1}
                      </span>
                      <span className="text-sm font-bold text-zinc-100">
                        {s.username}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {new Date(s.solved_at).toLocaleDateString("es-BO")}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </article>
        </div>
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

function Pill({
  label,
  value,
  cls,
  icon,
}: {
  label: string;
  value: string;
  cls: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${cls}`}
    >
      {icon && <span>{icon}</span>}
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] opacity-70">
        {label}
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
        {value}
      </span>
    </div>
  );
}
