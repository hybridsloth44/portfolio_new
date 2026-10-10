import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collections, coverPhoto } from '../services/portfolio';
import TiltedGridHero from './TiltedGridHero';
import Arrow from './Arrow';

export default function FeaturedStories({ catalog, slugs }) {
  const [paused, setPaused] = useState(false);
  const featured = useMemo(() => slugs.map((slug) => {
    const collection = collections.find((item) => item.slug === slug);
    return { collection, photo: coverPhoto(collection, catalog, collection.homeCoverPhotoId) };
  }), [catalog, slugs]);
  const images = useMemo(() => featured.filter(({ photo }) => photo?.src).map(({ photo }) => ({ ...photo, src: photo.srcSet?.split(', ').find((variant) => variant.endsWith(' 960w'))?.split(' ')[0] || photo.src })), [featured]);
  const aspect = Math.max(.8, ...images.map((image) => image.width / image.height));

  return <div className="featured-stories">
    <div className="featured-story-heading page-width"><p className="eyebrow">Selected stories</p><h3>From the stage to the streets.</h3><p>Music I love. The city where it began. Moments from everyday life.</p></div>
    <TiltedGridHero images={images} speed={4} tileHeight={44} aspectRatio={aspect} curve={80} axis={50} fade={10} paused={paused}>
      <button className="story-motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play photo strip' : 'Pause photo strip'} aria-pressed={paused}>
        {paused ? <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z" fill="currentColor" /></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12" stroke="currentColor" strokeWidth="2" /></svg>}
      </button>
    </TiltedGridHero>
    <div className="featured-story-links page-width">{featured.map(({ collection }, index) => <Link key={collection.slug} to={`/work/${collection.slug}`} className="featured-story-link"><span className="collection-meta">{String(index + 1).padStart(2, '0')} / {collection.category}</span><span className="featured-story-title">{collection.galleryTitle || collection.title}<Arrow /></span></Link>)}</div>
  </div>;
}
