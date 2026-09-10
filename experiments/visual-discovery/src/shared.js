// Small DOM and lesson helpers. Each model owns its state and completion conditions.
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=(x,d=1)=>Number(x.toFixed(d)).toString();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let W=900,H=420,mobile=false,step=0,maxStep=0,ready=false,drag=null;
// Session-only snapshots: inspecting an earlier result must not rerun the experiment.
const checkpointSnapshots=new Map();
let hintSteps=[];
const validNumber=value=>String(value).trim()!==''&&Number.isFinite(Number(value));

const svg=$('stage');
function el(tag,attrs={},text,parent=svg){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;parent.appendChild(n);return n}
function text(x,y,t,cls='',anchor='start',parent=svg){return el('text',{x,y,class:cls,'text-anchor':anchor},t,parent)}
function line(x1,y1,x2,y2,attrs={},parent=svg){return el('line',{x1,y1,x2,y2,stroke:'var(--ink)','stroke-width':2,...attrs},undefined,parent)}
function dot(x,y,r,attrs={},parent=svg){return el('circle',{cx:x,cy:y,r,...attrs},undefined,parent)}
function clear(){const active=document.activeElement?.getAttribute('data-control'),source=document.activeElement?.getAttribute('data-source');svg.dataset.restoreSource=source||'';svg.replaceChildren();svg.dataset.restoreFocus=active||'';}
function endDraw(){const id=svg.dataset.restoreFocus,key=svg.dataset.restoreSource;if(id)svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true});else if(key)svg.querySelector(`[data-source="${key}"]`)?.focus({preventScroll:true});updateConnections();syncHint();}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function handle(id,x,y,config){const g=el('g',{'data-control':id,class:'model-control',tabindex:0,role:'slider','aria-label':config.label,'aria-valuemin':config.min,'aria-valuemax':config.max,'aria-valuenow':config.value,'aria-valuetext':config.valueText??`${fmt(config.value,2)}`});g.dataset.help=config.help||config.label+'. Drag this control, or use the arrow keys to change its value.';dot(x,y,24,{fill:'transparent'},g);dot(x,y,12,{class:'handle'},g);dot(x,y,3,{fill:'var(--lab-accent)'},g);g.onpointerdown=e=>{e.preventDefault();drag={id,config,offset:config.value-config.fromPoint(point(e))};svg.setPointerCapture(e.pointerId);g.focus({preventScroll:true});};g.onkeydown=e=>{let v=config.value;if(['ArrowLeft','ArrowDown'].includes(e.key))v-=config.increment||.1;else if(['ArrowRight','ArrowUp'].includes(e.key))v+=config.increment||.1;else if(e.key==='Home')v=config.min;else if(e.key==='End')v=config.max;else return;e.preventDefault();config.set(clamp(v,config.min,config.max));};return g}
svg.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();drag.config.set(clamp(drag.config.fromPoint(point(e))+drag.offset,drag.config.min,drag.config.max))});
svg.addEventListener('pointerup',e=>{if(!drag)return;const id=drag.id;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);svg.querySelector(`[data-control="${id}"]`)?.focus({preventScroll:true})});
svg.addEventListener('pointercancel',()=>{drag=null});
function feedback(message,ok=false,retry=false){
 $('feedback').textContent=message;
 $('feedback').className='feedback'+(ok?' good':retry?' retry':'');
 ready=ok;
 $('next').disabled=!ok&&step>=maxStep;
 scheduleOutcome();
}
function head(title,intro){
 $('title').textContent=title;$('intro').textContent=intro;
 if($('checkpoints').dataset.step!==String(step)){
  LabDesign.checkpoints($('checkpoints'),lesson.map(x=>x.label),step,i=>i<maxStep);
  $('checkpoints').dataset.step=step;
 }
 $('back').disabled=step===0;
 $('next').hidden=step===lesson.length-1;
 $('next').textContent=step<maxStep?'Forward':step===lesson.length-2?'Open experiment':'Continue';
 svg.setAttribute('aria-label',title+' '+intro);
}
function checkpointState(){
 s.helpOpen=$('evidenceHelp').open;
 return {state:structuredClone(s),extras:typeof snapshotExtras==='function'?snapshotExtras():null};
}
function restoreCheckpoint(saved){
 for(const key of Object.keys(s))delete s[key];
 Object.assign(s,structuredClone(saved.state));
 if(typeof restoreExtras==='function')restoreExtras(structuredClone(saved.extras));
 restoreView();
}
function go(n,restart=false,repeat=false){
 if(checkpointBusy)return;
 if(!restart&&(s.busy||s.phase==='offspring'))return;
 if(!restart&&!repeat)checkpointSnapshots.set(step,checkpointState());
 if(typeof stopModel==='function')stopModel();
 return changeCheckpoint(()=>{
  if(restart){checkpointSnapshots.clear();maxStep=0;step=0;reset();}
  step=clamp(n,0,lesson.length-1);
  if(repeat)checkpointSnapshots.delete(step);
  maxStep=Math.max(maxStep,step);
  $('controls').replaceChildren();$('context').replaceChildren();
  $('working').hidden=true;$('records').replaceChildren();$('records').hidden=true;
  $('comparisonNote').hidden=true;$('evidenceHelp').hidden=true;
  hintSteps=[];ready=false;drag=null;
  const saved=checkpointSnapshots.get(step);
  if(saved)restoreCheckpoint(saved);else{s.helpLevel=0;s.helpOpen=false;enter();}
  resize(true);
 });
}
$('next').onclick=()=>{if(ready||step<maxStep)go(step+1)};
$('back').onclick=()=>go(step-1);
$('restart').onclick=()=>go(0,true);
$('repeat').onclick=()=>go(step,false,true);

