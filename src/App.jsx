import { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './hooks/usePortfolio';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import WorkWithMe from './pages/WorkWithMe';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="page-width catalog-state" role="alert"><h1>Something went out of frame.</h1><p>Please reload to try again.</p><button className="text-link" onClick={() => window.location.reload()}>Reload the portfolio</button></div>;
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><PortfolioProvider><Routes><Route element={<Layout />}><Route index element={<Home />} /><Route path="work" element={<Work />} /><Route path="work-with-me" element={<WorkWithMe />} /><Route path="work/:slug" element={<Gallery />} /><Route path="about" element={<About />} /><Route path="contact" element={<Contact />} /><Route path="*" element={<NotFound />} /></Route></Routes></PortfolioProvider></ErrorBoundary>;
}
