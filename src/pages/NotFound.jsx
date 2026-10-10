import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Arrow from '../components/Arrow';

export default function NotFound() {
  usePageMeta('Page not found');
  return <div className="page-width not-found"><p className="eyebrow">404</p><h1>A little out of frame.</h1><p>This page could not be found.</p><Link className="text-link" to="/work">Back to the photographs <Arrow /></Link></div>;
}
