import collections from '../data/collections.json';

export { collections };

export async function loadPortfolio(signal) {
  const response = await fetch('/portfolio.json', { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error('The photographs could not be loaded.');
  const data = await response.json();
  if (data.schemaVersion !== 1 || !Array.isArray(data.photos) || !['preview', 'live'].includes(data.mode)) {
    throw new Error('The photography catalog is unavailable.');
  }
  const validSlugs = new Set(collections.map((collection) => collection.slug));
  return { ...data, photos: data.photos.filter((photo) => photo.published === true && validSlugs.has(photo.collection) && photo.src && photo.width > 0 && photo.height > 0) };
}

export function galleryPhotos(collection, catalog) {
  const photos = catalog.photos.filter((photo) => photo.collection === collection.slug).sort((a, b) => a.displayOrder - b.displayOrder);
  if (photos.length || catalog.mode !== 'preview') return photos;
  // Layout samples only. These dimensions do not describe any original photograph.
  const ratios = [[3, 2], [2, 3], [3, 2], [4, 3], [2, 3], [3, 2]];
  return Array.from({ length: collection.previewCount }, (_, index) => ({
    id: `placeholder-${collection.slug}-${index}`,
    collection: collection.slug,
    placeholder: true,
    width: ratios[index % ratios.length][0],
    height: ratios[index % ratios.length][1],
    alt: `Photograph placeholder ${index + 1} for ${collection.galleryTitle || collection.title}`,
  }));
}

export function coverPhoto(collection, catalog, coverPhotoId = collection.coverPhotoId) {
  const photos = galleryPhotos(collection, catalog);
  return photos.find((photo) => photo.id === coverPhotoId) || photos[0];
}

export function portraitCoverPhoto(collection, catalog) {
  const portraits = galleryPhotos(collection, catalog).filter((photo) => photo.height > photo.width);
  return portraits.find((photo) => photo.id === collection.coverPhotoId) || portraits[0];
}
