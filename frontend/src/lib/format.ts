export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const seconds = Math.round(diffMs / 1000);
  if (Math.abs(seconds) < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function truncateMiddle(s: string, head = 6, tail = 4): string {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

const STATE_COLORS: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  FUNDS_LOCKED: "bg-warning/15 text-warning",
  VAULT_ATTESTED: "bg-warning/15 text-warning",
  CERTIFICATE_MINTED: "bg-primary/15 text-primary",
  RELEASED: "bg-success/15 text-success",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-danger/15 text-danger",
};

export function escrowStateClasses(state: string): string {
  return STATE_COLORS[state] ?? "bg-muted text-muted-foreground";
}
