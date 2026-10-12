import { site } from '../data/site';
import { emailInquiryHref, instagramHref } from '../services/contact';
import { InstagramIcon, MailIcon } from './ContactIcons';

export default function ContactLinks({ variant = 'details' }) {
  if (variant === 'inquiry') return <div className="contact-options">
    {instagramHref && <a className="contact-option" href={instagramHref} target="_blank" rel="noopener noreferrer"><InstagramIcon /><span className="contact-option-label"><span className="eyebrow">Instagram</span><span> — Send a DM</span></span><span className="contact-option-arrow" aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}
    {emailInquiryHref && <a className="contact-option" href={emailInquiryHref}><MailIcon /><span className="contact-option-label"><span className="eyebrow">Email</span><span> — Send an Inquiry</span></span><span className="contact-option-arrow" aria-hidden="true">↗</span></a>}
  </div>;
  return <div className="contact-links">
    <div><span className="eyebrow">Email</span>{emailInquiryHref ? <a href={emailInquiryHref}>{site.email}<span aria-hidden="true">↗</span></a> : <span className="contact-placeholder">Add your email address</span>}</div>
    <div><span className="eyebrow">Instagram</span>{instagramHref ? <a href={instagramHref} target="_blank" rel="noopener noreferrer">Instagram<span aria-hidden="true">↗</span></a> : <span className="contact-placeholder">Add your Instagram profile</span>}</div>
  </div>;
}
