import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { collections } from '../services/portfolio';
import SocialLinks from '../components/SocialLinks';
import CustomCursor from '../components/CustomCursor';

const navigationRank = new Map(site.collectionNavigationOrder.map((slug, index) => [slug, index]));
const navigationCollections = [...collections].sort((a, b) =>
  (navigationRank.get(a.slug) ?? Infinity) - (navigationRank.get(b.slug) ?? Infinity));

export default function Layout() {
  const location = useLocation();
  const mainRef = useRef(null);
  const initial = useRef(true);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(Boolean(site.announcement));
  useEffect(() => {
    const closeOutside = (event) => {
      const dropdown = dropdownRef.current;
      if (dropdown && !dropdown.contains(event.target)) dropdown.open = false;
      if (!navRef.current?.contains(event.target) && !menuButtonRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setMenuClosing(false);
        if (closeTimerRef.current) {
          window.clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMenuOpen(false);
    setMenuClosing(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    navRef.current?.querySelectorAll('details[open]').forEach((details) => { details.open = false; });
    if (!initial.current) mainRef.current?.focus({ preventScroll: true });
    initial.current = false;
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    let previousWindowY = window.scrollY;
    let previousNavY = navRef.current?.scrollTop ?? 0;
    const closeOnDownwardScroll = (event) => {
      const isNavScroll = event.currentTarget === navRef.current;
      const currentY = isNavScroll ? (navRef.current?.scrollTop ?? 0) : window.scrollY;
      const previousY = isNavScroll ? previousNavY : previousWindowY;
      if (currentY > previousY + 1 && !closeTimerRef.current) {
        setMenuClosing(true);
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null;
          navRef.current?.querySelectorAll('details[open]').forEach((details) => { details.open = false; });
          setMenuOpen(false);
          setMenuClosing(false);
        }, 320);
      }
      if (isNavScroll) previousNavY = currentY;
      else previousWindowY = currentY;
    };
    window.addEventListener('scroll', closeOnDownwardScroll, { passive: true });
    navRef.current?.addEventListener('scroll', closeOnDownwardScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', closeOnDownwardScroll);
      navRef.current?.removeEventListener('scroll', closeOnDownwardScroll);
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [menuOpen]);
  return <div className="site-shell">
    <CustomCursor />
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="site-content">
    {announcementVisible && <div className="announcement"><span>{site.announcement}</span><button onClick={() => setAnnouncementVisible(false)} aria-label="Dismiss announcement">×</button></div>}
    <header className="site-header page-width" onKeyDown={(event) => {
      if (event.key !== 'Escape') return;
      const dropdown = navRef.current?.querySelector('details[open]');
      if (dropdown) { dropdown.open = false; dropdown.querySelector('summary').focus(); }
      else if (menuOpen) { setMenuOpen(false); menuButtonRef.current?.focus(); }
    }}>
      <Link className="wordmark" to="/" aria-label="Shreesh home">Shreesh.</Link>
      <button ref={menuButtonRef} className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => {
        setMenuOpen(!menuOpen);
        setMenuClosing(false);
        if (closeTimerRef.current) {
          window.clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
      }}><span /><span /></button>
      <nav ref={navRef} id="primary-navigation" aria-label="Main navigation" className={menuOpen ? `is-open${menuClosing ? ' is-closing' : ''}` : ''}>
        <details ref={dropdownRef} className="collection-dropdown"
          onPointerEnter={(event) => { if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) event.currentTarget.open = true; }}
          onPointerLeave={(event) => { if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) event.currentTarget.open = false; }}
          onToggle={(event) => setWorkOpen(event.currentTarget.open)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) event.currentTarget.open = false; }}>
          <summary role="button" className={location.pathname === '/work' ? 'is-current' : undefined} aria-current={location.pathname === '/work' ? 'page' : undefined} aria-expanded={workOpen} aria-controls="work-collections"><span>Photography</span><span className="dropdown-indicator" aria-hidden="true">▾</span></summary>
          <div id="work-collections">{navigationCollections.map((collection) => <NavLink key={collection.slug} to={`/work/${collection.slug}`} end onClick={() => { dropdownRef.current.open = false; setMenuOpen(false); }}>{collection.galleryTitle || collection.title}</NavLink>)}</div>
        </details>
        <NavLink to="/work-with-me">Work With Me</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
    <main id="main" ref={mainRef} tabIndex={-1}><Outlet /></main>
    </div>
    <footer className="site-footer"><div className="footer-content page-width"><div><h2>Get in touch.</h2><p>For a collaboration, a shoot, or a simple hello.</p><Link className="solid-link" to="/contact">Contact Shreesh</Link></div><div className="footer-identity"><Link className="wordmark" to="/">Shreesh.</Link><SocialLinks /><p>© {new Date().getFullYear()} Shreesh</p></div></div></footer>
  </div>;
}
