'use client';

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { exams, labs, translator, type Activity, type ExamCode } from './labs';
import { LabIcon } from './lab-icon';

const movePreview = (event: ReactPointerEvent<HTMLDivElement>) => {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  event.currentTarget.style.setProperty('--art-x', `${(0.5 - x) * 14}px`);
  event.currentTarget.style.setProperty('--art-y', `${(0.5 - y) * 10}px`);
};

const resetPreview = (event: ReactPointerEvent<HTMLDivElement>) => {
  event.currentTarget.style.setProperty('--art-x', '0px');
  event.currentTarget.style.setProperty('--art-y', '0px');
};

export default function Home() {
  const [exam, setExam] = useState<ExamCode>('0478');
  const [activeLab, setActiveLab] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const groupedLabs = useMemo(() => {
    const visibleLabs = labs.filter((lab) => lab.exams.includes(exam));

    return visibleLabs.reduce<Map<string, typeof labs>>((groups, lab) => {
      const topicLabs = groups.get(lab.topic) ?? [];
      groups.set(lab.topic, [...topicLabs, lab]);
      return groups;
    }, new Map());
  }, [exam]);

  useEffect(() => {
    const syncLabFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get('lab');
      const lab = slug === translator.slug
        ? translator
        : labs.find((item) => item.slug === slug) ?? null;
      setActiveLab(lab);
      setIsLoading(Boolean(lab));
    };

    syncLabFromUrl();
    window.addEventListener('popstate', syncLabFromUrl);
    return () => window.removeEventListener('popstate', syncLabFromUrl);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeLab ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeLab]);

  const openLab = (lab: Activity) => {
    setActiveLab(lab);
    setIsLoading(true);
    window.history.pushState({ lab: lab.slug }, '', `?lab=${lab.slug}`);
  };

  const closeLab = () => {
    setActiveLab(null);
    setIsLoading(false);
  };

  if (activeLab) {
    return (
      <main className="lab-view">
        <header className="lab-shell-header">
          <Link className="brand" href="/" aria-label="Examplicity home" onClick={closeLab}>
            <span className="tone-one">e</span>
            <span className="tone-two">x</span>
            <span className="tone-three">a</span>
            <span className="tone-four">m</span>
            plicity
          </Link>
          <Link className="lab-shell-home" href="/" onClick={closeLab}>Back to labs</Link>
        </header>
        {isLoading && (
          <section className="loading-screen" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <div>
              <p>{activeLab.kind === 'tool' ? 'Opening tool' : 'Loading lab'}</p>
              <h1>{activeLab.title}</h1>
            </div>
          </section>
        )}
        <iframe
          className={`lab-frame ${isLoading ? 'is-loading' : ''}`}
          key={activeLab.slug}
          onLoad={() => setIsLoading(false)}
          src={activeLab.href}
          title={activeLab.title}
        />
        <footer className="lab-shell-footer">
          <a href="https://github.com/timcarpe/examplicity">Examplicity™</a>
          <span>
            Make complex ideas click. ·{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
          </span>
        </footer>
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Examplicity home">
          <span className="tone-one">e</span>
          <span className="tone-two">x</span>
          <span className="tone-three">a</span>
          <span className="tone-four">m</span>
          plicity
        </a>
        <div className="header-actions">
          <span className="header-note">Cambridge Computer Science</span>
          <button className="translator-button" type="button" onClick={() => openLab(translator)}>
            <span>Pseudocode ↔ Python</span>
            <i aria-hidden="true">↗</i>
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>
            <span className="hero-line">Make complex</span>
            <span className="hero-line">ideas click.</span>
          </h1>
          <p className="intro">
            Computer Science labs that turn theory into something you can see,
            change and understand.
          </p>
        </div>

        <div className="exam-picker">
          <span className="picker-label">Choose syllabus</span>
          <div className="segmented-control" role="group" aria-label="Choose an exam syllabus">
            {exams.map((code) => (
              <button
                className={exam === code ? 'is-active' : ''}
                key={code}
                onClick={() => setExam(code)}
                type="button"
                aria-pressed={exam === code}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="catalog">
        {[...groupedLabs].map(([topic, topicLabs]) => (
          <section className="topic-section" key={topic}>
            <div className="topic-heading">
              <h2>{topic}</h2>
              <span>{topicLabs.length} {topicLabs.length === 1 ? 'lab' : 'labs'}</span>
            </div>

            <div className="lab-grid">
              {topicLabs.map((lab) => (
                <article className="lab-card" key={lab.slug}>
                  <button type="button" aria-label={`Open ${lab.title}`} onClick={() => openLab(lab)}>
                    <div className="preview" onPointerMove={movePreview} onPointerLeave={resetPreview}>
                      <LabIcon slug={lab.slug} />
                    </div>
                    <div className="card-copy">
                      <div>
                        <p className="card-kicker">{lab.format}</p>
                        <h3>{lab.title}</h3>
                      </div>
                      <span className="arrow" aria-hidden="true">↗</span>
                      <p className="description">{lab.description}</p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer>
        <a href="https://github.com/timcarpe/examplicity">Examplicity™</a>
        <span>
          Make complex ideas click. ·{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </span>
      </footer>
    </main>
  );
}
