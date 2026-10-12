import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Arrow from '../components/Arrow';
import Photo from '../components/Photo';
import CatalogState from '../components/CatalogState';
import { usePortfolio } from '../hooks/usePortfolio';
import { site } from '../data/site';

const description = "Every shoot is different. Whether you have a specific idea or just want to capture a moment, I'd love to hear what you have in mind.";

export default function WorkWithMe() {
  usePageMeta('Work With Me', description);
  const { catalog, loading, error, retry } = usePortfolio();
  const photo = catalog?.photos.find(photo => photo.id === site.workWithMePhotoId);
  return <div className="page-width inquiry-page work-with-me-page">
    <div className="inquiry-content">
      <p className="eyebrow">Work With Me</p>
      <h1>Let's create something.</h1>
      <p className="inquiry-description">{description}</p>
      <div className="quote-request">
        <p className="inquiry-details">Every shoot is unique. Tell me what you have in mind, and I'll put together a quote based on your requirements.</p>
        <Link className="solid-link inquiry-cta" to="/contact">REQUEST A QUOTE <Arrow direction="up-right" /></Link>
      </div>
    </div>
    <div className="work-with-me-photo">
      {photo ? <Photo photo={photo} priority sizes="(max-width: 767px) min(90vw, 360px), (max-width: 900px) 420px, (max-width: 1500px) 44vw, 680px" /> : <CatalogState {...{ loading, error, retry }} />}
    </div>
  </div>;
}
