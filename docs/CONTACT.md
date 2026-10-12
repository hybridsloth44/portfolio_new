# Booking and direct contact

`/work-with-me` invites visitors to request a quote without displaying a price. Its Request a Quote CTA leads to `/contact`.

The Contact page offers two direct options:

- Instagram opens the configured profile in a new tab for a DM.
- Email opens the visitor's mail application with the subject "Photography Booking Inquiry". The visitor reviews and sends the message there.

Edit `email`, `instagram`, and `emailSubject` in `src/data/site.js`. The Contact page, About page, and homepage/footer social links use these shared values through `src/services/contact.js`.

There is no contact form, external delivery API, or browser environment configuration. Personal telephone details are neither collected nor published. The existing Google Drive / Cloudinary server-only settings in `.env.example` belong to the separate synchronization tools.
