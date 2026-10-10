# Shreesh — Photography

A photography portfolio built with React, Vite, Tailwind CSS, and React Router. The live catalog contains 145 actual photographs imported through authorized Google Drive access on 10 October 2026. No stock or generated photographs. Home and About use the supplied photographer portrait from `Photograph/IMG_0252 (3).PNG`, with responsive local WebP copies in `public/images/photographer/` and the original proportions preserved.

The current design follows Sean Tucker's website at the user's request: locally hosted Archivo Black headings, Georgia body copy, a pale grey background throughout, a split introduction with rounded portrait, repeated section titles, and three-column homepage collections. Work uses compact covers in four desktop columns, three tablet columns, and two mobile columns, following the ranked navigation order. The original charcoal direction has been superseded. Font licenses are included in `public/fonts/`. Collection names inside preview image blocks are placeholder labels; they disappear when real photographs are supplied.

## Preview in VS Code on this computer

1. In VS Code, choose **File → Open Folder** and open `C:\Users\shreesh\OneDrive\Videos\Documents\shreesh\photography`.
2. Choose **Terminal → New Terminal** (PowerShell).
3. Start the website:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 dev
   ```

4. Open the **Local** URL printed in the terminal, normally **http://127.0.0.1:5173/**. Ctrl+click the URL. If that port is occupied, Vite prints another port.
5. Edit files in `src/` and save; the browser updates automatically. Press **Ctrl+C** in the terminal to stop.

Alternatively choose **Terminal → Run Task → Portfolio: start preview**. The helper finds the checksum-verified portable Node runtime under `.tools/` on this computer; it does not change the system PATH or PowerShell policy permanently.

## Standard setup on another computer

Install Node.js 22.12+ (Node 24 LTS recommended), restart VS Code, then:

```sh
npm ci
npm run dev
```

The portable runtime and `node_modules` are ignored and should not be committed. `package-lock.json` pins installed dependencies.

## Build and checks

```sh
npm test
npm run build
npm run preview
```

On this computer without Node on PATH, substitute `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/npm.ps1 test` (or `build` / `preview`). The production output is `dist/`; preview normally uses port 4173.

## Editing the portfolio

| File | What to edit |
| --- | --- |
| `src/data/site.js` | Biography, homepage introduction, announcement, real email, Instagram URL, portrait, collection sections and descriptions |
| `src/data/collections.json` | Collection metadata, collection cover IDs; preserve the exact Drive folder names |
| `public/portfolio.json` | Public image catalog: local paths or approved CDN URLs with actual pixel dimensions |
| `config/curated-hpl-auction.json` | Five provisional auction selections, order, captions, approval revision and published status |
| `config/sync.json` | Server-side folder mapping and publishing policy; sync starts disabled |
| `src/styles/index.css` | Typography, spacing, breakpoints, and light palette |

### Contact form

Instagram links to `https://www.instagram.com/shreeshhhhhhh/?hl=en`; direct email links use `skambampally@gmail.com`. Contact has a responsive message form matching the supplied reference. EmailJS submission code is implemented, but delivery remains inactive until the connected Gmail Service ID, Template ID, and Public Key are configured. See [docs/CONTACT.md](docs/CONTACT.md) for account setup, template settings, and the three public environment variables. No Gmail password or private key is used in the browser.

`HPL_Auction` is preserved as the folder/collection name; its dedicated gallery is titled **HPL Auction** as requested. The five supplied files are the only shortlisted auction photos. They are unpublished pending review; the initial sequence is provisional. The final 12–18 image curation requires visual review of the actual photographs. There are no auction subpages or filters. The excluded folder has no frontend collection or route and is rejected during recursive synchronization.

### Local photographs

The eight regular collections now use optimized local WebP copies in `public/images/`, with responsive sizes, actual dimensions, and original Drive filenames/IDs in `public/portfolio.json`. EXIF orientation is applied and embedded metadata is omitted from public copies. Original files remain unchanged in Drive. The excluded folder was not traversed. HPL Auction remains unpublished pending manual review.

