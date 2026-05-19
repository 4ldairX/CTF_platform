"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Award, BellRing, CheckCircle2, Crown, Loader2, Medal, Plus, Star, X } from "lucide-react";
import { adminEvents, ApiError, teams as teamsApi } from "@/lib/api";
import type { RewardKind, RewardOut, TeamOut } from "@/lib/types";

const KIND_META: Record<
  RewardKind,
  { label: string; icon: React.ReactNode; color: string }
> = {
  first_place: {
    label: "Primer lugar",
    icon: <Crown size={14} />,
    color: "text-amber-400",
  },
  second_place: {
    label: "Segundo lugar",
    icon: <Medal size={14} />,
    color: "text-zinc-300",
  },
  third_place: {
    label: "Tercer lugar",
    icon: <Award size={14} />,
    color: "text-orange-600",
  },
  honorable: {
    label: "Mención honorífica",
    icon: <Star size={14} />,
    color: "text-cyan-400",
  },
  special: {
    label: "Especial",
    icon: <Star size={14} />,
    color: "text-violet-400",
  },
};

export default function RewardsTab({
  eventId,
  onToast,
}: {
  eventId: string;
  onToast: (msg: string, variant: "success" | "error") => void;
}) {
  const [rewards, setRewards] = useState<RewardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantOpen, setGrantOpen] = useState(false);

  async function reload() {
    try {
      setRewards(await adminEvents.listRewards(eventId));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">Recompensas</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Otorga recompensas a equipos o jugadores. Al guardar, los ganadores
            son notificados automáticamente y se acreditan los puntos bonus.
          </p>
        </div>
        <button
          onClick={() => setGrantOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
        >
          <Plus size={12} /> Otorgar recompensa
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-zinc-500" />
        </div>
      ) : rewards.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 py-12 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
          Sin recompensas otorgadas
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {rewards.map((r) => {
            const meta = KIND_META[r.kind];
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={meta.color}>{meta.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-zinc-50">{r.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      {meta.label} · {r.team_name ?? r.username ?? "—"}
                      {r.points_bonus > 0 ? ` · +${r.points_bonus} pts` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    r.notified
                      ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300"
                      : "inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500"
                  }
                >
                  {r.notified ? (
                    <>
                      <CheckCircle2 size={11} /> Notificado
                    </>
                  ) : (
                    <>
                      <BellRing size={11} /> Pendiente
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {grantOpen && (
        <GrantRewardModal
          eventId={eventId}
          onClose={() => setGrantOpen(false)}
          onGranted={async () => {
            setGrantOpen(false);
            await reload();
            onToast(
              "Recompensa otorgada. Ganador notificado y puntos acreditados.",
              "success",
            );
          }}
          onError={(msg) => onToast(msg, "error")}
        />
      )}
    </article>
  );
}

function GrantRewardModal({
  eventId,
  onClose,
  onGranted,
  onError,
}: {
  eventId: string;
  onClose: () => void;
  onGranted: () => void;
  onError: (msg: string) => void;
}) {
  const [teams, setTeams] = useState<TeamOut[]>([]);
  const [teamId, setTeamId] = useState("");
  const [kind, setKind] = useState<RewardKind>("first_place");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsBonus, setPointsBonus] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    teamsApi.list().then(setTeams).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teamId) {
      setError("Selecciona un equipo.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await adminEvents.grantReward(eventId, {
        team_id: teamId,
        kind,
        title: title.trim() || KIND_META[kind].label,
        description: description.trim(),
        points_bonus: Number(pointsBonus) || 0,
      });
      onGranted();
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setError(msg);
      onError(msg);
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
          <h2 className="font-display text-2xl font-black text-zinc-50">
            Otorgar recompensa
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Field label="Equipo *">
            <select
              required
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            >
              <option value="">Selecciona...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo *">
            <select
              required
              value={kind}
              onChange={(e) => setKind(e.target.value as RewardKind)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            >
              {Object.entries(KIND_META).map(([k, m]) => (
                <option key={k} value={k}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Título del premio">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={KIND_META[kind].label}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          <Field label="Puntos bonus">
            <input
              type="number"
              min="0"
              value={pointsBonus}
              onChange={(e) => setPointsBonus(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
            />
          </Field>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Otorgando..." : "Otorgar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
