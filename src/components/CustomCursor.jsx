import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span');
    dot.className = 'custom-cursor-dot';
    cursor.append(dot);
    document.body.append(cursor);
    let frame = 0;
    let visible = false;
    let x = 0, y = 0, dotX = 0, dotY = 0, previousTime = 0;

    // Native dialogs occupy the top layer, so keep the cursor inside the active one.
    const positionLayer = () => {
      const layer = document.querySelector('dialog[open]') || document.body;
      if (cursor.parentElement !== layer) layer.append(cursor);
    };
    const hide = () => {
      visible = false;
      cursor.removeAttribute('data-visible');
      cursor.removeAttribute('data-pressed');
      document.documentElement.classList.remove('custom-cursor-enabled');
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const draw = (time) => {
      const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-Math.min(time - previousTime || 16, 64) / 65);
      previousTime = time;
      dotX += (x - dotX) * amount;
      dotY += (y - dotY) * amount;
      const dx = dotX - x, dy = dotY - y;
      const distance = Math.hypot(dx, dy);
      const limit = distance > 7 ? 7 / distance : 1;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dot.style.transform = `translate3d(${dx * limit - 4}px, ${dy * limit - 4}px, 0)`;
      frame = visible && distance > 0.05 ? requestAnimationFrame(draw) : 0;
    };
    const move = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!desktop.matches || event.pointerType !== 'mouse' || target?.closest('input, textarea, [contenteditable="true"], button:disabled, iframe')) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      if (!visible) { dotX = x; dotY = y; previousTime = 0; }
      visible = true;
      positionLayer();
      cursor.dataset.visible = '';
      cursor.toggleAttribute('data-interactive', Boolean(target?.closest('a, button, summary, [role="button"]')));
      document.documentElement.classList.add('custom-cursor-enabled');
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const press = (event) => { if (event.pointerType !== 'mouse') hide(); else if (visible) cursor.dataset.pressed = ''; };
    const release = () => cursor.removeAttribute('data-pressed');
    const keyboard = (event) => { if (event.key === 'Tab') hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    const leave = (event) => { if (!event.relatedTarget) hide(); };
    const observer = new MutationObserver(positionLayer);
    observer.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('blur', hide);
    document.addEventListener('pointerout', leave);
    document.addEventListener('keydown', keyboard);
    document.addEventListener('visibilitychange', visibility);
    desktop.addEventListener('change', hide);
    return () => {
      hide();
      observer.disconnect();
      cursor.remove();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('visibilitychange', visibility);
      desktop.removeEventListener('change', hide);
    };
  }, []);
  return null;
}
