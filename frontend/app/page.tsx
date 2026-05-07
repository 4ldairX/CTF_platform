import Link from "next/link";
import {
  ArrowRight,
  Box,
  Briefcase,
  Cpu,
  Gavel,
  Play,
  ScanLine,
  ShieldHalf,
  Target,
} from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <main className="relative">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 cq-bg-rays opacity-90" />
          <div className="pointer-events-none absolute inset-0 cq-bg-grid opacity-30" />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16">
            <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-red-300">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-400" />
              Sistema online · 24/7
            </span>
            <h1 className="text-center text-5xl font-black leading-[0.95] tracking-tight text-zinc-50 md:text-7xl">
              DOMINA EL{" "}
              <span className="bg-gradient-to-b from-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                CAOS DIGITAL
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-center text-base text-zinc-400">
              CyberQuest es una plataforma de entrenamiento virtualizado diseñada
              para forjar la próxima generación de guerreros del hacking ético.
              Simulación. Ética. Riesgo real.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-white"
              >
                <Play size={14} /> Iniciar simulación
              </Link>
              <Link
                href="#protocolos"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                Ver protocolos <ArrowRight size={14} />
              </Link>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-1">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 450%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22><stop offset=%220%22 stop-color=%22%23052e3a%22/><stop offset=%221%22 stop-color=%22%23000%22/></linearGradient></defs><rect width=%22800%22 height=%22450%22 fill=%22url(%23g)%22/></svg>')] bg-cover">
                  <div className="absolute inset-0 cq-bg-grid opacity-25" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent" />
                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200">
                    <ScanLine size={12} /> Live Sandbox
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3 font-mono text-[10px]">
                    <Pill label="Network Latency" value="14 ms" />
                    <Pill label="Active Operators" value="1,024" />
                    <Pill label="VPN Tunnel" value="STABLE" tone="cyan" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quienes somos */}
        <section className="relative border-t border-zinc-900 py-24" id="network">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
                La Comunidad
              </span>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-50">
                Quiénes Somos
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                No somos solo una plataforma; somos un colectivo de ingenieros y
                especialistas en ciberseguridad dedicados a cerrar la brecha
                entre la academia y la trinchera profesional.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                En CyberQuest, transformamos la teoría estática en destreza
                táctica. Nuestra misión es democratizar el acceso a infraestructura
                de seguridad crítica en un entorno controlado y de alto rendimiento.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
              <div className="absolute inset-0 cq-bg-grid opacity-30" />
              <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center gap-3">
                <Cpu size={48} className="text-zinc-600" />
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  Cyber Tactical Infrastructure
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Objetivos */}
        <section
          className="relative border-t border-zinc-900 py-24"
          id="threats"
        >
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-4xl font-black tracking-tight text-zinc-50">
              OBJETIVOS TÁCTICOS
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-500">
              Desarrolla la hoja de ruta para la excelencia técnica.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ObjectiveCard
                eyebrow="HU 01"
                title="Fortalecimiento de Habilidades Ofensivas y Defensivas"
                description="Entrenamiento táctico a través de retos en escalada. Empuja la especialización de Red Team en escenarios de 360° donde la lógica reemplaza a la intuición."
                icon={<ShieldHalf size={18} />}
              />
              <BigStatCard value="99.9%" label="Uptime de simulación" />
              <ObjectiveCard
                eyebrow="HU 03"
                title="Entorno Sandbox Aislado"
                description="Cada equipo recibe el aislamiento 100% seguro. Tu destreza no compromete redes reales: aislamiento por namespaces y reglas iptables."
                icon={<Box size={18} />}
              />
              <SolidCard
                title="PRÁCTICA PROFESIONAL"
                description="Bridging the gap between theory and real-world execution."
                icon={<Briefcase size={18} />}
              />
            </div>
          </div>
        </section>

        {/* Responsabilidad */}
        <section
          className="relative border-t border-zinc-900 py-24"
          id="inteligencia"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Gavel className="mx-auto mb-4 text-red-400" size={28} />
            <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-zinc-50">
              RESPONSABILIDAD <br />
              DIGITAL
            </h2>
            <p className="mx-auto mt-6 text-sm text-zinc-400">
              En un mundo donde el código es ley, la ética no es opcional.
              CyberQuest nace de la necesidad imperante de proteger los activos
              digitales más valiosos de la sociedad.
            </p>
            <p className="mx-auto mt-4 text-sm text-zinc-500">
              Nuestra formación se rige en un estricto código de conducta:
              enseñamos a comprender la vulnerabilidad para construir una
              defensa inexpugnable. El poder es no incidente cuestiona la
              responsabilidad de proteger lo autónomo.
            </p>
            <Link
              href="#"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-red-500/60 hover:text-red-300"
            >
              <Target size={14} /> Certificación Ética Integral
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function Pill({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string;
  tone?: "zinc" | "cyan";
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-black/60 px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </div>
      <div
        className={
          tone === "cyan"
            ? "mt-0.5 text-cyan-300"
            : "mt-0.5 text-zinc-200"
        }
      >
        {value}
      </div>
    </div>
  );
}

function ObjectiveCard({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-400">
          {eyebrow}
        </span>
        <span className="rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-500">
          {icon}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-zinc-50">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{description}</p>
    </article>
  );
}

function BigStatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="font-display text-6xl font-black tracking-tight text-red-500">
            {value}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            {label}
          </div>
          <div className="mx-auto mt-3 h-px w-16 bg-red-500/40" />
        </div>
      </div>
    </article>
  );
}

function SolidCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl bg-red-500 p-6 text-zinc-950">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-900/80">
          PRÁCTICA
        </span>
        <span className="rounded-md bg-black/15 p-1.5">{icon}</span>
      </div>
      <h3 className="mt-3 text-2xl font-black tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-900/80">{description}</p>
    </article>
  );
}
