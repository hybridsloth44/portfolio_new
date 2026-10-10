export default function SectionBanner({ children }) {
  return <div className="section-banner">
    <div className="banner-window"><div className="banner-track" aria-hidden="true">
      {[0, 1].map((copy) => <div className="banner-group" key={copy}>{[0, 1, 2].map((index) => <span key={index}>{children}</span>)}</div>)}
    </div></div>
  </div>;
}
