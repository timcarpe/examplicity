# Visual investigations: design decisions and limits

## Source basis

The initial prototypes used [Brilliant’s teaching approach](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/) and [Implicit scaffolding in interactive simulations](https://arxiv.org/abs/1306.6544), recorded as read on 8 September 2026. The former describes a product’s approach; the latter presents a design framework and case study. Neither evaluates these prototypes.

The September refinement implements the repository review’s central distinction: simplify operating the model without removing the learner’s decision. It does not add accounts, points, dashboards, a separate quiz layer or an automated tutor. These are design adaptations, not independently validated effectiveness claims.

## What changed and why

### Observation before notation

Gas now opens with a compression and its reversal. Only the apparatus, volume, actual pressure and particle-impact illustration are available. The next experience collects three readings before revealing their common product and the curve. A small warning about clustered readings is advisory, not another completion barrier. The calculation comes after that evidence, followed by a pressure prediction at an unfamiliar 4 litres and an independently planned volume for 240 kPa.

This repairs the earlier sequence, which supplied the invariant in the opening calculation card and subsequently asked learners to find it. The numerical model remains pV = 600 kPa·L under fixed guided conditions.

### Support fades; the model stays

Maths preserves the worked length, unit-square and cube-layer construction. The reverse-area case is supported. The next cube has an original edge of 2 units and volume 8, with a target volume of 64: learners must distinguish the length factor 2 from the new edge length 4. The operation is not printed as the answer method. Both reverse predictions require an explicit test; typing alone produces no correctness verdict.

Physics preserves the initial ray exploration, measured glass threshold and worked diamond calculation. A fresh water-to-air boundary requires an independent angle prediction without a supplied index substitution. The outgoing ray remains hidden before testing. After an accepted measurement, reversing the same boundary exposes the directional condition. A reasonable accepted angle is snapped to the exact measured threshold after testing, so rounding cannot produce a contradictory total-reflection drawing alongside accepted critical-angle feedback.

### Construct the cause, not just advance the outcome

Biology keeps the clear existing-adult → selected-parent → inherited-offspring progression. Opening experiences no longer compete with an unrelated calculation panel. The directional and stabilising cases are worked observations, not claims that arbitrary mean or standard-deviation thresholds demonstrate understanding.

The final guided experience starts with an unhelpful central two-source food supply. Learners move and narrow the sources themselves. A small target shows the desired distribution shape, not exact counts. The same visible trait bands define both the displayed evidence and the completion comparison: both tail frequencies must rise and the middle must fall after several generations under the chosen arrangement. Editing food never edits adults. A population reset retains the chosen arrangement, allowing a fair retest.

This is still a limited completion check, not a diagnosis of the learner’s reasoning. The proposed learner review explicitly tests whether learners can explain and transfer the relationship.

### Request help without surrendering the decision

Optional help first points to relevant quantities or evidence. A further request introduces the relationship; the last gives a different worked case. Recognisable errors receive specific cues, such as using a new edge length as a scale factor or reversing the optical index ratio. No automatic pulse identifies the correct answer or opens a help panel.

Existing quantity identities remain explicit: `data-source` and `data-value-ref` connect actual quantities, not coincidentally matching digits. Hover, focus and tap provide local explanations. Only **Trace values** starts an ordered value transfer. Reduced motion keeps static paired outlines. Stage transitions keep unchanged apparatus visible and cancel obsolete traces.

### Compare cases without relying on memory

Experiment readings are immutable snapshots, not references to mutable model settings. Selecting a reading adds a restrained dashed outline, threshold, piston/curve or population distribution. The text identifies changed conditions. The lab still has one principal model, not a second results dashboard.

Biology adds an explicitly requested new sample. The initial seed remains reproducible; a new sample changes the cohort and sampling sequence while retaining the chosen food pressure. Saved comparisons retain their population size and seed. When population sizes differ, the saved histogram is rescaled by proportion and labelled as such. It is not labelled as the original raw count.

Back/Forward restore checkpoint snapshots, including inputs, checked states, observations, custom indices and population parameters. Repeating an experience is a distinct action. These states are session-only and do not imply mastery or permanent progress tracking.

## Scientific scope

- **Maths:** corresponding area scales in two directions and volume in three only when the edge ratios agree. Non-similar solids use the actual width × depth × height. The guided transfer uses a labelled non-unit reference; the experiment keeps the existing one-unit reference. Partial units remain possible.
- **Physics:** the same ideal, lossless Snell/Fresnel model drives angles and power. A critical angle exists only from higher to lower index. Custom indices 1–3.5 are hypothetical, not measured material claims. Ray lengths are illustrative and minimum opacity preserves visibility.
- **Gas:** temperature and amount are fixed throughout guidance. The existing experimental extension uses pV = 600 × (T/300) × relative amount, with 150–600 K and 0.5–2 times the sample. Representative speed scales with √T. Pressure is calculated from the ideal-gas relationship, not measured from the two-dimensional particles. Resizing the apparatus rescales particle positions without changing speed. The bath equilibrates instantly; non-ideal gases and thermal transients are excluded.
- **Biology:** a bounded inherited continuous trait, weighted sampling and small offspring variation are used, not complete genetics, ecology or population growth. Population size stays fixed within each chosen run. Sampling variability is visible but this is not a full genetic-drift model. Existing adults never adapt by changing their own beaks.

The original guided relationships and curriculum mappings remain traceable through the v1 contracts. The earlier explicit extension of gas temperature and amount remains confined to the final experiment and documented in its contract. No additional curriculum expansion is introduced by this refinement.

## Validation boundary

Automated model tests exercise invariants across multiple inputs and seeds. Browser acceptance exercises real learner controls and checks desktop/tablet/phone layouts, incorrect predictions, state restoration and motion alternatives against generated offline artifacts. These checks establish implementation behaviour, not learning effectiveness. The human [learner review](LEARNER-REVIEW.md) remains to be conducted.

## Goal, feedback and help polish

The follow-up interface pass keeps the teaching sequence and scientific models intact. [UI-POLISH.md](UI-POLISH.md) records the primary-source comparison and the adopted placement, language and disclosure conventions. The working card no longer opens a broad method tooltip or repeats a full success state. Status announcements are consolidated; the goal, current action and optional hints have consistent roles.

## Sixth pilot and reproducible workflow

[Workflow and design decisions](WORKFLOW-AND-DESIGN.md) connects the actual implementation choices to the original histogram contract, NIST, the PhET authors, Brilliant, Khan Academy and W3C. It distinguishes source facts from model simplifications and unperformed checks. [Histogram pilot notes](HISTOGRAMS-PILOT.md) specify the new operations and bounded estimates.
