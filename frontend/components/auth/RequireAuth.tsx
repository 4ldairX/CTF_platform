"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

type Props = {
  children: ReactNode;
  allowedRoles?: Role[];
};

export default function RequireAuth({ children, allowedRoles }: Props) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate area based on actual role
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "moderator") {
        router.push("/admin/events");
      } else if (user.role === "instructor") {
        router.push("/academy");
      } else {
        router.push("/arena");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <span className="font-mono text-xs uppercase tracking-[0.32em] text-zinc-500">
          Verificando acceso...
        </span>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
