"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { User, Mail, IdCard, Lock, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import type { ToastVariant } from "@/components/ui/Toast";
import { auth as apiAuth, setTokens, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type FormState = {
  fullName: string;
  email: string;
  cadetId: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CADET_ID_RE = /^CQ-\d{2,4}-[A-Z]+$/i;

export default function RegisterPage() {
  const router = useRouter();
  const { loadUser } = useAuth();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    cadetId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(state: FormState): Errors {
    const next: Errors = {};

    if (!state.fullName.trim()) {
      next.fullName = "El nombre completo es obligatorio.";
    } else if (state.fullName.trim().length < 3) {
      next.fullName = "Ingresa al menos 3 caracteres.";
    }

    if (!state.email.trim()) {
      next.email = "El correo es obligatorio.";
    } else if (!EMAIL_RE.test(state.email.trim())) {
      next.email = "Formato de correo inválido (ej. nombre@institucion.edu).";
    }

    if (!state.cadetId.trim()) {
      next.cadetId = "El identificador de cadete es obligatorio.";
    } else if (!CADET_ID_RE.test(state.cadetId.trim())) {
      next.cadetId = "Formato esperado: CQ-990-ALPHA.";
    }

    if (!state.password) {
      next.password = "La contraseña es obligatoria.";
    } else if (state.password.length < 8) {
      next.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!state.confirmPassword) {
      next.confirmPassword = "Confirma tu contraseña.";
    } else if (state.confirmPassword !== state.password) {
      next.confirmPassword = "Las contraseñas no coinciden.";
    }

    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setToast({ message: "Hay errores en el formulario.", variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const tokens = await apiAuth.register({
        username: form.cadetId.trim(),
        email: form.email.trim(),
        password: form.password,
        display_name: form.fullName.trim(),
      });

      setTokens(tokens.access_token, tokens.refresh_token);
      await loadUser();
      setToast({
        message: "Cuenta creada exitosamente. Redirigiendo...",
        variant: "success",
      });
      // New competitors always go to /select
      router.push("/select");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          const detail = err.detail.toLowerCase();
          if (detail.includes("email")) {
            setErrors((prev) => ({
              ...prev,
              email: "Este correo ya está registrado.",
            }));
            setToast({ message: "El correo ya está en uso.", variant: "error" });
          } else if (detail.includes("username")) {
            setErrors((prev) => ({
              ...prev,
              cadetId: "Este identificador ya está tomado.",
            }));
            setToast({
              message: "El identificador de cadete ya está en uso.",
              variant: "error",
            });
          } else {
            setToast({ message: err.detail, variant: "error" });
          }
        } else {
          setToast({ message: err.detail || "Error al crear la cuenta.", variant: "error" });
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
            Crear perfil
          </h2>
          <p className="text-sm text-zinc-500">Ingresa tus datos para registrarte.</p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Nombre completo"
            type="text"
            autoComplete="name"
            placeholder="Ingresa tu nombre completo"
            icon={<User size={16} />}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            error={errors.fullName}
            required
          />

          <Input
            label="Correo institucional"
            type="email"
            autoComplete="email"
            placeholder="nombre@institucion.edu"
            icon={<Mail size={16} />}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Identificador de cadete"
            type="text"
            placeholder="CQ-990-ALPHA"
            icon={<IdCard size={16} />}
            value={form.cadetId}
            onChange={(e) => update("cadetId", e.target.value.toUpperCase())}
            error={errors.cadetId}
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
              required
            />
            <Input
              label="Confirmar"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
            {!submitting && <ArrowRight size={16} />}
          </Button>

          <p className="pt-1 text-center text-sm text-zinc-500">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-red-500 hover:text-red-400"
            >
              Inicia sesión
            </Link>
          </p>
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
