# Binary Number Practice curriculum profiles

The existing IGCSE and AS buttons now select profiles in
`lab-contracts/computer-science/binary-numbers.lab.json`. This documents and
connects existing behaviour; it does not add a new qualification or question type.

## Ownership

- The sidecar owns profile labels, syllabus references, enabled feature IDs and
  the default question range.
- `labs-src/computer-science/binary-numbers/lab.html` implements each feature as
  a group of existing question generators. It reads the compiled contract and
  derives its active pool from the selected profile's `enabledFeatures`.
- `state.curriculumProfile` selects curricular content. `state.range` selects
  binary-only or binary-and-hex practice within that content. Help changes
  assistance. Question generation varies examples without changing curriculum.
- Switching curriculum clears question history and starts a fresh question. The
  selected range is retained, matching the previous behaviour.
- The current question surface exposes its implemented `data-lab-feature` ID.

The old IGCSE/AS pool arrays have been replaced by feature implementation groups.
The question sets and original two's-complement sampling weights are preserved.

## Evidence for the mapping

Reviewed against the official syllabuses on 5 September 2026:

- [Cambridge IGCSE Computer Science 0478, 2026–2028](https://www.cambridgeinternational.org/Images/697167-2026-2028-syllabus.pdf),
  section 1.1, printed pages 11–12: integer number representations/conversions,
  unsigned addition and overflow, logical shifts and two's complement.
- [Cambridge International AS & A Level Computer Science 9618, 2026](https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf),
  AS section 1.1, printed page 14: number representations including BCD and
  complements, magnitude prefixes, signed arithmetic and overflow; section 4.3,
  printed page 22: logical, arithmetic and cyclic shifts, bitwise operations,
  and setting/testing bits with masks.

The AS profile selects AS content; it does not claim additional A Level-only
capabilities. The catalogue's existing `AS/A` label includes this AS content.
Each feature records the section relevant to its current implementation, not a
claim that the lab covers every objective in that section.

## Verification and limits

`tests/binary-curriculum.test.ts` executes the lab's actual model and generators
without rendering. It checks both profiles and both ranges against the previous
question pools, including weights, and checks that feature removal affects the
pool. It also checks rejection of unregistered curriculum references.

Browser verification covers the real toggle, checked state, fresh question,
answer feedback and help. Automated checks cover standalone packaging and
contract preservation; opening the downloaded file in the browser was blocked
by browser security policy, so offline rendering remains unverified. The generic CLI reports
publication validation separately from behavioural validation; it does not run
these browser checks automatically.

There is no new shared runtime facade or named-case framework in this change.
The original eight-run AI adaptation comparison remains unevaluated.
