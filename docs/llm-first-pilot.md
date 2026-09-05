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

Contract authoring now uses an optional `contract.json` inside each per-lab source
package. The compiler embeds it into the published and downloaded HTML; it is
never maintained in both places. Root and developer `llms.txt` files provide a
small discovery index without duplicating lab-specific contracts.

Do not migrate another lab until the contract variants materially outperform the
baseline or the contract has been revised and retested.
