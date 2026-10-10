import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePageMeta } from '../hooks/usePageMeta';
import { collections, galleryPhotos } from '../services/portfolio';
import { site } from '../data/site';
import Photo from '../components/Photo';
import PhotoRows from '../components/PhotoRows';
import Lightbox from '../components/Lightbox';
import Arrow from '../components/Arrow';
import CatalogState from '../components/CatalogState';
import NotFound from './NotFound';

export default function Gallery() {
  const { slug } = useParams();
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) return <NotFound />;
  return <CollectionGallery key={slug} collection={collection} />;
}

function CollectionGallery({ collection }) {
  const [index, setIndex] = useState(null);
  const { catalog, loading, error, retry } = usePortfolio();
  const title = collection.galleryTitle || collection.title;
  const introduction = site.collectionIntroductions[collection.slug];
  const description = site.collectionDescriptions[collection.slug];
  usePageMeta(title, introduction || `${title}. ${collection.category} photography by Shreesh.`);
  const photos = catalog ? galleryPhotos(collection, catalog) : [];
  const next = collections[(collections.indexOf(collection) + 1) % collections.length];
  return <div className="page-width gallery-page"><Link className="text-link back-link" to="/work"><Arrow direction="left" /> All work</Link><div className="gallery-heading"><p className="eyebrow">{collection.category}</p><h1>{title}</h1>{(introduction || description) && <div className="gallery-description">{introduction && <p>{introduction}</p>}{description && <p>{description}</p>}</div>}{catalog && <p className="gallery-photo-count">{catalog.mode === 'preview' && !photos.some((photo) => !photo.placeholder) ? 'Gallery preview · photograph placeholders' : `${photos.length} photographs`}</p>}</div>
    {!catalog ? <CatalogState {...{ loading, error, retry }} /> : photos.length ? <PhotoRows className="gallery-grid" items={photos} getAspectRatio={(photo) => photo.width / photo.height}>{(photo, photoIndex) => <button key={photo.id} className="gallery-photo" style={{ '--photo-aspect': photo.width / photo.height }} onClick={() => setIndex(photoIndex)} aria-label={`Open photograph ${photoIndex + 1} of ${photos.length}: ${photo.alt || title}`}><Photo photo={photo} priority={photoIndex < 3} sizes="(max-width: 767px) 88vw, 400px" /></button>}</PhotoRows> : <div className="empty-gallery"><p>Photographs coming soon.</p><Link className="text-link" to="/work">Explore other collections <Arrow /></Link></div>}
    <div className="gallery-next"><span className="eyebrow">Next collection</span><Link className="text-link" to={`/work/${next.slug}`}>{next.title}<Arrow /></Link></div>
    {photos.length > 0 && <Lightbox {...{ photos, index, title }} onClose={() => setIndex(null)} onChange={setIndex} />}
  </div>;
}
