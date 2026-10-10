// One-time connected-Drive import. Signed download references stay in ignored .sync/.
import { readFile, mkdir, stat, rename, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const entries = JSON.parse(await readFile('.sync/downloads.json', 'utf8'));
await mkdir('.sync/originals', { recursive: true });
let cursor = 0;
let completed = 0;
const failures = [];
async function worker() {
  while (cursor < entries.length) {
    const item = entries[cursor++];
    if (!/^[a-zA-Z0-9_-]+$/.test(item.id)) throw new Error('Invalid file ID');
    const extension = path.extname(item.filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) throw new Error('Unsupported input');
    const destination = path.join('.sync/originals', item.id + extension);
    if ((await stat(destination).catch(() => null))?.size === item.size) { completed++; continue; }
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.oaiusercontent.com')) throw new Error('Unexpected download host');
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await pipeline(Readable.fromWeb(response.body), createWriteStream(destination + '.part'));
        if ((await stat(destination + '.part')).size !== item.size) throw new Error('Size mismatch');
        await rename(destination + '.part', destination);
        completed++;
        if (completed % 10 === 0) console.log(`Downloaded ${completed}/${entries.length}`);
        break;
      } catch (error) {
        await rm(destination + '.part', { force: true });
        if (attempt === 2) failures.push({ id: item.id, reason: error.name });
      }
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(JSON.stringify({ downloaded: completed, total: entries.length, failures }));
if (failures.length) process.exitCode = 1;
