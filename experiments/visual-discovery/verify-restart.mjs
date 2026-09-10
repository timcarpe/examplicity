import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../outputs/restart-review');
await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const ids=['maths','physics','chemistry','biology','straight-lines','histograms'];
const report={passed:false,checkedAt:new Date().toISOString(),checks:[],screenshots:[],bounds:[]};
let page,context,errors;
async function settle(){await page.waitForFunction('!checkpointBusy && !s.busy && s.phase!=="offspring"');await page.waitForTimeout(30);}
async function click(selector){await page.locator(selector).click();await settle();}
const read=code=>page.evaluate(code);
const state=()=>read('JSON.stringify({step,maxStep,ready,state:s,snapshots:[...checkpointSnapshots.keys()]})');
try{
 for(const id of ids){
  if(context)await context.close();context=await browser.newContext({viewport:{width:1200,height:800},reducedMotion:'reduce'});page=await context.newPage();errors=[];
  page.on('pageerror',e=>errors.push(e.message));await context.route('**/*',r=>r.abort());await page.setContent(await fs.readFile(path.join(here,`review/${id}.html`),'utf8'));await settle();
  for(const [width,height]of [[1200,800],[900,800],[390,844]]){
   await page.setViewportSize({width,height});await settle();const before=await state();
   await page.locator('#resetMenu summary').focus();await page.keyboard.press('Enter');await settle();
   const b=await read(`(()=>{const rect=id=>$(id).getBoundingClientRect().toJSON();return {repeat:rect('repeat'),restart:rect('restart'),panel:rect('resetOptions'),width:innerWidth};})()`);
   assert.ok(b.repeat.top<b.restart.top,`${id}/${width}: visual order differs from DOM order`);
   assert.ok(b.repeat.height>=44&&b.restart.height>=44,`${id}/${width}: small targets`);
   assert.ok(b.panel.left>=0&&b.panel.right<=b.width,`${id}/${width}: clipped disclosure`);
   assert.equal(await read('document.documentElement.scrollWidth<=innerWidth'),true);
   report.bounds.push({id,width,...b});
   const name=`${id}-restart-${width}.png`;await page.screenshot({path:path.join(out,name),fullPage:true});report.screenshots.push(name);
   await page.keyboard.press('Escape');await settle();assert.equal(await read('$("resetMenu").open'),false);assert.equal(await read('document.activeElement===$("resetMenu").querySelector("summary")'),true);assert.equal(await state(),before);
   await click('#resetMenu summary');await click('#restart');assert.equal(await read('$("resetConfirmation").hidden'),false);assert.equal(await read('document.activeElement.id'),'cancelRestart');
   assert.equal(await state(),before,'Opening confirmation must not reset progress');
   await click('#cancelRestart');assert.equal(await read('document.activeElement.id'),'restart');assert.equal(await state(),before);
   await page.locator('#restart').press('Tab');await settle();assert.equal(await read('$("resetMenu").open'),false,'Tab away closes the disclosure');
   await click('#resetMenu summary');await click('#restart');await page.keyboard.press('Escape');await settle();assert.equal(await read('$("resetMenu").open'),false);assert.equal(await state(),before);
   await click('#resetMenu summary');await page.mouse.click(3,3);await settle();assert.equal(await read('$("resetMenu").open'),false);assert.equal(await state(),before);
  }
  await page.setViewportSize({width:1200,height:800});await settle();
  const slider=page.locator('#stage [role=slider]').first();if(await slider.count()){await slider.press('ArrowRight');await settle();}
  await click('#resetMenu summary');await click('#restart');await click('#confirmRestart');
  assert.equal(await read('step'),0);assert.equal(await read('maxStep'),0);assert.equal(await read('checkpointSnapshots.size'),0);assert.equal(await read('s.records?.length||0'),0);assert.equal(await read('$("resetMenu").open'),false);assert.equal(await read('$("resetConfirmation").hidden'),true);
  await click('#resetMenu summary');await click('#repeat');assert.equal(await read('step'),0);assert.equal(await read('$("resetMenu").open'),false);
  assert.deepEqual(errors,[]);report.checks.push(`${id}: three viewport layouts, keyboard disclosure, scope descriptions, cancellation, Escape, tab-away, outside click, confirmed restart and local repeat.`);
 }
 // A non-trivial scope check: repeating step 2 retains the solved first step.
 await page.locator('[data-control=hist-bar-1]').press('Home');for(let i=0;i<20;i++)await page.locator('[data-control=hist-bar-1]').press('ArrowUp');
 await click('#next');await click('#next');assert.equal(await read('step'),1);
 await page.locator('[data-control=hist-bar-1]').press('Home');await settle();
 await click('#resetMenu summary');await click('#repeat');assert.deepEqual(await read('s.counts'),[20,40]);assert.equal(await read('maxStep'),1);
 await click('#back');assert.equal(await read('ready'),true);await click('#next');assert.equal(await read('step'),1);assert.deepEqual(await read('s.counts'),[20,40]);
 await click('#resetMenu summary');await click('#restart');const before=await state();await click('#cancelRestart');assert.equal(await state(),before);
 await click('#restart');await click('#confirmRestart');assert.equal(await read('maxStep'),0);assert.equal(await read('checkpointSnapshots.size'),0);
 report.checks.push('Repeating an edited second step restores its original case but preserves first-step success; only confirmed restart clears visited progress.');
 report.passed=true;
}catch(e){report.error=e.stack;if(page)await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}
finally{await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
