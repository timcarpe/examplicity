// Teaching links use explicit quantity keys, never a search for matching numbers.
const explanations=new Map();
const connectionLayer=document.createElement('div');connectionLayer.id='connectionLayer';connectionLayer.setAttribute('aria-hidden','true');document.body.appendChild(connectionLayer);
const helpTip=document.createElement('div');helpTip.id='helpTip';helpTip.className='lab-value-tooltip';helpTip.role='tooltip';helpTip.hidden=true;document.body.appendChild(helpTip);
let cueVersion=0,cueSignature='',helpTimer=0,helpOwner=null,outcomeQueued=false,shownOutcome='',arrivalAnimations=[],checkpointBusy=false,checkpointAnimations=[],transitionSerial=0;
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function term(key,value){return `<span class="linked-term" data-value-ref="${key}" tabindex="0">${escapeHtml(value)}</span>`}
function result(key,value,description){explanations.set(key,description);return `<span class="lab-math-surface" data-result data-source="${key}" data-link="${key}" data-help="${escapeHtml(description)}" tabindex="0">${escapeHtml(value)}</span>`}
function explain(node,description,key=''){node.dataset.help=description;if(key)node.dataset.link=key;return node}
function sourceLabel(key,x,y,label,description,cls='small',anchor='start'){
 const g=el('g',{'data-source':key,'data-link':key,tabindex:0,role:'button','aria-label':label+'. '+description,class:'value-source'});
 const t=text(x,y,label,cls,anchor,g),b=t.getBBox();
 const hit=el('rect',{x:b.x-6,y:b.y-7,width:b.width+12,height:b.height+14,rx:5,class:'source-hit'},undefined,g);g.insertBefore(hit,t);
 line(b.x,b.y+b.height+3,b.x+b.width,b.y+b.height+3,{class:'source-underline'},g);
 explanations.set(key,description);explain(g,description,key);return g;
}
function workFormula(id,html){const node=$(id);if(node&&node.innerHTML!==html)node.innerHTML=html}
function workingExplanation(description){const area=$('working');area.dataset.help=description;area.tabIndex=0;area.setAttribute('aria-label',description);}
function linkedSources(key){return [...document.querySelectorAll(`[data-source="${key}"]`)].filter(node=>node.getClientRects().length&&(!('value' in node)||node.value!==''))}
function linkedTerms(key){return [...document.querySelectorAll(`[data-value-ref="${key}"]`)].filter(node=>node.getClientRects().length)}
function linkPairs(){return [...new Set([...$('working').querySelectorAll('[data-value-ref]')].map(node=>node.dataset.valueRef))].flatMap(key=>{const source=linkedSources(key)[0],targets=linkedTerms(key);return source&&targets.length?[{key,source,targets}]:[]})}
function stopConnections(){cueVersion++;connectionLayer.replaceChildren();delete connectionLayer.dataset.active;document.querySelectorAll('.value-arrived').forEach(n=>n.classList.remove('value-arrived'));}
function visibleRect(node){const r=node.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth?r:null}
function halo(node,kind){const r=visibleRect(node);if(!r)return null;const box=document.createElement('span');box.className='connection-halo '+kind;Object.assign(box.style,{left:r.x-5+'px',top:r.y-5+'px',width:r.width+10+'px',height:r.height+10+'px'});connectionLayer.appendChild(box);return box;}
const pauseCue=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function tracePair(pair,version){
 if(version!==cueVersion||!pair.source.isConnected)return;
 connectionLayer.dataset.active=pair.key;
 const a=visibleRect(pair.source),target=pair.targets[0],b=visibleRect(target),sourceHalo=halo(pair.source,'source');
 if(reduced.matches){pair.targets.forEach(node=>halo(node,'destination'));await pauseCue(750);return}
 sourceHalo?.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'},{opacity:1}],{duration:240,fill:'forwards'});
 await pauseCue(220);if(version!==cueVersion)return;
 if(a&&b){
  const token=document.createElement('span');token.className='travelling-value';token.textContent=target.textContent;connectionLayer.appendChild(token);
  const x1=a.x+a.width/2,y1=a.y+a.height/2,x2=b.x+b.width/2,y2=b.y+b.height/2;
  const bend=Math.min(45,Math.abs(y2-y1)*.15),frames=[0,.25,.5,.75,1].map((t,i)=>({transform:`translate(${x1+(x2-x1)*t+bend*Math.sin(Math.PI*t)}px,${y1+(y2-y1)*t}px) translate(-50%,-50%)`,opacity:i===0||i===4?0:1}));
  await token.animate(frames,{duration:560,easing:'cubic-bezier(.22,.68,.3,1)',fill:'forwards'}).finished.catch(()=>{});token.remove();
 }
 if(version!==cueVersion)return;
 pair.targets.forEach(node=>{halo(node,'destination')?.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:180,fill:'forwards'});node.classList.add('value-arrived')});
 await pauseCue(330);
}
async function traceValues(){
 stopConnections();const version=cueVersion,pairs=linkPairs();
 for(const pair of pairs){await tracePair(pair,version);if(version!==cueVersion)return;connectionLayer.replaceChildren();document.querySelectorAll('.value-arrived').forEach(n=>n.classList.remove('value-arrived'))}
 delete connectionLayer.dataset.active;
 if(!reduced.matches&&pairs.length){$('working').querySelectorAll('[data-result]').forEach(node=>node.animate([{backgroundColor:'var(--lab-accent-soft)'},{backgroundColor:'transparent'}],{duration:600}))}
}
function updateConnections(){
 if(helpOwner&&!helpOwner.isConnected)hideHelp();
 const pairs=$('working').hidden?[]:linkPairs();
 const replay=$('traceWorking');if(replay){replay.hidden=!pairs.length;replay.onclick=()=>{hideHelp();traceValues()}}
 document.querySelectorAll('[data-value-ref]').forEach(node=>{const key=node.dataset.valueRef;node.dataset.help=explanations.get(key)||'This value is taken from the labelled model.';node.dataset.link=key;node.setAttribute('aria-label',node.textContent+'. '+node.dataset.help)});
 const signature=step+'|'+pairs.map(({key,source,targets})=>key+':'+(source.value??source.textContent)+'='+targets.map(n=>n.textContent).join(',')).join('|');
 if(signature!==cueSignature){cueSignature=signature;stopConnections()}
}
function clearLinkedFocus(){document.querySelectorAll('.linked-focus').forEach(node=>node.classList.remove('linked-focus'))}
function hideHelp(){clearTimeout(helpTimer);helpTip.hidden=true;helpOwner?.removeAttribute('aria-describedby');helpOwner=null;clearLinkedFocus()}
function showHelp(owner){
 const description=owner.dataset.help;if(!description||!owner.isConnected)return;
 hideHelp();helpOwner=owner;helpTip.textContent=description;helpTip.hidden=false;owner.setAttribute('aria-describedby','helpTip');
 const r=owner.getBoundingClientRect(),b=helpTip.getBoundingClientRect(),top=r.bottom+b.height+12<innerHeight?r.bottom+9:Math.max(8,r.top-b.height-9);
 helpTip.style.left=clamp(r.x+r.width/2-b.width/2,8,innerWidth-b.width-8)+'px';helpTip.style.top=top+'px';
 const key=owner.dataset.link;if(key)[...linkedSources(key),...linkedTerms(key)].forEach(node=>node.classList.add('linked-focus'));
}
document.addEventListener('pointerover',e=>{if(e.pointerType==='touch'||drag)return;const node=e.target.closest('[data-help]');if(!node||node===helpOwner)return;clearTimeout(helpTimer);helpTimer=setTimeout(()=>showHelp(node),200)});
document.addEventListener('pointerout',e=>{if(e.relatedTarget&&((helpOwner?.contains(e.relatedTarget))||helpTip.contains(e.relatedTarget)))return;if(e.target.closest('[data-help]')){clearTimeout(helpTimer);helpTimer=setTimeout(hideHelp,100)}});
helpTip.onpointerenter=()=>clearTimeout(helpTimer);helpTip.onpointerleave=hideHelp;
document.addEventListener('focusin',e=>{const node=e.target.closest('[data-help]');if(node)showHelp(node)});
document.addEventListener('focusout',e=>{if(!helpTip.contains(e.relatedTarget))hideHelp()});
document.addEventListener('pointerdown',e=>{if(e.target.closest('#traceWorking'))return;stopConnections();if(!e.target.closest('[data-help],#helpTip'))hideHelp();if(e.target.closest('#stage,#working'))$('working').dataset.interacted='true'});
document.addEventListener('click',e=>{const node=e.target.closest('[data-source],[data-value-ref]');if(node&&!e.target.closest('input,select'))showHelp(node)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideHelp();stopConnections()}else if(['Enter',' '].includes(e.key)&&e.target.matches('[data-source],[data-value-ref]')){e.preventDefault();showHelp(e.target)}});
document.addEventListener('input',()=>{stopConnections();hideHelp()});
window.addEventListener('scroll',()=>{stopConnections();hideHelp()},{passive:true});window.addEventListener('resize',()=>{stopConnections();hideHelp()});
reduced.addEventListener('change',()=>{stopConnections();[...arrivalAnimations,...checkpointAnimations].forEach(a=>a.cancel())});
function arrive(nodes){if(reduced.matches||checkpointBusy)return;arrivalAnimations.forEach(a=>a.cancel());arrivalAnimations=nodes.filter(Boolean).map(node=>node.animate([{opacity:0},{opacity:1}],{duration:240,easing:'ease-out'}));}
// Compare rendered parts, keeping identical apparatus and controls fully visible.
function visualKey(node){const copy=node.cloneNode(true);for(const n of [copy,...copy.querySelectorAll('*')]){for(const a of [...n.attributes])if(a.name.startsWith('aria-')||['tabindex','role','data-help','data-link','data-source','data-value-ref','data-control'].includes(a.name))n.removeAttribute(a.name);n.classList.remove('linked-focus','value-arrived');if(!n.classList.length)n.removeAttribute('class')}return copy.outerHTML}
function transitionCopy(node){const copy=node.cloneNode(true),prefix='checkpoint-old-'+(++transitionSerial)+'-',ids=new Map();for(const n of [copy,...copy.querySelectorAll('*')])if(n.id){ids.set(n.id,prefix+n.id);n.id=prefix+n.id}for(const n of [copy,...copy.querySelectorAll('*')]){for(const name of ['data-source','data-value-ref','data-link','data-control','aria-live'])n.removeAttribute(name);n.removeAttribute('tabindex');for(const a of [...n.attributes]){let value=a.value.replace(/url\(#([^)]+)\)/g,(m,id)=>ids.has(id)?'url(#'+ids.get(id)+')':m);if(a.name==='href'&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));if(value!==a.value)n.setAttribute(a.name,value)}n.style.animation='none'}copy.setAttribute('aria-hidden','true');copy.style.pointerEvents='none';return copy}
function partSnapshot(node){const visible=!!node.getClientRects().length,style=getComputedStyle(node);return{node,visible,key:visible?visualKey(node):'',copy:visible?transitionCopy(node):null,height:visible?node.getBoundingClientRect().height:0,style:{width:style.width,maxWidth:style.maxWidth,marginTop:visible?style.marginTop:'0px',marginBottom:visible?style.marginBottom:'0px',marginLeft:style.marginLeft,marginRight:style.marginRight,gridArea:style.gridArea,flex:style.flex}}}
async function changeCheckpoint(update){
 if(checkpointBusy)return;checkpointBusy=true;hideHelp();stopConnections();arrivalAnimations.forEach(a=>a.cancel());
 const lab=document.querySelector('.lab'),stage=$('stageWrap'),parts=['.mission-copy','#context','#working','#controls','#records','#outcome'].map(selector=>partSnapshot(document.querySelector(selector))),oldModel=svg.cloneNode(true),oldHeight=stage.getBoundingClientRect().height;
 const cleanups=[],outgoing=[],incoming=[],sizes=[];lab.inert=true;lab.setAttribute('aria-busy','true');
 const animate=(node,frames,duration)=>{const a=node.animate(frames,{duration,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'});checkpointAnimations.push(a);return a.finished.catch(()=>{})};
 try{
  update();await Promise.resolve();
  if(reduced.matches){window.scrollTo({top:0,behavior:'instant'});return}
  for(const before of parts){
   const node=before.node,after=partSnapshot(node);if(before.key===after.key)continue;
   const hidden=node.hidden,originalStyle=node.getAttribute('style'),shell=document.createElement('div'),layout=after.visible?after.style:before.style;
   shell.className='checkpoint-part';Object.assign(shell.style,layout,{height:before.height+'px',marginTop:before.style.marginTop,marginBottom:before.style.marginBottom});
   node.replaceWith(shell);shell.appendChild(node);node.hidden=false;Object.assign(node.style,{position:'absolute',inset:'0 auto auto 0',width:'100%',margin:'0',opacity:'0'});
   if(before.copy){Object.assign(before.copy.style,{position:'absolute',inset:'0 auto auto 0',width:'100%',margin:'0'});shell.appendChild(before.copy);outgoing.push(before.copy)}
   if(after.visible)incoming.push({node,opacity:1});sizes.push({node:shell,from:{height:before.height+'px',marginTop:before.style.marginTop,marginBottom:before.style.marginBottom},to:{height:after.height+'px',marginTop:after.style.marginTop,marginBottom:after.style.marginBottom}});
   cleanups.push(()=>{shell.replaceWith(node);node.hidden=hidden;if(originalStyle===null)node.removeAttribute('style');else node.setAttribute('style',originalStyle)});
  }
  const oldNodes=[...oldModel.children],oldKeys=oldNodes.map(visualKey),matched=new Set();
  for(const node of [...svg.children]){if(node.tagName.toLowerCase()==='defs')continue;const key=visualKey(node),index=oldNodes.findIndex((old,i)=>!matched.has(i)&&oldKeys[i]===key);
   if(index>=0){matched.add(index);node.getAnimations({subtree:true}).forEach(a=>a.cancel());continue}
   const style=node.getAttribute('style'),opacity=getComputedStyle(node).opacity;node.style.opacity='0';incoming.push({node,opacity});cleanups.push(()=>{if(style===null)node.removeAttribute('style');else node.setAttribute('style',style)});
  }
  oldNodes.forEach((node,i)=>{if(matched.has(i))node.remove()});
  if([...oldModel.children].some(node=>node.tagName.toLowerCase()!=='defs')){const oldLayer=transitionCopy(oldModel);oldLayer.classList.add('checkpoint-model');Object.assign(oldLayer.style,{height:oldHeight+'px'});stage.appendChild(oldLayer);outgoing.push(oldLayer);cleanups.push(()=>oldLayer.remove())}
  const newHeight=stage.getBoundingClientRect().height,svgHeight=svg.style.height;svg.style.height=newHeight+'px';stage.style.height=oldHeight+'px';sizes.push({node:stage,from:{height:oldHeight+'px'},to:{height:newHeight+'px'}});cleanups.push(()=>{stage.style.height=newHeight+'px';svg.style.height=svgHeight});
  lab.dataset.checkpointTransition='leaving';window.scrollTo({top:0,behavior:'smooth'});await Promise.all(outgoing.map(node=>animate(node,[{opacity:1},{opacity:0}],150)));
  outgoing.forEach(node=>node.remove());if(reduced.matches)return;
  lab.dataset.checkpointTransition='entering';await Promise.all([...incoming.map(({node,opacity})=>animate(node,[{opacity:0},{opacity}],300)),...sizes.map(({node,from,to})=>animate(node,[from,to],300))]);
 }finally{
  checkpointAnimations.forEach(a=>a.cancel());checkpointAnimations=[];cleanups.forEach(fn=>fn());delete lab.dataset.checkpointTransition;lab.inert=false;lab.removeAttribute('aria-busy');checkpointBusy=false;
  if(Math.abs(stage.getBoundingClientRect().width-W)>.5)resize();$('title').focus({preventScroll:true});
 }
}
function scheduleOutcome(){if(outcomeQueued)return;outcomeQueued=true;queueMicrotask(()=>{
 outcomeQueued=false;const outcome=$('outcome'),state=ready?'good':$('feedback').classList.contains('retry')?'retry':'idle',key=step+':'+state;
 outcome.dataset.state=state;$('outcomeTitle').hidden=state==='idle';$('outcomeTitle').textContent=state==='good'?lesson[step].success||'You have completed this investigation.':state==='retry'?'Let’s check that again.':'';
 if(key!==shownOutcome){shownOutcome=key;if(state!=='idle')arrive([outcome])}
 });}
