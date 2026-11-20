# Holder tables

The entry gate refuses a launch it cannot see: no holder table, no trade. Sources are tried cheapest first, first answer wins.

1. pump.fun mint-positions - needs PUMPFUN_API_KEY.
2. Solscan holders - needs a paid-capable SOLSCAN_API_KEY (Level 1 cannot call it).
3. On-chain walk - getTokenLargestAccounts + getMultipleAccounts on SOLANA_RPC_URL. The public api.mainnet-beta.solana.com endpoint answers that method with 429 Too many requests for a specific RPC call on every attempt, so a host with no key gets nothing from it.
4. RugCheck /tokens/{mint}/report - keyless. Lists the top twenty wallets with their share of supply, pool excluded, and works on launches minutes old. On BONK it reports 36.11% in the top ten where GeckoTerminal says 40.42% (the pool-excluded difference).
5. GeckoTerminal /tokens/{mint}/info - keyless, already fetched for token info. Carries the same measurement: top-ten share plus holder count and the dev holding percentage.

A mint younger than about ninety seconds may have no holder block yet. A pool refused for "not enough data: holder table" is re-queued up to four times, and a young mint's token info is cached for 45 seconds rather than ten minutes so those retries re-read it.

To see which endpoint the bot is using, press Test RPC in the dashboard: it prints the host and whether getTokenLargestAccounts answers.

## Deep-pool veto override

`DEEP_LIQ_OVERRIDE_USD` (dashboard: **Deep-pool veto override**) defaults to **20000**. When a pool is at least this deep, a soft entry veto - churn, the safety composite, accumulated rug risk - no longer blocks the buy: the candidate is scored and, if it clears the model, entered with the original veto recorded on the trade and in the scan card. Hard safety signals still veto at any depth: honeypot, unrevoked mint/freeze authority, the rug blacklist, top-10 concentration above 70%, a bundle cluster, liquidity already draining, a single-minute 60% dump, missing holder data, and the age/liquidity bands. `0` turns the override off.

## Minimum pool age

`MIN_AGE_SEC` (dashboard: **Minimum pool age**) defaults to **120 seconds**. Pools younger than the floor are skipped at discovery before scoring: a pool with one tick of history has no exit to read, and a dev can drain it between two 25-second scans. `0` turns the floor off; the old behaviour was 15.

On the book at 2026-11-20 the 120s floor would have skipped 25 of 45 closed trades that netted **+$3.22**, while the 20 older trades netted **+$1.30**. It removes the DCTY rug (-$1.96) but also Rubio (+$2.52) and Cowboy Cat (+$2.16) - the early band is where both the wipeouts and the winners are, which is why this is a dashboard setting and not a hard-coded gate.

Closed trades now record `ageAtEntrySec`. The Settings card prints the what-if list from the current book, so changing the floor shows its effect on past trades immediately.

## Hold time

The per-venue time stop is an idle clock, not a hold-time limit: a trade is sold when it has gone 10 minutes without a new high on any venue, whatever its P&L. Every new high resets the clock, so a trade that keeps running is never recycled by it; one that stalls, even in profit, gives its slot back.

That 10 minutes is measured, not guessed. On the 58-trade book at 2026-11-20 (GeckoTerminal minute candles for each pool), the 35 winners reached their high at a median **7.6m** (avg 12.2m, p75 13.0m, p90 25.2m), and the longest stretch any winner went between new highs before its peak was **9.0m** - so a 10m idle window would have cut none of them before the high. The 12 losing rugs exited between 0.3m and 9.2m (median **1.6m**, avg 3.3m); those exits come from the fast rug watch, peak stop and stop loss, not from a clock. A timer set before the 3.3m average rug would have cut most winners before they ever ran.

`MAX_HOLD_MIN` (dashboard: **Max hold**) defaults to **15** and is the outer bound: a trade still open after 15 minutes is sold at market whatever the P&L, even one still making new highs. That is half the old 30m cap; 77% of the winners in the book had already printed their high by 15m, and a candle-price counterfactual at 15m was within $0.63 of the book's actual $4.66. Rug exits and stop losses still run first. `0` turns the cap off. A position whose pool has no tradeable depth cannot be sold, so it is not capped: it is carried until the pool prices again, or written off after 24h with no price.
