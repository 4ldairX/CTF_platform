import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  className?: string;
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/55 p-4 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </span>
        {icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-red-500/30 bg-zinc-900 text-red-400">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-50">{value}</span>
        {trend ? (
          <span
            className={cn(
              "text-xs font-mono",
              trend.positive === false ? "text-rose-400" : "text-emerald-400"
            )}
          >
            {trend.value}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
