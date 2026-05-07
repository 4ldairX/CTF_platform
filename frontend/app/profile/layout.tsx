import CyberQuestShell from "@/components/shell/CyberQuestShell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CyberQuestShell>{children}</CyberQuestShell>;
}
