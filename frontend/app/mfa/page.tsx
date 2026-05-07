"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";

export default function MfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.replace(/\s/g, "").length < 6) {
      setError("El código debe tener 6 dígitos.");
      setToast({
        message: "Código incompleto.",
        variant: "error",
      });
      return;
    }
    setError(null);
    setSubmitting(true);
    console.info("[CyberQuest] MFA válido (simulado)", { code });
    window.setTimeout(() => {
      setSubmitting(false);
      setToast({ message: "Identidad verificada.", variant: "success" });
      router.push("/select");
    }, 600);
  }

  function update(value: string) {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(sanitized);
    if (error) setError(null);
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-lg font-semibold text-zinc-100">
            Verificación en dos pasos
          </h2>
          <p className="text-sm text-zinc-500">
            Introduce el código de 6 dígitos generado por tu autenticador.
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
              Código de Verificación
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                value={code}
                onChange={(e) => update(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 py-4 pl-11 pr-4 text-center font-mono text-2xl tracking-[0.5em] text-zinc-50 placeholder:text-zinc-700 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30"
              />
            </div>
            {error ? (
              <span className="text-xs text-rose-400">{error}</span>
            ) : null}
          </div>

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Verificando..." : "Verificar"}
            {!submitting && <ArrowRight size={16} />}
          </Button>

          <div className="flex flex-col items-center gap-2 pt-1 text-sm">
            <button
              type="button"
              onClick={() =>
                setToast({
                  message: "Nuevo código enviado a tu autenticador.",
                  variant: "success",
                })
              }
              className="text-zinc-400 transition hover:text-zinc-200"
            >
              ¿No recibiste el código?{" "}
              <span className="font-medium text-red-500 hover:text-red-400">
                Reenviar el código
              </span>
            </button>
            <Link
              href="/login"
              className="text-xs uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400"
            >
              Volver a inicio de sesión
            </Link>
          </div>
        </form>
      </div>

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </AuthShell>
  );
}
