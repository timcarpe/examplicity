export const LAB_RESOURCE_TYPES = ['stylesheet', 'script'] as const;
export type LabResourceType = (typeof LAB_RESOURCE_TYPES)[number];

export const DEFAULT_MAX_RESOURCE_BYTES = 64 * 1024;

export type ResourceSizeWaiver = string | {
  reason: string;
  maxBytes?: number;
};

export type DeclaredLabResource = {
  id: string;
  type: LabResourceType;
  content: string;
  sizeWaiver?: ResourceSizeWaiver;
};

type ResourceRecord = Omit<DeclaredLabResource, 'id'> & { id?: string };
export type LabResourceDeclarations =
  | readonly DeclaredLabResource[]
  | ReadonlyMap<string, ResourceRecord>
  | Readonly<Record<string, ResourceRecord>>;

export type LabResourceCompilerOptions = {
  check?: boolean;
  checkOnly?: boolean;
  maxResourceBytes?: number;
  sizeWaivers?: Readonly<Record<string, ResourceSizeWaiver>>;
};

export type LabResourceCompileResult = {
  source: string;
  changed: boolean;
  bytes: number;
  resources: string[];
};

export type RuntimeResourceReference = {
  element: 'link' | 'script';
  type: LabResourceType;
  url: string;
};

const resourceIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const resourceTagPattern = /<link\b[^>]*\/?>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const openTagPattern = /^<([A-Za-z][A-Za-z0-9:-]*)\b([^>]*)>/i;
const attributePattern = /([A-Za-z_:][A-Za-z0-9:._-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const markerStart = (id: string, type: LabResourceType) => (
  `<!-- LAB_RESOURCE_START id="${id}" type="${type}" -->`
);
const markerEnd = (id: string, type: LabResourceType) => (
  `<!-- LAB_RESOURCE_END id="${id}" type="${type}" -->`
);

const escapeAttribute = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const utf8ByteLength = (value: string) => new TextEncoder().encode(value).byteLength;

const parseAttributes = (tag: string) => {
  const opening = openTagPattern.exec(tag);
  if (!opening) throw new Error(`Unable to parse resource tag: ${tag.slice(0, 80)}`);

  const attributes = new Map<string, string>();
  for (const match of opening[2].matchAll(attributePattern)) {
    const name = match[1].toLowerCase();
    if (attributes.has(name)) throw new Error(`Duplicate ${name} attribute on <${opening[1].toLowerCase()}>`);
    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? '');
  }

  return { name: opening[1].toLowerCase(), attributes };
};

const getAttribute = (attributes: Map<string, string>, name: string) => attributes.get(name);

const isStylesheetLink = (name: string, attributes: Map<string, string>) => (
  name === 'link'
  && (getAttribute(attributes, 'rel') ?? '').split(/\s+/).some((value) => value.toLowerCase() === 'stylesheet')
);

const extractBody = (tag: string) => {
  const openingEnd = tag.indexOf('>') + 1;
  const closingStart = tag.lastIndexOf('</');
  if (openingEnd <= 0 || closingStart < openingEnd) throw new Error('Inline resource block is malformed');
  return tag.slice(openingEnd, closingStart);
};

const extractCompiledContent = (tag: string) => {
  const body = extractBody(tag);
  if (!body.startsWith('\n') || !body.endsWith('\n')) {
    throw new Error('Compiled resource blocks must use the canonical newline wrapper');
  }
  return body.slice(1, -1);
};

const hasMarkerBefore = (source: string, start: number, marker: string) => (
  new RegExp(`${escapeRegExp(marker)}(?:\\r?\\n)?$`).test(source.slice(0, start))
);

const hasMarkerAfter = (source: string, end: number, marker: string) => (
  new RegExp(`^(?:\\r?\\n)?${escapeRegExp(marker)}`).test(source.slice(end))
);

const validateWaiver = (id: string, waiver: ResourceSizeWaiver, bytes: number) => {
  const normalized = typeof waiver === 'string' ? { reason: waiver } : waiver;
  if (!normalized || typeof normalized.reason !== 'string' || !normalized.reason.trim()) {
    throw new Error(`Resource ${id} has an invalid size waiver reason`);
  }
  if (normalized.maxBytes !== undefined && (
    !Number.isInteger(normalized.maxBytes) || normalized.maxBytes <= 0
  )) {
    throw new Error(`Resource ${id} has an invalid size waiver limit`);
  }
  if (normalized.maxBytes !== undefined && bytes > normalized.maxBytes) {
    throw new Error(
      `Resource ${id} is ${bytes} bytes, above its waived limit of ${normalized.maxBytes} bytes`,
    );
  }
};

const normalizeResource = (candidate: ResourceRecord, fallbackId?: string): DeclaredLabResource => {
  const id = fallbackId ?? candidate.id;
  if (typeof id !== 'string' || !resourceIdPattern.test(id)) {
    throw new Error(`Invalid lab resource id: ${String(id)}`);
  }
  if (!LAB_RESOURCE_TYPES.includes(candidate.type)) {
    throw new Error(`Resource ${id} has unknown type: ${String(candidate.type)}`);
  }
  if (typeof candidate.content !== 'string') {
    throw new Error(`Resource ${id} content must be a string`);
  }
  if (/<\/style\b/i.test(candidate.content) || /<\/script\b/i.test(candidate.content)) {
    throw new Error(`Resource ${id} contains an HTML closing tag`);
  }

  return { id, type: candidate.type, content: candidate.content, sizeWaiver: candidate.sizeWaiver };
};

const normalizeDeclarations = (resources: LabResourceDeclarations) => {
  const candidates: Array<{ id?: string; resource: ResourceRecord }> = [];
  if (Array.isArray(resources)) {
    for (const resource of resources) candidates.push({ resource });
  } else if (resources instanceof Map) {
    for (const [id, resource] of resources) candidates.push({ id, resource });
  } else if (resources && typeof resources === 'object') {
    for (const [id, resource] of Object.entries(resources)) candidates.push({ id, resource });
  } else {
    throw new Error('Lab resources must be an array, Map, or object record');
  }

  const normalized = new Map<string, DeclaredLabResource>();
  for (const candidate of candidates) {
    const resource = normalizeResource(candidate.resource, candidate.id);
    if (candidate.id && candidate.resource.id && candidate.id !== candidate.resource.id) {
      throw new Error(`Resource key ${candidate.id} does not match its declared id ${candidate.resource.id}`);
    }
    if (normalized.has(resource.id)) throw new Error(`Duplicate lab resource: ${resource.id}`);
    normalized.set(resource.id, resource);
  }
  return normalized;
};

const checkResourceSizes = (
  resources: Map<string, DeclaredLabResource>,
  options: LabResourceCompilerOptions,
) => {
  const maxBytes = options.maxResourceBytes ?? DEFAULT_MAX_RESOURCE_BYTES;
  if (!Number.isInteger(maxBytes) || maxBytes <= 0) throw new Error('maxResourceBytes must be a positive integer');

  for (const resource of resources.values()) {
    const bytes = utf8ByteLength(resource.content);
    const waiver = options.sizeWaivers?.[resource.id] ?? resource.sizeWaiver;
    if (bytes <= maxBytes) continue;
    if (waiver === undefined) {
      throw new Error(
        `Resource ${resource.id} is ${bytes} bytes, above the ${maxBytes}-byte limit; add an explicit size waiver`,
      );
    }
    validateWaiver(resource.id, waiver, bytes);
  }
};

const inlineBlock = (resource: DeclaredLabResource, sourceAttributes: Map<string, string>) => {
  const bytes = utf8ByteLength(resource.content);
  const resourceAttributes = `data-lab-resource="${escapeAttribute(resource.id)}" data-lab-resource-type="${resource.type}" data-lab-resource-bytes="${bytes}"`;
  const media = sourceAttributes.get('media');
  const mediaAttribute = resource.type === 'stylesheet' && media !== undefined
    ? ` media="${escapeAttribute(media)}"`
    : '';
  const scriptType = resource.type === 'script' ? sourceAttributes.get('type') : undefined;
  const scriptTypeAttribute = scriptType && !/^text\/javascript$/i.test(scriptType)
    ? ` type="${escapeAttribute(scriptType)}"`
    : '';
  const tag = resource.type === 'stylesheet'
    ? `<style ${resourceAttributes}${mediaAttribute}>\n${resource.content}\n</style>`
    : `<script ${resourceAttributes}${scriptTypeAttribute}>\n${resource.content}\n</script>`;

  return `${markerStart(resource.id, resource.type)}\n${tag}\n${markerEnd(resource.id, resource.type)}`;
};

const findResourceTags = (source: string) => [...source.matchAll(resourceTagPattern)];

export const findUnresolvedRuntimeResources = (source: string): RuntimeResourceReference[] => {
  const unresolved: RuntimeResourceReference[] = [];
  for (const match of findResourceTags(source)) {
    const { name, attributes } = parseAttributes(match[0]);
    const resourceId = getAttribute(attributes, 'data-lab-resource');
    if (resourceId !== undefined) continue;

    if (isStylesheetLink(name, attributes) && getAttribute(attributes, 'href') !== undefined) {
      unresolved.push({ element: 'link', type: 'stylesheet', url: getAttribute(attributes, 'href') ?? '' });
    } else if (name === 'script' && getAttribute(attributes, 'src') !== undefined) {
      unresolved.push({ element: 'script', type: 'script', url: getAttribute(attributes, 'src') ?? '' });
    }
  }
  return unresolved;
};

const validateMarkerCounts = (source: string, used: Map<string, LabResourceType>) => {
  const markerPattern = /<!-- LAB_RESOURCE_(START|END) id="([A-Za-z0-9][A-Za-z0-9._-]*)" type="(stylesheet|script)" -->/g;
  const counts = new Map<string, number>();
  for (const match of source.matchAll(markerPattern)) {
    const key = `${match[1]}|${match[2]}|${match[3]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const type = used.get(match[2]);
    if (!type || type !== match[3]) throw new Error(`Unknown or mismatched resource marker: ${match[2]}`);
  }

  for (const [id, type] of used) {
    if (counts.get(`START|${id}|${type}`) !== 1 || counts.get(`END|${id}|${type}`) !== 1) {
      throw new Error(`Resource ${id} must have exactly one marked inline block`);
    }
  }
};

export const compileLabResources = (
  source: string,
  declarations: LabResourceDeclarations,
  options: LabResourceCompilerOptions = {},
): LabResourceCompileResult => {
  if (typeof source !== 'string') throw new Error('Lab source must be a string');
  const resources = normalizeDeclarations(declarations);
  checkResourceSizes(resources, options);
  const used = new Map<string, LabResourceType>();
  const replacements: string[] = [];
  let cursor = 0;

  for (const match of findResourceTags(source)) {
    const tag = match[0];
    const start = match.index ?? 0;
    const end = start + tag.length;
    replacements.push(source.slice(cursor, start));
    cursor = end;

    const { name, attributes } = parseAttributes(tag);
    const id = getAttribute(attributes, 'data-lab-resource');
    if (id === undefined) {
      replacements.push(tag);
      continue;
    }
    if (!resourceIdPattern.test(id)) throw new Error(`Invalid lab resource id: ${id}`);
    if (used.has(id)) throw new Error(`Duplicate lab resource reference: ${id}`);

    const isStyleReference = isStylesheetLink(name, attributes);
    const isScriptReference = name === 'script' && getAttribute(attributes, 'src') !== undefined;
    const hasCompiledType = getAttribute(attributes, 'data-lab-resource-type') !== undefined;
    const isCompiledBlock = (name === 'style' || name === 'script') && hasCompiledType;
    const referenceType: LabResourceType = isStyleReference || name === 'style' ? 'stylesheet' : 'script';
    const resource = resources.get(id);
    if (!resource) throw new Error(`Unknown lab resource reference: ${id}`);

    if (isCompiledBlock) {
      const compiledType = getAttribute(attributes, 'data-lab-resource-type');
      if (compiledType !== resource.type || compiledType !== referenceType) {
        throw new Error(`Resource ${id} has a mismatched inline resource type`);
      }
      const expectedBytes = String(utf8ByteLength(resource.content));
      if (getAttribute(attributes, 'data-lab-resource-bytes') !== expectedBytes) {
        throw new Error(`Resource ${id} has stale inline byte metadata`);
      }
      if (extractCompiledContent(tag) !== resource.content) {
        throw new Error(`Resource ${id} inline content differs from its declaration`);
      }
      if (
        !hasMarkerBefore(source, start, markerStart(id, resource.type))
        || !hasMarkerAfter(source, end, markerEnd(id, resource.type))
      ) {
        throw new Error(`Resource ${id} inline block is missing its canonical markers`);
      }
      used.set(id, resource.type);
      replacements.push(tag);
      continue;
    }

    if (!isStyleReference && !isScriptReference && !(name === 'script' && !extractBody(tag).trim())) {
      throw new Error(`Resource ${id} must be referenced by a stylesheet link or script tag`);
    }
    if (isStyleReference && resource.type !== 'stylesheet') {
      throw new Error(`Resource ${id} is declared as ${resource.type}, not stylesheet`);
    }
    if ((isScriptReference || name === 'script') && resource.type !== 'script') {
      throw new Error(`Resource ${id} is declared as ${resource.type}, not script`);
    }
    used.set(id, resource.type);
    replacements.push(inlineBlock(resource, attributes));
  }

  replacements.push(source.slice(cursor));
  const compiledSource = replacements.join('');
  validateMarkerCounts(compiledSource, used);

  const unresolved = findUnresolvedRuntimeResources(compiledSource);
  if (unresolved.length > 0) {
    const details = unresolved.map((reference) => `${reference.element} ${reference.url || '(empty URL)'}`).join(', ');
    throw new Error(`Unresolved external runtime CSS/JS: ${details}`);
  }

  const result = {
    source: compiledSource,
    changed: compiledSource !== source,
    bytes: utf8ByteLength(compiledSource),
    resources: [...used.keys()],
  };
  if ((options.check || options.checkOnly) && result.changed) {
    throw new Error(`Lab resources are not compiled deterministically: ${result.resources.join(', ') || '(none)'}`);
  }
  return result;
};

export const inlineDeclaredLabResources = compileLabResources;
