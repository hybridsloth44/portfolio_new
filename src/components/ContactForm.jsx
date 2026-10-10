import { useRef, useState } from 'react';
import { site } from '../data/site';
import { contactConfigured, sendContactMessage } from '../services/contact';

export default function ContactForm() {
  const busy = useRef(false);
  const [status, setStatus] = useState('idle');
  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = Object.fromEntries(['firstName', 'lastName', 'email', 'phone', 'message'].map(key => [key, String(data.get(key) || '').trim()]));
    const missing = ['firstName', 'lastName', 'email', 'message'].find(key => !fields[key]);
    if (missing) {
      form.elements.namedItem(missing).focus();
      setStatus('invalid');
      return;
    }
    if (!contactConfigured) { setStatus('unavailable'); return; }
    busy.current = true;
    setStatus('sending');
    try {
      await sendContactMessage(fields);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      busy.current = false;
    }
  }
  const failed = status === 'error' || status === 'unavailable';
  return <form className="contact-form" onSubmit={handleSubmit} aria-label="Send me a message" aria-busy={status === 'sending'}>
    <fieldset className="contact-name"><legend>Name</legend><div className="contact-name-fields">
      <label htmlFor="contact-first-name">First Name <span>(required)</span><input id="contact-first-name" name="firstName" autoComplete="given-name" required maxLength={100} /></label>
      <label htmlFor="contact-last-name">Last Name <span>(required)</span><input id="contact-last-name" name="lastName" autoComplete="family-name" required maxLength={100} /></label>
    </div></fieldset>
    <label htmlFor="contact-email">Email <span>(required)</span><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label htmlFor="contact-phone">Phone<input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
    <label htmlFor="contact-message">Message <span>(required)</span><textarea id="contact-message" name="message" rows={5} required maxLength={5000} /></label>
    <button className="solid-link contact-send" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send'}</button>
    <div className="contact-form-feedback" aria-live="polite" aria-atomic="true">
      {status === 'sent' && <p>Thank you! Your message has been sent.</p>}
      {status === 'invalid' && <p role="alert">Please complete all required fields.</p>}
      {failed && <p role="alert">{status === 'unavailable' ? 'Message delivery is currently unavailable.' : 'Your message could not be sent. Please try again.'} You can also <a href={`mailto:${site.email}`}>email me directly</a>.</p>}
    </div>
  </form>;
}
