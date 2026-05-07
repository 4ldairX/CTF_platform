import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-10 text-center">
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-zinc-900 text-red-400">
          {icon}
        </span>
      ) : null}
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      {description ? (
        <p className="max-w-md text-xs text-zinc-500">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
