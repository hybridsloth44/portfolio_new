import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePageMeta } from '../hooks/usePageMeta';
import { collections, coverPhoto } from '../services/portfolio';
import { site } from '../data/site';
import Photo from '../components/Photo';
import SectionBanner from '../components/SectionBanner';
import SocialLinks from '../components/SocialLinks';
import CatalogState from '../components/CatalogState';

export default function Home() {
  usePageMeta();
  const { catalog, loading, error, retry } = usePortfolio();
  if (!catalog) return <div className="page-width"><CatalogState {...{ loading, error, retry }} /></div>;
  const groups = site.homeSections;
  return <>
    <section className="home-introduction" aria-labelledby="home-title"><div className="introduction-grid">
      <div className="introduction-copy"><h1 id="home-title">{site.homeIntroduction}</h1><SocialLinks /><Link className="intro-work-link" to="/work">View Work</Link></div>
      <div className="introduction-portrait"><Photo photo={site.portrait || { width: 323, height: 544, alt: 'Portrait placeholder for Shreesh' }} placeholderTitle="Shreesh" priority sizes="(max-width: 767px) 200px, (max-width: 1150px) 34vw, (max-width: 1800px) 29vw, 500px" /></div>
    </div></section>
    {groups.map((group, groupIndex) => {
      const featured = group.slugs.map(slug => {
        const collection = collections.find(item => item.slug === slug);
        return { collection, photo: coverPhoto(collection, catalog, collection.homeCoverPhotoId) };
      });
      const columns = featured.map(({ photo }) => `${photo ? photo.width / photo.height : 0.8}fr`).join(' ');
      return <section key={group.slugs[0]} className={`home-collection-section section-tone-${groupIndex}`} aria-labelledby={`group-${groupIndex}`}><SectionBanner>{group.title}</SectionBanner><h2 className="sr-only" id={`group-${groupIndex}`}>{group.title}</h2><div className="home-collection-grid page-width" style={{ '--home-columns': columns }}>{featured.map(({ collection, photo }) => {
        const { slug } = collection;
        return <article className="home-collection" key={slug}><h3>{(collection.galleryTitle || collection.title).split(/(?=\d{4}$)/).map((part, index) => <Fragment key={index}>{index > 0 && <wbr />}{part}</Fragment>)}</h3><Link className="home-collection-image" to={`/work/${slug}`} aria-label={`View ${collection.title}`}><Photo key={photo?.id || slug} photo={photo} placeholderTitle={collection.title} sizes="(max-width: 767px) 80vw, 300px" /></Link><div className="home-collection-copy"><p>{site.collectionDescriptions[slug]}</p></div><Link className="solid-link" to={`/work/${slug}`}>See more<span className="sr-only"> — {collection.title}</span></Link></article>;
      })}</div></section>;
    })}
    <section className="home-contact page-width"><h2>Let’s make photographs.</h2><p>For a collaboration, a shoot, or a simple hello.</p><Link className="solid-link" to="/contact">Get in touch</Link></section>
  </>;
}
