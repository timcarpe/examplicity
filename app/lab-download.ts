type StandaloneLabOptions = {
  source: string;
  title: string;
  siteHomeUrl: string;
  liveLabUrl: string;
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const standaloneChromeStyles = `
<style data-examplicity-download-chrome>
.examplicity-download-header,
.examplicity-download-footer {
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  backdrop-filter: saturate(180%) blur(18px);
  background: rgba(251,251,253,.94);
  box-sizing: border-box;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  left: 0;
  position: fixed;
  right: 0;
  z-index: 2147483000;
}
.examplicity-download-header {
  align-items: center;
  border-bottom: 1px solid rgba(29,29,31,.08);
  display: flex;
  height: 66px;
  justify-content: space-between;
  padding: 0 max(28px, calc((100vw - 1200px) / 2));
  top: 0;
}
.examplicity-download-wordmark {
  color: #1d1d1f;
  font-size: 20px;
  font-weight: 680;
  letter-spacing: -.055em;
  text-decoration: none;
}
.examplicity-download-wordmark span { color: #5277b8; }
.examplicity-download-header-label {
  color: #6e6e73;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.examplicity-download-footer {
  align-items: center;
  border-top: 1px solid rgba(29,29,31,.08);
  bottom: 0;
  display: flex;
  font-size: 11px;
  gap: 18px;
  height: 58px;
  justify-content: space-between;
  padding: 0 max(28px, calc((100vw - 1200px) / 2));
}
.examplicity-download-footer-brand {
  color: #1d1d1f;
  font-weight: 650;
  letter-spacing: -.03em;
  text-decoration: none;
}
.examplicity-download-footer-tagline { color: #6e6e73; }
.examplicity-download-footer-links {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  justify-content: flex-end;
}
.examplicity-download-footer a {
  color: inherit;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
}
.examplicity-download-footer a:hover { text-decoration-color: currentColor; }
.examplicity-download-header a:focus-visible,
.examplicity-download-footer a:focus-visible {
  outline: 3px solid #1d1d1f;
  outline-offset: 4px;
}
@media (max-width: 620px) {
  .examplicity-download-header {
    height: 60px;
    padding: 0 18px;
  }
  .examplicity-download-wordmark { font-size: 18px; }
  .examplicity-download-header-label { display: none; }
  .examplicity-download-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
    height: 82px;
    justify-content: center;
    padding: 0 20px;
  }
  .examplicity-download-footer-tagline { display: none; }
  .examplicity-download-footer-links { justify-content: flex-start; }
}
@media print {
  .examplicity-download-header,
  .examplicity-download-footer { display: none; }
}
</style>`;

export const createStandaloneLabHtml = ({
  source,
  title,
  siteHomeUrl,
  liveLabUrl,
}: StandaloneLabOptions) => {
  const homeHref = escapeHtml(siteHomeUrl);
  const labHref = escapeHtml(liveLabUrl);
  const labTitle = escapeHtml(title);
  const closingHead = source.toLowerCase().lastIndexOf('</head>');

  if (closingHead < 0) throw new Error('Lab document has no closing head tag.');

  let packaged = `${source.slice(0, closingHead)}${standaloneChromeStyles}\n${source.slice(closingHead)}`;
  const bodyMatch = /<body\b[^>]*>/i.exec(packaged);

  if (!bodyMatch || bodyMatch.index === undefined) throw new Error('Lab document has no body tag.');

  const header = `
<header class="examplicity-download-header" aria-label="Examplicity">
  <a class="examplicity-download-wordmark" href="${homeHref}" aria-label="Visit Examplicity online"><span>exam</span>plicity</a>
  <span class="examplicity-download-header-label">Standalone lab</span>
</header>`;
  const bodyStart = bodyMatch.index + bodyMatch[0].length;
  packaged = `${packaged.slice(0, bodyStart)}${header}${packaged.slice(bodyStart)}`;

  const closingBody = packaged.toLowerCase().lastIndexOf('</body>');
  if (closingBody < 0) throw new Error('Lab document has no closing body tag.');

  const footer = `
<footer class="examplicity-download-footer">
  <a class="examplicity-download-footer-brand" href="${homeHref}">Examplicity™</a>
  <span class="examplicity-download-footer-tagline">Make complex ideas click.</span>
  <span class="examplicity-download-footer-links">
    <a href="${labHref}" target="_blank" rel="noreferrer">Open ${labTitle} online ↗</a>
    <a href="https://github.com/timcarpe/examplicity" target="_blank" rel="noreferrer">GitHub</a>
    <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
  </span>
</footer>`;

  return `${packaged.slice(0, closingBody)}${footer}\n${packaged.slice(closingBody)}`;
};
