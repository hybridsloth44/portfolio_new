export default function CatalogState({ loading, error, retry }) {
  if (loading) return <div className="catalog-state" role="status"><span className="eyebrow">One moment</span><p>Loading photographs…</p></div>;
  if (error) return <div className="catalog-state" role="alert"><p>{error}</p><button className="text-link" onClick={retry}>Try again</button></div>;
  return null;
}
