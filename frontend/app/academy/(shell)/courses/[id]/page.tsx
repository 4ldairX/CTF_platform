"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Folder,
  Hexagon,
  Lock,
  Play,
  ScanLine,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react";

const COURSES: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    duration: string;
    level: string;
    certificate: string;
    objectives: string[];
    modules: {
      id: string;
      idx: string;
      title: string;
      description?: string;
      icon: React.ReactNode;
      status: "active" | "available" | "locked" | "completed";
    }[];
  }
> = {
  linux: {
    eyebrow: "CURRICULUM",
    title: "Fundamentos\nde Linux",
    description:
      "Master the core of the operating system with a high-intensity master-grade course for the next generation of operatives.",
    duration: "12 Hours",
    level: "Hard",
    certificate: "L3 Intermediate",
    objectives: [
      "Terminal mastery: command line is your weapon, not a tool.",
      "System concepts: processes, signals, namespaces and isolation.",
      "Filesystem & permissions: the trust boundary of every operative.",
    ],
    modules: [
      {
        id: "01",
        idx: "MODULE 01",
        title: "Introduction to the Linux Kernel",
        description:
          "Deep dive into the architecture, role and internal communication of the Linux kernel. Understanding monolithic vs microkernels.",
        icon: <Hexagon size={16} />,
        status: "active",
      },
      {
        id: "02",
        idx: "MODULE 02",
        title: "Filesystem Navigation Master",
        icon: <Folder size={16} />,
        status: "available",
      },
      {
        id: "03",
        idx: "MODULE 03",
        title: "Permissions & Capabilities",
        icon: <Shield size={16} />,
        status: "locked",
      },
      {
        id: "04",
        idx: "MODULE 04",
        title: "Process Management",
        icon: <ScanLine size={16} />,
        status: "locked",
      },
    ],
  },
  redes: {
    eyebrow: "CURRICULUM",
    title: "Redes\nOfensivas",
    description:
      "Pivot, tunnel and persist across hostile networks. Build a tactical playbook for offensive operators.",
    duration: "16 Hours",
    level: "Expert",
    certificate: "L4 Advanced",
    objectives: [
      "Recon and enumeration in segmented infrastructure.",
      "Lateral movement under EDR and detection constraints.",
      "Persistent footholds without compromising operational security.",
    ],
    modules: [
      {
        id: "01",
        idx: "MODULE 01",
        title: "Network Reconnaissance Patterns",
        description: "Active and passive scanning with stealth techniques.",
        icon: <ScanLine size={16} />,
        status: "active",
      },
      {
        id: "02",
        idx: "MODULE 02",
        title: "Pivoting Through Compromised Hosts",
        icon: <Terminal size={16} />,
        status: "locked",
      },
      {
        id: "03",
        idx: "MODULE 03",
        title: "Tunneling & Encrypted Channels",
        icon: <Shield size={16} />,
        status: "locked",
      },
    ],
  },
  crypto: {
    eyebrow: "CURRICULUM",
    title: "Criptografía\nAplicada",
    description:
      "From Caesar to RSA: the math behind modern crypto and the misimplementations that break it.",
    duration: "10 Hours",
    level: "Intermediate",
    certificate: "L3 Intermediate",
    objectives: [
      "Build intuition for modular arithmetic.",
      "Identify weak crypto patterns in real implementations.",
      "Understand the cost-benefit of every protocol decision.",
    ],
    modules: [
      {
        id: "01",
        idx: "MODULE 01",
        title: "Modular Arithmetic Fundamentals",
        icon: <Hexagon size={16} />,
        status: "available",
      },
      {
        id: "02",
        idx: "MODULE 02",
        title: "Symmetric Ciphers",
        icon: <Shield size={16} />,
        status: "locked",
      },
    ],
  },
};

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const course = COURSES[id] ?? COURSES.linux;
  const completed = course.modules.filter((m) => m.status === "completed").length;
  const total = course.modules.length;

  return (
    <div className="px-10 py-10">
      <Link
        href="/academy"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500 hover:text-zinc-200"
      >
        ← Back to Courses
      </Link>

      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div className="absolute inset-0 cq-bg-grid opacity-25" />
        <div className="absolute -right-20 -top-10 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-10 p-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              {course.eyebrow}
            </span>
            <h1 className="mt-3 whitespace-pre-line font-display text-5xl font-black leading-[0.95] tracking-tight text-zinc-50 md:text-6xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-md text-sm text-zinc-400">
              {course.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/academy/courses/${id}/lessons/${course.modules[0].id}`}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
              >
                <Play size={14} /> Start Learning
              </Link>
              <button className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 hover:border-orange-500/40">
                View Syllabus
              </button>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3">
              <Stat
                icon={<Clock size={14} />}
                label="Duration"
                value={course.duration}
              />
              <Stat icon={<Sparkles size={14} />} label="Level" value={course.level} />
              <Stat
                icon={<Award size={14} />}
                label="Certificate"
                value={course.certificate}
              />
            </dl>
          </div>

          {/* Code editor visual */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-800 bg-black/70 lg:block">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-rose-500/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                kernel/init.c
              </span>
            </div>
            <pre className="p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
              <span className="text-zinc-500">{`// Boot the kernel`}</span>
              {"\n"}
              <span className="text-rose-300">int</span>{" "}
              <span className="text-orange-300">start_kernel</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-500">)</span> <span className="text-zinc-500">{"{"}</span>
              {"\n  "}
              <span className="text-zinc-500">{`/* setup_arch */`}</span>
              {"\n  "}
              <span className="text-orange-300">setup_arch</span>
              <span className="text-zinc-500">(&command_line);</span>
              {"\n  "}
              <span className="text-orange-300">trap_init</span>
              <span className="text-zinc-500">();</span>
              {"\n  "}
              <span className="text-orange-300">mm_init</span>
              <span className="text-zinc-500">();</span>
              {"\n  "}
              <span className="text-orange-300">sched_init</span>
              <span className="text-zinc-500">();</span>
              {"\n  "}
              <span className="text-rose-300">return</span>{" "}
              <span className="text-zinc-300">0</span>
              <span className="text-zinc-500">;</span>
              {"\n"}
              <span className="text-zinc-500">{"}"}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Course Objective */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7">
        <h2 className="text-base font-semibold text-zinc-100">Course Objective</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          This isn&rsquo;t just another course. It&rsquo;s a deep dive into the
          systems we depend on. By the end, you&rsquo;ll move beyond memorizing
          commands into understanding the core mechanics that power our world.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-3">
          {course.objectives.map((obj) => (
            <li
              key={obj}
              className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 text-xs text-zinc-300"
            >
              <CheckCircle2 size={14} className="mt-0.5 text-orange-400" />
              {obj}
            </li>
          ))}
        </ul>
      </section>

      {/* Curriculum */}
      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
              Curriculum
            </span>
            <h2 className="mt-2 text-2xl font-bold text-zinc-50">
              {course.title.replace("\n", " ")}
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Modules Completed · {completed}/{total}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {course.modules.map((m, i) => (
            <ModuleCard key={m.id} courseId={id} module={m} highlighted={i === 0} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        <span className="text-orange-400">{icon}</span> {label}
      </span>
      <p className="mt-1 text-base font-semibold text-zinc-50">{value}</p>
    </div>
  );
}

function ModuleCard({
  courseId,
  module: m,
  highlighted,
}: {
  courseId: string;
  module: {
    id: string;
    idx: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    status: "active" | "available" | "locked" | "completed";
  };
  highlighted: boolean;
}) {
  const isLocked = m.status === "locked";
  const baseClasses =
    "relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition";
  const variant = highlighted
    ? "border-orange-500/40 bg-zinc-900/60 md:col-span-2 md:row-span-2"
    : "border-zinc-800 bg-zinc-900/40 hover:border-orange-500/30";

  return (
    <article className={`${baseClasses} ${variant}`}>
      {highlighted ? (
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
      ) : null}

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
          {m.idx}
        </span>
        <span
          className={
            isLocked
              ? "rounded-md border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-600"
              : "rounded-md border border-orange-500/30 bg-orange-500/10 p-1.5 text-orange-300"
          }
        >
          {isLocked ? <Lock size={14} /> : m.icon}
        </span>
      </div>

      <h3
        className={
          highlighted
            ? "relative mt-4 text-3xl font-bold leading-tight text-zinc-50"
            : "relative mt-3 text-base font-semibold text-zinc-100"
        }
      >
        {m.title}
      </h3>

      {m.description ? (
        <p className="relative mt-2 max-w-md text-sm text-zinc-400">
          {m.description}
        </p>
      ) : null}

      <div className="relative mt-auto pt-5">
        {isLocked ? (
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">
            <Lock size={12} /> Locked
          </span>
        ) : (
          <Link
            href={`/academy/courses/${courseId}/lessons/${m.id}`}
            className={
              highlighted
                ? "inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-orange-400"
                : "inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-300 hover:text-orange-200"
            }
          >
            {m.status === "active" ? "Continue Learning" : "Start"}{" "}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
