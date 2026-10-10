import { useState } from 'react';

export default function SectionBanner({ children }) {
  const [paused, setPaused] = useState(false);
  return <div className="section-banner">
    <div className="banner-window"><div className="banner-track" aria-hidden="true" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
      {[0, 1].map((copy) => <div className="banner-group" key={copy}>{[0, 1, 2].map((index) => <span key={index}>{children}</span>)}</div>)}
    </div></div>
    <button className="banner-toggle" onClick={() => setPaused(!paused)} aria-label={`${paused ? 'Resume' : 'Pause'} ${children} heading animation`} aria-pressed={paused}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">{paused ? <path d="M3 1v10l8-5z" /> : <path d="M2 1h3v10H2zm5 0h3v10H7z" />}</svg>
    </button>
  </div>;
}
