# Agent distribution entry point

This directory is the canonical kit entry point for agents creating a lab with
`@examplicity/lab-kit`. Codex and ChatGPT Labs consume the same shared
capabilities. ChatGPT returns only the requested lab HTML; Codex may retain
additional internal package evidence for its own workflow.

Before proposing or writing a lab, consume these files in order:

1. `../../../docs/lab-pedagogy-contract.md` — the learning-quality contract.
2. `../../../docs/lab-design-contract.md` — visual and responsive compatibility.
3. `../../../docs/design-language/lab-style-contract.md` — concise living
   visual rules.
4. `../../../docs/design-language/examplicity-living-style-guide-v3.html` —
   self-contained visual specimens and reviewed pilots.
5. `../README.md` — exact runtime and CSS API.
6. `authoring-contract.md` — package and handoff constraints.
7. `../src/lab-kit.css` — actual optional classes and tokens.
8. `../src/lab-kit.js` — actual helper semantics and edge cases.
9. `../manifest.json` — release version, hashes and offline declaration.

For an Examplicity-targeted lab, also consume the immutable site-owned profile
at `../../../vendor/examplicity-lab-publication-profile/1.0.0/profile.json`.
That separate release supplies the publication rail, viewport, artifact and
minimum-interaction constraints. It is not part of the kit and does not define
a lab layout.

For Codex, `../../../docs/codex-authoring-workflow.md` defines orchestration,
iteration and the human-review gate. ChatGPT Labs receives the lean generated
bundle plus one idea packet.

The learning interaction must operate a relationship rather than step through
authored transitions: a next-step quiz or scripted reveal is not sufficient.
Require a concept-appropriate perturbation, counterfactual or construction path
and use prediction selectively at consequential branches. The publication
frame owns the manifest header/title/subtitle; source title slots are
replaceable standalone affordances, not a hero layout. Validate the staged
live-site compilation, including readable model/action fit at 1366 x 768,
before approval. Keep the skeleton malleable: these constraints do not impose a
component sequence or page layout.

The distribution contains no compiler. Source labs declare the pinned
resources they consume. The live-site repository owns publication compilation
and embeds those resources into the final self-standing HTML.
