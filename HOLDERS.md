# Holder tables

The entry gate refuses a launch it cannot see: no holder table, no trade. Sources are tried cheapest first, first answer wins.

1. pump.fun mint-positions - needs PUMPFUN_API_KEY.
2. Solscan holders - needs a paid-capable SOLSCAN_API_KEY (Level 1 cannot call it).
3. On-chain walk - getTokenLargestAccounts + getMultipleAccounts on SOLANA_RPC_URL. The public api.mainnet-beta.solana.com endpoint answers that method with 429 Too many requests for a specific RPC call on every attempt, so a host with no key gets nothing from it.
4. RugCheck /tokens/{mint}/report - keyless. Lists the top twenty wallets with their share of supply, pool excluded, and works on launches minutes old. On BONK it reports 36.11% in the top ten where GeckoTerminal says 40.42% (the pool-excluded difference).
5. GeckoTerminal /tokens/{mint}/info - keyless, already fetched for token info. Carries the same measurement: top-ten share plus holder count and the dev holding percentage.

A mint younger than about ninety seconds may have no holder block yet. A pool refused for "not enough data: holder table" is re-queued up to four times, and a young mint's token info is cached for 45 seconds rather than ten minutes so those retries re-read it.

To see which endpoint the bot is using, press Test RPC in the dashboard: it prints the host and whether getTokenLargestAccounts answers.

## Minimum pool age

`MIN_AGE_SEC` (dashboard: **Minimum pool age**) defaults to **120 seconds**. Pools younger than the floor are skipped at discovery before scoring: a pool with one tick of history has no exit to read, and a dev can drain it between two 25-second scans. `0` turns the floor off; the old behaviour was 15.

On the book at 2026-11-20 the 120s floor would have skipped 25 of 45 closed trades that netted **+$3.22**, while the 20 older trades netted **+$1.30**. It removes the DCTY rug (-$1.96) but also Rubio (+$2.52) and Cowboy Cat (+$2.16) - the early band is where both the wipeouts and the winners are, which is why this is a dashboard setting and not a hard-coded gate.

Closed trades now record `ageAtEntrySec`. The Settings card prints the what-if list from the current book, so changing the floor shows its effect on past trades immediately.
