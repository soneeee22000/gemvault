"use client";

import { useEffect, useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApiError, fetchAuditExport, type DomainEvent } from "@/lib/api";
import { formatTimestamp, truncateMiddle } from "@/lib/format";

const WINDOW_HOURS = 24;
const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";
const BASESCAN_TX =
  process.env.NEXT_PUBLIC_BASESCAN_TX ?? "https://sepolia.basescan.org/tx";

type CertificateSummary = {
  certificate_id: string;
  token_id: string;
  tx_hash: string;
  ipfs_hash: string;
  escrow_id: string;
  minted_at: string;
};

export default function CertificatesPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <CertificatesGallery />
      </DashboardShell>
    </AuthGate>
  );
}

function CertificatesGallery() {
  const [certificates, setCertificates] = useState<CertificateSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - WINDOW_HOURS * 60 * 60 * 1000);
    fetchAuditExport({ from: from.toISOString(), to: to.toISOString() })
      .then((res) => setCertificates(deriveCertificates(res.events)))
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

  if (certificates.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
        No certificates minted in the last {WINDOW_HOURS} hours. Drive an escrow
        all the way through{" "}
        <code className="font-mono text-xs">/escrows/&#123;id&#125;/mint</code>{" "}
        to see one here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Certificates of authenticity
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {certificates.length} · last {WINDOW_HOURS}h
        </span>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <li
            key={cert.certificate_id}
            className="rounded-md border border-border bg-muted/30 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-xs text-muted-foreground">
                Token #{cert.token_id}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {formatTimestamp(cert.minted_at)}
              </p>
            </div>

            <p className="mt-3 font-mono text-xs">
              <span className="text-muted-foreground">cert </span>
              {truncateMiddle(cert.certificate_id, 8, 6)}
            </p>
            <p className="font-mono text-xs">
              <span className="text-muted-foreground">escrow </span>
              {truncateMiddle(cert.escrow_id, 8, 6)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`${BASESCAN_TX}/${cert.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border bg-input px-2.5 py-1 font-mono text-[11px] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Basescan ↗
              </a>
              <a
                href={`${IPFS_GATEWAY}/${cert.ipfs_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border bg-input px-2.5 py-1 font-mono text-[11px] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                IPFS ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function deriveCertificates(events: DomainEvent[]): CertificateSummary[] {
  const minted = events.filter((e) => e.event_type === "CertificateMinted");
  return minted
    .map((event) => {
      const payload = event.payload as Record<string, unknown>;
      return {
        certificate_id: String(payload.certificate_id ?? event.event_id),
        token_id: String(payload.token_id ?? "?"),
        tx_hash: String(payload.tx_hash ?? ""),
        ipfs_hash: String(payload.ipfs_hash ?? ""),
        escrow_id: String(payload.escrow_id ?? event.stream_id),
        minted_at: event.ts,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.minted_at).getTime() - new Date(a.minted_at).getTime(),
    );
}
