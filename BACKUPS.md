 # Backups

Two independent copies of the project live outside the Freebuff app workspace.

## 1. Freebuff mirror site (primary)

- archive: <https://meme-sniper-jkzxfz-preview.freebuff.site/backup/meme-sniper-backup-2026-11-19b.tar.gz>
- manifest (sha256 + restore steps): <https://meme-sniper-jkzxfz-preview.freebuff.site/backup/MANIFEST.txt>
- sha256 `9690d8c20369641b54f3f8a562dd5d230669d07dc134d8d380f0bf9a88dabd33`, 242 files, 3.07 MB

## 2. This repository, `backup/`

`.github/workflows/mirror-backup.yml` downloads that archive, verifies the
sha256 the manifest publishes, and commits it under `backup/`. Run the workflow
again from the Actions tab to refresh it; older archives are replaced, not
stacked. The account is public, so the archive is public — it holds source and
the paper book only: every `.env` and `.secrets/` entry was stripped and every
RPC api-key value rewritten to `REDACTED` before it was published.

## Restore

```
tar -xzf meme-sniper-backup-2026-11-19b.tar.gz
cd meme-sniper
npm install
# recreate .env and .secrets/ingest-token yourself; they are never archived
node tools/selftest.mjs    # expect: ALL CHECKS PASSED
node src/index.js          # dashboard on http://localhost:3080
```

The live paper book pulled from the mirror is
`data/render-live-book-2026-11-19.json` inside the archive.
