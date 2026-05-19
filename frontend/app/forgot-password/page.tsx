import Link from "next/link";
import { ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-zinc-100">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-zinc-500">
            Por motivos de seguridad la recuperación se hace de forma manual.
          </p>
        </header>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">¿Olvidaste tu contraseña?</p>
              <p className="mt-1 text-amber-100/90">
                Contacta al administrador de la plataforma para restablecerla.
                El reinicio automático por correo aún no está disponible.
              </p>
            </div>
          </div>
        </div>

        <a
          href="mailto:soporte@cyberquest.local"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-red-500/40 hover:text-red-300"
        >
          <Mail size={14} /> soporte@cyberquest.local
        </a>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </Link>
      </div>
    </AuthShell>
  );
}
