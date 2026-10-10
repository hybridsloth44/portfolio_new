# Secure photo synchronization

The connected-Drive import serves 145 photographs across eight regular collections plus the final 18-image HPL Auction selection as local responsive WebP copies. The private folder was accessed through the authorized Drive connector; no assumption of public sharing was required. HPL Auction was selected after reviewing all 221 originals in its five subfolders. Home and About use the supplied photographer portrait. No Drive originals were modified or deleted.

The **separate unattended Node runner below is intentionally disabled**. It has not been authenticated or integration-tested with Google OAuth credentials or Cloudinary. Connecting the Drive plugin for a one-time import does not configure scheduled synchronization. Do not enter secrets into `src/`, `public/`, chat, or any `VITE_` variable.

## Data flow

```text
Private Drive portfolio (read-only OAuth)
  → complete recursive inventory of the nine allowed folders
  → publishing policy + revision-bound auction approvals
  → signed-in server-side upload to Cloudinary
  → optimized public image catalog
  → Vite production build
  → Vercel
```

The original tree stays intact. Only the nine exact configured root folders are traversed. Nested folders are scanned without creating extra portfolio pages. `HPL_Day1` is denied at every depth, case-insensitively; Drive shortcuts are not followed. A missing, inaccessible, or ambiguous collection aborts the run so a partial scan cannot remove an entire gallery accidentally.

## Configure unattended synchronization

1. Create a Google Cloud project and enable Drive API. Configure your OAuth consent screen and a **server-side** OAuth client. Authorize the account with access to the private Portfolio folder, requesting only `https://www.googleapis.com/auth/drive.readonly` and offline access. Obtain a refresh token through Google's OAuth flow; the user completes authentication. Test-mode tokens can expire; configure the consent app appropriately for unattended operation.
2. Create your Cloudinary environment. Keep its API secret in the trusted runner's secret store.
3. Copy `.env.example` to `.env` locally and fill in the six variables. This file is ignored. For a scheduled runner, set repository/environment secrets instead of committing a file. No frontend environment variables are required.
4. Inspect `config/sync.json`. The supplied Portfolio root ID and verified collection folder IDs are already set. Leave folder names unchanged. Recheck mappings if folders are moved or replaced.
5. Set `enabled: true` only when ready. Run `npm run sync:plan`. This authenticates and reads metadata only; it does not download photographs, upload images, or change the public catalog. It writes an ignored local `.sync/review.json` inventory for review.
6. The final 18 auction selections in `config/curated-hpl-auction.json` are already visually reviewed and revision-bound. For subsequent changes, review the actual photographs, set `published: true`, copy that revision's MD5 `checksum` from the review inventory into `approvedChecksum`, and choose `displayOrder`. Add further files only after visually reviewing them. Retain 12–18 total. A changed original requires a fresh review and checksum approval.
7. Review the regular-collection policy: `publishNew: true` publishes every supported photo in those approved folders on each apply run. This is deliberate opt-in via `enabled`; use `excludedFileIds` for individual exceptions. Setting `publishNew: false` pauses those collections entirely; the next apply removes their entries from the website catalog. Use the dry-run report first.
8. Run `npm run sync:plan` again, then `npm run sync:apply`. Apply downloads only selected images, verifies their checksums, uploads server-side, and atomically replaces `public/portfolio.json` only after all required uploads succeed. Run the build and visually review every gallery.

## Publishing guarantees

- Regular approved folders automatically include new/changed supported photos on a subsequent successful run.
- Auction files are omitted unless individually approved. Even a previously approved file returns to unpublished when its content checksum changes. A new approval of the changed revision is required. The manifest's filename and collection must also match.
- Removed, trashed, moved outside allowed folders, or explicitly unpublished files disappear from the rebuilt public catalog. No destructive Drive API exists in this code.
- Cloudinary assets are deliberately retained. Removing a catalog entry removes it from the website but does **not** revoke a previously public CDN URL. If immediate revocation is ever needed, add a separately authorized Cloudinary cleanup/invalidation step; never delete Drive originals.
- Originals are uploaded as images without incoming crop transformations. Delivery uses `f_auto,q_auto,c_limit,w_*`; the CDN chooses format/quality and limits width while preserving aspect ratio. The upload response supplies actual dimensions, including orientation normalization.
- Cache keys include file content checksum. Changed images use new immutable URLs. No Google Drive thumbnail/preview URLs are used.
- A complete scan is required. Incomplete listings, failed authentication/download/upload, checksum changes mid-run, oversized files, and excessive upload counts stop publication. Current `public/portfolio.json` remains intact. Successful intermediate uploads are recorded in ignored state for retry.
- Supported inputs: JPEG, PNG, WebP, AVIF, HEIC, HEIF, TIFF. RAW files, videos, SVG, Google Docs, and shortcuts are skipped.
- Local `.sync/run.lock` prevents overlapping processes in one checkout. A killed process may leave a stale lock: verify there is no running sync before manually clearing it. A distributed scheduler must additionally enforce one active job.

## Automatic scheduling architecture

For roughly hundreds of full-size photos, use a scheduled trusted CI job or a long-running worker, rather than downloading entire collections inside a short-lived Vercel request. A proposed scheduled workflow:

1. Acquire scheduler concurrency lock and check out the repository.
2. Restore `.sync/state.json` from private persistent storage/cache; it is an optimization, not the authoritative inventory.
3. Inject server secrets; run `npm ci`, policy tests, then `npm run sync:apply`.
4. Store updated sync state privately. If the catalog's photo entries changed, commit **only** `public/portfolio.json` to the repository used by Vercel (or publish the catalog atomically to object storage and trigger a deployment).
5. Let Vercel build/deploy the successful catalog; alert on errors without logging tokens. Do not publish stale build artifacts from failed jobs.

Configure the schedule and deployment credentials only after an authenticated initial run is reviewed. No automatic schedule, CI integration, or deployment token is configured yet. The current runner sets a fresh `generatedAt` each time; compare `photos` rather than that timestamp to avoid needless deployments.

A full paginated scan handles additions, revisions, removals, and folder moves reliably at this portfolio's scale. If it grows substantially, use Drive's changes feed with a durable cursor, retain periodic full reconciliation, and preserve all exclusion/approval rules. Manual approvals remain source-controlled JSON; scheduler runs must not edit that manifest.

## Verification still required with real accounts

Connected Drive access, eight regular folder listings, and all 145 regular-photo downloads succeeded. The nine root folder mappings were identified; the excluded folder was not traversed. Still verify the unattended runner's OAuth access, pagination, Cloudinary upload/orientation results, changed revisions, removal reconciliation, revoked auction approval, transient failures, scheduler persistence, and an end-to-end Vercel redeploy. Offline policy tests and the connected import do not prove that separate runner works.

References: [Drive list API](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list), [Drive read-only scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [Google server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [Cloudinary server uploads](https://cloudinary.com/documentation/upload_images), [Cloudinary image transformations](https://cloudinary.com/documentation/image_transformations).
