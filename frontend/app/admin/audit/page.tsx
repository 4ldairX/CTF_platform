"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldAlert,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";
import { admin as adminApi } from "@/lib/api";

type SubmissionRow = {
  id: string;
  username: string;
  challenge_title: string;
  challenge_category: string;
  is_correct: boolean;
  submitted_at: string;
};

type Filter = "ALL" | "CORRECT" | "WRONG";

const FILTERS: Filter[] = ["ALL", "CORRECT", "WRONG"];
const FILTER_LABEL: Record<Filter, string> = {
  ALL: "Todas",
  CORRECT: "Correctas",
  WRONG: "Incorrectas",
};

export default function AdminAuditPage() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.submissions(200);
      setRows(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (filter === "CORRECT" && !r.is_correct) return false;
    if (filter === "WRONG" && r.is_correct) return false;
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      r.username.toLowerCase().includes(q) ||
      r.challenge_title.toLowerCase().includes(q) ||
      r.challenge_category.toLowerCase().includes(q)
    );
  });

  const correct = rows.filter((r) => r.is_correct).length;
  const wrong = rows.length - correct;

  return (
    <div className="px-10 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
            // AUDITORÍA · ENTREGAS
          </span>
          <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
            REGISTRO DE AUDITORÍA
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Registro de todas las entregas de flags — correctas e incorrectas.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 hover:border-red-500/40 hover:text-red-300"
        >
          <RefreshCw size={12} /> Recargar
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            <Terminal size={14} /> Total
          </span>
          <p className="mt-2 font-display text-2xl font-black text-zinc-50">
            {loading ? "…" : rows.length}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-500">
            <CheckCircle2 size={14} /> Correctas
          </span>
          <p className="mt-2 font-display text-2xl font-black text-emerald-300">
            {loading ? "…" : correct}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-rose-500">
            <XCircle size={14} /> Incorrectas
          </span>
          <p className="mt-2 font-display text-2xl font-black text-rose-300">
            {loading ? "…" : wrong}
          </p>
        </article>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2">
          <Search size={14} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuario, reto o categoría..."
            className="flex-1 bg-transparent font-mono text-xs uppercase tracking-[0.14em] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "rounded-full bg-red-500 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-black"
                  : "rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 hover:text-zinc-200"
              }
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <article className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
        <header className="grid grid-cols-[160px_1fr_140px_100px_160px] gap-4 border-b border-zinc-900 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          <span>Usuario</span>
          <span>Reto</span>
          <span>Categoría</span>
          <span className="text-center">Estado</span>
          <span className="text-right">Fecha</span>
        </header>

        {loading ? (
          <div className="py-16 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando entregas...
          </div>
        ) : (
          <ul className="font-mono text-xs">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-[160px_1fr_140px_100px_160px] items-center gap-4 border-b border-zinc-900/80 px-5 py-3 last:border-b-0 hover:bg-red-500/5"
              >
                <span className="font-bold text-zinc-200">{r.username}</span>
                <span className="truncate text-zinc-400">{r.challenge_title}</span>
                <span className="uppercase tracking-[0.14em] text-zinc-600">
                  {r.challenge_category}
                </span>
                <div className="flex justify-center">
                  {r.is_correct ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-emerald-300">
                      <CheckCircle2 size={10} /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-rose-300">
                      <XCircle size={10} /> Falló
                    </span>
                  )}
                </div>
                <span className="text-right text-zinc-600">
                  {new Date(r.submitted_at).toLocaleString("es-BO")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-5 py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            // Sin resultados para el filtro actual
          </div>
        )}

        <footer className="border-t border-zinc-900 bg-zinc-950 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          // mostrando {filtered.length} de {rows.length} registros
        </footer>
      </article>
    </div>
  );
}
