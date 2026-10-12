import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { usePageMeta } from '../hooks/usePageMeta';
import Photo from '../components/Photo';
import Arrow from '../components/Arrow';

export default function About() {
  usePageMeta('About');
  return <div className="page-width about-page"><h1 className="sr-only">About</h1><div className="about-grid grid"><div className="portrait"><Photo photo={site.portrait || { width: 4, height: 5, alt: 'Portrait placeholder for Shreesh' }} sizes="(max-width: 767px) 88vw, (max-width: 1150px) 40vw, 480px" /></div><div className="about-copy"><p className="eyebrow">Photographer</p><h2>Shreesh</h2><p>{site.introduction}</p>{site.biography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<Link className="text-link" to="/work">Explore my work <Arrow /></Link></div></div></div>;
}
