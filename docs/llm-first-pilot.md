# LLM-first lab contract pilot

This pilot tests one question: does a small contract embedded in a standalone lab
help an LLM preserve the intended learning experience while making a requested
adaptation?

It is not a comparison of LLM providers. Use the same model and settings for all
eight runs, start a fresh conversation for each run, and attach the corresponding
standalone HTML file.

## Pilot labs

- Fetch–Decode–Execute
- Straight-Line Coordinates and Equations

## Requests

Use these requests verbatim.

**Adaptation**

> Make this more supportive for students who are struggling, without changing
> what they learn.

**Extension**

> Build on this lab with one additional interaction that deepens the same
> concept.

## Experiment matrix

| Lab | Request | Input variant | Result |
|---|---|---|---|
| Fetch–Decode–Execute | Adaptation | Baseline | Not run |
| Fetch–Decode–Execute | Adaptation | Contract | Not run |
| Fetch–Decode–Execute | Extension | Baseline | Not run |
| Fetch–Decode–Execute | Extension | Contract | Not run |
| Straight-Line Coordinates and Equations | Adaptation | Baseline | Not run |
| Straight-Line Coordinates and Equations | Adaptation | Contract | Not run |
| Straight-Line Coordinates and Equations | Extension | Baseline | Not run |
| Straight-Line Coordinates and Equations | Extension | Contract | Not run |

The baseline is the standalone lab from the commit immediately before the pilot.
The contract variant is the standalone lab from the pilot branch. Preserve both
input artifacts with the results so the comparison can be reproduced.

## Review rubric

Record pass, partial, or fail for each criterion, followed by one sentence of
evidence.

| Criterion | Review question |
|---|---|
| Intent | Does the result preserve the lab's actual learning relationship? |
| Causality | Does learner action still cause visible model change and consequential evidence? |
| Invariants | Are all protected behaviours and representations still consistent? |
| Requested adaptation | Does the result make the requested change? |
| Restraint | Does it avoid irrelevant redesign and curriculum expansion? |
| Technical | Does the standalone file work offline, accessibly and responsively? |

Run the repository's existing publication and accessibility checks for each
result. The human review should concentrate on pedagogical preservation rather
than duplicating those checks.

## Decision gate

Stop after evaluating the eight results. Expand the format only in response to an
observed failure:

- add `ExamplicityLab.getState()` only when runtime state remains unclear;
- add named cases only when important states remain unclear;
- add `labs-src/AGENTS.md` only when repository agents repeatedly mishandle the
  modification rules.

## Catalogue rollout

The catalogue-wide rollout was explicitly approved on 5 September 2026 before
the comparison above was run. The experiment remains unevaluated; rollout is
not evidence that contracts improve adaptation quality.

Each published lab now has an authoritative
`lab-contracts/<subject>/<slug>.lab.json` sidecar, separate from its
`labs-src/<subject>/<slug>/lab.html` source folder. The compiler embeds it into
the published and downloaded HTML; source HTML does not duplicate the contract.
Root and developer `llms.txt` files provide discovery. The internal CLI shares
the publication compiler and validator, and `labs:sync:check` verifies contract
coverage and preservation across the catalogue.

Binary Number Practice now uses contract profiles for its existing IGCSE/AS
question pools; see [the mapping and verification notes](binary-curriculum.md).
Syllabus cross-listing alone does not create a runtime curriculum profile.
The shared runtime facade, named executable cases, and MCP remain deferred.

The reconciliation also corrected implementation-specific contract invariants,
expanded CLI inspection to include adaptation guidance, and made the standalone
packager own canonical navigation URLs so entry-point context cannot change the
downloaded file. These implementation checks do not replace the eight-run AI
adaptation comparison above.
