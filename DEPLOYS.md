# Deploy log

Render builds download the application bundle from the mirror (see README), so a
deploy is this log plus a push. Each entry names the bundle it shipped.

| When (UTC)       | Bundle sha256 | Change |
| ---------------- | ------------- | ------ |
| 2026-11-19 00:39 | `ae6ebfbbeb5f23e967fffdf4373026f5cf6e0cefda54c1c1129796fcfbda0d29` | Every closed trade shows exact entry/exit prices plus `price move - fees = profit` on the row and in the copied record; the fees card is split into closed and open; dollars carry the sign in front (`-$0.04`). |
| 2026-11-20 00:08 | `d7e3162baa553ca86ee2acbe05cf243eb61485c76d74812192d663cd59c1b4b0` | SOL is quoted from its own chain of keyless sources (Jupiter, DexScreener, Coinbase, Kraken, CoinGecko) and the last good quote is kept, so a single 429 at boot no longer shows a funded wallet as $0.00; if every source is down the bot re-reads the wallet 90s later. |
| 2026-11-20 00:24 | `86bfc7dd6cde234cf5a6b343c12bcfa83cbdc9d4db7ee28a25e6545536b3e3c1` | The test wallet is re-read every 5 minutes while the bot runs (code default, no dashboard env var), so the card tracks the balance and the SOL price instead of the boot snapshot; a scheduled read reports and never re-seeds the book. |
