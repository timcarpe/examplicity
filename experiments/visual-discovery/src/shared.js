// Small DOM and lesson helpers. Each model owns its state and completion conditions.
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=(x,d=1)=>Number(x.toFixed(d)).toString();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let W=900,H=420,mobile=false,step=0,maxStep=0,ready=false,drag=null;
const svg=$('stage');
function el(tag,attrs={},text,parent=svg){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;parent.appendChild(n);return n}
function text(x,y,t,cls='',anchor='start',parent=svg){return el('text',{x,y,class:cls,'text-anchor':anchor},t,parent)}
function line(x1,y1,x2,y2,attrs={},parent=svg){return el('line',{x1,y1,x2,y2,stroke:'var(--ink)','stroke-width':2,...attrs},undefined,parent)}
function dot(x,y,r,attrs={},parent=svg){return el('circle',{cx:x,cy:y,r,...attrs},undefined,parent)}
function clear(){const active=document.activeElement?.getAttribute('data-control');svg.replaceChildren();svg.dataset.restoreFocus=active||'';}
function endDraw(){const id=svg.dataset.restoreFocus;if(id)svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true});}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function handle(id,x,y,config){const g=el('g',{'data-control':id,class:'model-control',tabindex:0,role:'slider','aria-label':config.label,'aria-valuemin':config.min,'aria-valuemax':config.max,'aria-valuenow':config.value,'aria-valuetext':config.valueText??`${fmt(config.value,2)}`});dot(x,y,24,{fill:'transparent'},g);dot(x,y,12,{class:'handle'},g);dot(x,y,3,{fill:'var(--lab-accent)'},g);g.onpointerdown=e=>{e.preventDefault();drag={id,config,offset:config.value-config.fromPoint(point(e))};svg.setPointerCapture(e.pointerId);g.focus({preventScroll:true});};g.onkeydown=e=>{let v=config.value;if(['ArrowLeft','ArrowDown'].includes(e.key))v-=config.increment||.1;else if(['ArrowRight','ArrowUp'].includes(e.key))v+=config.increment||.1;else if(e.key==='Home')v=config.min;else if(e.key==='End')v=config.max;else return;e.preventDefault();config.set(clamp(v,config.min,config.max));};return g}
svg.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();drag.config.set(clamp(drag.config.fromPoint(point(e))+drag.offset,drag.config.min,drag.config.max))});
svg.addEventListener('pointerup',e=>{if(!drag)return;const id=drag.id;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true})});
svg.addEventListener('pointercancel',()=>{drag=null});
function feedback(message,ok=false,retry=false){$('feedback').textContent=message;$('feedback').className='feedback'+(ok?' good':retry?' retry':'');ready=ok;$('next').disabled=!ready}
function head(title,intro){$('title').textContent=title;$('intro').textContent=intro;LabDesign.checkpoints($('checkpoints'),lesson.map(x=>x.label),step,i=>i<step);$('back').disabled=step===0;$('next').hidden=step===lesson.length-1;$('next').textContent=step===lesson.length-2?'Open experiment':'Continue';svg.setAttribute('aria-label',title+' '+intro)}

function go(n){step=clamp(n,0,lesson.length-1);maxStep=Math.max(maxStep,step);$('controls').replaceChildren();$('records').innerHTML='';$('records').hidden=true;ready=false;enter();resize();$('title').focus({preventScroll:true})}
$('next').onclick=()=>{if(ready)go(step+1)};$('back').onclick=()=>go(step-1);$('restart').onclick=()=>{maxStep=0;reset();go(0)};
function button(label,fn,attrs={}){const b=document.createElement('button');b.type='button';b.className='lab-action';b.textContent=label;for(const[k,v]of Object.entries(attrs))b.setAttribute(k,v);b.classList.add('lab-action');b.onclick=fn;$('controls').appendChild(b);return b}
function table(headers,rows){$('records').hidden=!rows.length;$('records').innerHTML=`<thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>`}
function resize(){const b=$('stageWrap').getBoundingClientRect();W=b.width;mobile=W<600;H=typeof sceneHeight==='function'?sceneHeight(W):(mobile?400:360);if(b.height!==H)$('stageWrap').style.height=H+'px';svg.setAttribute('viewBox',`0 0 ${W} ${H}`);render()}
function start(){reset();enter();new ResizeObserver(resize).observe($('stageWrap'));resize()}
