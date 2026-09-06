import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './developer.module.css';
import ContentsNav from './contents-nav';
import { BugReportDialog } from '../bug-report-dialog';

export const metadata: Metadata = {
  title: 'Adapt or create a lab | Examplicity',
  description: 'A practical reference for developers and LLMs adapting standalone labs or creating new ones from examples.',
  alternates: { canonical: '/developer' },
};

export default function DeveloperPage() {
  return (
    <main className={styles.page}>
      <header className={`site-header ${styles.sharedHeader}`}>
        <Link className="brand" href="/" aria-label="Examplicity home">
          <span className="tone-one">e</span><span className="tone-two">x</span><span className="tone-three">a</span><span className="tone-four">m</span>plicity
        </Link>
        <nav className={styles.topNav} aria-label="Developer reference">
          <Link href="/developer" aria-current="page">Adapt or create</Link>
          <a href="/developer/design-language.html">Design guide</a>
          <Link href="/developer/lab-contract">Lab Contract</Link>
          <Link href="/">Labs</Link>
        </nav>
      </header>
      <div className={styles.layout}>
        <ContentsNav />
        <article className={styles.document}>
          <div className={styles.introduction}>
            <aside id="contribute" className={styles.contribution} aria-labelledby="contribute-title">
              <h2 id="contribute-title"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0H13a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4.5A2.5 2.5 0 0 1 2 13.5Zm1.5 0v8.708A2.5 2.5 0 0 1 4.5 11H12.5V1.5h-8a1 1 0 0 0-1 1ZM12.5 12.5h-8a1 1 0 0 0 0 2h8Z" /></svg> Contribute on GitHub</h2>
              <div className={styles.contributionBody}>
                <a className={styles.repoLink} href="https://github.com/timcarpe/examplicity">timcarpe / examplicity</a>
                <p>Have a fix or improvement? Open a focused PR with the lab link, what changed and how you checked it.
                  An LLM can prepare a patch and PR description.</p>
                <p>For larger changes, open an issue first. Setup and contribution instructions are in the repository README.</p>
                <a className={styles.githubButton} href="https://github.com/timcarpe/examplicity#readme">View repository</a>
              </div>
            </aside>
            <header id="start" className={styles.titleBlock}>
              <h1>Adapt or create a lab</h1>
              <p>For developers and LLMs editing a downloaded lab or using one as an example for a new activity.</p>
            </header>
            <p className={styles.startText}>Start with the HTML file and a clear learning goal. Inspect what the learner changes,
              what the model shows, and how feedback helps them reason.</p>
            <p className={styles.startText}><a href="/developer/llms.txt">Read the plain-text reference</a> or <Link href="/">choose an example from the lab catalogue</Link>.</p>
          </div>

          <section id="reasoning" className={styles.section}>
            <h2>Choose reasoning depth before editing</h2>
            <p>For an LLM: assess the requested change against the code you have inspected. Prefer a capable reasoning model
              and higher effort when correctness depends on mathematics, coupled state or teaching intent. A small wording change rarely needs that depth.</p>
            <p>Use these as starting recommendations, not measured minimum requirements. Model capability and reasoning effort are separate choices.</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.reasoningCaption}>Example choices in ChatGPT Work, or similar tools</caption>
                <thead><tr><th scope="col">Requested change</th><th scope="col">Reasoning</th><th scope="col">Example model</th><th scope="col">Why</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Rename labels, edit instructions or adjust spacing</th><td>Light / low</td><td>Terra Light, or similar</td><td>Confirm the edit stays presentational.</td></tr>
                  <tr><th scope="row">Change examples, add feedback or fix one interaction</th><td>Medium</td><td>Sol Medium, or similar</td><td>Trace the affected input, state and feedback.</td></tr>
                  <tr><th scope="row">Change equations, linked controls, difficulty or completion rules</th><td>High / extra high</td><td>Sol High or Astra Extra High, where available, or similar</td><td>Check coupled behaviour and learning invariants.</td></tr>
                  <tr><th scope="row">Create a new simulation or diagnose a bug spanning several modes</th><td>High / extra high; deeper review if needed</td><td>Astra Extra High, or a similarly capable reasoning model</td><td>Plan the model, test representative cases and verify the result.</td></tr>
                </tbody>
              </table>
            </div>
            <p>Explain the recommendation briefly in terms of the task: “Changing difficulty here affects question generation,
              hints and completion. I recommend a higher-reasoning model so those stay consistent; I’ll check each affected path.”</p>
            <p>Do not infer your model identity, active reasoning setting or the user’s available models. If those are unknown,
              describe the capability needed and ask the user to select it if available. Do not claim that you switched models or settings.
              If the user stays with the current model, work in smaller steps and make verification limits clear.</p>
            <p>Reassess if the work reveals coupled behaviour, conflicting assumptions or repeated failed fixes. Deeper reasoning can take longer
              and use more allowance; it cannot replace running the lab or checking subject accuracy.</p>
            <p>These task examples are our recommendations. Names and settings vary by product and account;
              see <a href="https://learn.chatgpt.com/docs/models">OpenAI’s model and reasoning guidance</a> (checked 6 September 2026).</p>
          </section>

          <section id="remix" className={styles.section}>
            <h2>Adapt an existing lab</h2>
            <ol className={styles.plainList}>
              <li><strong>Read before editing.</strong> Inspect the HTML, CSS and JavaScript. If present, read the JSON in
                <code> script[data-examplicity-lab-contract]</code>. It describes the learning relationship and adaptation guidance;
                check the implementation against it because a map can become stale.</li>
              <li><strong>Agree the change.</strong> Ask about the audience, prior knowledge and intended change where these are unclear.
                Briefly explain the current learner experience and propose a focused plan.</li>
              <li><strong>Preserve the learning relationship.</strong> Keep the model’s causal relationships, meaningful interactions,
                feedback and completion rules unless the requested change calls for revising them. Preserve contract invariants
                and selected curriculum unless explicitly changed; do not invent exam alignment.</li>
              <li><strong>Edit the complete HTML.</strong> Make the requested changes and update affected embedded guidance.
                Keep unrelated behaviour intact. Use the design references when changing the interface.</li>
            </ol>
            <p>If the contract and code disagree, explain the discrepancy before relying on either.
              If no contract exists, describe what you can establish from the implementation and ask about unclear teaching intent.</p>
            <p><Link href="/developer/lab-contract">Read the contract fields</Link> · <Link href="/developer/lab-contract#implementation">Read an implementation map</Link></p>
          </section>

          <section id="create" className={styles.section}>
            <h2>Create a new lab from an example</h2>
            <ol className={styles.plainList}>
              <li><strong>Define one learning goal.</strong> Agree the audience, concept and what the learner should discover or practise.
                Identify an action, the evidence it produces, and what demonstrates understanding.</li>
              <li><strong>Choose a useful example.</strong> Select for the interaction you need, such as manipulating a model,
                tracing a process or completing supported working. Run and inspect it before reusing a pattern.</li>
              <li><strong>Reuse selectively.</strong> Borrow relevant layout, controls or feedback. Build the new model around its own
                concept; do not copy unrelated modes, stages or completion rules.</li>
              <li><strong>Make the new identity explicit.</strong> Replace the title, description, instructions and lab-specific metadata.
                Do not carry over the example’s identifiers, canonical URL or curriculum claims as if they describe the new lab.
                Retain applicable licence and attribution notices for reused code.</li>
              <li><strong>Document the new learning relationship.</strong> If including a Lab Contract, write guidance that describes
                the new lab and keep it consistent with the implementation. Use the schema as a field reference.</li>
            </ol>
            <p>Useful starting points: <Link href="/labs/computer-science/binary-numbers">Binary Numbers</Link> for practice and feedback,
              <Link href="/labs/mathematics/coordinate-distance-midpoint-perpendicular"> Coordinate Geometry</Link> for direct manipulation,
              and <Link href="/labs/computer-science/dijkstra-a-star-graph-search"> Graph Search</Link> for algorithm traces.</p>
            <p><a href="/developer/lab-contract.schema.json">Lab Contract JSON Schema</a></p>
          </section>

          <section id="design" className={styles.section}>
            <h2>Use the design references</h2>
            <p>The living guide provides visual examples and component behaviour. Reuse the canonical shared CSS and helpers for recurring patterns;
              treat the guide as a reference rather than a page template. Preserve a lab-specific layout when it helps explain the concept.</p>
            <ul className={styles.plainList}>
              <li><a href="/developer/design-language.html">Living design guide</a> — interactive examples of controls, working, feedback and completion.</li>
              <li><a href="/developer/lab-style-contract.md">Written style reference</a> — layout, typography, accessibility and interaction guidance.</li>
              <li><a href="/developer/lab-design.css">Shared component CSS</a> and <a href="/developer/lab-kit/0.3.0/src/lab-design.js">interaction helpers</a> — reuse only what the activity needs.</li>
              <li><a href="/developer/lab-kit/0.3.0/README.md">Lab Kit usage</a> — optional helpers; inspect the version already embedded before replacing anything.</li>
            </ul>
            <p>Keep labels readable, keyboard focus visible and feedback understandable without colour alone.
              Do not introduce Working levels, stages or extra controls merely because an example has them.</p>
          </section>

          <section id="check" className={styles.section}>
            <h2>Check and deliver one HTML file</h2>
            <ul className={styles.plainList}>
              <li>Embed required CSS, JavaScript and assets. Open the saved file without a network connection and check that it works and retains its appearance.</li>
              <li>Try the main learner action, expected feedback, completion and reset. For an adaptation, check the affected existing modes too.</li>
              <li>Check keyboard operation, readable text and a narrow-screen layout without page-level horizontal overflow.</li>
              <li>Keep contract guidance and visible instructions consistent with the result. Describe what changed, what you checked and any remaining limitation.</li>
            </ul>
            <p>Return the complete downloadable HTML file. Keep links to this reference in its <code>&lt;head&gt;</code> for future adaptations:</p>
            <pre className={styles.command}><code>{`<link rel="help" href="https://www.examplicity.org/developer">
<link rel="help" type="text/plain" href="https://www.examplicity.org/developer/llms.txt">`}</code></pre>
            <p>Documentation links are references, not runtime dependencies. If you cannot access them, say so and continue from the supplied
              HTML and embedded guidance. Do not claim to have run checks that your tools cannot perform.</p>
          </section>
        </article>
      </div>
      <footer>
        <div className="footer-left">
          <a href="https://github.com/timcarpe/examplicity">© Examplicity™</a>
          <Link href="/changelog">Changelog</Link>
          <Link href="/developer">Developers</Link>
          <BugReportDialog />
        </div>
        <span>Make complex ideas click. · <a href="https://opensource.org/license/mit">MIT License</a></span>
      </footer>
    </main>
  );
}
