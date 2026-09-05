import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const sourcePaths = [
  "README.md",
  "agent/README.md",
  "agent/authoring-contract.md",
  "package.json",
  "src/lab-kit.css",
  "src/lab-kit.js",
  "tools/build-manifest.mjs"
];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const files = [];
for (const path of sourcePaths) {
  const contents = await readFile(join(packageRoot, path));
  files.push({ path, bytes: contents.byteLength, sha256: hash(contents) });
}

const manifest = {
  schemaVersion: 1,
  name: "@examplicity/lab-kit",
  version: packageJson.version,
  purpose: "Dependency-free capabilities for source labs that compile to standalone HTML.",
  entrypoints: {
    browserScript: "src/lab-kit.js",
    css: "src/lab-kit.css"
  },
  runtime: {
    global: "LabKit",
    externalDependencies: [],
    requiresNetwork: false
  },
  files
};

await writeFile(join(packageRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${relative(packageRoot, join(packageRoot, "manifest.json"))} for ${manifest.name}@${manifest.version}.`);
