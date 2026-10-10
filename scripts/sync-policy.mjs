export function isExcludedFolder(name, config) {
  return config.excludedFolderNames.some((excluded) => excluded.toLowerCase() === name.toLowerCase());
}

export function selectPublished(files, collections, curated, config) {
  const allowed = new Map(collections.map((collection) => [collection.slug, collection]));
  const approvals = new Map(curated.images.map((image) => [image.driveFileId, image]));
  if (approvals.size !== curated.images.length) throw new Error('Duplicate file IDs in the curated manifest.');
  const selected = [];
  for (const file of files) {
    const collection = allowed.get(file.collection);
    if (!collection || file.path.some((part) => isExcludedFolder(part, config))) continue;
    if (collection.publishing === 'manual') {
      const approval = approvals.get(file.id);
      // Approval binds to the visually reviewed revision: changes require a fresh approval.
      if (!approval?.published || !approval.approvedChecksum || approval.approvedChecksum !== file.md5Checksum) continue;
      if (approval.collection !== collection.folderName || approval.filename !== file.name) throw new Error('A curated approval does not match its Drive photograph.');
      selected.push({ ...file, displayOrder: approval.displayOrder, caption: approval.caption || '' });
    } else if (config.regularCollections.publishNew && !config.regularCollections.excludedFileIds.includes(file.id)) {
      selected.push({ ...file, caption: '' });
    }
  }
  // Regular collections use a stable chronological sequence. Manual order is preserved.
  selected.sort((a, b) => a.collection.localeCompare(b.collection) || (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity) || (a.createdTime || '').localeCompare(b.createdTime || '') || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const counts = new Map();
  return selected.map((file) => {
    const order = (counts.get(file.collection) || 0) + 1;
    counts.set(file.collection, order);
    return { ...file, displayOrder: file.displayOrder ?? order };
  });
}

export function deliveryUrl(upload, width) {
  const url = new URL(upload.secure_url);
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.includes('/image/upload/')) throw new Error('Unexpected image delivery URL.');
  return upload.secure_url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
