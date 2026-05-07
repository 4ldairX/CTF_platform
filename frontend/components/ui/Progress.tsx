import { cn } from "@/lib/cn";

export default function Progress({
  value,
  className,
  showLabel,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
          style={{ width: `${safe}%` }}
        />
      </div>
      {showLabel ? (
        <span className="font-mono text-[10px] tracking-widest text-zinc-400">
          {safe}%
        </span>
      ) : null}
    </div>
  );
}
