// Rebuild the mobile composite with Node built-ins only; no dependencies.
// Run: node stitch-mobile.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync, deflateSync } from 'node:zlib';
const dir = path.dirname(fileURLToPath(import.meta.url));
const names = ['04-mobile-slice-1-moonrise-making.png','04-mobile-slice-2-game-night-shift.png','04-mobile-slice-3-radio-cinema-sunrise.png'];
const crcTable = Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type);const c=Buffer.alloc(12+data.length);c.writeUInt32BE(data.length,0);t.copy(c,4);data.copy(c,8);c.writeUInt32BE(crc(Buffer.concat([t,data])),8+data.length);return c;}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
function decode(png){
 let w,h,depth,type,interlace;const parts=[];
 for(let p=8;p<png.length;){const n=png.readUInt32BE(p),t=png.toString('ascii',p+4,p+8),d=png.subarray(p+8,p+8+n);if(t==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);depth=d[8];type=d[9];interlace=d[12];}if(t==='IDAT')parts.push(d);p+=n+12;}
 if(depth!==8||![2,6].includes(type)||interlace!==0)throw new Error('Expected noninterlaced 8-bit RGB/RGBA PNG');
 const bpp=type===6?4:3,stride=w*bpp,raw=inflateSync(Buffer.concat(parts)),pixels=Buffer.alloc(w*h*3);let prev=Buffer.alloc(stride),i=0;
 for(let y=0;y<h;y++){const filter=raw[i++],row=Buffer.alloc(stride);for(let x=0;x<stride;x++){const a=x>=bpp?row[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;const predictor=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):NaN;if(!Number.isFinite(predictor))throw new Error('Invalid PNG filter');row[x]=(raw[i++]+predictor)&255;}for(let x=0;x<w;x++)for(let k=0;k<3;k++)pixels[(y*w+x)*3+k]=row[x*bpp+k];prev=row;}
 return {w,h,pixels};
}
function encode({w,h,pixels}){const header=Buffer.alloc(13);header.writeUInt32BE(w,0);header.writeUInt32BE(h,4);header[8]=8;header[9]=2;const rows=Buffer.alloc(h*(w*3+1));for(let y=0;y<h;y++)pixels.copy(rows,y*(w*3+1)+1,y*w*3,(y+1)*w*3);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
function resizeWidth(img,w){if(img.w===w)return img;const h=Math.round(img.h*w/img.w),pixels=Buffer.alloc(w*h*3);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.min(img.w-1,Math.round(x*img.w/w)),sy=Math.min(img.h-1,Math.round(y*img.h/h));for(let k=0;k<3;k++)pixels[(y*w+x)*3+k]=img.pixels[(sy*img.w+sx)*3+k];}return {w,h,pixels};}
const originals=await Promise.all(names.map(async n=>decode(await fs.readFile(path.join(dir,n)))));
const w=Math.min(...originals.map(i=>i.w)),imgs=originals.map(i=>resizeWidth(i,w));
const overlap=Math.round(w*0.12),h=imgs.reduce((s,i)=>s+i.h,0)-overlap*(imgs.length-1),pixels=Buffer.alloc(w*h*3);
let top=0;
for(let n=0;n<imgs.length;n++){const img=imgs[n];for(let y=0;y<img.h;y++){const t=n>0&&y<overlap?y/(overlap-1):1,alpha=t*t*(3-2*t);for(let x=0;x<w*3;x++){const dst=(top+y)*w*3+x,src=y*w*3+x;pixels[dst]=Math.round(pixels[dst]*(1-alpha)+img.pixels[src]*alpha);}}top+=img.h-overlap;}
await fs.writeFile(path.join(dir,'04-painted-night-lightbox-mobile-full.png'),encode({w,h,pixels}));
console.log(JSON.stringify({width:w,height:h,overlap,inputs:originals.map(({w,h})=>({w,h}))}));
