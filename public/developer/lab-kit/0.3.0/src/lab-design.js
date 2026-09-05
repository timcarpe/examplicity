/* Shared model dragging: retain the point grabbed while the model rerenders. */
window.LabDesign = {
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
  function init() {
    if (!document.body.classList.contains('lab-adopt-v3')) return;
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
    const cardSelector = '.calc-step,.solve-card,.derive-step';
    let queued = false;
    const key = card => [...card.querySelectorAll('input')].map(input => input.id || input.name || [...input.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + a.value).join(':')).join('|') || card.querySelector('.step-head,.derive-step-head')?.textContent;
    function refresh() {
      queued = false;
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
      const target = event.target.closest('[data-lab-intro]');
      if (target && event.key !== 'Tab') { introduced.add(target.dataset.labIntro); clearIntroduction(); schedule(); }
    }, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    document.addEventListener('focusin', event => {
      if (!event.target.matches('input')) return;
      const card = event.target.closest(cardSelector);
      if (card) { touched.add(key(card)); card.dataset.interacted = 'true'; }
    });
    document.addEventListener('pointerdown', event => {
      const input = event.target.closest('input');
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
