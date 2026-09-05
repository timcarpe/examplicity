import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../developer.module.css';

export const metadata: Metadata = {
  title: 'Lab Contract reference | Examplicity',
  description: 'The embedded adaptation guidance used across the Examplicity lab catalogue.',
  alternates: { canonical: '/developer/lab-contract' },
};

const fields = [
  ['schemaVersion', 'Required', 'Sidecar format version. Version 1 is the only supported value.'],
  ['relationship', 'Required', 'The learning relationship between learner action, the model, and resulting understanding.'],
  ['learnerLoop', 'Required', 'Four short statements: action, modelChange, evidence, and nextDecision.'],
  ['invariants', 'Optional', 'Learning properties worth preserving. Keep them conceptual, not tied to DOM structure.'],
  ['safeAdaptations', 'Optional', 'Changes that can vary while retaining the learning relationship.'],
  ['nonGoals', 'Optional', 'Nearby scope the lab deliberately does not teach.'],
  ['curriculum', 'Optional', 'Profiles and feature IDs only when one lab genuinely varies by curriculum.'],
  ['developerGuide', 'Optional', 'Canonical link to this reference.'],
] as const;

export default function LabContractPage() {
  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/">Examplicity</Link>
        <nav className={styles.topNav} aria-label="Developer reference">
          <Link href="/developer">Lab system</Link>
          <a href="/developer/design-language.html">Design guide</a>
          <Link href="/developer/lab-contract" aria-current="page">Lab Contract</Link>
          <Link href="/">Labs</Link>
        </nav>
      </header>

      <div className={styles.layout}>
        <aside className={styles.contents} aria-label="On this page">
          <p>On this page</p>
          <a href="#purpose">Purpose</a>
          <a href="#shape">Shape</a>
          <a href="#lifecycle">Lifecycle</a>
          <a href="#locators">Locators</a>
          <a href="#curriculum">Curriculum</a>
        </aside>

        <article className={styles.document}>
          <header className={styles.titleBlock}>
            <p className={styles.eyebrow}>Contract version 1</p>
            <h1>Lab Contract reference</h1>
            <p>
              A Lab Contract is small JSON guidance embedded in a lab. Its reader is a person or model adapting
              the learning experience. It is not implementation documentation, a component contract, or a
              contribution specification.
            </p>
          </header>

          <section id="purpose" className={styles.section}>
            <h2>Purpose</h2>
            <p>
              State the relationship that makes the lab educationally useful, then describe the learner’s loop:
              what they do, what changes, what evidence they receive, and what they decide next. This is the
              minimum information an adaptation should understand before changing the file.
            </p>
            <p className={styles.boundary}>
              Describe learning, not implementation. “Changing the clock advances one CPU micro-operation and
              exposes its effect” is useful. “Call <code>advanceCycle()</code> and update <code>#status</code>” is not.
            </p>
          </section>

          <section id="shape" className={styles.section}>
            <h2>Authoring sidecar</h2>
            <p>
              Author the contract once at <code>lab-contracts/&lt;subject&gt;/&lt;slug&gt;.lab.json</code>. Do not copy it
              into <code>lab.html</code>; the publication compiler owns the embedded block.
            </p>
            <pre className={styles.codeBlock}><code>{`{
  "schemaVersion": 1,
  "relationship": "…",
  "learnerLoop": {
    "action": "…",
    "modelChange": "…",
    "evidence": "…",
    "nextDecision": "…"
  },
  "invariants": ["…"],
  "safeAdaptations": ["…"]
}`}</code></pre>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Status</th>
                    <th scope="col">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(([field, status, use]) => (
                    <tr key={field}>
                      <th scope="row"><code>{field}</code></th>
                      <td>{status}</td>
                      <td>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Unknown top-level fields are allowed in version 1 so the format can learn from real adaptations.
              When an optional field is present, its documented shape is validated. See the
              {' '}<Link href="/developer/lab-contract.schema.json">JSON Schema</Link> for the machine-readable form.
            </p>
          </section>

          <section id="lifecycle" className={styles.section}>
            <h2>Lifecycle and validation</h2>
            <pre className={styles.flow}><code>{`lab-contracts/<subject>/<slug>.lab.json (authoritative)
          | validate + compile
          v
generated LAB_CONTRACT block in public/labs HTML
          | package download
          v
contract preserved in standalone HTML`}</code></pre>
            <p>
              <code>npm run labs:contract:check</code> verifies that each published lab has one valid contract and that its
              meaning is unchanged in the compiled and standalone artifacts. The embedded JSON escapes unsafe
              script text but parses back to the sidecar value. This catalogue-wide check also runs during
              <code> labs:sync:check</code>.
            </p>
          </section>

          <section id="locators" className={styles.section}>
            <h2>Semantic locators</h2>
            <p>
              A few <code>data-lab-*</code> attributes let an adapting model locate educationally meaningful parts
              of the HTML. They are annotations, not a runtime API.
            </p>
            <dl className={styles.fileList}>
              <div><dt><code>data-lab-role</code></dt><dd><code>model</code>, <code>working</code>, or <code>evidence</code>.</dd></div>
              <div><dt><code>data-lab-action=&quot;reset&quot;</code></dt><dd>The control that restores the initial lab state.</dd></div>
              <div><dt><code>data-lab-manipulative</code></dt><dd>Optional stable ID for a direct-manipulation surface.</dd></div>
              <div><dt><code>data-lab-feature</code></dt><dd>Optional stable ID connecting a surface to a declared curriculum feature.</dd></div>
            </dl>
            <p>
              Labs mark meaningful model, working, and evidence surfaces, with reset and manipulative locators
              where applicable. These annotations preserve existing behaviour and do not add runtime controls.
            </p>
          </section>

          <section id="curriculum" className={styles.section}>
            <h2>Optional curriculum envelope</h2>
            <p>
              Use <code>curriculum</code> only when one lab contains meaningful syllabus-dependent capabilities.
              A feature names a teaching capability. A profile records syllabus and qualification alignment,
              enables declared feature IDs, and may carry subject-specific parameters. Curriculum determines
              the permitted content; cases and difficulty vary the challenge within that content; assistance
              changes the scaffolding and supplied working. Making a case harder does not introduce content
              from another curriculum.
            </p>
            <p className={styles.boundary}>
              Binary Number Practice uses its contract profiles to select the existing IGCSE and AS question
              features. Its question-range and help controls remain separate from curriculum selection.
              Other labs may have their own modes; there is no shared profile-selection runtime API yet.
            </p>
            <p>
              Publication checks verify profile syllabus references against the catalogue and validate declared
              feature references. They do not establish that a feature teaches a syllabus objective correctly.
              That requires source review and behavioural verification.
            </p>
          </section>

          <footer className={styles.pageFooter}>
            <Link href="/developer">← Lab system reference</Link>
            <Link href="/developer/lab-contract.schema.json">JSON Schema</Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
