import CyberQuestShell from "@/components/shell/CyberQuestShell";

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CyberQuestShell>{children}</CyberQuestShell>;
}
