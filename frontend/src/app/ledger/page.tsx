"use client";

import { useEffect, useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ApiError,
  fetchAuditExport,
  type AuditExport,
  type DomainEvent,
} from "@/lib/api";
import { formatTimestamp, truncateMiddle } from "@/lib/format";

const WINDOW_HOURS = 24;

export default function LedgerPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <LedgerView />
      </DashboardShell>
    </AuthGate>
  );
}

function LedgerView() {
  const [data, setData] = useState<AuditExport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - WINDOW_HOURS * 60 * 60 * 1000);

    fetchAuditExport({ from: from.toISOString(), to: to.toISOString() })
      .then((res) => setData(res))
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

  if (!data || data.events.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
        <p>No events in the last {WINDOW_HOURS} hours.</p>
        <p className="mt-2">
          Drive the backend via{" "}
          <code className="font-mono text-xs">POST /api/v1/users</code>,{" "}
          <code className="font-mono text-xs">POST /api/v1/escrows</code>, etc.
          and refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Event ledger</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {data.count} events · last {WINDOW_HOURS}h
        </span>
      </header>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Stream</th>
              <th className="px-3 py-2">Version</th>
              <th className="hidden px-3 py-2 sm:table-cell">Payload</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => (
              <EventRow key={event.event_id} event={event} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: DomainEvent }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30">
      <td className="px-3 py-2 font-mono text-xs">
        {formatTimestamp(event.ts)}
      </td>
      <td className="px-3 py-2 font-medium">{event.event_type}</td>
      <td className="px-3 py-2 font-mono text-xs">
        {event.stream_type}/{truncateMiddle(event.stream_id)}
      </td>
      <td className="px-3 py-2 font-mono text-xs">v{event.version}</td>
      <td className="hidden px-3 py-2 font-mono text-xs text-muted-foreground sm:table-cell">
        <code className="block max-w-md truncate">
          {JSON.stringify(event.payload)}
        </code>
      </td>
    </tr>
  );
}
