const lesson=[
 {label:'Compress the gas',title:'Halve the gas volume at constant temperature.',intro:'Push the piston from 6 L to 3 L. Compare the pressure readings.'},
 {label:'Predict an expansion',title:'Predict the pressure when the volume doubles.',intro:'The gas starts at 3 L and 200 kPa. Calculate its pressure at 6 L, then test.'},
 {label:'Find the invariant',title:'Check whether pressure × volume stays constant.',intro:'Record three different volumes and compare their products.'},
 {label:'Calculate a volume',title:'Calculate the volume needed for 240 kPa.',intro:'Use the starting reading, 150 kPa at 4 L. Enter your calculation, then test the volume.'},
 {label:'Experiment',title:'Investigate the pressure–volume relationship.',intro:'Move the piston, collect readings or calculate a new pressure target.'}
];
const s={V:6,prediction:'',tested:false,product:'',forecast:'',records:[],target:null,paused:false,busy:false};
const particles=[];let chamber={x:0,y:0,width:1,height:1},lastTime=0,particleNodes=[],impactNodes=[],testFrame=0;
function cancelTest(){cancelAnimationFrame(testFrame);s.busy=false}
function reset(){cancelTest();Object.assign(s,{V:6,prediction:'',tested:false,product:'',forecast:'',records:[],target:null,paused:false});particles.length=0;for(let i=0;i<18;i++){const a=i*2.399;particles.push({x:NaN,y:NaN,vx:52*Math.cos(a),vy:52*Math.sin(a),hit:0})}}
function enter(){cancelTest();s.tested=false;s.target=null;if(step===0)s.V=6;if(step===1){s.V=3;s.prediction=''}if(step===2){s.V=4;s.records=[]}if(step===3){s.V=4;s.forecast='';s.product=''}if(step===4){s.V=4;s.records=[]}controls()}
function setVolume(v){if(s.busy)return;s.V=Math.round(v*20)/20;render()}
function keep(){if(s.records.some(r=>Math.abs(r[0]-s.V)<.1)){feedback('This volume is already recorded. Choose another volume.',false,true);return}s.records.push([s.V,600/s.V]);s.records=s.records.slice(-6);render()}
function testVolume(target){
 if(s.busy)return;const from=s.V,began=performance.now();s.busy=true;s.tested=false;
 for(const node of document.querySelectorAll('#working input,#working button,#controls button'))node.disabled=true;
 const tick=t=>{const progress=reduced.matches?1:clamp((t-began)/650,0,1),ease=progress*progress*(3-2*progress);s.V=from+(target-from)*ease;
  if(progress<1){render();testFrame=requestAnimationFrame(tick)}else{s.V=target;s.busy=false;s.tested=true;controls();render()}
 };testFrame=requestAnimationFrame(tick);
}
function setupGasWork(){
 if(step===0)workSetup('Calculate the pressure from a fixed product',workRow('starting pressure × volume','100 × 6 = <span class="lab-math-surface">600 kPa·L</span>')+workRow('product ÷ current volume',workOutput('pressureWork')),'The same product lets you calculate pressure after an expansion.');
 if(step===1){
  workSetup('Predict the pressure at 6 L',workRow('starting pressure × volume','200 × 3 = <span class="lab-math-surface">600 kPa·L</span>')+workRow('product ÷ new volume','p = 600 ÷ 6 = <input id="pressureInput" type="number" min="75" max="300" step="1" inputmode="decimal" aria-label="Predicted pressure at 6 litres"> kPa'),'The gauge shows the actual pressure. Your prediction is recorded here.',true);
  $('pressureInput').value=s.prediction;$('pressureInput').oninput=e=>{s.prediction=e.target.value;s.tested=false;s.V=3;render()};
  workAction('Test expansion to 6 L',()=>{if(s.prediction===''||!Number.isFinite(Number(s.prediction))){feedback('Enter a pressure prediction before testing.',false,true);return}testVolume(6)});
 }
 if(step===2)workSetup('Compare the products',workRow('current pressure × volume',workOutput('productWork')),'Record another volume to test whether this product changes.');
 if(step===3){
  workSetup('Calculate the volume at 240 kPa',workRow('starting pressure × volume','150 × 4 = <input id="productInput" type="number" inputmode="decimal" aria-label="Initial pressure times volume"> kPa·L')+workRow('product ÷ target pressure','V = <span id="productEcho">product</span> ÷ 240 = <input id="volumeInput" type="number" min="2" max="8" step="0.05" inputmode="decimal" aria-label="Predicted volume"> L'),'The violet mark on the scale shows your predicted volume. The piston moves only when you test.',true);
  $('productInput').value=s.product;$('volumeInput').value=s.forecast;
  $('productInput').oninput=e=>{s.product=e.target.value;s.tested=false;s.V=4;render()};$('volumeInput').oninput=e=>{s.forecast=e.target.value;s.tested=false;s.V=4;render()};
  workAction('Test predicted volume',()=>{if(s.product===''||s.forecast===''||Number(s.forecast)<2||Number(s.forecast)>8){feedback('Enter the product and a volume between 2 L and 8 L.',false,true);return}testVolume(Number(s.forecast))});
 }
 if(step===4)$('working').hidden=true;
}
function controls(){
 $('controls').innerHTML='';setupGasWork();
 if(step===2||step===4)button('Record reading',keep);
 if(step===4){button('New target',()=>{const values=[240,120,200,100,80];s.target=values[(values.indexOf(s.target)+1)%values.length];render()});button('Clear readings',()=>{s.records=[];render()})}
 button(s.paused?'Play particles':'Pause particles',()=>{s.paused=!s.paused;const b=$('controls').lastElementChild;b.textContent=s.paused?'Play particles':'Pause particles';b.setAttribute('aria-pressed',s.paused)},{'aria-pressed':s.paused});
}
function updateGasWork(){
 if(step===0)workValue('pressureWork',`600 ÷ ${fmt(s.V,2)} = ${fmt(600/s.V,1)} kPa`);
 if(step===2)workValue('productWork',`${fmt(600/s.V,2)} × ${fmt(s.V,2)} ≈ 600 kPa·L`);
 if(step===1){const ok=s.tested&&Math.abs(Number(s.prediction)-100)<=1;workState(s.tested?(ok?'good':'bad'):'needed');$('pressureInput').className=s.tested?(ok?'good':'bad'):'';$('workNote').textContent=s.tested?`Your prediction: ${s.prediction} kPa. Measured pressure: 100 kPa.`:'Before the test: 3 L, 200 kPa. The gauge shows the actual pressure.';feedback(s.busy?'Expanding the gas to 6 L…':ok?'Doubling the volume halves the pressure: 200 ÷ 2 = 100 kPa.':s.tested?'Compare prediction and measurement. Revise the calculation, then test again.':'Enter your pressure prediction, then test the expansion.',ok,s.tested&&!ok)}
 if(step===3){const productOK=s.product!==''&&Math.abs(Number(s.product)-600)<.01,volumeOK=s.forecast!==''&&Math.abs(Number(s.forecast)-2.5)<.03,ok=s.tested&&productOK&&volumeOK;workValue('productEcho',s.product||'product');workState(s.tested?(ok?'good':'bad'):'needed');$('productInput').className=s.tested?(productOK?'good':'bad'):'';$('volumeInput').className=s.tested?(volumeOK?'good':'bad'):'';$('workNote').textContent=s.tested?`Predicted volume: ${s.forecast} L. Measured pressure: ${fmt(600/s.V)} kPa. Target: 240 kPa.`:s.forecast===''?'Enter a volume to place a violet prediction mark. The piston stays at 4 L.':'The violet mark shows your prediction. The piston stays at 4 L until you test.';feedback(s.busy?'Moving the piston to your predicted volume…':ok?'150 × 4 = 600 kPa·L. Then 600 ÷ 240 = 2.5 L.':s.tested?'Use the starting product, then divide by 240 kPa.':'Enter both calculations before testing the volume.',ok,s.tested&&!ok)}
 if(s.busy){$('back').disabled=true;$('next').disabled=true}
}
function animate(t){const dt=Math.min(.033,(t-lastTime)/1000||0);lastTime=t;if(!s.paused&&!reduced.matches&&!document.hidden){for(let i=0;i<particles.length;i++){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x>chamber.width-5){p.x=chamber.width-5;p.vx=-Math.abs(p.vx);p.hit=.16}if(p.x<5){p.x=5;p.vx=Math.abs(p.vx)}if(p.y>chamber.height-5){p.y=chamber.height-5;p.vy=-Math.abs(p.vy)}if(p.y<5){p.y=5;p.vy=Math.abs(p.vy)}p.hit=Math.max(0,p.hit-dt);particleNodes[i]?.setAttribute('cx',chamber.x+p.x);particleNodes[i]?.setAttribute('cy',chamber.y+p.y);if(impactNodes[i]){impactNodes[i].setAttribute('y1',chamber.y+p.y-6);impactNodes[i].setAttribute('y2',chamber.y+p.y+6);impactNodes[i].setAttribute('opacity',p.hit/.16)}}}requestAnimationFrame(animate)}
start();requestAnimationFrame(animate);
