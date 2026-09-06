import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../labs-src/computer-science/memory-management/lab.html', import.meta.url), 'utf8');

function model(ram = '32') {
  let script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(body => body.includes('function advanceModelCycles'))!;
  // Execute the real engines, excluding diagram positioning and DOM event wiring.
  const geometry = script.indexOf('  // Route connections from device edges');
  const render = script.indexOf('  function renderAll()', geometry);
  script = script.slice(0, geometry) + script.slice(render);
  script = script.slice(0, script.indexOf('  $("desktop").addEventListener'));
  const controls: Record<string, { value: string }> = {
    ramConfig: { value: ram }, cacheConfig: { value: 'standard' },
    driveConfig: { value: 'ssd' }, cycleSpeed: { value: '10' },
  };
  return runInNewContext(`${script}
    renderAll=()=>{};requestSimulationRender=()=>{};requestDesktopRender=()=>{};
    showToast=()=>{};appendLog=()=>{};
    resetSimulation();
    return {
      boot(){ensureBootSequence();advanceModelCycles(300)},
      open:openProcess,close:closeProcess,stress:stressMemory,advance:advanceModelCycles,reset:resetSimulation,
      state(){return JSON.parse(JSON.stringify({machineState,totalCycles,currentAction,cpuRun,cpuBusyCycles,cpuIdleCycles,
        blocked:[...blockedThreads].map(([owner,wait])=>({owner,...wait})),osJobs,caches,pageFaults,memoryAccesses,cacheHits,
        activeOwner,ramSlots,pagefileSlots,pages:[...pages.values()],threads:[...processes.values()]}))},
      request(owner,index=0){cpuRun=null;cpuThread=owner;cpuQuantum=CPU_QUANTUM;processes.get(owner).accessCursor=index},
      flush(){caches={L1:[],L2:[],L3:[]}},
      pageOut(owner,index=0){const page=processPages(owner)[index];removeFromCaches(page.id);ramSlots[page.ramSlot]=null;
        page.ramSlot=null;page.state='pagefile';page.pageSlot=pagefileSlots.findIndex(id=>id===null);pagefileSlots[page.pageSlot]=page.id;return page.id}
    };
  })();`, {
    LabKit: { dom: { byId: (id: string) => controls[id] || { value: '' } } },
    document: { getElementById: (id: string) => controls[id] || { value: '' } },
    window: {}, clearTimeout() {}, setTimeout() {},
  });
}

test('storage progresses while CPU references from several threads change caches', () => {
  const m = model(); m.boot(); m.open('browser'); m.advance(1600); m.open('image');
  const actors = new Set<string>(); let overlap = 0, osReference = false;
  for (let i = 0; i < 1800; i++) {
    const before = m.state(); m.advance(1); const after = m.state();
    if (before.currentAction && after.currentAction?.id === before.currentAction.id && after.cpuRun) {
      assert.equal(after.currentAction.progress, before.currentAction.progress + 1);
      actors.add(after.cpuRun.owner); overlap++;
    }
    if (after.cpuRun?.job) {
      assert.equal(after.cpuRun.owner, 'system');
      assert.equal(after.pages.find((p: any) => p.id === after.cpuRun.pageId).owner, 'system');
      osReference = true;
    }
    assert.ok(!after.blocked.some((w: any) => w.owner === after.cpuRun?.owner));
  }
  assert.ok(overlap > 100);
  assert.ok(actors.has('system') && actors.has('browser') && actors.has('image'), `Overlapping CPU actors: ${[...actors]}`);
  assert.ok(osReference);
  assert.ok(m.state().cacheHits > 0);
});

