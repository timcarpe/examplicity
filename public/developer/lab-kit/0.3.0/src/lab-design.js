/* Shared progressive-card attention and movable completion for opted-in labs. */
(() => {
  function init() {
    if (!document.body.classList.contains('lab-adopt-v3')) return;
    const touched = new Set();
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
    }
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(refresh); } };
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
