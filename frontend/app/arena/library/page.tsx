import { BookOpen, ShieldHalf, Wrench } from "lucide-react";

export default function ArenaLibraryPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Recursos
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Biblioteca
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Repositorio de guías rápidas, payloads y referencias para resolver retos
        de CTF.
      </p>

      <section className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
        <Wrench size={36} className="text-amber-400" />
        <h2 className="mt-4 text-xl font-bold text-zinc-100">Próximamente</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          Estamos preparando una biblioteca curada con material de apoyo para
          cada categoría. Mientras tanto, puedes consultar al{" "}
          <span className="text-orange-300">Tutor IA</span> desde el menú.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Capability
          icon={<BookOpen size={14} className="text-orange-400" />}
          title="Cheatsheets por categoría"
          description="Web, pwn, criptografía, forense, reversing, OSINT."
        />
        <Capability
          icon={<ShieldHalf size={14} className="text-orange-400" />}
          title="Payloads de referencia"
          description="Plantillas listas para usar en cada tipo de reto."
        />
        <Capability
          icon={<BookOpen size={14} className="text-orange-400" />}
          title="Guías paso a paso"
          description="Procesos típicos de resolución, con ejemplos."
        />
      </section>
    </div>
  );
}

function Capability({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {icon} {title}
      </span>
      <p className="mt-2 text-xs text-zinc-400">{description}</p>
    </article>
  );
}
