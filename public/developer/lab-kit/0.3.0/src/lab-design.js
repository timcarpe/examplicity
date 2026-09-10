/* Shared model dragging: retain the point grabbed while the model rerenders. */
window.LabDesign = {
  checkpoints(host, labels, current, completed = index => index < current, detail = '') {
    host.classList.add('lab-checkpoints'); host.removeAttribute('aria-hidden');
    host.replaceChildren(...labels.map((label, index) => {
      const dot = document.createElement('span'); dot.className = 'lab-checkpoint'; dot.tabIndex = 0;
      dot.dataset.complete = String(completed(index)); dot.setAttribute('aria-current', String(index === current));
      const status = completed(index) ? 'Completed' : index === current ? 'In progress' : 'Upcoming';
      dot.setAttribute('aria-label', label + ': ' + status);
      const tooltip = document.createElement('span'); tooltip.className = 'lab-checkpoint-detail'; tooltip.setAttribute('role', 'tooltip');
      const title = document.createElement('strong'); title.textContent = label;
      const copy = document.createElement('span'); copy.textContent = status + (index === current && detail ? '. ' + detail : '');
      tooltip.append(title, copy); dot.append(tooltip); return dot;
    }));
  },
  digitalReadout(root, value, { x, y, label }) {
    const ns = 'http://www.w3.org/2000/svg';
    const append = (parent, tag, attributes) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, val));
      parent.appendChild(node); return node;
    };
    const group = append(root, 'g', { class: 'lab-digital-readout', transform: `translate(${x} ${y})`, role: 'img', 'aria-label': label });
    const segments = [[3,0,14,3],[17,3,3,12],[17,19,3,12],[3,31,14,3],[0,19,3,12],[0,3,3,12],[3,15,14,3]];
    const digits = ['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
    let offset = 0;
    for (const digit of String(value)) {
      if (digit === '.') {
        append(group, 'circle', { cx: offset + 2, cy: 32, r: 2, class: 'lab-digital-segment is-on' }); offset += 8; continue;
      }
      segments.forEach(([sx, sy, width, height], index) => append(group, 'rect', {
        x: offset + sx, y: sy, width, height, rx: 1,
        class: `lab-digital-segment${digits[Number(digit)].includes('abcdefg'[index]) ? ' is-on' : ''}`,
      }));
      offset += 26;
    }
    return group;
  },
  // State-owned attention: call after rendering each required step; [] clears it.
  attention(scope, targets) {
    const active = new Set(targets.filter(target => target && !target.disabled && target.getClientRects().length));
    scope.querySelectorAll('.lab-sequence-target').forEach(target => {
      if (!active.has(target)) target.classList.remove('lab-sequence-target');
    });
    active.forEach(target => target.classList.add('lab-sequence-target'));
  },
  introduce(scope, targets, key, title, copy) {
    scope.querySelectorAll('[data-lab-intro]').forEach(target => {
      delete target.dataset.labIntro; delete target.dataset.labIntroTitle; delete target.dataset.labIntroCopy;
    });
    targets.filter(Boolean).forEach(target => {
      target.dataset.labIntro = key; target.dataset.labIntroTitle = title; target.dataset.labIntroCopy = copy;
    });
    document.dispatchEvent(new Event('lab-introduction-change'));
  },
  svgPoint(stage, event) {
    const point = stage.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(stage.getScreenCTM().inverse());
  },
  bindSvgDrag(stage, { start, move, end }) {
    let active = null;
    stage.addEventListener('pointerdown', event => {
      if (active || !event.isPrimary || event.button !== 0) return;
      const point = LabDesign.svgPoint(stage, event), grip = start(event, point);
      if (!grip) return;
      active = { id: event.pointerId, x: point.x - grip.x, y: point.y - grip.y };
      stage.setPointerCapture(event.pointerId); stage.classList.add('lab-is-dragging'); event.preventDefault();
    });
    stage.addEventListener('pointermove', event => {
      if (!active || active.id !== event.pointerId) return;
      const point = LabDesign.svgPoint(stage, event);
      move({ x: point.x - active.x, y: point.y - active.y }, event); event.preventDefault();
    });
    const finish = event => {
      if (!active || active.id !== event.pointerId) return;
      active = null; stage.classList.remove('lab-is-dragging');
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      end(event);
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, finish));
  }
};

