'use client';

import { useEffect, useState } from 'react';
import styles from './developer.module.css';

const sections = [
  ['start', 'Start with a lab'],
  ['reasoning', 'Choose reasoning depth'],
  ['remix', 'Adapt an existing lab'],
  ['create', 'Create a new lab'],
  ['design', 'Design references'],
  ['check', 'Check and deliver'],
] as const;

export default function ContentsNav() {
  const [active, setActive] = useState<string>('start');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      let current: string = sections[0][0];
      for (const [id] of sections) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= headerBottom + 100) current = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'check';
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, []);

  return (
    <nav className={styles.contents} aria-label="On this page">
      <p>On this page</p>
      {sections.map(([id, label]) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
          <span>{label}</span><strong aria-hidden="true">{label}</strong>
        </a>
      ))}
    </nav>
  );
}
