# Web3 / Blockchain Portfolio — Pyae Sone Kyaw

A focused Web3 engineering portfolio built around one principle: **regulated-grade depth over crypto-native surface.**

Most Web3 portfolios prove one skill: "I can write a Solidity contract" OR "I can integrate a wallet" OR "I can ship a dashboard." This one proves the layer the **fintech-meets-RWA** category actually needs — a clean backend that owns the ledger, the audit log, the escrow lifecycle, AND the on-chain certification layer, in one vertical slice.

---

## The Skill Stack

The project is designed to demonstrate four layers most Web3 engineers cannot ship together:

| Layer                                     | Tech                                                             | Why it matters                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Financial-grade ledger**                | Python · FastAPI · Postgres event store · hexagonal architecture | Double-entry accounting, deterministic replay, idempotency — regulated-fintech baseline |
| **On-chain certificates of authenticity** | Solidity · Foundry · ERC-721 · IPFS                              | RWA tokenisation pattern: physical asset ↔ cryptographic ownership proof                |
| **Escrow lifecycle + vault attestation**  | State-machine domain layer · HMAC-signed webhooks                | The custody-handoff problem most RWA platforms hand-wave                                |
| **Audit-grade observability**             | Append-only event store · signed audit exports · structured logs | The compliance posture serious fintech reviewers actually look for                      |

Transferable wedge: telecom CDR/SMPP event-pipeline experience and healthcare compliance work (VitaLens, ComplyOS) port directly into financial event-sourcing and regulated audit trails — a combination rare among engineers applying to RWA fintech roles.

---

## Active Project — GemVault

A reference RWA fintech architecture: physical high-value collectibles (gemstones as the worked example) tokenised as ERC-721 certificates of authenticity, settled through a custodian-backed escrow, on an event-sourced double-entry ledger.

**Three pillars, one repo:**

1. **On-chain certificate** — ERC-721 contract on Base Sepolia with a vault-attestation gate that prevents transfer until the off-chain custody handoff is signed by an authorised vault operator
2. **Financial-grade ledger backend** — FastAPI + Postgres event store, double-entry accounting, escrow state machine, HMAC-protected vault webhook, signed audit-trail export
3. **Admin dashboard** — Next.js + shadcn read-only console showing the ledger, certificates, and escrow timelines

See [`docs/PRD-GEMVAULT.md`](./docs/PRD-GEMVAULT.md) for the full spec, sprint plan, risks, and reviewer-experience design.

Architecture document lands next: `docs/ARCHITECTURE.md`.

---

## Why this scope and not another

The portfolio went through a structured selection process (`/brainstorm` → `/moat-check` → `/prfaq`) on 2026-05-11 before landing here. An earlier direction (autonomous DeFi agent on LangGraph) was scoped, stress-tested, and retired after better signal about the target reader space. Those artefacts are preserved in [`docs/archive/`](./docs/archive) as evidence of the decision process — not as live direction.

The pivot is documented in [`docs/PIVOT-NOTE.md`](./docs/PIVOT-NOTE.md).

---

## Author

**Pyae Sone Kyaw** — Founder & AI Engineer at Ekkhara (Paris, Station F).

- Portfolio: [pseonkyaw.dev](https://pseonkyaw.dev)
- Dual Master's: Telecom SudParis + AIT
- 4+ years production AI/ML; 6+ products shipped end-to-end
- Adjacent regulated-grade work: VitaLens (AI lab-result interpretation), VitalAge (longitudinal health scoring), ComplyOS (EU AI Act compliance autopilot)

---

## License

MIT — see [`LICENSE`](./LICENSE).
