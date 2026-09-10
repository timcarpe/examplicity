// Standalone acceptance checks. All learner actions use real DOM controls; evaluation only reads.
// Usage: node --experimental-strip-types experiments/visual-discovery/verify.mjs [maths|physics|chemistry|biology]
// Install Playwright separately, or set PLAYWRIGHT_MODULE to an installed module's entry file.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {extractEmbeddedLabContract,parseLabContractV1} from '../../tools/lab-contract/index.ts';
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(here,'../../outputs/visual-discovery');
const ids=['maths','physics','chemistry','biology'],focus=process.argv[2];
if(focus&&!ids.includes(focus))throw new Error('Optional argument must be a lab name.');
await fs.mkdir(out,{recursive:true});
let chromium;
try{({chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright'));}
catch(error){throw new Error('Install Playwright for browser verification, or provide PLAYWRIGHT_MODULE. No runtime lab dependency is required.',{cause:error});}
const report={passed:false,checkedAt:new Date().toISOString(),transport:'Exact generated HTML loaded into an isolated browser page; no external resources',checks:[],screenshots:[]};
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
let page,errors,requests;
const read=code=>page.evaluate(code);
const value=()=>read('({step,ready,feedback:$("feedback").textContent})');
const expectReady=async expected=>assert.equal((await value()).ready,expected,JSON.stringify(await value()));
async function settled(){await page.waitForFunction('!checkpointBusy && !s.busy && s.phase !== "offspring"');}
async function click(selector){if(['#repeat','#restart'].includes(selector)&&!await page.locator('#resetMenu').evaluate(node=>node.open))await page.locator('#resetMenu summary').click();await page.locator(selector).click();await settled();}
async function named(name){await page.getByRole('button',{name,exact:true}).click();await settled();}
async function keys(selector,key,count=1){for(let i=0;i<count;i++)await page.locator(selector).press(key);}
async function next(){const before=(await value()).step;assert.equal(await page.locator('#next').isDisabled(),false,JSON.stringify(await value()));await click('#next');assert.equal((await value()).step,before+1);assert.equal(await read('document.querySelectorAll(".checkpoint-part,.checkpoint-model").length'),0);assert.equal(await read('connectionLayer.children.length'),0);}
async function shot(name){await page.locator('body').click({position:{x:3,y:3}});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});report.screenshots.push(name+'.png');}
async function layout(id,stage){
 for(const [width,height]of [[1200,800],[900,800],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  assert.ok(await read('document.documentElement.scrollWidth <= innerWidth'),`${id} ${stage} ${width}: horizontal overflow`);
  assert.deepEqual(errors,[],`${id} ${stage}: browser errors`);
  assert.ok(await read('svg.getBoundingClientRect().height > 200'),`${id}: missing apparatus`);
  await assertDock(`${id} ${stage} ${width}`);
  await shot(`${id}-${stage}-${width}`);
 }
 await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(100);
}
async function assertDock(label){
 const ui=await read(`(()=>{const shown=n=>n.getClientRects().length>0;return {
  primary:[...document.querySelectorAll('[data-priority="primary"]')].filter(shown).length,
  sources:[...document.querySelectorAll('[data-dock-action]')].filter(shown).length,
  lives:document.querySelectorAll('[role="status"]').length,
  helpOpen:$('hintToggle').getAttribute('aria-expanded')==='true',panelOpen:!$('evidenceHelp').hidden,
  sameDock:$('next').closest('footer')===$('hintToggle').closest('footer'),
  methodPopup:$('working').hasAttribute('data-help'),
  stepLabel:$('stepLabel').textContent,heading:$('outcomeTitle').textContent,
  actionHeight:$('next').hidden?44:$('next').getBoundingClientRect().height
 };})()`);
 assert.ok(ui.primary<=1,label+': competing primary actions');
 assert.equal(ui.sources,0,label+': original action still visible outside dock');
 assert.equal(ui.lives,1,label+': duplicate status announcements');
 assert.equal(ui.helpOpen,ui.panelOpen,label+': disclosure state mismatch');
 assert.equal(ui.sameDock,true,label+': help/action placement changed');
 assert.equal(ui.methodPopup,false,label+': whole-card tooltip');
 assert.ok(ui.stepLabel&&ui.heading,label+': missing orientation or status');
 assert.ok(ui.actionHeight>=44,label+': primary touch target too small');
}
async function slotPosition(){return read(`(()=>{const r=$('next').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};})()`);}
async function opening(id,reducedMotion='reduce'){
 if(page)await page.close();
 const context=await browser.newContext({viewport:{width:1200,height:800},reducedMotion});
 page=await context.newPage();errors=[];requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>requests.push(request.url()));
 await context.route('**/*',route=>route.abort());
 // setContent also permits verification where the host disallows file:// navigation.
 await page.setContent(await fs.readFile(path.join(here,`review/${id}.html`),'utf8'));
 await page.waitForFunction('typeof ready !== "undefined" && $("title").textContent.length > 0');
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[],'Offline labs must not request resources');
 await expectReady(false);
}
function checked(lab,detail){if(page){assert.deepEqual(errors,[],lab+': browser errors');assert.deepEqual(requests,[],lab+': network requests');}report.checks.push({lab,detail});console.log('Passed:',lab,detail);}
try{
 for(const id of ids){
  const html=await fs.readFile(path.join(here,`review/${id}.html`),'utf8');
  const contract=parseLabContractV1(await fs.readFile(path.join(here,`contracts/${id}.lab.json`),'utf8'));
  assert.deepEqual(extractEmbeddedLabContract(html),contract);
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(!match[0].includes('type="application/json"'))new vm.Script(match[1]);
  assert.equal((html.match(/data-examplicity-pedagogy/g)||[]).length,1);
  assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i.test(html));
 }
 checked('packaging','Four valid embedded/sidecar contracts, JavaScript syntax and no external resource tags.');
 if(!focus||focus==='maths'){
  await opening('maths');await layout('maths','opening');
  await keys('[data-control=scale]','End');await next();
  for(let i=0;i<4;i++)await click(`[data-control=tile-${i}]`);
  await next();await keys('[data-control=layers]','End');await next();
  await keys('[data-control=scale]','End');await page.locator('#scaleAnswer').fill('3');
  await expectReady(false);assert.equal(await page.locator('#scaleAnswer').getAttribute('class'),'');
  await named('Test prediction');await expectReady(true);
  await page.locator('#scaleAnswer').fill('2');await expectReady(false);
  await page.locator('#scaleAnswer').fill('3');await named('Test prediction');await next();
  assert.equal((await value()).step,4);
  await keys('[data-control=scale]','Home');await keys('[data-control=scale]','ArrowRight',15);
  await page.locator('#scaleAnswer').fill('4');await expectReady(false);await named('Test prediction');await expectReady(false);
  await click('#hintToggle');await page.waitForFunction('$("hintText").textContent.length > 0');assert.match(await page.locator('#hintText').innerText(),/edge length/);
  await click('#anotherHint');assert.match(await page.locator('#hintText').innerText(),/three-direction/);
  await click('#hintToggle');
  await page.locator('#scaleAnswer').fill('2');await expectReady(false);await named('Test prediction');await expectReady(true);
  assert.equal(await read('8*s.k**3'),64);await layout('maths','transfer');
  const saved=await read('({answer:s.answer,k:s.k,tested:s.tested})');
  await click('#back');assert.equal(await page.locator('#scaleAnswer').inputValue(),'3');await next();
  assert.deepEqual(await read('({answer:s.answer,k:s.k,tested:s.tested})'),saved);
  await click('#repeat');assert.equal(await page.locator('#scaleAnswer').inputValue(),'');await expectReady(false);
  await page.locator('#scaleAnswer').fill('2');await keys('[data-control=scale]','Home');await keys('[data-control=scale]','ArrowRight',15);await named('Test prediction');
  await next();await keys('[data-control=height]','Home');await keys('[data-control=height]','ArrowRight',15);await next();
  await named('Record reading');const reading=await read('structuredClone(s.records[0])');
  await keys('[data-control=height]','End');await keys('[data-control=scale]','End');
  assert.deepEqual(await read('s.records[0]'),reading);assert.ok(await read('document.querySelectorAll(".comparison-ghost").length>0'));
  assert.match(await page.locator('#comparisonNote').innerText(),/Changed:/);
  await named('Separate layers');await page.locator('#mathView').selectOption('face');await page.locator('#mathView').selectOption('length');await page.locator('#mathView').selectOption('solid');
  await named('New target');await layout('maths','experiment');
  const free=await read('({k:s.k,height:s.height,records:s.records,target:s.target})');await click('#back');await next();assert.deepEqual(await read('({k:s.k,height:s.height,records:s.records,target:s.target})'),free);
  await named('Clear readings');assert.equal(await read('s.comparison'),null);assert.equal(await read('s.records.length'),0);
  checked('maths','Six guided experiences; delayed checking; non-unit volume transfer; hints; input invalidation; Back/Forward/Repeat; frozen references; free views/height/targets; three viewports.');
 }
 if(!focus||focus==='physics'){
  await opening('physics');await layout('physics','opening');
  await keys('[data-control=angle]','End');await next();
  await keys('[data-control=angle]','End');await keys('[data-control=angle]','Home');await keys('[data-control=angle]','ArrowRight',37);
  await named('Mark angle');assert.ok(Math.abs(await read('s.angle')-41.8103148958)<.001);await next();
  await named('Replace glass with diamond');await page.locator('#ratioInput').fill('0.5');await page.locator('#angleInput').fill('45');await named('Test prediction');await expectReady(false);
  await page.locator('#ratioInput').fill('0.413');await page.locator('#angleInput').fill('24.4');await expectReady(false);await named('Test prediction');await expectReady(true);
  await page.locator('#ratioInput').fill('0.4');await expectReady(false);await page.locator('#ratioInput').fill('0.413');await named('Test prediction');await next();
  assert.equal(await read('s.inside'),'water');assert.equal(await page.locator('#ratioInput').count(),0);
  await page.locator('#angleInput').fill('42');await named('Test prediction');await expectReady(false);
  await page.locator('#angleInput').fill('48.8');assert.equal(await page.locator('#angleInput').getAttribute('class'),'');
  await named('Test prediction');await expectReady(false);assert.equal(await page.getByRole('button',{name:'Reverse this boundary',exact:true}).count(),1);
  await layout('physics','transfer');await named('Reverse this boundary');await expectReady(true);assert.equal(await read('critical()'),null);assert.notEqual(await read('optics().r'),null);
  await next();await page.locator('#insideMedium').selectOption('insideCustom');await page.locator('#insideIndex').fill('3');await page.locator('#outsideMedium').selectOption('outsideCustom');await page.locator('#outsideIndex').fill('1.2');
  assert.ok(Math.abs(await read('critical()')-Math.asin(.4)*180/Math.PI)<1e-8);
  await keys('[data-control=angle]','End');assert.equal(await read('optics().r'),null);await named('Record reading');
  const old=await read('structuredClone(s.records[0])');await page.locator('#insideIndex').fill('2');assert.deepEqual(await read('s.records[0]'),old);
  assert.match(await page.locator('#comparisonNote').innerText(),/Changed:/);await layout('physics','experiment');
  await click('#back');assert.equal(await read('s.inside'),'air');await next();assert.equal(await page.locator('#insideIndex').inputValue(),'2');assert.deepEqual(await read('s.records[0]'),old);
  await named('Clear readings');assert.equal(await read('s.comparison'),null);
  checked('physics','Observed/marked threshold, diamond calculation, independent water prediction and actual reversal, no typing verdict, immutable custom-index records, stateful navigation and responsive layouts.');
 }
 if(!focus||focus==='chemistry'){
  await opening('chemistry');assert.equal(await page.locator('#working').isHidden(),true);assert.ok(!(await page.locator('main').innerText()).includes('600'));
  await layout('chemistry','opening');await keys('[data-control=volume]','Home');await keys('[data-control=volume]','ArrowRight',4);await expectReady(false);
  assert.equal(await read('s.compressed'),true);await keys('[data-control=volume]','ArrowRight',12);await expectReady(true);await next();
  await named('Record reading');await keys('[data-control=volume]','ArrowRight');await named('Record reading');assert.match(await page.locator('#feedback').innerText(),/almost alike/);assert.equal(await page.locator('#working').isHidden(),true);
  await keys('[data-control=volume]','End');await named('Record reading');await expectReady(true);assert.equal(await page.locator('#working').isHidden(),false);
  assert.deepEqual(await read('s.records.map(r=>Math.round(r[0]*r[1]))'),[600,600,600]);await next();
  await page.locator('#pressureInput').fill('100');await named('Test prediction');await expectReady(false);assert.equal(await read('s.V'),4);
  await page.locator('#pressureInput').fill('150');await expectReady(false);assert.equal(await read('s.V'),3);assert.equal(await page.locator('#pressureInput').getAttribute('class'),'');
  await named('Test prediction');await expectReady(true);await next();
  assert.ok(!(await page.locator('#working').innerText()).includes('÷'));
  await page.locator('#productInput').fill('400');await page.locator('#volumeInput').fill('4');await named('Test prediction');await expectReady(false);
  await page.locator('#productInput').fill('600');await page.locator('#volumeInput').fill('2.5');await expectReady(false);await named('Test prediction');await expectReady(true);
  await layout('chemistry','transfer');await click('#back');assert.equal(await page.locator('#pressureInput').inputValue(),'150');await next();assert.equal(await page.locator('#volumeInput').inputValue(),'2.5');await expectReady(true);
  await next();await keys('[data-control=volume]','Home');await named('Record reading');const old=await read('structuredClone(s.records[0])');
  await keys('[data-control=temperature]','End');await click('[data-control=add-gas]');assert.equal(await read('particles.length'),27);assert.equal(await read('gasProduct()/s.V'),900);
  assert.ok(await read('particles.every(p=>Math.abs(Math.hypot(p.vx,p.vy)-52*Math.sqrt(2))<1e-8)'));assert.deepEqual(await read('s.records[0]'),old);
  await layout('chemistry','experiment');const free=await read('({V:s.V,T:s.temperature,amount:s.amount,records:s.records})');
  await click('#back');assert.equal(await read('s.temperature'),300);assert.equal(await read('particles.length'),18);await next();assert.deepEqual(await read('({V:s.V,T:s.temperature,amount:s.amount,records:s.records})'),free);assert.equal(await read('particles.length'),27);
  await named('Clear readings');assert.equal(await read('s.comparison'),null);
  checked('chemistry','Observation before invariant, both volume directions, clustered-reading nudge, unfamiliar 4 L prediction, independent target volume, actual gauge, conserved guided product/speed, expanded gas conditions, snapshot restoration and frozen comparisons.');
 }
 if(!focus||focus==='biology'){
  await opening('biology');await layout('biology','opening');assert.equal(await page.locator('#working').isHidden(),true);
  const adults=await read('JSON.stringify(s.population)');await keys('[data-control=food-0]','End');assert.equal(await read('JSON.stringify(s.population)'),adults);await next();
  const before=await read('JSON.stringify(s.population)');await named('Select parents');assert.equal(await read('s.parents.length'),24);assert.equal(await read('JSON.stringify(s.population)'),before);
  await named('Produce offspring');assert.equal(await read('s.generation'),1);assert.notEqual(await read('JSON.stringify(s.population)'),before);await next();
  while(await read('s.generation')<3)await named('Next generation');await expectReady(true);await next();
  for(let i=0;i<3;i++)await named('Next generation');await page.locator('#frequencyInput').fill('0');await named('Check frequency');await expectReady(false);
  await page.locator('#frequencyInput').fill(String(await read('Number((stats(s.population).middle*100).toFixed(1))')));await named('Check frequency');await expectReady(true);await next();
  assert.equal(await page.locator('[data-control^=food-]').count(),4);assert.equal(await page.locator('#working').isHidden(),true);
  for(let i=0;i<3;i++)await named('Next generation');await expectReady(false);
  await keys('[data-control=food-0]','Home');await keys('[data-control=food-0]','ArrowRight',5);
  await keys('[data-control=food-1]','Home');await keys('[data-control=food-1]','ArrowRight',17);
  for(let i=0;i<2;i++){await keys(`[data-control=food-width-${i}]`,'Home');await keys(`[data-control=food-width-${i}]`,'ArrowRight',2);}
  const food=await read('structuredClone(s.peaks)');await named('Reset population');assert.deepEqual(await read('s.peaks'),food);
  for(let i=0;i<12&&!(await value()).ready;i++)await named('Next generation');
  await expectReady(true);assert.ok(await read('stats(s.population).middle<s.baseline.middle&&stats(s.population).left>s.baseline.left&&stats(s.population).right>s.baseline.right'));
  await layout('biology','transfer');await next();await named('Record reading');const old=await read('structuredClone(s.records[0])'),environment=await read('structuredClone(s.peaks)');
  await named('New sample');assert.deepEqual(await read('s.peaks'),environment);assert.notDeepEqual(await read('s.population'),old.population);assert.deepEqual(await read('s.records[0]'),old);
  await page.locator('#populationSize').selectOption('144');assert.equal(await read('N'),144);assert.match(await page.locator('#comparisonNote').innerText(),/rescaled/);
  await named('Next generation');assert.equal(await read('s.population.length'),144);await page.locator('#foodPressure').selectOption('even');assert.equal(await read('fitness(4)'),1);assert.equal(await read('fitness(16)'),1);
  await layout('biology','experiment');const free=await read('({N,seed:s.seed,population:s.population,records:s.records,pressure:s.pressure})');await click('#back');assert.equal(await read('N'),72);await next();assert.deepEqual(await read('({N,seed:s.seed,population:s.population,records:s.records,pressure:s.pressure})'),free);
  await page.locator('#foodPressure').selectOption('alternating');await named('Next generation');assert.equal(await read('s.peaks.length'),1);
  await named('Clear readings');assert.equal(await read('s.comparison'),null);
  checked('biology','Adult invariance, parent/inheritance mechanism, worked patterns, independent two-source environment, no click-through success, frequency calculation, new-sample repeatability, cross-size comparison, fixed population counts and preserved experiments.');
 }
 // Presentation-only regressions: stable action slot, disclosure and pointer/focus behaviour.
 if(!focus||focus==='maths'){
  await opening('maths');await keys('[data-control=scale]','End');await next();
  for(let i=0;i<4;i++)await click(`[data-control=tile-${i}]`);
  await next();await keys('[data-control=layers]','End');await next();
  await keys('[data-control=scale]','End');
  for(const width of [1200,900,390]){
   await page.setViewportSize({width,height:width===390?844:800});
   await page.locator('#scaleAnswer').fill('2');await settled();
   const idle=await slotPosition();
   await named('Test prediction');await expectReady(false);const retry=await slotPosition();
   await shot(`polish-maths-retry-${width}`);
   await page.locator('#scaleAnswer').fill('3');
   assert.equal(await read('document.activeElement.id'),'scaleAnswer','Editing must retain focus');
   await named('Test prediction');await expectReady(true);const success=await slotPosition();
   assert.equal(await read('document.activeElement.id'),'next','Test and Continue must retain the same focused button');
   assert.deepEqual(retry,idle,'Retry moved the action slot at '+width);
   assert.deepEqual(success,idle,'Success moved the action slot at '+width);
   await assertDock('polish '+width);await shot(`polish-maths-success-${width}`);
   const apparatus=await read('({width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height})');
   await click('#hintToggle');await page.waitForTimeout(30);
   assert.equal(await page.locator('#hintToggle').getAttribute('aria-expanded'),'true');
   await page.locator('#anotherHint').press('Enter');await page.locator('#previousHint').press('Enter');
   assert.equal(await read('s.helpLevel'),0);await shot(`polish-hint-${width}`);
   assert.deepEqual(await read('({width:svg.getBoundingClientRect().width,height:svg.getBoundingClientRect().height})'),apparatus,'Help must not resize the apparatus');
   assert.deepEqual(await slotPosition(),success,'Help must not move the action in document flow');
   await page.locator('#anotherHint').press('Escape');
   assert.equal(await read('document.activeElement.id'),'hintToggle');
   assert.equal(await page.locator('#evidenceHelp').isHidden(),true);
  }
  await page.locator('#scaleAnswer').fill('3');
  const before=(await value()).step;await page.locator('#next').dblclick();await settled();
  assert.equal((await value()).step,before,'Double-clicking Test must not advance through the new Continue state');
  await expectReady(true);
  await page.locator('#resetMenu summary').press('Enter');
  assert.equal(await page.locator('#repeat').isVisible(),true);
  await page.locator('#repeat').press('Escape');assert.equal(await read('$('+'"resetMenu"'+').open'),false);
  checked('polish','Stable Test/retry/Continue slot at all three widths; one primary and one live region; no whole-card method popup; hints preserve apparatus size and action flow, support previous/next/Escape; reset disclosure; no double-click advancement.');
 }
 // Pointer drags verify the actual apparatus, independently of keyboard journeys.
 for(const id of ids.filter(id=>!focus||focus===id)){
  await opening(id);
  const selectors={maths:'[data-control=scale]',physics:'[data-control=angle]',chemistry:'[data-control=volume]',biology:'[data-control=food-0]'};
  const expression={maths:'s.k',physics:'s.angle',chemistry:'s.V',biology:'s.peaks[0].c'}[id];
  const before=await read(expression),adults=id==='biology'?await read('JSON.stringify(s.population)'):null;
  const box=await page.locator(selectors[id]).boundingBox();assert.ok(box);
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+(id==='physics'||id==='chemistry'?-50:50),y,{steps:8});await page.mouse.up();
  assert.notEqual(await read(expression),before,id+': pointer must change the model');
  if(id==='biology')assert.equal(await read('JSON.stringify(s.population)'),adults);
  checked(id,'Pointer drag changes the apparatus state without detached controls.');
 }
 // Normal-motion checks are separate from fast reduced-motion acceptance journeys.
 if(!focus||focus==='physics'){
  await opening('physics','no-preference');await keys('[data-control=angle]','End');await page.locator('#next').click();
  await page.waitForFunction('checkpointBusy');assert.equal(await read('document.querySelector(".lab").inert'),true);await settled();assert.equal(await read('connectionLayer.children.length'),0);
  await keys('[data-control=angle]','End');await keys('[data-control=angle]','Home');await keys('[data-control=angle]','ArrowRight',37);await named('Mark angle');
  await page.locator('[data-source=n-outside]').click();assert.equal(await read('connectionLayer.children.length'),0);await page.keyboard.press('Escape');
  await page.locator('#traceWorking').click();await page.waitForSelector('.travelling-value',{state:'attached'});assert.ok(await read('document.querySelectorAll(".travelling-value").length>0'));await page.screenshot({path:path.join(out,'physics-requested-trace.png'),fullPage:true});report.screenshots.push('physics-requested-trace.png');await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#traceWorking').click();await page.waitForTimeout(80);assert.equal(await read('document.querySelectorAll(".travelling-value").length'),0);assert.ok(await read('document.querySelectorAll(".connection-halo").length>0'));
  checked('motion','Selective checkpoint transitions, navigation lock, source click without tracing, opt-in trace and reduced-motion static alternative.');
 }
 if(!focus||focus==='biology'){
  await opening('biology','no-preference');await keys('[data-control=food-0]','End');await next();await named('Select parents');const adults=await read('JSON.stringify(s.population)');
  await page.getByRole('button',{name:'Produce offspring',exact:true}).click();assert.equal(await read('s.phase'),'offspring');assert.equal(await read('JSON.stringify(s.population)'),adults);assert.ok(await read('s.lineage.every(id=>s.parents.some(p=>p.id===id))'));await shot('biology-inheritance');await settled();assert.notEqual(await read('JSON.stringify(s.population)'),adults);
  checked('motion','Normal-motion offspring retain actual parent identities and do not replace adults before the inheritance transition finishes.');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 report.passed=true;
} catch(error){report.error=error.stack;if(page){report.lastState=await value().catch(()=>null);await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});}throw error;}
finally{await fs.writeFile(path.join(out,focus?`verification-${focus}.json`:'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(report,null,2));