test('one storage-backed fault blocks, completes I/O, wakes and resumes its requester', () => {
  const m = model(); m.boot(); m.open('browser'); m.advance(2200);
  const pageId = m.pageOut('browser'); m.request('browser');
  const startFaults = m.state().pageFaults;
  m.advance(1);
  assert.equal(m.state().pageFaults, startFaults + 1);
  assert.equal(m.state().blocked[0].pageId, pageId);
  let sawTransfer = false, sawCompletion = false, resumed = false;
  for (let i = 0; i < 1200; i++) {
    m.advance(1); const state = m.state();
    sawTransfer ||= state.currentAction?.pageId === pageId;
    sawCompletion ||= state.cpuRun?.job?.kind === 'completion';
    resumed ||= state.cpuRun?.owner === 'browser' && state.cpuRun.pageId === pageId && !state.blocked.length;
  }
  assert.ok(sawTransfer && sawCompletion && resumed);
  assert.equal(m.state().pageFaults, startFaults + 1, 'page-in completion must not count the fault again');
  assert.equal(m.state().pages.find((p: any) => p.id === pageId).state, 'ram');
});

test('memory pressure preserves page ownership and lets OS and applications continue', () => {
  const m = model('16'); m.boot(); m.open('browser'); m.open('image'); m.stress();
  const actors = new Set<string>(); let pageOut = false, faults = false;
  for (let i = 0; i < 12000; i++) {
    m.advance(1); const s = m.state();
    if (s.cpuRun) actors.add(s.cpuRun.owner);
    pageOut ||= s.pagefileSlots.some(Boolean); faults ||= s.blocked.length > 0;
    for (const page of s.pages) {
      if (page.state === 'ram') assert.equal(s.ramSlots[page.ramSlot], page.id);
      if (page.state === 'pagefile') assert.equal(s.pagefileSlots[page.pageSlot], page.id);
    }
    for (const entries of Object.values(s.caches) as any[][]) {
      for (const entry of entries) assert.equal(s.pages.find((p: any) => p.id === entry.pageId)?.state, 'ram');
    }
    if (s.cpuRun) assert.equal(s.pages.find((p: any) => p.id === s.cpuRun.pageId)?.state, 'ram');
  }
  assert.ok(pageOut && faults);
  assert.ok(actors.has('system') && actors.has('browser') && actors.has('image'), JSON.stringify({actors:[...actors],blocked:m.state().blocked,threads:m.state().threads,action:m.state().currentAction}));
  assert.ok(m.state().cacheHits > 0);
});

test('ordinary RAM/cache misses wait in the same thread without creating an I/O fault', () => {
  const m = model(); m.boot(); m.open('browser'); m.advance(2200); m.flush(); m.request('browser');
  const before = m.state(); m.advance(1);
  assert.equal(m.state().cpuRun.source, 'RAM');
  for (let i = 0; i < 43; i++) {
    m.advance(1); const s = m.state();
    assert.equal(s.cpuRun.owner, 'browser'); assert.equal(s.cpuRun.phase, 'read');
    assert.equal(s.blocked.length, 0);
  }
  m.advance(1);
  assert.equal(m.state().cpuRun.phase, 'execute');
  assert.equal(m.state().memoryAccesses, before.memoryAccesses + 1);
  assert.equal(m.state().pageFaults, before.pageFaults);
  assert.ok(m.state().caches.L1.some((e: any) => e.pageId === m.state().cpuRun.pageId));
});

test('idle CPU time can overlap I/O; closing a blocked process leaves no ghost execution', () => {
  const m = model(); m.boot(); m.open('image');
  let idleDuringIO = false;
  for (let i = 0; i < 600; i++) {
    m.advance(1); const s = m.state();
    idleDuringIO ||= Boolean(s.currentAction && !s.cpuRun && s.blocked.length);
  }
  assert.ok(idleDuringIO);
  m.pageOut('image'); m.request('image'); m.advance(1); m.close('image'); m.advance(1000);
  const s = m.state();
  assert.ok(!s.blocked.some((w: any) => w.owner === 'image'));
  assert.notEqual(s.cpuRun?.owner, 'image');
  assert.ok(s.ramSlots.every((id: string | null) => !id || s.pages.some((p: any) => p.id === id)));
  m.reset(); const reset = m.state();
  assert.equal(reset.cpuRun, null); assert.equal(reset.currentAction, null);
  assert.equal(reset.cpuBusyCycles, 0); assert.equal(reset.cpuIdleCycles, 0);
  assert.equal(reset.blocked.length, 0); assert.equal(reset.osJobs.length, 0);
});
