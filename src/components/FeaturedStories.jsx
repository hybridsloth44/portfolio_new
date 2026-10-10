import { useMemo } from 'react';
import { site } from '../data/site';
import TiltedGridHero from './TiltedGridHero';

export default function FeaturedStories({ catalog }) {
  const images = useMemo(() => site.homePhotoIds
    .map((id) => catalog.photos.find((photo) => photo.id === id))
    .filter((photo) => photo?.src && photo.height > photo.width)
    .map((photo) => ({ ...photo, src: photo.srcSet?.split(', ').find((variant) => variant.endsWith(' 960w'))?.split(' ')[0] || photo.src })), [catalog]);
  const aspect = Math.max(.8, ...images.map((image) => image.width / image.height));

  return <div className="featured-stories">
    <div className="featured-story-heading page-width"><p className="eyebrow">Selected photographs</p><h3>From the stage to the streets.</h3><p>Concerts, sport, travel, and the moments in between.</p></div>
    <TiltedGridHero images={images} speed={4} tileHeight={44} aspectRatio={aspect} curve={80} axis={50} fade={10} />
  </div>;
}