The one-time import tools are `scripts/download-import.mjs` and `scripts/prepare-local-photos.py`. The downloader consumes temporary signed references from connected Drive access in ignored `.sync/downloads.json`; those references are removed after download and must never be committed. The preparation script requires Pillow and consumes `.sync/inventory.json` plus `.sync/originals/`. It validates the complete inventory before publishing and creates ignored contact sheets for choosing covers. These tools are separate from the production synchronization runner.

For future authorized local additions, use entries such as:

Put authorized photos in `public/images/` and replace the catalog with entries such as:

```json
{
  "schemaVersion": 1,
  "mode": "live",
  "generatedAt": null,
  "photos": [
    {
      "id": "your-photo-id",
      "collection": "banaras-2025",
      "src": "/images/your-actual-photo.jpg",
      "fullSrc": "/images/your-actual-photo.jpg",
      "width": 6000,
      "height": 4000,
      "alt": "Write a brief factual description of the photograph",
      "displayOrder": 1,
      "published": true
    }
  ]
}
```

The filename and dimensions above are a schema example, not a selected photograph. Use actual dimensions. `mode: "live"` disables all demo gallery slots; empty collections show “Photographs coming soon.” Optional `srcSet` enables responsive variants. Gallery, cover, hero, and lightbox images preserve the photograph without cropping. A portrait fits within its reserved frame. Customize descriptive alternative text as part of editorial review.

## Synchronization and deployment status

**Connected Google Drive access has been tested and the initial 145-photo import is complete.** Drive originals were read only. The unattended OAuth runner, Cloudinary uploads, and scheduled synchronization are **not configured or tested**. The verified folder IDs are recorded in `config/sync.json`, which remains disabled. The frontend serves local optimized copies through `/portfolio.json`; it never receives OAuth/Cloudinary secrets or temporary Drive download references.

Read [docs/SYNC.md](docs/SYNC.md) for the prepared read-only sync runner, review workflow, automatic scheduling architecture, deletion behavior, and failure handling. Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel preparation. Nothing is deployed. The current local image assets can be deployed statically; automatic updates require the separate synchronization setup.

## Features

- Home, Work, nine collection galleries, About, Contact, and 404.
- Smaller typography and tighter spacing throughout: 14px body copy and collection-page titles capped at 44px. The homepage opening follows the supplied reference with a broad split composition, responsive 24–41px desktop headline, portrait up to 500px wide, and a hero filling the first screen. The large rolling Photographer strip begins below the landing viewport, with faded edges and a pause control. Homepage collections have one regular paragraph each and aligned title, image, and button rows.
- Work uses compact portrait covers with matching heights within each row and original proportions, separated by 12px gaps (10px on narrow screens). Galleries choose row breaks for the available width, aligning both edges with even 8px gaps (6px on narrow screens). Gallery photographs stay below 300px high, with no cropping or padded frames. A short final row stays compact and aligns left. Galleries retain both portrait and landscape photographs; clicking opens the full-size viewer.
- Native modal fullscreen viewer with focus containment, focus restoration, scroll lock, previous/next, arrow keys, Escape, and wrapping navigation.
- Lazy-loaded responsive images, eager hero, image loading/error fallbacks, catalog retry, route-specific titles and descriptions.
- Accessible navigation, skip link, focus indicators, reduced-motion support.
- Circular Instagram/contact icons with supplied destinations, and a responsive contact form with required fields, sending feedback, and draft preservation on failure. EmailJS account configuration is pending.

## Structure

```text
src/
  components/   Shared photograph, collection card, modal, contact links
  pages/        Home, Work, Gallery, About, Contact, NotFound
  layouts/      Consistent navigation and footer
  data/         Editable profile and allowed collections
  hooks/        Catalog loading and page metadata
  services/     Public catalog validation and preview data
  styles/       Tailwind and portfolio styling
public/         Live public catalog and optimized photographs
config/         Server-only sync policy and curated approvals
scripts/        Read-only Drive sync and Windows npm helper
tests/          Publishing policy and image delivery safety checks
docs/           Sync and deployment instructions
```
