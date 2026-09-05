import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { applyLabManifestContent } from '../../app/lab-content.ts';
import { createStandaloneLabHtml } from '../../app/lab-download.ts';
import { labs, type Lab } from '../../app/labs.ts';
import {
  assertNoEmbeddedLabContract,
  extractEmbeddedLabContract,
  injectLabContract,
  inspectLabHooks,
  parseLabContractV1,
  serializeLabContractV1,
  type LabContractV1,
  type LabHookInspection,
} from '../lab-contract/index.ts';
import { compileLabResources, findUnresolvedRuntimeResources, type DeclaredLabResource } from '../lab-compiler/index.ts';
import { resolveLabPackage, type ResolvedLabPackage } from '../lab-packages/index.ts';

export const LAB_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FRAME_START = '<!-- LAB_FRAME_STYLES_START -->';
const FRAME_END = '<!-- LAB_FRAME_STYLES_END -->';
const PROFILE_ROOT = 'tools/lab-publication-profile';
const VENDOR_ROOT = 'vendor';

type PublicationManifestResource = {
  id: string;
  type: 'stylesheet' | 'script';
  path: string;
  sha256: string;
};

export type PublicationManifestEntry = {
  subject: string;
  slug: string;
  syllabuses: unknown;
};

type PublicationManifest = {
  schemaVersion: number;
  publicationProfile: {
    name: string;
    version: string;
    manifestPath: string;
    manifestSha256: string;
  };
  kit: {
    name: string;
    version: string;
    vendorDirectory: string;
    resources: PublicationManifestResource[];
  };
  labs: PublicationManifestEntry[];
};

type ReleaseFile = {
  path: string;
  bytes: number;
  sha256: string;
};

type ReleaseManifest = {
  schemaVersion: number;
  name: string;
  version: string;
  canonicalPath: string;
  files: ReleaseFile[];
};

type VendorManifest = {
  schemaVersion: number;
  name: string;
  version: string;
  resources?: Array<PublicationManifestResource & { bytes: number }>;
};

export type PublicationContext = {
  root: string;
  manifest: PublicationManifest;
  profileManifest: ReleaseManifest;
  profile: Record<string, unknown>;
  kit: {
    name: string;
    version: string;
    vendorDirectory: string;
    resources: DeclaredLabResource[];
  };
  frame: {
    styles: string;
    embedded: string;
    pattern: RegExp;
  };
};

export type ResolvedPublicationLab = {
  entry: PublicationManifestEntry;
  lab: Lab;
};

export type CompiledPublicationLab = ResolvedPublicationLab & {
  package: ResolvedLabPackage;
  source: string;
  contract: LabContractV1 | null;
  hooks: LabHookInspection;
  compilableSource: string;
  compiledSource: string;
  output: string;
  standalone: string;
  relativePath: string;
};

export type PublicationValidation = CompiledPublicationLab & {
  currentOutput: string | null;
  stale: boolean;
  checks: {
    sourceCompiles: boolean;
    outputHasNoUnresolvedRuntimeResources: boolean;
    standaloneHasNoUnresolvedRuntimeResources: boolean;
    standalonePackages: boolean;
    contractPreserved: boolean;
  };
  ok: boolean;
};

export class LabPublicationUsageError extends Error {
  readonly exitCode = 2;

  constructor(message: string) {
    super(message);
    this.name = 'LabPublicationUsageError';
  }
}

const sha256 = (content: string | Uint8Array) => createHash('sha256').update(content).digest('hex');

const pathIsInside = (parent: string, child: string) => {
  const relative = path.relative(parent, child);
  return relative !== ''
    && relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
};

const readJson = async <T>(filePath: string): Promise<T> => (
  JSON.parse(await readFile(filePath, 'utf8')) as T
);

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
}

function assertReleaseFile(entry: ReleaseFile | undefined, label: string): asserts entry is ReleaseFile {
  if (!entry || typeof entry.path !== 'string' || !Number.isInteger(entry.bytes) || typeof entry.sha256 !== 'string') {
    throw new Error(`${label} has no valid canonical file entry.`);
  }
}

