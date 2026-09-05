export const LAB_CONTRACT_VERSION = 1 as const;
export const LAB_CONTRACT_DEVELOPER_GUIDE = 'https://www.examplicity.org/developer/lab-contract';
export const LAB_CONTRACT_STABLE_ID_PATTERN = '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$';
export const LAB_CONTRACT_START = '<!-- LAB_CONTRACT_START -->';
export const LAB_CONTRACT_END = '<!-- LAB_CONTRACT_END -->';

const stableIdPattern = new RegExp(LAB_CONTRACT_STABLE_ID_PATTERN);
const nonEmptyStringSchema = { type: 'string', minLength: 1, pattern: '\\S' } as const;

export const labContractSchemaV1 = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://www.examplicity.org/developer/lab-contract.schema.json',
  type: 'object',
  additionalProperties: true,
  properties: {
    schemaVersion: { type: 'integer', const: LAB_CONTRACT_VERSION },
    relationship: nonEmptyStringSchema,
    learnerLoop: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: nonEmptyStringSchema,
        modelChange: nonEmptyStringSchema,
        evidence: nonEmptyStringSchema,
        nextDecision: nonEmptyStringSchema,
      },
      required: ['action', 'modelChange', 'evidence', 'nextDecision'],
    },
    invariants: { type: 'array', minItems: 1, uniqueItems: true, items: nonEmptyStringSchema },
    safeAdaptations: { type: 'array', minItems: 1, uniqueItems: true, items: nonEmptyStringSchema },
    nonGoals: { type: 'array', minItems: 1, uniqueItems: true, items: nonEmptyStringSchema },
    developerGuide: {
      type: 'string',
      minLength: 1,
      format: 'uri',
      const: LAB_CONTRACT_DEVELOPER_GUIDE,
    },
    curriculum: {
      type: 'object',
      additionalProperties: false,
      properties: {
        features: {
          type: 'object',
          minProperties: 1,
          propertyNames: { pattern: LAB_CONTRACT_STABLE_ID_PATTERN },
          patternProperties: {
            [LAB_CONTRACT_STABLE_ID_PATTERN]: {
              type: 'object',
              additionalProperties: false,
              properties: {
                description: nonEmptyStringSchema,
                alignment: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      profile: { type: 'string', minLength: 1, pattern: LAB_CONTRACT_STABLE_ID_PATTERN },
                      sections: {
                        type: 'array',
                        minItems: 1,
                        uniqueItems: true,
                        items: nonEmptyStringSchema,
                      },
                    },
                    required: ['profile', 'sections'],
                  },
                },
              },
              required: ['description'],
            },
          },
          additionalProperties: false,
        },
        profiles: {
          type: 'object',
          minProperties: 1,
          propertyNames: { pattern: LAB_CONTRACT_STABLE_ID_PATTERN },
          patternProperties: {
            [LAB_CONTRACT_STABLE_ID_PATTERN]: {
              type: 'object',
              additionalProperties: false,
              properties: {
                label: nonEmptyStringSchema,
                alignment: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      syllabus: nonEmptyStringSchema,
                      qualification: nonEmptyStringSchema,
                      sections: {
                        type: 'array',
                        minItems: 1,
                        uniqueItems: true,
                        items: nonEmptyStringSchema,
                      },
                      variant: nonEmptyStringSchema,
                    },
                    required: ['syllabus', 'qualification', 'sections'],
                  },
                },
                enabledFeatures: {
                  type: 'array',
                  minItems: 1,
                  uniqueItems: true,
                  items: { type: 'string', minLength: 1, pattern: LAB_CONTRACT_STABLE_ID_PATTERN },
                },
                parameters: { type: 'object', additionalProperties: true },
              },
              required: ['label', 'alignment', 'enabledFeatures', 'parameters'],
            },
          },
          additionalProperties: false,
        },
      },
      required: ['features', 'profiles'],
    },
  },
  required: ['schemaVersion', 'relationship', 'learnerLoop'],
} as const;

export type LabContractLearnerLoop = {
  action: string;
  modelChange: string;
  evidence: string;
  nextDecision: string;
};

export type LabContractFeature = {
  description: string;
  alignment?: Array<{ profile: string; sections: string[] }>;
};

