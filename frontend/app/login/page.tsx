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
import { auth as apiAuth, setTokens, ApiError } from "@/lib/api";
import { useAuth, redirectByRole } from "@/lib/auth";

type Errors = { email?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const { loadUser } = useAuth();
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setToast({ message: "Revisa los campos marcados.", variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiAuth.login(email.trim(), password);

      // MFA required (user already has MFA enabled)
      if ("mfa_required" in result) {
        sessionStorage.setItem("cq_mfa_temp", result.temp_token);
        router.push("/mfa");
        return;
      }

      // Forced MFA setup (privileged role without MFA enabled)
      if ("mfa_setup_required" in result) {
        sessionStorage.setItem("cq_mfa_setup_temp", result.temp_token);
        sessionStorage.setItem("cq_mfa_setup_role", result.role);
        router.push("/mfa-setup");
        return;
      }

      // Full token response
      setTokens(result.access_token, result.refresh_token);
      const user = await loadUser();
      if (!user) {
        setToast({ message: "No se pudo cargar el perfil.", variant: "error" });
        return;
      }
      setToast({ message: "Acceso concedido. Bienvenido a CyberQuest.", variant: "success" });
      redirectByRole(user.role, router);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setToast({ message: "Credenciales incorrectas.", variant: "error" });
        } else if (err.status === 403) {
          setToast({ message: "Cuenta inactiva. Contacta al administrador.", variant: "error" });
        } else {
          setToast({ message: err.detail || "Error al iniciar sesión.", variant: "error" });
        }
      } else {
        setToast({ message: "Error de conexión. Intenta de nuevo.", variant: "error" });
      }
    } finally {
      setSubmitting(false);
    }
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
            type="text"
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
