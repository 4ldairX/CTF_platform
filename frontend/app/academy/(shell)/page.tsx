"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  History,
  Loader2,
  Plus,
} from "lucide-react";
import { ai, courses } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CourseOut } from "@/lib/types";

const LEVEL_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export default function AcademyHomePage() {
  const { user } = useAuth();
  const [courseList, setCourseList] = useState<CourseOut[]>([]);
  const [docsCount, setDocsCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courses.list().catch(() => []),
      ai.listDocuments().catch(() => []),
      ai.history(100).catch(() => []),
    ])
      .then(([c, d, h]) => {
        setCourseList(c);
        setDocsCount(d.length);
        setHistoryCount(h.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const myCourses = user
    ? courseList.filter((c) => c.author_username === user.username)
    : courseList;
  const publishedCount = courseList.filter((c) => c.is_published).length;
  const draftCount = courseList.length - publishedCount;
  const displayName = user?.display_name ?? user?.username ?? "instructor";

  return (
    <div className="px-10 py-10">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
          Panel del instructor
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Hola, <span className="text-orange-400">{displayName}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Gestiona los cursos y módulos de aprendizaje de la plataforma. Sube
          documentos para mejorar al tutor IA y revisa el historial de
          consultas de los competidores.
        </p>
      </header>

      {/* Stats */}
      {loading ? (
        <div className="mt-8 flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen size={14} className="text-orange-400" />}
            label="Cursos totales"
            value={courseList.length.toString()}
          />
          <StatCard
            icon={<GraduationCap size={14} className="text-emerald-400" />}
            label="Publicados"
            value={publishedCount.toString()}
          />
          <StatCard
            icon={<FileText size={14} className="text-cyan-400" />}
            label="Documentos IA"
            value={docsCount.toString()}
          />
          <StatCard
            icon={<History size={14} className="text-amber-400" />}
            label="Consultas IA"
            value={historyCount.toString()}
          />
        </section>
      )}

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Mis cursos */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <header className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-50">Mis cursos</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {myCourses.length}{" "}
                {myCourses.length === 1 ? "curso creado" : "cursos creados"} ·{" "}
                {draftCount} en borrador
              </p>
            </div>
            <Link
              href="/academy/courses"
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-300 hover:text-orange-200"
            >
              Ver todos →
            </Link>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-zinc-500" />
            </div>
          ) : myCourses.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 py-12 text-center">
              <BookOpen size={28} className="text-zinc-700" />
              <p className="text-sm text-zinc-500">
                Aún no has creado ningún curso.
              </p>
              <Link
                href="/academy/courses"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                <Plus size={12} /> Crear primer curso
              </Link>
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-2">
              {myCourses.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/academy/courses/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 transition hover:border-orange-500/40"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-50">
                        {c.title}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        {LEVEL_LABEL[c.level] ?? c.level} · {c.duration_hours}h ·{" "}
                        {c.modules_count} módulos
                      </p>
                    </div>
                    <span
                      className={
                        c.is_published
                          ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                          : "rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                      }
                    >
                      {c.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Atajos */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-bold text-zinc-50">Atajos</h2>
          <div className="mt-4 flex flex-col gap-2">
            <QuickLink
              href="/academy/courses"
              label="Gestionar cursos"
              icon={<BookOpen size={14} />}
            />
            <QuickLink
              href="/academy/ai-documents"
              label="Subir documentos IA"
              icon={<FileText size={14} />}
            />
            <QuickLink
              href="/academy/ai-history"
              label="Ver consultas IA"
              icon={<History size={14} />}
            />
          </div>
        </article>
      </section>
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
      <p className="mt-2 font-display text-2xl font-black text-zinc-50">
        {value}
      </p>
    </article>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-300"
    >
      <span className="inline-flex items-center gap-2">
        {icon} {label}
      </span>
      <ArrowRight size={12} />
    </Link>
  );
}
