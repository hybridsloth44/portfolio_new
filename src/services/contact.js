import { site } from '../data/site';

export const instagramHref = /^https:\/\/(www\.)?instagram\.com\//i.test(site.instagram) ? site.instagram : null;
export const emailInquiryHref = site.email ? `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}` : null;
