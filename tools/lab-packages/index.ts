import { stat } from 'node:fs/promises';
import path from 'node:path';

export type LabIdentity = {
  subject: string;
  slug: string;
};

export type LabPackagePaths = {
  packageDirectory: string;
  packageSourcePath: string;
  contractPath: string;
  publicOutputPath: string;
};

export type ResolvedLabPackage = LabPackagePaths & LabIdentity & {
  sourcePath: string;
  sidecarPath: string | null;
};

const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const assertIdentitySegment = (value: string, label: string) => {
  if (typeof value !== 'string' || !segmentPattern.test(value)) {
    throw new Error(`Lab ${label} must be a lowercase kebab-case identifier: ${String(value)}`);
  }
};

const isFile = async (filePath: string) => {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
};

export const getLabPackagePaths = (
  repositoryRoot: string,
  { subject, slug }: LabIdentity,
): LabPackagePaths => {
  if (typeof repositoryRoot !== 'string' || !repositoryRoot.trim()) {
    throw new Error('Repository root must be a non-empty path');
  }
  assertIdentitySegment(subject, 'subject');
  assertIdentitySegment(slug, 'slug');

  const root = path.resolve(repositoryRoot);
  const sourceRoot = path.join(root, 'labs-src');
  const packageDirectory = path.join(sourceRoot, subject, slug);

  return {
    packageDirectory,
    packageSourcePath: path.join(packageDirectory, 'lab.html'),
    contractPath: path.join(packageDirectory, 'contract.json'),
    publicOutputPath: path.join(root, 'public', 'labs', subject, `${slug}.html`),
  };
};

export const resolveLabPackage = async (
  repositoryRoot: string,
  identity: LabIdentity,
): Promise<ResolvedLabPackage> => {
  const paths = getLabPackagePaths(repositoryRoot, identity);
  const legacySourcePath = path.join(
    path.resolve(repositoryRoot),
    'labs-src',
    identity.subject,
    `${identity.slug}.html`,
  );
  const [hasPackageSource, hasContract, hasLegacySource] = await Promise.all([
    isFile(paths.packageSourcePath),
    isFile(paths.contractPath),
    isFile(legacySourcePath),
  ]);

  if (hasPackageSource && hasLegacySource) {
    throw new Error(
      `Duplicate lab source for ${identity.subject}/${identity.slug}: package and legacy HTML both exist`,
    );
  }
  if (hasContract && !hasPackageSource) {
    throw new Error(
      `Orphan Lab Contract for ${identity.subject}/${identity.slug}: contract.json requires package lab.html`,
    );
  }
  if (!hasPackageSource) {
    throw new Error(
      `Lab package ${identity.subject}/${identity.slug} must contain lab.html`,
    );
  }

  return {
    ...identity,
    ...paths,
    sourcePath: paths.packageSourcePath,
    sidecarPath: hasContract ? paths.contractPath : null,
  };
};
