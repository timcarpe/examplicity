// Scientific/state invariants, using the actual model source without browser presentation.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
function model(id){
 const context=vm.createContext({
  console,structuredClone,Math,Set,Map,performance,svg:{},
  step:0,start(){},render(){},controls(){},arrive(){},
  reduced:{matches:true},clearTimeout(){},setTimeout(){},
  cancelAnimationFrame(){},requestAnimationFrame(){},
  clamp:(n,min,max)=>Math.max(min,Math.min(max,n)),
  fmt:(n,d=1)=>Number(n.toFixed(d)).toString(),
  validNumber:value=>String(value).trim()!==''&&Number.isFinite(Number(value)),
 });
 const source=readFileSync(fileURLToPath(new URL(`../src/${id}.js`,import.meta.url)),'utf8');
 vm.runInContext(source,context);
 // Presentation is deliberately excluded from these unit tests, not from browser acceptance.
 vm.runInContext('render=()=>{};controls=()=>{};',context);
 return code=>vm.runInContext(code,context);
}
test('Optics: Snell/Fresnel invariants across allowed index and angle combinations',()=>{
 const run=model('physics');
 for(const a of [1,1.2,1.33,1.5,2.42,3.5])for(const b of [1,1.2,1.33,1.5,2.42,3.5]){
  run(`s.inside='insideCustom';s.outside='outsideCustom';materials.insideCustom.n=${a};materials.outsideCustom.n=${b};`);
  const critical=run('critical()');assert.equal(critical===null,a<=b);
  for(const angle of [0,5,15,30,60,80,89.9]){
   run(`s.angle=${angle}`);const result=run('optics()');
   assert.ok(Number.isFinite(result.R)&&result.R>=0&&result.R<=1);
   if(a>b&&angle>critical){assert.equal(result.r,null);assert.equal(result.R,1);}
   else assert.ok(Math.abs(a*Math.sin(angle*Math.PI/180)-b*Math.sin(result.r*Math.PI/180))<1e-9);
   if(angle===0)assert.ok(Math.abs(result.R-((a-b)/(a+b))**2)<1e-12);
  }
 }
});
test('Gas: guided invariants, experimental particle counts and temperature-speed relationship',()=>{
 const run=model('chemistry');run('reset()');
 for(const volume of [2,2.5,3,4,6,8]){
  run(`setVolume(${volume})`);assert.equal(run('gasProduct()'),600);
  assert.equal(run('particles.length'),18);
  assert.ok(run('particles.every(p=>Math.abs(Math.hypot(p.vx,p.vy)-52)<1e-9)'));
 }
 run('step=4');
 for(const temperature of [150,300,600,300]){
  run(`setTemperature(${temperature})`);
  assert.ok(Math.abs(run('gasProduct()')-600*temperature/300)<1e-9);
  assert.ok(run(`particles.every(p=>Math.abs(Math.hypot(p.vx,p.vy)-52*Math.sqrt(${temperature}/300))<1e-9)`));
 }
 for(const delta of [-.5,.5,.5,.5,.5,-.5]){
  run(`changeAmount(${delta})`);
  assert.equal(run('particles.length'),run('18*s.amount'));
  assert.ok(run('s.amount>=.5&&s.amount<=2'));
 }
});
test('Biology: sampling preserves population size, inherited bounds and actual parent identities',()=>{
 const run=model('biology');
 for(const size of [36,72,144])for(const seed of [9137,113866,218595])for(const pressure of ['steady','even','alternating']){
  run(`step=5;N=${size};COUNT=N/3;s.seed=${seed};s.pressure='${pressure}';s.peaks=[{c:6.8,w:.8},{c:13.2,w:.8}];initial();`);
  for(let generation=0;generation<5;generation++){
   const before=run('JSON.stringify(s.population)');run('selectParents()');
   assert.equal(run('JSON.stringify(s.population)'),before);
   assert.equal(run('s.parents.length'),size/3);assert.equal(run('new Set(s.parents.map(p=>p.id)).size'),size/3);
   assert.equal(run('s.pending.length'),size);
   assert.ok(run('s.lineage.every(id=>s.parents.some(p=>p.id===id))'));
   assert.ok(run('s.pending.every(v=>Number.isFinite(v)&&v>=4.05&&v<=15.95)'));
   run("s.phase='offspring';commitGeneration();");assert.equal(run('s.population.length'),size);
  }
 }
});
test('Biology: equal seeds reproduce samples; a new sample changes birds, not food',()=>{
 const run=model('biology');run("step=5;s.seed=9137;s.pressure='steady';s.peaks=[{c:13.2,w:1.4}];initial();");
 const first=run('JSON.stringify(s.population)'),food=run('JSON.stringify(s.peaks)');
 run('initial()');assert.equal(run('JSON.stringify(s.population)'),first);
 run('s.seed+=104729;initial()');assert.notEqual(run('JSON.stringify(s.population)'),first);assert.equal(run('JSON.stringify(s.peaks)'),food);
 const adults=run('JSON.stringify(s.population)');run('s.peaks[0].c=6.8;foodEdited()');assert.equal(run('JSON.stringify(s.population)'),adults);
});
