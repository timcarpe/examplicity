// Small DOM and lesson helpers. Each model owns its state and completion conditions.
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=(x,d=1)=>Number(x.toFixed(d)).toString();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let W=900,H=420,mobile=false,step=0,maxStep=0,ready=false,drag=null;
// Session-only snapshots: inspecting an earlier result must not rerun the experiment.
const checkpointSnapshots=new Map();
let hintSteps=[];
let activeDockSource=null,secondaryDockSource=null,announcementTimer=0,outcomeHeading='';
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
function feedback(message,ok=false,retry=false,heading=''){
 outcomeHeading=heading;
 if($('feedback').textContent!==message)$('feedback').textContent=message;
 $('feedback').className='feedback'+(ok?' good':retry?' retry':'');
 ready=ok;
 $('next').disabled=!ok&&step>=maxStep;
 scheduleOutcome();
}
function head(title,intro){
 $('title').textContent=title;$('intro').textContent=intro;
 $('stepLabel').textContent=step===lesson.length-1?'Experiment':`Step ${step+1} of ${lesson.length-1} · ${lesson[step].label}`;
 if($('checkpoints').dataset.step!==String(step)){
  LabDesign.checkpoints($('checkpoints'),lesson.slice(0,-1).map(x=>x.label),step===lesson.length-1?-1:step,i=>i<maxStep);
  $('checkpoints').dataset.step=step;
 }
 $('back').disabled=step===0;
 $('next').hidden=step===lesson.length-1;
 $('next').textContent=step<maxStep?'Forward':step===lesson.length-2?'Open experiment':'Continue';
 svg.setAttribute('aria-label',title+' '+intro);
}
function checkpointState(){
 s.helpOpen=!$('evidenceHelp').hidden;
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
  $('working').hidden=true;$('working').replaceChildren();$('records').replaceChildren();$('records').hidden=true;
  $('comparisonNote').hidden=true;$('evidenceHelp').hidden=true;
  hintSteps=[];ready=false;drag=null;
  const saved=checkpointSnapshots.get(step);
  if(saved)restoreCheckpoint(saved);else{s.helpLevel=0;s.helpOpen=false;enter();}
  resize(true);
 });
}
$('next').onclick=e=>{
 if(e.detail>1||checkpointBusy||s.busy||s.phase==='offspring')return;
 if(activeDockSource)runDockAction(activeDockSource,e);
 else if(ready||step<maxStep)go(step+1);
};
$('forwardVisited').onclick=e=>{if(e.detail<=1&&step<maxStep)go(step+1)};
$('back').onclick=()=>go(step-1);
// Restart is a native disclosure, not an application menu or a learner-work modal.
function resetChoicesView(){
 $('resetChoices').hidden=false;$('resetConfirmation').hidden=true;
}
function closeReset(restoreFocus=false){
 $('resetMenu').open=false;resetChoicesView();
 if(restoreFocus)$('resetMenu').querySelector('summary').focus({preventScroll:true});
}
$('resetMenu').addEventListener('toggle',()=>{if(!$('resetMenu').open)resetChoicesView();});
// Wait for the actual next focus target: focusout can temporarily leave body active.
document.addEventListener('focusin',e=>{
 if($('resetMenu').open&&!$('resetMenu').contains(e.target))closeReset(false);
});
$('restart').onclick=e=>{
 if(e.detail>1||checkpointBusy||s.busy||s.phase==='offspring')return;
 $('resetChoices').hidden=true;$('resetConfirmation').hidden=false;
 $('cancelRestart').focus({preventScroll:true});
};
$('cancelRestart').onclick=()=>{resetChoicesView();$('restart').focus({preventScroll:true});};
$('confirmRestart').onclick=e=>{
 if(e.detail>1||checkpointBusy||s.busy||s.phase==='offspring')return;
 closeReset(false);go(0,true);
};
$('repeat').onclick=e=>{
 if(e.detail>1||checkpointBusy||s.busy||s.phase==='offspring')return;
 closeReset(false);go(step,false,true);
};

