"""Export generated originals and make alpha/composition proofs; writes only round-3."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageOps, PngImagePlugin

OUT = Path(__file__).resolve().parents[1]
PRE = OUT / 'previews'
REPO = OUT.parents[3]
LOG = json.loads((PRE / 'generation-log.json').read_text(encoding='utf-8'))
SIZE = {'dawn-cloud-bank.png': (2560, 900), 'dawn-cloud-bank-mobile.png': (1080, 1300),
        'ink-ground-a.png': (2560, 360), 'ink-ground-b.png': (2560, 360),
        'ink-feather.png': (2560, 300), 'wax-seal.png': (800, 800), 'wax-seal-pressed.png': (800, 800)}

def save(im, path):
    info = PngImagePlugin.PngInfo()
    info.add(b'sRGB', b'\x00')
    im.save(path, pnginfo=info, optimize=True)

def resize(im, size):
    return im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')

def clean(im):
    a = np.array(im.convert('RGBA'))
    a[:, :, 3][a[:, :, 3] < 3] = 0
    a[:, :, 3][a[:, :, 3] > 248] = 255
    a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a)

def proof(im, color):
    return Image.alpha_composite(Image.new('RGBA', im.size, color), im).convert('RGB')

export = []
for job in LOG:
    if not job['selected']:
        continue
    name = job['file']
    im = clean(Image.open(job['source']))
    native = im.size
    crop = (0, 0, im.width, im.height)
    if name.startswith('ink-ground'):
        bounds = im.getchannel('A').getbbox()
        crop = (0, max(0, bounds[1] - 18), im.width, min(im.height, bounds[3] + 18))
    elif name == 'ink-feather.png':
        crop = (0, 0, im.width, im.getchannel('A').getbbox()[3] + 20)
    im = clean(resize(im.crop(crop), SIZE[name]))
    if name == 'ink-feather.png':
        # Two fractional-alpha pixels on the attachment row must join a solid hill.
        pixels = np.array(im)
        pixels[0, :, 3] = 255
        im = Image.fromarray(pixels)
    save(im, OUT / name)
    export.append({'file': name, 'native': native, 'crop': crop, 'export': im.size})
    for label, color in [('night', '#18191b'), ('paper', '#fdf9ee')]:
        save(proof(im, color), PRE / f'{Path(name).stem}-{label}.png')

(PRE / 'export-log.json').write_text(json.dumps(export, indent=2) + '\n')
report = []
for name in SIZE:
    im = Image.open(OUT / name)
    a = np.array(im)[:, :, 3]
    report.append({'file': name, 'dimensions': im.size, 'mode': im.mode, 'bytes': (OUT / name).stat().st_size,
                   'sha256': hashlib.sha256((OUT / name).read_bytes()).hexdigest(),
                   'alpha_zero': int((a == 0).sum()), 'alpha_partial': int(((a > 0) & (a < 255)).sum()),
                   'alpha_opaque': int((a == 255).sum()), 'alpha_levels': int(len(np.unique(a))),
                   'bounds': im.getchannel('A').getbbox(),
                   'top_clear': bool((a[0] == 0).all()), 'bottom_clear': bool((a[-1] == 0).all()),
                   'top_opaque': bool((a[0] == 255).all())})
(PRE / 'alpha-report.json').write_text(json.dumps(report, indent=2) + '\n')

# Compact sheets; rows follow the named order and columns are night / paper.
def sheet(names, cell, filename):
    w, h = cell
    canvas = Image.new('RGB', (w * 2, h * len(names)), '#fdf9ee')
    for row, name in enumerate(names):
        for col, label in enumerate(['night', 'paper']):
            im = Image.open(PRE / f'{Path(name).stem}-{label}.png')
            im = ImageOps.contain(im, (w, h), Image.Resampling.LANCZOS)
            canvas.paste('#18191b' if col == 0 else '#fdf9ee', (col*w, row*h, (col+1)*w, (row+1)*h))
            canvas.paste(im, (col*w+(w-im.width)//2, row*h+(h-im.height)//2))
    save(canvas, PRE / filename)

sheet(['dawn-cloud-bank.png', 'dawn-cloud-bank-mobile.png'], (720, 500), 'qa-dawn.png')
sheet(['ink-ground-a.png', 'ink-ground-b.png', 'ink-feather.png'], (1000, 170), 'qa-ink.png')
sheet(['wax-seal.png', 'wax-seal-pressed.png'], (400, 400), 'qa-seals.png')

# Actual size seals: top 56px canvas, below 70px canvas (~56px visible wax).
small = Image.new('RGB', (320, 260), '#fdf9ee')
small.paste('#18191b', (0, 0, 160, 260))
for col, bg in enumerate(['#18191b', '#fdf9ee']):
    for row, size in enumerate([56, 70]):
        for state, name in enumerate(['wax-seal.png', 'wax-seal-pressed.png']):
            p = proof(resize(Image.open(OUT / name), (size, size)), bg)
            small.paste(p, (col*160 + state*78 + (78-size)//2, 28+row*115))
save(small, PRE / 'qa-seals-small.png')

# Edge samples: actual graded-alpha boundary pixels enlarged 4x, no smoothing.
edges = Image.new('RGB', (768, 192*len(SIZE)), '#fdf9ee')
for row, name in enumerate(SIZE):
    im = Image.open(OUT/name)
    a = np.array(im)[:, :, 3]
    yy, xx = np.where((a > 20) & (a < 230))
    idx = np.argmin(abs(xx-im.width//3))
    x = max(0, min(im.width-96, int(xx[idx])-48))
    y = max(0, min(im.height-48, int(yy[idx])-24))
    patch = im.crop((x, y, x+96, y+48))
    for col, bg in enumerate(['#18191b', '#fdf9ee']):
        edges.paste(proof(patch, bg).resize((384, 192), Image.Resampling.NEAREST), (384*col, 192*row))
save(edges, PRE / 'qa-alpha-edges.png')

def art(rel):
    return Image.open(REPO / 'docs/art' / rel).convert('RGBA')

# Existing cinema and sunrise plates, not a browser mockup. All additions are art only.
desktop = Image.new('RGBA', (1440, 1050), '#fcd772')
desktop.alpha_composite(resize(art('sunrise/sunrise-sky.png'), (1440, 810)), (0, 150))
cinema = resize(art('cinema/cinema-landscape.png'), (1440, 810)).crop((0, 360, 1440, 810))
desktop.alpha_composite(cinema, (0, 0))
desktop.alpha_composite(resize(Image.open(OUT/'dawn-cloud-bank.png'), (1440, 506)), (0, 150))
desktop.alpha_composite(resize(art('sunrise/sunrise-valley.png'), (1440, 506)), (0, 640))
save(desktop.convert('RGB'), PRE/'dawn-on-cinema-sunrise-desktop.png')

mobile = Image.new('RGBA', (390, 844), '#fcd772')
mobile.alpha_composite(resize(art('sunrise/sunrise-sky-mobile.png'), (390, 845)), (0, 0))
cinema_mobile = ImageOps.fit(art('cinema/cinema-landscape-mobile.png'), (390, 400), centering=(.5, 1))
mobile.alpha_composite(cinema_mobile.crop((0, 0, 390, 290)), (0, 0))
mobile.alpha_composite(resize(Image.open(OUT/'dawn-cloud-bank-mobile.png'), (390, 469)), (0, 20))
mobile.alpha_composite(resize(art('sunrise/sunrise-valley.png'), (780, 274)), (-280, 455))
mobile.alpha_composite(resize(art('sunrise/sunrise-cliff-path.png'), (650, 152)), (-150, 585))
mobile.alpha_composite(resize(art('sunrise/sunrise-coffee.png'), (74, 74)), (25, 571))
mobile.alpha_composite(resize(art('sunrise/sunrise-laptop.png'), (180, 90)), (95, 575))
save(mobile.convert('RGB'), PRE/'dawn-on-cinema-sunrise-mobile.png')

checks = {r['file']: r['mode'] == 'RGBA' and r['alpha_zero'] > 0 and r['alpha_partial'] > 0 and r['alpha_opaque'] > 0 for r in report}
checks['all_dimensions_exact'] = all(tuple(r['dimensions']) == SIZE[r['file']] for r in report)
checks['all_bottoms_clear'] = all(r['bottom_clear'] for r in report)
checks['feather_top_opaque'] = next(r['top_opaque'] for r in report if r['file'] == 'ink-feather.png')
checks['other_tops_clear'] = all(r['top_clear'] for r in report if r['file'] != 'ink-feather.png')
(PRE/'validation.json').write_text(json.dumps(checks, indent=2) + '\n')
assert all(checks.values()), checks
print(json.dumps({'checks': checks, 'masters': report}, indent=2))
