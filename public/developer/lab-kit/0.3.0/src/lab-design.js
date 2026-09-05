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
  function init() {
    if (!document.body.classList.contains('lab-adopt-v3')) return;
    const touched = new Set();
    const introduced = new Set();
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
      const r = introduction.getBoundingClientRect(), w = hint.offsetWidth, h = hint.offsetHeight, gap = 16;
      const candidates = [[r.right + gap, r.top], [r.left - w - gap, r.top], [r.left + (r.width - w) / 2, r.bottom + gap], [r.left + (r.width - w) / 2, r.top - h - gap]];
      const overlap = ([x, y]) => Math.max(0, Math.min(x + w, r.right + 8) - Math.max(x, r.left - 8)) * Math.max(0, Math.min(y + h, r.bottom + 8) - Math.max(y, r.top - 8));
      const positions = candidates.map(([x, y]) => [Math.max(8, Math.min(innerWidth - w - 8, x)), Math.max(8, Math.min(innerHeight - h - 8, y))]);
      positions.sort((a, b) => overlap(a) - overlap(b));
      hint.style.left = positions[0][0] + 'px'; hint.style.top = positions[0][1] + 'px';
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
