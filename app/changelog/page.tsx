import type { Metadata } from 'next';
import Link from 'next/link';
import { changelogEntries } from './entries';
import { BugReportDialog } from '../bug-report-dialog';
import { subjects } from '../labs';

const homeHref = subjects[0].views[subjects[0].exams[0]].href;
const publicEntries = changelogEntries.filter((entry) => entry.publicChanges.length > 0);

export const metadata: Metadata = {
  title: 'Changelog | Examplicity',
  description: 'A considered record of what has changed across Examplicity and why it matters.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  return (
    <main className="changelog-page">
      <header className="site-header changelog-header">
        <Link className="brand" href={homeHref} aria-label="Examplicity home">
          <span className="tone-one">e</span>
          <span className="tone-two">x</span>
          <span className="tone-three">a</span>
          <span className="tone-four">m</span>
          plicity
        </Link>
        <Link className="changelog-back" href={homeHref}>← Back to labs</Link>
      </header>

      <section className="changelog-hero">
        <h1>Changelog.</h1>
      </section>

      <section className="changelog-ledger" aria-label="Changelog entries">
        {publicEntries.map((entry) => (
          <article className="changelog-entry" key={entry.date}>
            <h2><time dateTime={entry.date}>{entry.displayDate}</time></h2>
            <ul>
              {entry.publicChanges.map((change) => <li key={change}>{change}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <footer>
        <div className="footer-left">
          <a href="https://github.com/timcarpe/examplicity">Examplicity™</a>
          <Link href="/changelog">Changelog</Link>
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
