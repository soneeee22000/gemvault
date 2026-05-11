# PRFAQ — Whale-Sense (DRAFT, verdict pending)

**Date:** 2026-05-11
**Status:** Phase 2 (PR) + Phase 3 (FAQ) drafted. **Verdict pending — gated on Q10 kill-question:** clarifying with the Thai company referrer what kind of company / stack / role this is before committing two weeks of engineering.

**Locked decisions (2026-05-11):**

- **Chain:** Base Sepolia testnet (Coinbase L2, agent-native)
- **Agent framework:** LangGraph (Python) — deliberately not Eliza/TypeScript
- **Sentiment source:** Farcaster via Neynar free tier — pivoted from X after Feb 2026 X-API pricing change; Farcaster is also a stronger Base-ecosystem signal
- **Smart wallet:** Coinbase Smart Wallet SDK (ERC-4337) with daily spending cap
- **Models:** Anthropic Haiku 4.5 (cheap classification) + Sonnet 4.6 (reasoning loop)

---

## Press Release Draft

# Whale-Sense Launches to Help Retail Crypto Traders Mirror Smart-Money Moves Without Watching Wallets All Day

**Paris, May 11, 2026** — Today an open-source project called Whale-Sense launches on Base testnet — a LangGraph-powered autonomous trading agent that fuses on-chain whale wallet activity with Farcaster sentiment to make ETH trades on the user's behalf, with hardcoded spending caps enforced at the smart-wallet level so the agent can never blow up the account.

### The Problem

When a known whale wallet moves $10M in ETH on-chain, the transaction is public the moment it confirms. But by the time retail traders see the chatter on Farcaster or X six hours later, the price has already moved 4%. Existing solutions either send dumb alerts (Whale Alert, Arkham) or run black-box bots without context (most "AI trading" Discord groups). Nothing reasons about whether a whale move actually matters this time — and nothing lets users hand off execution safely.

### The Solution

Whale-Sense runs a LangGraph state machine that watches a curated set of whale wallets, pulls Farcaster sentiment for the assets they're moving, fuses the signals through a reasoning step, and executes the trade through an ERC-4337 smart wallet with a daily spending cap the user controls. Every decision is visible in a trace UI — users can watch the agent think. A 30-day backtest mode replays historical signals so users see how the strategy would have performed before risking real funds.

### How It Works

- The user connects an ERC-4337 smart wallet on Base and sets a daily spending cap (e.g., $100)
- The user picks a watchlist of whale wallets (defaults provided) and target assets (ETH, ETH-correlated stables)
- The agent runs continuously: ingests whale transfers → scores Farcaster sentiment → fuses signals → decides → confirms → executes on Uniswap V3
- The user can pause the agent any time, view the LangGraph trace for every decision, and run the backtest mode against the last 30 days of data

### Customer Quote (Fictional)

"I follow whale wallets through Arkham and casts on Farcaster, but by the time I see them I've already missed the move. Whale-Sense reacts in 30 seconds with context I'd have spent an hour reading. The spending cap means I can let it run overnight without panicking."

— Mai, retail DeFi trader, Bangkok

### Getting Started

Clone the repo, deploy your ERC-4337 smart wallet on Base testnet with one command, fund it with test ETH, and let the agent run — full backtest output ships pre-computed in the README so reviewers see results before they even run the code.

---

## FAQ — Adversarial Round (drafted answers)

### Customer Questions

**Q1. Why switch from Whale Alert / Arkham / Discord trading bots to this?**
Whale Alert and Arkham send raw alerts without reasoning or execution. Discord copy-trading bots are black boxes with no transparency. Whale-Sense ships all three: signal fusion (whale + Farcaster sentiment), visible reasoning trace, autonomous execution bounded by smart-wallet cap. No one ships that combo today.

**Q2. What happens if it doesn't work? What do I lose?**
Loss is bounded at the ERC-4337 daily spending cap — the agent literally cannot exceed it. Backtest mode replays 30 days of signals before live funding. Open-source, every line readable. Compared to a Discord bot: bounded, transparent, deterministic.

