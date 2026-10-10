import { useEffect, useRef, useState } from 'react';

// Choose row breaks for the available width, keeping full rows aligned at both edges.
function arrangeRows(items, getAspectRatio, width, gap) {
  const target = width < 600 ? 180 : width < 900 ? 220 : 250;
  const maximum = width < 600 ? 240 : 300;
  const costs = Array(items.length + 1).fill(Infinity);
  const choices = [];
  costs[items.length] = 0;
  for (let start = items.length - 1; start >= 0; start--) {
    let total = 0;
    for (let count = 1; count <= Math.min(12, items.length - start); count++) {
      total += getAspectRatio(items[start + count - 1]);
      const naturalHeight = (width - gap * (count - 1)) / total;
      const last = start + count === items.length;
      if (naturalHeight <= 0 || (!last && naturalHeight > maximum)) continue;
      const height = Math.min(naturalHeight, maximum);
      const cost = (height - target) ** 2 + (naturalHeight > maximum ? target ** 2 : 0) + costs[start + count];
      if (cost < costs[start]) {
        costs[start] = cost;
        choices[start] = { count, height };
      }
    }
  }
  const rows = [];
  for (let start = 0; start < items.length;) {
    const { count, height } = choices[start];
    rows.push({ items: items.slice(start, start + count), start, height });
    start += count;
  }
  return rows;
}

function collectionRows(items, getAspectRatio, width, gap) {
  const columns = width < 600 ? 2 : width < 900 ? 3 : 4;
  return Array.from({ length: Math.ceil(items.length / columns) }, (_, index) => {
    const start = index * columns;
    const row = items.slice(start, start + columns);
    const total = row.reduce((sum, item) => sum + getAspectRatio(item), 0);
    const height = (width - gap * (row.length - 1)) / total;
    return { items: row, start, height: row.length < columns ? Math.min(height, 360) : height };
  });
}

export default function PhotoRows({ items, getAspectRatio, children, className = '', variant = 'gallery' }) {
  const container = useRef(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const gap = variant === 'collections' ? (width < 600 ? 10 : 12) : (width < 600 ? 6 : 8);
  const rows = variant === 'collections' ? collectionRows(items, getAspectRatio, width, gap) : arrangeRows(items, getAspectRatio, width, gap);
  return <div ref={container} className={className} style={{ '--photo-gap': `${gap}px` }}>{rows.map((row) => {
    const ratios = row.items.map(getAspectRatio);
    return <div className="photo-row" key={row.items[0].id || row.items[0].slug} style={{ '--photo-columns': ratios.map((ratio) => `${ratio}fr`).join(' '), '--row-aspect': ratios.reduce((sum, ratio) => sum + ratio, 0), '--row-gaps': row.items.length - 1, '--row-height': `${row.height}px` }}>
      {row.items.map((item, columnIndex) => children(item, row.start + columnIndex))}
    </div>;
  })}</div>;
}
