# Visual investigations: research and design decisions

## Basis

[Brilliant’s account of its teaching approach](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/) describes sequenced interactive problems, visual reasoning before notation, feedback after a learner decision, and support that fades with practice. This is a primary product description, not an independent evaluation of these prototypes.

[Implicit scaffolding in interactive simulations](https://arxiv.org/abs/1306.6544) describes how affordances, constraints, cueing and feedback within a simulation can support exploration. Its framework and case study inform the design; they do not establish that reducing every interface will improve learning.

Both sources were read on 8 September 2026. The implementation combines their ideas with the existing Examplicity models. It does not copy Brilliant artwork, branding or a lesson template.

## What that means here

The learner sees one current goal, a short action prompt, and the relevant model. A corner changes geometry; a laser changes ray directions; a piston changes gas volume; food changes reproductive advantage. The effect occurs at the manipulated object, without opening a dialogue or locating a second control panel.

Early steps constrain the task. A later step introduces a second dimension, a threshold, an invariant, or a generation. Feedback describes the current model state. Continue becomes available when the learner has produced the necessary evidence. Wrong numerical predictions remain revisable, and changing an answer clears previous success immediately.

One shared working card connects each calculation to the visible model. Early examples show the quantities, operation and units. Changed values briefly highlight; later steps keep the same calculation order while replacing results with learner inputs. The Maths reverse factors, optical index ratio, gas product and population percentage all follow this pattern. Cards appear where they support the current task.

The final step removes guided completion gates. Learners retain the model’s full supported variable range, can keep or clear observations, and can reset an experiment. This is an open investigation within the original conceptual scope, rather than an unlimited scientific simulator.

## Why these four labs

| Subject and existing source | Visual reasoning retained | Scaffolding and independent experiment |
| --- | --- | --- |
| Maths: Similarity and Scale Effects | Corresponding lengths, unit faces, layers, and unequal edge ratios | Length → four squares → eight cubes → reverse area → reverse volume → similarity repair. Experiment with positive scale factors, separate layers, stretch height, keep readings, and solve new area/volume targets. |
| Physics: Critical Angle and Total Internal Reflection | Semicircular block, radial source entry, normal, refraction, reflection and critical angle | Rotate below the threshold → observe both regimes and mark the limit → calculate for diamond → reverse the boundary. Experiment with both media and compare thresholds and transmitted power. |
| Chemistry: Gas Compression at Constant Temperature | Thermostatted bath, sealed piston, fixed-speed particles, impact marks, pressure gauge and p–V graph | Compress → predict expansion → collect an invariant → calculate and test a target. Experiment with the full volume range, linked graph and readings. This is the existing Physics/Chemistry cross-listed lab. |
| Biology: Selection Pressure and Trait Frequency | Existing variation, environmental advantage, selected parents, inherited offspring and frequency distributions | Change food without changing adults → distinguish selection from replacement → directional, stabilising and disruptive selection. Experiment with one or two food sources, food range and successive generations. |

The change to a one-unit reference in Maths and the glass index example in Physics fall within the source contracts’ safe adaptations. Chemistry retains a fixed amount of gas at 300 K. Biology preserves the original seeded sampling mechanism and continuous inherited trait model.

## Visual continuity

The visual baseline is the source labs and the references linked from [/developer](https://www.examplicity.org/developer): [written contract](https://www.examplicity.org/developer/lab-style-contract.md), [living guide](https://www.examplicity.org/developer/design-language.html), and [shared component CSS](https://www.examplicity.org/developer/lab-design.css).

The build embeds the pinned shared CSS/runtime and the guide’s token layer. Regular blue goals, typography, semantic feedback, shared actions, checkpoint dots and the piston grip follow those references. Local CSS supplies the small-screen layout; geometry and scientific state remain local. No design skill, external style framework or boilerplate theme was used.

The source’s unit grids and corresponding faces, semicircular optics apparatus, gas instruments, blue trait identities and amber food distribution are retained or redrawn at a clearer size. The Biology opening uses representative beak drawings and individual count dots before revealing the frequency plot. The gas graph appears after learners have observed the apparatus. Both changes remove simultaneous representations from the opening without losing them from the lab.

The gas gauge always reports actual pressure. A numerical prediction sits in the working card, and testing animates the piston to the test volume before comparing the result. Glass changes explicitly to a visibly distinct diamond block, retaining the glass threshold as a reference. Brief laser cues show travel direction. Selected Biology parents produce 72 inherited offspring before those offspring replace the adults; animation paths use the actual sampled parent identities. Dot rows reserve enough room for the entire population in one group.

Progressive disclosure replaces support switches and guidance overlays. The existing shared required-answer treatment and brief calculation-value highlights supply local attention cues. Motion respects reduced-motion preferences. These are scoped interaction changes, not new general rules for existing labs.

## Review evidence and limits

All 19 guided criteria and four experiment entries were exercised through the browser’s learner controls. Checks include reverse scale calculations, optical regimes, wrong/correct predictions, immediate success invalidation, constant pV and particle speed, unchanged adult traits during environmental edits, and all three selection patterns. Opening and experiment layouts were checked at 1200, 900 and 390 pixels, with additional reviews of calculation and material-change screens, offline and reduced-motion checks.

The SVG review compares model clarity and source continuity, not merely absence of browser errors. These remain review prototypes: visual acceptance and learning effectiveness should be assessed with the intended learners. No catalogue entries or published labs have been replaced.

Every HTML embeds the existing v1 Lab Contract, an updated implementation map, source revision and contract hash, research links, step criteria, accessibility behaviour and model limitations. The full scientific/curriculum scope remains traceable to its original contract.
