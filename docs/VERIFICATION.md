# Portfolio verification

## Balanced landing-page margins - 11 October 2026

Balanced the hero grid into equal columns, with the text anchored to its left edge and the portrait to its right edge. This gives equal outer margins while preserving the portrait's previous size. The headline, social icons, and View Work link share one center line. Verified equal outer margins to within one pixel at 768, 1024, 1240, 1440, and 1920px; mobile layouts at 320/375px, below-screen marquee positioning, portrait proportions, and homepage card alignment also passed. Inspected the desktop screenshot. Production build passed.

## Instagram and contact form - 11 October 2026

Added the supplied Instagram profile and Gmail address. Social icons now use black circular backgrounds with white line icons; Instagram appears first in the homepage/footer icons. Contact now follows the reference form with first/last name, email, optional phone, message, and Send. The submission service uses EmailJS's documented REST endpoint and public Vite configuration, with a 20-second timeout, duplicate-submit protection, required-field checks, success feedback, and preserved drafts after failure. Recipient configuration stays fixed in the EmailJS template.

Verified layouts at 320, 375, 768, 1150, and 1920px; desktop name columns, mobile stacking, supplied links, circular icons, and no horizontal overflow. Isolated browser mocks verified request contents, sending lock, success reset, failure feedback, retry availability, and the unconfigured state. Screenshots of desktop/mobile contact and footer icons were inspected. Production build passed. No live email was sent: Gmail authorization and the EmailJS Service ID, Template ID, and Public Key are still required. Setup is documented in CONTACT.md.

## Rolling heading below the landing screen - 11 October 2026

Extended the opening section to fill the first viewport, accounting for the header and optional announcement. Its desktop content keeps the previous position; additional room below pushes the rolling heading out of view on arrival. The heading now spans 92% of the page with larger responsive type (up to 88px), wider word spacing, and a gradient fade at both edges, following the supplied image. The fade applies only to the text window so the pause control remains visible.

Verified the heading starts below the first screen at seven desktop/mobile sizes, including after dismissing the announcement. No overflow; portrait proportions and homepage card alignment remain correct. Pause/resume passed, reduced-motion disables animation, and the rolling-strip screenshot was inspected. Production build passed.

## Homepage reference proportions - 11 October 2026

Following the supplied side-by-side screenshots, expanded the homepage opening to occupy roughly 90% of the desktop viewport including the header. The split composition now spans up to 1360px, with a responsive 24–41px headline, wider separation between text and portrait, and an uncropped portrait up to 500px wide. Homepage branding and navigation scale with the viewport and use the reference's outer margins. Other pages retain their smaller typography and compact spacing. Homepage collection copy and shared row alignment are unchanged.

Browser checks passed at 320, 375, 768, 1024, 1240, 1440, and 1920 pixels: no horizontal overflow, preserved portrait ratio, vertically centered desktop hero columns, aligned collection images/buttons, no italic homepage descriptions, and all nine mobile dropdown links. Desktop screenshots at the supplied comparison sizes and mobile were inspected. Production build passed.

## Smaller typography and tighter homepage alignment - 11 October 2026

Rechecked Sean Tucker's reference website. Reduced heading, navigation, body, button, and footer sizes, plus header height and section margins throughout. Body copy is 14px; the desktop homepage introduction is 24px; collection titles are capped at 44px; gallery descriptions are 16px. Removed italic introductions from homepage cards, keeping one regular paragraph. The centered split hero has balanced text and portrait columns. Desktop homepage cards share title, image, paragraph, and button rows, including when a title wraps. Original photo proportions remain intact.

Work gaps are now 12px (10px narrow); gallery gaps are 8px (6px narrow). Browser checks passed at 320, 375, 768, 1024, 1440, and 1920 pixels for homepage text and alignment, Work row heights, all eight populated gallery counts, and horizontal overflow. About and Contact also passed overflow checks. Desktop/mobile homepage and desktop Banaras screenshots were inspected. Production build passed.

## Aligned spacing and site-wide grey — 11 October 2026

The navbar's pale grey (#f4f4f4) now continues across all page backgrounds; fonts are unchanged. Work uses proportionally sized covers with matching row heights and smaller gaps, in ranked order, with four desktop, three tablet, or two mobile columns. Gallery rows adapt their photo count to the container width, aligning both edges and preserving photo proportions with 16px desktop / 10px mobile gaps. Only a short final row may be narrower, aligned left. The header's viewport-width backdrop was removed to prevent scrollbar-width overflow.

Browser checks passed at 320, 375, 768, 1440, and 1920 pixels for all eight populated galleries and nine Work links. Original proportions, matching image/surface dimensions, gallery row edges, photo counts, horizontal overflow, background colour, original fonts, and full-size viewer keyboard navigation were verified. Desktop Work, Wildlife, and mobile Work/concert screenshots were inspected.

## Compact Work and gallery layouts — 11 October 2026

Work now has a centered grid of smaller cards: three desktop columns, two tablet columns, and one mobile column. Collection galleries use up to three photographs per desktop row with a 300px height limit; mobile photos use one column with a 360px height limit. Photo and surface dimensions match, preserving original proportions without cropping or internal padding, including short final rows.

Browser geometry checks passed at 320, 375, 768, 1440, and 1920 pixels for all eight populated galleries and all nine Work cards. Gallery counts are unchanged. The full-size viewer opens the selected photograph and retains arrow-key navigation and Escape closing.

## Work navigation dropdown — 10 October 2026

The Work navigation control opens a right-aligned list of all nine collections, following the supplied reference. Only the exact current page is underlined. Desktop and mobile dropdown surfaces use translucent backgrounds while text remains opaque. Work does not navigate to the index; each collection links directly to its gallery. Verified current-page styling on Home, Work, Banaras, About, and Contact; desktop/mobile translucency; keyboard Enter and Escape; expanded-state accessibility; outside-click dismissal; closing on selection; and no mobile overflow. Desktop/mobile screenshots were inspected. Production build passed.

