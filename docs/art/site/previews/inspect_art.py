"""Generate night/paper proofs and numeric PNG alpha evidence. No dependencies installed."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'previews'
records = []
for path in sorted(ROOT.glob('*/*.png')):
    if path.parent.name in ('refs', 'previews'):
        continue
    im = Image.open(path)
    row = {'file': path.relative_to(ROOT).as_posix(), 'pixels': list(im.size), 'mode': im.mode}
    if im.mode == 'RGBA':
        arr = np.asarray(im)
        alpha = arr[:, :, 3]
        row.update(alpha_range=[int(alpha.min()), int(alpha.max())], transparent_pixels=int((alpha == 0).sum()), partial_pixels=int(((alpha > 0) & (alpha < 255)).sum()), opaque_pixels=int((alpha == 255).sum()), alpha_bbox=im.getchannel('A').getbbox())
        w,h=im.size
        yy,xx=np.mgrid[:h,:w]
        for theme,color in [('night',(24,25,27)),('paper',(253,249,238))]:
            bg=np.zeros((h,w,3),dtype=np.float32)+color
            if theme=='night':
                cx=.73 if path.stem=='blog-reading-hill' else .5
                g=np.exp(-(((xx/w-cx)/.43)**2+((yy/h-.48)/.55)**2)*2)*.20
                bg=bg*(1-g[:,:,None])+np.array([252,215,114])*g[:,:,None]
            proof=Image.alpha_composite(Image.fromarray(np.uint8(bg)).convert('RGBA'),im).convert('RGB')
            proof.save(OUT / f'{path.stem}-{theme}.png',optimize=True)
    records.append(row)
(ROOT/'alpha-report.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
tiles=[]
for row in records:
    if row['mode']!='RGBA': continue
    tile=Image.new('RGB',(1000,390),(235,230,215))
    ImageDraw.Draw(tile).text((12,8),row['file'],fill=(14,15,16))
    for k,theme in enumerate(('night','paper')):
        proof=Image.open(OUT/f"{Path(row['file']).stem}-{theme}.png")
        proof.thumbnail((496,350))
        tile.paste(proof,(k*500+(500-proof.width)//2,34+(350-proof.height)//2))
    tiles.append(tile)
for start in range(0,len(tiles),3):
    sheet=Image.new('RGB',(1000,390*len(tiles[start:start+3])),(235,230,215))
    for k,tile in enumerate(tiles[start:start+3]): sheet.paste(tile,(0,k*390))
    sheet.save(OUT/f'qa-sheet-{start//3+1}.png')
print(json.dumps(records,indent=2))

# Compare actual edge pixels over pure black and cream, enlarged without interpolation.
edge_crops={
    'blog/blog-reading-hill.png':(1040,380,1200,540),
    'contact/owl-open.png':(300,210,460,370),
    'contact/owl-closed.png':(300,210,460,370),
    'contact/owl-flying.png':(120,70,280,230),
    'shared/backlight-wash.png':(250,150,410,310),
    'shared/footer-horizon.png':(140,150,300,299),
    'stats/stats-growth-tree.png':(230,160,390,320),
    'stats/stats-mascot-sitting.png':(180,40,340,200),
    'stats/stats-tree-rays.png':(280,350,440,510),
}
edge_sheet=Image.new('RGB',(1000,9*220),(235,230,215))
for i,(name,box) in enumerate(edge_crops.items()):
    im=Image.open(ROOT/name).crop(box)
    ImageDraw.Draw(edge_sheet).text((8,i*220+8),name,fill=(14,15,16))
    for j,color in enumerate(((0,0,0),(253,249,238))):
        proof=Image.alpha_composite(Image.new('RGBA',im.size,color+(255,)),im).convert('RGB')
        proof=proof.resize((320,180),Image.Resampling.NEAREST)
        edge_sheet.paste(proof,(j*500+80,i*220+32))
edge_sheet.save(OUT/'qa-edges-black-paper.png')

opened=np.asarray(Image.open(ROOT/'contact/owl-open.png'))
closed=np.asarray(Image.open(ROOT/'contact/owl-closed.png'))
outside=np.ones(opened.shape[:2],dtype=bool)
for x0,y0,x1,y1 in [(380,309,477,383),(488,265,579,345)]: outside[y0:y1,x0:x1]=False
diff=np.any(opened!=closed,axis=2)
assert not diff[outside].any(), 'Blink changes pixels outside eyes'
assert np.array_equal(opened[:,:,3],closed[:,:,3]), 'Blink changes alpha'
hill=np.asarray(Image.open(ROOT/'blog/blog-reading-hill.png'))[:,:,3]
assert not hill[:,:int(hill.shape[1]*.45)].any(), 'Reading hill intrudes into headline zone'
footer=np.asarray(Image.open(ROOT/'shared/footer-horizon.png'))[:,:,3]
assert not footer[:int(footer.shape[0]*.45)].any(), 'Footer intrudes into empty sky'
assert (footer[-1]==255).all(), 'Footer bottom must attach opaquely'
checks={'blink_changed_pixels':int(diff.sum()),'blink_changed_pixels_outside_eye_patches':int(diff[outside].sum()),'blink_alpha_identical':True,'reading_hill_left_45_percent_empty':True,'footer_top_45_percent_empty':True,'footer_bottom_fully_opaque':True,'transparent_master_count':sum(r['mode']=='RGBA' for r in records),'opaque_master_count':sum(r['mode']=='RGB' for r in records)}
(ROOT/'validation.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
print(json.dumps(checks,indent=2))
