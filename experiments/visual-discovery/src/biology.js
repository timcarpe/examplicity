const lesson=[
 {
  "label": "Existing variation",
  "title": "See what changes when different food becomes available.",
  "intro": "These adults already have different beak depths. Move the food toward deeper beaks and compare food advantage with the unchanged adult counts.",
  "success": "Food advantage changed; adult beaks did not."
 },
 {
  "label": "Parents, then offspring",
  "title": "Follow the parents into the next generation.",
  "intro": "Food changed which beaks were favoured. Select 24 parents, then watch their 72 offspring replace the adults.",
  "success": "The offspring inherit variation from their parents."
 },
 {
  "label": "One direction",
  "title": "Find out whether the population shifts over several generations.",
  "intro": "One generation showed inheritance. Keep the same food pressure for at least three generations and follow the mean beak depth.",
  "success": "Selection has shifted the population mean."
 },
 {
  "label": "Favour the middle",
  "title": "Compare a food supply that favours middle-sized beaks.",
  "intro": "The last environment favoured deeper beaks. Now favour the middle for at least three generations, then calculate this group’s frequency.",
  "success": "The middle group is more frequent and the spread is narrower."
 },
 {
  "label": "Favour both extremes",
  "title": "Try a food supply that favours both extremes.",
  "intro": "Favouring the middle narrowed the distribution. Split the food between shallow and deep beaks for at least four generations and compare what changes.",
  "success": "Both extremes remain while the middle becomes less common."
 },
 {
  "label": "Experiment",
  "title": "Build an environment and follow its effect across generations.",
  "intro": "Move the food sources, try changing pressure or compare population sizes. Existing adults keep their beaks; the next generation reveals the effect.",
  "success": ""
 }
];
let N=72,COUNT=24;const LO=4,HI=16;
const s={population:[],initial:[],parents:null,pending:null,generation:0,peaks:[{c:10,w:1.4}],history:[],baseline:null,changed:false};
let rng,generationTimer;
s.phase='idle';s.frequency='';s.frequencyChecked=false;s.lineage=[];s.pressure='steady';
function random(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normal(sd){let u=0,v=0;while(!u)u=rng();while(!v)v=rng();return sd*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function stats(pop){const mean=pop.reduce((a,v)=>a+v,0)/pop.length;return{mean,sd:Math.sqrt(pop.reduce((a,v)=>a+(v-mean)**2,0)/pop.length),middle:pop.filter(v=>v>=8.5&&v<=11.5).length/pop.length,left:pop.filter(v=>v<8.2).length/pop.length,right:pop.filter(v=>v>11.8).length/pop.length}}
function initial(){clearTimeout(generationTimer);s.phase='idle';s.frequency='';s.frequencyChecked=false;rng=random(9137);s.population=Array.from({length:N},()=>clamp(10+normal(1.85),4.08,15.92));s.initial=[...s.population];s.generation=0;s.parents=null;s.pending=null;s.baseline=stats(s.population);s.history=[{g:0,...s.baseline}];s.changed=false;if(step===5&&s.pressure==='alternating')s.peaks=[{c:13.2,w:s.peaks[0].w}]}
function reset(){s.peaks=[{c:10,w:1.4}];initial()}
function food(v){if(step===5&&s.pressure==='even')return 1;return s.peaks.reduce((a,p)=>a+Math.exp(-.5*((v-p.c)/p.w)**2),0)}
function fitness(v){let max=.001;for(let x=4;x<=16;x+=.05)max=Math.max(max,food(x));return clamp(food(v)/max,0,1)}
function selectParents(){rng=random(9137+step*100003+s.generation*7919+17);const pool=s.population.map((trait,id)=>({trait,id,w:.2+fitness(trait)**1.4})),parents=[];for(let i=0;i<COUNT;i++){let r=rng()*pool.reduce((a,p)=>a+p.w,0),j=0;for(;j<pool.length-1;j++){r-=pool[j].w;if(r<=0)break}parents.push(pool.splice(j,1)[0])}s.parents=parents;const total=parents.reduce((a,p)=>a+.25+fitness(p.trait)**1.1,0);s.pending=[];s.lineage=[];for(let i=0;i<N;i++){let r=rng()*total,p=parents[0];for(const candidate of parents){r-=.25+fitness(candidate.trait)**1.1;if(r<=0){p=candidate;break}}s.pending.push(clamp(p.trait+normal(.43),4.05,15.95));s.lineage.push(p.id)}}
function reproduce(){if(s.phase!=='idle')return;if(!s.pending)selectParents();s.phase='offspring';s.frequency='';s.frequencyChecked=false;controls();render();if(reduced.matches)commitGeneration();else generationTimer=setTimeout(commitGeneration,1500)}
function commitGeneration(){if(s.phase!=='offspring')return;s.population=s.pending;s.parents=null;s.pending=null;s.phase='idle';s.generation++;s.history.push({g:s.generation,...stats(s.population)});if(step===5&&s.pressure==='alternating')s.peaks=[{c:s.generation%2?6.8:13.2,w:s.peaks[0].w}];controls();render();arrive([svg])}
function enter(){clearTimeout(generationTimer);N=72;COUNT=24;s.pressure='steady';s.phase='idle';if(step<=1){initial();s.peaks=[{c:step===0?10:13.2,w:1.4}]}if(step===2){if(s.generation!==1)initial();s.peaks=[{c:13.2,w:1.4}]}if(step===3){initial();s.peaks=[{c:10,w:.7}]}if(step===4){initial();s.peaks=[{c:6.8,w:.8},{c:13.2,w:.8}]}if(step===5){initial();s.peaks=[{c:13.2,w:1.4}]}controls()}
function controls(){
 const c=$('controls');c.innerHTML='';setupBiologyWork();if(s.phase!=='idle')return;
 if(step===1)button(s.parents?'Produce offspring':'Select parents',()=>{if(s.parents)reproduce();else{selectParents();controls();render()}});
 if(step>=2)button('Next generation',reproduce,{'data-priority':'primary'});
 if(step===5){
  const addSelect=(id,label,options,value,change)=>{const l=document.createElement('label');l.textContent=label+' ';const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',label);for(const[v,name]of options){const opt=document.createElement('option');opt.value=v;opt.textContent=name;select.appendChild(opt)}select.value=value;select.onchange=()=>change(select.value);l.appendChild(select);c.appendChild(l);return select};
  explain(addSelect('foodPressure','Food',[['steady','Steady'],['alternating','Alternating'],['even','Even']],s.pressure,value=>{s.pressure=value;s.parents=null;s.pending=null;if(value==='alternating')s.peaks=[{c:s.generation%2?6.8:13.2,w:1.4}];controls();render()}),'Steady food keeps the pressure you set. Alternating food switches between shallow and deep beaks each generation. Even food gives all beaks the same reproductive advantage.');
  explain(addSelect('populationSize','Population',[['36','36 birds'],['72','72 birds'],['144','144 birds']],String(N),value=>{N=Number(value);COUNT=N/3;initial();controls();render()}),'Start a fresh population of this size. Compare how random sampling and the same food pressure affect small and larger populations.');
  if(s.pressure==='steady')button(s.peaks.length===1?'Use two food sources':'Use one food source',()=>{s.peaks=s.peaks.length===1?[{c:6.8,w:.9},{c:13.2,w:.9}]:[{c:10,w:1.4}];s.parents=null;s.pending=null;controls();render()});
  if(s.generation)button('Reset population',()=>{initial();controls();render()});
 }
}
start();
function setupBiologyWork(){
 if(s.phase==='offspring'){workSetup('Inheritance',workRow('selected parents',term('parents',COUNT))+workRow('offspring replacing the adults',term('offspring',N)),'Each offspring inherits a trait from a selected parent, with variation.');workingExplanation('Parents contribute inherited beak-depth values to the offspring. Small inherited variation makes the offspring similar to their parents without making them exact copies.');return}
 if(step===0||step===1||step===2)workSetup('Calculate a trait frequency',workRow('deep-beaked birds ÷ all birds × 100',workOutput('frequencyWork')),'Frequency is the percentage of the population in this group.');
 if(step===3){workSetup('Calculate the middle group’s frequency',workRow('middle-sized birds ÷ all birds × 100',`<span id="middleCount"></span> ÷ ${term('adult-total',N)} × 100 = <input id="frequencyInput" type="number" min="0" max="100" step="0.1" inputmode="decimal" aria-label="Percentage of birds in the middle group">%`),'Run at least three generations, then give the frequency to one decimal place.',true);$('frequencyInput').value=s.frequency;$('frequencyInput').oninput=e=>{s.frequency=e.target.value;s.frequencyChecked=false;render()};workAction('Check frequency',()=>{s.frequencyChecked=true;render()})}
 if(step===4)workSetup('Compare the middle group’s frequency',workRow('starting population',workOutput('initialFrequency'))+workRow('current population',workOutput('currentFrequency')),'Compare these frequencies with the groups at both ends of the distribution.');
 if(step===5)$('working').hidden=true;workingExplanation('A trait frequency is the group count divided by the total adult count. Multiply by 100 to express that fraction as a percentage. The counts come from the current population, not from the representative bird drawings.');
}
function updateBiologyWork(){
 const m=stats(s.population),deep=s.population.filter(v=>v>11.5).length,middle=s.population.filter(v=>v>=8.5&&v<=11.5).length;
 if(step<=2)workFormula('frequencyWork',`${term('deep-count',deep)} ÷ ${term('adult-total',N)} × 100 = ${result('deep-frequency',fmt(deep/N*100)+'%','This is the percentage of current adults with beaks deeper than 11.5 mm.')}`);
 if(step===3){workFormula('middleCount',term('middle-count',middle));const correct=s.frequency!==''&&Math.abs(Number(s.frequency)-m.middle*100)<=.11,observed=s.generation>=3&&m.sd<s.baseline.sd*.78,ok=s.frequencyChecked&&correct&&observed;$('frequencyInput').disabled=s.generation<3;$('workActions').querySelector('button').disabled=s.generation<3;$('frequencyInput').className=s.frequencyChecked?(correct?'good':'bad'):'';workState(s.frequencyChecked?(correct?'good':'bad'):'needed');if(observed)feedback(ok?`${middle} of ${N} adults are in the middle group: ${fmt(m.middle*100,1)}%. Compare their distribution with the dashed starting bars.`:s.frequencyChecked?'Divide the middle group count by 72 and multiply by 100.':'Calculate the current middle group’s frequency to complete the investigation.',ok,s.frequencyChecked&&!correct)}
 if(step===4){const initial=s.initial.filter(v=>v>=8.5&&v<=11.5).length;workFormula('initialFrequency',`${term('starting-middle',initial)} ÷ ${term('adult-total',N)} × 100 = ${result('starting-frequency',fmt(initial/N*100)+'%','This is the middle group’s frequency in the starting population, shown by the dashed distribution.')}`);workFormula('currentFrequency',`${term('middle-count',middle)} ÷ ${term('adult-total',N)} × 100 = ${result('middle-frequency',fmt(middle/N*100)+'%','This is the middle group’s frequency in the current adult population.')}`)}
}
