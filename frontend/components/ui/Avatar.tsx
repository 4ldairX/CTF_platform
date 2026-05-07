import { cn } from "@/lib/cn";

type Props = {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

export default function Avatar({
  name,
  color = "#ef4444",
  size = "sm",
  className,
}: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-zinc-800 font-semibold text-zinc-50 ring-1 ring-inset ring-white/5",
        sizes[size],
        className
      )}
      style={{
        backgroundColor: `${color}30`,
        boxShadow: `0 0 18px -8px ${color}aa`,
      }}
      title={name}
    >
      {initials}
    </span>
  );
}
