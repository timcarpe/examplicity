import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './developer.module.css';

export const metadata: Metadata = {
  title: 'Lab system reference | Examplicity',
  description: 'The living design guide, reusable lab kit, source layout and publication flow for Examplicity labs.',
  alternates: { canonical: '/developer' },
};

const files = [
  ['labs-src/<subject>/<slug>/lab.html', 'Authored lab. Owns the interface, behaviour, local styles, and lab-specific scripts.'],
  ['lab-contracts/<subject>/<slug>.lab.json', 'Authoring sidecar in a separate tree. Sole source of adaptation guidance; compilation embeds it into published HTML.'],
  ['app/labs.ts', 'Catalogue record. Owns titles, descriptions, routes, formats, topics, and syllabus alignment used by the site.'],
  ['labs-src/manifest.json', 'Publication registry. Lists published labs, repeats syllabus alignment for an integrity check, and pins the LabKit and publication-profile releases.'],
  ['vendor/lab-kit/0.2.1/', 'Vendored LabKit release. Its manifest records the exact files, sizes, and hashes used during compilation.'],
  ['tools/lab-publication-profile/', 'Versioned constraints for the single-file, offline lab artifact and its supported layouts.'],
  ['public/labs/<subject>/<slug>.html', 'Generated site artifact. Do not treat it as the authored source.'],
] as const;

const tools = [
  ['LabKit 0.2.1', 'vendor/lab-kit/0.2.1/lab-kit.js', 'Browser global: LabKit. Namespaces: dom, numeric, rng, status, history, svg, animation, direct.'],
  ['Resource compiler', 'tools/lab-compiler/index.ts', 'Replaces declared data-lab-resource references with pinned inline CSS or JavaScript. Rejects undeclared, duplicate, oversized, or unresolved runtime resources.'],
  ['Publication compiler', 'scripts/compile-lab-sources.mjs', 'Checks manifest/profile/resource hashes, applies catalogue metadata and the shared frame, then writes public/labs/.'],
  ['Manifest renderer', 'app/lab-content.ts', 'Produces managed head metadata, structured data, lab header, and syllabus chips from app/labs.ts.'],
  ['Standalone packager', 'app/lab-download.ts', 'Adds the download header and footer to compiled HTML without adding a network runtime dependency.'],
  ['Contract check', 'scripts/check-lab-contracts.mjs', 'Catalogue-wide check for embedded adaptation guidance, semantic locators, and exact preservation into compiled and downloaded HTML.'],
  ['Lab CLI', 'scripts/lab.mjs', 'Focused inspect, validate, and build commands over the same package, contract, and publication code as the full build.'],
] as const;

