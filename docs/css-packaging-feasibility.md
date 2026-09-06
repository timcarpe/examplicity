# Selective CSS packaging — feasibility

Reviewed 6 September 2026. Assessment only; packaging behaviour is unchanged.

## Current path

`tools/lab-publication/index.ts` replaces `LAB_DESIGN_COMPONENTS` with the whole shared stylesheet and runtime. Both catalogue downloads and AI Remix fetch that published HTML, then `createStandaloneLabHtml` adds the download header/footer. Publication and download checks require self-contained CSS/JS.

The shared stylesheet is **295,020 bytes** (about 295 KB), repeated in all 57 published labs. Shared runtime is 21,268 bytes. A read-only CSS parser estimate found **72–85 KB per lab** in rules scoped to unrelated body adapters. This is an opportunity estimate, not a validated stripped bundle: generic selectors and future states still need dependency review.

## Existing solution and recommended pilot

[PurgeCSS](https://purgecss.com/configuration) already accepts HTML/JavaScript and CSS strings and returns a reduced stylesheet. Its [safelist](https://purgecss.com/safelisting) can retain selectors for dynamic states. This is a practical packaging-time option; no manual per-lab CSS copying is needed.

1. At packaging, analyse the lab's markup and scripts plus shared runtime. Exclude inline `<style>` blocks from the scanned content, otherwise the stylesheet itself makes unused selectors appear used.
2. Reduce the shared CSS with that content and a small shared safelist for generated classes/attributes. Initially retain keyframes, variables and font definitions. Keep the full canonical CSS unchanged.
3. Inline the resulting CSS into the standalone HTML. Use the same packager for catalogue downloads and AI Remix. Cache by lab/source and shared-resource revision if assembly runs on demand.
4. Pilot on Binary, Recursive Call Stacks and Gas. Inspect rejected selectors, compare representative opening/later states and check offline downloads before expanding. The figures above are adapter estimates, not measured PurgeCSS output.

The lean integration point is the existing publication packager: determine the subset once while producing each lab, and let downloads keep using that prepared HTML. If selection must happen specifically when Download is clicked, a server packaging route can do the same operation and return the one-file result; it adds a route/cache and changes to both download clients. Live embeds could later use cacheable external CSS independently, but that would change the current self-contained publication check.

## Guardrails

- Do not remove selectors solely because they miss the initial DOM or screenshot. Labs create classes, fields, modals and SVG elements during interaction.
- Preserve cascade order, responsive/dark/reduced-motion rules and animation dependencies.
- Keep one source of truth and one offline HTML. Referencing a remote stylesheet from the downloaded file would change that contract.
- Generated names assembled from fragments need explicit safelisting; scanning scripts alone cannot prove every later state is covered. If that becomes unwieldy, explicit component sections in the canonical stylesheet are the conservative fallback.
- Savings beyond the scoped-adapter estimate are plausible but unmeasured. No dependency, production pruning or packaging route was added in this pass.
