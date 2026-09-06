# Homepage lab ports

These are excerpts of the real redesigned labs, not illustrations. `*.json` contains the native markup and applicable published CSS; `*.js` retains source rendering functions with only the surrounding application orchestration removed. Shadow roots isolate the source styling, and SVG identifiers/references are namespaced.

Regenerate from the repository root with `node scripts/sync-home-previews.mjs` after syncing a featured source lab to its published output. Each asset records its source path and SHA-256. Review source visual changes before regenerating; do not hand-edit generated assets.

The CPU replays the default IGCSE `LOAD 8` instruction. Geometry uses the first scenario with the boundary aligned to its perpendicular bisector and the source's moving probe calculation. Patterns replays five valid additions from square stage 2 to stage 3, including the source's snap and transfer sequence. Graph search replays valid A* settle and relaxation steps on the original graph. Circle geometry uses a seeded semicircle problem and moves the existing point along its circle while preserving the right-angle construction.

`HomeHero` supplies elapsed time, pause and reduced-motion behavior. Its seven-second scene schedule is independent of each lab sequence. No live lab application or iframe is loaded by the homepage.

Homepage-only backdrop overrides remove the surrounding canvas surfaces from the coordinate, pattern, graph-search and circle previews; pattern stage containers remain, and the CPU is unchanged. These overrides live separately in `HomeHero`, leaving the generated native ports intact for source comparisons.

SVG text uses geometric precision in the homepage presentation to keep labels attached to their geometry under scaling and perspective. The CPU has a slightly smaller fit factor than the other scenes. Neither adaptation changes the native component coordinates.
