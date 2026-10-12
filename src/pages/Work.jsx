import { usePortfolio } from '../hooks/usePortfolio';
import { usePageMeta } from '../hooks/usePageMeta';
import { collections } from '../services/portfolio';
import { site } from '../data/site';
import CollectionCard from '../components/CollectionCard';
import CatalogState from '../components/CatalogState';

const rankedCollections = site.collectionNavigationOrder.map(slug => collections.find(collection => collection.slug === slug)).filter(Boolean);

export default function Work() {
  usePageMeta('Work');
  const { catalog, loading, error, retry } = usePortfolio();
  return <div className="page-width"><div className="page-heading work-heading"><div><p className="eyebrow">The portfolio</p><h1>Work<span className="heading-period" aria-hidden="true">.</span></h1></div><div className="page-heading-note"><p>A collection of moments,<br />places, and people.</p><span className="eyebrow">{String(collections.length).padStart(2, '0')} collections</span></div></div>{!catalog ? <CatalogState {...{ loading, error, retry }} /> : <div className="collection-grid work-grid">{rankedCollections.map((collection, index) => <CollectionCard key={collection.slug} {...{ collection, catalog, index }} />)}</div>}</div>;
}
