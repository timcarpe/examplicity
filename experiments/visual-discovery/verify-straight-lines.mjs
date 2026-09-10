// Browser-only learner actions; evaluation reads state/geometry but never sets answers or progression.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {extractEmbeddedLabContract,parseLabContractV1} from '../../tools/lab-contract/index.ts';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../outputs/straight-line-coordinates-equations');
await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
const html=await fs.readFile(path.resolve(here,'../../public/labs/mathematics/straight-line-coordinates-equations.html'),'utf8');
const report={passed:false,checkedAt:new Date().toISOString(),artifactSha256:createHash('sha256').update(html).digest('hex'),transport:'Exact standalone HTML; all external requests blocked',checks:[],screenshots:[]};
let page,context,errors=[],requests=[];
const read=code=>page.evaluate(code);
const state=()=>read('({step,ready,feedback:$("feedback").textContent})');
const ready=async v=>assert.equal((await state()).ready,v,JSON.stringify(await state()));
async function settle(){await page.waitForFunction('!checkpointBusy');await page.waitForTimeout(35);}
async function click(id){await page.locator(id).click();await settle();}
async function key(id,value,n=1){for(let i=0;i<n;i++)await page.locator(id).press(value);await settle();}
async function next(){const before=(await state()).step;await ready(true);await click('#next');assert.equal((await state()).step,before+1);}
async function ends(){await key('[data-control=rail-probe]','Home');await key('[data-control=rail-probe]','End');}
async function fill(m,c){await page.locator('#gradientInput').fill(m);await page.locator('#interceptInput').fill(c);await settle();}
async function tilt(value){await key('[data-control=rail-tilt]','Home');await key('[data-control=rail-tilt]','ArrowUp',Math.round((value+1.5)/.25));}
async function slide(value){await key('[data-control=rail-slide]','Home');await key('[data-control=rail-slide]','ArrowUp',Math.round((value+2)/.5));}
async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});report.screenshots.push(name+'.png');}
function checked(text){assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);report.checks.push(text);console.log('Passed:',text);}
async function layout(name){
 for(const [width,height]of [[1200,800],[900,800],[390,844]]){
  await page.setViewportSize({width,height});await settle();
  assert.equal(await read('document.documentElement.scrollWidth<=innerWidth'),true,name+': horizontal overflow');
  assert.equal(await read('document.querySelectorAll("[data-priority=primary]:not([hidden])").length'),1);
  assert.equal(await read('document.querySelectorAll("[role=status]").length'),1);
  assert.ok(await read('svg.getBoundingClientRect().bottom <= $("learningDock").getBoundingClientRect().top'),name+': diagram overlaps dock');
  await shot(`${name}-${width}`);
 }
 await page.setViewportSize({width:1200,height:800});await settle();
}
async function open(motion='reduce',touch=false){
 if(context)await context.close();context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1200,height:800},hasTouch:touch,isMobile:touch,reducedMotion:motion});page=await context.newPage();errors=[];requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));await context.route('**/*',r=>r.abort());
 await page.setContent(html);await page.waitForFunction('typeof ready!=="undefined"');await settle();
}
try{
 const contract=parseLabContractV1(await fs.readFile(path.resolve(here,'../../lab-contracts/mathematics/straight-line-coordinates-equations.lab.json'),'utf8'));assert.deepEqual(extractEmbeddedLabContract(html),contract);
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(!/type=["']application\/(?:ld\+)?json["']/i.test(match[0]))new vm.Script(match[1]);
 assert.ok(!/<script[^>]+src=["']https?:|<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]+href=["']https?:|<img[^>]+src=["']https?:/i.test(html));
 await open();await layout('opening');await ready(false);
 // A real pointer drag changes the model without a detached numeric control.
 const box=await page.locator('[data-control=rail-tilt]').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2+35,{steps:6});await page.mouse.up();await settle();
 assert.equal(await read('s.m'),.5);await ready(false);await ends();await ready(true);await next();
 await slide(2);await ends();await ready(true);
 assert.equal(await page.locator('#traceWorking').isVisible(),false);assert.ok(await page.locator('[data-value-ref]').count()>0);await shot('working-values');
 await next();assert.equal(await read('connectionLayer.children.length'),0);await layout('equation');
 await fill('1/2','1');await ready(false);assert.equal(await page.locator('#gradientInput').getAttribute('class'),'');await ends();await ready(false);
 await click('#next');await ready(false);await ends();await ready(true);await next();
 checked('Tilt and slide are independent; whole-interval checks; labelled source values; no pre-test correctness or reusing pre-test travel.');
 // Initial transfer rail already passes B but not A; a matching equation is insufficient.
 await fill('.5','0');await click('#next');await ends();await ready(false);assert.match((await state()).feedback,/mounting point/);
 await tilt(-.5);await slide(2);await fill('2','2');await click('#next');await ready(false);assert.match((await state()).feedback,/different directions/);
 await layout('retry');await click('#hintToggle');assert.equal(await page.locator('#hintToggle').getAttribute('aria-expanded'),'true');
 assert.match(await page.locator('#hintText').innerText(),/Both mounts/);await click('#anotherHint');await click('#anotherHint');assert.match(await page.locator('#hintTitle').innerText(),/Worked example/);await page.locator('#previousHint').press('Escape');assert.equal(await page.locator('#hintToggle').getAttribute('aria-expanded'),'false');
 await fill('−1/2','2');await ready(false);await click('#next');await ready(false);await ends();await ready(true);await layout('transfer-success');
 // Stable primary bounds through editing, retry and restored success at each size.
 for(const width of [1200,900,390]){
  await page.setViewportSize({width,height:844});await settle();
  const bounds=()=>read('(()=>{const r=$("next").getBoundingClientRect();return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height}})()');
  const before=await bounds();await fill('2','2');await click('#next');await ready(false);assert.deepEqual(await bounds(),before);
  await fill('-.5','2');await click('#next');await ends();await ready(true);assert.deepEqual(await bounds(),before);
  const modelBefore=await read('svg.getBoundingClientRect().height');await click('#hintToggle');assert.equal(await read('svg.getBoundingClientRect().height'),modelBefore);assert.deepEqual(await bounds(),before);await shot(`hint-${width}`);await click('#hintToggle');
 }
 await page.setViewportSize({width:1200,height:800});await settle();
 const saved=await read('structuredClone(s)');await click('#back');assert.equal(await page.locator('#gradientInput').inputValue(),'1/2');await click('#next');assert.deepEqual(await read('structuredClone(s)'),saved);
 await click('#resetMenu summary');await click('#repeat');await ready(false);assert.equal(await page.locator('#gradientInput').inputValue(),'');
 await tilt(-.5);await slide(2);await fill('-.5','2');await click('#next');await ends();await next();
 checked('Falling-rail transfer rejects one-point coincidence; wrong/revised predictions; evidence-first hints; stable Test/Continue bounds; snapshot navigation and separate Repeat.');
 await tilt(0);await slide(-2);await fill('0','-2');await click('#next');await ends();await ready(true);await layout('horizontal');await next();
 await key('[data-control=rail-vertical]','Home');await key('[data-control=rail-vertical]','ArrowRight',10);
 await page.locator('#axisInput').selectOption('y');await page.locator('#constantInput').fill('2');await click('#next');await ready(false);assert.match((await state()).feedback,/horizontal/);await layout('vertical-retry');
 await page.locator('#axisInput').selectOption('x');await page.locator('#constantInput').fill('1/0');await click('#next');await ready(false);
 await page.locator('#constantInput').fill('2');await click('#next');await ends();await ready(true);await layout('vertical-success');await next();
 checked('Horizontal zero-gradient and vertical constant-x branches; visible wrong-axis equation; invalid fraction rejection and full vertical travel.');
 await page.getByRole('button',{name:'Record reading',exact:true}).click();await settle();const frozen=await read('structuredClone(s.records[0])');
 await tilt(-1.5);await slide(-2);await key('[data-control=rail-probe]','Home');assert.deepEqual(await read('s.records[0]'),frozen);
 assert.equal(await page.locator('[data-rail=saved]').count(),1);assert.match(await page.locator('#comparisonNote').innerText(),/Changed:/);
 await page.locator('#railMode').selectOption('vertical');await key('[data-control=rail-vertical]','End');assert.deepEqual(await read('s.records[0]'),frozen);
 await page.getByRole('button',{name:'Record reading',exact:true}).click();await settle();await click('[data-reading="1"]');assert.match(await page.locator('#comparisonNote').innerText(),/Same conditions/);
 await page.locator('#railMode').selectOption('linear');await settle();
 // The experiment legitimately has no primary completion action.
 for(const width of [1200,900,390]){await page.setViewportSize({width,height:844});await settle();assert.equal(await read('document.documentElement.scrollWidth<=innerWidth'),true);await shot(`experiment-${width}`);}
 const free=await read('structuredClone(s)');await click('#back');await click('#next');assert.deepEqual(await read('structuredClone(s)'),free);
 for(let i=0;i<7;i++){await page.getByRole('button',{name:'Record reading',exact:true}).click();await settle();}assert.equal(await read('s.records.length'),6);
 await page.getByRole('button',{name:'Clear readings',exact:true}).click();await settle();assert.equal(await read('s.comparison'),null);assert.equal(await page.locator('[data-rail=saved]').count(),0);
 checked('Open experiment, immutable coefficient/coordinate records, selectable references across orientations, six-record retention and restored experiment state.');
 await open('no-preference');await tilt(.5);await ends();await ready(true);await click('#next');assert.equal((await state()).step,1);assert.equal(await read('document.querySelectorAll(".checkpoint-part,.checkpoint-model").length'),0);
 await slide(2);await ends();assert.equal(await page.locator('#traceWorking').isVisible(),false);await key('[data-control=rail-slide]','ArrowDown');await page.waitForTimeout(100);assert.equal(await read('connectionLayer.children.length'),0);
 checked('Normal and reduced motion; checkpoint cleanup; hidden experimental trace control and clean manipulation state.');
 await open('reduce',true);
 const client=await context.newCDPSession(page);
 async function touchDrag(selector,dx,dy){
  const r=await page.locator(selector).boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=8;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle();
 }
 const unit=await read('railLayout().unit');const scrollBefore=await read('scrollY');
 await touchDrag('[data-control=rail-tilt]',0,unit);assert.equal(await read('s.m'),.5);assert.equal(await read('scrollY'),scrollBefore);
 await touchDrag('[data-control=rail-probe]',-2*unit,0);await touchDrag('[data-control=rail-probe]',4*unit,0);await ready(true);
 await shot('touch-opening-success-390');
 checked('Mobile touch gestures operate Tilt and the carriage without scrolling the page or bypassing interval evidence.');
 report.passed=true;
}catch(error){report.error=error.stack;if(page)await shot('failure');throw error;}
finally{await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
