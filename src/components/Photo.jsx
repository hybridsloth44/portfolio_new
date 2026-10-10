import { useState } from 'react';

export default function Photo({ photo, priority = false, className = '', fullscreen = false, sizes = '(max-width: 767px) 100vw, 50vw', placeholderTitle }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const placeholder = !photo?.src || photo.placeholder;
  return (
    <div className={`photo-surface ${fullscreen ? 'photo-fullscreen' : ''} ${className}`} style={!fullscreen ? { aspectRatio: `${photo?.width || 3} / ${photo?.height || 2}` } : undefined}>
      {placeholder || failed ? (
        <div className={`photo-placeholder ${placeholderTitle && !failed ? 'titled-placeholder' : ''}`} role="img" aria-label={failed ? 'Photograph unavailable' : photo?.alt || 'Photograph placeholder'}>
          <span className="placeholder-label">{failed ? 'Photograph unavailable' : 'Photograph placeholder'}</span>
          {placeholderTitle && !failed && <span className="placeholder-title" aria-hidden="true">{placeholderTitle}</span>}
          <span className="placeholder-detail">{failed ? 'Please try again later' : 'Original image to be added'}</span>
        </div>
      ) : <>
        {!loaded && <span className="image-loading" role="status">Loading photograph</span>}
        <img src={photo.src} srcSet={photo.srcSet} sizes={fullscreen ? '100vw' : sizes} width={photo.width} height={photo.height} alt={photo.alt || photo.caption || 'Photograph by Shreesh'} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={loaded ? 'is-loaded' : ''} />
      </>}
    </div>
  );
}
