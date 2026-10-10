import { site } from '../data/site';

export default function ContactLinks({ large = false }) {
  const instagram = /^https:\/\/(www\.)?instagram\.com\//i.test(site.instagram) ? site.instagram : null;
  return <div className={`contact-links ${large ? 'contact-links-large' : ''}`}>
    <div><span className="eyebrow">Email</span>{site.email ? <a href={`mailto:${site.email}`}>{site.email}<span aria-hidden="true">↗</span></a> : <span className="contact-placeholder">Add your email address</span>}</div>
    <div><span className="eyebrow">Instagram</span>{instagram ? <a href={instagram} target="_blank" rel="noreferrer">Instagram<span aria-hidden="true">↗</span></a> : <span className="contact-placeholder">Add your Instagram profile</span>}</div>
  </div>;
}
