import { useEffect } from 'react';

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Shreesh` : 'Shreesh — Photography';
    document.querySelector('meta[name="description"]').content = description || 'Photography by Shreesh. Concerts, sports, travel, wildlife, street photography, and automobiles.';
  }, [title, description]);
}
