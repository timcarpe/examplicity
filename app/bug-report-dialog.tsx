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
  utf8ByteLength,
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
        Report a bug
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
            <button aria-label="Close bug report" className="bug-report-close" onClick={closeDialog} type="button">
              ×
            </button>
            {submission.kind === 'success' ? (
              <div className="bug-report-success" role="status">
                <p className="bug-report-kicker">Report received</p>
                <h2 id={`${detailsId}-title`}>Thank you for helping improve Examplicity.</h2>
                <p id={detailsId}>Your reference is <strong>{submission.reportId}</strong>.</p>
                <button className="bug-report-primary" onClick={closeDialog} ref={successButtonRef} type="button">Done</button>
              </div>
            ) : (
              <form onSubmit={submitReport}>
                <p className="bug-report-kicker">Bug report</p>
                <h2 id={`${detailsId}-title`}>{lab ? `Tell us what happened in ${lab.title}` : 'Tell us what went wrong'}</h2>
                <p id={detailsId} className="bug-report-intro">
                  Describe what you expected and what happened instead. Please do not include passwords or personal information.
                </p>

                <label htmlFor={descriptionId}>Description</label>
                <textarea
                  id={descriptionId}
                  maxLength={MAX_DESCRIPTION_BYTES}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What were you doing, and what went wrong?"
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
                    {submission.kind === 'submitting' ? 'Sending…' : 'Send report'}
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
