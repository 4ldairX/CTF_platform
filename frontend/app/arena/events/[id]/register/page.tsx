"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Cpu,
  Database,
  HardDrive,
  Radio,
  ShieldHalf,
  UserPlus,
  X,
} from "lucide-react";
import Toast from "@/components/ui/Toast";

const MISSIONS = [
  {
    id: "data_breach",
    title: "DATA_BREACH: OMEGA",
    description: "Exposición de servicios centrales de industrias Obsidian.",
    diff: "ALTA",
    points: 1850,
    accent: "orange",
  },
  {
    id: "ghost_shell",
    title: "GHOST_SHELL: V2",
    description: "Ejecución de código en infraestructura satelital DOA.",
    diff: "EXTREMA",
    points: 2500,
    accent: "rose",
  },
];

export default function EventRegistrationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [teamName, setTeamName] = useState("GHOST_PROTOCOL_01");
  const [members, setMembers] = useState(["OPERATOR_ALPHA", "V01_REBEL"]);
  const [pickedMission, setPickedMission] = useState("ghost_shell");
  const [accepted, setAccepted] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  function addMember() {
    if (members.length >= 3) {
      setToast({ message: "Máximo 3 operativos por escuadrón.", variant: "error" });
      return;
    }
    const next = `OP_${String(members.length + 1).padStart(2, "0")}`;
    setMembers((m) => [...m, next]);
  }

  function remove(name: string) {
    setMembers((m) => m.filter((x) => x !== name));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accepted) {
      setToast({
        message: "Debes aceptar los Terms of Engagement.",
        variant: "error",
      });
      return;
    }
    if (!teamName.trim()) {
      setToast({ message: "Define el callsign del escuadrón.", variant: "error" });
      return;
    }
    console.info("[CyberQuest] Registro de evento (simulado)", {
      eventId: params.id,
      teamName,
      members,
      mission: pickedMission,
    });
    setToast({
      message: "Inscripción registrada. Despliegue confirmado.",
      variant: "success",
    });
    window.setTimeout(() => router.push("/arena/events"), 900);
  }

  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        OP. Registration
      </span>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50">
        Inscripción a Eventos
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Inicia la secuencia de despliegue para CyberQuest. Asegura tu posición en
        la red antes de la brecha de seguridad.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Identidad del Comando */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            <ShieldHalf size={12} /> Identidad del Comando
          </span>

          <label className="mt-5 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Nombre del Equipo
            </span>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value.toUpperCase())}
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 font-mono text-sm tracking-wider text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>

          <div className="mt-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Miembros del Equipo (max 3)
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {members.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-mono text-[11px] tracking-wider text-orange-200"
                >
                  @{m}
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className="text-orange-300 hover:text-rose-300"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 hover:border-orange-500/40 hover:text-orange-300"
              >
                <UserPlus size={10} /> Añadir Operador
              </button>
            </div>
          </div>
        </article>

        {/* Security Clearance */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Security Clearance
          </span>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="rgb(63 63 70 / 0.5)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="rgb(255 91 58)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - 0.6)}
                />
              </svg>
              <span className="relative font-display text-2xl font-black text-zinc-50">
                L-3
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Nivel de Acceso Táctico
              </span>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                Restricted
              </p>
              <p className="mt-2 max-w-[180px] text-[11px] text-zinc-500">
                Acceso autorizado a misiones clasificadas grado intermedio.
              </p>
            </div>
          </div>
        </article>

        {/* Misiones */}
        <article className="lg:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          {MISSIONS.map((m) => {
            const selected = m.id === pickedMission;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPickedMission(m.id)}
                className={
                  selected
                    ? "relative overflow-hidden rounded-2xl border border-orange-500/60 bg-orange-500/5 p-6 text-left ring-1 ring-orange-500/40"
                    : "relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-left transition hover:border-orange-500/30"
                }
              >
                <div className="flex items-start justify-between">
                  <span
                    className={
                      m.accent === "rose"
                        ? "rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-rose-300"
                        : "rounded-md border border-orange-500/40 bg-orange-500/10 p-2 text-orange-300"
                    }
                  >
                    {m.id === "ghost_shell" ? (
                      <Radio size={14} />
                    ) : (
                      <Database size={14} />
                    )}
                  </span>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-950">
                      <CheckCircle2 size={10} /> Seleccionada
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-bold text-zinc-50">{m.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{m.description}</p>
                <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em]">
                  <span
                    className={
                      m.diff === "EXTREMA" ? "text-rose-400" : "text-orange-300"
                    }
                  >
                    Dificultad · {m.diff}
                  </span>
                  <span className="text-zinc-300">
                    {m.points.toLocaleString()} pts
                  </span>
                </div>
              </button>
            );
          })}
        </article>

        {/* Terms */}
        <article className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <label className="flex cursor-pointer items-start gap-3 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-orange-500"
            />
            <span>
              <span className="font-bold uppercase tracking-[0.18em] text-zinc-100">
                Terms of Engagement.
              </span>{" "}
              Acepto que cualquier brecha de protocolo resultará en la
              desconexión inmediata y revocación de credenciales.
            </span>
          </label>
        </article>

        <div className="lg:col-span-2 flex items-center justify-end gap-3">
          <Link
            href="/arena/events"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 hover:border-rose-500/40"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
          >
            <Crosshair size={14} /> Register for Operation <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* Footer cards */}
      <section className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
        <FooterCard
          icon={<HardDrive size={14} />}
          title="Historial de Misiones"
          description="Revisa tu registro de operaciones anteriores y los créditos obtenidos."
        />
        <FooterCard
          icon={<Cpu size={14} />}
          title="Hardware Autorizado"
          description="Solo equipos verificados pueden desplegar laboratorios remotos."
        />
        <FooterCard
          icon={<AlertTriangle size={14} />}
          title="Alianzas Estratégicas"
          description="Coordina respaldo con otros escuadrones del Cyber Tactical Network."
        />
      </section>

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

function FooterCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-orange-400">
        {icon} {title}
      </span>
      <p className="mt-2 text-xs text-zinc-500">{description}</p>
    </article>
  );
}
