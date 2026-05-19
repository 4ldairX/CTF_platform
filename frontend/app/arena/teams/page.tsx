"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Search, Shield, Users, X } from "lucide-react";
import { teams as teamsApi, ApiError } from "@/lib/api";
import type { TeamDetailOut, TeamOut } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const ROLE_LABEL: Record<string, string> = {
  captain: "Capitán",
  member: "Miembro",
};

export default function ArenaTeamsPage() {
  const [myTeam, setMyTeam] = useState<TeamDetailOut | null>(null);
  const [allTeams, setAllTeams] = useState<TeamOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  async function reload() {
    try {
      const [my, all] = await Promise.all([
        teamsApi.myTeam(),
        teamsApi.list(),
      ]);
      setMyTeam(my);
      setAllTeams(all);
    } catch {
      // ignore
    }
  }

  async function handleJoin(teamId: string) {
    setJoining(teamId);
    try {
      await teamsApi.join(teamId);
      setToast({ message: "Te uniste al equipo.", variant: "success" });
      await reload();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error al unirse al equipo.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setJoining(null);
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTeams = allTeams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort teams by total points for the public list
  const topTeams = [...allTeams]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="px-10 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-orange-300">
            Equipos
          </span>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
            Mi Equipo
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Forma o únete a un equipo para competir en eventos CTF y sumar puntos en conjunto.
          </p>
        </div>
        {!myTeam && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
          >
            <Plus size={14} /> Crear equipo
          </button>
        )}
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card: mi equipo */}
        <article className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 lg:col-span-5">
          <div className="absolute right-0 top-0 h-56 w-48 bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent blur-2xl" />
          <Shield size={160} className="absolute -right-6 -top-6 text-zinc-800/40" />
          <div className="relative">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-orange-300">
              <span className="size-2 rounded-full bg-orange-300 shadow-[0_0_10px_rgba(255,180,168,0.8)]" />
              {myTeam ? "Equipo actual" : "Sin equipo"}
            </p>
            {myTeam ? (
              <>
                <h2 className="mt-4 break-words font-display text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
                  {myTeam.name.toUpperCase()}
                </h2>
                <p className="mt-2 text-base text-zinc-400">
                  {myTeam.description || "Sin descripción"}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 break-words font-display text-3xl font-black tracking-tight text-zinc-400 md:text-4xl">
                  SIN EQUIPO
                </h2>
                <p className="mt-2 text-base text-zinc-500">
                  Únete a un equipo existente o crea el tuyo para participar en eventos CTF.
                </p>
              </>
            )}
          </div>
          <div className="relative grid grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Miembros
              </p>
              <p className="mt-1 text-3xl font-bold text-zinc-50">
                {myTeam ? myTeam.member_count : "—"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Puntos totales
              </p>
              <p className="mt-1 text-3xl font-bold text-orange-300">
                {myTeam ? myTeam.total_points.toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </article>

        {/* Card: miembros */}
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-10 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-50">Miembros del equipo</h3>
            <p className="text-sm text-zinc-500">
              {myTeam
                ? `${myTeam.member_count} ${myTeam.member_count === 1 ? "miembro" : "miembros"}`
                : "Sin equipo"}
            </p>
          </div>
          {myTeam ? (
            <ul className="mt-6 flex flex-col gap-3">
              {myTeam.members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between rounded-2xl bg-zinc-950/60 p-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-sm font-bold text-white">
                      {m.username.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-50">{m.username}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        {ROLE_LABEL[m.role] ?? m.role} · {m.points.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
              <Users size={32} className="text-zinc-700" />
              <p className="text-sm text-zinc-500">No perteneces a ningún equipo todavía.</p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                <Plus size={12} /> Crear equipo
              </button>
            </div>
          )}
        </article>

        {/* Card: buscar y unirse a otros equipos */}
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 lg:col-span-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-zinc-50">Buscar equipos</h3>
              <p className="mt-1 text-sm text-zinc-500">
                {myTeam
                  ? "Explora otros equipos en la plataforma."
                  : "Encuentra un equipo para unirte y empezar a competir."}
              </p>
            </div>
          </div>
          <div className="relative mt-5">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe el nombre del equipo..."
              className="w-full rounded-full bg-zinc-950/80 py-4 pl-12 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
            {(searchQuery ? filteredTeams : topTeams).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-zinc-100">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {t.member_count}{" "}
                    {t.member_count === 1 ? "miembro" : "miembros"} ·{" "}
                    {t.total_points.toLocaleString()} pts
                  </p>
                </div>
                {myTeam ? (
                  myTeam.id === t.id ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                      Tu equipo
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                      —
                    </span>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={joining === t.id}
                    onClick={() => handleJoin(t.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {joining === t.id ? "..." : "Unirme"}
                  </button>
                )}
              </div>
            ))}
            {(searchQuery ? filteredTeams : topTeams).length === 0 && (
              <p className="col-span-full py-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                {searchQuery
                  ? "Sin resultados"
                  : "No hay equipos registrados"}
              </p>
            )}
          </div>
        </article>
      </section>

      {createOpen && (
        <CreateTeamModal
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await reload();
            setToast({
              message: "Equipo creado. Ahora eres el capitán.",
              variant: "success",
            });
          }}
          onError={(msg) => setToast({ message: msg, variant: "error" })}
        />
      )}

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

function CreateTeamModal({
  onClose,
  onCreated,
  onError,
}: {
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await teamsApi.create({
        name: name.trim(),
        description: description.trim(),
      });
      onCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
        onError(err.detail);
      } else {
        onError("Error de red al crear el equipo.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Nuevo equipo
            </span>
            <h2 className="mt-1 font-display text-2xl font-black text-zinc-50">
              Crear equipo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Nombre del equipo *
            </span>
            <input
              autoFocus
              required
              minLength={3}
              maxLength={64}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Los Hackers"
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm tracking-wider text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Descripción (opcional)
            </span>
            <textarea
              maxLength={500}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del equipo"
              className="mt-2 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-orange-500/40 focus:outline-none"
            />
          </label>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 hover:border-zinc-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Creando..." : "Crear equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
