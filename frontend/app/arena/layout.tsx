import ArenaShell from "@/components/shell/ArenaShell";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArenaShell>{children}</ArenaShell>;
}
