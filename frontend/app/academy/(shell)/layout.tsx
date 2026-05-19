import RequireAuth from "@/components/auth/RequireAuth";
import AcademyShell from "@/components/shell/AcademyShell";

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["instructor", "admin"]}>
      <AcademyShell>{children}</AcademyShell>
    </RequireAuth>
  );
}
