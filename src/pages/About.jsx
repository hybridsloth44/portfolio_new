import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { usePageMeta } from '../hooks/usePageMeta';
import Photo from '../components/Photo';
import ContactLinks from '../components/ContactLinks';
import Arrow from '../components/Arrow';

export default function About() {
  usePageMeta('About');
  return <div className="page-width about-page"><h1 className="sr-only">About</h1><div className="about-grid grid grid-cols-1 md:grid-cols-2"><div className="portrait"><Photo photo={site.portrait || { width: 4, height: 5, alt: 'Portrait placeholder for Shreesh' }} /></div><div className="about-copy"><p className="eyebrow">Photographer</p><h2>Shreesh</h2><p>{site.introduction}</p><p>{site.biography}</p><ContactLinks /><Link className="text-link" to="/work">Explore my work <Arrow /></Link></div></div></div>;
}
