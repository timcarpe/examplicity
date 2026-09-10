const lesson=[
 {
  "label": "Existing variation",
  "title": "Change the food, not the birds.",
  "intro": "Move food advantage toward deeper beaks. Compare the amber shading with the unchanged adult counts.",
  "success": "Food advantage changed; adults did not"
 },
 {
  "label": "Parents, then offspring",
  "title": "Follow parents into the next generation.",
  "intro": "Select 24 parents, then produce offspring. Watch 72 offspring inherit traits before replacing the adults.",
  "success": "Offspring inherit variation from their parents"
 },
 {
  "label": "One direction",
  "title": "Observe change over three generations.",
  "intro": "Keep the food pressure steady. Advance generations and compare mean beak depth with the starting population.",
  "success": "Three generations are ready to compare"
 },
 {
  "label": "Favour the middle",
  "title": "Compare selection that favours middle-sized beaks.",
  "intro": "Run three generations, then calculate the middle group’s frequency to one decimal place.",
  "success": "The middle-group frequency matches the count"
 },
 {
  "label": "Build the environment",
  "title": "Favour both extremes instead of the middle.",
  "intro": "Arrange the two food sources and run at least three generations. Compare the adult distribution with the target shape.",
  "success": "Both extremes increased relative to the middle"
 },
 {
  "label": "Experiment",
  "title": "Build an environment and compare generations.",
  "intro": "Change food or population size. Record a distribution, then compare it with later generations or a new sample.",
  "success": ""
 }
];
let N=72,COUNT=24;const LO=4,HI=16;
const s={population:[],initial:[],parents:null,pending:null,generation:0,peaks:[{c:10,w:1.4}],history:[],baseline:null,changed:false,seed:9137,sample:1,records:[],comparison:null,generationsSinceEdit:0};
let rng,generationTimer;
s.phase='idle';s.frequency='';s.frequencyChecked=false;s.lineage=[];s.pressure='steady';
function random(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normal(sd){let u=0,v=0;while(!u)u=rng();while(!v)v=rng();return sd*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function stats(pop){const mean=pop.reduce((a,v)=>a+v,0)/pop.length;return{mean,sd:Math.sqrt(pop.reduce((a,v)=>a+(v-mean)**2,0)/pop.length),middle:pop.filter(v=>v>=8.5&&v<=11.5).length/pop.length,left:pop.filter(v=>v<8.5).length/pop.length,right:pop.filter(v=>v>11.5).length/pop.length}}
function initial(){clearTimeout(generationTimer);s.phase='idle';s.frequency='';s.frequencyChecked=false;rng=random(s.seed);s.population=Array.from({length:N},()=>clamp(10+normal(1.85),4.08,15.92));s.initial=[...s.population];s.generation=0;s.parents=null;s.pending=null;s.baseline=stats(s.population);s.history=[{g:0,...s.baseline}];s.changed=false;s.generationsSinceEdit=0;if(step===5&&s.pressure==='alternating')s.peaks=[{c:13.2,w:s.peaks[0].w}]}
function reset(){s.peaks=[{c:10,w:1.4}];s.seed=9137;s.sample=1;s.records=[];s.comparison=null;initial()}
function food(v){if(step===5&&s.pressure==='even')return 1;return s.peaks.reduce((a,p)=>a+Math.exp(-.5*((v-p.c)/p.w)**2),0)}
function fitness(v){let max=.001;for(let x=4;x<=16;x+=.05)max=Math.max(max,food(x));return clamp(food(v)/max,0,1)}
function selectParents(){rng=random(s.seed+step*100003+s.generation*7919+17);const pool=s.population.map((trait,id)=>({trait,id,w:.2+fitness(trait)**1.4})),parents=[];for(let i=0;i<COUNT;i++){let r=rng()*pool.reduce((a,p)=>a+p.w,0),j=0;for(;j<pool.length-1;j++){r-=pool[j].w;if(r<=0)break}parents.push(pool.splice(j,1)[0])}s.parents=parents;const total=parents.reduce((a,p)=>a+.25+fitness(p.trait)**1.1,0);s.pending=[];s.lineage=[];for(let i=0;i<N;i++){let r=rng()*total,p=parents[0];for(const candidate of parents){r-=.25+fitness(candidate.trait)**1.1;if(r<=0){p=candidate;break}}s.pending.push(clamp(p.trait+normal(.43),4.05,15.95));s.lineage.push(p.id)}}
function reproduce(){if(s.phase!=='idle')return;if(!s.pending)selectParents();s.phase='offspring';s.frequency='';s.frequencyChecked=false;controls();render();if(reduced.matches)commitGeneration();else generationTimer=setTimeout(commitGeneration,1500)}
function commitGeneration(){if(s.phase!=='offspring')return;s.population=s.pending;s.parents=null;s.pending=null;s.phase='idle';s.generation++;s.generationsSinceEdit++;s.history.push({g:s.generation,...stats(s.population)});if(step===5&&s.pressure==='alternating')s.peaks=[{c:s.generation%2?6.8:13.2,w:s.peaks[0].w}];controls();render();arrive([svg])}
function enter(){clearTimeout(generationTimer);N=72;COUNT=24;s.seed=9137;s.sample=1;s.pressure='steady';s.phase='idle';if(step<=1){initial();s.peaks=[{c:step===0?10:13.2,w:1.4}]}if(step===2){if(s.generation!==1)initial();s.peaks=[{c:13.2,w:1.4}]}if(step===3){initial();s.peaks=[{c:10,w:.7}]}if(step===4){initial();s.peaks=[{c:9.4,w:1.4},{c:10.6,w:1.4}];}if(step===5){initial();s.peaks=[{c:13.2,w:1.4}];s.records=[];s.comparison=null;}controls()}
function controls(){
 const c=$('controls');c.innerHTML='';$('context').replaceChildren();setupBiologyWork();
 if(step===4){$('context').innerHTML='<span class="transfer-note">Target shape, not exact counts</span><svg width="108" height="34" viewBox="0 0 108 34" role="img" aria-label="More birds at both extremes and fewer in the middle"><path d="M4 30H104" stroke="currentColor"/><path d="M14 30V5H32V30 M45 30V24H63V30 M76 30V5H94V30" fill="none" stroke="var(--lab-accent)" stroke-width="2"/></svg>';}
 setHelp(step===3?[
  {text:'Use the actual middle-group count, not the three representative bird drawings.',keys:['middle-count','adult-total']},
  {text:'Divide the group count by all adults and multiply by 100.'},
  {example:true,text:'Another population: 18 of 60 adults gives 18 ÷ 60 × 100 = 30%.'}
 ]:step===4?[
  {text:'Compare where food gives an advantage with the two tails you want to retain. Editing food must not move the adult bars.',keys:['shallow-count','middle-count','deep-count']},
  {text:'A central food peak favours middle beaks. Two separated, narrower sources can favour both tails. Test your arrangement rather than advancing generations under the same unhelpful conditions.'},
  {text:'In the previous case one narrow source favoured the middle. Apply that same relationship to two different parts of the trait range.'}
 ]:step===0?[{text:'The amber food advantage can change without changing any existing adult count.',keys:['shallow-count','middle-count','deep-count']}]:step===1?[{text:'Selected parents are still adults. Counts change when offspring replace them.'}]:step===2?[{text:'Keep food unchanged and compare the mean with the starting distribution.',keys:['mean']}]:[]);
if(s.phase!=='idle')return;
 if(step===1)button(s.parents?'Produce offspring':'Select parents',()=>{if(s.parents)reproduce();else{selectParents();controls();render()}},{'data-dock-action':'true'});
 if(step>=2)button('Next generation',reproduce,{'data-dock-action':'true','data-repeatable':'true'});if(step===4&&s.generation)button('Reset population',()=>{initial();s.changed=true;controls();render();});
 if(step===5){
  const addSelect=(id,label,options,value,change)=>{const l=document.createElement('label');l.textContent=label+' ';const select=document.createElement('select');select.id=id;select.setAttribute('aria-label',label);for(const[v,name]of options){const opt=document.createElement('option');opt.value=v;opt.textContent=name;select.appendChild(opt)}select.value=value;select.onchange=()=>change(select.value);l.appendChild(select);c.appendChild(l);return select};
  explain(addSelect('foodPressure','Food',[['steady','Steady'],['alternating','Alternating'],['even','Even']],s.pressure,value=>{s.pressure=value;s.parents=null;s.pending=null;if(value==='alternating')s.peaks=[{c:s.generation%2?6.8:13.2,w:1.4}];controls();render()}),'Steady food keeps the pressure you set. Alternating food switches between shallow and deep beaks each generation. Even food gives all beaks the same reproductive advantage.');
  explain(addSelect('populationSize','Population',[['36','36 birds'],['72','72 birds'],['144','144 birds']],String(N),value=>{N=Number(value);COUNT=N/3;initial();controls();render()}),'Start a fresh population of this size. Compare how random sampling and the same food pressure affect small and larger populations.');
  if(s.pressure==='steady')button(s.peaks.length===1?'Use two food sources':'Use one food source',()=>{s.peaks=s.peaks.length===1?[{c:6.8,w:.9},{c:13.2,w:.9}]:[{c:10,w:1.4}];s.parents=null;s.pending=null;controls();render()});
  button('Record reading',()=>{rememberReading({population:[...s.population],size:N,seed:s.seed,sample:s.sample,generation:s.generation,peaks:structuredClone(s.peaks),pressure:s.pressure});render();});
  button('New sample',()=>{s.seed+=104729;s.sample++;initial();controls();render();});
  if(s.records.length)button('Clear readings',clearReadings);
  if(s.generation)button('Reset population',()=>{initial();controls();render();});
 }
}
start();
function setupBiologyWork(){
 if(s.phase==='offspring'){workSetup('Inheritance',workRow('selected parents',term('parents',COUNT))+workRow('offspring replacing the adults',term('offspring',N)),'Each offspring inherits a trait from a selected parent, with variation.');workingExplanation('Parents contribute inherited beak-depth values to the offspring. Small inherited variation makes the offspring similar to their parents without making them exact copies.');return}
 if(step===0||step===1){$('working').hidden=true;return;}
 if(step===2)workSetup('Trait frequency',workRow('deep-beaked birds ÷ all birds × 100',workOutput('frequencyWork')),'Frequency is the percentage of the population in this group.');
 if(step===3){workSetup('Middle-group frequency',workRow('middle-sized birds ÷ all birds × 100',`<span id="middleCount"></span> ÷ ${term('adult-total',N)} × 100 = <input id="frequencyInput" type="number" min="0" max="100" step="0.1" inputmode="decimal" aria-label="Percentage of birds in the middle group">%`),'Run at least three generations, then give the frequency to one decimal place.',true);$('frequencyInput').value=s.frequency;$('frequencyInput').oninput=e=>{s.frequency=e.target.value;s.frequencyChecked=false;render()};workAction('Check frequency',()=>{s.frequencyChecked=true;render()})}
 if(step===4){$('working').hidden=true;return;}
 if(step===5)$('working').hidden=true;workingExplanation('A trait frequency is the group count divided by the total adult count. Multiply by 100 to express that fraction as a percentage. The counts come from the current population, not from the representative bird drawings.');
}
function updateBiologyWork(){
 const m=stats(s.population),deep=s.population.filter(v=>v>11.5).length,middle=s.population.filter(v=>v>=8.5&&v<=11.5).length;
 if(step===2)workFormula('frequencyWork',`${term('deep-count',deep)} ÷ ${term('adult-total',N)} × 100 = ${result('deep-frequency',fmt(deep/N*100)+'%','This is the percentage of current adults with beaks deeper than 11.5 mm.')}`);
 if(step===3){workFormula('middleCount',term('middle-count',middle));const correct=s.frequency!==''&&Math.abs(Number(s.frequency)-m.middle*100)<=.11,observed=s.generation>=3,ok=s.frequencyChecked&&correct&&observed;$('frequencyInput').disabled=s.generation<3;$('workActions').querySelector('button').disabled=s.generation<3;$('frequencyInput').className=s.frequencyChecked?(correct?'good':'bad'):'';workState(s.frequencyChecked?(correct?'good':'bad'):'needed');if(observed)feedback(ok?`${middle} of ${N} adults are in the middle group: ${fmt(m.middle*100,1)}%. Compare their distribution with the dashed starting bars.`:s.frequencyChecked?`There are ${middle} middle-group birds out of ${N}. Recheck your percentage.`:'Calculate the current middle group’s frequency to complete the investigation.',ok,s.frequencyChecked&&!correct)}

}

function foodEdited(){s.changed=true;s.generationsSinceEdit=0;s.parents=null;s.pending=null;}
function designedPattern(){
 const m=stats(s.population),b=s.baseline;
 return s.generationsSinceEdit>=3&&s.changed&&m.middle<b.middle&&m.left>b.left&&m.right>b.right;
}
function stopModel(){clearTimeout(generationTimer);}
function snapshotExtras(){return {N,COUNT};}
function restoreExtras(saved){N=saved.N;COUNT=saved.COUNT;}
function restoreView(){controls();}
