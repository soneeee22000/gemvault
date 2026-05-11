import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GemVault",
  description:
    "Reference RWA fintech: physical-asset certificate-of-authenticity NFTs with vault custody and a financial-grade ledger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
