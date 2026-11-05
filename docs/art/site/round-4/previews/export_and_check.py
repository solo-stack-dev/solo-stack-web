"""Reproduce fixed-frame exports and alpha proofs from native RGBA generations."""
from pathlib import Path
import hashlib
import json

import numpy as np
from PIL import Image, ImageDraw, PngImagePlugin

PRE = Path(__file__).resolve().parent
OUT = PRE.parent
names = ('wax-seal', 'wax-seal-pressed')
sources = [Image.open(PRE / f'source-{state}.png').convert('RGBA') for state in ('normal', 'pressed')]
assert sources[0].size == sources[1].size
arrays = [np.array(im) for im in sources]
# Preserve the overlap of the two native alpha mattes. This removes the edit's
# approximately 2px perimeter drift without extracting a background or redrawing.
alpha = np.minimum(arrays[0][:, :, 3], arrays[1][:, :, 3])
alpha[alpha <= 3] = 0  # Native generation has invisible isolated alpha 1-3 specks.
bounds = Image.fromarray(alpha).getbbox()
scale = 672 / max(bounds[2] - bounds[0], bounds[3] - bounds[1])
size = tuple(round(n * scale) for n in (bounds[2] - bounds[0], bounds[3] - bounds[1]))
offset = tuple((800 - n) // 2 for n in size)


def save(im, path):
    meta = PngImagePlugin.PngInfo()
    meta.add(b'sRGB', b'\x00')
    im.save(path, optimize=True, pnginfo=meta)


def resize(im, size):
    # Premultiplied-alpha resampling prevents transparent RGB bleeding into edges.
    return im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def composite(im, color):
    return Image.alpha_composite(Image.new('RGBA', im.size, color), im).convert('RGB')


exports = []
report = []
for name, data in zip(names, arrays):
    data[:, :, 3] = alpha
    data[alpha == 0] = 0
    cropped = Image.fromarray(data).crop(bounds)
    result = Image.new('RGBA', (800, 800))
    result.paste(resize(cropped, size), offset)
    # Normalize fully transparent RGB for clean downstream transforms.
    pixels = np.array(result)
    pixels[pixels[:, :, 3] == 0] = 0
    result = Image.fromarray(pixels)
    save(result, OUT / f'{name}.png')
    exports.append(result)
    a = pixels[:, :, 3]
    edge = pixels[(a > 0) & (a < 255)]
    report.append({
        'file': f'{name}.png', 'size': list(result.size), 'mode': result.mode,
        'bytes': (OUT / f'{name}.png').stat().st_size,
        'sha256': hashlib.sha256((OUT / f'{name}.png').read_bytes()).hexdigest(),
        'alpha_extrema': list(result.getchannel('A').getextrema()),
        'alpha_bbox': list(result.getchannel('A').getbbox()),
        'transparent_pixels': int((a == 0).sum()),
        'partial_alpha_pixels': int(((a > 0) & (a < 255)).sum()),
        'opaque_pixels': int((a == 255).sum()),
        'canvas_border_fully_transparent': bool(not (a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any())),
        'transparent_rgb_zero': bool((pixels[a == 0] == 0).all()),
        'partial_alpha_neutral_white_pixels': int(((edge[:, :3].min(axis=1) > 235) & (np.ptp(edge[:, :3], axis=1) < 12)).sum()),
    })
    for n in (56, 64, 72, 200):
        small = resize(result, (n, n))
        for label, color in (('night', '#18191b'), ('paper', '#fdf9ee')):
            save(composite(small, color), PRE / f'{name}-{n}px-{label}.png')

# Side-by-side actual-size proof: normal left, pressed right, dark then paper.
sheet = Image.new('RGB', (576, 704), '#292a2c')
draw = ImageDraw.Draw(sheet)
for row, (label, color, ink) in enumerate((('night', '#18191b', '#fdf9ee'), ('paper', '#fdf9ee', '#18191b'))):
    y = row * 352
    draw.rectangle((0, y, 575, y + 351), fill=color)
    draw.text((24, y + 14), f'{label} / normal                     pressed', fill=ink)
    for col, seal in enumerate(exports):
        x = col * 288
        sheet.paste(composite(resize(seal, (200, 200)), color), (x + 44, y + 38))
        sheet.paste(composite(resize(seal, (64, 64)), color), (x + 112, y + 262))
    draw.text((12, y + 128), '200', fill=ink)
    draw.text((12, y + 284), '64', fill=ink)
save(sheet, PRE / 'qa-seals.png')

# Deliberately enlarged actual 64px proofs expose fringe pixels.
edge_sheet = Image.new('RGB', (1024, 512))
for row, color in enumerate(('#18191b', '#fdf9ee')):
    for col, seal in enumerate(exports):
        enlarged = composite(resize(seal, (64, 64)), color).resize((256, 256), Image.Resampling.NEAREST)
        edge_sheet.paste(enlarged, (col * 256, row * 256))
        # Full-resolution edge crop, top-left wax rim, enlarged 2x.
        edge = composite(seal.crop((152, 64, 280, 192)), color).resize((256, 256), Image.Resampling.NEAREST)
        edge_sheet.paste(edge, (512 + col * 256, row * 256))
save(edge_sheet, PRE / 'qa-alpha-edges.png')

same_alpha = np.array_equal(np.array(exports[0])[:, :, 3], np.array(exports[1])[:, :, 3])
assert same_alpha
assert all(r['canvas_border_fully_transparent'] and r['transparent_rgb_zero'] for r in report)
details = {
    'generation': 'Built-in image_gen; native transparent RGBA, 1254x1254; normal generation followed by reference edit.',
    'export': {'shared_source_crop': list(bounds), 'content_size': list(size), 'canvas': [800, 800], 'offset': list(offset), 'resampling': 'premultiplied alpha Lanczos'},
    'alpha': {'identical_between_states': same_alpha, 'method': 'minimum of native alpha channels, only alpha <= 3 removed before common crop and resize; no background extraction'},
    'assets': report,
}
(PRE / 'alpha-report.json').write_text(json.dumps(details, indent=2) + '\n', encoding='utf-8')
print(json.dumps(details, indent=2))
