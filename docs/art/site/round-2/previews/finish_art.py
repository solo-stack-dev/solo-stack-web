"""Reproducible technical export of selected image_gen paintings; no procedural art.

Run from any cwd. Original generator paths are recorded in generation-log.json.
Only writes within this round-2 folder. Pillow and NumPy were already installed.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageFilter, PngImagePlugin

ROOT = Path(__file__).resolve().parent.parent
PROOFS = ROOT / 'previews'
LOG = json.loads((PROOFS / 'generation-log.json').read_text(encoding='utf-8-sig'))
SOURCES = {e['file']: Path(e['source']) for e in LOG if e['selected']}
LANCZOS = Image.Resampling.LANCZOS


def rgba(im):
    a = np.array(im.convert('RGBA'))
    a[:, :, 3][a[:, :, 3] < 3] = 0
    a[:, :, 3][a[:, :, 3] > 248] = 255
    a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a)


def resize(im, size):
    # Premultiplied resampling preserves dark/gold fringes without matte colors.
    if im.mode == 'RGBA':
        return im.convert('RGBa').resize(size, LANCZOS).convert('RGBA')
    return im.resize(size, LANCZOS)


def save(im, file):
    info = PngImagePlugin.PngInfo()
    info.add(b'sRGB', b'\x00')
    im.save(file, pnginfo=info, optimize=True)


def pm(a):
    f = a.astype(np.float32) / 255
    f[:, :, :3] *= f[:, :, 3:4]
    return f


def unpm(f):
    a = f.copy()
    a[:, :, :3] = np.divide(a[:, :, :3], a[:, :, 3:4], out=np.zeros_like(a[:, :, :3]), where=a[:, :, 3:4] > 0)
    return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)


def crossfade(a, b):
    t = np.linspace(0, 1, len(a))[:, None, None]
    t = t * t * (3 - 2 * t)
    return unpm(pm(a) * (1 - t) + pm(b) * t)


# Four exact 16:9 native-detail plates. Trim only 8 horizontal and 5 vertical pixels.
for name in ['poster-moon-planet', 'poster-stack-to-moon', 'poster-constellations', 'cinema-projection']:
    im = Image.open(SOURCES[name + '.png']).convert('RGB')
    w, h = im.size
    assert (w, h) == (1672, 941)
    im = im.crop((4, 2, 1668, 938))
    save(im, ROOT / (name + '.png'))

# Cloud layers: explicit panoramic export; abstract paint is vertically compressed.
for letter in 'abc':
    name = 'seam-cloud-' + letter
    im = rgba(Image.open(SOURCES[name + '.png']))
    a = np.array(im)
    # A gentle two-dimensional feather of the lower half avoids per-column streaks.
    alpha = Image.fromarray(a[:, :, 3])
    soft = np.array(alpha.filter(ImageFilter.GaussianBlur(9)))
    t = np.clip((np.arange(a.shape[0]) - 330) / 160, 0, 1)[:, None]
    t = t * t * (3 - 2 * t)
    a[:, :, 3] = np.rint(a[:, :, 3] * (1 - t) + soft * t)
    # Extrapolate the generated dark pigment into newly feathered alpha only.
    empty = (np.array(alpha) == 0) & (a[:, :, 3] > 0)
    a[empty, :3] = [16, 18, 22]
    im = resize(rgba(Image.fromarray(a)), (2560, 500))
    canvas = Image.new('RGBA', (2560, 600))
    canvas.alpha_composite(im, (0, 50))
    save(rgba(canvas), ROOT / (name + '.png'))

# Root middle: overlap two generated texture bands into a cyclic tile, retaining grain.
mid = rgba(Image.open(SOURCES['root-mid.png'])).crop((98, 1, 798, 1751))
ma = np.array(mid)
overlap = 64
tile = ma[overlap:].copy()
tile[-overlap:] = crossfade(ma[-overlap:], ma[:overlap])
mid = rgba(resize(Image.fromarray(tile), (700, 1750)))
ma = np.array(mid)
ma[-1] = ma[0]
mid = Image.fromarray(ma)
save(mid, ROOT / 'root-mid.png')

# Narrow the generated thick top entrance to ~12% canvas, leaving lower body unchanged.
top = rgba(Image.open(SOURCES['root-top.png']))
top = resize(top, (897, 1752)).crop((98, 1, 798, 1751))
ta = np.zeros((1750, 700, 4), dtype=np.uint8)
for y in range(top.height):
    t = min(1, y / 600)
    scale = .60 + .40 * t * t * (3 - 2 * t)
    width = round(700 * scale)
    strip = resize(top.crop((0, y, 700, y + 1)), (width, 1))
    ta[y:y + 1, (700 - width)//2:(700 - width)//2 + width] = np.array(strip)
ta[-overlap:] = crossfade(ta[-overlap:], ma[-overlap:])
save(rgba(Image.fromarray(ta)), ROOT / 'root-top.png')

# End: crop empty sides only, align native top root center, preserve rootlet drawing.
end = rgba(Image.open(SOURCES['root-end.png'])).crop((40, 0, 740, 1983))
ea = np.array(end)
ea[:overlap] = crossfade(ma[:overlap], ea[:overlap])
save(rgba(Image.fromarray(ea)), ROOT / 'root-end.png')

# Small editorial assets: uniform downsampling, exact 3:1, native alpha retained.
for name in ['break-fireflies', 'break-laptop', 'break-owl']:
    im = rgba(Image.open(SOURCES[name + '.png']))
    save(rgba(resize(im, (1200, 400))), ROOT / (name + '.png'))

print('Exported 13 masters within', ROOT)