**Q3. How is this different from Wayfinder / Almanak / HeyAnon?**
Wayfinder: closed-source consumer, no reasoning visibility. Almanak: Python quant but Safe+Zodiac (not 4337), no LangGraph, no whale+sentiment fusion. HeyAnon: NLP chat UX, not autonomous, not signal-driven. Whale-Sense is the only open-source, transparent, autonomous, signal-fused (whale × Farcaster), 4337-safe agent in the space — and it's built on Farcaster rather than the more clichéd Twitter-bot path, which signals deeper Base-ecosystem awareness.

### Stakeholder Questions

**Q4. How big is the addressable market?**
Honest answer: this is a portfolio piece, not a venture. Relevant market = DeFAI hiring market (~50–100 companies hiring LangGraph + Solidity + ERC-4337 stacks in 2026, $120–200K USD bands). ROI measured in one job offer, not TAM. As a venture this loses distribution to Wayfinder/Virtuals (see MOAT-CHECK.md).

**Q5. Business model?**
Portfolio piece, no business model. Hypothetical venture model = open-source core + hosted execution + premium feeds via x402. Not going there.

**Q6. Unfair advantage / moat?**
For portfolio: the project IS the moat — proves a 5-skill stack (LangGraph + ML + Farcaster/social API + on-chain indexer + Solidity + ERC-4337). For venture: zero moat, documented in MOAT-CHECK.md.

### Technical Questions

**Q7. Hardest technical risk?**
(a) ERC-4337 + agent latency. Mitigation: Coinbase Smart Wallet SDK with native gasless txns on Base. (b) Backtest data fidelity — historical social-sentiment data is rate-limited. Mitigation: ingest live Farcaster casts from day-1 of the build via Neynar's free tier; build the 30-day dataset incrementally during dev.

**Q8. MVP in 2 weeks? Minimal slice?**
Yes, 2 weeks.

- Week 1: LangGraph SM + Alchemy whale indexer + Farcaster sentiment ingest (Neynar) + Uniswap V3 exec on Base testnet
- Week 2: Coinbase Smart Wallet w/ daily cap + 30-day backtest + Next.js trace viewer + README + demo GIF
- 1-week compressed slice: drop frontend, CLI-only — loses 80% of demo impact.

**Q9. What data/APIs/infra do you need that you don't have?**

- Alchemy API key (free Base testnet tier) — TODO
- Neynar API key for Farcaster (free tier) — TODO
- Coinbase CDP for AgentKit (free, no KYC) — TODO
- Basescan API key (free) — TODO
- Anthropic API — have it (Haiku 4.5 for sentiment, Sonnet 4.6 for reasoning)
- Base Sepolia testnet ETH — Coinbase + Alchemy faucets
- 30-day whale + Farcaster dataset — build incrementally during dev period
- See `docs/SIGNUP-CHECKLIST.md` for verified provisioning paths

### Kill Question

**Q10. If you had to kill this, why?**
If the Thai company turns out to be NOT DeFAI-aware (CEX backend / NFT studio / smart-contract auditor / consultancy), Whale-Sense is overkill and wrong wedge. **MITIGATION (active 2026-05-11):** clarifying with friend what the company actually builds before committing to the 2-week scope. Pivot options if it's not a DeFi protocol:

- CEX backend / exchange engineering → DEX volume indexer + MEV monitor + on-chain settlement engine (heavier backend, less ML)
- NFT / GameFi → on-chain provenance auditor + royalty tracker + frontend mint UX
- Smart-contract auditing / security → invariant-fuzzer harness + Slither/Echidna integration + sample vulnerability reports
- Consultancy / infra → multi-chain event indexer + observability dashboard

---

## Pending Verdict

Verdict will be issued once Q10 is resolved by the user. If the company aligns with DeFi / agent / protocol work, expect a **BUILD IT** recommendation. If the company aligns with one of the other categories, expect a **PIVOT** recommendation back to `/brainstorm` Round 3 with adjusted strategy options.
