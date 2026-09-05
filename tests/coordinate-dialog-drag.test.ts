import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcePath = 'labs-src/mathematics/coordinate-distance-midpoint-perpendicular/lab.html';
type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number };
type TestEvent = { type?: string; pointerId?: number; clientX?: number; clientY?: number; isPrimary?: boolean; button?: number; detail?: number; key?: string; shiftKey?: boolean; defaultPrevented?: boolean; preventDefault?: () => void };
type Listener = (event: TestEvent) => void;

function makeHandle() {
  const listeners = new Map<string, Listener[]>();
  const captures = new Set<number>();
  return {
    addEventListener(type: string, listener: Listener) { listeners.set(type, [...(listeners.get(type) ?? []), listener]); },
    dispatch(type: string, event: TestEvent = {}) {
      event.type = type;
      event.preventDefault ??= () => { event.defaultPrevented = true; };
      for (const listener of listeners.get(type) ?? []) listener(event);
    },
    setPointerCapture(pointerId: number) { captures.add(pointerId); },
    hasPointerCapture(pointerId: number) { return captures.has(pointerId); },
    releasePointerCapture(pointerId: number) { captures.delete(pointerId); },
  };
}

function makeBounds() {
  const rect: Rect = { left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 };
  const bounds = { rect, getBoundingClientRect: () => ({ ...bounds.rect }) };
  return bounds;
}

function makeCard() {
  let offsetX = 0, offsetY = 0, translate = '';
  const style = {
    get translate() { return translate; },
    set translate(value: string) {
      const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))px\s+(-?(?:\d+\.?\d*|\.\d+))px$/);
      assert.ok(match, `unexpected translate value: ${value}`);
      translate = value; offsetX = Number(match[1]); offsetY = Number(match[2]);
    },
  };
  const handle = makeHandle();
  return {
    handle,
    hidden: false,
    style,
    querySelector(selector: string) { assert.equal(selector, '[data-dialog-drag]'); return handle; },
    getBoundingClientRect(): Rect {
      const left = 100 + offsetX, top = 100 + offsetY;
      return { left, top, right: left + 200, bottom: top + 120, width: 200, height: 120 };
    },
  };
}

function makeResizeObserverStub() {
  type Observer = { target?: object; observe(target: object): void; trigger(): void };
  const instances: Observer[] = [];
  const ResizeObserver = function (callback: () => void) {
    const observer: Observer = { target: undefined, observe(target) { this.target = target; }, trigger() { callback(); } };
    instances.push(observer);
    return observer;
  } as unknown as new (callback: () => void) => Observer;
  return { ResizeObserver, instances };
}

type Card = ReturnType<typeof makeCard>;
type Bounds = ReturnType<typeof makeBounds>;
type MakeDraggableDialog = (card: Card, bounds: Bounds) => void;

async function setupDialog() {
  const html = await readFile(sourcePath, 'utf8');
  const match = html.match(/<script id="dialog-drag">\s*([\s\S]*?)<\/script>/);
  assert.ok(match, 'dialog drag script should exist');
  const script = match[1].replace(/\s*makeDraggableDialog\(document\.getElementById\('nextCard'\), document\.querySelector\('\.lab'\)\);\s*$/, '');
  assert.notEqual(script, match[1], 'test should extract the actual helper without its page bootstrap');
  const observers = makeResizeObserverStub();
  const makeDraggableDialog = new Function('document', 'ResizeObserver', `${script}\nreturn makeDraggableDialog;`)({}, observers.ResizeObserver) as MakeDraggableDialog;
  const bounds = makeBounds(), card = makeCard();
  makeDraggableDialog(card, bounds);
  return { card, bounds, resizeObservers: observers.instances };
}

function pointer(pointerId: number, clientX: number, clientY: number, extras: Partial<TestEvent> = {}): TestEvent {
  return { pointerId, clientX, clientY, isPrimary: true, button: 0, ...extras };
}
function key(keyName: string, shiftKey = false): TestEvent { return { key: keyName, shiftKey, defaultPrevented: false }; }

