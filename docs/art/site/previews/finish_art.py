"""Deterministic export finishing only: alpha cleanup, framing, generated-eye registration.
Usage: python finish_art.py <directory containing the original exec-*.png outputs>
All subjects, paint and eyelids originate in image_gen, never procedural drawing.
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1])
SOURCES={
    "blog/blog-reading-hill.png": "5e9ec109-7958-478b-8a9f-e5e8cff78ca8",
    "blog/video-project.png": "ed7e3c0e-fd11-47cb-b118-0cb35d25c88a",
    "blog/video-ai-test.png": "f18ef1e1-1fb1-4367-9d64-3c6987706bed",
    "blog/video-ai-news.png": "e4c743d5-4df9-4117-8d52-ecd83e5cf05a",
    "blog/video-business.png": "cbe93a48-99e9-4590-933c-caa99e15c67e",
    "stats/stats-growth-tree.png": "e13d79b5-78b6-4440-a93a-3eb24a491d23",
    "stats/stats-tree-rays.png": "44e5d1aa-50eb-432e-9bcf-441705c629fb",
    "stats/stats-mascot-sitting.png": "2e9150f6-8407-4e2a-b865-152c1f79e727",
    "contact/owl-open.png": "125671b6-74c3-499c-964c-f9102f7f2872",
    "contact/owl-closed.png": "940ab965-f947-45a2-ac4f-97000969a998",
    "contact/owl-flying.png": "e44f2208-763a-46b7-9b3c-53bf2dd016b9",
    "shared/footer-horizon.png": "cb466cff-a91b-470e-aa89-bd3a2725bd0f",
    "shared/backlight-wash.png": "43dff387-7fcb-47e7-b255-d6f0279452f4"
}

def clean(im):
    a=np.array(im)
    a[:,:,3][a[:,:,3]<3]=0
    a[:,:,3][a[:,:,3]>248]=255
    a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)

def unmatte(im, strength):
    a=np.asarray(im).astype(np.float32)/255
    rgb=a[:,:,:3]
    # Recover gold pigment from white-matted pale edges; original alpha remains a factor.
    pigment=np.clip((1-rgb[:,:,2])/(1-114/255),0,1)
    rgb=np.clip((rgb-(1-pigment[:,:,None]))/np.maximum(pigment[:,:,None],.001),0,1)
    alpha=a[:,:,3]*pigment*strength
    out=np.dstack((rgb,alpha))
    return clean(Image.fromarray(np.uint8(np.clip(out*255,0,255))))

for name,ident in SOURCES.items():
    im=Image.open(SOURCE/f'exec-{ident}.png')
    if im.mode!='RGBA':
        im.save(ROOT/name,optimize=True)
        continue
    im=clean(im)
    if name=='blog/blog-reading-hill.png':
        # Uniform reduction, anchored bottom/right, reserves >45% fully empty on left.
        small=im.resize((round(im.width*.86),round(im.height*.86)),Image.Resampling.LANCZOS)
        framed=Image.new('RGBA',im.size)
        framed.paste(small,(im.width-small.width,im.height-small.height))
        im=framed
    elif name=='shared/footer-horizon.png':
        im=im.crop((0,425,2172,724))
        a=np.array(im)
        a[-1,:,3]=255
        im=Image.fromarray(a)
    elif name=='stats/stats-growth-tree.png':
        # Discard transparent bottom padding and establish a straight mound attachment edge.
        crop=im.crop((0,0,1190,1290))
        crop.thumbnail((1120,1250),Image.Resampling.LANCZOS)
        framed=Image.new('RGBA',im.size)
        framed.paste(crop,((im.width-crop.width)//2,im.height-crop.height))
        im=framed
    elif name=='stats/stats-mascot-sitting.png':
        im=im.resize((700,700),Image.Resampling.LANCZOS)
    elif name=='contact/owl-flying.png':
        small=im.resize((round(im.width*.94),round(im.height*.94)),Image.Resampling.LANCZOS)
        framed=Image.new('RGBA',im.size)
        framed.paste(small,((im.width-small.width)//2,(im.height-small.height)//2))
        im=framed
    elif name=='shared/backlight-wash.png':
        im=unmatte(im,.80)
    elif name=='stats/stats-tree-rays.png':
        im=unmatte(im,.52)
    elif name=='contact/owl-closed.png':
        opened=Image.open(ROOT/'contact/owl-open.png').convert('RGBA')
        edited=np.asarray(im).astype(np.float32)
        original=np.array(opened)
        # Generated closed eyelids only; all other original pixels remain exactly unchanged.
        for x0,y0,x1,y1 in [(380,309,477,383),(488,265,579,345)]:
            yy,xx=np.mgrid[:y1-y0,:x1-x0]
            feather=np.clip(np.minimum.reduce([xx,yy,x1-x0-1-xx,y1-y0-1-yy])/10,0,1)[:,:,None]
            original[y0:y1,x0:x1]=np.uint8(np.rint(original[y0:y1,x0:x1]*(1-feather)+edited[y0:y1,x0:x1]*feather))
        im=Image.fromarray(original)
    clean(im).save(ROOT/name,optimize=True)
print('Finished 13 masters from original generated sources.')
