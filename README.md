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