/* Shared progressive-card attention and movable completion for opted-in labs. */
(() => {
  // Prefer unoccupied space inside the visible workspace, then the least overlap.
  function popupPosition(popup, scope, anchor) {
    const box = scope.getBoundingClientRect(), w = popup.offsetWidth, h = popup.offsetHeight;
    const left = Math.max(8, box.left + 8), top = Math.max(8, box.top + 8);
    const right = Math.max(left, Math.min(innerWidth - 8, box.right - 8) - w);
    const bottom = Math.max(top, Math.min(innerHeight - 8, box.bottom - 8) - h);
    const occupied = [];
    const add = r => { if (r.width && r.height && r.bottom > top && r.top < bottom + h) occupied.push(r); };
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!node.textContent.trim() || !parent || parent.closest('svg,script,style,.next-card,.lab-intro-card') || !parent.getClientRects().length) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const r of range.getClientRects()) add(r);
    }
    scope.querySelectorAll('input,button,select,textarea,canvas,svg text,svg path,svg line,svg circle,svg rect,[data-lab-popup-avoid]').forEach(element => {
      if (element.closest('.next-card,.lab-intro-card') || !element.getClientRects().length) return;
      const r = element.getBoundingClientRect(), css = getComputedStyle(element);
      if (css.visibility === 'hidden' || css.opacity === '0') return;
      // Large SVG backgrounds are workspace, not an operated object.
      if (element.tagName === 'rect' && (r.width * r.height > box.width * box.height / 5 || css.fill === 'transparent' || css.fill === 'rgba(0, 0, 0, 0)')) return;
      add(r);
    });
    if (anchor) occupied.push(anchor);
    const candidates = [[right, top], [left, top], [right, bottom], [left, bottom]];
    if (anchor) candidates.unshift([anchor.right + 16, anchor.top], [anchor.left - w - 16, anchor.top], [anchor.left, anchor.bottom + 16], [anchor.left, anchor.top - h - 16]);
    for (let y = top; y <= bottom; y += 48) for (let x = left; x <= right; x += 48) candidates.push([x, y]);
    const score = ([x, y]) => occupied.reduce((sum, r) => sum + Math.max(0, Math.min(x + w, r.right + 6) - Math.max(x, r.left - 6)) * Math.max(0, Math.min(y + h, r.bottom + 6) - Math.max(y, r.top - 6)), 0);
    const distance = ([x, y]) => anchor ? Math.hypot(x + w / 2 - (anchor.left + anchor.right) / 2, y + h / 2 - (anchor.top + anchor.bottom) / 2) : 0;
    return candidates.map(([x, y]) => [Math.max(left, Math.min(right, x)), Math.max(top, Math.min(bottom, y))]).sort((a, b) => score(a) - score(b) || distance(a) - distance(b))[0];
  }
  function normalizeSettingHeaders() {
    document.body.classList.add("lab-settings-adopt");
    document.querySelectorAll('[data-lab-reset-target]').forEach(button => {
      const host = document.querySelector(button.dataset.labResetTarget);
      if (!host || host.contains(button)) return;
      button.classList.add('lab-action', 'lab-reset-action');
      host.classList.add('lab-reset-host');
      host.appendChild(button);
    });
      // Flatten only setting wrappers for visual ordering; preserve nodes and event owners.
      document.querySelectorAll('.lab-activity-bar').forEach(bar => {
        const groups = [
          ['working', '.lab-working-toggle,.lab-toggle[data-kind="working"]'],
          ['exam', '.lab-toggle[data-kind="exam"],.lab-toggle[data-kind="curriculum"],.pill-toggle.level-toggle'],
          ['checkpoints', '.lab-checkpoints,.lab-stage-progress']
        ];
        let lead = true;
        for (const [kind, selector] of groups) bar.querySelectorAll(selector).forEach(control => {
          control.dataset.labSetting = kind;
          control.toggleAttribute('data-lab-setting-lead', lead); lead = false;
          if (kind === 'working' || kind === 'exam') {
            const parent = control.parentElement;
            parent.querySelectorAll('span,strong,label').forEach(label => {
              if (!control.contains(label) && (kind === 'working' ? /^Working:?$/i : /^\d{4}:$/).test(label.textContent.trim())) label.classList.add('lab-setting-old-label');
            });
          }
          for (let parent = control.parentElement; parent && parent !== bar; parent = parent.parentElement) parent.classList.add('lab-settings-path');
        });
      });
  }
  function init() {
    normalizeSettingHeaders();
    if (!document.body.classList.contains('lab-adopt-v3')) {
      let pending=false;
      new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;normalizeSettingHeaders()})}}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
      return;
    }
    // SVG units change with the viewBox; keep opted-in chart labels at their display size.
    document.querySelectorAll('svg[data-lab-readable-chart]').forEach(stage => {
      const fitText = () => {
        const width = stage.getBoundingClientRect().width;
        if (width) stage.style.setProperty('--lab-chart-text-size', (Number(stage.dataset.labReadableChart) || 14) * stage.viewBox.baseVal.width / width + 'px');
      };
      new ResizeObserver(fitText).observe(stage);
      new MutationObserver(fitText).observe(stage, { attributes: true, attributeFilter: ['viewBox'] });
      fitText();
    });
    // Small flat surfaces follow each opted-in SVG value, including changing instructions.
    document.querySelectorAll('svg text[data-lab-value]').forEach(value => {
      const surface = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      surface.setAttribute('class', 'lab-svg-value-surface'); surface.setAttribute('rx', '5');
      surface.setAttribute('aria-hidden', 'true'); value.before(surface);
      let frame;
      const fit = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
        if (!value.isConnected) return;
        value.style.removeProperty('--lab-value-fit-size');
        const css = getComputedStyle(value), px = Number(css.getPropertyValue('--lab-value-padding-x')) || 7, py = Number(css.getPropertyValue('--lab-value-padding-y')) || 3;
        let b = value.getBBox();
        const component = [...value.parentElement.children].find(el => el.tagName === 'rect' && !el.classList.contains('lab-svg-value-surface'));
        // Ordinary values share one size; unusually long instructions still fit their component.
        if (component) {
          const box = component.getBBox(), centre = b.x + b.width / 2;
          const available = 2 * Math.min(centre - box.x, box.x + box.width - centre) - 2 * px - 8;
          if (available > 0 && b.width > available) {
            value.style.setProperty('--lab-value-fit-size', parseFloat(css.fontSize) * available / b.width + 'px');
            b = value.getBBox();
          }
        }
        Object.entries({x:b.x-px,y:b.y-py,width:b.width+2*px,height:b.height+2*py}).forEach(([k,v])=>surface.setAttribute(k,v));
      }); };
      new MutationObserver(fit).observe(value, {childList:true,characterData:true,subtree:true});
      new ResizeObserver(fit).observe(value.ownerSVGElement);
      document.fonts?.ready.then(fit); fit();
    });
    const touched = new Set();
    const introduced = new Set();
    const placed = new WeakMap(), moved = new WeakSet();
    let introduction = null, interacting = false;
    const hint = document.createElement('aside');
    hint.id = 'lab-intro-hint'; hint.className = 'lab-intro-card'; hint.setAttribute('role', 'tooltip'); hint.hidden = true;
    const hintTitle = document.createElement('strong'), hintCopy = document.createElement('span');
    hint.append(hintTitle, hintCopy); document.body.append(hint);
    function clearIntroduction() {
      if (introduction) {
        introduction.classList.remove('lab-intro-target');
        const ids = (introduction.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== hint.id);
        if (ids.length) introduction.setAttribute('aria-describedby', ids.join(' ')); else introduction.removeAttribute('aria-describedby');
      }
      introduction = null; hint.hidden = true;
    }
    function refreshIntroduction() {
      clearIntroduction();
      if (interacting || [...document.querySelectorAll('.next-card')].some(card => !card.hidden && card.getClientRects().length)) return;
      introduction = [...document.querySelectorAll('[data-lab-intro]')].find(target => {
        if (introduced.has(target.dataset.labIntro) || target.disabled || !target.getClientRects().length) return false;
        const r = target.getBoundingClientRect(); return r.bottom > 20 && r.top < innerHeight - 20 && r.right > 0 && r.left < innerWidth;
      });
      if (!introduction) return;
      introduction.classList.add('lab-intro-target');
      introduction.setAttribute('aria-describedby', ((introduction.getAttribute('aria-describedby') || '') + ' ' + hint.id).trim());
      hintTitle.textContent = introduction.dataset.labIntroTitle;
      hintCopy.textContent = introduction.dataset.labIntroCopy;
      hint.hidden = false;
      const [x, y] = popupPosition(hint, document.querySelector('main') || document.body, introduction.getBoundingClientRect());
      hint.style.left = x + 'px'; hint.style.top = y + 'px';
    }
    // Explicit adapter for legacy mode groups whose state lives in a CSS class.
    document.querySelectorAll('.lab-toggle[data-active-class]').forEach(group => {
      const sync = () => group.querySelectorAll('button').forEach(button => {
        const value = String(button.classList.contains(group.dataset.activeClass));
        if (button.getAttribute('aria-pressed') !== value) button.setAttribute('aria-pressed', value);
      });
      new MutationObserver(sync).observe(group, {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
      sync();
    });
    const cardSelector = '.calc-step,.solve-card,.derive-step,.work-step,.working-step,.lab-work-card,.lab-investigation .work-section,.lab-investigation .evidence-section,.lab-investigation .work-block';
    let queued = false;
    const key = card => card.id || [...card.querySelectorAll('input')].map(input => input.id || input.name || [...input.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + a.value).join(':')).join('|') || card.querySelector('.step-head,.derive-step-head,.work-step-head,.eyebrow,strong')?.textContent;
    function refresh() {
      queued = false;
      normalizeSettingHeaders();
      document.querySelectorAll('[data-lab-actions] button').forEach(button => {
        if (!button.classList.contains('lab-action')) button.classList.add('lab-action');
        if (button.classList.contains('primary') && button.dataset.priority !== 'primary') button.dataset.priority = 'primary';
      });
      document.querySelectorAll(cardSelector).forEach(card => {
        if (touched.has(key(card)) && card.dataset.interacted !== 'true') card.dataset.interacted = 'true';
      });
      document.querySelectorAll('.next-card').forEach(card => {
        if (card.hidden || !card.getClientRects().length) { placed.delete(card); moved.delete(card); return; }
        if (!moved.has(card) && placed.get(card) !== card.textContent) {
          const scope = card.offsetParent, box = scope.getBoundingClientRect();
          const [x, y] = popupPosition(card, scope);
          card.style.right = 'auto'; card.style.bottom = 'auto';
          card.style.left = x - box.left - scope.clientLeft + scope.scrollLeft + 'px';
          card.style.top = y - box.top - scope.clientTop + scope.scrollTop + 'px';
          placed.set(card, card.textContent);
        }
        if (card.querySelector('.lab-dialog-move')) return;
        const handle = document.createElement('button');
        handle.type = 'button'; handle.className = 'lab-dialog-move';
        handle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>';
        handle.setAttribute('aria-label', 'Move completion card. Use arrow keys to reposition.');
        card.prepend(handle);
      });
      refreshIntroduction();
    }
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(refresh); } };
    document.addEventListener('pointerdown', event => {
      const target = event.target.closest('[data-lab-intro]');
      if (!target) return;
      introduced.add(target.dataset.labIntro); interacting = true; clearIntroduction();
    }, true);
    ['pointerup', 'pointercancel'].forEach(type => document.addEventListener(type, () => { interacting = false; schedule(); }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && introduction) { introduced.add(introduction.dataset.labIntro); clearIntroduction(); return; }
      const target = event.target.closest('[data-lab-intro]') || event.target.closest('svg')?.querySelector('.lab-intro-target');
      if (target && event.key !== 'Tab') { introduced.add(target.dataset.labIntro); clearIntroduction(); schedule(); }
    }, true);
    window.addEventListener('resize', () => {
      // A viewport change invalidates automatic placement, while a card the
      // learner has moved must retain its chosen position.
      document.querySelectorAll('.next-card').forEach(card => {
        if (!moved.has(card)) placed.delete(card);
      });
      schedule();
    });
    document.addEventListener('lab-introduction-change', schedule);
    window.addEventListener('scroll', schedule, true);
    document.addEventListener('focusin', event => {
      if (!event.target.matches('input,textarea,select,button')) return;
      const card = event.target.closest(cardSelector);
      if (card) { touched.add(key(card)); card.dataset.interacted = 'true'; }
    });
    document.addEventListener('pointerdown', event => {
      const input = event.target.closest('input,select,textarea,button,[data-lab-intro]');
      const card = input?.closest(cardSelector);
      if (card) { touched.add(key(card)); card.dataset.interacted = 'true'; }
    });
    document.addEventListener('click', event => {
      if (event.target.closest('[data-work-level],[data-level],#reset,#resetCase,#resetChallenge,#resetGraph,#nextProblem,#nextStageButton,[data-next],#newJourney')) {
        touched.clear(); document.querySelectorAll(cardSelector).forEach(card => delete card.dataset.interacted);
      }
    }, true);
    const move = (card, left, top) => {
      moved.add(card);
      const bounds = card.offsetParent;
      card.style.right = 'auto'; card.style.bottom = 'auto';
      card.style.left = Math.max(0, Math.min(left, bounds.clientWidth - card.offsetWidth)) + 'px';
      card.style.top = Math.max(0, Math.min(top, bounds.clientHeight - card.offsetHeight)) + 'px';
    };
    document.addEventListener('pointerdown', event => {
      const handle = event.target.closest('.lab-dialog-move');
      if (!handle || event.button !== 0) return;
      const card = handle.closest('.next-card'), x = event.clientX, y = event.clientY, left = card.offsetLeft, top = card.offsetTop;
      handle.setPointerCapture(event.pointerId); event.preventDefault();
      const update = e => { if (e.pointerId === event.pointerId) move(card, left + e.clientX - x, top + e.clientY - y); };
      const stop = () => { handle.removeEventListener('pointermove', update); handle.removeEventListener('pointerup', stop); handle.removeEventListener('pointercancel', stop); handle.removeEventListener('lostpointercapture', stop); };
      handle.addEventListener('pointermove', update); handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop); handle.addEventListener('lostpointercapture', stop);
    });
    document.addEventListener('keydown', event => {
      const handle = event.target.closest('.lab-dialog-move');
      const delta = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[event.key];
      if (!handle || !delta) return;
      event.preventDefault(); const card = handle.closest('.next-card'); move(card, card.offsetLeft + delta[0], card.offsetTop + delta[1]);
    });
    new MutationObserver(schedule).observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();

