"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Client-side guard. Redirects unauthenticated users to /login.
 * Wrap favorites/groups sections with this in later phases.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  return <>{children}</>;
}
