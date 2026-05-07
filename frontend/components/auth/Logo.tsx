import { ShieldCheck } from "lucide-react";

export default function Logo({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 36 : 56;
  const icon = size === "sm" ? 18 : 26;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-2xl border border-red-500/40 bg-zinc-900/70 shadow-glow-red"
        style={{ width: dim, height: dim }}
      >
        <ShieldCheck size={icon} className="text-red-400" />
        <span className="absolute inset-0 rounded-2xl ring-1 ring-red-500/10" />
      </div>
      {size === "md" ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            CyberQuest
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Platform Secure Access
          </p>
        </div>
      ) : null}
    </div>
  );
}
