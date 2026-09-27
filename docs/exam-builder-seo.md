# Exam Builder SEO integration

Checked on 27 September 2026.

- The homepage and subject catalogue headers link directly to `https://builder.examplicity.org/` using a normal HTML anchor.
- The builder root and `https://builder.examplicity.org/about.html` now return 200. Both retain self-referencing builder canonicals and permit indexing. The builder sitemap returns XML containing both pages, and robots.txt permits crawling.
- Search Console's `sc-domain:examplicity.org` property is accessible, and Settings reports "You are a verified owner". This Domain property covers the builder subdomain.
- Reviewed the feature-led About redesign (`be35778` in the builder repository): the public URL, metadata, AboutPage structured data, app links and main-site links remain compatible. The content is present in static HTML; the inline script only enhances the decorative demos.
- `app/sitemap.ts` includes the builder root and About canonical URLs, preserving the existing main-site entries. Neither entry invents a modification date; the sitemap file is not listed as a page.

After this main-site release:

1. Verify the published main-site header link and the two builder entries in `https://www.examplicity.org/sitemap.xml`.
2. Submit the main-site sitemap in the verified Domain property. The builder sitemap can also be submitted separately there.
3. Inspect both builder page URLs in Search Console, check the rendered content, indexing permission and selected canonical, request indexing, and check sitemap processing after submission.

The builder release is owned separately; this integration does not deploy it.

Release validation: all 94 repository tests, scoped ESLint, the publication checks for all 57 labs, TypeScript, `npm run build -- --webpack`, and `git diff --check` passed. The production homepage response contains the builder anchor before JavaScript runs, and its browser preview reports no errors. The generated XML contains 70 unique page URLs, including exactly the two builder canonical URLs without modification dates. Earlier link checks passed at 1366 x 768 and 390 x 844 and on the subject catalogue. The live About HTML and stylesheet match the reviewed builder source; its desktop and phone layouts, metadata, structured data and cross-site links were checked.

References: [Google's cross-site sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit), [Domain property scope](https://support.google.com/webmasters/answer/34592).
