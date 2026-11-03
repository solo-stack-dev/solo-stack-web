"""Finish generated mist pigment as production RGBA. Pillow + NumPy only."""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
import json
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
SOURCE = Path('C:/Users/peter/.codex/generated_images/01a1a33d-71a7-7bd2-8754-c23dd1c14e0b')
SOURCES = {
 'dusk':'exec-2447f777-60d9-4267-b137-a81b4afaac32.png',
 'night':'exec-1084b6f6-e92d-433a-995a-a0d785d3bf43.png',
 'predawn':'exec-16cf2382-2faf-4256-bef4-d695c27cbd67.png',
}
W,H=2560,720
X,Y=np.meshgrid(np.arange(W)/(W-1),np.arange(H))
def smooth(v):
    v=np.clip(v,0,1)
    return v*v*(3-2*v)
def blur(a,r):
    return np.asarray(Image.fromarray(np.uint8(np.clip(a,0,1)*255)).filter(ImageFilter.GaussianBlur(r)),dtype=np.float32)/255
def periodic(a):
    # Blend both edges into a half-width shifted copy, whose seam falls outside the blend.
    d=np.minimum(np.arange(W),np.arange(W)[::-1])
    weight=smooth(d/360)[None,:,None]
    b=np.roll(a,W//2,axis=1)
    result=a*weight+b*(1-weight)
    mean=(result[:,0]+result[:,-1])/2
    result[:,0]=mean
    result[:,-1]=mean
    return result
stats={}
plate=Image.open(ROOT/'docs/art/making/making-plate.png').convert('RGB')
# Use the full width, upper/middle 720 rows, native 2560-wide crop.
plate=plate.resize((W,round(plate.height*W/plate.width)),Image.Resampling.LANCZOS)
plate=plate.crop((0,280,W,1000)).convert('RGBA')
for idx,(name,source) in enumerate(SOURCES.items()):
    im=Image.open(SOURCE/source).convert('RGBA')
    # Pillow resizes RGBA through premultiplied RGBa; no matte interpolation.
    im=im.resize((W,H),Image.Resampling.LANCZOS)
    arr=np.asarray(im,dtype=np.float32)/255
    native_alpha=arr[:,:,3]
    rgb=arr[:,:,:3]
    lum=rgb@np.array([.2126,.7152,.0722])
    grain=lum-blur(lum,7)
    warmth=np.maximum(rgb[:,:,0]-rgb[:,:,2],0)
    # Retain native generated alpha; suppress residual pale carrier in dusk/dawn.
    if name=='night':
        density=.88*np.power(native_alpha,.65)
        base=np.array([25,25,26],dtype=float)
        light=smooth((lum-.26)/.40)
        paint=base+(np.array([65,64,61])-base)*light[:,:,None]*.75
        paint+=grain[:,:,None]*25
    else:
        density=native_alpha*(.72+.28*smooth((.96-lum)/.40))
        base=np.array([42,39,35],dtype=float)
        shade=smooth((.82-lum)/.56)
        paint=base-(np.array([11,10,8]))*shade[:,:,None]
        glow=smooth((warmth-.045)/.20)
        if name=='dusk':
            glow*=.32+.68*(1-smooth((Y-280)/180))
            lightcolor=np.array([135,107,64])
        else:
            glow*=.15+.85*smooth((Y-240)/220)
            lightcolor=np.array([129,95,51])
        paint=paint*(1-glow[:,:,None]*.73)+lightcolor*glow[:,:,None]*.73
        paint+=grain[:,:,None]*30
    # Periodic boundary shape varies by several wavelengths; avoids a straight crop.
    phase=idx*.81
    top=147+17*np.sin(2*np.pi*X*3+phase)+11*np.sin(2*np.pi*X*7+.7+phase)
    bottom=573+16*np.sin(2*np.pi*X*4+1.3+phase)+12*np.sin(2*np.pi*X*9+phase)
    widthtop=72+19*np.sin(2*np.pi*X*5+1+phase)
    widthbottom=81+18*np.sin(2*np.pi*X*6+.3+phase)
    # Source pigment warps feathering; texture stays within density, never a linear ramp.
    envelope=smooth((Y-top+grain*38)/widthtop)*smooth((bottom-Y+grain*38)/widthbottom)
    alpha=np.minimum(density*.85,217/255)*envelope
    # Blend in premultiplied space, retaining granular translucent pigment.
    rgba=np.dstack([np.clip(paint,14,225)/255*alpha[:,:,None],alpha])
    rgba=periodic(rgba)
    alpha=rgba[:,:,3]
    paint=np.divide(rgba[:,:,:3]*255,alpha[:,:,None],out=np.broadcast_to(base,rgba[:,:,:3].shape).copy(),where=alpha[:,:,None]>1e-8)
    alpha=np.rint(alpha*255).astype(np.uint8)
    alpha[alpha<2]=0
    alpha[:130]=0
    alpha[-130:]=0
    # RGB bleed into invisible pixels; soft low-alpha cleanup removes any pale matte.
    edge=smooth(alpha.astype(float)/28)
    paint=base+(paint-base)*edge[:,:,None]
    paint=np.uint8(np.clip(np.rint(paint),14,225))
    result=np.dstack([paint,alpha])
    result[:,-1]=result[:,0]
    output=Image.fromarray(result,'RGBA')
    path=OUT/f'mist-{name}.png'
    output.save(path,optimize=True,compress_level=9)
    # Three unlabelled full-size rows: dark night / warm dusk / actual plate crop.
    checks=[]
    for bg in [Image.new('RGBA',(W,H),'#1a1a1b'),Image.new('RGBA',(W,H),'#2d2620'),plate]:
        checks.append(Image.alpha_composite(bg,output).convert('RGB'))
    proof=Image.new('RGB',(W,H*3))
    for i,panel in enumerate(checks): proof.paste(panel,(0,i*H))
    proof.save(OUT/f'_check-mist-{name}.png',optimize=True,compress_level=9)
    core=alpha[230:490]
    active=alpha[alpha>=25]
    stats[name]={
      'source':source, 'source_dimensions':list(Image.open(SOURCE/source).size),
      'dimensions':[W,H],'bytes':path.stat().st_size,'mode':output.mode,
      'alpha_min':int(alpha.min()),'alpha_max':int(alpha.max()),'alpha_mean':float(alpha.mean()),
      'alpha_mean_percent':float(alpha.mean()/255*100),
      'nonzero_alpha_mean':float(alpha[alpha>0].mean()),
      'core_25_65_percent':float(((core>=64)&(core<=166)).mean()*100),
      'substantial_pigment_25_65_percent':float(((active>=64)&(active<=166)).mean()*100),
      'top130_alpha_max':int(alpha[:130].max()),'bottom130_alpha_max':int(alpha[-130:].max()),
      'left_right_max_rgba_difference':int(np.abs(result[:,0].astype(int)-result[:,-1].astype(int)).max()),
      'transparent_rgb':np.unique(paint[alpha==0],axis=0).tolist(),
      'proof_bytes':(OUT/f'_check-mist-{name}.png').stat().st_size
    }
    assert alpha.max()<=217
    assert alpha[:130].max()==alpha[-130:].max()==0
    assert np.array_equal(result[:,0],result[:,-1])
(OUT/'_mist-validation.json').write_text(json.dumps(stats,indent=2)+'\n')
print(json.dumps(stats,indent=2))
