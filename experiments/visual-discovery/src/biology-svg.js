function sceneHeight(){return step<2?450:520}
function traitColour(trait){return trait<8.5?'#93bbe5':trait<=11.5?'#5277b8':'#304f8a'}
function populationPositions(pop){
 const left=mobile?23:W*.12,right=mobile?W-23:W*.88,gap=mobile?7:9,counts=[0,0,0];
 return pop.map((trait,id)=>{const band=trait<8.5?0:trait<=11.5?1:2,j=counts[band]++,cx=left+(3+band*3)/12*(right-left);return{id,band,x:cx-3.5*gap+(j%8)*gap,y:199+Math.floor(j/8)*gap}});
}
function drawReproduction(){
 const left=mobile?23:W*.12,right=mobile?W-23:W*.88,parents=new Map();
 sourceLabel('parents',W/2,25,`${COUNT} selected parents`,'These adults were sampled to reproduce. Their inherited beak depths contribute to the next generation.','accent','middle');
 for(let band=0;band<3;band++)bird(left+(3+band*3)/12*(right-left)-4,65,7+band*3,mobile?.55:.75);
 populationPositions(s.parents.map(p=>p.trait)).forEach((p,i)=>{const x=p.x,y=p.y-90;parents.set(s.parents[i].id,{x,y});dot(x,y,mobile?3:3.7,{fill:traitColour(s.parents[i].trait),stroke:'var(--lab-concept-violet)','stroke-width':1.5})});
 const children=populationPositions(s.pending);
 s.pending.forEach((trait,i)=>{
  const origin=parents.get(s.lineage[i]),x=children[i].x,y=children[i].y+51;
  if(i%12===0)el('path',{d:`M ${origin.x} ${origin.y+6} C ${origin.x} 178 ${x} 190 ${x} ${y-6}`,fill:'none',stroke:'var(--lab-concept-violet-line)','stroke-width':1,'stroke-dasharray':'3 4',opacity:.65});
  const child=dot(reduced.matches?x:origin.x,reduced.matches?y:origin.y,reduced.matches?(mobile?2.4:3):1,{fill:traitColour(trait),stroke:'white','stroke-width':1,class:'offspring','data-parent-id':s.lineage[i]});
  if(!reduced.matches)for(const [attributeName,from,to,dur]of [['cx',origin.x,x,'.95s'],['cy',origin.y,y,'.95s'],['r',1,mobile?2.4:3,'.45s']]){const motion=el('animate',{attributeName,from,to,dur,begin:'indefinite',fill:'freeze'},undefined,child);motion.beginElementAt((i%12)*.025)}
 });
 el('rect',{x:W/2-57,y:186,width:114,height:25,rx:4,fill:'var(--lab-surface)'});sourceLabel('offspring',W/2,203,`${N} offspring`,'These offspring replace the adults. Each inherits a beak depth from one selected parent, with a small amount of variation.','accent','middle');
 text(W/2,H-55,`Generation ${s.generation+1} will replace the current adults.`,'small','middle');
}
// Reuses the source lab's trait colours; beak depth changes the silhouette itself.
function bird(x,y,trait,scale=1,opacity=1,parent=svg){
 const g=el('g',{transform:`translate(${x} ${y}) scale(${scale})`,opacity},undefined,parent),depth=trait*.53;
 el('path',{d:'M -16 5 L -36 -5 L -29 7 L -18 14 L -8 12 Z',fill:'#304f8a',stroke:'#304f8a','stroke-linejoin':'round'},undefined,g);
 el('path',{d:'M -21 2 C -19 -10 -5 -13 7 -9 C 14 -7 18 2 14 11 C 6 20 -10 18 -19 10 Z',fill:traitColour(trait)},undefined,g);
 el('path',{d:'M -17 0 C -8 -5 4 -3 8 4 C 3 11 -6 13 -15 7 Z',fill:'#315b91',opacity:.75},undefined,g);
 for(let i=0;i<3;i++)el('path',{d:`M ${-12+i*4} 2 Q ${-8+i*4} 5 ${-7+i*4} 8`,fill:'none',stroke:'#b8d0ed','stroke-width':.7,opacity:.7},undefined,g);
 el('path',{d:'M 0 -8 C 2 -20 18 -26 25 -16 C 30 -10 28 -2 20 3 L 9 7 Z',fill:traitColour(trait)},undefined,g);
 el('path',{d:'M 18 -3 Q 15 4 10 6 L 5 2 Q 12 3 18 -3',fill:'#e8f0fa',opacity:.85},undefined,g);
 el('path',{d:`M 25 ${-10-depth} Q 33 ${-12-depth*.7} 42 -8 Q 35 ${-6+depth*.6} 25 ${-8+depth} Z`,fill:'var(--lab-concept-amber-fill)',stroke:'var(--lab-concept-amber)','stroke-width':1,'stroke-linejoin':'round'},undefined,g);
 line(26,-9,41,-8,{stroke:'var(--lab-concept-amber)','stroke-width':.65},g);
 dot(22,-15,2,{fill:'#1d1d1f'},g);dot(22.6,-15.6,.55,{fill:'white'},g);
 for(const xx of [-7,6]){line(xx,14,xx-2,23,{stroke:'var(--lab-concept-slate)','stroke-width':1.2},g);line(xx-5,23,xx+3,23,{stroke:'var(--lab-concept-slate)','stroke-width':1.2},g)}
 return g;
}
function render(){
 clear();head(lesson[step].title,lesson[step].intro);if(s.phase==='offspring'){drawReproduction();feedback('Producing offspring from the selected parents…');$('back').disabled=true;endDraw();return}
 const m=stats(s.population),left=mobile?23:W*.12,right=mobile?W-23:W*.88,x=v=>left+(v-4)/12*(right-left),intro=step<2;
 text(left,22,`Generation ${s.generation}`,'accent');sourceLabel('adult-total',right,22,`${N} adult birds`,'This is the total adult population: the denominator when calculating a trait frequency. Selecting parents does not replace these adults.','small','end');
 const bandNames=['Shallow','Middle','Deep'];
 for(let band=0;band<3;band++){
  const trait=7+band*3,xx=x(trait),yy=intro?108:78,belongs=v=>band===0?v<8.5:band===1?v>=8.5&&v<=11.5:v>11.5;
  const adults=s.population.filter(belongs).length,parents=s.parents?.filter(p=>belongs(p.trait)).length??0;
  if(intro){
   const advantage=fitness(trait),rx=mobile?35:66;
   el('ellipse',{cx:xx,cy:yy+8,rx,ry:mobile?36:54,fill:'var(--lab-concept-amber-fill)',opacity:advantage*.65});
  }
  const key=['shallow-count','middle-count','deep-count'][band],description=`${adults} current adults have ${band===0?'beaks shallower than 8.5 mm':band===1?'beaks from 8.5 to 11.5 mm':'beaks deeper than 11.5 mm'}. Divide this count by all ${N} adults to find the group’s frequency.`;
  explain(bird(xx-(mobile?4:7),yy,trait,intro?(mobile?.86:1.5):(mobile?.57:.85)),`This drawing represents the ${bandNames[band].toLowerCase()} beak group. ${description}`,key);
  if(intro)text(xx,174,bandNames[band],'small','middle');else sourceLabel(key,xx,124,`${adults} ${bandNames[band].toLowerCase()}`,description,'small','middle');
  if(intro){
   sourceLabel(key,xx,297,`${adults} adults`,description,'small','middle');
   if(s.parents)text(xx,319,`${parents} selected`,'small','middle');
  }
 }
 if(intro){
  const selected=new Set(s.parents?.map(p=>p.id));
  for(const p of populationPositions(s.population))explain(dot(p.x,p.y,mobile?2.4:3,{'data-bird-id':p.id,fill:s.parents?(selected.has(p.id)?'var(--lab-concept-violet)':'var(--lab-line)'):traitColour(s.population[p.id])}),`One adult with a ${fmt(s.population[p.id],1)} mm beak. Its inherited beak depth stays unchanged when you move the food.`);
 }
 if(!intro){
  const comparison=step===5?s.records[s.comparison]:null,reference=comparison?comparison.population:s.initial,bins=Array(18).fill(0),original=Array(18).fill(0),selected=Array(18).fill(0),bin=v=>Math.min(17,Math.floor((v-4)*1.5));
  s.population.forEach(v=>bins[bin(v)]++);reference.forEach(v=>original[bin(v)]++);s.parents?.forEach(p=>selected[bin(p.trait)]++);
  if(comparison&&comparison.size!==N)for(let i=0;i<original.length;i++)original[i]*=N/comparison.size;
  const base=296,max=Math.max(12,...bins,...original),unit=126/max,bw=(right-left)/18;
  text(left,155,'Number of adults','small');
  if(step===4)sourceLabel('starting-middle',right,155,`Start: ${s.initial.filter(v=>v>=8.5&&v<=11.5).length} middle`,'This count is from the starting population, shown by the dashed bars. Compare it with the current middle group count above.','small','end');else explain(text(right,155,s.parents?'Violet: selected parents':comparison?'Dashed: saved population':'Dashed: starting population','small','end'),comparison&&comparison.size!==N?'Saved bars are rescaled to the current total so their proportions, not raw counts, are comparable.':'Dashed bars preserve the reference distribution for comparison with the current filled bars.');
  for(const count of [0,Math.ceil(max/2),max]){
   const yy=base-count*unit;line(left,yy,right,yy,{stroke:'var(--lab-line-subtle)','stroke-width':1});
   text(left-8,yy+4,String(count),'small','end');
  }
  for(let i=0;i<18;i++){
   const xx=left+i*bw,bh=bins[i]*unit;
   el('rect',{x:xx+2,y:base-bh,width:bw-4,height:bh,rx:1.5,fill:traitColour(4+(i+.5)/1.5),opacity:s.parents?.45:1});
   if(s.parents)el('rect',{x:xx+2,y:base-selected[i]*unit,width:bw-4,height:selected[i]*unit,rx:1.5,fill:'var(--lab-concept-violet)'});
   if(original[i])el('rect',{x:xx+1,y:base-original[i]*unit,width:bw-2,height:original[i]*unit,fill:'none',stroke:'var(--lab-concept-slate)','stroke-width':1,'stroke-dasharray':'3 3',opacity:.65});
  }
  line(x(m.mean),164,x(m.mean),base,{stroke:'var(--lab-concept-blue)','stroke-width':1.5,'stroke-dasharray':'2 4'});
  for(const v of [4,8,12,16])text(x(v),base+22,String(v),'small','middle');
  text((left+right)/2,base+43,'Beak depth / mm','small','middle');
 }
 const foodBase=intro?409:455,foodHeight=intro?64:65,path=[];
 for(let v=4;v<=16.01;v+=.1)path.push([x(v),foodBase-Math.min(1,food(v))*foodHeight]);
 explain(el('path',{d:`M ${left} ${foodBase} L ${path.map(p=>p.join(' ')).join(' L ')} L ${right} ${foodBase} Z`,fill:'var(--lab-concept-amber-fill)',stroke:'var(--lab-concept-amber)','stroke-width':1.25}),'The height of the amber region shows relative food advantage for each beak depth. It changes reproductive chances, not an adult’s beak.');
 // Seed positions are a stable illustration of the current advantage curve.
 for(let i=0;i<64;i++){
  const v=4+12*((i*.6180339)%1),f=Math.min(1,food(v));if(f<.07)continue;
  const xx=x(v),yy=foodBase-5-f*foodHeight*(.1+.75*((i*.4142)%1));
  const seed=el('g',{transform:`translate(${xx} ${yy}) rotate(${i*47%140-70})`});
  el('ellipse',{rx:mobile?2.1:2.8,ry:mobile?3.2:4,fill:'var(--lab-concept-amber)'},undefined,seed);
  line(0,-2,0,2,{stroke:'var(--lab-concept-amber-fill)','stroke-width':.6},seed);
 }
 text(left,foodBase+22,'Food advantage by beak depth','small');
 if(step===0||step===4||(step===5&&s.pressure==='steady'))s.peaks.forEach((p,i)=>{
  const hx=x(p.c),hy=foodBase-foodHeight-10;
  line(hx,hy+13,hx,foodBase,{stroke:'var(--lab-concept-amber)','stroke-width':1,'stroke-dasharray':'3 4',opacity:.5});
  handle('food-'+i,hx,hy,{label:`Food source ${i+1}: favoured beak depth`,help:'Move the peak toward the beak depth that has the greatest food advantage. Existing adults stay unchanged until reproduction.',min:4.5,max:15.5,value:p.c,valueText:`${fmt(p.c)} millimetres`,increment:.5,set:v=>{p.c=Math.round(v*10)/10;foodEdited();render()},fromPoint:pt=>4+(pt.x-left)/(right-left)*12});
 });
 if(step===4||step===5&&s.pressure!=='even')s.peaks.forEach((p,i)=>{
  const side=p.c>10?-1:1,hx=x(p.c+side*p.w),hy=foodBase-19;
  line(x(p.c),hy,hx,hy,{stroke:'var(--lab-concept-amber)','stroke-width':1.5});
  handle('food-width-'+i,hx,hy,{label:`Food source ${i+1}: range of favoured beaks`,help:'Widen the food range to favour more beak depths, or narrow it to make the advantage more specific.',min:.55,max:3,value:p.w,valueText:`${fmt(p.w)} millimetres of spread`,increment:.1,set:v=>{p.w=Math.round(v*100)/100;foodEdited();render()},fromPoint:pt=>side*(4+(pt.x-left)/(right-left)*12-p.c)});
 });
 if(!intro){
  sourceLabel('mean',left,H-8,`Mean ${fmt(m.mean)} mm`,'Add every adult’s beak depth, then divide by the adult count. The dashed blue line marks this mean.','small');sourceLabel('spread',W*.5,H-8,`Spread ${fmt(m.sd)} mm`,'Population standard deviation describes how far beak depths tend to lie from the mean. A smaller value means a narrower distribution.','small','middle');sourceLabel('middle-frequency',right,H-8,`Middle ${Math.round(m.middle*100)}%`,'Count adults with beaks from 8.5 to 11.5 mm, divide by the total adult count and multiply by 100. This model label rounds to a whole percent.','small','end');
 }
 if(step===0)feedback(s.peaks[0].c>=12.5?'The adults keep their beaks. Existing deeper beaks now have more food advantage.':'Amber shading shows food advantage. Each dot is an adult whose beak stays unchanged.',s.peaks[0].c>=12.5);
 if(step===1)feedback(s.generation>0?'These are offspring. They resemble the successful parents, with inherited variation.':s.parents?'Violet dots are selected parents. Their offspring have not replaced them yet.':'Selection changes who reproduces. It does not change an adult’s inherited trait.',s.generation>0);
 if(step===2){const ok=s.generation>=3;feedback(ok?`Mean beak depth: ${fmt(s.baseline.mean)} → ${fmt(m.mean)} mm over ${s.generation} generations.`:`${s.generation} generations. Keep the pressure unchanged and follow the mean.`,ok)}
 if(step===3){const ok=s.generation>=3;feedback(ok?'Stabilising selection: the spread narrows as middle-sized beaks are favoured.':`${s.generation} generations. Compare the spread with the dashed starting distribution.`,ok)}
 if(step===4){
  const ok=designedPattern(),left=s.population.filter(v=>v<8.5).length,middle=s.population.filter(v=>v>=8.5&&v<=11.5).length,right=s.population.filter(v=>v>11.5).length;
  feedback(ok?`Counts: ${left} shallow, ${middle} middle, ${right} deep. Compare both tails with the starting bars.`:s.generationsSinceEdit<3?`${s.generationsSinceEdit} of 3 generations under this food arrangement. Keep the environment steady to compare.`:`Counts: ${left} shallow, ${middle} middle, ${right} deep. Compare the starting bars and adjust the food.`,ok);
 }

 if(step===5){
  feedback(s.pressure==='even'?'All beaks have equal food advantage. Random sampling can still change their frequencies.':s.pressure==='alternating'?`Food next favours ${s.peaks[0].c<10?'shallower':'deeper'} beaks, then switches sides.`:'Change food, then run a generation. A new sample repeats the same conditions with different initial birds.',false);
  if(s.records.length)table(['Sample','Generation','Adults','Mean / mm','Middle'],s.records.map(r=>{const m=stats(r.population);return[r.sample,r.generation,r.size,fmt(m.mean,2),fmt(m.middle*100)+'%'];}),true);
  else table(['Generation','Mean / mm','Spread / mm','Middle'],s.history.slice(-6).map(r=>[r.g,fmt(r.mean,2),fmt(r.sd,2),fmt(r.middle*100)+'%']));
  const old=s.records[s.comparison],foodName=peaks=>peaks.map(p=>`${fmt(p.c)} ± ${fmt(p.w)} mm`).join(' / ');
  comparisonNote(old?`Dashed reference: sample ${old.sample}, generation ${old.generation}. ${old.size!==N?'Saved proportions are rescaled to the current adult total; the outline is not a raw saved count. ':''}`+comparisonDescription({sample:old.sample,population:old.size,food:foodName(old.peaks),pressure:old.pressure},{sample:s.sample,population:N,food:foodName(s.peaks),pressure:s.pressure}):'Record a population to retain its distribution. New sample changes the initial birds without changing the food settings.');
 }

 updateBiologyWork();endDraw();
}
