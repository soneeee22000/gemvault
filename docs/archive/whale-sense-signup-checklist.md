# Whale-Sense — External Services Signup Checklist

**Verified:** 2026-05-11
**Status:** All paths verified except where noted. One real blocker found (X API), three viable workarounds.

> **Locked decision 2026-05-11:** sentiment source = **Farcaster via Neynar free tier**. X API is no longer in the build plan. The X section below is retained as research evidence for why the pivot happened.

## Summary

| Service                     | Free for dev? | KYC / CC required         | Blocker? |
| --------------------------- | ------------- | ------------------------- | -------- |
| Alchemy (Base Sepolia RPC)  | Yes (30M CU)  | Email only                | No       |
| Coinbase Developer Platform | Yes (5k ops)  | Email only — no KYC       | No       |
| Basescan API                | Yes (100k/d)  | Email only                | No       |
| Anthropic API               | Existing acct | Existing — no extra setup | No       |
| Base Sepolia testnet ETH    | Free          | Faucet login              | No       |
| **X / Twitter API**         | **No**        | **Credit card required**  | **YES**  |

## 1. Alchemy (Base Sepolia RPC + Notify webhooks)

- **Signup:** [alchemy.com](https://www.alchemy.com/) → dashboard → Create App → Base Sepolia
- **Free tier:** 30M compute units/month (some sources report 300M for 2026 — verify in dashboard). No daily request cap on Base Sepolia.
- **KYC/CC:** Email only.
- **Quirk:** Webhooks/Notify are on free tier but cost ~40 CU per event. Subscribe only to the whale watchlist; do NOT subscribe to mempool firehoses or CUs exhaust in hours.
- **What we'll use it for:** RPC endpoint + on-chain whale wallet transfer notifications.

## 2. Coinbase Developer Platform (CDP)

- **Signup:** [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/) — email/Coinbase login, generate API key in minutes
- **Free tier:** 5,000 wallet operations/month (create / sign / broadcast / policy eval). AgentKit SDK is open-source.
- **KYC/CC:** No KYC for developer portal. (KYC only applies to consumer exchange side.) Email + API key sufficient for testnet.
- **Quirk:** Smart Wallets on Base Sepolia work out of the box. Gasless via Paymaster requires extra config. Use `coinbase-agentkit` Python package.
- **What we'll use it for:** ERC-4337 smart wallet provisioning + AgentKit integration.

## 3. X / Twitter API — REAL BLOCKER

- **Status:** As of Feb 6, 2026, X closed Free / fixed Basic/Pro tiers to new signups. New developers default to pay-per-use.
- **Pricing (May 2026):** $0.005/post read, $0.01/profile read, capped at 2M post reads/month before Enterprise gate.
- **KYC/CC:** Credit card required to fund credits. No KYC.
- **Impact for Whale-Sense:** Original spec called for X sentiment ingestion. Pay-per-use is workable but adds a real cost wall (~$20–50 budget for a portfolio demo).
- **Decision required (see Sentiment-Source Pivot below).**

## 4. Base Sepolia Faucets (use 2 in rotation)

| Faucet       | URL                                                                                        | Drip                    | Recommended                              |
| ------------ | ------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------- |
| Coinbase CDP | [portal.cdp.coinbase.com/products/faucet](https://portal.cdp.coinbase.com/products/faucet) | ~0.05–0.1 ETH/day       | Yes — most reliable                      |
| Alchemy      | [alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia)           | 0.1 ETH/day             | Yes — needs 0.001 mainnet ETH anti-sybil |
| QuickNode    | [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)             | One drip / 12h, smaller | Backup                                   |
| thirdweb     | thirdweb base sepolia faucet                                                               | 0.01 ETH/day            | Skip — too low                           |

Two faucets daily is enough for an autonomous agent demo.

## 5. Basescan API

- **Signup:** [basescan.org/myapikey](https://basescan.org/myapikey) — email account, free key
- **Free tier:** 5 calls/sec/IP, 100k calls/day
- **KYC/CC:** Email only
- **Quirk:** Basescan-issued keys do NOT work on Etherscan; use unified Etherscan v2 multichain keys if you want cross-chain. Stick with Basescan-only for Base-only work.

## 6. Anthropic API (already have account)

- **GA models as of May 2026 ($/MTok input/output):**
  - Haiku 4.5: $1 / $5 — use for cheap sentiment classification
  - Sonnet 4.6: $3 / $15 — use for the LangGraph reasoning loop
  - Opus 4.6 / 4.7: $5 / $25 — overkill for this project; reserve for hard reasoning only
- **Important:** No "Claude 4.7 Haiku/Sonnet" GA — only Opus is at the 4.7 generation.
- **Cost savers:** Batch API = 50% off non-interactive workloads; prompt caching cuts repeat-context cost ~90%.

## Sentiment-Source Pivot — Three Workarounds for the X Blocker

The X cost wall is annoying but it forces a choice that might actually improve the project. Three alternatives, all free or cheap:

### Option A — Farcaster (Recommended)

- **Free tier:** Neynar provides a free developer tier with hub access and the cast (post) search API.
- **Pros:** Crypto-native social layer. Signals deeper ecosystem awareness than "Twitter sentiment like everyone else." Heavily used by Base ecosystem builders. Strong correlation with on-chain activity.
- **Cons:** Smaller volume than X. Will not pick up TradFi macro chatter (CPI, FOMC).
- **Fit for Whale-Sense:** ⭐⭐⭐⭐⭐ — arguably better for a Base-deployed agent than X.

### Option B — LunarCrush

- **Free tier:** Limited free API tier with crypto-specific aggregated sentiment scores across multiple platforms.
- **Pros:** Purpose-built for crypto. Pre-aggregated sentiment scores save ML work.
- **Cons:** Less raw — you don't see the underlying posts. Less control over the classifier.
- **Fit for Whale-Sense:** ⭐⭐⭐ — useful but reduces the ML showcase value.

### Option C — Multi-source feed (Farcaster + Reddit + CoinGecko trending)

- **Free tier:** All three have free API access.
- **Pros:** Robust to outages or rate limits on any one source. Signal fusion across sources is itself an interesting engineering story.
- **Cons:** More integration work; might balloon the data layer.
- **Fit for Whale-Sense:** ⭐⭐⭐⭐ — best for a "show me you can integrate" pitch; slightly more scope than minimum.

### Option D — Keep X via pay-per-use

- **Cost:** ~$20–50 for a portfolio demo.
- **Pros:** Largest sentiment surface; demo includes well-known accounts (CT influencers).
- **Cons:** Recurring cost; the portfolio reviewer might note that "Twitter sentiment trading bot" is the most clichéd DeFAI demo.
- **Fit for Whale-Sense:** ⭐⭐ — workable but uninspired.

## Outstanding items to confirm in dashboard (not blocking)

- Exact Coinbase CDP faucet drip amount (only published after login)
- Alchemy free CU figure (30M vs 300M depending on source)
- Anthropic Batch API enablement on the user's existing org

## Sources

- [Alchemy Pricing](https://www.alchemy.com/pricing) · [Alchemy free tier](https://www.alchemy.com/support/free-tier-details) · [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [CDP Portal](https://portal.cdp.coinbase.com/) · [CDP Pricing](https://www.coinbase.com/developer-platform/pricing) · [AgentKit docs](https://docs.cdp.coinbase.com/agent-kit/welcome) · [CDP Faucet](https://portal.cdp.coinbase.com/products/faucet)
- [Base Network Faucets](https://docs.base.org/base-chain/network-information/network-faucets) · [QuickNode Base Sepolia](https://faucet.quicknode.com/base/sepolia)
- [X API Pricing (docs.x.com)](https://docs.x.com/x-api/getting-started/pricing) · [X API Pricing 2026 — Postproxy](https://postproxy.dev/blog/x-api-pricing-2026/)
- [Basescan Rate Limits](https://docs.basescan.org/support/rate-limits)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
