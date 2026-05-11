export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="font-mono text-sm text-muted-foreground">
          GemVault — v0.1.0
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Reference RWA fintech control surface. Ledger, certificates, and
          escrow timelines — read-only.
        </p>
      </header>

      <nav className="grid gap-3 sm:grid-cols-3">
        <DashboardLink
          href="/ledger"
          title="Ledger"
          description="Event-sourced audit trail"
        />
        <DashboardLink
          href="/certificates"
          title="Certificates"
          description="On-chain certificates of authenticity"
        />
        <DashboardLink
          href="/escrows"
          title="Escrows"
          description="Escrow lifecycle timelines"
        />
      </nav>

      <footer className="mt-auto border-t border-border pt-4 font-mono text-xs text-muted-foreground">
        Sprint 0 scaffold. Real dashboard ships in Sprint 5.
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
