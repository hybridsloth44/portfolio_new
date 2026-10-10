# Vercel preparation

No site has been deployed. The current 145-photo static catalog can be deployed with the optimized `public/images/` assets. Review the frontend and photographs first. Cloudinary and unattended synchronization are optional subsequent infrastructure and remain unconfigured.

1. Put this project in your own Git repository. Keep `.env`, `.tools`, `.sync`, and `node_modules` out of Git; `.gitignore` is included. Never place server secrets in Vite environment variables.
2. Run `npm ci`, `npm test`, and `npm run build`. Review `npm run preview` with real photographs on desktop and mobile. Test a direct visit/refresh to `/work/banaras-2025`.
3. Import the repository into Vercel. Choose Vite, Node 24, build command `npm run build`, output `dist`. The included `vercel.json` routes SPA pages back to `index.html` while preserving public catalog/assets.
4. The static site needs no Google or Cloudinary secrets. Configure those exclusively in the trusted synchronization runner described in SYNC.md. Cloudinary CDN URLs are public delivery URLs, not credentials.
5. Verify the deployed homepage, all routes, direct route refreshes, keyboard lightbox, uncropped images, catalog errors, and real contact links. Set a custom domain if desired.
6. Only after the initial authenticated sync and deployment succeed, configure scheduled sync plus catalog commits/deploy triggers. Vercel will not synchronize private Drive by itself.

Page titles/descriptions update on navigation. This is a client-rendered SPA; social crawlers may only read the generic `index.html` metadata. If rich per-collection social previews become necessary, add prerendering/server rendering after the catalog is final. Add your actual canonical domain, social preview image, and sitemap then; none have been invented.