// Help is learner-requested. It points to evidence before offering another worked case.
function setHelp(steps){
 hintSteps=steps;
 const help=$('evidenceHelp');help.hidden=!steps.length;help.open=!!s.helpOpen;
 help.ontoggle=()=>{s.helpOpen=help.open;syncHint();};
 $('anotherHint').onclick=()=>{s.helpLevel=Math.min((s.helpLevel||0)+1,steps.length-1);syncHint();};
 syncHint();
}
function syncHint(){
 document.querySelectorAll('.evidence-cue').forEach(node=>node.classList.remove('evidence-cue'));
 if(!hintSteps.length||!$('evidenceHelp').open)return;
 const value=hintSteps[Math.min(s.helpLevel||0,hintSteps.length-1)];
 const hint=typeof value==='function'?value():value;
 $('hintText').textContent=typeof hint==='string'?hint:hint.text;
 $('anotherHint').hidden=(s.helpLevel||0)>=hintSteps.length-1;
 for(const key of hint.keys||[]){
  document.querySelectorAll(`[data-source="${key}"]`).forEach(node=>node.classList.add('evidence-cue'));
 }
}
function rememberReading(reading){
 s.records.push(structuredClone(reading));
 if(s.records.length>6){s.records.shift();s.comparison=s.comparison>0?s.comparison-1:null;}
 if(s.comparison==null)s.comparison=s.records.length-1;
}
function clearReadings(){s.records=[];s.comparison=null;render();}
function comparisonDescription(before,after){
 const changed=Object.keys(after).filter(key=>String(before[key])!==String(after[key]));
 return changed.length?'Changed: '+changed.map(key=>`${key} ${before[key]} → ${after[key]}`).join('; ')+'.':'Same conditions. Change one quantity to compare its consequence.';
}
function comparisonNote(message){const node=$('comparisonNote');node.hidden=!message;node.textContent=message;}
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
function table(headers,rows,compare=false){
 const node=$('records');node.hidden=!rows.length;
 if(!rows.length){comparisonNote('');return;}
 const cells=compare?['Compare',...headers]:headers;
 node.innerHTML=`<thead><tr>${cells.map(x=>`<th scope="col">${escapeHtml(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((row,i)=>`<tr${compare&&s.comparison===i?' class="selected-reading"':''}>${compare?`<td><button type="button" class="reading-choice" data-reading="${i}" aria-label="Compare reading ${i+1}" aria-pressed="${s.comparison===i}">${i+1}</button></td>`:''}${row.map(x=>`<td>${escapeHtml(x)}</td>`).join('')}</tr>`).join('')}</tbody>`;
 if(compare)node.querySelectorAll('[data-reading]').forEach(b=>b.onclick=()=>{
  const index=Number(b.dataset.reading);s.comparison=s.comparison===index?null:index;render();
  $('records').querySelector(`[data-reading="${index}"]`)?.focus({preventScroll:true});
 });
}
function resize(force=false){if(checkpointBusy&&!force)return;const b=$('stageWrap').getBoundingClientRect();W=b.width;mobile=W<600;H=typeof sceneHeight==='function'?sceneHeight(W):(mobile?400:360);if(b.height!==H)$('stageWrap').style.height=H+'px';svg.setAttribute('viewBox',`0 0 ${W} ${H}`);render()}
function start(){reset();enter();new ResizeObserver(([entry])=>{if(Math.abs(entry.contentRect.width-W)>.5)resize()}).observe($('stageWrap'));resize()}
