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
function clear(){const active=document.activeElement?.getAttribute('data-control'),source=document.activeElement?.getAttribute('data-source');svg.dataset.restoreSource=source||'';svg.replaceChildren();svg.dataset.restoreFocus=active||'';}
function endDraw(){const id=svg.dataset.restoreFocus,key=svg.dataset.restoreSource;if(id)svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true});else if(key)svg.querySelector(`[data-source="${key}"]`)?.focus({preventScroll:true});updateConnections();}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function handle(id,x,y,config){const g=el('g',{'data-control':id,class:'model-control',tabindex:0,role:'slider','aria-label':config.label,'aria-valuemin':config.min,'aria-valuemax':config.max,'aria-valuenow':config.value,'aria-valuetext':config.valueText??`${fmt(config.value,2)}`});g.dataset.help=config.help||config.label+'. Drag this control, or use the arrow keys to change its value.';dot(x,y,24,{fill:'transparent'},g);dot(x,y,12,{class:'handle'},g);dot(x,y,3,{fill:'var(--lab-accent)'},g);g.onpointerdown=e=>{e.preventDefault();drag={id,config,offset:config.value-config.fromPoint(point(e))};svg.setPointerCapture(e.pointerId);g.focus({preventScroll:true});};g.onkeydown=e=>{let v=config.value;if(['ArrowLeft','ArrowDown'].includes(e.key))v-=config.increment||.1;else if(['ArrowRight','ArrowUp'].includes(e.key))v+=config.increment||.1;else if(e.key==='Home')v=config.min;else if(e.key==='End')v=config.max;else return;e.preventDefault();config.set(clamp(v,config.min,config.max));};return g}
svg.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();drag.config.set(clamp(drag.config.fromPoint(point(e))+drag.offset,drag.config.min,drag.config.max))});
svg.addEventListener('pointerup',e=>{if(!drag)return;const id=drag.id;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true})});
svg.addEventListener('pointercancel',()=>{drag=null});
function feedback(message,ok=false,retry=false){$('feedback').textContent=message;$('feedback').className='feedback'+(ok?' good':retry?' retry':'');ready=ok;$('next').disabled=!ready;scheduleOutcome()}
function head(title,intro){$('title').textContent=title;$('intro').textContent=intro;if($('checkpoints').dataset.step!==String(step)){LabDesign.checkpoints($('checkpoints'),lesson.map(x=>x.label),step,i=>i<step);$('checkpoints').dataset.step=step}$('back').disabled=step===0;$('next').hidden=step===lesson.length-1;$('next').textContent=step===lesson.length-2?'Open experiment':'Continue';svg.setAttribute('aria-label',title+' '+intro)}

function go(n,restart=false){return changeCheckpoint(()=>{if(restart){maxStep=0;reset()}step=clamp(n,0,lesson.length-1);maxStep=Math.max(maxStep,step);$('controls').replaceChildren();$('context').replaceChildren();$('working').hidden=true;$('records').innerHTML='';$('records').hidden=true;ready=false;enter();resize(true)})}
$('next').onclick=()=>{if(ready)go(step+1)};$('back').onclick=()=>go(step-1);$('restart').onclick=()=>go(0,true);
function button(label,fn,attrs={}){const b=document.createElement('button');b.type='button';b.className='lab-action';b.textContent=label;for(const[k,v]of Object.entries(attrs))b.setAttribute(k,v);b.classList.add('lab-action');b.onclick=fn;$('controls').appendChild(b);return b}
function workRow(label,expression){return `<div class="work-step"><span class="work-label">${label}</span><div class="work-expression">${expression}</div></div>`}
function workOutput(id){return `<output class="lab-math-surface" id="${id}"></output>`}
function workSetup(title,body,note='',required=false){
 const area=$('working');area.hidden=false;area.dataset.workState=required?'needed':'reference';area.dataset.interacted='false';
 area.innerHTML=`<div class="work-heading"><h2>${title}</h2><button type="button" class="lab-action trace-button" id="traceWorking" data-help="Follow each value from the model into its place in the calculation." aria-label="Trace values from model to calculation"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="5" r="2.5"/><path d="M4 7.5v4a4 4 0 0 0 4 4h8m-3-3 3 3-3 3"/></svg>Trace values</button></div><div class="work-steps">${body}</div><p class="work-note" id="workNote">${note}</p><div class="work-actions" id="workActions"></div>`;
 area.oninput=area.onpointerdown=()=>{area.dataset.interacted='true'};
}
function workValue(id,value){const node=$(id);if(!node||node.textContent===String(value))return;node.textContent=value}
function workState(state){$('working').dataset.workState=state}
function workAction(label,fn){const b=button(label,fn,{'data-priority':'primary'});$('workActions').appendChild(b);return b}
function table(headers,rows){$('records').hidden=!rows.length;$('records').innerHTML=`<thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>`}
function resize(force=false){if(checkpointBusy&&!force)return;const b=$('stageWrap').getBoundingClientRect();W=b.width;mobile=W<600;H=typeof sceneHeight==='function'?sceneHeight(W):(mobile?400:360);if(b.height!==H)$('stageWrap').style.height=H+'px';svg.setAttribute('viewBox',`0 0 ${W} ${H}`);render()}
function start(){reset();enter();new ResizeObserver(([entry])=>{if(Math.abs(entry.contentRect.width-W)>.5)resize()}).observe($('stageWrap'));resize()}
