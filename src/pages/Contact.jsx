import { usePageMeta } from '../hooks/usePageMeta';
import ContactLinks from '../components/ContactLinks';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  usePageMeta('Contact');
  return <div className="page-width contact-page"><h1>Send me a message</h1><ContactForm /><ContactLinks /></div>;
}
