import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Arrow from '../components/Arrow';
import Photo from '../components/Photo';
import CatalogState from '../components/CatalogState';
import { usePortfolio } from '../hooks/usePortfolio';
import { site } from '../data/site';

const description = "Whether you have a clear vision or are still exploring ideas, let's create photographs that feel true to you.";

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
        <p className="inquiry-details">Share your preferred date, location, and a few details about the shoot. I'll get back to you with availability and a tailored quote.</p>
        <Link className="solid-link inquiry-cta" to="/contact">REQUEST A QUOTE <Arrow direction="up-right" /></Link>
      </div>
    </div>
    <div className="work-with-me-photo">
      {photo ? <Photo photo={photo} priority sizes="(max-width: 767px) min(90vw, 360px), (max-width: 900px) 420px, (max-width: 1260px) 40vw, 480px" /> : <CatalogState {...{ loading, error, retry }} />}
    </div>
  </div>;
}
