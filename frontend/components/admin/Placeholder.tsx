import { Construction } from "lucide-react";

export default function AdminPlaceholder({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-10 py-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
        {kicker}
      </span>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-zinc-50">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-500">{subtitle}</p>

      <article className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-8 py-20 text-center">
        <Construction size={28} className="text-red-400" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          // MÓDULO RESERVADO
        </span>
        <p className="max-w-md text-sm text-zinc-400">
          Este módulo será habilitado en la siguiente iteración del Sprint 5.
          La infraestructura y los permisos ya están aprovisionados.
        </p>
      </article>
    </div>
  );
}
