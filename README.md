# Examplicity

Interactive learning labs, published on [Examplicity](https://www.examplicity.org/) and downloadable as single offline HTML files.

For adapting a downloaded lab or creating your own from an example, use the [developer reference](https://www.examplicity.org/developer). This README describes working in this repository.

## Setup

Use Node.js 22.13 or newer. Read AGENTS.md for the changelog and commit requirements.

```sh
npm ci
npm run dev
```

## Contribute a lab fix

Fork the repository and create a branch. Submit focused fixes and improvements as PRs; open an issue to agree larger changes first.

1. Edit labs-src/<subject>/<slug>/lab.html. Update lab-contracts/<subject>/<slug>.lab.json when behaviour or adaptation guidance changes.
2. Inspect, validate and compile the affected lab:

```sh
npm run lab -- inspect <slug>
npm run lab -- validate <slug>
npm run lab -- build <slug>
```

3. Review and include the generated public/labs/<subject>/<slug>.html. Test changed behaviour in the browser and offline download.
4. Describe the lab URL, problem, change and validation in the PR. Include screenshots for visual changes. Follow AGENTS.md when updating the changelog.

Personal remixes edit the downloaded HTML. Repository changes edit authored source and regenerate output; do not replace authored source with a packaged download.

## Source ownership

| Path | Responsibility |
| --- | --- |
| labs-src/<subject>/<slug>/lab.html | Authored interface, behaviour and local styles/scripts. |
| lab-contracts/<subject>/<slug>.lab.json | Authoritative adaptation guidance, embedded during compilation. |
| app/labs.ts | Catalogue titles, descriptions, routes, topics and syllabus alignment. |
| labs-src/manifest.json | Publication registry, alignment integrity checks and pinned releases. |
| vendor/lab-kit/0.2.1/ | Pinned runtime helpers and resource hashes. |
| tools/lab-publication-profile/ | Versioned offline artifact constraints and supported layouts. |
| public/labs/<subject>/<slug>.html | Generated publication artifact. |

Authored HTML declares shared resources using data-lab-resource. The compiler replaces declarations with pinned inline content and embeds the separate contract. LAB_MANIFEST_*, LAB_SYLLABUS_CHIPS_* and LAB_FRAME_STYLES_* regions are managed; LAB_CONTRACT_* regions belong to generated output.

## Publication and checks

```sh
npm run labs:sync
npm run labs:sync:check
npm run labs:contract:check
npm run lint
npm run test
npm run build
```

labs:sync generates the catalogue. labs:sync:check checks compilation, styles, managed content, standalone packaging and contract preservation. Run relevant focused checks for a lab change and wider checks for shared changes. The build precheck verifies developer resources and publication output.

## Design resources

The site stores a checked-in snapshot of the Lab Creation guide and kit. To refresh it from that authoring workspace:

```sh
npm run developer:sync -- --source "<path to Lab Creation>"
npm run developer:check
```

Builds do not depend on a sibling checkout. Public Lab Kit 0.3.0 resources support new adaptations; publication pins remain explicit in the manifest. Documentation URLs must not become runtime dependencies in downloaded labs.

## Implementation entry points

| Entry point | Purpose |
| --- | --- |
| tools/lab-compiler/index.ts | Inline declared, hash-pinned CSS and JavaScript resources. |
| scripts/compile-lab-sources.mjs | Compile source packages into public/labs/. |
| app/lab-content.ts | Apply managed metadata, head references, header and syllabus chips. |
| app/lab-download.ts | Package a compiled lab as one offline HTML file. |
| scripts/check-lab-contracts.mjs | Check contracts and preservation in published/downloaded HTML. |
| scripts/lab.mjs | Focused inspect, validate and build commands. |

Standalone labs use browser HTML, CSS and JavaScript, with optional LabKit helpers. No public per-lab state/control API or lab MCP server is implemented.

## Licence

MIT; see LICENSE.
