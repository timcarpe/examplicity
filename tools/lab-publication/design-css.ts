import { PurgeCSS } from 'purgecss';

export type DesignCssPolicy = {
  standard: string[];
  standardPatterns?: string[];
  components: string[];
  dynamicAttributes: string[];
};

export async function packageDesignCss(css: string, html: string, policy: DesignCssPolicy) {
  // CSS selectors are not evidence of use. Scripts ARE: labs generate markup at runtime.
  const content = html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const withoutSharedCss = html.replace(/<style data-lab-design>[\s\S]*?<\/style>/g, '');
  // Local CSS and script-driven animations can depend on shared keyframes.
  const localTokens = new Set(withoutSharedCss.match(/[\w-]+/g) ?? []);
  const keyframes = [...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)]
    .map(match => match[1]).filter(name => localTokens.has(name));
  // dataset.labSetting produces data-lab-setting, absent from ordinary token extraction.
  const datasetAttributes = [...content.matchAll(/\bdataset(?:\.([a-zA-Z][\w]*)|\[['"]([\w]+)['"]\])/g)]
    .map(match => 'data-' + (match[1] || match[2]).replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()));
  const [result] = await new PurgeCSS().purge({
    content: [{ raw: content, extension: 'html' }],
    css: [{ raw: css }],
    safelist: {
      standard: [...policy.standard, ...(policy.standardPatterns ?? []).map(pattern => new RegExp(pattern))],
      deep: policy.components.map(pattern => new RegExp(pattern)),
      keyframes,
    },
    dynamicAttributes: [...new Set([...policy.dynamicAttributes, ...datasetAttributes])],
    keyframes: true,
    // Keep design tokens for remixing and existing offline font declarations.
    variables: false,
    fontFace: false,
  });
  return result.css;
}
