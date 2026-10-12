import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePageMeta } from '../hooks/usePageMeta';
import { site } from '../data/site';
import Photo from '../components/Photo';
import SectionBanner from '../components/SectionBanner';
import SocialLinks from '../components/SocialLinks';
import CatalogState from '../components/CatalogState';
import FeaturedStories from '../components/FeaturedStories';

export default function Home() {
  usePageMeta();
  const { catalog, loading, error, retry } = usePortfolio();
  if (!catalog) return <div className="page-width"><CatalogState {...{ loading, error, retry }} /></div>;
  const groups = site.homeSections;
  return <>
    <section className="home-introduction" aria-labelledby="home-title"><div className="introduction-grid">
      <div className="introduction-copy"><h1 id="home-title">{site.homeIntroduction}</h1><SocialLinks /></div>
      <div className="introduction-portrait"><Photo photo={site.portrait || { width: 323, height: 544, alt: 'Portrait placeholder for Shreesh' }} placeholderTitle="Shreesh" priority sizes="(max-width: 767px) 200px, (max-width: 1150px) 34vw, (max-width: 1800px) 29vw, 500px" /></div>
    </div></section>
    {groups.map((group, groupIndex) => <section key={group.title} className={`home-collection-section section-tone-${groupIndex}`} aria-labelledby={`group-${groupIndex}`}><SectionBanner>{group.title}</SectionBanner><h2 className="sr-only" id={`group-${groupIndex}`}>{group.title}</h2><FeaturedStories catalog={catalog} /></section>)}
    <section className="home-contact page-width"><h2>Let’s make photographs.</h2><p>For a collaboration, a shoot, or a simple hello.</p><Link className="solid-link" to="/contact">Get in touch</Link></section>
  </>;
}
