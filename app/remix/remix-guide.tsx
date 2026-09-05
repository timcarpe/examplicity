'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createStandaloneLabHtml } from '../lab-download';
import { labEmbedHref, labPageHref, type Lab } from '../labs.ts';

type RemixGuideProps = {
  lab: Lab;
  returnHref: string;
};

const remixIdeas = [
  {
    title: 'Differentiate',
    prompt: 'Differentiate this lab for my class. Ask me about their age, prior knowledge, needs, and available lesson time.',
  },
  {
    title: 'Different examples',
    prompt: 'Keep the same learning goal and interactions, but help me replace the examples with a context that suits my students.',
  },
  {
    title: 'More difficult',
    prompt: 'Increase the difficulty without adding irrelevant complexity. Make the learner reason more independently.',
  },
  {
    title: 'Less difficult',
    prompt: 'Reduce the difficulty while preserving the core concept. Add clearer scaffolding and more supportive feedback.',
  },
  {
    title: 'Use as inspiration to build a new lab',
    prompt: 'Use this lab as an interaction and design reference for my own idea. Ask what I want to teach before proposing a new concept.',
  },
] as const;

const createPrompt = (lab: Lab) => `I’d like to remix the attached standalone HTML lab, “${lab.title}”.

Please work with me collaboratively:
1. Inspect the attached HTML and briefly explain how the current learning experience works.
2. Ask me what I want to change and who the remixed lab is for.
3. Suggest a concise plan before editing.
4. Keep the result as a polished, accessible, standalone HTML file that works offline.
5. Preserve what already works unless the requested remix requires changing it.

The current lab is described as: ${lab.description}`;

const DownloadIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M10 2.5v10" />
    <path d="m6.5 9 3.5 3.5L13.5 9" />
    <path d="M3.5 14.5v2h13v-2" />
  </svg>
);

const CopyIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <rect height="11" rx="2" width="10" x="6.5" y="5.5" />
    <path d="M13.5 5.5v-1a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1" />
  </svg>
);

const ChatIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M3 4.5A2.5 2.5 0 0 1 5.5 2h9A2.5 2.5 0 0 1 17 4.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 3v-3A2.5 2.5 0 0 1 3 11.7Z" />
    <path d="M6.5 6.5h7M6.5 9.5h4.5" />
  </svg>
);

export default function RemixGuide({ lab, returnHref }: RemixGuideProps) {
  const originalPrompt = createPrompt(lab);
  const [prompt, setPrompt] = useState(originalPrompt);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'preparing' | 'complete' | 'error'>('idle');

  const downloadLab = async () => {
    if (downloadStatus === 'preparing') return;
    setDownloadStatus('preparing');

    try {
      const response = await fetch(labEmbedHref(lab), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Lab download failed with status ${response.status}.`);

      const siteHomeUrl = new URL(returnHref, window.location.origin);
      const liveLabUrl = new URL(labPageHref(lab), window.location.origin);
      const html = createStandaloneLabHtml({
        source: await response.text(),
        lab,
        siteHomeUrl: siteHomeUrl.href,
        liveLabUrl: liveLabUrl.href,
      });
      const objectUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `examplicity-${lab.slug}.html`;
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

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2400);
    } catch {
      setCopyStatus('error');
    }
  };

  const addIdea = (idea: (typeof remixIdeas)[number]) => {
    setPrompt(`${originalPrompt}\n\nRemix direction:\n${idea.prompt}`);
    setSelectedIdea(idea.title);
    setCopyStatus('idle');
    document.querySelector<HTMLTextAreaElement>('#remix-prompt')?.focus();
  };

  return (
    <main className="remix-page">
      <header className="site-header remix-site-header">
        <Link className="brand" href={returnHref} aria-label="Examplicity home">
          <span className="tone-one">e</span>
          <span className="tone-two">x</span>
          <span className="tone-three">a</span>
          <span className="tone-four">m</span>
          plicity
        </Link>
        <div className="header-actions">
          <Link className="remix-back" href={labPageHref(lab)}>Back to lab</Link>
        </div>
      </header>
      <section className="remix-intro">
        <h1>AI Lab Remix</h1>
        <p>Three quick steps to adapt a lab with ChatGPT.</p>
      </section>

      <section className="remix-steps" aria-label="Remix instructions">
        <article className="remix-step remix-step-download">
          <div className="remix-step-heading">
            <span className="remix-step-number">1</span>
            <div>
              <h2>Download the lab</h2>
              <p>Save {lab.title} as a standalone HTML file.</p>
            </div>
          </div>
          <button className="remix-primary-action" disabled={downloadStatus === 'preparing'} onClick={downloadLab} type="button">
            <DownloadIcon />
            {downloadStatus === 'preparing' ? 'Preparing…' : downloadStatus === 'complete' ? 'Downloaded' : 'Download Lab'}
          </button>
          <p className="remix-inline-status" role="status" aria-live="polite">
            {downloadStatus === 'complete' && `Saved as examplicity-${lab.slug}.html`}
            {downloadStatus === 'error' && 'The download could not be prepared. Please try again.'}
          </p>
        </article>

        <article className="remix-step remix-step-prompt">
          <div className="remix-step-heading">
            <span className="remix-step-number">2</span>
            <div>
              <h2>Copy or edit the prompt</h2>
              <p>Make it specific to your class or idea.</p>
            </div>
          </div>
          <label className="remix-prompt-label" htmlFor="remix-prompt">Remix prompt</label>
          <textarea id="remix-prompt" onChange={(event) => { setPrompt(event.target.value); setCopyStatus('idle'); }} value={prompt} />
          <div className="remix-prompt-actions">
            <button className="remix-primary-action" onClick={copyPrompt} type="button">
              <CopyIcon />
              {copyStatus === 'copied' ? 'Copied' : 'Copy Prompt'}
            </button>
            <button
              className="remix-secondary-action"
              disabled={prompt === originalPrompt}
              onClick={() => { setPrompt(originalPrompt); setSelectedIdea(null); }}
              type="button"
            >
              Reset
            </button>
            <span>{prompt.length.toLocaleString()} characters</span>
          </div>
          <div className="remix-idea-chips" aria-label="Suggested remix directions">
            <span>Try:</span>
            {remixIdeas.map((idea) => (
              <button
                aria-pressed={selectedIdea === idea.title}
                key={idea.title}
                onClick={() => addIdea(idea)}
                type="button"
              >
                {idea.title}
              </button>
            ))}
          </div>
          <p className="remix-inline-status" role="status" aria-live="polite">
            {copyStatus === 'copied' && 'Prompt copied to your clipboard.'}
            {copyStatus === 'error' && 'Copying was blocked. Select the prompt and copy it manually.'}
          </p>
        </article>

        <article className="remix-step remix-step-chat">
          <div className="remix-step-heading">
            <span className="remix-step-number">3</span>
            <div>
              <h2>Paste both into ChatGPT</h2>
              <p>Attach the HTML file, paste the prompt, and send.</p>
            </div>
          </div>
          <a className="remix-primary-action" href="https://chatgpt.com/" rel="noreferrer" target="_blank">
            <ChatIcon />
            Open ChatGPT
            <span aria-hidden="true">↗</span>
          </a>
        </article>
      </section>
    </main>
  );
}
