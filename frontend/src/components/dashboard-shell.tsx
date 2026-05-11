"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { useAuth } from "@/lib/useAuth";

const NAV: { href: string; label: string }[] = [
  { href: "/ledger", label: "Ledger" },
  { href: "/certificates", label: "Certificates" },
  { href: "/escrows", label: "Escrows" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs text-muted-foreground">
            GemVault — Admin Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Reference RWA Fintech Control Surface
          </h1>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="self-start rounded-md border border-border bg-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:self-end"
        >
          Sign out
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-input hover:text-foreground")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <section className="flex-1">{children}</section>

      <footer className="border-t border-border pt-4 font-mono text-xs text-muted-foreground">
        Read-only view · Powered by the GemVault FastAPI backend
      </footer>
    </main>
  );
}
