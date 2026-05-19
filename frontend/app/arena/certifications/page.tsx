import { GraduationCap, Wrench } from "lucide-react";

export default function ArenaCertificationsPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Logros
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Certificaciones
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Acreditaciones que validarán tu progreso al completar retos y eventos
        en cada categoría.
      </p>

      <section className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
        <Wrench size={36} className="text-amber-400" />
        <h2 className="mt-4 text-xl font-bold text-zinc-100">Próximamente</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          El sistema de certificaciones (insignias por categoría, niveles y
          umbrales de puntos) está en desarrollo y se habilitará en una próxima
          entrega.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Capability
          title="Insignias por categoría"
          description="Acreditaciones específicas para web, pwn, criptografía, forense, reversing y OSINT."
        />
        <Capability
          title="Niveles progresivos"
          description="Inicial, intermedio y experto según tu desempeño sostenido."
        />
        <Capability
          title="Comprobables"
          description="Cada certificación incluirá un enlace público y verificable."
        />
      </section>
    </div>
  );
}

function Capability({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        <GraduationCap size={14} className="text-orange-400" /> {title}
      </span>
      <p className="mt-2 text-xs text-zinc-400">{description}</p>
    </article>
  );
}
