'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
// Google Material Symbols, Apache-2.0. See public/licenses/material-symbols.txt.
import featureIcons from './home-feature-icons.json';
import cpu from './home-previews/cpu.json';
import packet from './home-previews/packet.json';
import diffraction from './home-previews/diffraction.json';
import gas from './home-previews/gas.json';
import graph from './home-previews/graph.json';
import circle from './home-previews/circle.json';
import trig from './home-previews/trig.json';
import { mount as mountCpu } from './home-previews/cpu.js';
import { mount as mountPacket } from './home-previews/packet.js';
import { mount as mountDiffraction } from './home-previews/diffraction.js';
import { mount as mountGas } from './home-previews/gas.js';
import { mount as mountGraph } from './home-previews/graph.js';
import { mount as mountCircle } from './home-previews/circle.js';
import { mount as mountTrig } from './home-previews/trig.js';
import './home-hero.css';

const ports = [
  { name: 'packet', asset: packet, mount: mountPacket, width: 760, height: 610,
    crop: { x: 0, y: 30, width: 760, height: 550 },
    camera: [{ x: 280, y: 270, zoom: 1.7, pitch: 57, yaw: -18, depth: -70 }, { x: 540, y: 330, zoom: 1.92, pitch: 46, yaw: -4, depth: 30 }],
    bend: { x: -20, y: -55 },
    playback: { offset: 0, rate: .85 },
    backdrop: '.network-canvas{background-color:transparent!important}' },
  { name: 'diffraction', asset: diffraction, mount: mountDiffraction, width: 900, height: 420,
    crop: { x: 0, y: 0, width: 900, height: 420 },
    camera: [{ x: 325, y: 210, zoom: 1.55, pitch: 58, yaw: 12, depth: -20 }, { x: 555, y: 225, zoom: 1.72, pitch: 64, yaw: 12, depth: 45 }],
    bend: { x: 0, y: 0 },
    playback: { offset: 0, rate: 1 },
    backdrop: '' },
  { name: 'gas', asset: gas, mount: mountGas, width: 1040, height: 620,
    crop: { x: 20, y: 40, width: 1000, height: 560 },
    camera: [{ x: 640, y: 220, zoom: 1.4, pitch: 14, yaw: -12, depth: 20 }, { x: 435, y: 270, zoom: 1.58, pitch: 29, yaw: 2, depth: -40 }],
    bend: { x: 20, y: 40 },
    playback: { offset: 300, rate: .72 },
    backdrop: '#home-gas-stage>rect{fill:none}' },
  { name: 'graph', asset: graph, mount: mountGraph, width: 760, height: 446,
    crop: { x: 30, y: 46, width: 700, height: 340 },
    camera: [{ x: 225, y: 240, zoom: 1.42, pitch: 48, yaw: 18, depth: -60 }, { x: 570, y: 200, zoom: 1.55, pitch: 33, yaw: 3, depth: 10 }],
    bend: { x: 15, y: 50 },
    playback: { offset: 2600, rate: 1.8 },
    backdrop: '.graph-shell{background:transparent!important}' },
  { name: 'circle', asset: circle, mount: mountCircle, width: 820, height: 720,
    crop: { x: 80, y: 40, width: 660, height: 640 },
    camera: [{ x: 485, y: 230, zoom: 1.85, pitch: 20, yaw: -18, depth: -20 }, { x: 625, y: 350, zoom: 2.4, pitch: 46, yaw: -4, depth: 55 }],
    bend: { x: 18, y: -15 },
    playback: { offset: 1000, rate: .88 },
    backdrop: '.svg-wrap{background:transparent!important}.circle-main{fill:none}' },
  { name: 'cpu', asset: cpu, mount: mountCpu, width: 776, height: 530,
    crop: { x: 8, y: 8, width: 760, height: 514 },
    camera: [{ x: 490, y: 330, zoom: 1.28, pitch: 43, yaw: 10, depth: -60 }, { x: 360, y: 230, zoom: 1.5, pitch: 23, yaw: 10, depth: 0 }],
    bend: { x: -30, y: 0 },
    playback: { offset: 1400, rate: .82 }, backdrop: '' },
  { name: 'trig', asset: trig, mount: mountTrig, width: 479, height: 370,
    crop: { x: 0, y: 40, width: 479, height: 330 },
    camera: [{ x: 170, y: 155, zoom: 1.65, pitch: 55, yaw: -15, depth: -30 }, { x: 340, y: 210, zoom: 1.8, pitch: 36, yaw: 8, depth: 35 }],
    bend: { x: 0, y: 20 },
    playback: { offset: 0, rate: 1 },
    backdrop: '.graph-side,#home-trig-graphSvg{background:transparent!important}#home-trig-graphSvg>rect:first-child{fill:none}' },
];

