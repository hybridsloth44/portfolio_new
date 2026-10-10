import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { selectPublished, isExcludedFolder, deliveryUrl } from '../scripts/sync-policy.mjs';

const collections = JSON.parse(await readFile(new URL('../src/data/collections.json', import.meta.url)));
const config = JSON.parse(await readFile(new URL('../config/sync.json', import.meta.url)));
const curated = JSON.parse(await readFile(new URL('../config/curated-hpl-auction.json', import.meta.url)));
const image = (overrides = {}) => ({ id: 'test', name: 'photo.jpg', collection: 'wildlife', path: ['Wildlife'], md5Checksum: 'reviewed', createdTime: '2026-01-01', ...overrides });

test('exact nine allowed collections and no excluded gallery', () => {
  assert.equal(collections.length, 9);
  assert.equal(collections.some((collection) => isExcludedFolder(collection.folderName, config)), false);
  assert.equal(isExcludedFolder('hpl_day1', config), true);
});
test('excluded trees and unrecognized collections cannot publish', () => {
  assert.deepEqual(selectPublished([image({ path: ['Wildlife', 'HPL_Day1'] }), image({ collection: 'unknown' })], collections, curated, config), []);
});
test('final auction selection is revision-bound and publishes in curated order', () => {
  assert.ok(curated.images.length >= curated.targetCount.min && curated.images.length <= curated.targetCount.max);
  assert.equal(new Set(curated.images.map((photo) => photo.driveFileId)).size, curated.images.length);
  assert.ok(curated.images.every((photo) => photo.published && /^[a-f0-9]{32}$/.test(photo.approvedChecksum)));
  const files = curated.images.map((photo) => image({ id: photo.driveFileId, name: photo.filename, md5Checksum: photo.approvedChecksum, collection: 'hpl-auction', path: ['HPL_Auction', photo.sourceSubfolder] }));
  const published = selectPublished(files.reverse(), collections, curated, config);
  assert.deepEqual(published.map((photo) => photo.id), curated.images.map((photo) => photo.driveFileId));
  assert.deepEqual(published.map((photo) => photo.displayOrder), Array.from({ length: curated.images.length }, (_, i) => i + 1));
});

test('published auction catalog and portrait cover match the final reviewed selection', async () => {
  const catalog = JSON.parse(await readFile(new URL('../public/portfolio.json', import.meta.url)));
  const auction = catalog.photos.filter((photo) => photo.collection === 'hpl-auction');
  assert.equal(auction.length, curated.images.length);
  for (const approval of curated.images) {
    const photo = auction.find((item) => item.id === approval.driveFileId);
    assert.ok(photo?.published);
    assert.equal(photo.sourceChecksum, approval.approvedChecksum);
    assert.equal(photo.displayOrder, approval.displayOrder);
    assert.equal(photo.caption, approval.caption);
    for (const url of new Set([photo.src, photo.fullSrc, ...photo.srcSet.split(', ').map((entry) => entry.split(' ')[0])])) {
      assert.ok(url.startsWith('/images/hpl-auction/'));
      await access(new URL(`../public${url}`, import.meta.url));
    }
  }
  const cover = auction.find((photo) => photo.id === collections.find((collection) => collection.slug === 'hpl-auction').coverPhotoId);
  assert.ok(cover && cover.height > cover.width);
});
test('auction requires explicit publication and exact approved revision', () => {
  const approval = { driveFileId: 'auction', filename: 'photo.jpg', collection: 'HPL_Auction', displayOrder: 3, published: true, approvedChecksum: 'reviewed' };
  const file = image({ id: 'auction', collection: 'hpl-auction', path: ['HPL_Auction', 'Teams'] });
  assert.equal(selectPublished([file], collections, { images: [approval] }, config)[0].displayOrder, 3);
  assert.equal(selectPublished([{ ...file, md5Checksum: 'changed' }], collections, { images: [approval] }, config).length, 0);
  assert.equal(selectPublished([file], collections, { images: [{ ...approval, published: false }] }, config).length, 0);
});
test('regular publishing rules can pause publishing or exclude individual files', () => {
  assert.equal(selectPublished([image()], collections, curated, config).length, 1);
  assert.equal(selectPublished([image()], collections, curated, { ...config, regularCollections: { publishNew: false, excludedFileIds: [] } }).length, 0);
  assert.equal(selectPublished([image()], collections, curated, { ...config, regularCollections: { publishNew: true, excludedFileIds: ['test'] } }).length, 0);
});
test('removed photos disappear from a rebuilt snapshot', () => {
  const before = selectPublished([image(), image({ id: 'removed' })], collections, curated, config);
  const after = selectPublished([image()], collections, curated, config);
  assert.equal(before.length, 2);
  assert.equal(after.length, 1);
  assert.equal(after.some((file) => file.id === 'removed'), false);
});
test('delivery transforms limit dimensions without cropping and reject preview hosts', () => {
  assert.equal(deliveryUrl({ secure_url: 'https://res.cloudinary.com/example/image/upload/v1/photo.jpg' }, 800), 'https://res.cloudinary.com/example/image/upload/f_auto,q_auto,c_limit,w_800/v1/photo.jpg');
  assert.throws(() => deliveryUrl({ secure_url: 'https://drive.google.com/preview/photo' }, 800));
});
