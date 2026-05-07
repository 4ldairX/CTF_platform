"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  durationMs?: number;
};

export default function Toast({
  message,
  variant = "success",
  onClose,
  durationMs = 3500,
}: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onClose]);

  const Icon = variant === "success" ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-glow-red backdrop-blur animate-fade-up",
        variant === "success"
          ? "border-red-500/40 bg-zinc-900/85 text-zinc-100"
          : "border-red-500/60 bg-red-950/70 text-red-100"
      )}
    >
      <Icon
        size={18}
        className={variant === "success" ? "text-red-400" : "text-red-300"}
      />
      <span>{message}</span>
    </div>
  );
}
