const lesson=[
 {label:'Existing variation',title:'Food changes. Beaks don’t.',intro:'Move the food toward deeper beaks. Watch which adults gain an advantage.'},
 {label:'Parents, then offspring',title:'An advantage becomes inheritance.',intro:'Select parents, then let their offspring replace this generation.'},
 {label:'One direction',title:'Let the same pressure persist.',intro:'Run several generations. Follow the centre of the population.'},
 {label:'Favour the middle',title:'What if the extremes lose out?',intro:'Start with the original population. Favour middle-sized beaks.'},
 {label:'Favour both extremes',title:'Two food sources. Two advantages.',intro:'Start again. Favour small and large beaks; follow the middle and both tails.'},
 {label:'Experiment',title:'Change the world. Follow the generations.',intro:'Move food sources, change their range, and test whether a trend reverses.'}
];
const N=72,COUNT=24,LO=4,HI=16;
const s={population:[],initial:[],parents:null,pending:null,generation:0,peaks:[{c:10,w:1.4}],history:[],baseline:null,changed:false};
let rng;
function random(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normal(sd){let u=0,v=0;while(!u)u=rng();while(!v)v=rng();return sd*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function stats(pop){const mean=pop.reduce((a,v)=>a+v,0)/pop.length;return{mean,sd:Math.sqrt(pop.reduce((a,v)=>a+(v-mean)**2,0)/pop.length),middle:pop.filter(v=>v>=8.5&&v<=11.5).length/pop.length,left:pop.filter(v=>v<8.2).length/pop.length,right:pop.filter(v=>v>11.8).length/pop.length}}
function initial(){rng=random(9137);s.population=Array.from({length:N},()=>clamp(10+normal(1.85),4.08,15.92));s.initial=[...s.population];s.generation=0;s.parents=null;s.pending=null;s.baseline=stats(s.population);s.history=[{g:0,...s.baseline}];s.changed=false}
function reset(){s.peaks=[{c:10,w:1.4}];initial()}
function food(v){return s.peaks.reduce((a,p)=>a+Math.exp(-.5*((v-p.c)/p.w)**2),0)}
function fitness(v){let max=.001;for(let x=4;x<=16;x+=.05)max=Math.max(max,food(x));return clamp(food(v)/max,0,1)}
function selectParents(){rng=random(9137+step*100003+s.generation*7919+17);const pool=s.population.map((trait,id)=>({trait,id,w:.2+fitness(trait)**1.4})),parents=[];for(let i=0;i<COUNT;i++){let r=rng()*pool.reduce((a,p)=>a+p.w,0),j=0;for(;j<pool.length-1;j++){r-=pool[j].w;if(r<=0)break}parents.push(pool.splice(j,1)[0])}s.parents=parents;const total=parents.reduce((a,p)=>a+.25+fitness(p.trait)**1.1,0);s.pending=[];for(let i=0;i<N;i++){let r=rng()*total,p=parents[0];for(const candidate of parents){r-=.25+fitness(candidate.trait)**1.1;if(r<=0){p=candidate;break}}s.pending.push(clamp(p.trait+normal(.43),4.05,15.95))}}
function reproduce(){if(!s.pending)selectParents();s.population=s.pending;s.parents=null;s.pending=null;s.generation++;s.history.push({g:s.generation,...stats(s.population)});render();controls();svg.classList.remove('model-fade');void svg.getBoundingClientRect();svg.classList.add('model-fade')}
function enter(){if(step<=1){initial();s.peaks=[{c:step===0?10:13.2,w:1.4}]}if(step===2){if(s.generation!==1)initial();s.peaks=[{c:13.2,w:1.4}]}if(step===3){initial();s.peaks=[{c:10,w:.7}]}if(step===4){initial();s.peaks=[{c:6.8,w:.8},{c:13.2,w:.8}]}if(step===5){initial();s.peaks=[{c:13.2,w:1.4}]}controls()}
function controls(){const c=$('controls');c.innerHTML='';if(step===1||step===5)button(s.parents?'Make next generation':'Select parents',()=>{if(s.parents)reproduce();else{selectParents();render();controls()}});if(step>=2&&step<=4)button('Next generation',reproduce);if(step===5){button('One / two food sources',()=>{if(s.peaks.length===1)s.peaks=[{c:6.8,w:.9},{c:13.2,w:.9}];else s.peaks=[{c:10,w:1.4}];s.parents=null;s.pending=null;controls();render()});const label=document.createElement('label');label.textContent='Food range ';const range=document.createElement('input');range.type='range';range.id='foodWidth';range.min='.55';range.max='3';range.step='.05';range.value=s.peaks[0].w;range.setAttribute('aria-label','Range of beak depths favoured by food');range.oninput=e=>{s.peaks.forEach(p=>p.w=Number(e.target.value));s.parents=null;s.pending=null;render();const next=c.querySelector('button');if(next)next.textContent='Select parents'};label.appendChild(range);c.appendChild(label);button('Fresh population',()=>{initial();controls();render()},{class:'quiet'})}}
start();
