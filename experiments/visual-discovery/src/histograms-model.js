// One frequency model supplies bar area, cumulative growth and estimated read-offs.
// Pure functions are shared by the browser and the model tests.
function histogramDistribution(boundaries, frequencies) {
  if (!Array.isArray(boundaries) || !Array.isArray(frequencies) ||
      !frequencies.length || boundaries.length !== frequencies.length + 1 ||
      boundaries.some(x => !Number.isFinite(x)) ||
      frequencies.some(f => !Number.isFinite(f) || f < 0)) {
    throw new RangeError('A distribution needs finite boundaries and non-negative frequencies.');
  }
  const widths = frequencies.map((_, i) => boundaries[i + 1] - boundaries[i]);
  if (widths.some(w => w <= 0)) throw new RangeError('Class boundaries must strictly increase.');
  const cumulative = [0];
  for (const f of frequencies) cumulative.push(cumulative.at(-1) + f);
  return {
    boundaries: boundaries.slice(), frequencies: frequencies.slice(), widths,
    densities: frequencies.map((f, i) => f / widths[i]),
    cumulative, total: cumulative.at(-1)
  };
}
function histogramCumulativeAt(data, x) {
  if (!Number.isFinite(x)) throw new RangeError('A read-off needs a finite coordinate.');
  if (x <= data.boundaries[0]) return 0;
  for (let i = 0; i < data.frequencies.length; i++) {
    if (x <= data.boundaries[i + 1]) {
      return data.cumulative[i] + data.frequencies[i] * (x - data.boundaries[i]) / data.widths[i];
    }
  }
  return data.total;
}
function histogramQuantile(data, fraction) {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
    throw new RangeError('A quantile fraction must be between zero and one.');
  }
  if (!data.total) return null;
  if (fraction === 0) return data.boundaries[0];
  const rank = fraction * data.total;
  // Piecewise-linear interpolation: equal density inside a group, not invented raw data.
  // At a flat section use the leftmost value that reaches the requested rank.
  for (let i = 0; i < data.frequencies.length; i++) {
    if (data.frequencies[i] > 0 && rank <= data.cumulative[i + 1]) {
      return data.boundaries[i] + (rank - data.cumulative[i]) / data.densities[i];
    }
  }
  return data.boundaries.at(-1);
}
function histogramNumber(raw) {
  const value = String(raw).trim().replaceAll('−', '-');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(value)) return null;
  const [a, b = '1'] = value.split('/');
  const result = Number(a) / Number(b);
  return Number(b) === 0 || !Number.isFinite(result) ? null : result;
}
function histogramMatches(actual, expected, tolerance = 1e-8) {
  return actual.length === expected.length && actual.every((x, i) => Math.abs(x - expected[i]) <= tolerance);
}
