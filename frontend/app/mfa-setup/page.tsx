"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Copy, KeyRound, ShieldAlert } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";
import { auth as apiAuth, ApiError } from "@/lib/api";
import { useAuth, redirectByRole } from "@/lib/auth";

type Stage = "loading" | "scan" | "verify";

export default function MfaSetupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [stage, setStage] = useState<Stage>("loading");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [role, setRole] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  useEffect(() => {
    const temp = sessionStorage.getItem("cq_mfa_setup_temp");
    const r = sessionStorage.getItem("cq_mfa_setup_role");
    if (!temp) {
      router.push("/login");
      return;
    }
    setRole(r ?? "");

    apiAuth
      .mfaForceSetupStart(temp)
      .then((data) => {
        setSecret(data.secret);
        setUri(data.uri);
        setStage("scan");
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setToast({ message: err.detail, variant: "error" });
        } else {
          setToast({ message: "Error al iniciar configuración MFA.", variant: "error" });
        }
        sessionStorage.removeItem("cq_mfa_setup_temp");
        sessionStorage.removeItem("cq_mfa_setup_role");
        window.setTimeout(() => router.push("/login"), 1500);
      });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const temp = sessionStorage.getItem("cq_mfa_setup_temp");
    if (!temp) {
      router.push("/login");
      return;
    }

    try {
      const tokens = await apiAuth.mfaForceSetupConfirm(temp, trimmed);
      sessionStorage.removeItem("cq_mfa_setup_temp");
      sessionStorage.removeItem("cq_mfa_setup_role");
      const user = await login(tokens);
      if (!user) {
        setToast({ message: "MFA configurado, pero no se pudo cargar el perfil.", variant: "error" });
        return;
      }
      setToast({ message: "MFA activado correctamente.", variant: "success" });
      redirectByRole(user.role, router);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
        setToast({ message: err.detail, variant: "error" });
      } else {
        setToast({ message: "Error de red.", variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).then(() => {
      setToast({ message: "Secret copiado al portapapeles.", variant: "success" });
    });
  }

  // QR via external service (data url not generated server-side)
  const qrUrl = uri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`
    : "";

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300">
            <ShieldAlert size={11} /> MFA obligatorio
          </span>
          <h2 className="text-lg font-semibold text-zinc-100">
            Configurar autenticación de dos factores
          </h2>
          <p className="text-sm text-zinc-500">
            Tu rol{" "}
            <span className="font-bold text-amber-300">
              {role || "privilegiado"}
            </span>{" "}
            requiere MFA. Escanea el código con Google Authenticator, Authy o
            similar.
          </p>
        </header>

        {stage === "loading" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-8 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
              Generando secreto...
            </span>
          </div>
        )}

        {stage === "scan" && (
          <>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="QR de configuración MFA"
                  className="h-44 w-44 rounded-md bg-white p-2"
                />
              )}
              <div className="w-full">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  Secret manual
                </p>
                <button
                  type="button"
                  onClick={copySecret}
                  className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 hover:border-amber-500/40"
                >
                  <span className="truncate">{secret}</span>
                  <Copy size={12} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Código de 6 dígitos
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 focus-within:border-amber-500/40">
                  <KeyRound size={14} className="text-zinc-500" />
                  <input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    className="flex-1 bg-transparent font-mono text-lg tracking-[0.4em] text-zinc-50 placeholder:text-zinc-700 focus:outline-none"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-xs text-rose-400">{error}</p>
                )}
              </label>

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Verificando..." : "Activar MFA y entrar"}
                {!submitting && <ArrowRight size={16} />}
              </Button>
            </form>
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </AuthShell>
  );
}
