/* V2.4 — touch halo, short motion trail and tap ripple.
   Passive listeners only: native scrolling, pinch zoom and swiping are untouched. */
(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');
canvas.setAttribute('aria-hidden','true');
canvas.className='touch-feedback';
Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',margin:'0',padding:'0',border:'0',pointerEvents:'none',zIndex:'2147483647',display:'none',background:'transparent',touchAction:'auto'});
const ctx=canvas.getContext('2d');if(!ctx)return;
document.body.append(canvas);
let owner=document.body,active=null,points=[],rings=[],frame=0,dpr=1,w=0,h=0,rect=null,origin=null,last=null,ink='213,245,158',dirty=true;
const now=()=>performance.now();
function clear(){if(frame)cancelAnimationFrame(frame);frame=0;active=null;origin=null;last=null;points=[];rings=[];canvas.style.display='none';ctx.clearRect(0,0,w,h);dirty=true}
function mount(target){
 const parent=target instanceof Element?target.closest('dialog[open]'):null;
 const next=parent||document.body;
 if(owner!==next){clear();owner=next;owner.append(canvas)}
 const light=target instanceof Element&&!!target.closest('.statement,.about,.beyond,#case-dialog');
 ink=light?'40,55,35':'213,245,158';
 canvas.style.display='block';dirty=true;
}
function size(){
 rect=canvas.getBoundingClientRect();
 const ratio=Math.min(devicePixelRatio||1,1.5),nw=Math.max(1,Math.round(rect.width*ratio)),nh=Math.max(1,Math.round(rect.height*ratio));
 if(canvas.width!==nw||canvas.height!==nh||dpr!==ratio){canvas.width=nw;canvas.height=nh;dpr=ratio;w=nw/ratio;h=nh/ratio;ctx.setTransform(ratio,0,0,ratio,0,0)}
 dirty=false;
}
function coords(t){return {x:t.clientX,y:t.clientY,t:now()}}
function ring(p,end=false){rings.push({x:p.x,y:p.y,t:p.t,end,ink});if(rings.length>5)rings.shift()}
function request(){if(!frame)frame=requestAnimationFrame(draw)}
function color(rgb,a){return 'rgba('+rgb+','+Math.max(0,Math.min(1,a))+')'}
function draw(t){
 frame=0;
 if(reduce.matches||document.hidden||(owner!==document.body&&!owner.open)){clear();return}
 if(dirty)size();else rect=canvas.getBoundingClientRect();
 const ox=rect.left,oy=rect.top;
 ctx.clearRect(0,0,w,h);
 points=points.filter(p=>t-p.t<260);rings=rings.filter(p=>t-p.t<(p.end?430:570));
 ctx.lineCap='round';ctx.lineJoin='round';
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],f=Math.max(0,1-(t-b.t)/260);
  ctx.strokeStyle=color(ink,f*.42);ctx.lineWidth=1+f*4;
  ctx.beginPath();ctx.moveTo(a.x-ox,a.y-oy);ctx.lineTo(b.x-ox,b.y-oy);ctx.stroke();
 }
 for(const p of rings){
  const life=p.end?430:570,f=Math.max(0,(t-p.t)/life),ease=1-Math.pow(1-f,3);
  ctx.strokeStyle=color(p.ink,(1-f)*.7);ctx.lineWidth=1.5*(1-f)+.4;
  ctx.beginPath();ctx.arc(p.x-ox,p.y-oy,5+ease*(p.end?22:34),0,Math.PI*2);ctx.stroke();
 }
 if(active!==null&&last){
  const x=last.x-ox,y=last.y-oy;
  ctx.fillStyle=color(ink,.12);ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=color(ink,.72);ctx.lineWidth=1.15;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=color(ink,.92);ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();
 }
 if(active!==null||points.length||rings.length)request();else{canvas.style.display='none';dirty=true}
}
function find(list,id){for(let i=0;i<list.length;i++)if(list[i].identifier===id)return list[i];return null}
function start(e){if(reduce.matches)return;if(e.touches.length!==1){clear();return}if(active!==null)return;
 mount(e.target);const t=e.changedTouches[0];if(!t)return;active=t.identifier;last=coords(t);origin={...last,moved:false};points=[last];ring(last);request()}
function move(e){if(active===null||reduce.matches)return;if(e.touches.length!==1){clear();return}const t=find(e.changedTouches,active);if(!t)return;const p=coords(t);if(origin&&Math.hypot(p.x-origin.x,p.y-origin.y)>10)origin.moved=true;
 if(!last||Math.hypot(p.x-last.x,p.y-last.y)>1.5){points.push(p);if(points.length>28)points.shift()}last=p;request()}
function end(e){if(active===null)return;const t=find(e.changedTouches,active);if(!t)return;const p=coords(t);if(origin&&!origin.moved&&p.t-origin.t<450)ring(p,true);active=null;origin=null;last=null;request()}
const options={passive:true,capture:true};
document.addEventListener('touchstart',start,options);document.addEventListener('touchmove',move,options);document.addEventListener('touchend',end,options);document.addEventListener('touchcancel',clear,options);
window.addEventListener('resize',()=>{dirty=true},{passive:true});
window.visualViewport?.addEventListener('resize',()=>{dirty=true},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()});
reduce.addEventListener?.('change',()=>{if(reduce.matches)clear()});
window.addEventListener('pagehide',clear);
})();