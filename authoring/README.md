# Lab authoring catalogue

This is the branch-only authoring catalogue snapshot from the private Lab Creation repository at revision `9a22b84`, prepared on 2026-09-10. Keep this directory on the persistent authoring workspace branch; do not promote it to `main`.

Read the [workspace instructions](../AGENTS.md) first. Never merge this authoring branch into main; promote only the reviewed production files as those instructions describe.

Open one of these generated pages directly in a local browser:

- [Mathematics](catalogue/mathematics.html)
- [Co-ordinated Sciences](catalogue/co-ordinated-sciences.html)
- [Science syllabus map](catalogue/co-ordinated-sciences-syllabus-map.html)
- [Computer Science](catalogue/computer-science.html)
- [Business](catalogue/business.html)

The pages are self-contained and need no build server. `catalogue/template.html` is the source template. `catalogue/data/` contains the subject source records, including the science mappings and objective ledger and the mathematics evidence records. `catalogue/validated/` contains the complete consolidated authoring export across all subjects. `provenance.json` records the snapshot, validation statement, exclusions and export counts. `catalogue/prompt.md` preserves the catalogue research criteria. `catalogue/README.md` documents the private source repository's schema and generation workflow; its build commands are context only and are not needed to browse this snapshot.

## Local-only source documents

Syllabus PDFs, textbooks, book excerpts and other binary source assets are deliberately excluded from Git. Existing relative locators are retained in the catalogue data and generated pages. On the authoring computer, optional local sources may be available under `authoring/resources/` and `authoring/catalogue/assets/book-excerpts/`; in a GitHub authoring task, the relevant bounded source must be supplied when it is needed.

A retained locator does not mean its source has been reviewed in the current task. Verify the relevant syllabus page or excerpt before relying on it as evidence. Missing local PDFs do not prevent browsing or querying the catalogue, but linked local documents will remain unavailable.

## Snapshot limits

The snapshot contains the validated catalogue state at `9a22b84`. Public lab availability, overlap and completion status can change after that revision, so check the current public registry before choosing or commissioning a lab.
