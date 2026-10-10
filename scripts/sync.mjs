// Server-side / trusted runner only. All Google Drive requests are read-only GETs.
import { readFile, writeFile, rename, mkdir, open, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { selectPublished, isExcludedFolder, deliveryUrl } from './sync-policy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (relative) => JSON.parse(await readFile(path.join(root, relative), 'utf8'));
const atomicJson = async (relative, data) => {
  const target = path.join(root, relative);
  const temporary = `${target}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2) + '\n');
  await rename(temporary, target);
};

async function main() {
  const apply = process.argv.includes('--apply');
  const config = await readJson('config/sync.json');
  if (!config.enabled) throw new Error('Synchronization is not configured. Follow docs/SYNC.md after frontend approval, then explicitly set config/sync.json enabled to true. No remote requests were made.');
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  if (apply) required.push('CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET');
  for (const key of required) if (!process.env[key]) throw new Error(`Missing server environment variable: ${key}`);
  await mkdir(path.join(root, '.sync'), { recursive: true });
  const lock = await open(path.join(root, '.sync/run.lock'), 'wx').catch(() => { throw new Error('Another sync is running or a stale .sync/run.lock needs inspection.'); });
  try {
    const collections = await readJson('src/data/collections.json');
    const curated = await readJson('config/curated-hpl-auction.json');
    const auth = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', signal: AbortSignal.timeout(30000),
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }),
    });
    if (!auth.ok) throw new Error(`Google authentication failed (${auth.status}). No credentials were logged.`);
    const token = (await auth.json()).access_token;
    if (!token) throw new Error('Google did not return an access token.');
    const drive = async (route, params = {}) => {
      const url = new URL(`https://www.googleapis.com/drive/v3/${route}`);
      url.search = new URLSearchParams({ supportsAllDrives: 'true', ...params });
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`Drive read failed (${response.status}); existing public catalog retained.`);
      return response;
    };
    const children = async (id) => {
      const files = [];
      let pageToken;
      do {
        const response = await drive('files', {
          q: `'${id.replaceAll("'", "\\'")}' in parents and trashed = false`,
          fields: 'nextPageToken,incompleteSearch,files(id,name,mimeType,md5Checksum,modifiedTime,createdTime,size,imageMediaMetadata(width,height))',
          pageSize: '1000', includeItemsFromAllDrives: 'true', ...(pageToken ? { pageToken } : {}),
        });
        const page = await response.json();
        if (page.incompleteSearch) throw new Error('Incomplete Drive listing; existing catalog retained.');
        files.push(...page.files);
        pageToken = page.nextPageToken;
      } while (pageToken);
      return files;
    };
    const folderMime = 'application/vnd.google-apps.folder';
    const imageMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif', 'image/tiff']);
    const folders = (await children(config.rootFolderId)).filter((file) => file.mimeType === folderMime && !isExcludedFolder(file.name, config));
    const discovered = [];
    const walk = async (folderId, collection, ancestors) => {
      for (const file of await children(folderId)) {
        if (isExcludedFolder(file.name, config)) continue;
        if (file.mimeType === folderMime) await walk(file.id, collection, [...ancestors, file.name]);
        else if (imageMimes.has(file.mimeType)) discovered.push({ ...file, collection: collection.slug, path: ancestors });
        // Drive shortcuts are deliberately not followed: they can escape the approved tree.
      }
    };
    for (const collection of collections) {
      const configuredId = config.folderIds[collection.slug];
      const matches = folders.filter((folder) => folder.name === collection.folderName && (!configuredId || folder.id === configuredId));
      if (matches.length !== 1) throw new Error(`Expected exactly one root folder named ${collection.folderName}. Resolve config.folderIds; no catalog was written.`);
      await walk(matches[0].id, collection, [collection.folderName]);
    }
    const selected = selectPublished(discovered, collections, curated, config);
    const currentCatalog = await readJson('public/portfolio.json');
    let state;
    try { state = await readJson('.sync/state.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; state = { assets: {} }; }
    const changed = selected.filter((file) => state.assets[file.id]?.checksum !== file.md5Checksum);
    await atomicJson('.sync/review.json', {
      generatedAt: new Date().toISOString(),
      discovered: discovered.map(({ id, name, collection, path: sourcePath, md5Checksum }) => ({ driveFileId: id, filename: name, collection, sourcePath, checksum: md5Checksum, selected: selected.some((file) => file.id === id) })),
    });
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'read-only plan', discovered: discovered.length, selected: selected.length, uploads: changed.length, removedFromWebsite: currentCatalog.photos.filter((photo) => !selected.some((file) => file.id === photo.id)).length }));
    if (!apply) { console.log('No uploads or public catalog changes. Review .sync/review.json locally.'); return; }
    if (changed.length > config.maxUploadsPerRun) throw new Error('Upload count exceeds configured limit. Review the plan first.');
    const assets = { ...state.assets };
    const photos = [];
    for (const file of selected) {
      if (!file.md5Checksum) throw new Error(`Missing content checksum for ${file.id}; refusing an unverifiable revision.`);
      let asset = assets[file.id];
      if (!asset || asset.checksum !== file.md5Checksum) {
        if (Number(file.size) > config.maxImageBytes) throw new Error(`Image exceeds configured size limit: ${file.id}`);
        const bytes = Buffer.from(await (await drive(`files/${encodeURIComponent(file.id)}`, { alt: 'media' })).arrayBuffer());
        if (bytes.length > config.maxImageBytes || createHash('md5').update(bytes).digest('hex') !== file.md5Checksum) throw new Error(`Image changed during sync or exceeded size limit: ${file.id}. Run a fresh plan.`);
        const form = new FormData();
        form.set('file', new Blob([bytes], { type: file.mimeType }), file.name);
        form.set('public_id', `shreesh/${file.collection}/${file.id}-${file.md5Checksum}`);
        form.set('overwrite', 'false');
        const cloud = encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME);
        const credentials = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', headers: { Authorization: `Basic ${credentials}` }, body: form, signal: AbortSignal.timeout(120000) });
        if (!response.ok) throw new Error(`Cloudinary upload failed (${response.status}); existing public catalog retained.`);
        const upload = await response.json();
        if (!upload.width || !upload.height || !upload.secure_url) throw new Error('Incomplete Cloudinary result.');
        asset = { checksum: file.md5Checksum, ...upload };
        assets[file.id] = asset;
        // Retain successful uploads for a resumable run; public catalog is committed only after all succeed.
        await atomicJson('.sync/state.json', { assets });
      }
      photos.push({ id: file.id, collection: file.collection, src: deliveryUrl(asset, 1600), fullSrc: deliveryUrl(asset, 2800), srcSet: [480, 800, 1200, 1600, 2400].map((width) => `${deliveryUrl(asset, width)} ${width}w`).join(', '), width: asset.width, height: asset.height, alt: file.caption || `${collections.find((collection) => collection.slug === file.collection).galleryTitle || collections.find((collection) => collection.slug === file.collection).title} — photograph ${file.displayOrder} by Shreesh`, caption: file.caption, displayOrder: file.displayOrder, published: true });
    }
    await atomicJson('public/portfolio.json', { schemaVersion: 1, mode: 'live', generatedAt: new Date().toISOString(), photos });
    console.log(`Wrote ${photos.length} optimized photographs. Build and review before deployment. No Drive originals or Cloudinary assets were deleted.`);
  } finally {
    await lock.close();
    await unlink(path.join(root, '.sync/run.lock'));
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