const sceneDuration = 5950;
const crossfadeDuration = 840;
const playbackDuration = 9700;
const fade = (value: number) => value * value * (3 - 2 * value);

const features = [
  { id: 'learn', title: 'Learn Concepts', icon: featureIcons.school,
    description: 'See how a concept works, step by step, through a working model you can interact with.' },
  { id: 'explore', title: 'Explore Ideas', icon: featureIcons.explore,
    description: 'Change an input, test a prediction, and discover what happens next.' },
  { id: 'source', title: 'Open Source', icon: featureIcons.code,
    description: 'Download a lab, look inside its code, and make it your own. Keep using it offline.' },
  { id: 'ai', title: 'AI Compatible', icon: featureIcons.auto_awesome,
    description: 'Take a lab to your AI assistant. Use AI Lab Remix to adapt its examples, explanations, or activities.' },
];

export default function HomeHero() {
  const hero = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const refresh = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  function moveFeature(event: ReactPointerEvent<HTMLLIElement>) {
    if (event.pointerType === 'touch' || pausedRef.current || hero.current?.dataset.reducedMotion === 'true') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    event.currentTarget.style.setProperty('--feature-rx', `${-y * 8}deg`);
    event.currentTarget.style.setProperty('--feature-ry', `${x * 10}deg`);
    event.currentTarget.style.setProperty('--feature-x', `${-x * 8}px`);
    event.currentTarget.style.setProperty('--feature-y', `${-y * 6}px`);
  }

  function leaveFeature(event: ReactPointerEvent<HTMLLIElement>) {
    for (const property of ['--feature-rx', '--feature-ry', '--feature-x', '--feature-y']) {
      event.currentTarget.style.removeProperty(property);
    }
    if (!event.currentTarget.contains(document.activeElement)) setActiveFeature(null);
  }

  useEffect(() => {
    const root = hero.current!;
    const frames = [...root.querySelectorAll<HTMLElement>('.home-scene')];
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
        const cycle = ports.length * sceneDuration;
        const local = (elapsed - i * sceneDuration + cycle) % cycle;
        const opacity = reduced ? Number(i === 0) : elapsed < i * sceneDuration ? 0
          : i === 0 && elapsed < crossfadeDuration ? 1
          : local < crossfadeDuration ? fade(local / crossfadeDuration)
          : local < sceneDuration ? 1
          : local < sceneDuration + crossfadeDuration ? 1 - fade((local - sceneDuration) / crossfadeDuration) : 0;
        scene.style.opacity = String(opacity);
        scene.dataset.active = String(opacity > 0);
        if (opacity === 0) { players[i](0); return; }
        const plane = scene.querySelector<HTMLElement>('.home-plane')!;
        const progress = Math.min(local / (sceneDuration + crossfadeDuration), 1);
        // Continuous camera pitch/heading/depth; roll stays level with the horizon.
        const start = ports[i].camera[0];
        const end = ports[i].camera[1];
        const blend = reduced ? 0 : progress;
        const pitch = start.pitch + (end.pitch - start.pitch) * blend;
        const yaw = start.yaw + (end.yaw - start.yaw) * blend;
        const depth = start.depth + (end.depth - start.depth) * blend;
        plane.style.transform = reduced ? 'none'
          : `translate3d(0, 0, ${depth}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
        // A single smooth arc for turning flights; zero bend gives a straight pass.
        // These source-plane translations are projected through the 3D camera above.
        const arc = 4 * blend * (1 - blend);
        const x = start.x + (end.x - start.x) * blend + ports[i].bend.x * arc;
        const y = start.y + (end.y - start.y) * blend + ports[i].bend.y * arc;
        const zoom = start.zoom + (end.zoom - start.zoom) * blend;
        scene.querySelector<HTMLElement>('.home-port-fit')!.style.transform =
          `scale(calc(var(--port-scale) * ${zoom})) translate(${-x}px, ${-y}px)`;
        // Native action timing is separate from the calm, constant-speed camera pass.
        const playback = ports[i].playback;
        players[i](reduced ? 0 : playback.offset + progress * playbackDuration * playback.rate);
      });
    }
    function tick(now: number) {
      if (last !== null) elapsed += now - last;
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
        // Fit a native source region; the component itself keeps all its original geometry.
        const fit = Math.min(scene.clientWidth / port.crop.width, scene.clientHeight / port.crop.height);
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
    <div className="home-hero-content" ref={hero} data-paused={paused}>
      <div className="hero-copy home-copy">
        <h1><span className="hero-line">Make complex</span><span className="hero-line">ideas click.</span></h1>
        <ul className="home-features" aria-label="Ways to use our labs">
          {features.map(feature => (
            <li key={feature.id} data-open={activeFeature === feature.id}
              onPointerEnter={() => setActiveFeature(feature.id)} onPointerMove={moveFeature} onPointerLeave={leaveFeature}
              onFocus={() => setActiveFeature(feature.id)} onBlur={() => setActiveFeature(null)}
              onKeyDown={event => { if (event.key === 'Escape') setActiveFeature(null); }}>
              <button className="home-feature-card" type="button" aria-label={feature.title}
                aria-describedby={`home-feature-${feature.id}`} onClick={() => setActiveFeature(feature.id)}>
                <span className="home-feature-content">
                  <svg viewBox={feature.icon.viewBox} aria-hidden="true"><path d={feature.icon.path} /></svg>
                  <span className="home-feature-label">{feature.title.split(' ')[0]}<br />{feature.title.split(' ').slice(1).join(' ')}</span>
                </span>
              </button>
              <span className="home-feature-tooltip" role="tooltip" id={`home-feature-${feature.id}`}>
                <strong>{feature.title}</strong>{feature.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="home-artwork">
        <div className="home-preview-window" aria-hidden="true" inert>
          {ports.map(port => (
            <div className={`home-scene home-scene-${port.name}`} key={port.name}>
              <div className="home-plane">
                <div className="home-port-fit" style={{ width: port.width, height: port.height,
                  transform: `scale(calc(var(--port-scale) * ${port.camera[0].zoom})) translate(${-port.camera[0].x}px, ${-port.camera[0].y}px)` }}>
                  {/* The HTML parser consumes the declarative template into a shadow root before hydration. */}
                  <div className="home-port" data-port={port.name}
                    style={{ maskImage: `linear-gradient(to right, transparent ${port.crop.x}px, #000 ${port.crop.x + 64}px, #000 ${port.crop.x + port.crop.width - 64}px, transparent ${port.crop.x + port.crop.width}px), linear-gradient(transparent ${port.crop.y}px, #000 ${port.crop.y + 56}px, #000 ${port.crop.y + port.crop.height - 56}px, transparent ${port.crop.y + port.crop.height}px)` }}
                    suppressHydrationWarning dangerouslySetInnerHTML={{ __html:
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
    </div>
  );
}
