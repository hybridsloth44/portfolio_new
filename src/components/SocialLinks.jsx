import { Link } from 'react-router-dom';
import { emailInquiryHref, instagramHref } from '../services/contact';
import { InstagramIcon, MailIcon } from './ContactIcons';

export default function SocialLinks() {
  return <div className="social-links">
    {instagramHref && <a href={instagramHref} target="_blank" rel="noopener noreferrer" aria-label="Shreesh on Instagram"><InstagramIcon /></a>}
    <Link to="/work" aria-label="View photography"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="m8 6 2-3h4l2 3" /><circle cx="12" cy="13" r="4" /></svg></Link>
    {emailInquiryHref ? <a href={emailInquiryHref} aria-label="Email Shreesh"><MailIcon /></a> : <Link to="/contact" aria-label="Contact Shreesh"><MailIcon /></Link>}
  </div>;
}
