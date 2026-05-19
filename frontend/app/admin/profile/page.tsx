"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { auth as authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Toast from "@/components/ui/Toast";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  instructor: "Instructor",
  competitor: "Competidor",
};

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, loadUser, logout, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<
    { message: string; variant: "success" | "error" } | null
  >(null);

  if (!isLoading && user && displayName === "" && user.display_name) {
    setDisplayName(user.display_name);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe({
        display_name: displayName,
        bio,
        country,
        avatar_url: avatarUrl,
      });
      await loadUser();
      setToast({ message: "Cambios guardados.", variant: "success" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Error.";
      setToast({ message: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-10 py-10">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // PERFIL
        </span>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Mi cuenta
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Información personal y seguridad de tu cuenta de{" "}
          <span className="text-zinc-300">{ROLE_LABEL[user.role] ?? user.role}</span>.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
            <UserIcon size={14} className="text-red-400" /> Perfil
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-500">
            <Info label="Usuario" value={user.username} />
            <Info label="Correo" value={user.email} />
            <Info label="Rol" value={ROLE_LABEL[user.role] ?? user.role} />
            <Info
              label="Estado"
              value={user.is_active ? "Activo" : "Desactivado"}
            />
          </div>

          <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
            <Field label="Nombre visible">
              <input
                maxLength={100}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.username}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field label="Biografía">
              <textarea
                maxLength={500}
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe tu rol o áreas de responsabilidad..."
                className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field label="País">
              <input
                maxLength={64}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Bolivia"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-50 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <Field label="URL de avatar">
              <input
                type="url"
                maxLength={512}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 font-mono text-xs text-zinc-200 focus:border-red-500/40 focus:outline-none"
              />
            </Field>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </article>

        <div className="flex flex-col gap-6">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              <ShieldCheck size={14} className="text-red-400" /> Seguridad
            </h2>
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Autenticación de dos factores
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {user.mfa_enabled
                      ? "Tu cuenta está protegida con 2FA."
                      : "Añade una capa extra de seguridad."}
                  </p>
                </div>
                {user.mfa_enabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                    Activado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                    Inactivo
                  </span>
                )}
              </div>
              {!user.mfa_enabled && (
                <Link
                  href="/mfa-setup"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-red-400"
                >
                  <KeyRound size={12} /> Activar 2FA
                </Link>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
              <AlertTriangle size={14} className="text-rose-400" /> Sesión
            </h2>
            <p className="mt-3 text-xs text-zinc-500">
              Cierra la sesión activa en este dispositivo.
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-300 hover:bg-rose-500/20"
            >
              <LogOut size={12} /> Cerrar sesión
            </button>
          </article>
        </div>
      </div>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <p className="mt-1 truncate text-xs text-zinc-200">{value}</p>
    </div>
  );
}
