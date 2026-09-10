const lesson=[
 {
  "label": "Compress and expand",
  "title": "Compare compression and expansion.",
  "intro": "Push the piston from 6 L to 3 L, then return to 6 L. Watch pressure and wall impacts at constant temperature.",
  "success": "Compression and expansion compared"
 },
 {
  "label": "Compare readings",
  "title": "Find a relationship between pressure and volume.",
  "intro": "Keep three readings at different volumes. Compare the readings, then their products.",
  "success": "The pressure–volume products agree"
 },
 {
  "label": "Predict, then test",
  "title": "Predict the pressure at 4 L.",
  "intro": "The gas starts at 3 L and 200 kPa. Enter a prediction, then test the expansion against the gauge.",
  "success": "Prediction matches the gauge"
 },
 {
  "label": "Plan a new volume",
  "title": "Find a volume that gives 240 kPa.",
  "intro": "Start from 150 kPa at 4 L. Enter the pressure–volume product and your planned volume, then test.",
  "success": "The planned volume reaches the target pressure"
 },
 {
  "label": "Experiment",
  "title": "Change one condition and compare the effect.",
  "intro": "Record a reading to keep its piston and curve. Change volume, temperature or gas amount and compare.",
  "success": ""
 }
];
const s={V:6,prediction:'',tested:false,product:'',forecast:'',records:[],comparison:null,target:null,paused:false,busy:false,temperature:300,amount:1,compressed:false,expanded:false};
const particles=[];let chamber={x:0,y:0,width:1,height:1},lastTime=0,particleNodes=[],impactNodes=[],testFrame=0;
function gasProduct(){return step===4?600*s.temperature/300*s.amount:600}
function pressureMax(){
 const saved=s.records[s.comparison];
 return step===4?Math.max(300,Math.ceil(Math.max(gasProduct(),saved?saved[0]*saved[1]:0)/2/150)*150):300;
}
function setTemperature(value){const previous=s.temperature;s.temperature=Math.round(value/10)*10;const ratio=Math.sqrt(s.temperature/previous);particles.forEach(p=>{p.vx*=ratio;p.vy*=ratio});render()}
function changeAmount(delta){s.amount=clamp(s.amount+delta,.5,2);const count=18*s.amount;while(particles.length<count){const i=particles.length,a=i*2.399,speed=52*Math.sqrt(s.temperature/300);particles.push({x:NaN,y:NaN,vx:speed*Math.cos(a),vy:speed*Math.sin(a),hit:0})}particles.length=count;render()}
function cancelTest(){cancelAnimationFrame(testFrame);s.busy=false}
function stopModel(){cancelTest()}
function snapshotExtras(){return {particles:structuredClone(particles),chamber:{...chamber}}}
function restoreExtras(saved){cancelTest();particles.splice(0,particles.length,...saved.particles);chamber={...saved.chamber};lastTime=0;}
function restoreView(){controls()}
function resetParticles(){s.temperature=300;s.amount=1;particles.length=0;for(let i=0;i<18;i++){const a=i*2.399;particles.push({x:NaN,y:NaN,vx:52*Math.cos(a),vy:52*Math.sin(a),hit:0})}}
function reset(){cancelTest();Object.assign(s,{V:6,prediction:'',tested:false,product:'',forecast:'',records:[],comparison:null,target:null,paused:false,compressed:false,expanded:false});resetParticles()}
function enter(){
 cancelTest();resetParticles();s.tested=false;s.target=null;s.comparison=null;
 if(step===0){s.V=6;s.compressed=false;s.expanded=false;}
 if(step===1){s.V=4;s.records=[];}
 if(step===2){s.V=3;s.prediction='';}
 if(step===3){s.V=4;s.forecast='';s.product='';}
 if(step===4){s.V=4;s.records=[];}
 controls();
}
function setVolume(v){
 if(s.busy)return;s.V=Math.round(v*20)/20;
 if(step===0){if(Math.abs(s.V-3)<.06)s.compressed=true;if(s.compressed&&Math.abs(s.V-6)<.06)s.expanded=true;}
 render();
}
function keep(){
 if(s.records.some(r=>Math.abs(r[0]-s.V)<.1&&r[2]===s.temperature&&r[3]===s.amount)){
  feedback('This condition is already recorded. Choose another volume.',ready,false);return;
 }
 rememberReading([s.V,gasProduct()/s.V,s.temperature,s.amount]);
 if(step===1&&s.records.length===3)setupGasWork();
 render();
}
function testVolume(target){
 if(s.busy)return;
 const from=s.V,began=performance.now();s.busy=true;s.tested=false;
 for(const node of document.querySelectorAll('#working input,#working button,#controls button'))node.disabled=true;
 const tick=t=>{
  const progress=reduced.matches?1:clamp((t-began)/650,0,1),ease=progress*progress*(3-2*progress);s.V=from+(target-from)*ease;
  if(progress<1){render();testFrame=requestAnimationFrame(tick)}
  else{s.V=target;s.busy=false;s.tested=true;controls();render();}
 };
 testFrame=requestAnimationFrame(tick);
}
function setupGasWork(){
 $('working').hidden=true;
 if(step===1&&s.records.length>=3)workSetup('Compare the recorded products',workRow('current pressure × volume',workOutput('productWork')),'These measurements share a temperature and gas amount.');
 if(step===2){
  workSetup('Your pressure prediction',workRow('starting pressure × volume',`${term('start-pressure',200)} × ${term('start-volume',3)} = ${result('fixed-product','600 kPa·L','The measured product stays constant for this fixed sample at the same temperature.')}`)+workRow('product ÷ new volume',`p = ${term('fixed-product',600)} ÷ ${term('test-volume',4)} = <input id="pressureInput" type="number" min="0" step="1" inputmode="decimal" aria-label="Predicted pressure at 4 litres"> kPa`),'The gauge is a measurement, not your prediction.',true);
  $('pressureInput').value=s.prediction;
  $('pressureInput').oninput=e=>{s.prediction=e.target.value;s.tested=false;s.V=3;render();};
  workAction('Test prediction',()=>{
   if(!validNumber(s.prediction)||Number(s.prediction)<=0){feedback('Enter a positive pressure prediction before testing.',false,true);return;}
   testVolume(4);
  });
 }
 if(step===3){
  workSetup('Your volume prediction',workRow('your invariant',`<input data-source="predicted-product" id="productInput" type="number" min="0" inputmode="decimal" aria-label="Predicted pressure volume product"> kPa·L`)+workRow('your planned volume',`<input id="volumeInput" type="number" min="2" max="8" step="0.05" inputmode="decimal" aria-label="Predicted volume"> L`),'The violet marker shows your plan. Only testing moves the actual piston.',true);
  $('productInput').value=s.product;$('volumeInput').value=s.forecast;
  explain($('productInput'),'Use a quantity that remained unchanged in your previous readings.','predicted-product');
  $('productInput').oninput=e=>{s.product=e.target.value;s.tested=false;s.V=4;render();};
  $('volumeInput').oninput=e=>{s.forecast=e.target.value;s.tested=false;s.V=4;render();};
  workAction('Test prediction',()=>{
   if(!validNumber(s.product)||Number(s.product)<=0||!validNumber(s.forecast)||Number(s.forecast)<2||Number(s.forecast)>8){feedback('Enter a positive product and a volume from 2 to 8 L.',false,true);return;}
   testVolume(Number(s.forecast));
  });
 }
 workingExplanation(step===3?'Keep your predicted invariant and volume separate from the actual gauge. Request a hint to review the method.':'For this fixed gas at constant temperature, compare the pressure and volume readings.');
}
function controls(){
 $('controls').replaceChildren();setupGasWork();
 if(step===1||step===4)button('Record reading',keep,step===1?{'data-dock-action':'true','data-repeatable':'true'}:{});
 if(step===4)button('Clear readings',clearReadings);
 button(s.paused?'Play particles':'Pause particles',()=>{s.paused=!s.paused;controls();render();},{'aria-pressed':s.paused});
 setHelp(step===0?[
  {text:'Watch the distance to the piston and the frequency of impacts. Is particle speed changing?',keys:['temperature','volume','pressure']}
 ]:step===1?[
  {text:'Choose clearly different volumes, not three almost-identical positions.',keys:['volume','pressure']},
  {text:'Compare how many times the pressure changes when the volume changes by a factor of two.'}
 ]:step===2||step===3?[
  ()=>({text:step===3&&validNumber(s.forecast)&&Number(s.forecast)>4?'Your planned volume is larger, but the target pressure is also larger. Test which direction compression changes the gauge.':'Compare the starting and target conditions. Which variable must increase, and which must decrease?',keys:['start-pressure','start-volume','target-pressure']}),
  {text:'Keep pressure × volume constant. Divide that product by the new volume to find pressure, or by the target pressure to find volume.'},
  {example:true,text:'Another case: 120 kPa at 5 L gives 600 kPa·L. A target of 200 kPa needs 600 ÷ 200 = 3 L. The gauge is the check, not the answer box.'}
 ]:[]);
}
function updateGasWork(){
 if(step===1&&s.records.length>=3)workFormula('productWork',`${term('pressure',fmt(gasProduct()/s.V,2))} × ${term('volume',fmt(s.V,2))} ≈ ${result('fixed-product','600 kPa·L','Every saved reading has this product at the same temperature and gas amount.')}`);
 if(step===2){
  const ok=s.tested&&validNumber(s.prediction)&&Math.abs(Number(s.prediction)-150)<=1;
  workState(s.tested?(ok?'good':'bad'):'needed');$('pressureInput').className=s.tested?(ok?'good':'bad'):'';
  $('workNote').textContent='Starting measurement: 3 L and 200 kPa. The gauge always shows actual pressure.';
  feedback(s.busy?'The piston is moving to 4 L. Watch the pressure gauge.':ok?'At 4 L, pressure is 150 kPa. The product remains 600 kPa·L.':s.tested?`Prediction: ${s.prediction} kPa. Gauge: 150 kPa at 4 L. Revise your prediction, then test again.`:'Enter a pressure prediction, then test the expansion to 4 L.',ok,s.tested&&!ok);
 }
 if(step===3){
  const productOK=validNumber(s.product)&&Math.abs(Number(s.product)-600)<.01,volumeOK=validNumber(s.forecast)&&Math.abs(Number(s.forecast)-2.5)<.03,ok=s.tested&&productOK&&volumeOK;
  workState(s.tested?(ok?'good':'bad'):'needed');$('productInput').className=s.tested?(productOK?'good':'bad'):'';$('volumeInput').className=s.tested?(volumeOK?'good':'bad'):'';
  $('workNote').textContent='The violet marker shows your plan. Testing moves the piston to that volume.';
  feedback(s.busy?'The piston is moving to your planned volume. Watch the gauge.':ok?'At 2.5 L, the gauge reads 240 kPa. The product is still 600 kPa·L.':s.tested?`At ${s.forecast} L, the gauge reads ${fmt(gasProduct()/s.V)} kPa. Target: 240 kPa. Recheck both entries.`:'Enter the product and your planned volume, then test the prediction.',ok,s.tested&&!ok);
 }
 if(s.busy){$('back').disabled=true;$('next').disabled=true;$('repeat').disabled=true;}else $('repeat').disabled=false;
}
function animate(t){const dt=Math.min(.033,(t-lastTime)/1000||0);lastTime=t;if(!s.paused&&!reduced.matches&&!document.hidden){for(let i=0;i<particles.length;i++){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x>chamber.width-5){p.x=chamber.width-5;p.vx=-Math.abs(p.vx);p.hit=.16}if(p.x<5){p.x=5;p.vx=Math.abs(p.vx)}if(p.y>chamber.height-5){p.y=chamber.height-5;p.vy=-Math.abs(p.vy)}if(p.y<5){p.y=5;p.vy=Math.abs(p.vy)}p.hit=Math.max(0,p.hit-dt);particleNodes[i]?.setAttribute('cx',chamber.x+p.x);particleNodes[i]?.setAttribute('cy',chamber.y+p.y);if(impactNodes[i]){impactNodes[i].setAttribute('y1',chamber.y+p.y-6);impactNodes[i].setAttribute('y2',chamber.y+p.y+6);impactNodes[i].setAttribute('opacity',p.hit/.16)}}}requestAnimationFrame(animate)}
start();requestAnimationFrame(animate);
