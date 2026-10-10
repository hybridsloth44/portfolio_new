import { Link } from 'react-router-dom';
import { site } from '../data/site';

export default function SocialLinks() {
  const instagram = /^https:\/\/(www\.)?instagram\.com\//i.test(site.instagram) ? site.instagram : null;
  return <div className="social-links">
    {instagram && <a href={instagram} target="_blank" rel="noreferrer" aria-label="Shreesh on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>}
    <Link to="/work" aria-label="View photography"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="m8 6 2-3h4l2 3" /><circle cx="12" cy="13" r="4" /></svg></Link>
    {site.email ? <a href={`mailto:${site.email}`} aria-label="Email Shreesh"><MailIcon /></a> : <Link to="/contact" aria-label="Contact Shreesh"><MailIcon /></Link>}
  </div>;
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>;
}
