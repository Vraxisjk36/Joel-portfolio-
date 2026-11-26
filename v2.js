/* V2 interaction layer. No external animation dependency. */
(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=q('#kinetic-object'), hero=q('#home');
if(canvas && hero){
 const ctx=canvas.getContext('2d');
 if(ctx){
 let w=1,h=1,dpr=1,raf=0,visible=true,tx=0,ty=0,px=0,py=0,time=0,last=0;
 function size(){const b=canvas.getBoundingClientRect();w=Math.max(1,b.width);h=Math.max(1,b.height);dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(time);}
 function draw(t){
  ctx.clearRect(0,0,w,h);px+=(tx-px)*.06;py+=(ty-py)*.06;
  const scale=Math.min(w*.27,h*.45),cx=w*(w>800?.61:.54)+px*18,cy=h*.48+py*15;
  const a=t*.00035+px*.22,b=.46+Math.sin(t*.00028)*.2+py*.18;
  const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
  const mesh=[], count=42, steps=96;
  for(let i=0;i<count;i++){
   const u=i/count*Math.PI*2,points=[];
   for(let j=0;j<=steps;j++){
    const v=j/steps*Math.PI*2;
    const twist=u*3+v*2+t*.00042;
    const major=.78+.12*Math.sin(3*u+t*.0005);
    const tube=.25+.075*Math.sin(twist);
    const rr=major+tube*Math.cos(v+u*.5);
    const x=rr*Math.cos(u),y=rr*Math.sin(u),z=tube*Math.sin(v+u*.5)+.18*Math.sin(u*3+t*.0004);
    const x1=x*ca-z*sa,z1=x*sa+z*ca;
    const y1=y*cb-z1*sb,z2=y*sb+z1*cb;
    const f=3.8/(3.8-z2);points.push([cx+x1*scale*f,cy+y1*scale*f,z2]);
   }
   mesh.push(points);
  }
  const lines=[];
  for(let i=0;i<count;i++)for(let j=0;j<steps;j++){
   const p=mesh[i][j],r=mesh[(i+1)%count][j],s=mesh[i][j+1];
   lines.push({p,r,z:(p[2]+r[2])*.5,sub:false});
   if(j%4===0)lines.push({p,r:s,z:(p[2]+s[2])*.5,sub:true});
  }
  lines.sort((a,b)=>a.z-b.z);
  ctx.lineWidth=Math.max(.55,scale/350);
  for(const l of lines){
   const shine=Math.max(0,Math.min(1,(l.z+1)*.52));
   const band=.5+.5*Math.sin(l.z*11+t*.0004);
   const c=Math.round(75+170*shine*band);
   ctx.strokeStyle='rgba('+c+','+(c+4)+','+(c+2)+','+(l.sub?.14+.35*shine:.18+.66*shine)+')';
   ctx.beginPath();ctx.moveTo(l.p[0],l.p[1]);ctx.lineTo(l.r[0],l.r[1]);ctx.stroke();
  }
  ctx.strokeStyle='#bfc6b029';ctx.lineWidth=.8;
  for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(cx,cy,scale*(1.18+k*.075),scale*(.35+k*.035),-.45+k*.35,0,Math.PI*2);ctx.stroke()}
  ctx.fillStyle='#b4b8ac';ctx.font='10px monospace';ctx.fillText('FIG. 01',cx-scale,cy+scale*1.2);ctx.fillStyle='#d5f59e';ctx.fillRect(cx+scale*.96,cy-scale*.98,3,3);
 }
 function loop(now){raf=0;if(!visible||motion.matches||document.hidden)return;if(now-last>30){time+=Math.min(now-last,60);last=now;draw(time)}raf=requestAnimationFrame(loop)}
 function sync(){if(!visible||motion.matches||document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;if(motion.matches)draw(0);return}if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
 hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect();tx=(e.clientX-b.left)/b.width-.5;ty=(e.clientY-b.top)/b.height-.5},{passive:true});
 hero.addEventListener('pointerleave',()=>{tx=ty=0});
 if('ResizeObserver'in window)new ResizeObserver(size).observe(canvas);else window.addEventListener('resize',size);
 if('IntersectionObserver'in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()}).observe(hero);
 motion.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);size();sync();
 }
}
// The project stage keeps native horizontal scrolling, keyboard navigation and touch gestures.
const track=q('#project-track'), index=q('#project-index'), preview=q('#live-preview');
const descriptions={
 rsvp:'Create an invitation, personalise the experience, share the result and collect responses.',
 crc:'Role-aware workflows, academy training and team coordination. Internal data is not shown.',
 drop:'A practical file and text transfer utility — the project I use most often.',
 veil:'An architectural experience built around motion, atmosphere and interaction.',
 persona:'A writing SaaS prototype with voice profiles, feedback and usage accounting.',
 chronos:'Three-dimensional motion and an interactive booking concept.',
 kickoff:'A football career simulation built with web technologies and packaged for Android.'
};
const demos={rsvp:['Visit product website','https://vraxisrsvp.online'],veil:['Explore the concept','demos/veil.html'],chronos:['Explore the concept','demos/chronos.html']};
if(track&&index){
 const cards=qa('.project',track);let buttons=[];
 for(const [i,card] of cards.entries()){
  const key=q('[data-project]',card).dataset.project,caption=q('.project-caption>div',card);
  const p=document.createElement('p');p.className='project-description';p.textContent=descriptions[key]||'';caption.append(p);
  const label=document.createElement('span');label.className='case-label';label.textContent='OPEN CASE STUDY ↗';caption.append(label);
  const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+' / '+q('h3',card).textContent;b.setAttribute('aria-current','false');
  b.addEventListener('click',()=>track.scrollTo({left:card.offsetLeft-track.firstElementChild.offsetLeft+track.scrollLeft-(card.getBoundingClientRect().left-track.getBoundingClientRect().left) + (card.getBoundingClientRect().left-track.getBoundingClientRect().left),behavior:motion.matches?'auto':'smooth'}));
  // Use viewport-relative position, including after category filtering.
  b.onclick=()=>{track.scrollTo({left:track.scrollLeft+card.getBoundingClientRect().left-track.getBoundingClientRect().left-3,behavior:motion.matches?'auto':'smooth'})};
  index.append(b);buttons.push(b);
 }
 // Replace redundant click handlers with a single precise navigation function.
 buttons.forEach((b,i)=>{const copy=b.cloneNode(true);b.replaceWith(copy);copy.addEventListener('click',()=>{const card=cards[i];track.scrollTo({left:track.scrollLeft+card.getBoundingClientRect().left-track.getBoundingClientRect().left-3,behavior:motion.matches?'auto':'smooth'})});buttons[i]=copy});
 let current=-1,scheduled=false;
 function update(){scheduled=false;let best=Infinity,active=-1;const left=track.getBoundingClientRect().left;cards.forEach((c,i)=>{buttons[i].hidden=c.hidden;if(c.hidden)return;const dist=Math.abs(c.getBoundingClientRect().left-left);if(dist<best){best=dist;active=i}});if(active<0)return;buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===active)));
 if(current!==active){current=active;const key=q('[data-project]',cards[active]).dataset.project;preview.replaceChildren();const label=document.createElement('span');label.textContent='PROJECT '+String(active+1).padStart(2,'0')+' / 07';preview.append(label);if(demos[key]){const a=document.createElement('a');a.href=demos[key][1];a.textContent=demos[key][0]+' ↗';a.target='_blank';a.rel='noopener';preview.append(a)}else{const b=document.createElement('span');b.textContent='Details in case study';preview.append(b)}}}
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}track.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);qa('.filter').forEach(b=>b.addEventListener('click',schedule));update();
}
// Chapter-based personal story: keyboard-accessible, no information lost.
const tabs=qa('.story-tabs button'),panel=q('#story-panel');
const chapters=[
 ['Before the code.','Born in the Democratic Republic of the Congo and raised in Kimberley, South Africa, I was curious about technology long before I had a computer. Towards the end of Grade 11 I finally got my first laptop. That changed what was possible.'],
 ['The first build.','In Grade 12 I built an NSC marks calculator using actual assessment weightings. I wanted to prove I could build software. What stayed with me was that something I made could make a real task easier.'],
 ['Learning by doing.','I am a second-year BSc Information Technology student at Eduvos, studying part-time and expecting to graduate in 2027. Most of my practical knowledge is self-taught. I have worked in web development and IT support, and built software outside university.'],
 ['What comes next.','I want to work on ambitious software with a team that cares about what it builds. I enjoy solving difficult problems from different angles, and Vraxis Drop is my favourite project because I actually use it. I am available for full-time work.']
];
if(tabs.length&&panel){function pick(i,focus=false){tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1});panel.setAttribute('aria-labelledby',tabs[i].id);q('h3',panel).textContent=chapters[i][0];q('p',panel).textContent=chapters[i][1];panel.classList.remove('change');void panel.offsetWidth;panel.classList.add('change');if(focus)tabs[i].focus()}tabs.forEach((b,i)=>{b.addEventListener('click',()=>pick(i));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();pick(n,true)})});pick(0);q('#about').classList.remove('no-js-story')}
const bar=q('.reading-progress i');let pending=false;
function pageProgress(){pending=false;const total=document.documentElement.scrollHeight-innerHeight;if(bar)bar.style.transform='scaleX('+Math.max(0,Math.min(1,total>0?scrollY/total:0))+')'}
window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(pageProgress)}},{passive:true});pageProgress();
if('IntersectionObserver'in window&&!motion.matches){const targets=qa('.section-heading,.section-label,.about-copy,.experience-row,.skill-row,.process>div,.archive-row,.beyond-grid,.contact h2');const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.06});targets.forEach(t=>{t.classList.add('reveal-v2');io.observe(t)});document.documentElement.classList.add('motion-ready')}
if('IntersectionObserver'in window){const navLinks=qa('.nav nav a');const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-18% 0px -52% 0px'});['work','about','experience','contact'].forEach(id=>{const s=document.getElementById(id);if(s)io.observe(s)})}
})();
