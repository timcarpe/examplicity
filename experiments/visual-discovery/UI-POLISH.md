# Goal, feedback and help polish

Interface refinement of pull request 3, based on `49f28e3bfb05ffe88be4120936066e85c8cae73a`. No scientific model, curriculum scope or teaching sequence is redesigned.

## What was causing the search

The initial interface placed Test in the working card, Continue in the footer, hints between them, and two reset buttons in the mission. Successful working and the footer both looked like result cards. Hovering the entire working card could open a lengthy method tooltip, including while entering an answer. Some goals, working headings and feedback repeated the same instruction.

## Reference review — 10 September 2026

| Primary source | Documented pattern | Adaptation and limit |
| --- | --- | --- |
| [Brilliant: How Brilliant teaches math](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/) | One manageable idea at a time, timely feedback while reasoning is still visible, and in-context help without taking over. | Short goal and action sentence; feedback states the observed relationship and next action. This is a public product description, not a verified measurement of authenticated Brilliant screen layouts. No tutor, chat panel or reward system is copied. |
| [Khan Academy: Skip button update](https://support.khanacademy.org/hc/en-us/articles/26236154715789-Update-Navigate-Questions-at-Your-Own-Pace-with-the-Skip-Button) | Documents Check and Skip together at the bottom right and an optional step-by-step guide. | Put test/check/continuation in one predictable action position. Keep secondary navigation and requested help nearby. Do not add skipping, hint penalties or assessment machinery to these labs. |
| [W3C: Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html) | Consistent relative placement of help mechanisms reduces search. | One authored Hint entry in the dock. The criterion distinguishes site-level help from contextual assistance, so this is a useful design analogy, not a claim that the criterion mandates this specific hint layout. |
| [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Status changes should be available to assistive technology without receiving focus. | One polite, atomic live region; debounced changing observations; no focus jump when entering an answer or receiving a result. No full accessibility-conformance claim is made. |
| [W3C: On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) | Editing a control should not unexpectedly change context. | Retain explicit testing, no automatic progression, and the same focused button when Test becomes Continue. |

## Placement and wording conventions

**Goal above the model.** A small guided-step label precedes one short heading and one action sentence. Necessary values and conditions remain explicit. Guided-step dots exclude the separate experiment, so their count agrees with the step label.

**Feedback and action below it.** One dock follows the working, before optional saved readings. A stable primary button runs Test prediction, Mark angle, Check frequency or the current model action; it becomes Continue only when the existing criterion permits. Back and repeatable model operations are secondary. The open experiment has no artificial completion button.

**One success card.** The working stays a neutral calculation surface. Local input outlines still identify mistakes, but the result heading and evidence are in the dock. Success describes evidence, not intelligence or mastery. Retry feedback states a mismatch or required entry. In the optical transfer case, a correct prediction invites reversal without claiming the entire step is complete.

**One Hint disclosure.** The entry is always beside the secondary navigation when hints exist. It reveals evidence first, then the relationship or a labelled different worked example. Previous/next controls let the learner revisit hints; Escape closes the panel and returns focus. Opening help may scroll just enough to show the requested panel, but does not resize the apparatus or insert space above the action row. No help opens on success, input or navigation.

**Separate resetting from learning.** A native Restart options disclosure in the header contains Repeat this step and Restart lab. They preserve the established reset scopes. Escape dismisses the menu.

**Stable does not mean clipped.** Minimum feedback space absorbs ordinary status changes. Text remains allowed to wrap and grow at narrow widths or increased text size. The dock is in document flow, not an overlay that covers the apparatus. Quantity tooltips and opt-in value tracing remain; the whole working card is no longer a tooltip trigger.

## Implementation boundary

The shared dock invokes existing subject action callbacks through one persistent button. Hidden source buttons remain internal callback owners, not alternative learner controls. Source actions are explicitly tagged and ranked; no action is selected by guessing its label. Test and Continue use the same element, preserving focus and preventing a double-click from unintentionally advancing. A stale optical Reverse action is disabled after prediction edits, using the existing correctness predicate.

All source edits are confined to this experiment and the existing internal changelog note. Production labs, shared public components and package manifests remain unchanged.

## Verification

The browser runner continues to exercise all 19 guided experiences and four experiments using learner controls. It additionally checks:

- One visible primary action, one status live region, consistent hint placement and disclosure state, and no whole-card method popup.
- Identical action-slot bounds before testing, after a wrong prediction and after success at 1200, 900 and 390 pixels.
- Retained input/button focus; hint previous/next/Escape; unchanged apparatus dimensions and action position when help opens; restart disclosure; double-click protection.

Recorded screenshots include opening, transfer and experiment states for every lab, plus retry, success and expanded-hint states at all three widths. These are functional and visual checks, not learner testing or evidence of improved learning outcomes. Human learner and screen-reader usability reviews remain unperformed.

## Restart follow-up across six pilots

The histogram addition keeps this goal/action design and refines its restart disclosure. Scoped grid placement fixes the reversed visual order inherited from header button rules. Each action now names its reset scope. Repeating affects only the current step; in the experiment it is labelled Reset experiment. Restart lab first requests inline confirmation with Keep working focused, rather than immediately discarding the session. Escape, outside click and tab-away dismiss without changing work. Reset actions wait for model transitions.

See [the sourced workflow guide](WORKFLOW-AND-DESIGN.md#6-make-reset-scope-visible-and-predictable), `verify-restart.mjs`, and the latest section of [verification notes](VERIFICATION.md). The earlier verification above describes the original four-pilot polish, not the scope of this later six-pilot regression.
