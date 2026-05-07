"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  type?: HTMLInputElement["type"];
  icon?: ReactNode;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, type = "text", icon, error, hint, className, id, ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? `field-${reactId}`;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && reveal ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400"
      >
        {label}
      </label>

      <div
        className={cn(
          "group relative flex items-center rounded-lg border bg-zinc-900/60 backdrop-blur transition-colors",
          "border-zinc-800 focus-within:border-red-500/70",
          error && "border-red-500/70",
          className
        )}
      >
        {icon ? (
          <span className="pointer-events-none flex h-10 w-10 items-center justify-center text-zinc-500 group-focus-within:text-red-400">
            {icon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className={cn(
            "h-10 w-full bg-transparent pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600",
            !icon && "pl-3"
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            tabIndex={-1}
            aria-label={reveal ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:text-zinc-200"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
