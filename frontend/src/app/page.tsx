"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/useAuth";
import { fetchHealth } from "@/lib/api";

type HealthStatus =
  | { kind: "loading" }
  | { kind: "ok"; version: string }
  | { kind: "down" };

export default function Home() {
  const { token, isReady } = useAuth();
  const [health, setHealth] = useState<HealthStatus>({ kind: "loading" });

  useEffect(() => {
    fetchHealth()
      .then((res) => setHealth({ kind: "ok", version: res.version }))
      .catch(() => setHealth({ kind: "down" }));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12 sm:py-16">
      <header className="space-y-2">
        <p className="font-mono text-sm text-muted-foreground">
          GemVault — v0.1.0
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Reference RWA Fintech Control Surface
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Event-sourced ledger, on-chain certificates of authenticity, and
          custodian-backed escrow lifecycle. Read-only dashboard wired to the
          GemVault FastAPI backend.
        </p>
      </header>

      <BackendStatusBadge status={health} />

      <nav className="grid gap-3 sm:grid-cols-3">
        <DashboardLink
          href="/ledger"
          title="Ledger"
          description="Event-sourced audit trail"
        />
        <DashboardLink
          href="/certificates"
          title="Certificates"
          description="Minted on-chain"
        />
        <DashboardLink
          href="/escrows"
          title="Escrows"
          description="Lifecycle timelines"
        />
      </nav>

      <section className="rounded-md border border-border bg-muted/30 p-4 text-sm">
        {!isReady ? (
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        ) : token ? (
          <p>
            Signed in. Open any tab above, or{" "}
            <Link href="/ledger" className="text-primary hover:underline">
              jump to the ledger
            </Link>
            .
          </p>
        ) : (
          <p>
            Not signed in.{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to load data. See backend{" "}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              /docs
            </a>{" "}
            to seed users + escrows.
          </p>
        )}
      </section>

      <footer className="mt-auto border-t border-border pt-4 font-mono text-xs text-muted-foreground">
        Open-source · MIT · GemVault reference architecture
      </footer>
    </main>
  );
}

type DashboardLinkProps = {
  href: string;
  title: string;
  description: string;
};

function DashboardLink({ href, title, description }: DashboardLinkProps) {
  return (
    <a
      href={href}
      className="rounded-lg border border-border bg-muted px-4 py-3 transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <p className="text-base font-medium">{title}</p>
      <p className="mt-1 text-sm opacity-80">{description}</p>
    </a>
  );
}

function BackendStatusBadge({ status }: { status: HealthStatus }) {
  if (status.kind === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">
          Checking backend…
        </span>
      </div>
    );
  }
  if (status.kind === "down") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-danger" />
        <span className="font-mono text-xs text-danger">
          Backend unreachable. Run{" "}
          <code className="rounded bg-background/40 px-1">
            uvicorn gemvault.main:app
          </code>
          .
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-success" />
      <span className="font-mono text-xs text-success">
        Backend healthy · v{status.version}
      </span>
    </div>
  );
}
