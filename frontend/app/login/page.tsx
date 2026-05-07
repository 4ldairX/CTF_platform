"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";

type Errors = { email?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = "El correo es obligatorio.";
    if (!password) next.password = "La contraseña es obligatoria.";
    return next;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setToast({
        message: "Revisa los campos marcados.",
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    // Simulación de validación de credenciales (include "Validar credenciales")
    console.info("[CyberQuest] Credenciales válidas (simulado)", {
      email,
      passwordLength: password.length,
    });

    window.setTimeout(() => {
      setSubmitting(false);
      setToast({
        message: "Acceso concedido. Bienvenido a CyberQuest.",
        variant: "success",
      });
      router.push("/mfa");
    }, 600);
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-100">
            Iniciar sesión
          </h2>
          <p className="text-sm text-zinc-500">
            Acceso seguro a la plataforma de entrenamiento.
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email institucional"
            type="email"
            autoComplete="email"
            placeholder="usuario@emi.edu.bo"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Verificando..." : "Entrar"}
            {!submitting && <ArrowRight size={16} />}
          </Button>

          <div className="flex flex-col items-center gap-3 pt-1 text-sm">
            <Link
              href="/forgot-password"
              className="text-zinc-400 hover:text-zinc-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-zinc-500">
              ¿Eres nuevo en CyberQuest?{" "}
              <Link
                href="/register"
                className="font-medium text-red-500 hover:text-red-400"
              >
                Crea una cuenta
              </Link>
            </p>
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
