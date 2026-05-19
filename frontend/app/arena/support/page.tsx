import { LifeBuoy, Mail, MessageCircle } from "lucide-react";

export default function ArenaSupportPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Ayuda
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Soporte
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        ¿Necesitas ayuda? Estos son los canales oficiales para reportar
        incidentes o resolver dudas.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <a
          href="mailto:soporte@cyberquest.local"
          className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-orange-500/30"
        >
          <Mail size={18} className="text-orange-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Correo</h3>
            <p className="mt-1 text-xs text-zinc-500">
              soporte@cyberquest.local
            </p>
          </div>
        </a>

        <article className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <MessageCircle size={18} className="text-orange-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Chat en vivo</h3>
            <p className="mt-1 text-xs text-zinc-500">
              De lunes a viernes, 9:00 a 18:00 (próximamente)
            </p>
          </div>
        </article>

        <article className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <LifeBuoy size={18} className="text-orange-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Centro de ayuda</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Preguntas frecuentes y guías rápidas (próximamente)
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
