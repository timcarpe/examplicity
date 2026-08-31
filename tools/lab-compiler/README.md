# Lab publication compiler

This site-owned compiler performs one mechanical operation: replace declared,
versioned lab resources with deterministic marked inline blocks. It does not
create pedagogy, DOM structure, lab layouts or subject behavior.

`compileLabResources` rejects unknown or duplicate declarations, stale compiled
blocks, unresolved runtime stylesheets/scripts and oversized shared resources
without a documented waiver. Publication scripts separately apply the site
frame and manifest-owned metadata. The independent
`tools/lab-publication-profile` release records the constraints those transforms
and authored labs must satisfy; the compiler does not implement that profile.

Lab Creation owns the canonical creation kit. This repository vendors the exact
kit release it supports. Lab Creation may vendor an immutable compiler release
for exact proof previews, but canonical compiler changes and releases happen
here.

When releasing a compiler change, update `manifest.json`, copy that immutable
release to consumers that require an exact preview, and verify its SHA-256
before use.
