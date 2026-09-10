// Interaction tests operate real browser controls. Evaluation reads state and layout only.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {extractEmbeddedLabContract,parseLabContractV1} from '../../tools/lab-contract/index.ts';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../outputs/histograms-pilot');
await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const html=await fs.readFile(path.join(here,'review/histograms.html'),'utf8');
const report={passed:false,checkedAt:new Date().toISOString(),artifactSha256:createHash('sha256').update(html).digest('hex'),checks:[],screenshots:[]};
let page,context,errors=[],requests=[];
const read=code=>page.evaluate(code);
async function settle(){await page.waitForFunction('!checkpointBusy');await page.waitForTimeout(25);}
async function click(selector){await page.locator(selector).click();await settle();}
async function keys(selector,key,n=1){for(let i=0;i<n;i++)await page.locator(selector).press(key);await settle();}
async function ready(value){assert.equal(await read('ready'),value,await read('$("feedback").textContent'));}
async function next(){const step=await read('step');await ready(true);await click('#next');assert.equal(await read('step'),step+1);}
async function frequency(i,value){await keys(`[data-control=hist-bar-${i}]`,'Home');await keys(`[data-control=hist-bar-${i}]`,'ArrowUp',value);}
async function ruler(value){await keys('[data-control=hist-ruler]','Home');await keys('[data-control=hist-ruler]','ArrowRight',value*2);}
async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});report.screenshots.push(name+'.png');}
function checked(name){assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);report.checks.push(name);console.log('Passed:',name);}
async function open(motion='reduce',touch=false){
 if(context)await context.close();
 context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1200,height:800},reducedMotion:motion,hasTouch:touch,isMobile:touch});
 page=await context.newPage();errors=[];requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await context.route('**/*',r=>r.abort());await page.setContent(html);await page.waitForFunction('typeof ready!=="undefined"');await settle();
}
async function layout(name){
 for(const [width,height]of [[1200,800],[900,800],[390,844]]){
  await page.setViewportSize({width,height});await settle();
  assert.ok(await read('document.documentElement.scrollWidth<=innerWidth'),name+' overflow at '+width);
  const g=await read(`(()=>{const a=svg.getBoundingClientRect(),b=$('learningDock').getBoundingClientRect();return {h:a.height,w:a.width,overlap:a.bottom>b.top,lives:document.querySelectorAll('[role=status]').length};})()`);
  assert.ok(g.h>=300&&g.w>250);assert.equal(g.overlap,false);assert.equal(g.lives,1);
  assert.deepEqual(errors,[]);await shot(name+'-'+width);
 }
 await page.setViewportSize({width:1200,height:800});await settle();
}
try{
 const contract=parseLabContractV1(await fs.readFile(path.join(here,'contracts/histograms.lab.json'),'utf8'));
 assert.deepEqual(extractEmbeddedLabContract(html),contract);
 const original=JSON.parse(await fs.readFile(path.resolve(here,'../../lab-contracts/mathematics/histogram-area-cumulative-distribution.lab.json'),'utf8'));
 assert.deepEqual(contract.invariants,original.invariants);assert.deepEqual(contract.nonGoals,original.nonGoals);assert.equal(contract.relationship,original.relationship);
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(!m[0].includes('type="application/json"'))new vm.Script(m[1]);
 await open();await ready(false);await layout('opening');
 await keys('[data-control=hist-bar-1]','End');await click('#next');await ready(false);await layout('area-retry');
 // Non-drag pointer path: set a height of two in the second plot column.
 const point=await read('(()=>{const L=histLayout(),r=svg.getBoundingClientRect();return {x:r.x+L.x(12),y:r.y+L.y(2)};})()');
 await page.mouse.click(point.x,point.y);await settle();assert.equal(await read('s.counts[1]'),20);await ready(false);
 await click('#next');await ready(true);await next();
 assert.deepEqual(await read('s.counts'),[20,40]);await frequency(1,20);await ready(false);await click('#next');await ready(true);await layout('equal-areas');await next();
 // A correct total is not enough: one 20-pupil group has too little area, the other too much.
 await frequency(2,30);assert.equal(await read('histData().total'),60);await click('#next');await ready(false);
 await frequency(1,20);await frequency(2,20);await ready(false);await click('#next');await ready(true);await layout('built');await next();
 checked('Direct tap and keyboard bar construction; equal-height trap; correct total alone rejected; explicit checks with invalidated feedback.');
 assert.equal(await page.locator('[data-report-curve]').count(),0);await click('#next');await ready(false);assert.equal(await page.locator('[data-report-curve]').count(),1);await layout('totals-retry');
 await keys('[data-control=hist-total-3]','Home');await keys('[data-control=hist-total-3]','ArrowUp',30);
 await keys('[data-control=hist-total-2]','Home');await keys('[data-control=hist-total-2]','ArrowUp',20);
 assert.equal(await page.locator('[data-report-curve]').count(),0);assert.deepEqual(await read('s.sketch'),[0,10,30,50,60]);
 await click('#next');await ready(true);await next();
 checked('Cumulative prediction stays separate and monotone; report line appears only on Check; edits remove the checked comparison.');
 await click('#next');await ready(false);assert.equal(await read('s.readError'),true);
 await ruler(12.5);await click('#next');assert.equal(await read('s.quartiles[0]'),12.5);
 await ruler(20);await click('#next');assert.equal(await read('s.quartiles[1]'),20);
 await ruler(35);await click('#next');assert.equal(await read('histAllRead()'),true);await ready(false);
 // Empty work remains pending, not incorrect.
 await click('#next');assert.equal(await page.locator('#iqrInput').getAttribute('aria-invalid'),'false');
 await page.locator('#iqrInput').fill('20');await ready(false);await click('#next');await ready(false);await layout('range-retry');
 assert.equal(await page.locator('#iqrInput').getAttribute('aria-invalid'),'true');
 await click('#hintToggle');await click('#anotherHint');await click('#anotherHint');assert.match(await page.locator('#hintTitle').innerText(),/Worked example/);await shot('range-hint');await page.locator('#previousHint').press('Escape');
 await page.locator('#iqrInput').fill('45/2');assert.equal(await page.locator('#iqrInput').getAttribute('aria-invalid'),'false');await ready(false);await click('#next');await ready(true);
 assert.equal(await page.locator('[data-middle-half=true]').count(),2,'Recorded outer quartiles bound the shaded middle half');
 await layout('range-success');
 const saved=await read('structuredClone(s)');await click('#back');await click('#next');assert.deepEqual(await read('structuredClone(s)'),saved);
 await click('[data-quantile="0"]');await keys('[data-control=hist-ruler]','ArrowRight');await ready(false);assert.equal(await read('s.quartiles[0]'),null);assert.equal(await read('s.iqrChecked'),false);
 await ruler(12.5);await click('#next');await click('#next');await ready(true);await next();
 checked('Actual ruler read-offs persist; empty work pending; fractions accepted; incorrect range draws a consequential bracket; read-off edits invalidate derived success.');
 await page.getByRole('button',{name:'Save report',exact:true}).click();await settle();const frozen=await read('structuredClone(s.records[0])');
 await frequency(3,40);assert.deepEqual(await read('s.records[0]'),frozen);assert.ok(await page.locator('[data-saved-curve]').count());assert.match(await page.locator('#comparisonNote').innerText(),/Changed:/);await layout('experiment');
 for(let i=0;i<4;i++)await frequency(i,0);assert.equal(await read('histData().total'),0);assert.match(await page.locator('#feedback').innerText(),/undefined/);await layout('empty');
 const experiment=await read('structuredClone(s)');await click('#back');await click('#next');assert.deepEqual(await read('structuredClone(s)'),experiment);
 for(let i=0;i<7;i++){await page.getByRole('button',{name:'Save report',exact:true}).click();await settle();}assert.equal(await read('s.records.length'),6);
 await page.getByRole('button',{name:'Clear readings',exact:true}).click();await settle();assert.equal(await read('s.records.length'),0);
 checked('Frozen reports, common comparison axes, zero-total boundary, record cap and state-preserving experiment navigation.');
 await open('no-preference');await frequency(1,20);await click('#next');await next();assert.equal(await read('document.querySelectorAll(".checkpoint-part,.checkpoint-model").length'),0);
 await open('reduce',true);const client=await context.newCDPSession(page),r=await page.locator('[data-control=hist-bar-1]').boundingBox(),dy=await read('-(histLayout().bottom-histLayout().top)/3');
 const x=r.x+r.width/2,y=r.y+r.height/2;
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=8;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/8}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle();
 assert.equal(await read('s.counts[1]'),20);await click('#next');await ready(true);await shot('touch-success-390');
 checked('Normal/reduced motion cleanup and real emulated touch drag on the bar control.');
 report.passed=true;
}catch(error){report.error=error.stack;if(page)await shot('failure');throw error;}
finally{await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
