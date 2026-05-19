"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { courses } from "@/lib/api";
import type { CourseOut } from "@/lib/types";

const LEVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const LEVEL_COLOR: Record<string, string> = {
  basico: "border-emerald-500/30 text-emerald-300",
  intermedio: "border-amber-500/30 text-amber-300",
  avanzado: "border-rose-500/30 text-rose-300",
};

export default function AdminAcademyPage() {
  const [list, setList] = useState<CourseOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courses
      .list()
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const publishedCount = list.filter((c) => c.is_published).length;
  const draftCount = list.length - publishedCount;
  const byAuthor = list.reduce<Record<string, number>>((acc, c) => {
    const k = c.author_username ?? "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // GESTIÓN DE ACADEMIA
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            ACADEMIA
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Vista global de los cursos creados por los instructores. Como
            administrador puedes ver, editar y publicar cualquier curso.
          </p>
        </div>
        <Link
          href="/academy/courses"
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
        >
          Ir a gestión <ArrowRight size={13} />
        </Link>
      </header>

      {loading ? (
        <div className="mt-12 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<BookOpen size={14} className="text-orange-400" />}
              label="Cursos totales"
              value={list.length.toString()}
            />
            <StatCard
              icon={<Eye size={14} className="text-emerald-400" />}
              label="Publicados"
              value={publishedCount.toString()}
            />
            <StatCard
              icon={<EyeOff size={14} className="text-zinc-400" />}
              label="En borrador"
              value={draftCount.toString()}
            />
            <StatCard
              icon={<GraduationCap size={14} className="text-cyan-400" />}
              label="Instructores activos"
              value={Object.keys(byAuthor).filter((k) => k !== "—").length.toString()}
            />
          </section>

          {/* Lista */}
          {list.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-zinc-700" />
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Aún no se han creado cursos
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Los instructores pueden crear cursos desde su panel.
              </p>
            </div>
          ) : (
            <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <header className="grid grid-cols-[1fr_120px_100px_120px_120px] gap-4 border-b border-zinc-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
                <span>Curso</span>
                <span>Nivel</span>
                <span className="text-right">Módulos</span>
                <span>Instructor</span>
                <span>Estado</span>
              </header>
              <ul>
                {list.map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[1fr_120px_100px_120px_120px] items-center gap-4 border-b border-zinc-900/70 px-6 py-4 last:border-b-0 hover:bg-red-500/5"
                  >
                    <Link
                      href={`/academy/courses/${c.id}`}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-bold text-zinc-50">
                        {c.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                        {c.slug}
                      </span>
                    </Link>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${LEVEL_COLOR[c.level] ?? "border-zinc-700 text-zinc-400"}`}
                    >
                      {LEVEL_LABEL[c.level] ?? c.level}
                    </span>
                    <span className="text-right font-mono text-xs text-zinc-300">
                      {c.modules_count}
                    </span>
                    <span className="truncate font-mono text-[11px] text-zinc-400">
                      {c.author_username ?? "—"}
                    </span>
                    <span
                      className={
                        c.is_published
                          ? "inline-flex w-fit items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                          : "inline-flex w-fit rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                      }
                    >
                      {c.is_published ? (
                        <>
                          <CheckCircle2 size={10} /> Publicado
                        </>
                      ) : (
                        "Borrador"
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-2 font-display text-2xl font-black text-zinc-50">{value}</p>
    </article>
  );
}