// One disclosure location. Opening/closing help never shifts the action row above it.
function setHelp(steps){
 hintSteps=steps;
 $('hintToggle').hidden=!steps.length;
 syncHint();
}
function syncHint(){
 document.querySelectorAll('.evidence-cue').forEach(node=>node.classList.remove('evidence-cue'));
 const open=hintSteps.length>0&&!!s.helpOpen;
 $('evidenceHelp').hidden=!open;
 $('hintToggle').setAttribute('aria-expanded',String(open));
 $('hintToggle').textContent=open?'Hide hint':'Hint';
 if(!open)return;
 const level=clamp(s.helpLevel||0,0,hintSteps.length-1),value=hintSteps[level];
 const hint=typeof value==='function'?value():value;
 $('hintTitle').textContent=`${hint.example?'Worked example':'Hint'} ${level+1} of ${hintSteps.length}`;
 const text=typeof hint==='string'?hint:hint.text;
 if($('hintText').textContent!==text)$('hintText').textContent=text;
 $('previousHint').disabled=level===0;
 $('anotherHint').disabled=level>=hintSteps.length-1;
 $('anotherHint').textContent=hintSteps[level+1]?.example?'Show example':'Next hint';
 for(const key of hint.keys||[])document.querySelectorAll(`[data-source="${key}"]`).forEach(node=>node.classList.add('evidence-cue'));
}
$('hintToggle').onclick=()=>{s.helpOpen=!s.helpOpen;syncHint();if(s.helpOpen)requestAnimationFrame(()=>{if(s.helpOpen)$('evidenceHelp').scrollIntoView({block:'nearest',behavior:'instant'});});};
$('previousHint').onclick=()=>{s.helpLevel=Math.max(0,(s.helpLevel||0)-1);syncHint();};
$('anotherHint').onclick=()=>{s.helpLevel=Math.min(hintSteps.length-1,(s.helpLevel||0)+1);syncHint();};
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if($('resetMenu').open){closeReset(true);}
 else if(s.helpOpen&&(e.target.closest('#evidenceHelp')||e.target===$('hintToggle'))){s.helpOpen=false;syncHint();$('hintToggle').focus();}
});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#resetMenu'))closeReset(false);});

// A single, persistent button for Test / Check / Continue. Model calculations and
// completion predicates remain in the subject files; the dock invokes their real callbacks.
function dockSources(){
 return [...document.querySelectorAll('[data-dock-action]')]
  .filter(node=>!node.disabled&&!node.closest('[hidden]'))
  .sort((a,b)=>Number(b.dataset.dockRank||10)-Number(a.dataset.dockRank||10));
}
function syncActionDock(){
 const busy=!!s.busy||s.phase==='offspring',experiment=step===lesson.length-1;
 const sources=dockSources(),next=$('next'),secondary=$('secondaryAction');
 activeDockSource=!ready?sources[0]||null:null;
 secondaryDockSource=sources.find(node=>node!==activeDockSource&&node.dataset.repeatable==='true')||null;
 next.hidden=experiment&&!busy&&!activeDockSource;
 next.disabled=busy||(!activeDockSource&&!ready&&step>=maxStep);
 next.textContent=busy?(s.phase==='offspring'?'Producing offspring…':'Testing…'):activeDockSource?activeDockSource.textContent:step<maxStep?'Forward':step===lesson.length-2?'Open experiment':'Continue';
 secondary.hidden=busy||!secondaryDockSource;
 if(secondaryDockSource)secondary.textContent=secondaryDockSource.textContent;
 $('forwardVisited').hidden=step>=maxStep||!activeDockSource;
 $('forwardVisited').disabled=busy;
 $('back').disabled=busy||step===0;
 $('repeat').disabled=busy;
 $('restart').disabled=busy;$('confirmRestart').disabled=busy;
 $('repeatLabel').textContent=experiment?'Reset experiment':'Repeat this step';
 $('repeat').setAttribute('aria-label',experiment?'Reset experiment':'Repeat this step');
 $('repeatDescription').textContent=experiment?'Clear this experiment; keep guided progress.':'Reset this step only; keep other progress.';
 $('learningDock').setAttribute('aria-busy',String(busy));
 // The same button changes from Test to Continue: focus and pointer position are retained.
}
function runDockAction(source,event){
 if(event.detail>1||checkpointBusy||s.busy||s.phase==='offspring'||!source?.isConnected||source.disabled)return;
 source.click();
}
$('secondaryAction').onclick=e=>runDockAction(secondaryDockSource,e);
function announceOutcome(state){
 clearTimeout(announcementTimer);
 const message=$('outcomeTitle').textContent+'. '+$('feedback').textContent;
 announcementTimer=setTimeout(()=>{
  if($('statusAnnouncement').textContent!==message)$('statusAnnouncement').textContent=message;
 },state==='good'||state==='retry'?0:300);
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
 area.innerHTML=`<div class="work-heading"><h2 id="workingTitle">${title}</h2><button type="button" class="lab-action trace-button" id="traceWorking" data-help="Follow each value from the model into its place in the calculation." aria-label="Trace values from model to calculation"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="5" r="2.5"/><path d="M4 7.5v4a4 4 0 0 0 4 4h8m-3-3 3 3-3 3"/></svg>Trace values</button></div><div class="work-steps">${body}</div><p class="work-note" id="workNote">${note}</p><div class="work-actions" id="workActions"></div>`;
 area.oninput=area.onpointerdown=()=>{area.dataset.interacted='true'};
}
function workValue(id,value){const node=$(id);if(!node||node.textContent===String(value))return;node.textContent=value}
function workState(state){$('working').dataset.workState=state}
function workAction(label,fn,attrs={}){const b=button(label,fn,{'data-dock-action':'true','data-dock-rank':'20',...attrs});$('workActions').appendChild(b);return b}
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
