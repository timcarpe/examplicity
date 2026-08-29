'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  MAX_DESCRIPTION_BYTES,
  MAX_LAB_STATE_BYTES,
  REPORT_CATEGORIES,
  utf8ByteLength,
  type ReportCategory,
  type ReportType,
} from './bug-report-contract';

const snapshotRequestType = 'examplicity:diagnostics:request';
const snapshotResponseType = 'examplicity:diagnostics:response';
const snapshotTimeoutMs = 400;

type ReportLab = {
  slug: string;
  title: string;
};

type BugReportDialogProps = {
  frameRef?: RefObject<HTMLIFrameElement | null>;
  lab?: ReportLab | null;
};

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; reportId: string };

const jsonBytes = (value: unknown) => {
  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? Number.POSITIVE_INFINITY : utf8ByteLength(serialized);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
};

const genericFrameState = (frame: HTMLIFrameElement) => {
  try {
    const frameWindow = frame.contentWindow;
    const frameDocument = frame.contentDocument;
    const activeElement = frameDocument?.activeElement;

    return {
      schemaVersion: 1,
      snapshotAvailable: false,
      documentTitle: frameDocument?.title.slice(0, 200) ?? null,
      scroll: {
        x: Math.round(frameWindow?.scrollX ?? 0),
        y: Math.round(frameWindow?.scrollY ?? 0),
      },
      focus: activeElement
        ? {
            tag: activeElement.tagName.toLowerCase(),
            id: activeElement.id.slice(0, 100) || null,
          }
        : null,
      visibility: frameDocument?.visibilityState ?? null,
    };
  } catch {
    return { schemaVersion: 1, snapshotAvailable: false };
  }
};

const requestLabState = async (frame: HTMLIFrameElement | null) => {
  const frameWindow = frame?.contentWindow;
  if (!frame || !frameWindow) return null;

  const fallback = genericFrameState(frame);
  const requestId = crypto.randomUUID();

  return new Promise<unknown>((resolve) => {
    let settled = false;
    const finish = (state: unknown) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', handleMessage);
      window.clearTimeout(timeout);
      resolve(jsonBytes(state) <= MAX_LAB_STATE_BYTES ? state : fallback);
    };
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin
        || event.source !== frameWindow
        || event.data?.type !== snapshotResponseType
        || event.data?.requestId !== requestId
      ) return;

      finish({
        schemaVersion: 1,
        snapshotAvailable: true,
        state: event.data.state,
      });
    };
    const timeout = window.setTimeout(() => finish(fallback), snapshotTimeoutMs);

    window.addEventListener('message', handleMessage);
    frameWindow.postMessage({ type: snapshotRequestType, requestId }, window.location.origin);
  });
};

