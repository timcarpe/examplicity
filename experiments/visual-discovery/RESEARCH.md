# Visual investigations: research and design decisions

## Basis

[Brilliant’s account of its teaching approach](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/) describes sequenced interactive problems, visual reasoning before notation, feedback after a learner decision, and support that fades with practice. This is a primary product description, not an independent evaluation of these prototypes.

[Implicit scaffolding in interactive simulations](https://arxiv.org/abs/1306.6544) describes how affordances, constraints, cueing and feedback within a simulation can support exploration. Its framework and case study inform the design; they do not establish that reducing every interface will improve learning.

Both sources were read on 8 September 2026. The implementation combines their ideas with the existing Examplicity models. It does not copy Brilliant artwork, branding or a lesson template.

## What that means here

The learner sees one current goal, a short action prompt, and the relevant model. A corner changes geometry; a laser changes ray directions; a piston changes gas volume; food changes reproductive advantage. The effect occurs at the manipulated object, without opening a dialogue or locating a second control panel.

Early steps constrain the task. A later step introduces a second dimension, a threshold, an invariant, or a generation. Feedback describes the current model state. Continue becomes available when the learner has produced the necessary evidence. Wrong numerical predictions remain revisable, and changing an answer clears previous success immediately.

One shared working card connects each calculation to the visible model. Early examples show the quantities, operation and units. Source labels and formula operands use explicit quantity identities: air’s refractive index connects to the numerator because it is the refracted index, not because both happen to display 1. Earlier calculated results can become sources for the next row. Later steps keep this calculation order while replacing results with learner inputs. The Maths reverse factors, optical index ratio, gas product and population percentage all follow this pattern.

The final step removes guided completion gates and opens additional variables. Maths includes larger factors and independent height; Physics includes hypothetical indices; Chemistry introduces temperature and relative gas amount; Biology introduces population size and alternating or even food pressure. The controls sit on the model where practical. Scope and limits are explicit in the embedded contracts.

## Why these four labs

| Subject and existing source | Visual reasoning retained | Scaffolding and independent experiment |
| --- | --- | --- |
| Maths: Similarity and Scale Effects | Corresponding lengths, unit faces, layers, and unequal edge ratios | Length → four squares → eight cubes → reverse area → reverse volume → similarity repair. Experiment with factors up to 5, separate layers, independent height, saved readings and new area/volume targets. |
| Physics: Critical Angle and Total Internal Reflection | Semicircular block, radial source entry, normal, refraction, reflection and critical angle | Rotate below the threshold → observe both regimes and mark the limit → calculate for diamond → reverse the boundary. Experiment with both media or custom indices and compare thresholds and transmitted power. |
| Chemistry: Gas Compression at Constant Temperature | Thermostatted bath, sealed piston, fixed-speed guided particles, impact marks, pressure gauge and p–V graph | Compress → predict expansion → collect an invariant → calculate and test a target. Experiment with volume, temperature and gas amount, using the linked graph and readings. This is the existing Physics/Chemistry cross-listed lab. |
| Biology: Selection Pressure and Trait Frequency | Existing variation, environmental advantage, selected parents, inherited offspring and frequency distributions | Change food without changing adults → distinguish selection from replacement → directional, stabilising and disruptive selection. Experiment with food peaks and widths, changing pressure, population sizes and successive generations. |

The change to a one-unit reference in Maths and the index examples in Physics fall within the source contracts’ safe adaptations. Chemistry retains a fixed amount of gas at 300 K throughout guidance; the user-requested final experiment deliberately extends the original contract’s temperature and gas-amount non-goal. Its generated contract documents that extension, while the pedagogy data retains the original non-goal for provenance. Biology preserves seeded sampling and continuous inherited traits, with population size fixed within each chosen run.

## Visual continuity

The visual baseline is the source labs and the references linked from [/developer](https://www.examplicity.org/developer): [written contract](https://www.examplicity.org/developer/lab-style-contract.md), [living guide](https://www.examplicity.org/developer/design-language.html), and [shared component CSS](https://www.examplicity.org/developer/lab-design.css).

The build embeds the pinned shared CSS/runtime and the guide’s token layer. Regular blue goals, typography, semantic feedback, shared actions, checkpoint dots and the piston grip follow those references. Local CSS supplies the small-screen layout; geometry and scientific state remain local. No design skill, external style framework or boilerplate theme was used.

The source’s unit grids and corresponding faces, semicircular optics apparatus, gas instruments, blue trait identities and amber food distribution are retained or redrawn at a clearer size. The Biology opening uses representative beak drawings and individual count dots before revealing the frequency plot. The gas graph appears after learners have observed the apparatus. Both changes remove simultaneous representations from the opening without losing them from the lab.

The gas gauge always reports actual pressure. A numerical prediction sits in the working card, and testing animates the piston to the test volume before comparing the result. Glass changes explicitly to a visibly distinct diamond block, retaining the glass threshold as a reference. Brief laser cues show travel direction. Selected Biology parents produce 72 inherited offspring before those offspring replace the adults; animation paths use the actual sampled parent identities. Dot rows reserve enough room for the entire population in one group.

Progressive disclosure replaces support switches and guidance overlays. The existing shared required-answer treatment remains. The motion and connection pattern below is a proposed reference for future labs, implemented locally without changing the shared style guide.

## Connection and transition reference

These are design decisions informed by the research above, not separately validated learning-effectiveness claims:

- `data-source` and `data-value-ref` identify each quantity. A starting measurement and a current measurement have different identities even when their values match. Derived results can feed later working.
- Only activating **Trace values** starts the sequence: a source pulses, its value travels along a short curved path for 560 ms when both ends are visible, and its formula operands pulse. The calculation follows row order. Loading, editing, scrolling, changing checkpoints and selecting a source never start a trace.
- Hover or focus highlights both locations and opens a small 12 px explanation. Tap and Enter/Space work on source labels; Escape dismisses the explanation. The working card explains the complete calculation. Tooltips can be hovered without vanishing.
- Checkpoint transitions compare rendered visual parts. Changed mission text, working, controls, feedback and SVG elements fade out for 150 ms before their replacements fade in for 300 ms. Identical apparatus and controls remain visible; changing working and model areas resize smoothly. Temporary visual copies are inert and hidden from assistive technology, with isolated SVG references, and are removed when the transition finishes. Navigation is briefly locked to prevent skipping a checkpoint.
- Cube layers separate or rejoin over 420 ms. Piston tests interpolate actual volume; offspring travel from their sampled parents. These model-specific animations retain their causal meaning.
- A completed criterion receives a white checkmark on a green disc and a short evidence heading. Editing an answer clears success. Missions use aligned blue headings, quieter context and spacing, without an icon. Their text supplies the previous result, current purpose and next action.
- Reduced motion changes checkpoints immediately and uses paired static outlines only when tracing is requested. Edits, dragging, scrolling and stage changes cancel a running trace; tracing never scrolls the page automatically.

## Expanded experimental limits

Maths permits positive factors from 0.5 to 5 and independent height. The view fits the geometry automatically; labels retain the true factors. A face factor means one corresponding square face, and a stretched solid uses k²h for volume.

Physics permits hypothetical indices from 1 to 3.5 under the same ideal, lossless Snell/Fresnel model. These custom values are not claims about real materials. Recorded comparisons preserve both indices so later edits do not change what a saved reading means.

Chemistry uses pV = 600 × (T/300) × relative gas amount, with T in kelvin. The experiment permits 150–600 K and 0.5–2 times the starting sample. Representative particle speed scales with √T; pressure is calculated from the ideal-gas relationship, not measured from 2D collisions. Bath equilibrium is instantaneous. The graph shows the current conditions; the table retains all saved conditions. Returning to guidance restores the fixed sample and speed.

Biology permits 36, 72 or 144 adults, selecting one third as parents. Changing size starts a fresh seeded population. Steady food retains editable peaks, alternating food switches shallow/deep advantage each generation, and even food assigns equal reproductive weights while retaining random sampling. The model does not imply inevitable selection outcomes or simulate complete genetics, ecology or population growth.

## Review evidence and limits

All 19 guided criteria and four experiment entries were exercised through the browser’s learner controls. Checks include reverse scale calculations, optical regimes, wrong/correct predictions, immediate success invalidation, constant pV and particle speed, unchanged adult traits during environmental edits, and all three selection patterns. Opening and experiment layouts were checked at 1200, 900 and 390 pixels, with additional reviews of calculation and material-change screens, offline and reduced-motion checks.

The SVG review compares model clarity and source continuity, not merely absence of browser errors. These remain review prototypes: visual acceptance and learning effectiveness should be assessed with the intended learners. No catalogue entries or published labs have been replaced.

Every HTML embeds the existing v1 Lab Contract, an updated implementation map, source revision and contract hash, research links, step criteria, accessibility behaviour and model limitations. The full scientific/curriculum scope remains traceable to its original contract.
