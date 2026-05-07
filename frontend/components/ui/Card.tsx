import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function Card({ glow, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-zinc-800 bg-zinc-950/55 backdrop-blur",
        glow && "shadow-glow-red",
        className
      )}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-red-500/5"
      />
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-zinc-800/80 px-5 py-4",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-100">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-xs text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
