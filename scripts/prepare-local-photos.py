"""Build stable, orientation-correct web images from an authorized local import.

Requires Pillow. Originals, import inventory, and review sheets remain in .sync/.
No network access; never writes to Google Drive or embeds download references.
"""
import hashlib
import io
import json
import math
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageCms, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
inventory = json.loads((ROOT / '.sync/inventory.json').read_text())
collections = json.loads((ROOT / 'src/data/collections.json').read_text())
titles = {c['slug']: c.get('galleryTitle', c['title']) for c in collections}
groups = defaultdict(list)
for item in inventory:
    if item['collection'] not in titles or item['collection'] == 'hpl-auction':
        raise ValueError('Unexpected collection in regular import')
    groups[item['collection']].append(item)

def natural_key(item):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r'(\d+)', item['filename'])]

def open_image(file):
    with Image.open(file) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        profile = source.info.get('icc_profile')
        if profile:
            image = ImageCms.profileToProfile(image, ImageCms.ImageCmsProfile(io.BytesIO(profile)), ImageCms.createProfile('sRGB'), outputMode='RGB')
        return image

# Validate the complete inventory before replacing the catalog.
for item in inventory:
    original = ROOT / '.sync/originals' / (item['id'] + Path(item['filename']).suffix.lower())
    if original.stat().st_size != item['size']:
        raise ValueError('Original size mismatch: ' + item['filename'])

photos = []
for slug, items in groups.items():
    output = ROOT / 'public/images' / slug
    output.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGB', (1200, math.ceil(len(items) / 4) * 250), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for order, item in enumerate(sorted(items, key=natural_key), 1):
        original = ROOT / '.sync/originals' / (item['id'] + Path(item['filename']).suffix.lower())
        checksum = hashlib.sha256(original.read_bytes()).hexdigest()
        image = open_image(original)
        width, height = image.size
        # Limit the longest side while retaining the original aspect ratio.
        full_width = min(width, round(width * min(1, 3000 / max(width, height))))
        targets = sorted(set([min(480, full_width), min(960, full_width), min(1600, full_width), full_width]))
        variants = []
        for target in targets:
            variant = image.resize((target, round(height * target / width)), Image.Resampling.LANCZOS)
            filename = f"{item['id']}-{checksum[:12]}-{target}.webp"
            variant.save(output / filename, 'WEBP', quality=86 if target == full_width else 82, method=5)
            variants.append((target, f'/images/{slug}/{filename}'))
        default = next((url for target, url in variants if target >= min(1600, full_width)), variants[-1][1])
        photos.append({
            'id': item['id'], 'driveFileId': item['id'], 'filename': item['filename'],
            'collection': slug, 'src': default, 'fullSrc': variants[-1][1],
            'srcSet': ', '.join(f'{url} {target}w' for target, url in variants),
            'width': width, 'height': height,
            'alt': f'{titles[slug]} — photograph {order} by Shreesh',
            'displayOrder': order, 'published': True, 'checksum': checksum,
        })
        thumbnail = ImageOps.contain(image, (284, 206))
        x, y = ((order - 1) % 4) * 300, ((order - 1) // 4) * 250
        sheet.paste(thumbnail, (x + (300 - thumbnail.width) // 2, y + (212 - thumbnail.height) // 2))
        draw.text((x + 8, y + 216), f'{order:02d}  {item["filename"]}', fill='#111111')
    review = ROOT / '.sync/contact-sheets'
    review.mkdir(parents=True, exist_ok=True)
    sheet.save(review / f'{slug}.jpg', quality=88)
    print(f'Prepared {slug}: {len(items)} photos', flush=True)

catalog = {'schemaVersion': 1, 'mode': 'live', 'generatedAt': datetime.now(timezone.utc).isoformat(), 'photos': photos}
temporary = ROOT / 'public/portfolio.json.tmp'
temporary.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
temporary.replace(ROOT / 'public/portfolio.json')
print(f'Published {len(photos)} optimized photographs. Originals remain untouched.')
