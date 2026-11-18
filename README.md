# meme-sniper (deploy repo)

Paper-mode Solana meme-coin sniping bot with its own dashboard, running on
Render's free web service. No payment method is required for any of it.

This repository is only the deploy shell. At build time `build.mjs` downloads
the application bundle (`src/`, `public/`, `tools/`, package files) from the
bot's mirror and unpacks it, then `deploy/render/start.sh` runs the bot with the
mirror pusher beside it.

## Deploy

1. <https://dashboard.render.com/register> — sign up with GitHub, no card.
2. **New → Blueprint**, pick this repository, apply.
3. When asked, set:
   - `PUBLISH_URL` = `https://meme-sniper-jkzxfz-preview.freebuff.site`
   - `INGEST_TOKEN` = the ingest token from the bot's own copy
4. Add a free monitor so the service never idles out (Render sleeps a free
   service after 15 minutes without a request):
   <https://uptimerobot.com/signUp> → HTTP(s) →
   `https://<service>.onrender.com/api/state` every 5 minutes.

Free tier limits: 750 instance hours a month (a 31-day month is 744), 0.1 CPU,
512 MB, and a filesystem that is wiped on every restart. The bot restores its
book from the mirror at boot, so the trade log survives that; see
`deploy/render/README.md` in the bundle for the rest.