test('primary pointer drag updates the dialog while staying inside the workspace', async () => {
  const { card, bounds } = await setupDialog(), { handle } = card;
  handle.dispatch('pointerdown', pointer(1, 200, 200));
  assert.equal(handle.hasPointerCapture(1), true);
  handle.dispatch('pointermove', pointer(1, 1_000, 1_000)); handle.dispatch('pointerup', pointer(1, 1_000, 1_000));
  assert.equal(card.style.translate, '492px 372px');
  const rect = card.getBoundingClientRect();
  assert.equal(rect.right, bounds.rect.right - 8); assert.equal(rect.bottom, bounds.rect.bottom - 8); assert.equal(handle.hasPointerCapture(1), false);
});

test('secondary or non-left pointers do not start a drag', async () => {
  const { card } = await setupDialog(), { handle } = card;
  handle.dispatch('pointerdown', pointer(2, 200, 200, { isPrimary: false })); handle.dispatch('pointermove', pointer(2, 260, 260, { isPrimary: false })); handle.dispatch('pointerup', pointer(2, 260, 260, { isPrimary: false }));
  handle.dispatch('pointerdown', pointer(3, 200, 200, { button: 2 })); handle.dispatch('pointermove', pointer(3, 260, 260, { button: 2 }));
  assert.equal(card.style.translate, ''); assert.equal(handle.hasPointerCapture(2), false); assert.equal(handle.hasPointerCapture(3), false);
});

test('a click after a drag is suppressed, then a plain click switches sides', async () => {
  const { card } = await setupDialog(), { handle } = card;
  handle.dispatch('pointerdown', pointer(4, 200, 200)); handle.dispatch('pointermove', pointer(4, 250, 200)); handle.dispatch('pointerup', pointer(4, 250, 200));
  const afterDrag = card.style.translate; handle.dispatch('click', { detail: 1 }); assert.equal(card.style.translate, afterDrag);
  handle.dispatch('click', { detail: 1 }); assert.equal(card.style.translate, '492px 0px');
  handle.dispatch('click', { detail: 1 }); assert.equal(card.style.translate, '-92px 0px');
});

test('arrow keys move the dialog by ten pixels and shift-arrow by forty', async () => {
  const { card } = await setupDialog(), { handle } = card;
  const right = key('ArrowRight'); handle.dispatch('keydown', right); assert.equal(right.defaultPrevented, true); assert.equal(card.style.translate, '10px 0px');
  const shiftedUp = key('ArrowUp', true); handle.dispatch('keydown', shiftedUp); assert.equal(shiftedUp.defaultPrevented, true); assert.equal(card.style.translate, '10px -40px');
});

test('pointer cancellation ends the active drag and releases capture', async () => {
  const { card } = await setupDialog(), { handle } = card;
  handle.dispatch('pointerdown', pointer(5, 200, 200)); handle.dispatch('pointercancel', pointer(5, 200, 200));
  assert.equal(handle.hasPointerCapture(5), false); handle.dispatch('pointermove', pointer(5, 260, 260)); assert.equal(card.style.translate, '');
  handle.dispatch('click', { detail: 1 }); assert.equal(card.style.translate, '', 'cancelled pointer sequence should consume its follow-up click');
});

test('resizing the workspace reclamps a dialog already moved to the edge', async () => {
  const { card, bounds, resizeObservers } = await setupDialog(), { handle } = card;
  handle.dispatch('click', { detail: 1 }); assert.equal(card.style.translate, '492px 0px');
  bounds.rect = { left: 0, top: 0, right: 500, bottom: 600, width: 500, height: 600 };
  resizeObservers.find((observer) => observer.target === bounds)!.trigger();
  const rect = card.getBoundingClientRect();
  assert.equal(card.style.translate, '192px 0px'); assert.equal(rect.right, bounds.rect.right - 8); assert.ok(rect.left >= bounds.rect.left + 8);
});