export type LabContractProfile = {
  label: string;
  alignment: Array<{
    syllabus: string;
    qualification: string;
    sections: string[];
    variant?: string;
  }>;
  enabledFeatures: string[];
  parameters: Record<string, unknown>;
};

export type LabContractV1 = {
  schemaVersion: typeof LAB_CONTRACT_VERSION;
  relationship: string;
  learnerLoop: LabContractLearnerLoop;
  invariants?: string[];
  safeAdaptations?: string[];
  nonGoals?: string[];
  developerGuide?: typeof LAB_CONTRACT_DEVELOPER_GUIDE;
  curriculum?: {
    features: Record<string, LabContractFeature>;
    profiles: Record<string, LabContractProfile>;
  };
  [key: string]: unknown;
};

type JsonRecord = Record<string, unknown>;

const fail = (label: string, message: string): never => {
  throw new Error(`${label}: ${message}`);
};

const asRecord = (value: unknown, label: string): JsonRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label, 'must be an object');
  return value as JsonRecord;
};

const requireOnlyKeys = (
  value: JsonRecord,
  label: string,
  required: readonly string[],
  optional: readonly string[] = [],
) => {
  for (const key of required) if (!(key in value)) fail(label, `is missing ${key}`);
  const allowed = new Set([...required, ...optional]);
  const extra = Object.keys(value).filter((key) => !allowed.has(key));
  if (extra.length) fail(label, `has unsupported fields: ${extra.join(', ')}`);
};

const validateString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !value.trim()) fail(label, 'must be a non-empty string');
  return value as string;
};

const validateStringArray = (
  value: unknown,
  label: string,
  { stableIds = false }: { stableIds?: boolean } = {},
): string[] => {
  if (!Array.isArray(value) || value.length === 0) fail(label, 'must be a non-empty array');
  const strings = (value as unknown[])
    .map((item: unknown, index: number) => validateString(item, `${label}[${index}]`));
  if (new Set(strings).size !== strings.length) fail(label, 'must not contain duplicates');
  if (stableIds) {
    const invalid = strings.find((item) => !stableIdPattern.test(item));
    if (invalid) fail(label, `contains invalid stable ID "${invalid}"`);
  }
  return strings;
};

