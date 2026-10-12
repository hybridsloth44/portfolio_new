import { Link } from 'react-router-dom';
import { portraitCoverPhoto } from '../services/portfolio';
import Photo from './Photo';
import Arrow from './Arrow';

export default function CollectionCard({ collection, catalog, index }) {
  const photo = portraitCoverPhoto(collection, catalog);
  return <Link to={`/work/${collection.slug}`} className="collection-card group" aria-label={`View ${collection.title}`}>
    <div className="collection-image"><Photo key={photo?.id || collection.slug} photo={photo || { width: 3, height: 4 }} placeholderTitle={collection.galleryTitle || collection.title} sizes="(max-width: 767px) 44vw, (max-width: 1150px) 30vw, 280px" /></div>
    <div className="collection-caption flex items-start justify-between gap-4">
      <div><p className="collection-meta">{index !== undefined && <span>{String(index + 1).padStart(2, '0')} <span className="caption-separator">/</span></span>}{collection.category}</p><h3>{collection.galleryTitle || collection.title}</h3></div>
      <span className="collection-arrow"><Arrow /></span>
    </div>
    {index !== undefined && <span className="sr-only">Collection {index + 1}</span>}
  </Link>;
}
