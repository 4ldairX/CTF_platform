import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "red"
  | "cyan"
  | "amber"
  | "emerald"
  | "violet"
  | "zinc"
  | "rose";

type Props = {
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

const tones: Record<Tone, string> = {
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  zinc: "border-zinc-700 bg-zinc-900 text-zinc-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export default function Badge({
  tone = "zinc",
  className,
  children,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