const validateCurriculum = (value: unknown, label: string) => {
  const curriculum = asRecord(value, label);
  requireOnlyKeys(curriculum, label, ['features', 'profiles']);
  const features = asRecord(curriculum.features, `${label}.features`);
  const profiles = asRecord(curriculum.profiles, `${label}.profiles`);
  const featureEntries = Object.entries(features);
  const profileEntries = Object.entries(profiles);
  if (!featureEntries.length) fail(`${label}.features`, 'must not be empty');
  if (!profileEntries.length) fail(`${label}.profiles`, 'must not be empty');

  for (const [featureId, rawFeature] of featureEntries) {
    if (!stableIdPattern.test(featureId)) fail(`${label}.features`, `has invalid stable ID "${featureId}"`);
    const feature = asRecord(rawFeature, `${label}.features.${featureId}`);
    requireOnlyKeys(feature, `${label}.features.${featureId}`, ['description'], ['alignment']);
    validateString(feature.description, `${label}.features.${featureId}.description`);
    if (feature.alignment !== undefined) {
      if (!Array.isArray(feature.alignment) || !feature.alignment.length) {
        fail(`${label}.features.${featureId}.alignment`, 'must be a non-empty array');
      }
      (feature.alignment as unknown[]).forEach((rawAlignment: unknown, index: number) => {
        const alignmentLabel = `${label}.features.${featureId}.alignment[${index}]`;
        const alignment = asRecord(rawAlignment, alignmentLabel);
        requireOnlyKeys(alignment, alignmentLabel, ['profile', 'sections']);
        const profile = validateString(alignment.profile, `${alignmentLabel}.profile`);
        if (!stableIdPattern.test(profile)) fail(`${alignmentLabel}.profile`, 'must be a stable ID');
        validateStringArray(alignment.sections, `${alignmentLabel}.sections`);
      });
    }
  }

  const profileIds = new Set(profileEntries.map(([profileId]) => profileId));
  for (const [profileId, rawProfile] of profileEntries) {
    if (!stableIdPattern.test(profileId)) fail(`${label}.profiles`, `has invalid stable ID "${profileId}"`);
    const profileLabel = `${label}.profiles.${profileId}`;
    const profile = asRecord(rawProfile, profileLabel);
    requireOnlyKeys(profile, profileLabel, ['label', 'alignment', 'enabledFeatures', 'parameters']);
    validateString(profile.label, `${profileLabel}.label`);
    if (!Array.isArray(profile.alignment) || !profile.alignment.length) {
      fail(`${profileLabel}.alignment`, 'must be a non-empty array');
    }
    (profile.alignment as unknown[]).forEach((rawAlignment: unknown, index: number) => {
      const alignmentLabel = `${profileLabel}.alignment[${index}]`;
      const alignment = asRecord(rawAlignment, alignmentLabel);
      requireOnlyKeys(alignment, alignmentLabel, ['syllabus', 'qualification', 'sections'], ['variant']);
      validateString(alignment.syllabus, `${alignmentLabel}.syllabus`);
      validateString(alignment.qualification, `${alignmentLabel}.qualification`);
      validateStringArray(alignment.sections, `${alignmentLabel}.sections`);
      if (alignment.variant !== undefined) validateString(alignment.variant, `${alignmentLabel}.variant`);
    });
    const enabledFeatures = validateStringArray(
      profile.enabledFeatures,
      `${profileLabel}.enabledFeatures`,
      { stableIds: true },
    );
    for (const featureId of enabledFeatures) {
      if (!(featureId in features)) fail(`${profileLabel}.enabledFeatures`, `references unknown feature "${featureId}"`);
    }
    asRecord(profile.parameters, `${profileLabel}.parameters`);
  }

  for (const [featureId, rawFeature] of featureEntries) {
    const feature = rawFeature as JsonRecord;
    for (const rawAlignment of (feature.alignment as unknown[] | undefined) ?? []) {
      const profile = (rawAlignment as JsonRecord).profile as string;
      if (!profileIds.has(profile)) {
        fail(`${label}.features.${featureId}.alignment`, `references unknown profile "${profile}"`);
      }
    }
  }
};

export const validateLabContractV1 = (value: unknown, label = 'Lab Contract'): LabContractV1 => {
  const contract = asRecord(value, label);
  if (contract.schemaVersion !== LAB_CONTRACT_VERSION) {
    fail(label, `schemaVersion must be ${LAB_CONTRACT_VERSION}`);
  }
  validateString(contract.relationship, `${label}.relationship`);
  const learnerLoop = asRecord(contract.learnerLoop, `${label}.learnerLoop`);
  requireOnlyKeys(
    learnerLoop,
    `${label}.learnerLoop`,
    ['action', 'modelChange', 'evidence', 'nextDecision'],
  );
  for (const key of ['action', 'modelChange', 'evidence', 'nextDecision']) {
    validateString(learnerLoop[key], `${label}.learnerLoop.${key}`);
  }
  for (const key of ['invariants', 'safeAdaptations', 'nonGoals']) {
    if (contract[key] !== undefined) validateStringArray(contract[key], `${label}.${key}`);
  }
  if (contract.developerGuide !== undefined && contract.developerGuide !== LAB_CONTRACT_DEVELOPER_GUIDE) {
    fail(label, `developerGuide must be ${LAB_CONTRACT_DEVELOPER_GUIDE}`);
  }
  if (contract.curriculum !== undefined) validateCurriculum(contract.curriculum, `${label}.curriculum`);
  return contract as LabContractV1;
};

export const parseLabContractV1 = (source: string, label = 'Lab Contract'): LabContractV1 => {
  if (typeof source !== 'string') fail(label, 'source must be a string');
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    fail(label, `is not valid JSON: ${(error as Error).message}`);
  }
  return validateLabContractV1(value, label);
};

const contractScriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const markerPattern = /(?:^|\s)data-examplicity-lab-contract(?=\s|=|$)/i;

const attributeValue = (attributes: string, name: string) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(
    `(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\u0060]+))`,
    'ig',
  );
  const matches = [...attributes.matchAll(expression)];
  if (matches.length > 1) fail('Embedded Lab Contract', `has duplicate ${name} attributes`);
  return matches[0]?.[1] ?? matches[0]?.[2] ?? matches[0]?.[3];
};

