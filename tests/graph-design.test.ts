import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const sourcePath = path.join(
  path.resolve('.'),
  'labs-src',
  'computer-science',
  'dijkstra-a-star-graph-search',
  'lab.html',
);

type StubElement = {
  append: (...children: StubElement[]) => void;
  addEventListener: () => void;
  classList: { toggle: () => void };
  className: string;
  disabled: boolean;
  hidden: boolean;
  replaceChildren: () => void;
  setAttribute: () => void;
  textContent: string;
  toggleAttribute: () => void;
};

function createElement(): StubElement {
  return {
    append() {},
    addEventListener() {},
    classList: { toggle() {} },
    className: '',
    disabled: false,
    hidden: false,
    replaceChildren() {},
    setAttribute() {},
    textContent: '',
    toggleAttribute() {},
  };
}

async function loadGraphRuntime() {
  const html = await readFile(sourcePath, 'utf8');
  const match = html.match(/<script data-lab-source>\s*([\s\S]*?)<\/script>/);
  assert.ok(match, 'graph lab source script should exist');
  const instrumented = match[1].replace(
    /\s*renderAll\(\);\s*\}\)\(\);\s*$/,
    '\n  globalThis.__graphDesignTest = { startSearch, chooseFrontier, getCanReveal: () => canReveal, getSearch: () => search, setSearch: value => { search = value; } };\n})();\n',
  );
  assert.notEqual(instrumented, match[1], 'test runtime should expose the real chooseFrontier function');

  const elements = new Map<string, StubElement>();
  const byId = (id: string) => {
    if (!elements.has(id)) elements.set(id, createElement());
    return elements.get(id)!;
  };
  const document = {
    createElement,
    querySelectorAll: () => [],
  };
  const window = { matchMedia: () => ({ matches: true }) };
  new Function('LabKit', 'document', 'window', instrumented)(
    { dom: { byId } },
    document,
    window,
  );

  return {
    elements,
    runtime: (globalThis as typeof globalThis & {
      __graphDesignTest: {
        startSearch: (algorithm: string) => void;
        chooseFrontier: (id: string) => Promise<void>;
        getCanReveal: () => boolean;
        getSearch: () => Record<string, unknown>;
        setSearch: (search: Record<string, unknown>) => void;
      };
    }).__graphDesignTest,
  };
}

test('wrong A* frontier choices preserve the search and show red feedback', async () => {
  const { elements, runtime } = await loadGraphRuntime();
  try {
    const search = {
      algorithm: 'astar',
      distances: { S: 0, A: 3, B: 2, C: Infinity, D: Infinity, E: Infinity, F: Infinity, G: Infinity },
      previous: { A: 'S', B: 'S' },
      frontier: new Set(['A', 'B']),
      settled: ['S'],
      current: null,
      route: [],
      complete: false,
      tieChoices: [],
    };
    runtime.setSearch(search);
    const before = structuredClone({
      distances: search.distances,
      previous: search.previous,
      frontier: [...search.frontier],
      settled: search.settled,
      current: search.current,
      route: search.route,
      complete: search.complete,
      tieChoices: search.tieChoices,
    });

    await runtime.chooseFrontier('A');

    const after = runtime.getSearch() as typeof search;
    assert.deepEqual({
      distances: after.distances,
      previous: after.previous,
      frontier: [...after.frontier],
      settled: after.settled,
      current: after.current,
      route: after.route,
      complete: after.complete,
      tieChoices: after.tieChoices,
    }, before);
    assert.equal(runtime.getCanReveal(), true);
    assert.equal(elements.get('decision-card')!.className, 'decision-card bad');
    assert.equal(elements.get('status')!.className, 'status bad');
    assert.match(elements.get('decision-label')!.textContent, /^✕ A is not minimum$/);
  } finally {
    delete (globalThis as typeof globalThis & { __graphDesignTest?: unknown }).__graphDesignTest;
  }
});

test('Graph Search reveals actual evidence and retains the last relaxation calculation', async () => {
  const { elements, runtime } = await loadGraphRuntime();
  try {
    runtime.startSearch('astar');
    assert.equal(elements.get('comparison')!.hidden, true);
    assert.equal(elements.get('relaxation')!.hidden, true);
    assert.equal(elements.get('settled-section')!.hidden, true);

    await runtime.chooseFrontier('S');
    assert.equal(elements.get('comparison')!.hidden, true);
    assert.equal(elements.get('relaxation')!.hidden, false);
    assert.equal(elements.get('settled-section')!.hidden, false);
    assert.equal(elements.get('relax-equation')!.textContent, '0 + 2 = 2');

    for (const town of ['B', 'D', 'F', 'G']) await runtime.chooseFrontier(town);
    assert.equal(elements.get('comparison')!.hidden, false);
    assert.equal(elements.get('astar-result')!.hidden, false);
    assert.equal(elements.get('dijkstra-result')!.hidden, true);
    assert.equal(elements.get('relax-equation')!.textContent, '6 + 2 = 8');

    runtime.startSearch('dijkstra');
    assert.equal(elements.get('comparison')!.hidden, false, 'keep the completed A* result for comparison');
    assert.equal(elements.get('relaxation')!.hidden, true, 'new search has no relaxation evidence yet');
  } finally {
    delete (globalThis as typeof globalThis & { __graphDesignTest?: unknown }).__graphDesignTest;
  }
});