const assertPublicationManifest = (manifest: PublicationManifest) => {
  if (!manifest || manifest.schemaVersion !== 1) throw new Error('Unsupported lab publication manifest schema.');
  if (!manifest.publicationProfile || !manifest.kit || !Array.isArray(manifest.labs)) {
    throw new Error('Lab publication manifest is incomplete.');
  }
  assertString(manifest.publicationProfile.name, 'Publication profile name');
  assertString(manifest.publicationProfile.version, 'Publication profile version');
  assertString(manifest.publicationProfile.manifestPath, 'Publication profile manifest path');
  assertString(manifest.publicationProfile.manifestSha256, 'Publication profile manifest hash');
  assertString(manifest.kit.name, 'Lab kit name');
  assertString(manifest.kit.version, 'Lab kit version');
  assertString(manifest.kit.vendorDirectory, 'Lab kit vendor directory');
  if (!Array.isArray(manifest.kit.resources) || manifest.kit.resources.length === 0) {
    throw new Error('Lab publication manifest has no pinned kit resources.');
  }
  const resourceIds = new Set<string>();
  for (const resource of manifest.kit.resources) {
    assertString(resource.id, 'Lab kit resource ID');
    assertString(resource.path, `Lab kit resource ${resource.id} path`);
    assertString(resource.sha256, `Lab kit resource ${resource.id} hash`);
    if (resource.type !== 'stylesheet' && resource.type !== 'script') {
      throw new Error(`Lab kit resource ${resource.id} has an unsupported type.`);
    }
    if (resourceIds.has(resource.id)) throw new Error(`Duplicate lab kit resource: ${resource.id}`);
    resourceIds.add(resource.id);
  }
};

const assertReleaseManifest = (manifest: ReleaseManifest, label: string) => {
  if (!manifest || manifest.schemaVersion !== 1) throw new Error(`${label} has an unsupported schema.`);
  assertString(manifest.name, `${label} name`);
  assertString(manifest.version, `${label} version`);
  assertString(manifest.canonicalPath, `${label} canonical path`);
  if (!Array.isArray(manifest.files)) throw new Error(`${label} has no file list.`);
};

const assertVendorManifest = (manifest: VendorManifest, label: string) => {
  if (!manifest || manifest.schemaVersion !== 1) throw new Error(`${label} has an unsupported schema.`);
  assertString(manifest.name, `${label} name`);
  assertString(manifest.version, `${label} version`);
  if (!Array.isArray(manifest.resources)) throw new Error(`${label} has no resource list.`);
};

