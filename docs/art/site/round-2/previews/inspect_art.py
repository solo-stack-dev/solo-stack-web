"""Generate full-size proofs, contact sheets and measurable art validation."""
from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'previews'
BG = {'night': '#18191b', 'paper': '#fdf9ee'}


def composite(im, color):
    bg = Image.new('RGBA', im.size, color)
    bg.alpha_composite(im.convert('RGBA'))
    return bg.convert('RGB')


def sheet(names, file, cell=(700, 260)):
    result = Image.new('RGB', (cell[0] * 2, cell[1] * len(names)))
    for y, name in enumerate(names):
        im = Image.open(ROOT / (name + '.png')).convert('RGBA')
        im.thumbnail((cell[0], cell[1]), Image.Resampling.LANCZOS)
        for x, color in enumerate(BG.values()):
            tile = Image.new('RGBA', cell, color)
            tile.alpha_composite(im, ((cell[0] - im.width)//2, (cell[1] - im.height)//2))
            result.paste(tile.convert('RGB'), (x * cell[0], y * cell[1]))
    result.save(OUT / file, optimize=True)


report = []
for path in sorted(ROOT.glob('*.png')):
    im = Image.open(path)
    a = np.array(im.convert('RGBA'))
    al = a[:, :, 3]
    entry = {'file': path.name, 'width': im.width, 'height': im.height, 'bytes': path.stat().st_size,
             'mode': im.mode, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
             'alpha': {'zero': int((al == 0).sum()), 'partial': int(((al > 0) & (al < 255)).sum()),
                       'opaque': int((al == 255).sum()), 'minimum': int(al.min()), 'maximum': int(al.max())}}
    report.append(entry)
    if im.mode == 'RGBA':
        assert entry['alpha']['zero'] > 0 and entry['alpha']['partial'] > 0
        assert np.all(a[al == 0, :3] == 0)
        for name, color in BG.items():
            composite(im, color).save(OUT / (path.stem + '-' + name + '.png'), optimize=True)
    else:
        assert im.width * 9 == im.height * 16

sheet(['seam-cloud-a', 'seam-cloud-b', 'seam-cloud-c'], 'qa-clouds.png')
sheet(['break-fireflies', 'break-laptop', 'break-owl'], 'qa-breaks.png')
sheet(['root-top', 'root-mid', 'root-end'], 'qa-roots.png', (350, 700))

# Opaque series contact sheet.
plates = ['poster-moon-planet', 'poster-stack-to-moon', 'poster-constellations', 'cinema-projection']
ps = Image.new('RGB', (1664, 936))
for i, name in enumerate(plates):
    im = Image.open(ROOT / (name + '.png')).resize((832, 468), Image.Resampling.LANCZOS)
    ps.paste(im, ((i % 2) * 832, (i // 2) * 468))
ps.save(OUT / 'qa-plates.png', optimize=True)

# Actual night plate proofs for all three seams, two different paintings per strip.
repo = ROOT.parents[3]
backdrops = [repo / 'docs/art/hero/hero-sky.png', repo / 'docs/art/cinema/cinema-landscape.png']
proof = Image.new('RGB', (1600, 900))
for row, name in enumerate(['seam-cloud-a', 'seam-cloud-b', 'seam-cloud-c']):
    strip = Image.open(ROOT / (name + '.png')).resize((800, 188), Image.Resampling.LANCZOS)
    for col, file in enumerate(backdrops):
        bg = Image.open(file).convert('RGBA').resize((800, 450), Image.Resampling.LANCZOS).crop((0, 0, 800, 300))
        bg.alpha_composite(strip, (0, 90))
        proof.paste(bg.convert('RGB'), (col * 800, row * 300))
proof.save(OUT / 'qa-clouds-on-plates.png', optimize=True)

# Top + 3 unoverlapped repeats + end, and enlarged actual attachment neighborhoods.
top, mid, end = [Image.open(ROOT / (n + '.png')).convert('RGBA') for n in ['root-top', 'root-mid', 'root-end']]
parts = [top, mid, mid, mid, end]
full = Image.new('RGBA', (700, sum(im.height for im in parts)))
y = 0
for im in parts:
    full.alpha_composite(im, (0, y))
    y += im.height
for name, color in BG.items():
    composite(full, color).save(OUT / ('root-assembly-' + name + '.png'), optimize=True)
joined = Image.new('RGB', (1200, 960))
for j, (a, b) in enumerate([(top, mid), (mid, mid), (mid, end)]):
    strip = Image.new('RGBA', (700, 160))
    strip.alpha_composite(a.crop((0, a.height - 80, 700, a.height)), (0, 0))
    strip.alpha_composite(b.crop((0, 0, 700, 80)), (0, 80))
    crop = strip.crop((200, 0, 500, 160)).resize((600, 320), Image.Resampling.NEAREST)
    for i, color in enumerate(BG.values()):
        joined.paste(composite(crop, color), (i * 600, j * 320))
joined.save(OUT / 'qa-root-joins.png', optimize=True)

arrays = [np.array(im) for im in [top, mid, end]]
widths = (arrays[1][:, :, 3] > 200).sum(axis=1)
quarter_widths = [float(np.median(w)) for w in np.array_split(widths, 4)]
assert max(quarter_widths) - min(quarter_widths) <= 2
assert .06 <= np.median(widths) / mid.width <= .12
assert np.array_equal(arrays[1][0], arrays[1][-1])
assert np.array_equal(arrays[0][-1], arrays[1][0])
assert np.array_equal(arrays[1][-1], arrays[2][0])
assert mid.width * 5 == mid.height * 2
assert not arrays[2][-1, :, 3].any()
for letter in 'abc':
    im = Image.open(ROOT / ('seam-cloud-' + letter + '.png'))
    a = np.array(im)
    assert im.size == (2560, 600)
    assert not a[0, :, 3].any() and not a[-1, :, 3].any()

validation = {'master_count': len(report), 'opaque_count': sum(e['mode'] == 'RGB' for e in report),
              'native_alpha_count': sum(e['mode'] == 'RGBA' for e in report),
              'root_mid_top_bottom_rgba_max_difference': int(np.abs(arrays[1][0].astype(int) - arrays[1][-1]).max()),
              'top_to_mid_rgba_max_difference': int(np.abs(arrays[0][-1].astype(int) - arrays[1][0]).max()),
              'mid_to_end_rgba_max_difference': int(np.abs(arrays[1][-1].astype(int) - arrays[2][0]).max()),
              'root_mid_quarter_median_body_width_px': quarter_widths,
              'root_mid_body_width_percentiles_5_50_95': np.percentile(widths, [5, 50, 95]).tolist(),
              'root_mid_no_global_taper': max(quarter_widths) - min(quarter_widths) <= 2,
              'root_end_bottom_transparent': True,
              'exact_16_9_opaque_plates': True, 'cloud_top_bottom_transparent': True}
assert validation['master_count'] == 13 and validation['opaque_count'] == 4 and validation['native_alpha_count'] == 9
(OUT / 'alpha-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
(OUT / 'validation.json').write_text(json.dumps(validation, indent=2) + '\n', encoding='utf-8')
print(json.dumps(validation, indent=2))
print('\n'.join(f"{e['file']}: {e['width']}x{e['height']}, {e['bytes']:,} bytes, {e['mode']}" for e in report))

# Actual silhouette boundary crops, enlarged 3x with nearest-neighbor sampling.
names = ['seam-cloud-a', 'seam-cloud-b', 'seam-cloud-c', 'root-top', 'root-mid', 'root-end',
         'break-fireflies', 'break-laptop', 'break-owl']
edges = Image.new('RGB', (720, 2160))
for row, name in enumerate(names):
    im = Image.open(ROOT / (name + '.png')).convert('RGBA')
    al = np.array(im)[:, :, 3]
    ys, xs = np.where(al > 100)
    y = int(np.median(ys))
    x = int(np.flatnonzero(al[y] > 100)[0])
    crop = im.crop((x - 50, y - 40, x + 70, y + 40)).resize((360, 240), Image.Resampling.NEAREST)
    for col, color in enumerate(BG.values()):
        edges.paste(composite(crop, color), (360 * col, 240 * row))
edges.save(OUT / 'qa-alpha-edges.png', optimize=True)
