"use client";

import { Container, Cpu, HardDrive, Network, Server, Wrench } from "lucide-react";

export default function AdminSandboxPage() {
  return (
    <div className="px-10 py-8">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          // INFRAESTRUCTURA SANDBOX
        </span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight text-zinc-50">
          SANDBOX
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Aquí se gestionarán los nodos de cómputo, contenedores Docker y redes
          virtuales asignadas a los retos. El módulo aún está en desarrollo.
        </p>
      </header>

      <section className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
        <Wrench size={36} className="text-amber-400" />
        <h2 className="mt-4 text-xl font-bold text-zinc-100">
          Próximamente
        </h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          La orquestación de entornos de práctica (despliegue de contenedores por
          reto, redes aisladas, control de recursos) se incorporará en una
          próxima entrega.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
          Capacidades planificadas
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Capability
            icon={<Server size={14} className="text-red-400" />}
            title="Nodos de cómputo"
            description="Monitoreo de salud, CPU y RAM por nodo."
          />
          <Capability
            icon={<Container size={14} className="text-red-400" />}
            title="Contenedores"
            description="Despliegue automático por reto activo."
          />
          <Capability
            icon={<Network size={14} className="text-red-400" />}
            title="Redes virtuales"
            description="Asignación de VLAN/VPN por equipo o evento."
          />
          <Capability
            icon={<HardDrive size={14} className="text-red-400" />}
            title="Almacenamiento"
            description="Volúmenes persistentes para artefactos y logs."
          />
          <Capability
            icon={<Cpu size={14} className="text-red-400" />}
            title="Imágenes Docker"
            description="Catálogo versionado de imágenes por categoría."
          />
        </div>
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
