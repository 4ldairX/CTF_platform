import RequireAuth from "@/components/auth/RequireAuth";
import ArenaShell from "@/components/shell/ArenaShell";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["competitor"]}>
      <ArenaShell>{children}</ArenaShell>
    </RequireAuth>
  );
}
