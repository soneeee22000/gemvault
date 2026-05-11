"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApiError, fetchEscrow, type Escrow } from "@/lib/api";
import {
  escrowStateClasses,
  formatTimestamp,
  truncateMiddle,
} from "@/lib/format";

type TimelineStep = {
  state: Escrow["state"];
  label: string;
  at: string | null;
};

export default function EscrowDetailPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <EscrowDetail />
      </DashboardShell>
    </AuthGate>
  );
}

function EscrowDetail() {
  const { id } = useParams<{ id: string }>();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchEscrow(id)
      .then(setEscrow)
      .catch((err) => {
        if (err instanceof ApiError) setError(err.detail);
        else setError(String(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="font-mono text-sm text-muted-foreground">Loading…</p>;
  }
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
      >
        {error}
      </p>
    );
  }
  if (!escrow) return null;

  const timeline: TimelineStep[] = [
    { state: "PENDING", label: "Opened", at: escrow.opened_at },
    { state: "FUNDS_LOCKED", label: "Funds locked", at: escrow.locked_at },
    {
      state: "VAULT_ATTESTED",
      label: "Vault attested",
      at: escrow.attested_at,
    },
    {
      state: "CERTIFICATE_MINTED",
      label: "Certificate minted",
      at: escrow.minted_at,
    },
    { state: "RELEASED", label: "Released", at: escrow.released_at },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          href="/escrows"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← All escrows
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            {truncateMiddle(escrow.escrow_id, 10, 8)}
          </h2>
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${escrowStateClasses(escrow.state)}`}
          >
            {escrow.state}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {escrow.amount_usdc} USDC
          </span>{" "}
          · buyer{" "}
          <code className="font-mono text-xs">
            {truncateMiddle(escrow.buyer_id)}
          </code>{" "}
          → seller{" "}
          <code className="font-mono text-xs">
            {truncateMiddle(escrow.seller_id)}
          </code>
        </p>
      </header>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {timeline.map((step, idx) => {
          const reached = step.at !== null;
          return (
            <li key={step.state} className="relative">
              <span
                className={
                  "absolute -left-[27px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full " +
                  (reached
                    ? "bg-primary"
                    : "border border-border bg-background")
                }
              />
              <p className="text-sm font-medium">
                {idx + 1}. {step.label}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {step.at ? formatTimestamp(step.at) : "—"}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
