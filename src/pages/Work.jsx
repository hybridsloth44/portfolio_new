import { usePortfolio } from '../hooks/usePortfolio';
import { usePageMeta } from '../hooks/usePageMeta';
import { collections, portraitCoverPhoto } from '../services/portfolio';
import { site } from '../data/site';
import CollectionCard from '../components/CollectionCard';
import PhotoRows from '../components/PhotoRows';
import CatalogState from '../components/CatalogState';

const rankedCollections = site.collectionNavigationOrder.map(slug => collections.find(collection => collection.slug === slug)).filter(Boolean);

export default function Work() {
  usePageMeta('Work');
  const { catalog, loading, error, retry } = usePortfolio();
  const coverAspect = (collection) => { const photo = portraitCoverPhoto(collection, catalog); return photo ? photo.width / photo.height : 3 / 4; };
  return <div className="page-width"><div className="page-heading work-heading"><div><p className="eyebrow">The portfolio</p><h1>Work<span className="heading-period" aria-hidden="true">.</span></h1></div><div className="page-heading-note"><p>A collection of moments,<br />places, and people.</p><span className="eyebrow">{String(collections.length).padStart(2, '0')} collections</span></div></div>{!catalog ? <CatalogState {...{ loading, error, retry }} /> : <PhotoRows className="collection-grid work-grid" variant="collections" items={rankedCollections} getAspectRatio={coverAspect}>{(collection, index) => <CollectionCard key={collection.slug} {...{ collection, catalog, index }} />}</PhotoRows>}</div>;
}