/* LAB_DISCOVERY_RUNTIME_START */
/* Scoped visual-discovery lesson shell. Authored labs retain their DOM, model,
   state, progression and correctness rules. */
LabDesign.discovery = {
  mount(root, createModel) {
    if (!(root instanceof Element)) throw new TypeError('LabDesign.discovery.mount requires a root element.');
    if (typeof createModel !== 'function') throw new TypeError('LabDesign.discovery.mount requires a model factory.');

    const required = ['stage', 'stageWrap', 'title', 'intro', 'stepLabel', 'checkpoints', 'back', 'forwardVisited', 'next',
      'resetMenu', 'resetChoices', 'resetConfirmation', 'restart', 'cancelRestart', 'confirmRestart', 'repeat', 'repeatLabel',
      'repeatDescription', 'controls', 'context', 'working', 'records', 'comparisonNote', 'learningDock', 'outcome',
      'outcomeTitle', 'feedback', 'secondaryAction', 'hintToggle', 'evidenceHelp', 'hintTitle', 'hintText', 'previousHint',
      'anotherHint', 'statusAnnouncement'];
    const $ = id => root.querySelector(`#${id}`);
    const missing = required.filter(id => !$(id));
    if (missing.length) throw new Error(`LabDesign.discovery is missing required elements: ${missing.join(', ')}`);

    const NS = 'http://www.w3.org/2000/svg';
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const fmt = (value, digits = 1) => Number(value.toFixed(digits)).toString();
    const validNumber = value => String(value).trim() !== '' && Number.isFinite(Number(value));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const svg = $('stage');
    const checkpointSnapshots = new Map();
    const explanations = new Map();
    const cleanups = [];
    let model;
    let W = 900, H = 420, mobile = false, step = 0, maxStep = 0, ready = false, drag = null;
    let hintSteps = [], activeDockSource = null, secondaryDockSource = null, announcementTimer = 0, outcomeHeading = '';
    let cueVersion = 0, cueSignature = '', helpTimer = 0, helpOwner = null, outcomeQueued = false;
    let arrivalAnimations = [], checkpointBusy = false, checkpointAnimations = [], transitionSerial = 0;

    const connectionLayer = document.createElement('div');
    connectionLayer.className = 'lab-discovery-connection-layer';
    connectionLayer.setAttribute('aria-hidden', 'true');
    const helpTip = document.createElement('div');
    helpTip.className = 'lab-discovery-value-tooltip'; helpTip.role = 'tooltip'; helpTip.hidden = true;
    document.body.append(connectionLayer, helpTip);
    cleanups.push(() => { connectionLayer.remove(); helpTip.remove(); });

    const on = (target, type, listener, options) => {
      target.addEventListener(type, listener, options);
      cleanups.push(() => target.removeEventListener(type, listener, options));
    };
    const state = () => model.state;
    const lesson = () => model.lesson;
    const busy = () => !!state().busy || state().phase === 'offspring';
    const syncModel = () => model?.syncScene?.({ W, H, mobile, step, ready, maxStep });
    const callModel = (name, ...args) => {
      syncModel();
      const result = model[name]?.(...args);
      syncModel();
      return result;
    };
    const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

    function el(tag, attributes = {}, content, parent = svg) {
      const node = document.createElementNS(NS, tag);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      if (content !== undefined) node.textContent = content;
      parent.appendChild(node);
      return node;
    }
    function text(x, y, content, className = '', anchor = 'start', parent = svg) {
      return el('text', { x, y, class: className, 'text-anchor': anchor }, content, parent);
    }
    function line(x1, y1, x2, y2, attributes = {}, parent = svg) {
      return el('line', { x1, y1, x2, y2, stroke: 'var(--ink)', 'stroke-width': 2, ...attributes }, undefined, parent);
    }
    function dot(x, y, radius, attributes = {}, parent = svg) {
      return el('circle', { cx: x, cy: y, r: radius, ...attributes }, undefined, parent);
    }
    function clear() {
      const active = document.activeElement?.getAttribute('data-control');
      const source = document.activeElement?.getAttribute('data-source');
      svg.dataset.restoreSource = source || ''; svg.replaceChildren(); svg.dataset.restoreFocus = active || '';
    }
    function endDraw() {
      const id = svg.dataset.restoreFocus, key = svg.dataset.restoreSource;
      if (id) svg.querySelector(`[data-control="${id}"]`)?.focus({ preventScroll: true });
      else if (key) svg.querySelector(`[data-source="${key}"]`)?.focus({ preventScroll: true });
      updateConnections(); syncHint();
    }
    function point(event) {
      const position = svg.createSVGPoint(); position.x = event.clientX; position.y = event.clientY;
      return position.matrixTransform(svg.getScreenCTM().inverse());
    }
    function handle(id, x, y, config) {
      const group = el('g', { 'data-control': id, class: 'model-control', tabindex: 0, role: 'slider',
        'aria-label': config.label, 'aria-valuemin': config.min, 'aria-valuemax': config.max,
        'aria-valuenow': config.value, 'aria-valuetext': config.valueText ?? fmt(config.value, 2) });
      group.dataset.help = config.help || `${config.label}. Drag this control, or use the arrow keys to change its value.`;
      dot(x, y, 24, { fill: 'transparent' }, group); dot(x, y, 12, { class: 'handle' }, group);
      dot(x, y, 3, { fill: 'var(--lab-accent)' }, group);
      group.onpointerdown = event => {
        event.preventDefault(); drag = { id, config, offset: config.value - config.fromPoint(point(event)) };
        svg.setPointerCapture(event.pointerId); group.focus({ preventScroll: true });
      };
      group.onkeydown = event => {
        let value = config.value;
        if (['ArrowLeft', 'ArrowDown'].includes(event.key)) value -= config.increment || .1;
        else if (['ArrowRight', 'ArrowUp'].includes(event.key)) value += config.increment || .1;
        else if (event.key === 'Home') value = config.min;
        else if (event.key === 'End') value = config.max;
        else return;
        event.preventDefault(); config.set(clamp(value, config.min, config.max));
      };
      return group;
    }
    on(svg, 'pointermove', event => {
      if (!drag) return;
      event.preventDefault(); drag.config.set(clamp(drag.config.fromPoint(point(event)) + drag.offset, drag.config.min, drag.config.max));
    });
    on(svg, 'pointerup', event => {
      if (!drag) return;
      const id = drag.id; drag = null;
      if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
      svg.querySelector(`[data-control="${id}"]`)?.focus({ preventScroll: true });
    });
    on(svg, 'pointercancel', () => { drag = null; });

    function feedback(message, ok = false, retry = false, heading = '') {
      outcomeHeading = heading;
      if ($('feedback').textContent !== message) $('feedback').textContent = message;
      $('feedback').className = `feedback${ok ? ' good' : retry ? ' retry' : ''}`;
      ready = ok; syncModel();
      $('next').disabled = !ok && step >= maxStep;
      scheduleOutcome();
    }
    function head(titleText, introText) {
      $('title').textContent = titleText; $('intro').textContent = introText;
      $('stepLabel').textContent = step === lesson().length - 1 ? 'Experiment' : `Step ${step + 1} of ${lesson().length - 1} · ${lesson()[step].label}`;
      if ($('checkpoints').dataset.step !== String(step)) {
        LabDesign.checkpoints($('checkpoints'), lesson().slice(0, -1).map(item => item.label), step === lesson().length - 1 ? -1 : step, index => index < maxStep);
        $('checkpoints').dataset.step = step;
      }
      $('back').disabled = step === 0; $('next').hidden = step === lesson().length - 1;
      $('next').textContent = step < maxStep ? 'Forward' : step === lesson().length - 2 ? 'Open experiment' : 'Continue';
      svg.setAttribute('aria-label', `${titleText} ${introText}`);
    }
    function checkpointState() {
      state().helpOpen = !$('evidenceHelp').hidden;
      return { state: structuredClone(state()), extras: model.snapshotExtras ? callModel('snapshotExtras') : null };
    }
    function restoreCheckpoint(saved) {
      for (const key of Object.keys(state())) delete state()[key];
      Object.assign(state(), structuredClone(saved.state));
      if (model.restoreExtras) callModel('restoreExtras', structuredClone(saved.extras));
      if (model.restoreView) callModel('restoreView'); else callModel('controls');
    }

    function setHelp(steps) { hintSteps = steps; $('hintToggle').hidden = !steps.length; syncHint(); }
    function syncHint() {
      root.querySelectorAll('.evidence-cue').forEach(node => node.classList.remove('evidence-cue'));
      const open = hintSteps.length > 0 && !!state().helpOpen;
      $('evidenceHelp').hidden = !open; $('hintToggle').setAttribute('aria-expanded', String(open));
      $('hintToggle').textContent = open ? 'Hide hint' : 'Hint';
      if (!open) return;
      const level = clamp(state().helpLevel || 0, 0, hintSteps.length - 1), value = hintSteps[level];
      const hint = typeof value === 'function' ? value() : value;
      $('hintTitle').textContent = `${hint.example ? 'Worked example' : 'Hint'} ${level + 1} of ${hintSteps.length}`;
      const copy = typeof hint === 'string' ? hint : hint.text;
      if ($('hintText').textContent !== copy) $('hintText').textContent = copy;
      $('previousHint').disabled = level === 0; $('anotherHint').disabled = level >= hintSteps.length - 1;
      $('anotherHint').textContent = hintSteps[level + 1]?.example ? 'Show example' : 'Next hint';
      for (const key of hint.keys || []) root.querySelectorAll(`[data-source="${key}"]`).forEach(node => node.classList.add('evidence-cue'));
    }

    function dockSources() {
      return [...root.querySelectorAll('[data-dock-action]')]
        .filter(node => !node.disabled && !node.closest('[hidden]'))
        .sort((a, b) => Number(b.dataset.dockRank || 10) - Number(a.dataset.dockRank || 10));
    }
    function syncActionDock() {
      const isBusy = busy(), experiment = step === lesson().length - 1, sources = dockSources();
      const next = $('next'), secondary = $('secondaryAction');
      activeDockSource = !ready || experiment ? sources[0] || null : null;
      secondaryDockSource = sources.find(node => node !== activeDockSource && node.dataset.repeatable === 'true') || null;
      next.hidden = experiment && !isBusy && !activeDockSource;
      next.disabled = isBusy || (!activeDockSource && !ready && step >= maxStep);
      next.textContent = isBusy ? (state().phase === 'offspring' ? 'Producing offspring…' : 'Testing…') :
        activeDockSource ? activeDockSource.textContent : step < maxStep ? 'Forward' : step === lesson().length - 2 ? 'Open experiment' : 'Continue';
      secondary.hidden = isBusy || !secondaryDockSource;
      if (secondaryDockSource) secondary.textContent = secondaryDockSource.textContent;
      $('forwardVisited').hidden = step >= maxStep || !activeDockSource; $('forwardVisited').disabled = isBusy;
      $('back').disabled = isBusy || step === 0; $('repeat').disabled = isBusy;
      $('restart').disabled = isBusy; $('confirmRestart').disabled = isBusy;
      $('repeatLabel').textContent = experiment ? 'Reset experiment' : 'Repeat this step';
      $('repeat').setAttribute('aria-label', experiment ? 'Reset experiment' : 'Repeat this step');
      $('repeatDescription').textContent = experiment ? 'Clear this experiment; keep guided progress.' : 'Reset this step only; keep other progress.';
      $('learningDock').setAttribute('aria-busy', String(isBusy));
    }
    function runDockAction(source, event) {
      if (event.detail > 1 || checkpointBusy || busy() || !source?.isConnected || source.disabled) return;
      source.click();
    }
    function announceOutcome(outcomeState) {
      clearTimeout(announcementTimer);
      const message = `${$('outcomeTitle').textContent}. ${$('feedback').textContent}`;
      announcementTimer = setTimeout(() => {
        if ($('statusAnnouncement').textContent !== message) $('statusAnnouncement').textContent = message;
      }, outcomeState === 'good' || outcomeState === 'retry' ? 0 : 300);
    }
    function scheduleOutcome() {
      if (outcomeQueued) return;
      outcomeQueued = true;
      queueMicrotask(() => {
        outcomeQueued = false;
        const outcomeState = busy() ? 'busy' : ready ? 'good' : $('feedback').classList.contains('retry') ? 'retry' : 'idle';
        const titleText = outcomeHeading || (outcomeState === 'good' ? lesson()[step].success || 'Result' : outcomeState === 'retry' ? 'Try again' :
          outcomeState === 'busy' ? 'In progress' : step === lesson().length - 1 ? 'Compare your results' : 'Try it');
        $('outcome').dataset.state = outcomeState; $('learningDock').dataset.state = outcomeState;
        if ($('outcomeTitle').textContent !== titleText) $('outcomeTitle').textContent = titleText;
        syncActionDock(); announceOutcome(outcomeState); syncModel();
      });
    }

    function rememberReading(reading) {
      state().records.push(structuredClone(reading));
      if (state().records.length > 6) { state().records.shift(); state().comparison = state().comparison > 0 ? state().comparison - 1 : null; }
      if (state().comparison == null) state().comparison = state().records.length - 1;
    }
    function clearReadings() { state().records = []; state().comparison = null; callModel('render'); }
    function comparisonDescription(before, after) {
      const changed = Object.keys(after).filter(key => String(before[key]) !== String(after[key]));
      return changed.length ? `Changed: ${changed.map(key => `${key} ${before[key]} → ${after[key]}`).join('; ')}.` : 'Same conditions. Change one quantity to compare its consequence.';
    }
    function comparisonNote(message) { $('comparisonNote').hidden = !message; $('comparisonNote').textContent = message; }
    function button(label, action, attributes = {}) {
      const control = document.createElement('button'); control.type = 'button'; control.className = 'lab-action'; control.textContent = label;
      for (const [key, value] of Object.entries(attributes)) control.setAttribute(key, value);
      control.onclick = action; $('controls').appendChild(control); return control;
    }
    const workRow = (label, expression) => `<div class="work-step"><span class="work-label">${label}</span><div class="work-expression">${expression}</div></div>`;
    const workOutput = id => `<output class="lab-math-surface" id="${id}"></output>`;
    function workSetup(titleText, body, note = '', requiredWork = false) {
      const area = $('working'); area.hidden = false; area.dataset.workState = requiredWork ? 'needed' : 'reference'; area.dataset.interacted = 'false';
      area.innerHTML = `<div class="work-heading"><h2 id="workingTitle">${titleText}</h2><button type="button" class="lab-action trace-button" id="traceWorking" data-help="Follow each value from the model into its place in the calculation." aria-label="Trace values from model to calculation"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="5" r="2.5"/><path d="M4 7.5v4a4 4 0 0 0 4 4h8m-3-3 3 3-3 3"/></svg>Trace values</button></div><div class="work-steps">${body}</div><p class="work-note" id="workNote">${note}</p><div class="work-actions" id="workActions"></div>`;
      area.oninput = area.onpointerdown = () => { area.dataset.interacted = 'true'; };
    }
    function workValue(id, value) { const node = $(id); if (node && node.textContent !== String(value)) node.textContent = value; }
    function workState(value) { $('working').dataset.workState = value; }
    function workAction(label, action, attributes = {}) {
      const control = button(label, action, { 'data-dock-action': 'true', 'data-dock-rank': '20', ...attributes });
      $('workActions').appendChild(control); return control;
    }
    function table(headers, rows, compare = false) {
      const node = $('records'); node.hidden = !rows.length;
      if (!rows.length) { comparisonNote(''); return; }
      const cells = compare ? ['Compare', ...headers] : headers;
      node.innerHTML = `<thead><tr>${cells.map(value => `<th scope="col">${escapeHtml(value)}</th>`).join('')}</tr></thead><tbody>${rows.map((row, index) => `<tr${compare && state().comparison === index ? ' class="selected-reading"' : ''}>${compare ? `<td><button type="button" class="reading-choice" data-reading="${index}" aria-label="Compare reading ${index + 1}" aria-pressed="${state().comparison === index}">${index + 1}</button></td>` : ''}${row.map(value => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      if (compare) node.querySelectorAll('[data-reading]').forEach(control => control.onclick = () => {
        const index = Number(control.dataset.reading); state().comparison = state().comparison === index ? null : index; callModel('render');
        $('records').querySelector(`[data-reading="${index}"]`)?.focus({ preventScroll: true });
      });
    }

    function term(key, value) { return `<span class="linked-term" data-value-ref="${key}" tabindex="0">${escapeHtml(value)}</span>`; }
    function result(key, value, description) {
      explanations.set(key, description);
      return `<span class="lab-math-surface" data-result data-source="${key}" data-link="${key}" data-help="${escapeHtml(description)}" tabindex="0">${escapeHtml(value)}</span>`;
    }
    function explain(node, description, key = '') { node.dataset.help = description; if (key) node.dataset.link = key; return node; }
    function sourceLabel(key, x, y, label, description, className = 'small', anchor = 'start') {
      const group = el('g', { 'data-source': key, 'data-link': key, tabindex: 0, role: 'button', 'aria-label': `${label}. ${description}`, class: 'value-source' });
      const labelNode = text(x, y, label, className, anchor, group), box = labelNode.getBBox();
      const hit = el('rect', { x: box.x - 6, y: box.y - 7, width: box.width + 12, height: box.height + 14, rx: 5, class: 'source-hit' }, undefined, group);
      group.insertBefore(hit, labelNode); line(box.x, box.y + box.height + 3, box.x + box.width, box.y + box.height + 3, { class: 'source-underline' }, group);
      explanations.set(key, description); explain(group, description, key); return group;
    }
    function workFormula(id, html) { const node = $(id); if (node && node.innerHTML !== html) node.innerHTML = html; }
    function workingExplanation(description) {
      const area = $('working'); area.dataset.method = description; area.removeAttribute('data-help'); area.removeAttribute('tabindex');
      area.setAttribute('aria-labelledby', 'workingTitle'); area.setAttribute('aria-describedby', 'workNote');
    }
    const linkedSources = key => [...root.querySelectorAll(`[data-source="${key}"]`)].filter(node => node.getClientRects().length && (!('value' in node) || node.value !== ''));
    const linkedTerms = key => [...root.querySelectorAll(`[data-value-ref="${key}"]`)].filter(node => node.getClientRects().length);
    const linkPairs = () => [...new Set([...$('working').querySelectorAll('[data-value-ref]')].map(node => node.dataset.valueRef))]
      .flatMap(key => { const source = linkedSources(key)[0], targets = linkedTerms(key); return source && targets.length ? [{ key, source, targets }] : []; });
    function stopConnections() {
      cueVersion++; connectionLayer.replaceChildren(); delete connectionLayer.dataset.active;
      root.querySelectorAll('.value-arrived').forEach(node => node.classList.remove('value-arrived'));
    }
    function visibleRect(node) {
      const box = node.getBoundingClientRect();
      return box.width && box.height && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth ? box : null;
    }
    function halo(node, kind) {
      const box = visibleRect(node); if (!box) return null;
      const haloNode = document.createElement('span'); haloNode.className = `connection-halo ${kind}`;
      Object.assign(haloNode.style, { left: `${box.x - 5}px`, top: `${box.y - 5}px`, width: `${box.width + 10}px`, height: `${box.height + 10}px` });
      connectionLayer.appendChild(haloNode); return haloNode;
    }
    const pauseCue = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    async function tracePair(pair, version) {
      if (version !== cueVersion || !pair.source.isConnected) return;
      connectionLayer.dataset.active = pair.key;
      const from = visibleRect(pair.source), target = pair.targets[0], to = visibleRect(target), sourceHalo = halo(pair.source, 'source');
      if (reduced.matches) { pair.targets.forEach(node => halo(node, 'destination')); await pauseCue(750); return; }
      sourceHalo?.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 1 }], { duration: 240, fill: 'forwards' });
      await pauseCue(220); if (version !== cueVersion) return;
      if (from && to) {
        const token = document.createElement('span'); token.className = 'travelling-value'; token.textContent = target.textContent; connectionLayer.appendChild(token);
        const x1 = from.x + from.width / 2, y1 = from.y + from.height / 2, x2 = to.x + to.width / 2, y2 = to.y + to.height / 2;
        const bend = Math.min(45, Math.abs(y2 - y1) * .15);
        const frames = [0, .25, .5, .75, 1].map((position, index) => ({ transform: `translate(${x1 + (x2 - x1) * position + bend * Math.sin(Math.PI * position)}px,${y1 + (y2 - y1) * position}px) translate(-50%,-50%)`, opacity: index === 0 || index === 4 ? 0 : 1 }));
        await token.animate(frames, { duration: 560, easing: 'cubic-bezier(.22,.68,.3,1)', fill: 'forwards' }).finished.catch(() => {}); token.remove();
      }
      if (version !== cueVersion) return;
      pair.targets.forEach(node => { halo(node, 'destination')?.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 180, fill: 'forwards' }); node.classList.add('value-arrived'); });
      await pauseCue(330);
    }
    async function traceValues() {
      stopConnections(); const version = cueVersion, pairs = linkPairs();
      for (const pair of pairs) {
        await tracePair(pair, version); if (version !== cueVersion) return;
        connectionLayer.replaceChildren(); root.querySelectorAll('.value-arrived').forEach(node => node.classList.remove('value-arrived'));
      }
      delete connectionLayer.dataset.active;
      if (!reduced.matches && pairs.length) $('working').querySelectorAll('[data-result]').forEach(node => node.animate([{ backgroundColor: 'var(--lab-accent-soft)' }, { backgroundColor: 'transparent' }], { duration: 600 }));
    }
    function updateConnections() {
      if (helpOwner && !helpOwner.isConnected) hideHelp();
      const pairs = $('working').hidden ? [] : linkPairs(), replay = $('traceWorking');
      if (replay) { replay.hidden = !pairs.length; replay.onclick = () => { hideHelp(); traceValues(); }; }
      root.querySelectorAll('[data-value-ref]').forEach(node => {
        const key = node.dataset.valueRef; node.dataset.help = explanations.get(key) || 'This value is taken from the labelled model.'; node.dataset.link = key;
        node.setAttribute('aria-label', `${node.textContent}. ${node.dataset.help}`);
      });
      const signature = `${step}|${pairs.map(({ key, source, targets }) => `${key}:${source.value ?? source.textContent}=${targets.map(node => node.textContent).join(',')}`).join('|')}`;
      if (signature !== cueSignature) { cueSignature = signature; stopConnections(); }
    }
    function clearLinkedFocus() { root.querySelectorAll('.linked-focus').forEach(node => node.classList.remove('linked-focus')); }
    function hideHelp() {
      clearTimeout(helpTimer); helpTip.hidden = true; helpOwner?.removeAttribute('aria-describedby'); helpOwner = null; clearLinkedFocus();
    }
    function showHelp(owner) {
      const description = owner.dataset.help; if (!description || !owner.isConnected) return;
      hideHelp(); helpOwner = owner; helpTip.textContent = description; helpTip.hidden = false; owner.setAttribute('aria-describedby', helpTip.id);
      if (!helpTip.id) helpTip.id = `lab-discovery-help-${Math.random().toString(36).slice(2)}`;
      owner.setAttribute('aria-describedby', helpTip.id);
      const anchor = owner.getBoundingClientRect(), box = helpTip.getBoundingClientRect();
      const top = anchor.bottom + box.height + 12 < innerHeight ? anchor.bottom + 9 : Math.max(8, anchor.top - box.height - 9);
      helpTip.style.left = `${clamp(anchor.x + anchor.width / 2 - box.width / 2, 8, innerWidth - box.width - 8)}px`; helpTip.style.top = `${top}px`;
      const key = owner.dataset.link; if (key) [...linkedSources(key), ...linkedTerms(key)].forEach(node => node.classList.add('linked-focus'));
    }
    function arrive(nodes) {
      if (reduced.matches || checkpointBusy) return;
      arrivalAnimations.forEach(animation => animation.cancel());
      arrivalAnimations = nodes.filter(Boolean).map(node => node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' }));
    }

    function visualKey(node) {
      const copy = node.cloneNode(true);
      for (const child of [copy, ...copy.querySelectorAll('*')]) {
        for (const attribute of [...child.attributes]) if (attribute.name.startsWith('aria-') || ['tabindex', 'role', 'data-help', 'data-link', 'data-source', 'data-value-ref', 'data-control'].includes(attribute.name)) child.removeAttribute(attribute.name);
        child.classList.remove('linked-focus', 'value-arrived'); if (!child.classList.length) child.removeAttribute('class');
      }
      return copy.outerHTML;
    }
    function transitionCopy(node) {
      const copy = node.cloneNode(true), prefix = `checkpoint-old-${++transitionSerial}-`, ids = new Map();
      for (const child of [copy, ...copy.querySelectorAll('*')]) if (child.id) { ids.set(child.id, prefix + child.id); child.id = prefix + child.id; }
      for (const child of [copy, ...copy.querySelectorAll('*')]) {
        for (const name of ['data-source', 'data-value-ref', 'data-link', 'data-control', 'aria-live']) child.removeAttribute(name);
        child.removeAttribute('tabindex');
        for (const attribute of [...child.attributes]) {
          let value = attribute.value.replace(/url\(#([^)]+)\)/g, (match, id) => ids.has(id) ? `url(#${ids.get(id)})` : match);
          if (attribute.name === 'href' && ids.has(value.slice(1))) value = `#${ids.get(value.slice(1))}`;
          if (value !== attribute.value) child.setAttribute(attribute.name, value);
        }
        child.style.animation = 'none';
      }
      copy.setAttribute('aria-hidden', 'true'); copy.style.pointerEvents = 'none'; return copy;
    }
    function partSnapshot(node) {
      const visible = !!node.getClientRects().length, style = getComputedStyle(node);
      return { node, visible, key: visible ? visualKey(node) : '', copy: visible ? transitionCopy(node) : null,
        height: visible ? node.getBoundingClientRect().height : 0,
        style: { width: style.width, maxWidth: style.maxWidth, marginTop: visible ? style.marginTop : '0px', marginBottom: visible ? style.marginBottom : '0px', marginLeft: style.marginLeft, marginRight: style.marginRight, gridArea: style.gridArea, flex: style.flex } };
    }
    async function changeCheckpoint(update) {
      if (checkpointBusy) return;
      checkpointBusy = true; hideHelp(); stopConnections(); arrivalAnimations.forEach(animation => animation.cancel());
      const stage = $('stageWrap');
      const parts = ['.mission-copy', '#context', '#working', '#controls', '#records', '#outcome'].map(selector => partSnapshot(root.querySelector(selector)));
      const oldModel = svg.cloneNode(true), oldHeight = stage.getBoundingClientRect().height;
      const localCleanups = [], outgoing = [], incoming = [], sizes = [];
      root.inert = true; root.setAttribute('aria-busy', 'true');
      const animate = (node, frames, duration) => { const animation = node.animate(frames, { duration, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'forwards' }); checkpointAnimations.push(animation); return animation.finished.catch(() => {}); };
      try {
        update(); await Promise.resolve();
        if (reduced.matches) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
        for (const before of parts) {
          const node = before.node, after = partSnapshot(node); if (before.key === after.key) continue;
          const hidden = node.hidden, originalStyle = node.getAttribute('style'), shell = document.createElement('div'), layout = after.visible ? after.style : before.style;
          shell.className = 'checkpoint-part'; Object.assign(shell.style, layout, { height: `${before.height}px`, marginTop: before.style.marginTop, marginBottom: before.style.marginBottom });
          node.replaceWith(shell); shell.appendChild(node); node.hidden = false; Object.assign(node.style, { position: 'absolute', inset: '0 auto auto 0', width: '100%', margin: '0', opacity: '0' });
          if (before.copy) { Object.assign(before.copy.style, { position: 'absolute', inset: '0 auto auto 0', width: '100%', margin: '0' }); shell.appendChild(before.copy); outgoing.push(before.copy); }
          if (after.visible) incoming.push({ node, opacity: 1 });
          sizes.push({ node: shell, from: { height: `${before.height}px`, marginTop: before.style.marginTop, marginBottom: before.style.marginBottom }, to: { height: `${after.height}px`, marginTop: after.style.marginTop, marginBottom: after.style.marginBottom } });
          localCleanups.push(() => { shell.replaceWith(node); node.hidden = hidden; if (originalStyle === null) node.removeAttribute('style'); else node.setAttribute('style', originalStyle); });
        }
        const oldNodes = [...oldModel.children], oldKeys = oldNodes.map(visualKey), matched = new Set();
        for (const node of [...svg.children]) {
          if (node.tagName.toLowerCase() === 'defs') continue;
          const key = visualKey(node), index = oldNodes.findIndex((old, candidate) => !matched.has(candidate) && oldKeys[candidate] === key);
          if (index >= 0) { matched.add(index); node.getAnimations({ subtree: true }).forEach(animation => animation.cancel()); continue; }
          const style = node.getAttribute('style'), opacity = getComputedStyle(node).opacity; node.style.opacity = '0'; incoming.push({ node, opacity });
          localCleanups.push(() => { if (style === null) node.removeAttribute('style'); else node.setAttribute('style', style); });
        }
        oldNodes.forEach((node, index) => { if (matched.has(index)) node.remove(); });
        if ([...oldModel.children].some(node => node.tagName.toLowerCase() !== 'defs')) {
          const oldLayer = transitionCopy(oldModel); oldLayer.classList.add('checkpoint-model'); Object.assign(oldLayer.style, { height: `${oldHeight}px` });
          stage.appendChild(oldLayer); outgoing.push(oldLayer); localCleanups.push(() => oldLayer.remove());
        }
        const newHeight = stage.getBoundingClientRect().height, svgHeight = svg.style.height;
        svg.style.height = `${newHeight}px`; stage.style.height = `${oldHeight}px`;
        sizes.push({ node: stage, from: { height: `${oldHeight}px` }, to: { height: `${newHeight}px` } });
        localCleanups.push(() => { stage.style.height = `${newHeight}px`; svg.style.height = svgHeight; });
        root.dataset.checkpointTransition = 'leaving'; window.scrollTo({ top: 0, behavior: 'smooth' });
        await Promise.all(outgoing.map(node => animate(node, [{ opacity: 1 }, { opacity: 0 }], 150)));
        outgoing.forEach(node => node.remove()); if (reduced.matches) return;
        root.dataset.checkpointTransition = 'entering';
        await Promise.all([...incoming.map(({ node, opacity }) => animate(node, [{ opacity: 0 }, { opacity }], 300)), ...sizes.map(({ node, from, to }) => animate(node, [from, to], 300))]);
      } finally {
        checkpointAnimations.forEach(animation => animation.cancel()); checkpointAnimations = []; localCleanups.forEach(cleanup => cleanup());
        delete root.dataset.checkpointTransition; root.inert = false; root.removeAttribute('aria-busy'); checkpointBusy = false;
        if (Math.abs(stage.getBoundingClientRect().width - W) > .5) resize(); $('title').focus({ preventScroll: true });
      }
    }
    function resize(force = false) {
      if (checkpointBusy && !force) return;
      const box = $('stageWrap').getBoundingClientRect(); W = box.width; mobile = W < 600; syncModel();
      H = model.sceneHeight ? callModel('sceneHeight', W) : mobile ? 400 : 360; syncModel();
      if (box.height !== H) $('stageWrap').style.height = `${H}px`;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); callModel('render');
    }
    function go(nextStep, restart = false, repeat = false) {
      if (checkpointBusy || (!restart && busy())) return;
      if (!restart && !repeat) checkpointSnapshots.set(step, checkpointState());
      if (model.stopModel) callModel('stopModel');
      return changeCheckpoint(() => {
        if (restart) { checkpointSnapshots.clear(); maxStep = 0; step = 0; syncModel(); callModel('reset'); }
        step = clamp(nextStep, 0, lesson().length - 1);
        if (repeat) checkpointSnapshots.delete(step);
        maxStep = Math.max(maxStep, step);
        $('controls').replaceChildren(); $('context').replaceChildren(); $('working').hidden = true; $('working').replaceChildren();
        $('records').replaceChildren(); $('records').hidden = true; $('comparisonNote').hidden = true; $('evidenceHelp').hidden = true;
        hintSteps = []; ready = false; drag = null; syncModel();
        const saved = checkpointSnapshots.get(step);
        if (saved) restoreCheckpoint(saved); else { state().helpLevel = 0; state().helpOpen = false; callModel('enter'); }
        resize(true);
      });
    }

    const resetChoicesView = () => { $('resetChoices').hidden = false; $('resetConfirmation').hidden = true; };
    function closeReset(restoreFocus = false) {
      $('resetMenu').open = false; resetChoicesView();
      if (restoreFocus) $('resetMenu').querySelector('summary').focus({ preventScroll: true });
    }
    on($('next'), 'click', event => {
      if (event.detail > 1 || checkpointBusy || busy()) return;
      if (activeDockSource) runDockAction(activeDockSource, event); else if (ready || step < maxStep) go(step + 1);
    });
    on($('forwardVisited'), 'click', event => { if (event.detail <= 1 && step < maxStep) go(step + 1); });
    on($('back'), 'click', () => go(step - 1));
    on($('resetMenu'), 'toggle', () => { if (!$('resetMenu').open) resetChoicesView(); });
    on($('restart'), 'click', event => {
      if (event.detail > 1 || checkpointBusy || busy()) return;
      $('resetChoices').hidden = true; $('resetConfirmation').hidden = false; $('cancelRestart').focus({ preventScroll: true });
    });
    on($('cancelRestart'), 'click', () => { resetChoicesView(); $('restart').focus({ preventScroll: true }); });
    on($('confirmRestart'), 'click', event => { if (event.detail <= 1 && !checkpointBusy && !busy()) { closeReset(); go(0, true); } });
    on($('repeat'), 'click', event => { if (event.detail <= 1 && !checkpointBusy && !busy()) { closeReset(); go(step, false, true); } });
    on($('hintToggle'), 'click', () => {
      state().helpOpen = !state().helpOpen; syncHint();
      if (state().helpOpen) requestAnimationFrame(() => { if (state().helpOpen) $('evidenceHelp').scrollIntoView({ block: 'nearest', behavior: 'instant' }); });
    });
    on($('previousHint'), 'click', () => { state().helpLevel = Math.max(0, (state().helpLevel || 0) - 1); syncHint(); });
    on($('anotherHint'), 'click', () => { state().helpLevel = Math.min(hintSteps.length - 1, (state().helpLevel || 0) + 1); syncHint(); });
    on($('secondaryAction'), 'click', event => runDockAction(secondaryDockSource, event));

    on(document, 'focusin', event => { if ($('resetMenu').open && !$('resetMenu').contains(event.target)) closeReset(); });
    on(document, 'keydown', event => {
      if (event.key === 'Escape') {
        if ($('resetMenu').open) closeReset(true);
        else if (state().helpOpen && (event.target.closest('#evidenceHelp') || event.target === $('hintToggle'))) { state().helpOpen = false; syncHint(); $('hintToggle').focus(); }
        hideHelp(); stopConnections();
      } else if (root.contains(event.target) && ['Enter', ' '].includes(event.key) && event.target.matches('[data-source],[data-value-ref]')) {
        event.preventDefault(); showHelp(event.target);
      }
    });
    on(document, 'pointerdown', event => {
      if (!event.target.closest('#resetMenu')) closeReset();
      if (!root.contains(event.target)) return;
      if (!event.target.closest('#traceWorking')) stopConnections();
      if (!event.target.closest('[data-help]') && event.target !== helpTip) hideHelp();
      if (event.target.closest('#stage,#working')) $('working').dataset.interacted = 'true';
    });
    on(document, 'pointerover', event => {
      if (!root.contains(event.target) || event.pointerType === 'touch' || drag) return;
      const node = event.target.closest('[data-help]'); if (!node || node === helpOwner) return;
      clearTimeout(helpTimer); helpTimer = setTimeout(() => showHelp(node), 200);
    });
    on(document, 'pointerout', event => {
      if (!root.contains(event.target)) return;
      if (event.relatedTarget && (helpOwner?.contains(event.relatedTarget) || helpTip.contains(event.relatedTarget))) return;
      if (event.target.closest('[data-help]')) { clearTimeout(helpTimer); helpTimer = setTimeout(hideHelp, 100); }
    });
    on(helpTip, 'pointerenter', () => clearTimeout(helpTimer)); on(helpTip, 'pointerleave', hideHelp);
    on(document, 'focusin', event => { if (root.contains(event.target)) { const node = event.target.closest('[data-help]'); if (node) showHelp(node); } });
    on(document, 'focusout', event => { if (root.contains(event.target) && !helpTip.contains(event.relatedTarget)) hideHelp(); });
    on(document, 'click', event => { if (root.contains(event.target)) { const node = event.target.closest('[data-source],[data-value-ref]'); if (node && !event.target.closest('input,select')) showHelp(node); } });
    on(document, 'input', event => { if (root.contains(event.target)) { stopConnections(); hideHelp(); } });
    on(window, 'scroll', () => { stopConnections(); hideHelp(); }, { passive: true });
    on(window, 'resize', () => { stopConnections(); hideHelp(); });
    on(reduced, 'change', () => { stopConnections(); [...arrivalAnimations, ...checkpointAnimations].forEach(animation => animation.cancel()); });

    const runtime = { $, svg, NS, clamp, fmt, validNumber, reduced, el, text, line, dot, clear, endDraw, point, handle,
      feedback, head, go, setHelp, rememberReading, clearReadings, comparisonDescription, comparisonNote, button, workRow,
      workOutput, workSetup, workValue, workState, workAction, table, sourceLabel, explain, term, result, workFormula,
      workingExplanation, updateConnections, stopConnections, arrive, explanations };
    model = createModel(runtime);
    if (!model || !Array.isArray(model.lesson) || !model.state || typeof model.syncScene !== 'function' ||
        typeof model.reset !== 'function' || typeof model.enter !== 'function' || typeof model.render !== 'function' ||
        typeof model.controls !== 'function') {
      cleanups.reverse().forEach(cleanup => cleanup());
      throw new TypeError('LabDesign.discovery model must provide lesson, state, syncScene, reset, enter, render and controls.');
    }
    syncModel(); callModel('reset'); callModel('enter');
    const observer = new ResizeObserver(([entry]) => { if (Math.abs(entry.contentRect.width - W) > .5) resize(); });
    observer.observe($('stageWrap')); cleanups.push(() => observer.disconnect());
    resize();

    return {
      model,
      go,
      resize,
      destroy() {
        if (model.stopModel) callModel('stopModel');
        clearTimeout(announcementTimer); clearTimeout(helpTimer); stopConnections();
        cleanups.reverse().forEach(cleanup => cleanup());
      }
    };
  }
};
/* LAB_DISCOVERY_RUNTIME_END */