## Natural photo proportions and portrait Work covers — 10 October 2026

The padded 4:3 frames were removed following user feedback. Work now selects only portrait photographs for its covers; galleries retain all 145 portrait and landscape photos. The shared PhotoRows component divides each desktop row's widths proportionally to the photographs' original ratios. This aligns photo heights without cropping, stretching, or adding side panels. A final unpaired photograph keeps half-row sizing. Mobile rows become a single column.

Work was subsequently refined to fixed column positions across all rows. Cover widths follow their original ratios at a shared height derived from the widest portrait, with no colored padding. Verified the Banaras/Bikes row and all Work covers at 375, 768, and 1440 pixels: fixed column starts, matching photo heights, aligned captions, preserved photo proportions, and no overflow. Visually inspected the updated Banaras/Bikes row. Production build passed.

Browser geometry checks passed for every Work cover and all eight populated galleries at 320, 375, 768, and 1440 pixels: portrait-only Work covers, original aspect ratios on every image and wrapper, images filling their surfaces without padding, aligned row tops and heights on desktop, unchanged gallery counts, and no horizontal overflow. Desktop Work and gallery screenshots were visually inspected. Existing navigation, lightbox keyboard/focus behavior, image error handling, and catalog retry checks passed. Production build passed.

## Connected real-photo import — 10 October 2026

- Authorized connected Google Drive folder access and downloads succeeded. Imported 145 actual photographs: SeedheMaut2026 (13), Banaras 2025 (35), Bikes (14), Hyderabad Padel League (23), Pickleball Indian Open 2026 (15), State of the League Pickleball (15), Wildlife (17), and Street Photography (13).
- The excluded folder was not traversed. HPL Auction remains unpublished and its five provisional shortlist entries remain unchanged. The photographer portrait remains a placeholder as requested.
- Produced 546 responsive WebP assets, approximately 132 MB combined, from approximately 628 MB of originals. Applied orientation, preserved aspect ratios, and omitted embedded metadata. Drive originals were never modified or deleted.
- Inspected all eight contact sheets and chose actual collection covers. The homepage retains only its three approved collection cards.
- Chrome decoded every one of the 145 full-size public photos successfully and verified aspect ratios against catalog dimensions. Verified counts in all eight galleries and actual homepage cover loading. Restarting Vite after the bulk asset import resolved one missed public-file watcher entry; the clean-server check passed.
- Production build and seven publishing-policy tests passed. Browser checks passed for routes at 320, 375, 768, and 1440 pixels, lightbox previous/next, arrow keys, wraparound, Escape, focus trap/restoration, scroll lock, unavailable images, catalog error/retry, and live empty-gallery behavior. No uncaught browser errors. Inspected actual-photo desktop and mobile screenshots after loading completed.
- Cloudinary, unattended OAuth credentials, scheduled sync, and deployment remain unconfigured and untested. The connected import does not authenticate the separate production runner.

## Earlier frontend checks

Verified on 10 October 2026 with a locally running Vite server and isolated headless Chrome. Real photographs and external services were not involved.

After the Sean Tucker layout rebuild, browser checks passed again at 320, 375, 768, and 1440 pixels, including locally hosted Archivo Black loading, three-column homepage / two-column Work layouts, keyboard lightbox behavior, unavailable images, and retry handling. Desktop/mobile screenshots were inspected. Additional checks passed for the collection dropdown, mobile navigation, Escape handling, closing navigation on route changes, and dismissing the announcement. Sean Tucker's current desktop/mobile design and computed typography were inspected; the heading font and desktop introduction dimensions match the reference. Own content, navigation, photos, and collection lengths necessarily change the overall page composition.

- Production build passed.
- Seven Node publishing-policy tests passed: collection allowlist, excluded trees, exact provisional auction count, revision-bound manual approval, regular publishing rules, removal reconciliation, and CDN URL transforms.
- Home, Work, auction Gallery, About, Contact, and 404 rendered at 375, 768, and 1440 pixel widths with no horizontal overflow. Desktop collections use two columns and mobile uses one. Gallery masonry switches appropriately.
- Work exposes exactly nine collections. The excluded folder is absent from the frontend.
- Viewer verified: open/close, previous/next buttons, arrow keys, first/last wrapping, Escape, Tab containment, focus restoration, and body scroll lock. A focus issue found during testing was corrected and the checks rerun successfully.
- Catalog failure/retry and unavailable-image fallback passed using intercepted test responses.
- A temporary neutral image fixture verified portrait aspect ratio in the gallery and `object-fit: contain` in the viewer. Fixture responses existed only in the isolated test browser and were not saved to the public portfolio.
- Live catalog mode with an empty collection showed the coming-soon state without demo placeholders.
- No uncaught browser errors occurred. Desktop and mobile screenshots were inspected.
- Disabled sync invocation refused to run before making remote requests.

Still pending: final auction curation and approval, portrait, Cloudinary uploads, unattended OAuth authentication, scheduled synchronization, real contact destinations, and Vercel deployment. Connected Drive access and the local image import are verified above.

Local-only testing dependencies and screenshots are under ignored `.tools/qa/`; they are not bundled into the website. Repeatable policy tests are included in `tests/` and run with `npm test`.

Desktop Work now opens on mouse hover. Browser checks passed for moving through all collection links, closing when hovering another navigation item, Enter/Escape, outside click, desktop gallery selection, and mobile click-to-open and gallery selection. Mobile layouts retain tap controls. Translucent backdrop edges are feathered independently of the text, with no menu border or shadow. Production build passed.
