(() => {
  "use strict";

  const host = globalThis;
  const VERSION = "0.1.0";

  function documentFor(root) {
    return root || host.document || null;
  }

  function resolve(target, root) {
    if (typeof target !== "string") return target || null;
    const scope = documentFor(root);
    return scope?.querySelector?.(target) || null;
  }

  function all(selector, root) {
    const scope = documentFor(root);
    return [...(scope?.querySelectorAll?.(selector) || [])];
  }

  function byId(id, root) {
    const scope = documentFor(root);
    return scope?.getElementById?.(id) || null;
  }

  function required(target, root) {
    const node = resolve(target, root);
    if (!node) throw new Error(`LabKit could not find ${typeof target === "string" ? target : "the requested node"}.`);
    return node;
  }

  const dom = Object.freeze({
    get: resolve,
    all,
    byId,
    require: required,
    on(target, eventName, handler, options) {
      const node = required(target);
      node.addEventListener(eventName, handler, options);
      return () => node.removeEventListener(eventName, handler, options);
    }
  });

  function parseNumber(value, fallback = null) {
    if (typeof value === "string" && value.trim() === "") return fallback;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, minimum, maximum) {
    if (minimum > maximum) throw new RangeError("LabKit clamp minimum cannot exceed maximum.");
    const number = parseNumber(value, minimum);
    return Math.min(maximum, Math.max(minimum, number));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function inverseLerp(start, end, value) {
    if (start === end) return 0;
    return (value - start) / (end - start);
  }

  function round(value, decimals = 0) {
    const number = parseNumber(value, 0);
    const factor = 10 ** decimals;
    return Math.round((number + Number.EPSILON) * factor) / factor;
  }

  function format(value, options = {}) {
    const number = parseNumber(value, 0);
    const decimals = options.decimals ?? 0;
    const suffix = options.suffix ?? "";
    return `${number.toFixed(decimals)}${suffix}`;
  }

  const numeric = Object.freeze({ parse: parseNumber, clamp, lerp, inverseLerp, round, format });

  function hashSeed(seed) {
    if (typeof seed === "number" && Number.isFinite(seed)) return (seed >>> 0) || 0x6d2b79f5;
    const text = String(seed ?? "lab-kit");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 0x6d2b79f5;
  }

  function createRng(seed = Date.now()) {
    const originalSeed = hashSeed(seed);
    let state = originalSeed;
    const next = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
    return Object.freeze({
      seed: originalSeed,
      next,
      float: next,
      int(minimum, maximum) {
        if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum < minimum) {
          throw new RangeError("LabKit RNG bounds are invalid.");
        }
        const low = Math.ceil(minimum);
        const high = Math.floor(maximum);
        return low + Math.floor(next() * (high - low + 1));
      },
      pick(items) {
        if (!items?.length) return undefined;
        return items[this.int(0, items.length - 1)];
      },
      shuffle(items) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
          const other = this.int(0, index);
          [copy[index], copy[other]] = [copy[other], copy[index]];
        }
        return copy;
      }
    });
  }

  const rng = Object.freeze({ create: createRng, hashSeed });

  function setStatus(target, message, options = {}) {
    const node = required(target, options.root);
    const politeness = options.politeness || "polite";
    node.setAttribute?.("role", options.role || "status");
    node.setAttribute?.("aria-live", politeness);
    node.setAttribute?.("aria-atomic", "true");
    if (options.busy === true) node.setAttribute?.("aria-busy", "true");
    else node.removeAttribute?.("aria-busy");
    node.textContent = message == null ? "" : String(message);
    return node;
  }

  function ensureStatus(options = {}) {
    const root = documentFor(options.root);
    if (!root) throw new Error("LabKit status.ensure needs a document or root.");
    const existing = options.id ? byId(options.id, root) : root.querySelector?.("[data-lab-kit-status]");
    if (existing) return existing;
    if (!root.createElement) throw new Error("LabKit status.ensure needs a document-like root.");
    const node = root.createElement("div");
    if (options.id) node.id = options.id;
    if (node.dataset) node.dataset.labKitStatus = "true";
    node.className = options.className || "lab-kit-visually-hidden";
    if (root.body?.appendChild) root.body.appendChild(node);
    else root.appendChild?.(node);
    return setStatus(node, options.initialMessage || "", options);
  }

  const status = Object.freeze({ set: setStatus, announce: setStatus, ensure: ensureStatus });

  function snapshot(value, clone) {
    return clone ? clone(value) : value;
  }

  function createHistory(options = {}) {
    const limit = Math.max(1, Math.floor(options.limit ?? 20));
    const clone = options.clone;
    let past = [];
    let future = [];
    let presentSet = Object.hasOwn(options, "initial");
    let present = presentSet ? snapshot(options.initial, clone) : undefined;

    const trim = () => {
      if (past.length > limit) past = past.slice(-limit);
    };
    const api = {
      record(value) {
        if (presentSet) past.push(present);
        present = snapshot(value, clone);
        presentSet = true;
        future = [];
        trim();
        return present;
      },
      undo() {
        if (!past.length) return present;
        future.unshift(present);
        present = past.pop();
        return present;
      },
      redo() {
        if (!future.length) return present;
        past.push(present);
        present = future.shift();
        trim();
        return present;
      },
      clear(value) {
        past = [];
        future = [];
        presentSet = arguments.length > 0;
        present = presentSet ? snapshot(value, clone) : undefined;
        return present;
      },
      current() { return present; },
      canUndo() { return past.length > 0; },
      canRedo() { return future.length > 0; },
      size() { return past.length + (presentSet ? 1 : 0) + future.length; },
      entries() { return [...past, ...(presentSet ? [present] : []), ...future]; }
    };
    return Object.freeze(api);
  }

  const history = Object.freeze({ create: createHistory });

  function clientCoordinates(event) {
    const source = event?.touches?.[0] || event?.changedTouches?.[0] || event;
    const x = Number(source?.clientX);
    const y = Number(source?.clientY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError("LabKit SVG events need clientX and clientY.");
    return { x, y };
  }

  function svgPoint(svg, event) {
    if (!svg) throw new TypeError("LabKit svg.point needs an SVG element.");
    const client = clientCoordinates(event);
    const matrix = svg.getScreenCTM?.();
    if (svg.createSVGPoint && matrix?.inverse) {
      const point = svg.createSVGPoint();
      point.x = client.x;
      point.y = client.y;
      return point.matrixTransform(matrix.inverse());
    }
    const rect = svg.getBoundingClientRect?.();
    const viewBox = svg.viewBox?.baseVal;
    if (!rect || !viewBox || !rect.width || !rect.height) return client;
    return {
      x: viewBox.x + (client.x - rect.left) * viewBox.width / rect.width,
      y: viewBox.y + (client.y - rect.top) * viewBox.height / rect.height
    };
  }

  const svg = Object.freeze({ point: svgPoint, clientPoint: clientCoordinates });

  function now() {
    return host.performance?.now?.() ?? Date.now();
  }

  function createAnimation(options = {}) {
    const onFrame = options.onFrame || (() => {});
    const onComplete = options.onComplete || (() => {});
    const duration = options.reducedMotion ? 0 : (options.duration ?? null);
    const requestFrame = options.requestFrame || host.requestAnimationFrame?.bind(host) || ((callback) => host.setTimeout(() => callback(now()), 16));
    const cancelFrame = options.cancelFrame || host.cancelAnimationFrame?.bind(host) || host.clearTimeout?.bind(host);
    let frameId = null;
    let running = false;
    let completed = false;
    let elapsed = 0;
    let startedAt = null;

    const progressFor = (milliseconds) => duration === null ? null : duration === 0 ? 1 : clamp(milliseconds / duration, 0, 1);
    const api = {
      start() {
        if (running) return api;
        if (completed) {
          completed = false;
          elapsed = 0;
          startedAt = null;
        }
        running = true;
        frameId = requestFrame(tick);
        return api;
      },
      pause() {
        if (!running) return api;
        running = false;
        if (frameId !== null) cancelFrame?.(frameId);
        frameId = null;
        startedAt = null;
        return api;
      },
      stop() {
        running = false;
        if (frameId !== null) cancelFrame?.(frameId);
        frameId = null;
        startedAt = null;
        return api;
      },
      reset() {
        api.stop();
        completed = false;
        elapsed = 0;
        startedAt = null;
        return api;
      },
      seek(milliseconds) {
        elapsed = Math.max(0, Number(milliseconds) || 0);
        startedAt = running ? now() - elapsed : null;
        completed = duration !== null && elapsed >= duration;
        return api;
      },
      isRunning() { return running; },
      isComplete() { return completed; },
      elapsed() { return elapsed; },
      progress() { return progressFor(elapsed); },
      duration
    };

    function tick(time) {
      if (!running) return;
      const timestamp = Number.isFinite(time) ? time : now();
      if (startedAt === null) startedAt = timestamp - elapsed;
      elapsed = Math.max(0, timestamp - startedAt);
      const progress = progressFor(elapsed);
      const done = progress !== null && progress >= 1;
      onFrame({ elapsed, progress, done });
      if (done) {
        running = false;
        completed = true;
        frameId = null;
        onComplete({ elapsed, progress: 1 });
      } else {
        frameId = requestFrame(tick);
      }
    }

    return Object.freeze(api);
  }

  const animation = Object.freeze({ create: createAnimation });

  function bindKeyboardAdjustable(target, options = {}) {
    const node = required(target);
    const minimum = options.min ?? -Infinity;
    const maximum = options.max ?? Infinity;
    const step = Math.abs(options.step ?? 1) || 1;
    let value = parseNumber(options.value, 0);
    if (options.getValue) value = parseNumber(options.getValue(), value);

    const setAria = () => {
      if (options.role !== false && !node.getAttribute?.("role")) node.setAttribute?.("role", options.role || "slider");
      if (options.tabIndex !== false && !node.hasAttribute?.("tabindex")) node.setAttribute?.("tabindex", String(options.tabIndex ?? 0));
      if (Number.isFinite(minimum)) node.setAttribute?.("aria-valuemin", String(minimum));
      if (Number.isFinite(maximum)) node.setAttribute?.("aria-valuemax", String(maximum));
      node.setAttribute?.("aria-valuenow", String(value));
      if (options.formatAriaValue) node.setAttribute?.("aria-valuetext", String(options.formatAriaValue(value)));
    };

    const update = () => {
      if (options.getValue) value = parseNumber(options.getValue(), value);
      setAria();
      return value;
    };

    const set = (nextValue, event) => {
      const next = clamp(nextValue, minimum, maximum);
      const changed = next !== value;
      value = next;
      options.setValue?.(value, event);
      setAria();
      if (changed) options.onChange?.(value, event);
      return changed;
    };

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const multiplier = event.shiftKey ? 10 : 1;
      let delta = 0;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = step * multiplier;
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -step * multiplier;
      if (event.key === "PageUp") delta = step * 10;
      if (event.key === "PageDown") delta = -step * 10;
      if (event.key === "Home") {
        event.preventDefault?.();
        set(minimum, event);
        return;
      }
      if (event.key === "End") {
        event.preventDefault?.();
        set(maximum, event);
        return;
      }
      if (!delta) return;
      event.preventDefault?.();
      set((options.getValue ? parseNumber(options.getValue(), value) : value) + delta, event);
    };

    node.addEventListener("keydown", onKeyDown);
    update();
    return Object.freeze({
      set,
      value: () => value,
      update,
      destroy: () => node.removeEventListener("keydown", onKeyDown)
    });
  }

  const direct = Object.freeze({ keyboardAdjustable: bindKeyboardAdjustable });

  const api = Object.freeze({ version: VERSION, dom, numeric, rng, status, history, svg, animation, direct });
  host.LabKit = api;
})();
