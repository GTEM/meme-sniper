# meme-sniper (deploy repo)

Paper-mode Solana meme-coin sniping bot with its own dashboard, running on
Render's free web service. No payment method is required for any of it.

This repository is only the deploy shell. At build time `build.mjs` downloads
the application bundle (`src/`, `public/`, `tools/`, package files) from the
bot's mirror and unpacks it, then `deploy/render/start.sh` runs the bot with the
mirror pusher beside it. A commit here re-runs the build, which re-downloads the
current bundle — that is how a code change reaches the running service.

## Deploy

1. <https://dashboard.render.com/register> — sign up with GitHub, no card.
2. **New → Blueprint**, pick this repository, apply.
3. Add `PUBLISH_URL` and `INGEST_TOKEN` in the service's Environment tab for
   mirroring and book backup (optional; the bot runs without them).

The service keeps itself awake: it asks its own `/api/state` every ten minutes,
which resets Render's 15-minute idle timer. Free tier limits: 750 instance hours
a month (a 31-day month is 744), 0.1 CPU, 512 MB, and a filesystem that is wiped
on every restart — the bot restores its book from the mirror at boot.

## Controls

`POST /api/close-profitable` banks every open position that is in profit.
`POST /api/close-all` flats everything that has a buyer, profit or loss.
Both use the pool's real depth and the normal round-trip cost, and both report
what they skipped (a pool with no liquidity cannot be sold into).

`POST /api/reset` archives the book to
`data/archive/portfolio-before-reset-<time>.json` before clearing the portfolio
and the learned model. An optional `{"cash": 76.16}` body starts the fresh
book from that amount instead of the configured bankroll. It refuses while a
position is open, and the response carries the archived path and the fresh book
so a throwaway host can push the new book to the mirror immediately.

## Exit checks

Open positions are re-priced every `EXIT_CHECK_MS` (6s) in a loop separate from
the 25s scan. A flat book makes no requests; with positions it is one batched
price call per chain, falling back to one batched DexScreener call when
GeckoTerminal throttles, then to one batched Jupiter quote for whatever
DexScreener misses. Every quote is capped at 4s: an empty or slow answer is
retried on the next 6s slot, and only repeated misses back off, up to one scan
interval. The scan tick still records equity and saves the book. The fast loop
exists because a peak stop set at 12% used to fill 13-27% below the high (median
~18%): the move happened between two scans.

PumpSwap positions are priced from the pool's own reserves first: one
`getAccountInfo` per pool (cached 30 minutes) and one `getMultipleAccounts`
for every open position's token accounts. The pool's token accounts change
with every swap, so the exit sees the real price instead of DexScreener's
pair quote, which was measured sitting still for 15 seconds — long enough for
a +10% winner to print -27% on the next quote. Entries on PumpSwap fill at the
reserve price too. If the reserves are thinner than the index quote, the order
is re-capped to the on-chain depth before it is filled. If the RPC is down, the
index feeds below still price the exit and the reserve read retries after a
minute. `status.pumpswapPriced` counts reserve-priced samples and
`status.pumpswapRpcAt` is the last one.

The fast rug watch keeps its 18%/25% thresholds measured over a rolling
scan-length window, not over the last poll, so checking four times as often does
not quietly defuse it. The scan tick and the fast loop share one position-pass
lock, so the same position can never be sold twice.

## Momentum exhaustion

A trade that has run and then gives back 5% of its peak price (6% on AMM pools)
is sold, once its peak reached +6% net (+10% on AMM). This is the normal exit
for a move that has stopped working: waiting for the 12% peak stop let winners
that peaked at +8..+25% round-trip to breakeven or a loss. The peak stop stays
as the backstop for a gap. Tune per venue with `*_MOMENTUM_ARM_PCT` and
`*_MOMENTUM_GIVEBACK_PCT`; 0 turns either half off.

## Dashboard

Each open position shows its mint and pool address as a chip you can tap to
copy. Each closed trade has a **copy** button: it copies that trade as plain
lines — symbol, name, chain, venue, mode, mint, pool, opened, closed, held,
entry, exit, invested, returned, pnl, gross, fees, peak, score, rug risk, exit
reason, entry reasons — with no JSON.

The closed-trades table shows two different things: **peak** is the best price
the position touched (unrealised, muted and marked "gave back" when it ended
red), **profit** is what the trade actually netted after fees.

## Numbers in a trade

`entryPrice` and `exitPrice` are market prices: `exitPrice` is the price the
sells filled at, weighted by size. Fees are counted once, in `feesUsd`, never
folded into the price — so **price move − fees = net**. Trades closed before
this rule carry `exitPriceNet` (the old fee-inclusive value) and an
`exitPriceBasis` of `gross` or `fill`.
