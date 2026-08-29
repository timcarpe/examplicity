'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  labs,
  qualificationLevels,
  subjects,
  syllabusAlignmentIncludesLevel,
  type ExamCode,
  type Lab,
  type QualificationLevel,
  type SubjectId,
  type Topic,
} from './labs';
import { createStandaloneLabHtml } from './lab-download';
import { LabIcon } from './lab-icon';
import { BugReportDialog } from './bug-report-dialog';

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

const subjectStorageKey = 'examplicity:subject';
const levelStorageKey = (subjectId: SubjectId) => `examplicity:level:${subjectId}`;
const readPreference = (key: string) => {
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const writePreference = (key: string, value: string) => {
  try { window.localStorage.setItem(key, value); } catch { /* Preferences remain session-only. */ }
};

type CatalogueProps = {
  initialExam: ExamCode;
  initialSubjectId: SubjectId;
};

export default function Catalogue({ initialExam, initialSubjectId }: CatalogueProps) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<SubjectId>(initialSubjectId);
  const [level, setLevel] = useState<QualificationLevel>(() => {
    const initialSubject = subjects.find((item) => item.id === initialSubjectId) ?? subjects[0];
    return qualificationLevels.find((item) => initialSubject.qualificationViews[item].exam === initialExam)
      ?? qualificationLevels[0];
  });
  const [activeLab, setActiveLab] = useState<Lab | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileNotice, setShowMobileNotice] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'preparing' | 'complete' | 'error'>('idle');
  const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
  const labFrameRef = useRef<HTMLIFrameElement>(null);
  const subjectPickerRef = useRef<HTMLDivElement>(null);
  const subjectTriggerRef = useRef<HTMLButtonElement>(null);
  const subjectMenuRef = useRef<HTMLDivElement>(null);
  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0];
  const view = subject.qualificationViews[level];
  const exam = view.exam;
  const examView = subject.views[exam];
  const groupedLabs = useMemo(() => {
    const visibleLabs = labs.filter((lab) => (
      lab.subject === subject.id && lab.syllabuses.some((syllabus) => (
        syllabus.code === exam && syllabusAlignmentIncludesLevel(syllabus.qualification, level)
      ))
    ));

    return visibleLabs.reduce<Map<Topic, typeof labs>>((groups, lab) => {
      const topicLabs = groups.get(lab.topic) ?? [];
      groups.set(lab.topic, [...topicLabs, lab]);
      return groups;
    }, new Map());
  }, [exam, level, subject.id]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initialSubject = subjects.find((item) => item.id === initialSubjectId) ?? subjects[0];
      const savedLevel = readPreference(levelStorageKey(initialSubjectId)) as QualificationLevel | null;
      if (
        savedLevel
        && qualificationLevels.includes(savedLevel)
        && initialSubject.qualificationViews[savedLevel].exam === initialExam
      ) {
        setLevel(savedLevel);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialExam, initialSubjectId]);

  useEffect(() => {
    const syncLabFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get('lab');
      const lab = labs.find((item) => item.slug === slug) ?? null;
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

  useEffect(() => {
    if (!isSubjectMenuOpen) return;

    const frame = window.requestAnimationFrame(() => {
      subjectMenuRef.current
        ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
        ?.focus();
    });
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!subjectPickerRef.current?.contains(event.target as Node)) setIsSubjectMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsSubjectMenuOpen(false);
      subjectTriggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isSubjectMenuOpen]);

  const chooseLevel = (nextLevel: QualificationLevel) => {
    const nextView = subject.qualificationViews[nextLevel];
    setLevel(nextLevel);
    writePreference(levelStorageKey(subject.id), nextLevel);
    if (nextView.exam !== exam) router.push(subject.views[nextView.exam].href, { scroll: false });
  };

  const chooseSubject = (nextSubjectId: SubjectId) => {
    const nextSubject = subjects.find((item) => item.id === nextSubjectId);
    if (!nextSubject) return;
    const savedLevel = readPreference(levelStorageKey(nextSubject.id)) as QualificationLevel | null;
    const nextLevel = savedLevel && qualificationLevels.includes(savedLevel) ? savedLevel : qualificationLevels[0];
    const nextExam = nextSubject.qualificationViews[nextLevel].exam;
    setSubjectId(nextSubjectId);
    setLevel(nextLevel);
    writePreference(subjectStorageKey, nextSubjectId);
    router.push(nextSubject.views[nextExam].href);
  };

  const openLab = (lab: Lab) => {
    setActiveLab(lab);
    setIsLoading(true);
    setDownloadStatus('idle');
    const labUrl = new URL(window.location.href);
    labUrl.searchParams.set('lab', lab.slug);
    window.history.pushState({ lab: lab.slug }, '', labUrl);
  };

  const closeLab = () => {
    setActiveLab(null);
    setIsLoading(false);
    setDownloadStatus('idle');
  };

  const downloadLab = async () => {
    if (!activeLab || downloadStatus === 'preparing') return;

    setDownloadStatus('preparing');

    try {
      const response = await fetch(activeLab.href, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Lab download failed with status ${response.status}.`);

      const source = await response.text();
      const siteHomeUrl = new URL(window.location.href);
      siteHomeUrl.search = '';
      siteHomeUrl.hash = '';
      const liveLabUrl = new URL(siteHomeUrl);
      liveLabUrl.searchParams.set('lab', activeLab.slug);
      const html = createStandaloneLabHtml({
        source,
        lab: activeLab,
        siteHomeUrl: siteHomeUrl.href,
        liveLabUrl: liveLabUrl.href,
      });
      const objectUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `examplicity-${activeLab.slug}.html`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      setDownloadStatus('complete');
    } catch (error) {
      console.error('Unable to prepare the lab download.', error);
      setDownloadStatus('error');
    }
  };

  if (activeLab) {
    return (
      <main className="lab-view">
        <header className="lab-shell-header">
          <Link className="brand" href={examView.href} aria-label="Examplicity home" onClick={closeLab}>
            <span className="tone-one">e</span>
            <span className="tone-two">x</span>
            <span className="tone-three">a</span>
            <span className="tone-four">m</span>
            plicity
          </Link>
          <div className="lab-shell-actions">
            <Link
              aria-label={`Open AI Lab Remix for ${activeLab.title}`}
              className="lab-shell-remix"
              href={`/remix?lab=${encodeURIComponent(activeLab.slug)}&from=${encodeURIComponent(examView.href)}`}
            >
              AI Lab Remix
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M9.5 2.5c.6 3.3 2 4.7 5.3 5.3-3.3.6-4.7 2-5.3 5.3-.6-3.3-2-4.7-5.3-5.3 3.3-.6 4.7-2 5.3-5.3Z" />
                <path d="M15.2 12.2c.3 1.6 1 2.3 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.6Z" />
              </svg>
            </Link>
            <button
              aria-busy={downloadStatus === 'preparing'}
              aria-label={`Download ${activeLab.title} as a standalone HTML file`}
              className="lab-shell-download"
              disabled={downloadStatus === 'preparing'}
              onClick={downloadLab}
              type="button"
            >
              {downloadStatus === 'preparing' ? 'Preparing…' : 'Download Lab'}
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M10 2.5v10" />
                <path d="m6.5 9 3.5 3.5L13.5 9" />
                <path d="M3.5 14.5v2h13v-2" />
              </svg>
            </button>
            <span className="lab-download-status" role="status" aria-live="polite">
              {downloadStatus === 'preparing' && 'Preparing the standalone HTML file.'}
              {downloadStatus === 'complete' && 'The standalone HTML file is ready.'}
              {downloadStatus === 'error' && 'The download could not be prepared. Try again.'}
            </span>
          </div>
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
          ref={labFrameRef}
          src={activeLab.href}
          title={activeLab.title}
        />
        <footer className="lab-shell-footer">
          <div className="footer-left">
            <a href="https://github.com/timcarpe/examplicity">Examplicity™</a>
            <BugReportDialog frameRef={labFrameRef} lab={activeLab} />
          </div>
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
      {showMobileNotice && (
        <aside className="mobile-notice" aria-label="Viewing recommendation">
          <p>
            Examplicity is best viewed on a desktop computer, as many labs require a large viewing area.
          </p>
          <button
            aria-label="Dismiss viewing recommendation"
            onClick={() => setShowMobileNotice(false)}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </aside>
      )}
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Examplicity home">
          <span className="tone-one">e</span>
          <span className="tone-two">x</span>
          <span className="tone-three">a</span>
          <span className="tone-four">m</span>
          plicity
        </a>
        <div className="header-actions">
          <span className="header-note">{view.headerLabel}</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>
            <span className="hero-line">Make complex</span>
            <span className="hero-line">ideas click.</span>
          </h1>
          <p className="intro">
            {view.intro}
          </p>
        </div>

        <div className="learning-picker">
          <div className="subject-picker">
            <span className="picker-label" id="subject-picker-label">Choose a subject</span>
            <div className="subject-select-shell" ref={subjectPickerRef}>
              <button
                aria-controls="subject-menu"
                aria-expanded={isSubjectMenuOpen}
                aria-haspopup="listbox"
                aria-labelledby="subject-picker-label subject-select-value"
                className="subject-select-trigger"
                id="subject-select"
                onClick={() => setIsSubjectMenuOpen((isOpen) => !isOpen)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                  event.preventDefault();
                  setIsSubjectMenuOpen(true);
                }}
                ref={subjectTriggerRef}
                type="button"
              >
                <span id="subject-select-value">{subject.name}</span>
                <span className="subject-select-indicator" aria-hidden="true" />
              </button>

              {isSubjectMenuOpen && (
                <div
                  aria-labelledby="subject-picker-label"
                  className="subject-menu"
                  id="subject-menu"
                  onKeyDown={(event) => {
                    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const options = [...(subjectMenuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
                    if (options.length === 0) return;
                    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
                    const nextIndex = event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? options.length - 1
                        : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                    options[nextIndex]?.focus();
                  }}
                  ref={subjectMenuRef}
                  role="listbox"
                >
                  <div className="subject-menu-heading">Subjects</div>
                  {subjects.map((item) => {
                    const isSelected = item.id === subjectId;
                    return (
                      <button
                        aria-selected={isSelected}
                        className={`subject-option${isSelected ? ' is-selected' : ''}`}
                        key={item.id}
                        onClick={() => {
                          setIsSubjectMenuOpen(false);
                          if (!isSelected) chooseSubject(item.id);
                          subjectTriggerRef.current?.focus();
                        }}
                        role="option"
                        type="button"
                      >
                        <span>{item.name}</span>
                        {isSelected && <span className="subject-option-status">Current</span>}
                      </button>
                    );
                  })}
                  <div className="subject-menu-coming-soon" aria-disabled="true">
                    <span>More subjects</span>
                    <small>Coming soon</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="exam-picker">
            <span className="picker-label">Choose a level</span>
            <div className="segmented-control" role="group" aria-label={`Choose a ${subject.name} qualification level`}>
              {qualificationLevels.map((item) => (
                <button
                  aria-pressed={level === item}
                  className={level === item ? 'is-active' : ''}
                  key={item}
                  onClick={() => chooseLevel(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="catalog">
        {[...groupedLabs].map(([topic, topicLabs]) => (
          <section className="topic-section" key={topic}>
            <div className="topic-heading">
              <div className="topic-heading-copy">
                <h2>{topic}</h2>
                <p className="topic-briefing">
                  {view.topicBriefings[topic]}
                </p>
              </div>
              <span>{topicLabs.length} {topicLabs.length === 1 ? 'lab' : 'labs'} · {level} {exam}</span>
            </div>

            <div className="lab-grid">
              {topicLabs.map((lab) => (
                <article className="lab-card" key={lab.slug}>
                  <a
                    aria-label={`Open ${lab.title}`}
                    href={lab.href}
                    onClick={(event) => {
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      openLab(lab);
                    }}
                  >
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
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer>
        <div className="footer-left">
          <a href="https://github.com/timcarpe/examplicity">Examplicity™</a>
          <BugReportDialog />
        </div>
        <span>
          IGCSE, AS &amp; A Level exam practice and concept labs. ·{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </span>
      </footer>
    </main>
  );
}
