# Four visual lab prototypes

Open [the review index](review/index.html), or an individual offline file:

- [Maths — Similarity and scale](review/maths.html): six guided experiences and an experiment.
- [Physics — Measure critical angles](review/physics.html): four guided experiences and an experiment.
- [Chemistry — Investigate pressure and volume](review/chemistry.html): four guided experiences and an experiment.
- [Biology — Trace selection across generations](review/biology.html): five guided experiences and an experiment.

Each lab opens with a direct mission and one model. Shared working cards introduce calculations before learners supply the same quantities themselves. Pressure predictions remain separate from the actual gauge; changing the optical material is an explicit step; biology shows selected parents producing offspring before population replacement.

Each file includes its SVG model, styles, runtime, verbatim MIT licence and pedagogical data. It opens independently with no network or package installation. Use Start over to return to the first experience; Back repeats an earlier experience. Progress and observations are held only for the current page session.

Read [the research and source comparison](RESEARCH.md) for the rationale, preserved outcomes and limitations. This is a review experiment in `codex/visual-discovery-labs`, based on revision `a42aaaa78d437926ba59b766a6415ddd89ba46ed`. Production routes, source labs, curriculum mappings and the work owned by **Lab Internals (Orchestrator)** are untouched.

## Rebuild or preview

From this worktree’s repository root, with Node 24:

```powershell
node --experimental-strip-types experiments/visual-discovery/build.mjs
node experiments/visual-discovery/serve.mjs
```

The optional server prints its loopback review URL. Files still work offline without it. It serves only this experiment directory and does not modify files.

The build reads the existing four `lab-contracts` sidecars, `LICENSE`, `docs/examplicity-living-style-guide-v3.html`, and the shipped `public/developer/lab-kit/0.3.0/src/lab-design.css` and `lab-design.js` snapshots. It does not edit those inputs. Edit `src/`, then rebuild; do not hand-edit the review HTML or generated contracts.

## Structured data

Each HTML contains:

- `script[data-examplicity-lab-contract]`: the valid v1 contract, preserving relationship, invariants, safe adaptations, non-goals and developer guide while replacing the implementation map with the actual prototype surfaces and quantities.
- `script[data-examplicity-pedagogy]`: research, original source revision/hash, the ordered lesson criteria, accessibility behaviour and model limits.

The implementation revision is a SHA-256 of the embedded token layer, shared design CSS/runtime and prototype CSS/runtime/model. The generated sidecar and embedded contract must be identical.

## Focused verification

```powershell
node --experimental-strip-types experiments/visual-discovery/verify.mjs <path-to-agent-browser-executable>
```

The script uses the isolated `visual-discovery` browser session. It exercises all guided steps and experiment controls through mouse/keyboard interaction; browser evaluation only reads model state for assertions. It checks contract parity, JavaScript syntax, offline packaging, scientific invariants, revisions, and opening/final layouts at 1200×800, 900×800 and 390×844. It also checks reduced motion, revised-answer states, parent-to-offspring replacement, and dot packing when all 72 birds share one trait group. No full-site build is needed for these additive standalone files.

The completed run passed all four journeys. In the seeded Biology run, directional selection reached generation 3 with mean 12.80 mm; stabilising selection reached generation 3 with SD 0.72 mm; disruptive selection reached generation 4 with SD 3.08 mm, an empty middle band and both tails represented. These are simulated results, not empirical biology data.

Machine results and inspected screenshots are under the ignored `outputs/visual-discovery/` directory. The test covers representative interactions and layouts, not every possible experiment history.

## File inventory

All lab deliverables are confined to this directory. The repository's required internal review note is recorded in `app/changelog/entries.ts`; it does not appear in the public changelog.

| File | Responsibility |
| --- | --- |
| `README.md`, `RESEARCH.md` | Review instructions, research, continuity, limitations and file inventory |
| `build.mjs` | Offline packaging, contract validation and source provenance |
| `serve.mjs` | Optional local review server |
| `verify.mjs` | Focused browser acceptance checks |
| `src/shared.css`, `src/shared.js` | Shared progressive layout and DOM/lesson helpers |
| `src/maths.js` | Similarity model, SVG and seven-step journey |
| `src/physics.js`, `src/physics-svg.js` | Optical model, controls, SVG apparatus and five-step journey |
| `src/chemistry.js`, `src/chemistry-svg.js` | Gas model, animation, SVG instruments/graph and five-step journey |
| `src/biology.js`, `src/biology-svg.js` | Selection/inheritance model, SVG birds/distributions and six-step journey |
| `contracts/maths.lab.json`, `contracts/physics.lab.json`, `contracts/chemistry.lab.json`, `contracts/biology.lab.json` | Generated v1 implementation maps |
| `review/index.html`, `review/maths.html`, `review/physics.html`, `review/chemistry.html`, `review/biology.html` | Review entry point and complete standalone deliverables |

Local verification also writes screenshots and `verification.json` under `outputs/visual-discovery/`. No shared resource, original source, published asset, project setting or other worktree is edited.
