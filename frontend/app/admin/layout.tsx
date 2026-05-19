import RequireAuth from "@/components/auth/RequireAuth";
import AdminShell from "@/components/shell/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["admin", "moderator"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
