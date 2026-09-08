const lesson=[
 {
  "label": "Compress the gas",
  "title": "Find out how compression changes gas pressure.",
  "intro": "The sealed gas starts at 6 L and 100 kPa. Push the piston to 3 L while the bath keeps the temperature steady.",
  "success": "Halving the volume doubles the pressure."
 },
 {
  "label": "Predict an expansion",
  "title": "Predict what happens when the gas expands again.",
  "intro": "Compression took the gas to 3 L and 200 kPa. Calculate its pressure at 6 L, then test your prediction against the gauge.",
  "success": "Your prediction matches the pressure reading."
 },
 {
  "label": "Find the invariant",
  "title": "Look for a relationship that holds across several readings.",
  "intro": "You have compared one compression and one expansion. Record three different volumes and check their pressure × volume products.",
  "success": "Each reading gives the same product."
 },
 {
  "label": "Calculate a volume",
  "title": "Find the volume that will give a pressure of 240 kPa.",
  "intro": "Your readings gave the same pressure × volume product. Start from 150 kPa at 4 L, use that product to predict a volume, then test it.",
  "success": "Your planned volume produces 240 kPa."
 },
 {
  "label": "Experiment",
  "title": "Explore what else changes the pressure of a gas.",
  "intro": "Volume is only one part of the story. Try changing temperature or gas amount, then hold them steady when you compare pressure and volume.",
  "success": ""
 }
];
const s={V:6,prediction:'',tested:false,product:'',forecast:'',records:[],target:null,paused:false,busy:false,temperature:300,amount:1};
const particles=[];let chamber={x:0,y:0,width:1,height:1},lastTime=0,particleNodes=[],impactNodes=[],testFrame=0;
function gasProduct(){return step===4?600*s.temperature/300*s.amount:600}
function pressureMax(){return step===4?Math.max(300,Math.ceil(gasProduct()/2/150)*150):300}
function setTemperature(value){const previous=s.temperature;s.temperature=Math.round(value/10)*10;const ratio=Math.sqrt(s.temperature/previous);particles.forEach(p=>{p.vx*=ratio;p.vy*=ratio});render()}
function changeAmount(delta){s.amount=clamp(s.amount+delta,.5,2);const count=18*s.amount;while(particles.length<count){const i=particles.length,a=i*2.399,speed=52*Math.sqrt(s.temperature/300);particles.push({x:NaN,y:NaN,vx:speed*Math.cos(a),vy:speed*Math.sin(a),hit:0})}particles.length=count;render()}
function cancelTest(){cancelAnimationFrame(testFrame);s.busy=false}
function resetParticles(){s.temperature=300;s.amount=1;particles.length=0;for(let i=0;i<18;i++){const a=i*2.399;particles.push({x:NaN,y:NaN,vx:52*Math.cos(a),vy:52*Math.sin(a),hit:0})}}
function reset(){cancelTest();Object.assign(s,{V:6,prediction:'',tested:false,product:'',forecast:'',records:[],target:null,paused:false});resetParticles()}
function enter(){cancelTest();resetParticles();s.tested=false;s.target=null;if(step===0)s.V=6;if(step===1){s.V=3;s.prediction=''}if(step===2){s.V=4;s.records=[]}if(step===3){s.V=4;s.forecast='';s.product=''}if(step===4){s.V=4;s.records=[]}controls()}
function setVolume(v){if(s.busy)return;s.V=Math.round(v*20)/20;render()}
function keep(){if(s.records.some(r=>Math.abs(r[0]-s.V)<.1&&r[2]===s.temperature&&r[3]===s.amount)){feedback('This volume is already recorded. Choose another volume.',false,true);return}s.records.push([s.V,gasProduct()/s.V,s.temperature,s.amount]);s.records=s.records.slice(-6);render()}
function testVolume(target){
 if(s.busy)return;const from=s.V,began=performance.now();s.busy=true;s.tested=false;
 for(const node of document.querySelectorAll('#working input,#working button,#controls button'))node.disabled=true;
 const tick=t=>{const progress=reduced.matches?1:clamp((t-began)/650,0,1),ease=progress*progress*(3-2*progress);s.V=from+(target-from)*ease;
  if(progress<1){render();testFrame=requestAnimationFrame(tick)}else{s.V=target;s.busy=false;s.tested=true;controls();render()}
 };testFrame=requestAnimationFrame(tick);
}
function setupGasWork(){
 if(step===0)workSetup('Calculate the pressure from a fixed product',workRow('starting pressure × volume',`${term('start-pressure',100)} × ${term('start-volume',6)} = ${result('fixed-product','600 kPa·L','The starting pressure times volume gives 600 kPa·L. This stays constant while temperature and gas amount stay fixed.')}`)+workRow('product ÷ current volume',workOutput('pressureWork')),'The same product lets you calculate pressure after an expansion.');
 if(step===1){
  workSetup('Predict the pressure at 6 L',workRow('starting pressure × volume',`${term('start-pressure',200)} × ${term('start-volume',3)} = ${result('fixed-product','600 kPa·L','The same fixed gas at the same temperature keeps this pressure × volume product.')}`)+workRow('product ÷ new volume',`p = ${term('fixed-product',600)} ÷ ${term('test-volume',6)} = <input id="pressureInput" type="number" min="75" max="300" step="1" inputmode="decimal" aria-label="Predicted pressure at 6 litres"> kPa`),'The gauge shows the actual pressure. Your prediction is recorded here.',true);
  $('pressureInput').value=s.prediction;$('pressureInput').oninput=e=>{s.prediction=e.target.value;s.tested=false;s.V=3;render()};
  workAction('Test expansion to 6 L',()=>{if(s.prediction===''||!Number.isFinite(Number(s.prediction))){feedback('Enter a pressure prediction before testing.',false,true);return}testVolume(6)});
 }
 if(step===2)workSetup('Compare the products',workRow('current pressure × volume',workOutput('productWork')),'Record another volume to test whether this product changes.');
 if(step===3){
  workSetup('Calculate the volume at 240 kPa',workRow('starting pressure × volume',`${term('start-pressure',150)} × ${term('start-volume',4)} = <input data-source="predicted-product" id="productInput" type="number" inputmode="decimal" aria-label="Initial pressure times volume"> kPa·L`)+workRow('product ÷ target pressure',`V = <span id="productEcho"></span> ÷ ${term('target-pressure',240)} = <input id="volumeInput" type="number" min="2" max="8" step="0.05" inputmode="decimal" aria-label="Predicted volume"> L`),'The violet mark on the scale shows your predicted volume. The piston moves only when you test.',true);
  $('productInput').value=s.product;$('volumeInput').value=s.forecast;explain($('productInput'),'This product comes from the starting pressure and volume. Use it in the next line.','predicted-product');explanations.set('predicted-product','The product you calculated in the first line is divided by the target pressure.');
  $('productInput').oninput=e=>{s.product=e.target.value;s.tested=false;s.V=4;render()};$('volumeInput').oninput=e=>{s.forecast=e.target.value;s.tested=false;s.V=4;render()};
  workAction('Test predicted volume',()=>{if(s.product===''||s.forecast===''||Number(s.forecast)<2||Number(s.forecast)>8){feedback('Enter the product and a volume between 2 L and 8 L.',false,true);return}testVolume(Number(s.forecast))});
 }
 if(step===4)$('working').hidden=true;workingExplanation('For a fixed amount of gas at constant temperature, pressure × volume is constant. Multiply a known pressure and volume first. Divide that product by a new volume to find pressure, or by a new pressure to find volume.');
}
function controls(){
 $('controls').innerHTML='';setupGasWork();
 if(step===2||step===4)button('Record reading',keep);
 if(step===4)button('Clear readings',()=>{s.records=[];render()});
 button(s.paused?'Play particles':'Pause particles',()=>{s.paused=!s.paused;const b=$('controls').lastElementChild;b.textContent=s.paused?'Play particles':'Pause particles';b.setAttribute('aria-pressed',s.paused)},{'aria-pressed':s.paused});
}
function updateGasWork(){
 if(step===0)workFormula('pressureWork',`${term('fixed-product',600)} ÷ ${term('volume',fmt(s.V,2))} = ${result('calculated-pressure',fmt(gasProduct()/s.V,1)+' kPa','Compare this calculated pressure with the pressure gauge.')}`);
 if(step===2)workFormula('productWork',`${term('pressure',fmt(gasProduct()/s.V,2))} × ${term('volume',fmt(s.V,2))} ≈ ${result('fixed-product','600 kPa·L','All these readings have the same product because temperature and gas amount are fixed.')}`);
 if(step===1){const ok=s.tested&&Math.abs(Number(s.prediction)-100)<=1;workState(s.tested?(ok?'good':'bad'):'needed');$('pressureInput').className=s.tested?(ok?'good':'bad'):'';$('workNote').textContent=s.tested?`Your prediction: ${s.prediction} kPa. Measured pressure: 100 kPa.`:'Before the test: 3 L, 200 kPa. The gauge shows the actual pressure.';feedback(s.busy?'Expanding the gas to 6 L…':ok?'Doubling the volume halves the pressure: 200 ÷ 2 = 100 kPa.':s.tested?'Compare prediction and measurement. Revise the calculation, then test again.':'Enter your pressure prediction, then test the expansion.',ok,s.tested&&!ok)}
 if(step===3){const productOK=s.product!==''&&Math.abs(Number(s.product)-600)<.01,volumeOK=s.forecast!==''&&Math.abs(Number(s.forecast)-2.5)<.03,ok=s.tested&&productOK&&volumeOK;workFormula('productEcho',term('predicted-product',s.product||'product'));workState(s.tested?(ok?'good':'bad'):'needed');$('productInput').className=s.tested?(productOK?'good':'bad'):'';$('volumeInput').className=s.tested?(volumeOK?'good':'bad'):'';$('workNote').textContent=s.tested?`Predicted volume: ${s.forecast} L. Measured pressure: ${fmt(gasProduct()/s.V)} kPa. Target: 240 kPa.`:s.forecast===''?'Enter a volume to place a violet prediction mark. The piston stays at 4 L.':'The violet mark shows your prediction. The piston stays at 4 L until you test.';feedback(s.busy?'Moving the piston to your predicted volume…':ok?'150 × 4 = 600 kPa·L. Then 600 ÷ 240 = 2.5 L.':s.tested?'Use the starting product, then divide by 240 kPa.':'Enter both calculations before testing the volume.',ok,s.tested&&!ok)}
 if(s.busy){$('back').disabled=true;$('next').disabled=true}
}
function animate(t){const dt=Math.min(.033,(t-lastTime)/1000||0);lastTime=t;if(!s.paused&&!reduced.matches&&!document.hidden){for(let i=0;i<particles.length;i++){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x>chamber.width-5){p.x=chamber.width-5;p.vx=-Math.abs(p.vx);p.hit=.16}if(p.x<5){p.x=5;p.vx=Math.abs(p.vx)}if(p.y>chamber.height-5){p.y=chamber.height-5;p.vy=-Math.abs(p.vy)}if(p.y<5){p.y=5;p.vy=Math.abs(p.vy)}p.hit=Math.max(0,p.hit-dt);particleNodes[i]?.setAttribute('cx',chamber.x+p.x);particleNodes[i]?.setAttribute('cy',chamber.y+p.y);if(impactNodes[i]){impactNodes[i].setAttribute('y1',chamber.y+p.y-6);impactNodes[i].setAttribute('y2',chamber.y+p.y+6);impactNodes[i].setAttribute('opacity',p.hit/.16)}}}requestAnimationFrame(animate)}
start();requestAnimationFrame(animate);
