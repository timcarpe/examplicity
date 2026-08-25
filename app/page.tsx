'use client';

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import { exams, labs, translator, type Activity, type ExamCode } from './labs';

const movePreview = (event: ReactPointerEvent<HTMLDivElement>) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  event.currentTarget.style.setProperty('--image-x', `${(0.5 - x) * 18}px`);
  event.currentTarget.style.setProperty('--image-y', `${(0.5 - y) * 14}px`);
};

const resetPreview = (event: ReactPointerEvent<HTMLDivElement>) => {
  event.currentTarget.style.setProperty('--image-x', '0px');
  event.currentTarget.style.setProperty('--image-y', '0px');
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

  if (activeLab) {
    return (
      <main className="lab-view">
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
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Exam Labs home">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>Exam Labs</span>
        </a>
        <div className="header-actions">
          <span className="header-note">Interactive Computer Science</span>
          <button className="translator-button" type="button" onClick={() => openLab(translator)}>
            <span>Pseudocode ↔ Python</span>
            <i aria-hidden="true">↗</i>
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Computer Science labs</p>
          <h1>Learn it by<br />doing it.</h1>
          <p className="intro">
            Explore complex ideas through focused, interactive labs built for
            Cambridge Computer Science.
          </p>
        </div>

        <div className="exam-picker" aria-label="Choose an exam syllabus">
          <span className="picker-label">Choose syllabus</span>
          <div className="segmented-control" role="group">
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

      <div className="catalog" aria-live="polite">
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
                      <Image
                        src={lab.image}
                        alt={`Preview of ${lab.title}`}
                        fill
                        sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw"
                      />
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
        <span>Exam Labs</span>
        <span>Understand through interaction.</span>
      </footer>
    </main>
  );
}
