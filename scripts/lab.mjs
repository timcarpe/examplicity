import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPublicationLab,
  isSafeLabSlug,
  loadPublicationContext,
  validatePublicationLab,
} from '../tools/lab-publication/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const usage = [
  'Usage:',
  '  npm run lab -- inspect <slug>',
  '  npm run lab -- validate <slug>',
  '  npm run lab -- build <slug>',
  '  npm run lab -- case <slug> <case>  (unavailable)',
].join('\n');

class CliUsageError extends Error {
  exitCode = 2;

  constructor(message) {
    super(message);
    this.name = 'CliUsageError';
  }
}

const failUsage = (message) => {
  throw new CliUsageError(`${message}\n\n${usage}`);
};

const list = (values) => values.length > 0 ? values.join(', ') : 'none';
const displayPath = (filePath) => path.relative(root, filePath).split(path.sep).join('/');

const printInspection = (result) => {
  const { lab, package: labPackage, contract, hooks, checks, stale } = result;
  console.log(lab.title);
  console.log(`Slug: ${lab.slug}`);
  console.log(`Subject: ${lab.subject}`);
  console.log(`Kind: ${lab.kind}`);
  console.log(`Topic: ${lab.topic}`);
  console.log(`Format: ${lab.format}`);
  console.log(`Source: ${displayPath(labPackage.sourcePath)}`);
  console.log(`Output: ${displayPath(labPackage.publicOutputPath)}`);
  if (contract) {
    console.log('Contract: v1');
    console.log(`Relationship: ${contract.relationship}`);
    console.log('Learner loop:');
    console.log(`Action: ${contract.learnerLoop.action}`);
    console.log(`Model change: ${contract.learnerLoop.modelChange}`);
    console.log(`Evidence: ${contract.learnerLoop.evidence}`);
    console.log(`Next decision: ${contract.learnerLoop.nextDecision}`);
    console.log(`Features: ${list(Object.keys(contract.curriculum?.features ?? {}))}`);
    console.log(`Curriculum profiles: ${list(Object.keys(contract.curriculum?.profiles ?? {}))}`);
  } else {
    console.log('Contract: none');
  }
  console.log(`Hooks: roles=${list(hooks.roles)}; actions=${list(hooks.actions)}; manipulatives=${list(hooks.manipulatives)}; features=${list(hooks.features)}`);
  console.log(`Validation: ${result.ok ? 'pass' : 'fail'}`);
  if (stale) console.log('  public output: stale');
  console.log(`  standalone: ${checks.standalonePackages ? 'pass' : 'fail'}`);
  console.log(`  runtime resources: ${checks.outputHasNoUnresolvedRuntimeResources && checks.standaloneHasNoUnresolvedRuntimeResources ? 'none unresolved' : 'unresolved'}`);
  console.log(`  contract preservation: ${checks.contractPreserved ? 'pass' : 'fail'}`);
};

const printValidation = (result) => {
  console.log(`${result.lab.slug}: ${result.ok ? 'validation passed' : 'validation failed'}`);
  console.log(`Output: ${result.stale ? 'stale' : 'current'} (${displayPath(result.package.publicOutputPath)})`);
  console.log(`Standalone packaging: ${result.checks.standalonePackages ? 'pass' : 'fail'}`);
  console.log(`Runtime resources: ${result.checks.outputHasNoUnresolvedRuntimeResources && result.checks.standaloneHasNoUnresolvedRuntimeResources ? 'none unresolved' : 'unresolved'}`);
  console.log(`Contract preservation: ${result.checks.contractPreserved ? 'pass' : 'fail'}`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command) failUsage('A command is required.');
  if (command === 'case') {
    throw new CliUsageError('The case command is unavailable until a runtime facade and named cases exist.');
  }
  if (!['inspect', 'validate', 'build'].includes(command) || args.length !== 2) {
    failUsage(`Unknown command or arguments: ${args.join(' ')}`);
  }

  const slug = args[1];
  if (!isSafeLabSlug(slug)) failUsage(`Unsafe lab slug: ${slug}`);
  const context = await loadPublicationContext(root);

  if (command === 'build') {
    const result = await buildPublicationLab(context, slug);
    console.log(`Built ${result.relativePath.split(path.sep).join('/')}`);
    console.log(`Output: ${displayPath(result.package.publicOutputPath)}`);
    return;
  }

  const result = await validatePublicationLab(context, slug);
  if (command === 'inspect') printInspection(result);
  else printValidation(result);
  if (!result.ok) process.exitCode = 1;
};

try {
  await main();
} catch (error) {
  const exitCode = Number(error?.exitCode) === 2 ? 2 : 1;
  console.error(`${exitCode === 2 ? 'Usage error' : 'Lab command failed'}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = exitCode;
}
