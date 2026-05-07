"use client";

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
  hint?: string;
};

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, options, hint, className, id, ...rest },
  ref
) {
  const reactId = useId();
  const fieldId = id ?? `select-${reactId}`;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={fieldId}
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400"
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "relative flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 backdrop-blur",
          "focus-within:border-red-500/70",
          className
        )}
      >
        <select
          ref={ref}
          id={fieldId}
          className="h-10 w-full appearance-none bg-transparent pl-3 pr-9 text-sm text-zinc-100 outline-none [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 text-zinc-500"
        />
      </div>
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
});

export default Select;
