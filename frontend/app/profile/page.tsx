"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Sparkle,
  Target,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { auth as authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MyStats, MySubmission } from "@/lib/types";
import Toast from "@/components/ui/Toast";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  instructor: "Instructor",
  moderator: "Moderador",
  competitor: "Competidor",
};

const CATEGORY_LABEL: Record<string, string> = {
  web: "Web",
  pwn: "Pwn",
  crypto: "Criptografía",
  forensics: "Forense",
  reverse: "Reversing",
  misc: "Misceláneo",
  osint: "OSINT",
};

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return `${seconds}s atrás`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function ProfilePage() {
  const { user, isLoading, loadUser } = useAuth();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([authApi.myStats(), authApi.mySubmissions(10)])
      .then(([s, subs]) => {
        setStats(s);
        setSubmissions(subs);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
          Cargando perfil...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
          No autenticado.
        </span>
      </div>
    );
  }

  // Compute category distribution from real submissions
  const correctByCategory = submissions
    .filter((s) => s.is_correct)
    .reduce<Record<string, number>>((acc, s) => {
      acc[s.challenge_category] = (acc[s.challenge_category] ?? 0) + 1;
      return acc;
    }, {});
  const topCategories = Object.entries(correctByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxCount = Math.max(1, ...topCategories.map(([, c]) => c));

  return (
    <div className="px-10 py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Identity */}
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-500/40 to-transparent" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-44 w-44 rounded-2xl border border-red-500/40 object-cover"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-br from-cyan-400/30 via-cyan-700/20 to-zinc-950">
                  <Sparkle size={56} className="text-cyan-200" />
                </div>
              )}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-red-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-950">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                En línea
              </span>
              <h1 className="mt-3 font-display text-5xl font-black tracking-tight text-zinc-50">
                {user.display_name ?? user.username}
              </h1>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                {user.bio ?? `@${user.username} · ${user.email}`}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
                >
                  <Edit3 size={12} /> Editar perfil
                </button>
                <Stat label="Puntos" value={user.points.toLocaleString()} />
                <Stat
                  label="Miembro desde"
                  value={new Date(user.created_at).toLocaleDateString("es-BO")}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Quick stats */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Estadísticas
          </span>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <BigStat
              icon={<CheckCircle2 size={16} className="text-emerald-400" />}
              label="Resueltos"
              value={loadingData ? "…" : (stats?.correct_submissions ?? 0).toString()}
              accent="text-emerald-300"
            />
            <BigStat
              icon={<XCircle size={16} className="text-rose-400" />}
              label="Fallidos"
              value={loadingData ? "…" : (stats?.wrong_submissions ?? 0).toString()}
              accent="text-rose-300"
            />
            <BigStat
              icon={<Target size={16} className="text-cyan-400" />}
              label="Precisión"
              value={loadingData ? "…" : `${stats?.accuracy ?? 0}%`}
              accent="text-cyan-300"
            />
            <BigStat
              icon={<TrendingUp size={16} className="text-orange-400" />}
              label="Intentos"
              value={loadingData ? "…" : (stats?.total_submissions ?? 0).toString()}
              accent="text-orange-300"
            />
          </div>
        </article>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Specialization */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-base font-bold text-zinc-50">Especialización</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Distribución de retos resueltos por categoría
          </span>

          <div className="mt-6 flex flex-col gap-4">
            {topCategories.length === 0 ? (
              <p className="py-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                Aún no has resuelto retos. ¡A romper cosas!
              </p>
            ) : (
              topCategories.map(([cat, count]) => {
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-300">
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                      <span className="font-mono text-xs text-red-300">
                        {count} {count === 1 ? "reto" : "retos"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Account info */}
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-base font-bold text-zinc-50">Cuenta y seguridad</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Información de la cuenta
          </span>
          <dl className="mt-5 flex flex-col gap-3 font-mono text-xs">
            <Row label="Usuario" value={`@${user.username}`} />
            <Row label="Correo" value={user.email} />
            <Row label="Rol" value={ROLE_LABEL[user.role] ?? user.role} />
            <Row
              label="2FA"
              value={user.mfa_enabled ? "Activado" : "Desactivado"}
              accent={user.mfa_enabled ? "text-emerald-300" : "text-amber-300"}
            />
            <Row
              label="Estado"
              value={user.is_active ? "Activo" : "Suspendido"}
              accent={user.is_active ? "text-emerald-300" : "text-rose-300"}
            />
          </dl>
        </article>
      </div>

      {editOpen && user && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={async () => {
            setEditOpen(false);
            await loadUser();
            setToast({ message: "Perfil actualizado.", variant: "success" });
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

      {/* Activity */}
      <article className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Actividad reciente
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
            {submissions.length} {submissions.length === 1 ? "registro" : "registros"}
          </span>
        </header>
        {loadingData ? (
          <div className="py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Cargando actividad...
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-zinc-600">
            Sin actividad registrada
          </div>
        ) : (
          <ul>
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 border-b border-zinc-900/80 px-6 py-4 last:border-b-0"
              >
                <span
                  className={
                    s.is_correct
                      ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300"
                      : "rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300"
                  }
                >
                  {s.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zinc-50">
                    {s.is_correct ? "Resuelto: " : "Intento fallido: "}
                    {s.challenge_title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                    {CATEGORY_LABEL[s.challenge_category] ?? s.challenge_category} ·{" "}
                    {relativeTime(s.submitted_at)}
                  </span>
                </div>
                <div className="text-right">
                  {s.is_correct ? (
                    <>
                      <span className="font-mono text-sm font-bold text-emerald-300">
                        +{s.challenge_points} pts
                      </span>
                      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
                        Resuelto
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-sm font-bold text-rose-300">
                        Fallido
                      </span>
                      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
                        Reintentar
                      </p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-zinc-500">
        {label}
      </span>
      <p className="font-display text-sm font-bold text-zinc-50">{value}</p>
    </div>
  );
}

function BigStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
          {label}
        </span>
      </div>
      <p className={`mt-1 font-display text-2xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-600 uppercase tracking-[0.22em] text-[10px]">
        {label}
      </dt>
      <dd className={`text-zinc-200 ${accent ?? ""}`}>{value}</dd>
    </div>
  );
}

function EditProfileModal({
  user,
  onClose,
  onSaved,
  onError,
}: {
  user: { display_name: string | null; bio: string | null; country: string | null; avatar_url: string | null };
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [country, setCountry] = useState(user.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe({
        display_name: displayName,
        bio,
        country,
        avatar_url: avatarUrl,
      });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        onError(err.detail);
      } else {
        onError("Error de red al guardar.");
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
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
              // EDIT_PROFILE
            </span>
            <h2 className="mt-1 font-display text-2xl font-black text-zinc-50">
              Editar perfil
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
              Nombre visible
            </span>
            <input
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre o alias"
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Bio
            </span>
            <textarea
              maxLength={500}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Una línea sobre ti..."
              className="mt-2 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              País
            </span>
            <input
              maxLength={64}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Bolivia"
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              URL del avatar
            </span>
            <input
              type="url"
              maxLength={512}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-200 focus:border-red-500/40 focus:outline-none"
            />
          </label>

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
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