const assertFrame = (styles: string) => {
  if (!styles) throw new Error('Lab frame stylesheet is empty.');
  const escapedStart = FRAME_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = FRAME_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    embedded: `${FRAME_START}\n<style data-lab-frame>\n${styles}\n</style>\n${FRAME_END}`,
    pattern: new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`),
  };
};

export const isSafeLabSlug = (slug: unknown): slug is string => (
  typeof slug === 'string' && LAB_SLUG_PATTERN.test(slug)
);

export const loadPublicationContext = async (repositoryRoot: string): Promise<PublicationContext> => {
  if (typeof repositoryRoot !== 'string' || !repositoryRoot.trim()) {
    throw new Error('Repository root must be a non-empty path.');
  }

  const root = path.resolve(repositoryRoot);
  const sourceRoot = path.join(root, 'labs-src');
  const manifest = await readJson<PublicationManifest>(path.join(sourceRoot, 'manifest.json'));
  assertPublicationManifest(manifest);

  const profileRoot = path.join(root, PROFILE_ROOT);
  const profileManifestPath = path.resolve(root, manifest.publicationProfile.manifestPath);
  if (!pathIsInside(profileRoot, profileManifestPath)) {
    throw new Error('Publication profile manifest must resolve inside tools/lab-publication-profile/.');
  }
  const profileManifestContent = await readFile(profileManifestPath);
  if (sha256(profileManifestContent) !== manifest.publicationProfile.manifestSha256) {
    throw new Error('Pinned publication profile manifest hash mismatch.');
  }

  const profileManifest = JSON.parse(profileManifestContent.toString('utf8')) as ReleaseManifest;
  assertReleaseManifest(profileManifest, 'Publication profile manifest');
  if (
    profileManifest.name !== manifest.publicationProfile.name
    || profileManifest.version !== manifest.publicationProfile.version
  ) {
    throw new Error('Publication profile manifest does not match the pinned release.');
  }

  const profileEntry = profileManifest.files.find((entry) => entry.path === 'profile.json');
  const profilePath = path.resolve(root, profileManifest.canonicalPath);
  if (!pathIsInside(profileRoot, profilePath)) {
    throw new Error('Publication profile release has no canonical profile.json.');
  }
  assertReleaseFile(profileEntry, 'Publication profile release');
  const profileContent = await readFile(profilePath);
  if (
    profileEntry.bytes !== profileContent.byteLength
    || profileEntry.sha256 !== sha256(profileContent)
  ) {
    throw new Error('Publication profile does not match its release manifest.');
  }
  const profile = JSON.parse(profileContent.toString('utf8')) as Record<string, unknown>;
  if (profile.name !== profileManifest.name || profile.version !== profileManifest.version) {
    throw new Error('Publication profile content does not match its release manifest.');
  }

  const vendorRoot = path.resolve(root, manifest.kit.vendorDirectory);
  if (!pathIsInside(path.join(root, VENDOR_ROOT), vendorRoot)) {
    throw new Error('Kit vendor directory must resolve inside vendor/.');
  }
  const vendorManifest = await readJson<VendorManifest>(path.join(vendorRoot, 'manifest.json'));
  assertVendorManifest(vendorManifest, 'Vendored kit manifest');
  if (
    vendorManifest.name !== manifest.kit.name
    || vendorManifest.version !== manifest.kit.version
  ) {
    throw new Error('Vendored kit manifest does not match the pinned publication release.');
  }

  const resources: DeclaredLabResource[] = [];
  for (const resource of manifest.kit.resources) {
    const filePath = path.resolve(vendorRoot, resource.path);
    if (!pathIsInside(vendorRoot, filePath)) {
      throw new Error(`Resource ${resource.id} resolves outside the pinned kit release.`);
    }
    const content = await readFile(filePath, 'utf8');
    const actualHash = sha256(content);
    if (actualHash !== resource.sha256) {
      throw new Error(`Resource ${resource.id} hash mismatch: expected ${resource.sha256}, received ${actualHash}.`);
    }
    const vendored = vendorManifest.resources?.find((candidate) => candidate.id === resource.id);
    if (
      !vendored
      || vendored.type !== resource.type
      || vendored.path !== resource.path
      || vendored.sha256 !== resource.sha256
      || vendored.bytes !== Buffer.byteLength(content, 'utf8')
    ) {
      throw new Error(`Resource ${resource.id} does not match the vendored release manifest.`);
    }
    resources.push({ id: resource.id, type: resource.type, content });
  }

  const frameStyles = (await readFile(path.join(root, 'public', 'labs', 'lab-frame.css'), 'utf8')).trim();
  const frame = assertFrame(frameStyles);

  return {
    root,
    manifest,
    profileManifest,
    profile,
    kit: {
      name: manifest.kit.name,
      version: manifest.kit.version,
      vendorDirectory: manifest.kit.vendorDirectory,
      resources,
    },
    frame: { styles: frameStyles, ...frame },
  };
};

export const resolvePublicationLab = (
  context: PublicationContext,
  slug: string,
): ResolvedPublicationLab => {
  if (!isSafeLabSlug(slug)) {
    throw new LabPublicationUsageError(`Unsafe lab slug: ${String(slug)}`);
  }
  const entries = context.manifest.labs.filter((entry) => entry.slug === slug);
  if (entries.length !== 1) {
    throw new LabPublicationUsageError(`Unknown or ambiguous lab slug: ${slug}`);
  }
  const entry = entries[0];
  const lab = labs.find((candidate) => candidate.subject === entry.subject && candidate.slug === entry.slug);
  if (!lab) throw new Error(`Unknown publication lab: ${entry.subject}/${entry.slug}.`);
  if (!Array.isArray(entry.syllabuses) || JSON.stringify(entry.syllabuses) !== JSON.stringify(lab.syllabuses)) {
    throw new Error(`Curriculum mapping mismatch for ${entry.subject}/${entry.slug}.`);
  }
  return { entry, lab };
};

const resolveTarget = (
  context: PublicationContext,
  target: string | PublicationManifestEntry,
) => typeof target === 'string' ? resolvePublicationLab(context, target) : resolvePublicationLab(context, target.slug);

const countMarker = (source: string, marker: string) => source.split(marker).length - 1;

export const validateLabCurriculum = (contract: LabContractV1, lab: Lab, hooks: LabHookInspection) => {
  const curriculum = contract.curriculum;
  for (const feature of hooks.features) {
    if (!curriculum?.features[feature]) throw new Error(`${lab.slug}: unknown curriculum feature ${feature}`);
  }
  for (const [id, profile] of Object.entries(curriculum?.profiles ?? {})) {
    for (const alignment of profile.alignment) {
      const registered = lab.syllabuses.find((item) => item.code === alignment.syllabus
        && (item.qualification === alignment.qualification
          || (item.qualification === 'AS/A' && ['AS', 'A'].includes(alignment.qualification))));
      if (!registered || alignment.sections.some((section) => !registered.sections.some((item) => item.id === section))) {
        throw new Error(`${lab.slug}: curriculum profile ${id} references unregistered syllabus, qualification or sections`);
      }
    }
  }
  for (const [id, feature] of Object.entries(curriculum?.features ?? {})) {
    for (const alignment of feature.alignment ?? []) {
      const profile = curriculum!.profiles[alignment.profile];
      if (alignment.sections.some((section) => !profile.alignment.some((item) => item.sections.includes(section)))) {
        throw new Error(`${lab.slug}: feature ${id} references sections outside profile ${alignment.profile}`);
      }
    }
  }
};

const inspectContractHooks = (source: string, label: string) => {
  const hooks = inspectLabHooks(source);
  if (
    hooks.roles.length
    + hooks.actions.length
    + hooks.manipulatives.length
    + hooks.features.length === 0
  ) {
    throw new Error(`${label} has a contract but no semantic data-lab-* locators`);
  }
  return hooks;
};

export const compilePublicationLab = async (
  context: PublicationContext,
  target: string | PublicationManifestEntry,
  { check = false }: { check?: boolean } = {},
): Promise<CompiledPublicationLab> => {
  const resolved = resolveTarget(context, target);
  const labPackage = await resolveLabPackage(context.root, resolved.entry);
  if (!labPackage.sidecarPath) {
    throw new Error(`${resolved.entry.subject}/${resolved.entry.slug}: required .lab.json sidecar is missing`);
  }
  const source = await readFile(labPackage.sourcePath, 'utf8');
  assertNoEmbeddedLabContract(source);

  const hooks = inspectLabHooks(source);
  let contract: LabContractV1 | null = null;
  let compilableSource = source;
  if (labPackage.sidecarPath) {
    contract = parseLabContractV1(
      await readFile(labPackage.sidecarPath, 'utf8'),
      labPackage.sidecarPath,
    );
    inspectContractHooks(source, `${resolved.entry.subject}/${resolved.entry.slug}`);
    validateLabCurriculum(contract, resolved.lab, hooks);
    compilableSource = injectLabContract(source, contract);
  }

  const compiledSource = compileLabResources(compilableSource, context.kit.resources).source;
  if (check) compileLabResources(compiledSource, context.kit.resources, { check: true });

  const withManifest = applyLabManifestContent(compiledSource, resolved.lab);
  const frameStartCount = countMarker(withManifest, FRAME_START);
  const frameEndCount = countMarker(withManifest, FRAME_END);
  if (frameStartCount !== 1 || frameEndCount !== 1) {
    throw new Error(`${resolved.entry.subject}/${resolved.entry.slug} must contain exactly one marked lab frame.`);
  }
  const output = withManifest.replace(context.frame.pattern, context.frame.embedded);
  const relativePath = path.join(resolved.entry.subject, `${resolved.entry.slug}.html`);
  const unresolvedOutput = findUnresolvedRuntimeResources(output);
  if (unresolvedOutput.length > 0) {
    const details = unresolvedOutput.map((reference) => `${reference.element} ${reference.url || '(empty URL)'}`).join(', ');
    throw new Error(`${relativePath} has unresolved external runtime CSS/JS: ${details}`);
  }
  const standalone = createStandaloneLabHtml({
    source: output,
    lab: resolved.lab,
  });

  return {
    ...resolved,
    package: labPackage,
    source,
    contract,
    hooks,
    compilableSource,
    compiledSource,
    output,
    standalone,
    relativePath,
  };
};

const contractsMatch = (expected: string, actual: LabContractV1 | null, contract: LabContractV1 | null) => {
  if (!contract) return actual === null;
  return actual !== null
    && serializeLabContractV1(actual) === serializeLabContractV1(contract)
    && serializeLabContractV1(extractEmbeddedLabContract(expected)) === serializeLabContractV1(contract);
};

export const validatePublicationLab = async (
  context: PublicationContext,
  target: string | PublicationManifestEntry,
): Promise<PublicationValidation> => {
  const compiled = await compilePublicationLab(context, target, { check: true });
  let currentOutput: string | null = null;
  try {
    currentOutput = await readFile(compiled.package.publicOutputPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const outputHasNoUnresolvedRuntimeResources = findUnresolvedRuntimeResources(compiled.output).length === 0;
  const standaloneHasNoUnresolvedRuntimeResources = findUnresolvedRuntimeResources(compiled.standalone).length === 0;
  const standalonePackages = compiled.standalone.length > compiled.output.length
    && compiled.standalone.includes('data-examplicity-download-chrome');
  const outputContract = extractEmbeddedLabContract(compiled.output);
  const standaloneContract = extractEmbeddedLabContract(compiled.standalone);
  const currentContract = currentOutput === null ? null : extractEmbeddedLabContract(currentOutput);
  const contractPreserved = currentOutput !== null
    && contractsMatch(compiled.output, outputContract, compiled.contract)
    && contractsMatch(compiled.standalone, standaloneContract, compiled.contract)
    && contractsMatch(currentOutput, currentContract, compiled.contract);

  const stale = currentOutput !== compiled.output;
  const checks = {
    sourceCompiles: true,
    outputHasNoUnresolvedRuntimeResources,
    standaloneHasNoUnresolvedRuntimeResources,
    standalonePackages,
    contractPreserved,
  };
  const ok = !stale && Object.values(checks).every(Boolean);

  return {
    ...compiled,
    currentOutput,
    stale,
    checks,
    ok,
  };
};

export const writePublicationLab = async (compiled: CompiledPublicationLab) => {
  await mkdir(path.dirname(compiled.package.publicOutputPath), { recursive: true });
  await writeFile(compiled.package.publicOutputPath, compiled.output, 'utf8');
  return compiled.package.publicOutputPath;
};

export const buildPublicationLab = async (
  context: PublicationContext,
  target: string | PublicationManifestEntry,
) => {
  const compiled = await compilePublicationLab(context, target, { check: true });
  await writePublicationLab(compiled);
  return compiled;
};

// Short aliases keep the publication surface convenient for repository scripts.
export const createPublicationContext = loadPublicationContext;
export const compileLab = compilePublicationLab;
export const validateLab = validatePublicationLab;
