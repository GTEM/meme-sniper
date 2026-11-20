# Holder tables

The entry gate refuses a launch it cannot see: no holder table, no trade. Sources are tried cheapest first, first answer wins.

1. pump.fun mint-positions - needs PUMPFUN_API_KEY.
2. Solscan holders - needs a paid-capable SOLSCAN_API_KEY (Level 1 cannot call it).
3. On-chain walk - getTokenLargestAccounts + getMultipleAccounts on SOLANA_RPC_URL. The public api.mainnet-beta.solana.com endpoint answers that method with 429 Too many requests for a specific RPC call on every attempt, so a host with no key gets nothing from it.
4. GeckoTerminal /tokens/{mint}/info - keyless, and already fetched for token info. Its holders block carries the same measurement: top-ten share of supply plus holder count and the dev holding percentage.

A mint younger than about ninety seconds has no holder block yet. A pool refused for "not enough data: holder table" is re-queued up to four times instead of being marked seen, and a young mint's token info is cached for 45 seconds rather than ten minutes so those retries re-read it.

To see which endpoint the bot is using, press Test RPC in the dashboard: it prints the host and whether getTokenLargestAccounts answers.