export default function DeveloperPage() {
  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/">Examplicity</Link>
        <nav className={styles.topNav} aria-label="Developer reference">
          <Link href="/developer" aria-current="page">Lab system</Link>
          <a href="/developer/design-language.html">Design guide</a>
          <Link href="/developer/lab-contract">Lab Contract</Link>
          <Link href="/">Labs</Link>
        </nav>
      </header>

      <div className={styles.layout}>
        <aside className={styles.contents} aria-label="On this page">
          <p>On this page</p>
          <a href="#design">Design language</a>
          <a href="#model">Artifact model</a>
          <a href="#anatomy">Source anatomy</a>
          <a href="#publish">Publish and check</a>
          <a href="#tools">Tools</a>
          <a href="#interfaces">Interfaces</a>
        </aside>

        <article className={styles.document}>
          <header className={styles.titleBlock}>
            <p className={styles.eyebrow}>Current repository · September 2026</p>
            <h1>Lab system reference</h1>
            <p>
              Examplicity labs are authored as self-contained HTML, compiled with pinned shared resources,
              served from the site, and downloadable as one offline HTML file. Paths below are relative to the
              repository root.
            </p>
          </header>

          <section id="design" className={styles.section}>
            <h2>Design language</h2>
            <p>
              The living guide is the visual authority for lab creation and adaptation. It contains
              interactive examples, exact colour tokens, the shared activity top bar, Working controls,
              checkpoint details and movable completion cards. If kit styling conflicts with the guide,
              adapt or omit that styling; the guide takes precedence.
            </p>
            <ul className={styles.plainList}>
              <li><a href="/developer/design-language.html">Open the living HTML design guide</a> · <a href="/developer/design-language.html" download>Download the complete guide</a> · <a href="/developer/design-language.css" download>Guide CSS</a> · <a href="/developer/lab-design.css" download>Shared design components</a></li>
              <li><a href="/developer/lab-style-contract.md">Read the written style contract</a></li>
              <li><a href="/developer/lab-kit/0.3.0/README.md">Lab Kit 0.3.0 usage</a> · <a href="/developer/lab-kit/0.3.0/src/lab-kit.css" download>CSS</a> · <a href="/developer/lab-kit/0.3.0/src/lab-kit.js" download>JavaScript</a> · <a href="/developer/lab-kit/0.3.0/manifest.json">Release hashes</a></li>
            </ul>
            <p>
              Working: None / Some / All keeps its existing meaning in each lab. The kit supplies optional
              styling and interaction helpers; the lab owns its model, validation and progression.
              Concept backgrounds use the base colour directly at 30% alpha over white—for example,
              violet <code>#7563a7</code> becomes <code>#7563a74d</code>.
            </p>
            <p className={styles.boundary}>
              Lab Kit 0.3.0 supports the reviewed guide for new adaptations. Existing published labs remain
              pinned to 0.2.1 until deliberately migrated and checked. Downloads remain self-contained;
              do not add a runtime dependency on these URLs.
            </p>
          </section>

          <section id="model" className={styles.section}>
            <h2>Artifact model</h2>
            <pre className={styles.flow}><code>{`authored HTML + separate contract + catalogue metadata
labs-src/<subject>/<slug>/lab.html
lab-contracts/<subject>/<slug>.lab.json
app/labs.ts
                              |
               +-- publication manifest --+
                   labs-src/manifest.json
                              |
                    npm run labs:sync
                              |
             public/labs/<subject>/<slug>.html
                              |
                   createStandaloneLabHtml()
                              |
                    one offline HTML file`}</code></pre>
            <dl className={styles.fileList}>
              {files.map(([path, purpose]) => (
                <div key={path}>
                  <dt><code>{path}</code></dt>
                  <dd>{purpose}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="anatomy" className={styles.section}>
            <h2>Source anatomy</h2>
            <p>
              Each lab has a source folder containing <code>lab.html</code> and a separate <code>.lab.json</code> sidecar. The
              HTML keeps interaction code local and declares shared resources at the point they are needed. The
              compiler replaces those declarations with pinned inline content and embeds the sidecar contract.
            </p>
            <pre className={styles.codeBlock}><code>{`<!-- Managed from catalogue metadata -->
<!-- LAB_MANIFEST_HEAD_START --> … <!-- LAB_MANIFEST_HEAD_END -->

<!-- Lab-authored HTML, CSS and JavaScript -->

<!-- Shared resource declarations -->
<link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css">
<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>

<!-- The .lab.json contract is separate authoring data; do not duplicate it here -->`}</code></pre>
            <p className={styles.boundary}>
              Blocks marked <code>LAB_MANIFEST_*</code>, <code>LAB_SYLLABUS_CHIPS_*</code>, and
              <code> LAB_FRAME_STYLES_*</code> are managed publication regions. <code>LAB_CONTRACT_*</code> exists
              only in generated output. Lab-specific behaviour remains in <code>lab.html</code>. The DOM should
              normally represent lab state, not be the authoritative source of pedagogical state.
            </p>
          </section>

          <section id="publish" className={styles.section}>
            <h2>Publish and check</h2>
            <h3>Generate</h3>
            <pre className={styles.command}><code>{`npm run labs:sync
npm run lab -- build <slug>`}</code></pre>
            <p>
              The sync command generates the complete catalogue. The focused build compiles one package to its
              normal path under <code>public/labs/</code> using the same publication core.
            </p>
            <h3>Refresh design resources</h3>
            <pre className={styles.command}><code>{`npm run developer:sync -- --source "<path to Lab Creation>"
npm run developer:check`}</code></pre>
            <p>
              Import the reviewed guide and kit release from Lab Creation. The site keeps a checked-in
              snapshot, extracts the guide CSS, and verifies the public files and kit hashes at build time.
              Builds do not depend on a sibling checkout.
            </p>
            <h3>Read-only checks</h3>
            <pre className={styles.command}><code>{`npm run lab -- inspect <slug>
npm run lab -- validate <slug>
npm run labs:sync:check
npm run labs:contract:check
npm run lint
npm run test
npm run build`}</code></pre>
            <p>
              <code>labs:sync:check</code> verifies compiled HTML, frame styles, manifest content, and standalone
              downloads, including contract coverage and preservation for every published lab.
              <code> npm run build</code> runs that check again through <code>prebuild</code>.
            </p>
          </section>

          <section id="tools" className={styles.section}>
            <h2>Tools</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Surface</th>
                    <th scope="col">Entry point</th>
                    <th scope="col">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map(([name, path, purpose]) => (
                    <tr key={name}>
                      <th scope="row">{name}</th>
                      <td><code>{path}</code></td>
                      <td>{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Typical LabKit use is direct: <code>const $ = LabKit.dom.byId</code>,
              <code> LabKit.numeric.clamp(...)</code>, or <code>LabKit.svg.point(...)</code>. The vendored file is
              the authoritative API surface; there is not yet a separate generated API reference.
            </p>
            <dl className={styles.apiList}>
              <div><dt><code>dom</code></dt><dd><code>get</code>, <code>all</code>, <code>byId</code>, <code>require</code>, <code>on</code></dd></div>
              <div><dt><code>numeric</code></dt><dd><code>parse</code>, <code>clamp</code>, <code>lerp</code>, <code>inverseLerp</code>, <code>round</code>, <code>format</code></dd></div>
              <div><dt><code>rng</code></dt><dd><code>create</code>, <code>hashSeed</code></dd></div>
              <div><dt><code>status</code></dt><dd><code>set</code>, <code>announce</code>, <code>ensure</code></dd></div>
              <div><dt><code>history</code></dt><dd><code>create</code></dd></div>
              <div><dt><code>svg</code></dt><dd><code>point</code>, <code>clientPoint</code></dd></div>
              <div><dt><code>animation</code></dt><dd><code>create</code></dd></div>
              <div><dt><code>direct</code></dt><dd><code>keyboardAdjustable</code></dd></div>
            </dl>
          </section>

          <section id="interfaces" className={styles.section}>
            <h2>Interfaces and current limits</h2>
            <ul className={styles.plainList}>
              <li><strong>Standalone runtime:</strong> browser HTML, CSS, JavaScript, and the <code>LabKit</code> global. Binary Number Practice derives its IGCSE/AS question pools from its embedded contract profiles.</li>
              <li><strong>Site API:</strong> no public per-lab state or control API.</li>
              <li><strong>MCP:</strong> no lab MCP server is implemented.</li>
              <li><strong>Adaptation metadata:</strong> every published lab carries an embedded Lab Contract. <Link href="/developer/lab-contract">Read its exact boundary.</Link></li>
              <li><strong>Discovery:</strong> compact indexes are available at <Link href="/llms.txt">/llms.txt</Link> and <Link href="/developer/llms.txt">/developer/llms.txt</Link>.</li>
            </ul>
            <p className={styles.boundary}>
              This page records implemented surfaces only. Lab-creation notes and implementation decisions stay
              with the offline creation workflow instead of being turned into public contribution requirements.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