export type EmbeddedLabContract = {
  contract: LabContractV1;
  source: string;
  start: number;
  end: number;
};

export const findEmbeddedLabContracts = (html: string): EmbeddedLabContract[] => {
  if (typeof html !== 'string') fail('Lab HTML', 'must be a string');
  const contracts: EmbeddedLabContract[] = [];
  for (const match of html.matchAll(contractScriptPattern)) {
    if (!markerPattern.test(match[1])) continue;
    if (attributeValue(match[1], 'type')?.toLowerCase() !== 'application/json') {
      fail('Embedded Lab Contract', 'must use type="application/json"');
    }
    if (attributeValue(match[1], 'data-contract-version') !== String(LAB_CONTRACT_VERSION)) {
      fail('Embedded Lab Contract', `must use data-contract-version="${LAB_CONTRACT_VERSION}"`);
    }
    const start = match.index ?? 0;
    contracts.push({
      contract: parseLabContractV1(match[2], 'Embedded Lab Contract'),
      source: match[0],
      start,
      end: start + match[0].length,
    });
  }
  return contracts;
};

export const extractEmbeddedLabContract = (html: string): LabContractV1 | null => {
  const contracts = findEmbeddedLabContracts(html);
  if (contracts.length > 1) fail('Lab HTML', `must contain at most one embedded Lab Contract; found ${contracts.length}`);
  return contracts[0]?.contract ?? null;
};

export const assertNoEmbeddedLabContract = (html: string) => {
  const contracts = findEmbeddedLabContracts(html);
  if (contracts.length) {
    fail('Authored lab.html', 'must not embed a Lab Contract when a .lab.json sidecar is the source');
  }
};

export const serializeLabContractV1 = (contract: unknown) => (
  JSON.stringify(validateLabContractV1(contract), null, 2).replaceAll('<', '\\u003c')
);

export const renderEmbeddedLabContract = (contract: unknown) => (
  `${LAB_CONTRACT_START}\n`
  + `<script type="application/json" data-examplicity-lab-contract data-contract-version="${LAB_CONTRACT_VERSION}">\n`
  + `${serializeLabContractV1(contract)}\n`
  + `</script>\n${LAB_CONTRACT_END}`
);

export const injectLabContract = (html: string, contract: unknown) => {
  assertNoEmbeddedLabContract(html);
  const closingHead = html.toLowerCase().lastIndexOf('</head>');
  if (closingHead < 0) fail('Authored lab.html', 'has no closing head tag');
  const before = html.slice(0, closingHead);
  const separator = before.endsWith('\n') ? '' : '\n';
  return `${before}${separator}${renderEmbeddedLabContract(contract)}\n${html.slice(closingHead)}`;
};

export type LabHookInspection = {
  roles: string[];
  actions: string[];
  manipulatives: string[];
  features: string[];
};

export const inspectLabHooks = (html: string): LabHookInspection => {
  if (typeof html !== 'string') fail('Lab HTML', 'must be a string');
  const markup = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const attributes = [...markup.matchAll(/<[a-z][a-z0-9:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)]
    .flatMap(([tag]) => [...tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]);
  const values = (name: string) => attributes
    .filter((match) => match[1].toLowerCase() === name)
    .map((match) => match[2] ?? match[3] ?? match[4] ?? '');
  const inspection = {
    roles: values('data-lab-role'),
    actions: values('data-lab-action'),
    manipulatives: values('data-lab-manipulative'),
    features: values('data-lab-feature'),
  };
  const invalidRole = inspection.roles.find((value) => !['model', 'working', 'evidence'].includes(value));
  if (invalidRole) fail('Lab HTML', `data-lab-role has unsupported value "${invalidRole}"`);
  const invalidAction = inspection.actions.find((value) => value !== 'reset');
  if (invalidAction) fail('Lab HTML', `data-lab-action has unsupported value "${invalidAction}"`);
  for (const [name, values] of [
    ['data-lab-manipulative', inspection.manipulatives],
    ['data-lab-feature', inspection.features],
  ] as const) {
    const invalid = values.find((value) => !stableIdPattern.test(value));
    if (invalid) fail('Lab HTML', `${name} has invalid stable ID "${invalid}"`);
  }
  return inspection;
};
