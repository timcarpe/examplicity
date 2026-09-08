// Teaching links use explicit quantity keys, never a search for matching numbers.
const explanations=new Map();
const connectionLayer=document.createElement('div');connectionLayer.id='connectionLayer';connectionLayer.setAttribute('aria-hidden','true');document.body.appendChild(connectionLayer);
const helpTip=document.createElement('div');helpTip.id='helpTip';helpTip.className='lab-value-tooltip';helpTip.role='tooltip';helpTip.hidden=true;document.body.appendChild(helpTip);
let cueTimer=0,cueVersion=0,cueSignature='',autoCuePending=false,helpTimer=0,helpOwner=null,outcomeQueued=false,shownOutcome='',arrivalAnimations=[];
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
function stopConnections(){clearTimeout(cueTimer);cueVersion++;connectionLayer.replaceChildren();delete connectionLayer.dataset.active;document.querySelectorAll('.value-arrived').forEach(n=>n.classList.remove('value-arrived'));}
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
async function traceValues(key){
 stopConnections();autoCuePending=false;const version=cueVersion,pairs=linkPairs().filter(pair=>!key||pair.key===key);
 for(const pair of pairs){await tracePair(pair,version);if(version!==cueVersion)return;connectionLayer.replaceChildren();document.querySelectorAll('.value-arrived').forEach(n=>n.classList.remove('value-arrived'))}
 delete connectionLayer.dataset.active;
 if(!key&&!reduced.matches&&pairs.length){$('working').querySelectorAll('[data-result]').forEach(node=>node.animate([{backgroundColor:'var(--lab-accent-soft)'},{backgroundColor:'transparent'}],{duration:600}))}
}
function queueAutoTrace(){clearTimeout(cueTimer);if(autoCuePending&&!drag)cueTimer=setTimeout(()=>traceValues(),450)}
function updateConnections(){
 if(helpOwner&&!helpOwner.isConnected)hideHelp();
 const pairs=$('working').hidden?[]:linkPairs();
 const replay=$('traceWorking');if(replay){replay.hidden=!pairs.length;replay.onclick=()=>{hideHelp();traceValues()}}
 document.querySelectorAll('[data-value-ref]').forEach(node=>{const key=node.dataset.valueRef;node.dataset.help=explanations.get(key)||'This value is taken from the labelled model.';node.dataset.link=key;node.setAttribute('aria-label',node.textContent+'. '+node.dataset.help)});
 const signature=step+'|'+pairs.map(({key,source,targets})=>key+':'+(source.value??source.textContent)+'='+targets.map(n=>n.textContent).join(',')).join('|');
 if(signature!==cueSignature){cueSignature=signature;stopConnections();autoCuePending=!!pairs.length;queueAutoTrace()}
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
document.addEventListener('pointerdown',e=>{if(e.target.closest('#traceWorking'))return;stopConnections();autoCuePending=false;if(!e.target.closest('[data-help],#helpTip'))hideHelp();if(e.target.closest('#stage,#working'))$('working').dataset.interacted='true'});
svg.addEventListener('pointerup',queueAutoTrace);
document.addEventListener('click',e=>{const node=e.target.closest('[data-source],[data-value-ref]');if(node&&!e.target.closest('input,select')){showHelp(node);traceValues(node.dataset.link)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideHelp();stopConnections();autoCuePending=false}else if(['Enter',' '].includes(e.key)&&e.target.matches('[data-source],[data-value-ref]')){e.preventDefault();showHelp(e.target);traceValues(e.target.dataset.link)}});
document.addEventListener('input',()=>{stopConnections();hideHelp();queueAutoTrace()});
window.addEventListener('scroll',()=>{stopConnections();hideHelp();queueAutoTrace()},{passive:true});window.addEventListener('resize',()=>{stopConnections();hideHelp();queueAutoTrace()});
reduced.addEventListener('change',()=>{stopConnections();arrivalAnimations.forEach(a=>a.cancel())});
function arrive(nodes){if(reduced.matches)return;arrivalAnimations.forEach(a=>a.cancel());arrivalAnimations=nodes.filter(Boolean).map((node,i)=>node.animate([{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:i*45,easing:'cubic-bezier(.2,.7,.25,1)'}));}
function stageArrival(){hideHelp();stopConnections();arrive([document.querySelector('.mission-copy'),svg,$('working').hidden?null:$('working')]);cueSignature='';updateConnections()}
function scheduleOutcome(){if(outcomeQueued)return;outcomeQueued=true;queueMicrotask(()=>{
 outcomeQueued=false;const outcome=$('outcome'),state=ready?'good':$('feedback').classList.contains('retry')?'retry':'idle',key=step+':'+state;
 outcome.dataset.state=state;$('outcomeTitle').hidden=state==='idle';$('outcomeTitle').textContent=state==='good'?lesson[step].success||'You have completed this investigation.':state==='retry'?'Let’s check that again.':'';
 if(key!==shownOutcome){shownOutcome=key;if(state!=='idle')arrive([outcome]);document.querySelector('.lesson-head').dataset.complete=String(ready)}
 });}
