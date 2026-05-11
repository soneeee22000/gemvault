"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/useAuth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/login");
    }
  }, [isReady, token, router]);

  if (!isReady) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <p className="font-mono text-sm text-muted-foreground">
          Redirecting to login…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
