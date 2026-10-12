import { usePageMeta } from '../hooks/usePageMeta';
import ContactLinks from '../components/ContactLinks';

const description = 'Have a project, collaboration, or shoot in mind? Feel free to reach out.';

export default function Contact() {
  usePageMeta('Contact', description);
  return <div className="page-width inquiry-page contact-page"><div className="inquiry-content"><h1>Get in Touch</h1><p className="inquiry-description">{description}</p><ContactLinks variant="inquiry" /></div></div>;
}