export function BugReportDialog({ frameRef, lab = null }: BugReportDialogProps) {
  const descriptionId = useId();
  const emailId = useId();
  const detailsId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const submissionRef = useRef<SubmissionState>({ kind: 'idle' });
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('bug');
  const [reportCategory, setReportCategory] = useState<ReportCategory>('incorrect_content');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [website, setWebsite] = useState('');
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle' });

  useEffect(() => {
    submissionRef.current = submission;
    if (submission.kind === 'success') successButtonRef.current?.focus();
  }, [submission]);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => descriptionRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && submissionRef.current.kind !== 'submitting') {
        setIsOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), textarea:not(:disabled), input:not(:disabled):not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  const openDialog = () => {
    setSubmission({ kind: 'idle' });
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (submission.kind !== 'submitting') setIsOpen(false);
  };

  const chooseReportType = (nextType: ReportType) => {
    setReportType(nextType);
    setReportCategory(REPORT_CATEGORIES[nextType][0].value);
  };

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmission({ kind: 'submitting' });

    try {
      const normalizedDescription = description.trim();
      if (!normalizedDescription) throw new Error('Please describe what went wrong.');
      if (utf8ByteLength(normalizedDescription) > MAX_DESCRIPTION_BYTES) {
        throw new Error('The description must be 8 KB or smaller.');
      }

      const diagnostics = includeDiagnostics
        ? {
            schemaVersion: 1,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            screen: { width: window.screen.width, height: window.screen.height },
            pixelRatio: window.devicePixelRatio,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            online: navigator.onLine,
          }
        : null;
      const labState = includeDiagnostics
        ? await requestLabState(frameRef?.current ?? null)
        : null;
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          reportCategory,
          description: normalizedDescription,
          ...(email ? { email } : {}),
          website,
          pageUrl: window.location.href,
          ...(lab ? { labSlug: lab.slug } : {}),
          ...(diagnostics ? { diagnostics } : {}),
          ...(labState ? { labState } : {}),
        }),
      });
      const result = await response.json().catch(() => null) as { reportId?: string; error?: string } | null;

      if (!response.ok || !result?.reportId) {
        throw new Error(result?.error || 'The report could not be submitted. Please try again.');
      }

      setSubmission({ kind: 'success', reportId: result.reportId });
      setDescription('');
      setEmail('');
      setWebsite('');
    } catch (error) {
      setSubmission({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The report could not be submitted. Please try again.',
      });
    }
  };

  return (
    <>
      <button className="bug-report-trigger" onClick={openDialog} ref={triggerRef} type="button">
        Report a bug or give feedback
        <span aria-hidden="true" className="bug-report-icons">
          <svg className="bug-report-icon-bug" viewBox="0 0 24 24">
            <path d="M8 7.5h8M9.5 4.5 11 7.5m3.5-3L13 7.5M7 11H4m16 0h-3M7 15H4m16 0h-3M8 18.5l-2 2m10-2 2 2M7 10a5 5 0 0 1 10 0v5a5 5 0 0 1-10 0Z" />
          </svg>
          <svg className="bug-report-icon-info" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 10.5v6M12 7.5h.01" />
          </svg>
        </span>
      </button>
      {isOpen && createPortal((
        <div
          className="bug-report-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            aria-describedby={detailsId}
            aria-labelledby={`${detailsId}-title`}
            aria-modal="true"
            className="bug-report-dialog"
            ref={dialogRef}
            role="dialog"
          >
            <button aria-label="Close report form" className="bug-report-close" onClick={closeDialog} type="button">
              ×
            </button>
            {submission.kind === 'success' ? (
              <div className="bug-report-success" role="status">
                <p className="bug-report-kicker">{reportType === 'bug' ? 'Bug report received' : 'Feedback received'}</p>
                <h2 id={`${detailsId}-title`}>Thank you for helping improve Examplicity.</h2>
                <p id={detailsId}>Your reference is <strong>{submission.reportId}</strong>.</p>
                <button className="bug-report-primary" onClick={closeDialog} ref={successButtonRef} type="button">Done</button>
              </div>
            ) : (
              <form onSubmit={submitReport}>
                <p className="bug-report-kicker">Help improve Examplicity</p>
                <h2 id={`${detailsId}-title`}>
                  {reportType === 'bug'
                    ? (lab ? `Tell us what happened in ${lab.title}` : 'Tell us what went wrong')
                    : (lab ? `Share feedback about ${lab.title}` : 'Share your feedback')}
                </h2>
                <p id={detailsId} className="bug-report-intro">
                  {reportType === 'bug'
                    ? 'Describe what you expected and what happened instead.'
                    : 'Tell us what is working well or what could be improved.'}
                  {' '}Please do not include passwords or personal information.
                </p>

                <fieldset className="bug-report-type">
                  <legend>What would you like to send?</legend>
                  <label className={reportType === 'bug' ? 'is-selected' : undefined}>
                    <input
                      checked={reportType === 'bug'}
                      name="report-type"
                      onChange={() => chooseReportType('bug')}
                      type="radio"
                      value="bug"
                    />
                    Report a bug
                  </label>
                  <label className={reportType === 'feedback' ? 'is-selected' : undefined}>
                    <input
                      checked={reportType === 'feedback'}
                      name="report-type"
                      onChange={() => chooseReportType('feedback')}
                      type="radio"
                      value="feedback"
                    />
                    Give feedback
                  </label>
                </fieldset>

                <label htmlFor={`${descriptionId}-category`}>Category</label>
                <select
                  id={`${descriptionId}-category`}
                  onChange={(event) => setReportCategory(event.target.value as ReportCategory)}
                  value={reportCategory}
                >
                  {REPORT_CATEGORIES[reportType].map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>

                <label htmlFor={descriptionId}>Description</label>
                <textarea
                  id={descriptionId}
                  maxLength={MAX_DESCRIPTION_BYTES}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={reportType === 'bug'
                    ? 'What were you doing, and what went wrong?'
                    : 'What would you like us to know?'}
                  ref={descriptionRef}
                  required
                  rows={6}
                  value={description}
                />

                <label htmlFor={emailId}>Email <span>(optional)</span></label>
                <input
                  autoComplete="email"
                  id={emailId}
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="For a follow-up about this report"
                  type="email"
                  value={email}
                />

                <div aria-hidden="true" className="bug-report-honeypot">
                  <label htmlFor={`${emailId}-website`}>Website</label>
                  <input
                    autoComplete="off"
                    id={`${emailId}-website`}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    value={website}
                  />
                </div>

                <label className="bug-report-consent">
                  <input
                    checked={includeDiagnostics}
                    onChange={(event) => setIncludeDiagnostics(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    Include extra diagnostic details
                    <small>Every report includes the page, lab name, browser type and deployment version. When checked, display details and current screen position are also included. Saved work and form contents are never collected.</small>
                  </span>
                </label>

                {submission.kind === 'error' && <p className="bug-report-error" role="alert">{submission.message}</p>}
                <div className="bug-report-actions">
                  <button className="bug-report-secondary" disabled={submission.kind === 'submitting'} onClick={closeDialog} type="button">
                    Cancel
                  </button>
                  <button className="bug-report-primary" disabled={submission.kind === 'submitting'} type="submit">
                    {submission.kind === 'submitting'
                      ? 'Sending…'
                      : reportType === 'bug' ? 'Send bug report' : 'Send feedback'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ), document.body)}
    </>
  );
}
