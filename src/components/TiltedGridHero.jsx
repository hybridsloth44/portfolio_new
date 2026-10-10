import { useEffect, useId, useRef, useState } from 'react';

// Adapted from the supplied component: each photograph bends as 16 joined facets.
const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 55;
const arc = (bend) => (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));

function measure(width, height, tile, aspect, gap, bend) {
  const h = Math.min(tile / 100 * height, MAX_WIDTH / 100 * width / aspect);
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad) => rad * 180 / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + aspect * unit / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil(2 * limit / pitch)));
  const round = (n) => +n.toFixed(4);
  const sweep = round(columns * pitch / 2);
  return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
}

export default function TiltedGridHero({ images, speed = 4, tileHeight = 26, aspectRatio = 16 / 9, gap = 6, axis = 56, curve = 80, fade = 12, paused = false, children, className = '' }) {
  const ref = useRef(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const orbit = `tgh-orbit-${id}`;
  const tile = `tgh-tile-${id}`;
  const bend = Math.min(85, Math.max(5, curve)) * Math.PI / 180;
  const [layout, setLayout] = useState(null);
  const [shown, setShown] = useState({});

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const next = measure(entry.contentRect.width, entry.contentRect.height, tileHeight, aspectRatio, gap, bend);
      setLayout((previous) => previous?.columns === next.columns && previous.sweep === next.sweep && previous.unit === next.unit ? previous : next);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  useEffect(() => {
    for (const { src } of images) { const image = new Image(); image.src = src; }
  }, [images]);

  const { columns, sweep, unit, limit } = layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);
  const u = (n) => `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;
  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (degrees) => `translateZ(${radius}) rotateY(${+degrees.toFixed(4)}deg) translateZ(-${radius})`;
  const hide = +((sweep - limit) / (2 * sweep || 1) * 100).toFixed(4);
  const css = `@keyframes ${orbit}{from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}0%,${hide}%,${100-hide}%,100%{visibility:hidden}${hide+.001}%,${100-hide-.001}%{visibility:visible}}@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused!important}}`;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100-fade}%,transparent)`;

  return <div ref={ref} className={`tilted-grid-hero ${className}`} style={{ containerType: 'size' }}>
    <style>{css}</style>
    <div aria-hidden="true" className="tilted-grid-band" style={{ opacity: layout ? 1 : 0, perspective: `${+(r * CAMERA).toFixed(3)}cqw`, perspectiveOrigin: `50% ${axis}%`, maskImage: mask, WebkitMaskImage: mask }}>
      {Array.from({ length: columns }, (_, t) => {
        const first = columns - 1 - t;
        const image = images[(shown[t] ?? first) % Math.max(images.length, 1)];
        // Each image keeps its own width/height ratio inside the shared moving slot.
        const imageAspect = image?.width && image?.height ? image.width / image.height : aspectRatio;
        const share = imageAspect / SLICES;
        return <div key={t} className={`tilted-grid-tile ${tile}`} style={{ left: `calc(50% - ${u(aspectRatio / 2)})`, top: `calc(${axis}% - ${u(.5)})`, width: u(aspectRatio), height: u(1), transformStyle: 'preserve-3d', animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`, animationPlayState: paused ? 'paused' : 'running' }} onAnimationIteration={(event) => {
          if (event.target !== event.currentTarget) return;
          const next = Math.round(event.elapsedTime / duration) * columns + first;
          setShown((previous) => previous[t] === next ? previous : { ...previous, [t]: next });
        }}>
          {Array.from({ length: SLICES }, (_, k) => <div key={k} className={`tilted-grid-slice ${k === 0 ? 'first-slice' : ''} ${k === SLICES - 1 ? 'last-slice' : ''}`} style={{ left: u((aspectRatio - share) / 2), width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`, height: u(1), transform: turn((imageAspect / 2 - (k + .5) * share) * unit) }}>
            {image && <img src={image.src} alt="" draggable={false} decoding="async" style={{ left: u(-k * share), width: u(imageAspect), height: u(1) }} />}
          </div>)}
        </div>;
      })}
    </div>
    {children}
  </div>;
}
