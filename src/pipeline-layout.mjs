import { access, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

export const sourceDirectories = Object.freeze([
  "foundations",
  "components",
  "assets",
]);

export const outputPackages = Object.freeze([
  "design-tokens",
  "icons",
]);

export const generatedOutputRoot = "dist";

export async function validateSourceLayout(rootDirectory = process.cwd()) {
  for (const directory of sourceDirectories) {
    const sourcePath = resolve(rootDirectory, directory);
    await access(sourcePath);

    if (!(await stat(sourcePath)).isDirectory()) {
      throw new Error(`Source path must be a directory: ${directory}`);
    }
  }

  return sourceDirectories.map((directory) => resolve(rootDirectory, directory));
}

export async function prepareOutputLayout(rootDirectory = process.cwd()) {
  await validateSourceLayout(rootDirectory);

  const outputPaths = outputPackages.map((packageName) =>
    resolve(rootDirectory, generatedOutputRoot, packageName),
  );

  await Promise.all(
    outputPaths.map((outputPath) => mkdir(outputPath, { recursive: true })),
  );

  return outputPaths;
}
