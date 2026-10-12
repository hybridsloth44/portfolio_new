import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const description = "Every shoot is different. Whether you have a specific idea or just want to capture a moment, I'd love to hear what you have in mind.";

export default function WorkWithMe() {
  usePageMeta('Work With Me', description);
  return <div className="page-width inquiry-page work-with-me-page">
    <div className="inquiry-content">
      <p className="eyebrow">Work With Me</p>
      <h1>Let's create something.</h1>
      <p className="inquiry-description">{description}</p>
      <div className="quote-request">
        <p className="inquiry-details">Every shoot is unique. Tell me what you have in mind, and I'll put together a quote based on your requirements.</p>
        <Link className="solid-link inquiry-cta" to="/contact">REQUEST A QUOTE <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </div>;
}
