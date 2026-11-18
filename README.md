# meme-sniper (deploy repo)

Paper-mode Solana meme-coin sniping bot with its own dashboard, running on
Render's free web service. No payment method is required for any of it.

This repository is only the deploy shell. At build time `build.mjs` downloads
the application bundle (`src/`, `public/`, `tools/`, package files) from the
bot's mirror and unpacks it, then `deploy/render/start.sh` runs the bot with the
mirror pusher beside it.

A commit to this repo re-runs the build, which re-downloads the current bundle —
that is also how a code change reaches the running service.

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

`POST /api/close-profitable` banks every open position that is in profit, using
the pool's real depth and the normal round-trip cost. Positions with no
tradeable depth are left alone and reported in the response.
