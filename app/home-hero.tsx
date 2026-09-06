'use client';

import { useEffect, useRef, useState } from 'react';
import cpu from './home-previews/cpu.json';
import geometry from './home-previews/geometry.json';
import patterns from './home-previews/patterns.json';
import graph from './home-previews/graph.json';
import circle from './home-previews/circle.json';
import { mount as mountCpu } from './home-previews/cpu.js';
import { mount as mountGeometry } from './home-previews/geometry.js';
import { mount as mountPatterns } from './home-previews/patterns.js';
import { mount as mountGraph } from './home-previews/graph.js';
import { mount as mountCircle } from './home-previews/circle.js';
import './home-hero.css';

const features = [
  { title: 'See ideas take shape.', copy: 'Explore concepts through visual, interactive labs.' },
  { title: 'Change something. See what happens.', copy: 'Experiment with inputs and follow the results.' },
  { title: 'Take your learning with you.', copy: 'Download labs for offline exploration.' },
  { title: 'Make a lab your own.', copy: 'Use AI Lab Remix to adapt an existing lab.' },
];
const ports = [
  { name: 'cpu', asset: cpu, mount: mountCpu, width: 776, height: 530, backdrop: '' },
  { name: 'geometry', asset: geometry, mount: mountGeometry, width: 720, height: 720,
    backdrop: '.map-frame,.map-frame svg{background:transparent!important;border-color:transparent!important;box-shadow:none!important}' },
  { name: 'patterns', asset: patterns, mount: mountPatterns, width: 850, height: 490,
    backdrop: '.canvas{background:transparent!important}' },
  { name: 'graph', asset: graph, mount: mountGraph, width: 760, height: 446,
    backdrop: '.graph-shell{background:transparent!important}' },
  { name: 'circle', asset: circle, mount: mountCircle, width: 820, height: 720,
    backdrop: '.svg-wrap{background:transparent!important}.circle-main{fill:none}' },
];

export default function HomeHero() {
  const hero = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const refresh = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = hero.current!;
    const frames = [...root.querySelectorAll<HTMLElement>('.home-scene')];
    const messages = [...root.querySelectorAll<HTMLElement>('.home-feature')];
    const players = ports.map((port, i) => {
      const host = frames[i].querySelector<HTMLElement>('.home-port')!;
      // Declarative shadow DOM renders the source markup on the server. Client navigation
      // uses the same template as a fallback, without loading a lab or fetching assets.
      let shadow = host.shadowRoot;
      if (!shadow) {
        const template = host.querySelector('template')!;
        shadow = host.attachShadow({ mode: 'open' });
        shadow.append(template.content.cloneNode(true));
        template.remove();
      }
      return port.mount(shadow);
    });
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let elapsed = 0;
    let last: number | null = null;
    let frame = 0;
    let disposed = false;

    function draw() {
      const reduced = motion.matches;
      root.dataset.reducedMotion = String(reduced);
      root.dataset.elapsed = String(Math.round(elapsed));
      frames.forEach((scene, i) => {
        const cycle = ports.length * 7000;
        const local = (elapsed - i * 7000 + cycle) % cycle;
        const opacity = reduced ? Number(i === 0) : elapsed < i * 7000 ? 0
          : i === 0 && elapsed < 1000 ? 1
          : local < 1000 ? local / 1000
          : local < 7000 ? 1
          : local < 8000 ? 1 - (local - 7000) / 1000 : 0;
        scene.style.opacity = String(opacity);
        scene.dataset.active = String(opacity > 0);
        const plane = scene.querySelector<HTMLElement>('.home-plane')!;
        const progress = Math.min(local, 8000) / 8000;
        const turn = -24 + 48 * progress;
        plane.style.transform = reduced ? 'none'
          : `translateZ(${-35 * Math.abs(turn) / 24}px) rotateX(${5 - progress * 10}deg) rotateY(${turn}deg)`;
        // Scene rotation has its own seven-second cadence, independent of lab progress.
        if (reduced) { if (i === 0) players[i](0); }
        else if (opacity > 0) players[i](Math.min(local, 8000));
        else players[i](0);
      });
      messages.forEach((message, i) => {
        const local = (elapsed - i * 7000 + 28000) % 28000;
        const opacity = reduced ? 1 : elapsed < i * 7000 ? 0 : i === 0 && elapsed < 500 ? 1
          : local < 500 ? local / 500 : local < 7000 ? 1
          : local < 7500 ? 1 - (local - 7000) / 500 : 0;
        message.style.opacity = String(opacity);
        message.setAttribute('aria-hidden', String(!reduced && Math.floor(elapsed / 7000) % 4 !== i));
      });
    }
    function tick(now: number) {
      if (last !== null) elapsed += (now - last) * 1.265;
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      last = null;
      draw();
      if (!disposed && visible && !document.hidden && !motion.matches && !pausedRef.current) frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      resume();
    });
    observer.observe(root.closest('section')!);
    const resize = new ResizeObserver(() => {
      frames.forEach((scene, i) => {
        const port = ports[i];
        const fit = (port.name === 'cpu' ? .74 : .82) * Math.min(scene.clientWidth / port.width, scene.clientHeight / port.height);
        scene.style.setProperty('--port-scale', String(fit));
      });
    });
    resize.observe(frames[0]);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    refresh.current = resume;
    resume();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
      refresh.current = () => {};
    };
  }, []);

  return (
    <div className="home-hero-content" ref={hero}>
      <div className="hero-copy home-copy">
        <h1><span className="hero-line">Make complex</span><span className="hero-line">ideas click.</span></h1>
        <div className="home-features">
          {features.map((feature, i) => (
            <div className="home-feature" key={feature.title} aria-hidden={i !== 0}>
              <div><p className="home-feature-title">{feature.title}</p><p className="home-feature-copy">{feature.copy}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="home-artwork">
        <div className="home-preview-window" aria-hidden="true" inert>
          {ports.map(port => (
            <div className={`home-scene home-scene-${port.name}`} key={port.name}>
              <div className="home-plane">
                <div className="home-port-fit" style={{ width: port.width, height: port.height }}>
                  {/* The HTML parser consumes the declarative template into a shadow root before hydration. */}
                  <div className="home-port" data-port={port.name} suppressHydrationWarning dangerouslySetInnerHTML={{ __html:
                    `<template shadowrootmode="open"><style>${port.asset.css}</style><style data-home-backdrop>svg{text-rendering:geometricPrecision}${port.backdrop}</style>${port.asset.html}</template>` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="home-motion-control" type="button" aria-pressed={paused}
          aria-label={paused ? 'Resume homepage animation' : 'Pause homepage animation'}
          onClick={() => { pausedRef.current = !paused; setPaused(!paused); refresh.current(); }}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paused ? 'm7 4 9 6-9 6V4Z' : 'M7 4v12M13 4v12'} /></svg>
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="home-explore-note">
        <span>explore labs below</span>
        <svg viewBox="0 0 88 76" aria-hidden="true"><path d="M8 10C30 0 58 7 58 27c0 12-14 15-14 29v11M33 55l11 13 11-13" /></svg>
      </div>
    </div>
  );
}
