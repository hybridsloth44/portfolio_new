import { useEffect, useRef } from 'react';
import Photo from './Photo';
import Arrow from './Arrow';

export default function Lightbox({ photos, index, onClose, onChange, title }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const active = index !== null;
  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [active]);
  const move = (offset) => onChange((index + offset + photos.length) % photos.length);
  return <dialog ref={dialogRef} className="lightbox" aria-label={`${title} photograph viewer`} onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => {
    if (event.key === 'Tab') {
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  }}>
    {active && <div className="lightbox-inner">
      <div className="lightbox-toolbar"><span>{title}</span><button ref={closeRef} className="icon-button close-button" onClick={onClose} aria-label="Close image viewer"><span aria-hidden="true">×</span></button></div>
      <div className="lightbox-stage" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <Photo key={photos[index].id} photo={{ ...photos[index], src: photos[index].fullSrc || photos[index].src, srcSet: undefined }} priority fullscreen />
      </div>
      <div className="lightbox-bottom"><span role="status" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><div className="flex items-center gap-3"><button className="icon-button" onClick={() => move(-1)} disabled={photos.length < 2} aria-label="Previous photograph"><Arrow direction="left" /></button><button className="icon-button" onClick={() => move(1)} disabled={photos.length < 2} aria-label="Next photograph"><Arrow /></button></div><span className="lightbox-hint">← → to browse · Esc to close</span></div>
      {photos[index].caption && <p className="lightbox-caption">{photos[index].caption}</p>}
    </div>}
  </dialog>;
}
