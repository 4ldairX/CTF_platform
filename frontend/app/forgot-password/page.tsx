"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingresa tu correo institucional.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Formato de correo inválido.");
      return;
    }

    setError(undefined);
    setSubmitting(true);
    console.info("[CyberQuest] Solicitud de recuperación (simulada)", email);

    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setToast("Enlace de recuperación enviado a tu correo.");
    }, 700);
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-100">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-zinc-500">
            Te enviaremos un enlace seguro para restablecer tu acceso.
          </p>
        </header>

        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              Si el correo está registrado en CyberQuest, recibirás un enlace de
              recuperación en los próximos minutos.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email institucional"
              type="email"
              icon={<Mail size={16} />}
              placeholder="usuario@emi.edu.bo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar enlace"}
              {!submitting && <ArrowRight size={14} />}
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>

      {toast ? (
        <Toast message={toast} variant="success" onClose={() => setToast(null)} />
      ) : null}
    </AuthShell>
  );
}
