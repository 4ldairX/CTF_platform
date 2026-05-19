import { GraduationCap, Crosshair, ShieldCheck } from "lucide-react";

type Variant = "cyberquest" | "academy" | "arena" | "admin";

const map: Record<
  Variant,
  { label: string; sub?: string; color: string; icon: React.ReactNode }
> = {
  cyberquest: {
    label: "CyberQuest",
    color: "text-red-500",
    icon: <ShieldCheck size={16} />,
  },
  academy: {
    label: "Academia",
    sub: "APRENDE LA TEORÍA",
    color: "text-orange-500",
    icon: <GraduationCap size={14} />,
  },
  arena: {
    label: "Arena",
    sub: "ENFRENTA LOS RETOS",
    color: "text-orange-500",
    icon: <Crosshair size={14} />,
  },
  admin: {
    label: "CYBERQUEST.ADMIN",
    color: "text-red-500",
    icon: <ShieldCheck size={16} />,
  },
};

export default function Wordmark({
  variant = "cyberquest",
  size = "md",
  showSub = true,
}: {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  showSub?: boolean;
}) {
  const v = map[variant];
  const text =
    size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex flex-col leading-tight">
      <span
        className={`flex items-center gap-2 font-bold tracking-tight ${v.color} ${text}`}
      >
        <span className="opacity-80">{v.icon}</span> {v.label}
      </span>
      {showSub && v.sub ? (
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
          {v.sub}
        </span>
      ) : null}
    </div>
  );
}
