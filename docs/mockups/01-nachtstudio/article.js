
'use strict';
const player=document.querySelector('#player'),playerStatus=document.querySelector('#player-status');let frame=null,pendingTime=0;
function loadPlayer(time=0){pendingTime=time;if(frame){frame.contentWindow.postMessage({type:'seek',time},'*');return;}
 frame=document.createElement('iframe');frame.title='Lokaler Demo Videoplayer';frame.setAttribute('sandbox','allow-scripts');
 frame.src='demo-player.html';frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'seek',time:pendingTime},'*'));player.replaceChildren(frame);
}
document.querySelector('#load-video').addEventListener('click',()=>loadPlayer());
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{const t=Number(b.dataset.time);loadPlayer(t);document.querySelectorAll('[data-time]').forEach(x=>x.classList.toggle('active',x.dataset.time===b.dataset.time));playerStatus.textContent='DEMO / Kapitel bei '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');player.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});}));
window.addEventListener('message',e=>{if(frame&&e.source===frame.contentWindow&&e.data?.type==='time'){const t=Number(e.data.time);if(!Number.isFinite(t))return;playerStatus.textContent='DEMO / '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0')+' · Kein echtes Video';const times=[0,84,272,448];const current=times.filter(x=>x<=t).pop();document.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('active',Number(b.dataset.time)===current));}});
