"""Rebuild the reviewed HPL Auction WebP assets, retaining all other collections.

Requires Pillow and authorized originals in ignored .sync/originals/. The curated
manifest must bind each published selection to the MD5 of its reviewed bytes.
"""
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'config/curated-hpl-auction.json').read_text(encoding='utf-8'))
selected = sorted((p for p in manifest['images'] if p['published']), key=lambda p: p['displayOrder'])
if not manifest['targetCount']['min'] <= len(selected) <= manifest['targetCount']['max']:
    raise ValueError('Final auction selection must meet the configured count range.')
if len({p['driveFileId'] for p in selected}) != len(selected) or [p['displayOrder'] for p in selected] != list(range(1, len(selected)+1)):
    raise ValueError('Auction IDs must be unique and order must be consecutive.')

validated = []
for photo in selected:
    photo_id = photo['driveFileId']
    if not photo_id.replace('_', '').replace('-', '').isalnum() or photo['collection'] != 'HPL_Auction':
        raise ValueError('Invalid auction selection.')
    original = ROOT / '.sync/originals' / (photo_id + Path(photo['filename']).suffix.lower())
    data = original.read_bytes()
    if not photo.get('approvedChecksum') or hashlib.md5(data).hexdigest() != photo['approvedChecksum']:
        raise ValueError('Auction original differs from the reviewed revision: ' + photo['filename'])
    validated.append((photo, original, hashlib.sha256(data).hexdigest()))

output = ROOT / 'public/images/hpl-auction'
output.mkdir(parents=True, exist_ok=True)
photos = []
for photo, original, checksum in validated:
    with Image.open(original) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        if source.info.get('icc_profile'):
            image = ImageCms.profileToProfile(image, ImageCms.ImageCmsProfile(io.BytesIO(source.info['icc_profile'])), ImageCms.createProfile('sRGB'), outputMode='RGB')
    width, height = image.size
    full_width = min(width, round(width * min(1, 3000 / max(width, height))))
    targets = sorted({min(480, full_width), min(960, full_width), min(1600, full_width), full_width})
    variants = []
    for target in targets:
        filename = f"{photo['driveFileId']}-{checksum[:12]}-{target}.webp"
        image.resize((target, round(height*target/width)), Image.Resampling.LANCZOS).save(output / filename, 'WEBP', quality=86 if target == full_width else 82, method=5)
        variants.append((target, f'/images/hpl-auction/{filename}'))
    photos.append({
        'id': photo['driveFileId'], 'driveFileId': photo['driveFileId'], 'filename': photo['filename'],
        'collection': 'hpl-auction',
        'src': next(url for target, url in variants if target >= min(1600, full_width)),
        'fullSrc': variants[-1][1], 'srcSet': ', '.join(f'{url} {target}w' for target, url in variants),
        'width': width, 'height': height, 'alt': photo['caption'], 'caption': photo['caption'],
        'displayOrder': photo['displayOrder'], 'published': True, 'checksum': checksum,
        'sourceChecksum': photo['approvedChecksum'],
    })

catalog_path = ROOT / 'public/portfolio.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
catalog['photos'] = [p for p in catalog['photos'] if p['collection'] != 'hpl-auction'] + photos
catalog['generatedAt'] = datetime.now(timezone.utc).isoformat()
temporary = catalog_path.with_suffix('.json.tmp')
temporary.write_text(json.dumps(catalog, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
temporary.replace(catalog_path)
print(f'Published {len(photos)} reviewed HPL Auction photographs; catalog total {len(catalog["photos"])}.')
