"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bug,
  CheckCircle2,
  Eye,
  FileSearch,
  Flame,
  Key,
  Loader2,
  Search,
  ShieldOff,
  Sparkles,
  Skull,
  Terminal,
} from "lucide-react";
import { auth as authApi, challenges as challengesApi } from "@/lib/api";
import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeOut,
  MySubmission,
} from "@/lib/types";

const CATEGORY_META: Record<
  ChallengeCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  web: { label: "Web", icon: <Bug size={14} />, color: "text-cyan-400" },
  pwn: { label: "Pwn", icon: <Skull size={14} />, color: "text-rose-400" },
  crypto: { label: "Cripto", icon: <Key size={14} />, color: "text-violet-400" },
  reverse: { label: "Reversing", icon: <Terminal size={14} />, color: "text-amber-400" },
  forensics: { label: "Forense", icon: <FileSearch size={14} />, color: "text-emerald-400" },
  misc: { label: "Misc", icon: <Sparkles size={14} />, color: "text-zinc-300" },
  osint: { label: "OSINT", icon: <Eye size={14} />, color: "text-blue-400" },
};

const DIFFICULTY_META: Record<
  ChallengeDifficulty,
  { label: string; color: string }
> = {
  easy: { label: "Fácil", color: "text-emerald-400" },
  medium: { label: "Media", color: "text-amber-400" },
  hard: { label: "Difícil", color: "text-orange-400" },
  insane: { label: "Insano", color: "text-rose-400" },
};

type StatusFilter = "all" | "solved" | "unsolved";
type SortBy = "newest" | "points_desc" | "points_asc" | "solvers_desc" | "title";

const CATEGORIES: (ChallengeCategory | "all")[] = [
  "all",
  "web",
  "pwn",
  "crypto",
  "reverse",
  "forensics",
  "osint",
  "misc",
];

const DIFFICULTIES: (ChallengeDifficulty | "all")[] = [
  "all",
  "easy",
  "medium",
  "hard",
  "insane",
];

export default function ArenaChallengesPage() {
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";

  const [challenges, setChallenges] = useState<ChallengeOut[]>([]);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ChallengeCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  useEffect(() => {
    Promise.all([challengesApi.list(), authApi.mySubmissions(500).catch(() => [])])
      .then(([ch, subs]) => {
        setChallenges(ch);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const solvedIds = useMemo(() => {
    const s = new Set<string>();
    submissions.forEach((sub) => {
      if (sub.is_correct) s.add(sub.challenge_id);
    });
    return s;
  }, [submissions]);

  const filtered = useMemo(() => {
    let list = [...challenges];

    if (category !== "all") {
      list = list.filter((c) => c.category === category);
    }
    if (difficulty !== "all") {
      list = list.filter((c) => c.difficulty === difficulty);
    }
    if (statusFilter === "solved") {
      list = list.filter((c) => solvedIds.has(c.id));
    } else if (statusFilter === "unsolved") {
      list = list.filter((c) => !solvedIds.has(c.id));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case "points_desc":
        list.sort((a, b) => b.points - a.points);
        break;
      case "points_asc":
        list.sort((a, b) => a.points - b.points);
        break;
      case "solvers_desc":
        list.sort((a, b) => b.solvers_count - a.solvers_count);
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return list;
  }, [challenges, category, difficulty, statusFilter, sortBy, query, solvedIds]);

  const totalSolved = solvedIds.size;
  const totalAvailable = challenges.length;

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
            Catálogo de Retos
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Retos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Explora todos los retos disponibles. Filtra por categoría, dificultad
            y estado para encontrar tu próximo objetivo.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-3 text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Tu progreso
          </p>
          <p className="mt-1 font-display text-2xl font-black text-zinc-50">
            {totalSolved}<span className="text-base text-zinc-500"> / {totalAvailable}</span>
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2">
            <Search size={14} className="text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar reto por nombre o descripción..."
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          {/* Filter rows */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup label="Categoría">
              {CATEGORIES.map((c) => (
                <FilterPill
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c === "all" ? "Todas" : CATEGORY_META[c as ChallengeCategory].label}
                </FilterPill>
              ))}
            </FilterGroup>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup label="Dificultad">
              {DIFFICULTIES.map((d) => (
                <FilterPill
                  key={d}
                  active={difficulty === d}
                  onClick={() => setDifficulty(d)}
                >
                  {d === "all" ? "Todas" : DIFFICULTY_META[d as ChallengeDifficulty].label}
                </FilterPill>
              ))}
            </FilterGroup>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterGroup label="Estado">
              <FilterPill
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </FilterPill>
              <FilterPill
                active={statusFilter === "solved"}
                onClick={() => setStatusFilter("solved")}
              >
                Resueltos
              </FilterPill>
              <FilterPill
                active={statusFilter === "unsolved"}
                onClick={() => setStatusFilter("unsolved")}
              >
                No resueltos
              </FilterPill>
            </FilterGroup>

            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Ordenar por
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 focus:border-orange-500/40 focus:outline-none"
              >
                <option value="newest">Más recientes</option>
                <option value="points_desc">Más puntos</option>
                <option value="points_asc">Menos puntos</option>
                <option value="solvers_desc">Más resueltos</option>
                <option value="title">Alfabético</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-zinc-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
            <ShieldOff size={32} className="mx-auto mb-3 text-zinc-700" />
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              Ningún reto coincide con los filtros
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("all");
                setDifficulty("all");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-full border border-zinc-700 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 hover:border-orange-500/40"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <header className="grid grid-cols-[40px_1fr_140px_110px_100px_100px] gap-4 border-b border-zinc-900 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              <span></span>
              <span>Nombre</span>
              <span>Categoría</span>
              <span>Dificultad</span>
              <span className="text-right">Resoluciones</span>
              <span className="text-right">Puntos</span>
            </header>
            <ul>
              {filtered.map((c) => {
                const solved = solvedIds.has(c.id);
                const cat = CATEGORY_META[c.category];
                const diff = DIFFICULTY_META[c.difficulty];
                return (
                  <li key={c.id}>
                    <Link
                      href={`/arena/challenges/${c.id}`}
                      className="grid grid-cols-[40px_1fr_140px_110px_100px_100px] items-center gap-4 border-b border-zinc-900/70 px-5 py-3 last:border-b-0 transition hover:bg-orange-500/5"
                    >
                      <span className="flex justify-center">
                        {solved ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <span className="size-3 rounded-full border border-zinc-700" />
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">
                          {c.title}
                        </span>
                        {c.is_featured && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-orange-300">
                            <Flame size={9} /> Destacado
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${cat.color}`}>
                        {cat.icon} {cat.label}
                      </span>
                      <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${diff.color}`}>
                        {diff.label}
                      </span>
                      <span className="text-right font-mono text-xs text-zinc-500">
                        {c.solvers_count}
                      </span>
                      <span className="text-right font-mono text-sm font-bold text-zinc-100">
                        {c.points}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <footer className="border-t border-zinc-900 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
              Mostrando {filtered.length} de {challenges.length} retos
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-orange-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-black"
          : "rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 hover:border-orange-500/40 hover:text-orange-300"
      }
    >
      {children}
    </button>
  );
}
