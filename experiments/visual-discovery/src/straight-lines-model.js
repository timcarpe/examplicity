// Pure straight-line model. No DOM, sampling-based equality or expression evaluation.
function railNumber(value) {
  const raw = String(value).trim().replace(/−/g, '-').replace(/\s/g, '');
  if (!raw) return null;
  const match = raw.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\/([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?$/);
  if (!match) return null;
  const numerator = Number(match[1]), denominator = match[2] === undefined ? 1 : Number(match[2]);
  const valueNumber = numerator / denominator;
  return denominator !== 0 && Number.isFinite(valueNumber) ? valueNumber : null;
}
function railValue(rail, position) { return rail.mode === 'vertical' ? rail.k : rail.m * position + rail.c; }
function railPoint(rail, position) { return rail.mode === 'vertical' ? {x: rail.k, y: position} : {x: position, y: railValue(rail, position)}; }
function railGap(a, b, position) { return a.mode === b.mode ? railValue(a, position) - railValue(b, position) : null; }
function railExtent(a, b, low = -2, high = 2) {
  // The gap is affine. Its absolute maximum on a closed interval is at an endpoint.
  if (a.mode !== b.mode) return null;
  return Math.max(Math.abs(railGap(a, b, low)), Math.abs(railGap(a, b, high)));
}
function railSame(a, b) { const gap = railExtent(a, b); return gap !== null && gap < 1e-8; }
function railParallel(a, b) { return a.mode === b.mode && (a.mode === 'vertical' || Math.abs(a.m - b.m) < 1e-8); }
function railText(value) {
  const clean = Math.abs(value) < 1e-9 ? 0 : Math.round(value * 10000) / 10000;
  return String(clean).replace('-', '−');
}
function railEquation(rail) {
  if (rail.mode === 'vertical') return `x = ${railText(rail.k)}`;
  if (Math.abs(rail.m) < 1e-9) return `y = ${railText(rail.c)}`;
  const first = rail.m === 1 ? 'x' : rail.m === -1 ? '−x' : `${railText(rail.m)}x`;
  return 'y = ' + first + (rail.c === 0 ? '' : ` ${rail.c < 0 ? '−' : '+'} ${railText(Math.abs(rail.c))}`);
}
function railOnPoint(rail, point) { return Math.abs(rail.mode === 'vertical' ? point.x - rail.k : point.y - railValue(rail, point.x)) < 1e-8; }
