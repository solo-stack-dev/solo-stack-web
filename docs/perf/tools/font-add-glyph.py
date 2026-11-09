"""Copies glyphs (outline, gvar deltas, advance) from a variable font into a subset of the same family, then verifies
that every glyph of the subset is unchanged and the new ones match their source at several weights.

    python -I docs/perf/tools/font-add-glyph.py <subset.woff2> <source.woff2> <out.woff2> <codepoint hex>...

Made for static/fonts/GeistMono-latin-arrows-wght.woff2 (the arrows of src/lib/stats/Delta.svelte: → ↗ ↘):
    python -I docs/perf/tools/font-add-glyph.py GeistMono-latin-wght.woff2 static/fonts/GeistMono-wght.woff2 \
        static/fonts/GeistMono-latin-arrows-wght.woff2 2192 2197 2198
(GeistMono-latin-wght.woff2 is the Google Fonts Latin subset, in git history before this file replaced it.)

Needs fontTools. WOFF2 needs brotli: without the Python module, brotli runs through Node's built-in zlib (no install).
"""
import copy
import subprocess
import sys
import types

try:
    import brotli  # noqa: F401
except ImportError:
    _DEC = "const z=require('zlib');const c=[];process.stdin.on('data',d=>c.push(d)).on('end',()=>process.stdout.write(z.brotliDecompressSync(Buffer.concat(c))))"
    _ENC = (
        "const z=require('zlib');const [m,q,w,b]=process.argv.slice(1).map(Number);const c=[];process.stdin.on('data',d=>c.push(d)).on('end',()=>{"
        "const i=Buffer.concat(c);const k=z.constants;process.stdout.write(z.brotliCompressSync(i,{params:{[k.BROTLI_PARAM_MODE]:m,"
        "[k.BROTLI_PARAM_QUALITY]:q,[k.BROTLI_PARAM_LGWIN]:w,[k.BROTLI_PARAM_LGBLOCK]:b,[k.BROTLI_PARAM_SIZE_HINT]:i.length}}))})"
    )

    def _node(args, data):
        result = subprocess.run(['node', '-e', *args], input=bytes(data), capture_output=True, check=True)
        return result.stdout

    shim = types.ModuleType('brotli')
    shim.MODE_GENERIC, shim.MODE_TEXT, shim.MODE_FONT = 0, 1, 2
    shim.error = subprocess.CalledProcessError
    shim.decompress = lambda data: _node([_DEC], data)
    shim.compress = lambda data, mode=0, quality=11, lgwin=22, lgblock=0: _node([_ENC, str(mode), str(quality), str(lgwin), str(lgblock)], data)
    sys.modules['brotli'] = shim

from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

subset_path, source_path, out_path, *cp_hex = sys.argv[1:]
codepoints = [int(c, 16) for c in cp_hex]

# Eager load: the tables must be read against the old glyph order. No bbox/timestamp recalculation: the subset's
# head/hhea stay as they are.
font = TTFont(subset_path, lazy=False, recalcBBoxes=False, recalcTimestamp=False)
for tag in font.keys():
    font[tag]
source = TTFont(source_path)
names = [source.getBestCmap()[cp] for cp in codepoints]
for cp, name in zip(codepoints, names):
    assert cp not in font.getBestCmap() and name not in font.getGlyphOrder(), f'{name} already in the subset'
    assert not source['glyf'][name].isComposite(), f'{name}: composite glyphs need their components too'


def advance_deltas(f, glyph):
    hvar = f['HVAR'].table
    index = hvar.AdvWidthMap.mapping[glyph] if hvar.AdvWidthMap else f.getGlyphID(glyph)
    return hvar.VarStore.VarData[index >> 16].Item[index & 0xFFFF]


originals = list(font.getGlyphOrder())
order = originals + names
for name in names:
    font['glyf'].glyphs[name] = copy.deepcopy(source['glyf'][name])
font.setGlyphOrder(order)
font['glyf'].glyphOrder = order
for cp, name in zip(codepoints, names):
    # A new glyph reuses an advance-delta row of the subset; both must be constant (monospace)
    assert not any(advance_deltas(source, name)), f'{name}: advance varies with weight'
    reference = next(g for g in originals if font['hmtx'][g][0] == source['hmtx'][name][0] and not any(advance_deltas(font, g)))
    font['hmtx'].metrics[name] = source['hmtx'].metrics[name]
    font['gvar'].variations[name] = copy.deepcopy(source['gvar'].variations.get(name, []))
    if font['HVAR'].table.AdvWidthMap:
        font['HVAR'].table.AdvWidthMap.mapping[name] = font['HVAR'].table.AdvWidthMap.mapping[reference]
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap[cp] = name
font.flavor = 'woff2'
font.save(out_path)

# Verify
old, new = TTFont(subset_path), TTFont(out_path)
weights = [None] + [{'wght': w} for w in (100, 250, 400, 650, 900)]


def drawn(f, glyph, location):
    glyphs = f.getGlyphSet(location=location) if location else f.getGlyphSet()
    pen = RecordingPen()
    glyphs[glyph].draw(pen)
    return pen.value, glyphs[glyph].width


problems = [(g, w) for g in old.getGlyphOrder() for w in weights if drawn(old, g, w) != drawn(new, g, w)]
problems += [(name, w) for name in names for w in weights if drawn(source, name, w) != drawn(new, name, w)]
changed = {hex(k): v for k, v in new.getBestCmap().items() if old.getBestCmap().get(k) != v}
for tag in sorted(set(old.keys()) | set(new.keys())):
    if tag not in ('GlyphOrder', 'glyf', 'loca', 'gvar', 'hmtx', 'hhea', 'cmap', 'maxp', 'post', 'HVAR', 'head'):
        if old[tag].compile(old) != new[tag].compile(new):
            problems.append(('table', tag))
for tag in ('head', 'hhea'):
    a, b = old[tag].__dict__, new[tag].__dict__
    fields = {k for k in a if k in b and a[k] != b[k]} - {'checkSumAdjustment', 'numberOfHMetrics'}
    if fields:
        problems.append((tag, sorted(fields)))
print('cmap added:', changed)
if problems:
    sys.exit(f'MISMATCH: {problems[:20]}')
print(f'OK: {len(old.getGlyphOrder())} glyphs unchanged at {len(weights)} weights, {", ".join(names)} identical to the source, other tables unchanged')
