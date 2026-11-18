// Render build step: fetch the application bundle and unpack it into the
// checkout Render will run from. The bundle is a plain tar.gz of src/, public/,
// tools/ and the package files, published by the bot's mirror site.
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { execFileSync } from 'node:child_process';

const url = process.env.APP_BUNDLE_URL || 'https://meme-sniper-jkzxfz-preview.freebuff.site/app.tar.gz';

const res = await fetch(url);
if (!res.ok || !res.body) {
  console.error(`bundle fetch failed: ${res.status} ${url}`);
  process.exit(1);
}
await pipeline(res.body, createWriteStream('app.tar.gz'));
execFileSync('tar', ['-xzf', 'app.tar.gz'], { stdio: 'inherit' });
console.log(`app bundle unpacked from ${url}`);
