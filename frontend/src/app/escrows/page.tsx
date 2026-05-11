"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ApiError,
  fetchAuditExport,
  type DomainEvent,
  type Escrow,
} from "@/lib/api";
import {
  escrowStateClasses,
  formatRelative,
  truncateMiddle,
} from "@/lib/format";

const WINDOW_HOURS = 24;
const STATE_ORDER: Escrow["state"][] = [
  "PENDING",
  "FUNDS_LOCKED",
  "VAULT_ATTESTED",
  "CERTIFICATE_MINTED",
  "RELEASED",
  "CANCELLED",
  "REFUNDED",
];

type EscrowSummary = {
  escrow_id: string;
  amount?: string;
  state: Escrow["state"];
  buyer_id?: string;
  seller_id?: string;
  asset_id?: string;
  opened_at: string;
  last_event_at: string;
};

export default function EscrowsPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <EscrowsList />
      </DashboardShell>
    </AuthGate>
  );
}

function EscrowsList() {
  const [escrows, setEscrows] = useState<EscrowSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - WINDOW_HOURS * 60 * 60 * 1000);
    fetchAuditExport({ from: from.toISOString(), to: to.toISOString() })
      .then((res) => setEscrows(deriveEscrows(res.events)))
      .catch((err) => {
        if (err instanceof ApiError) setError(err.detail);
        else setError(String(err));
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (escrows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
        No escrows opened in the last {WINDOW_HOURS} hours. Open one via{" "}
        <code className="font-mono text-xs">POST /api/v1/escrows</code>.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Escrows</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {escrows.length} · last {WINDOW_HOURS}h
        </span>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {escrows.map((escrow) => (
          <li
            key={escrow.escrow_id}
            className="rounded-md border border-border bg-muted/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/escrows/${escrow.escrow_id}`}
                className="font-mono text-xs text-foreground hover:text-primary"
              >
                {truncateMiddle(escrow.escrow_id, 8, 6)}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${escrowStateClasses(
                  escrow.state,
                )}`}
              >
                {escrow.state}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {escrow.amount ? (
                <p>
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">{escrow.amount} USDC</span>
                </p>
              ) : null}
              {escrow.buyer_id ? (
                <p className="font-mono text-xs text-muted-foreground">
                  Buyer {truncateMiddle(escrow.buyer_id)}
                </p>
              ) : null}
              {escrow.seller_id ? (
                <p className="font-mono text-xs text-muted-foreground">
                  Seller {truncateMiddle(escrow.seller_id)}
                </p>
              ) : null}
            </div>

            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              Last update {formatRelative(escrow.last_event_at)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function deriveEscrows(events: DomainEvent[]): EscrowSummary[] {
  const byId = new Map<string, EscrowSummary>();

  for (const event of events) {
    if (event.stream_type !== "escrow") continue;
    const id = event.stream_id;
    const existing = byId.get(id) ?? {
      escrow_id: id,
      state: "PENDING" as Escrow["state"],
      opened_at: event.ts,
      last_event_at: event.ts,
    };

    if (event.event_type === "EscrowOpened") {
      const payload = event.payload as Record<string, string>;
      existing.amount = String(payload.amount ?? "");
      existing.buyer_id = String(payload.buyer_id ?? "");
      existing.seller_id = String(payload.seller_id ?? "");
      existing.asset_id = String(payload.asset_id ?? "");
      existing.opened_at = event.ts;
    }

    const nextState = stateFromEvent(event.event_type);
    if (
      nextState &&
      STATE_ORDER.indexOf(nextState) >= STATE_ORDER.indexOf(existing.state)
    ) {
      existing.state = nextState;
    }

    if (
      new Date(event.ts).getTime() > new Date(existing.last_event_at).getTime()
    ) {
      existing.last_event_at = event.ts;
    }

    byId.set(id, existing);
  }

  return [...byId.values()].sort(
    (a, b) =>
      new Date(b.last_event_at).getTime() - new Date(a.last_event_at).getTime(),
  );
}

function stateFromEvent(eventType: string): Escrow["state"] | null {
  switch (eventType) {
    case "EscrowOpened":
      return "PENDING";
    case "FundsLocked":
      return "FUNDS_LOCKED";
    case "VaultAttested":
      return "VAULT_ATTESTED";
    case "CertificateMinted":
      return "CERTIFICATE_MINTED";
    case "EscrowReleased":
      return "RELEASED";
    case "EscrowCancelled":
      return "CANCELLED";
    case "EscrowRefunded":
      return "REFUNDED";
    default:
      return null;
  }
}
