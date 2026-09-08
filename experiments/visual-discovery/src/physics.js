const lesson=[
 {
  "label": "Follow the ray",
  "title": "Explore what happens when light leaves glass.",
  "intro": "The laser enters the curved face straight on. Rotate it and watch how the ray bends at the flat glass–air boundary.",
  "success": "The ray bends away from the normal."
 },
 {
  "label": "Find the boundary",
  "title": "Find the angle where light stops escaping.",
  "intro": "You have seen the refracted ray bend away from the normal. Keep rotating until it runs along the surface, then mark that angle.",
  "success": "You found the critical angle for glass."
 },
 {
  "label": "Predict, then test",
  "title": "Use the glass result to predict what diamond will do.",
  "intro": "Glass reached its limit at 41.8°. Replace it with diamond, then use the same calculation to find the new critical angle before testing.",
  "success": "Your prediction matches the diamond boundary."
 },
 {
  "label": "Reverse the direction",
  "title": "Check the same boundary in the opposite direction.",
  "intro": "A critical angle appeared when light left a higher-index material. Now send light from air into glass and test angles from 5° to 80°.",
  "success": "The direction of travel matters."
 },
 {
  "label": "Experiment",
  "title": "Choose your own pair of materials and compare the results.",
  "intro": "You now have a way to predict total internal reflection. Change either material or set an index of your own, then compare your calculations with the rays.",
  "success": ""
 }
];
const materials={air:{name:'Air',n:1},water:{name:'Water',n:1.33},glass:{name:'Glass',n:1.5},diamond:{name:'Diamond',n:2.42},insideCustom:{name:'Custom A',n:1.6},outsideCustom:{name:'Custom B',n:1.2}};
const s={angle:15,inside:'glass',outside:'air',below:false,above:false,marked:false,low:false,high:false,ratio:'',angleText:'',tested:false,records:[],swapped:false};
let previousMaterial='';
function reset(){Object.assign(s,{angle:15,inside:'glass',outside:'air',below:false,above:false,marked:false,low:false,high:false,ratio:'',angleText:'',tested:false,records:[]})}
function critical(){const a=materials[s.inside].n,b=materials[s.outside].n;return a>b?Math.asin(b/a)*180/Math.PI:null}
function optics(angle=s.angle){const a=materials[s.inside].n,b=materials[s.outside].n,i=angle*Math.PI/180,q=a/b*Math.sin(i);if(q>1+1e-9)return{r:null,R:1};const r=Math.asin(Math.min(1,q)),ci=Math.cos(i),cr=Math.cos(r);const rs=(a*ci-b*cr)/(a*ci+b*cr),rp=(a*cr-b*ci)/(a*cr+b*ci);return{r:r*180/Math.PI,R:(rs*rs+rp*rp)/2}}
function enter(){s.marked=false;s.below=false;s.above=false;s.tested=false;if(step===0){s.angle=15;s.inside='glass';s.outside='air'}if(step===1){s.angle=25;s.inside='glass';s.outside='air';s.below=true}if(step===2){s.inside='glass';s.outside='air';s.angle=Math.asin(1/1.5)*180/Math.PI;s.ratio='';s.angleText='';s.swapped=false}if(step===3){s.inside='air';s.outside='glass';s.angle=35;s.low=false;s.high=false}if(step===4){s.inside='glass';s.outside='air';s.angle=30;s.records=[]}controls()}
function setAngle(v){let c=critical();v=Math.round(v*10)/10;if(c!==null&&Math.abs(v-c)<.45&&step!==2)v=c;s.angle=v;if(step===2&&s.swapped){s.angleText=fmt(v);s.tested=false;if($('angleInput'))$('angleInput').value=s.angleText}if(step===1&&c!==null){if(v<c-1.5)s.below=true;if(v>c+1.5)s.above=true;s.marked=false}if(step===3){if(v<=6)s.low=true;if(v>=79)s.high=true}render()}
function materialTone(id){return{air:'slate',glass:'blue',water:'teal',diamond:'violet',insideCustom:'blue',outsideCustom:'teal'}[id]}
function setupPhysicsWork(){
 $('working').hidden=true;
 if(step===1||step===2&&!s.swapped)workSetup('Calculate from the boundary measurement',workRow('index ratio',workOutput('ratioWork'))+workRow('inverse sine',workOutput('criticalWork')),step===1?'Mark the critical angle to compare the calculation with the ray.':'Use the same calculation after changing the material.');
 if(step===2&&s.swapped){
  workSetup('Calculate before testing the beam',workRow('index ratio','<span id="ratioSubstitution"></span> <input data-source="index-ratio" id="ratioInput" type="number" step="0.001" inputmode="decimal" aria-label="Sine of critical angle">')+workRow('inverse sine','<span id="angleSubstitution"></span> <input id="angleInput" type="number" min="5" max="80" step="0.1" inputmode="decimal" aria-label="Predicted critical angle in degrees">°'),'The dashed mark keeps the glass result, 41.8°, for comparison.',true);
  $('ratioInput').value=s.ratio;$('angleInput').value=s.angleText;explain($('ratioInput'),'Your index ratio becomes the input to inverse sine.','index-ratio');explanations.set('index-ratio','The index ratio from the first line becomes the input to inverse sine.');
  $('ratioInput').oninput=e=>{s.ratio=e.target.value;s.tested=false;render()};
  $('angleInput').oninput=e=>{s.angleText=e.target.value;s.tested=false;if(e.target.value!=='')s.angle=clamp(Number(e.target.value),5,80);render()};
  workAction('Test the beam',()=>{if(s.ratio===''||s.angleText===''){feedback('Enter both values before testing.',false,true);return}s.tested=true;render()});
 }
 if(step===4)workSetup('Calculate the critical angle',workRow('index ratio',workOutput('ratioWork'))+workRow('inverse sine',workOutput('criticalWork')),'A critical angle requires a higher refractive index on the incident side.');
}
function controls(){
 $('controls').innerHTML='';$('context').innerHTML='';
 if(step===1)button('Mark this angle',()=>{const c=critical();if(s.below&&s.above&&Math.abs(s.angle-c)<=.55){s.angle=c;s.marked=true;render()}else{render();feedback(!s.below||!s.above?'Observe both refraction and total internal reflection first.':optics().r===null?'The ray is fully reflected. Reduce the incidence angle slightly.':'The ray still travels upward. Increase the incidence angle slightly.',false,true)}});
 if(step===2&&!s.swapped){const b=button('Replace glass with diamond',()=>{s.swapped=true;s.inside='diamond';s.angle=42;s.tested=false;controls();render()},{'data-priority':'primary'});$('context').appendChild(b)}
 if(step===2&&s.swapped)$('context').innerHTML='<div class="material-change"><span class="material-swatch" style="background:var(--lab-concept-blue-fill)"></span>Glass · n = 1.5 <span aria-label="replaced by">→</span><span class="material-swatch" style="background:var(--lab-concept-violet-fill)"></span>Diamond · n = 2.42</div>';
 if(step===4){
  for(const[key,label]of [['inside','From'],['outside','Into']]){
   const l=document.createElement('label');l.className='material-choice';l.textContent=label+' ';
   const swatch=document.createElement('span');swatch.className='material-swatch';swatch.style.background=`var(--lab-concept-${materialTone(s[key])}-fill)`;l.appendChild(swatch);
   const select=document.createElement('select');select.id=key+'Medium';select.setAttribute('aria-label',label+' medium');explain(select,key==='inside'?'The beam approaches the boundary through this medium. Choose Custom to set a hypothetical index.':'The beam can leave into this medium. Choose Custom to set a hypothetical index.');
   for(const[id,m]of Object.entries(materials).filter(([id])=>!id.endsWith('Custom')||id===key+'Custom')){const opt=document.createElement('option');opt.value=id;opt.textContent=id.endsWith('Custom')?'Custom':`${m.name} · n ${fmt(m.n,2)}`;select.appendChild(opt)}
   select.value=s[key];select.onchange=e=>{s[key]=e.target.value;s.marked=false;controls();render()};l.appendChild(select);if(s[key].endsWith('Custom')){const input=document.createElement('input');input.type='number';input.className='material-index';input.id=key+'Index';input.min='1';input.max='3.5';input.step='.01';input.value=materials[s[key]].n;input.setAttribute('aria-label',label+' refractive index');explain(input,'Set a hypothetical refractive index from 1 to 3.5. Larger indices mean slower light in the material.');input.oninput=()=>{const value=Number(input.value);if(input.value!==''&&value>=1&&value<=3.5){materials[s[key]].n=value;s.marked=false;render()}};l.appendChild(input)}$('context').appendChild(l);
  }
  button('Record reading',()=>{s.records.push([`${materials[s.inside].name} (${fmt(materials[s.inside].n,2)}) → ${materials[s.outside].name} (${fmt(materials[s.outside].n,2)})`,`${fmt(s.angle)}°`,critical()===null?'None':`${fmt(critical())}°`,optics().r===null?'None':`${fmt((1-optics().R)*100)}%`]);s.records=s.records.slice(-6);render()});
  button('Find threshold',()=>{const c=critical();if(c===null){feedback('This pair has no critical angle in this direction.',false,true);return}s.angle=c;s.marked=true;render()});
  button('Clear readings',()=>{s.records=[];render()});
 }
 setupPhysicsWork();workingExplanation('For light leaving a higher-index medium, sin c = refracted index ÷ incident index. First divide the two labelled indices; then use inverse sine in degrees. No critical angle exists in the opposite direction.');
}
start();
