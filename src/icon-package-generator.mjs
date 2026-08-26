import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

import { validateSvgIcons } from "./svg-icon-validator.mjs";

const copyChunkSize = 64;
const packageName = "@libitum/icons";

export const iconPackageOutputPaths = Object.freeze({
  declaration: "dist/icons/svg.d.ts",
  manifest: "dist/icons/manifest.json",
  packageManifest: "dist/icons/package.json",
});

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function toIconExportName(sourceName) {
  const extension = extname(sourceName);
  const name =
    extension.toLowerCase() === ".svg"
      ? basename(sourceName, extension)
      : sourceName;
  const exportName = name
    .normalize("NFKD")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(exportName)) {
    throw new Error(`Cannot create a safe icon export name from: ${sourceName}`);
  }

  return exportName;
}

async function collectIconEntries(rootDirectory) {
  const paddingDirectory = resolve(
    rootDirectory,
    "assets",
    "icons",
    "padding",
  );
  const categories = (await readdir(paddingDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareStrings);
  const icons = [];
  const exportNames = new Map();

  for (const category of categories) {
    const categoryDirectory = join(paddingDirectory, category);
    const fileNames = (await readdir(categoryDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
      .map((entry) => entry.name)
      .sort(compareStrings);

    for (const fileName of fileNames) {
      const sourceName = basename(fileName, ".svg");
      const exportName = toIconExportName(sourceName);
      const existing = exportNames.get(exportName);
      if (existing !== undefined) {
        throw new Error(
          `Icon export name collision: ${existing.category}/${existing.fileName} and ${category}/${fileName} both map to ${exportName}`,
        );
      }

      const icon = {
        category,
        exportName,
        fileName,
        sourceName,
      };
      exportNames.set(exportName, icon);
      icons.push(icon);
    }
  }

  icons.sort((left, right) => compareStrings(left.exportName, right.exportName));
  return icons;
}

function generateAssetDeclaration() {
  return [
    "/* Generated for individual SVG asset exports. Do not edit directly. */",
    "declare const source: string;",
    "export default source;",
    "",
  ].join("\n");
}

function generateManifest(icons) {
  return `${JSON.stringify(
    {
      icons: icons.map(({ category, exportName, sourceName }) => ({
        name: exportName,
        sourceName,
        category,
        variants: {
          padding: `./${exportName}`,
          "no-padding": `./no-padding/${exportName}`,
        },
      })),
    },
    null,
    2,
  )}\n`;
}

function generatePackageManifest(version, icons) {
  const exports = {
    "./manifest.json": "./manifest.json",
    "./package.json": "./package.json",
  };

  for (const { exportName } of icons) {
    exports[`./${exportName}`] = {
      types: "./svg.d.ts",
      default: `./${exportName}.svg`,
    };
    exports[`./no-padding/${exportName}`] = {
      types: "./svg.d.ts",
      default: `./no-padding/${exportName}.svg`,
    };
  }

  return `${JSON.stringify(
    {
      name: packageName,
      version,
      type: "module",
      sideEffects: false,
      files: ["*.svg", "no-padding", "manifest.json", "svg.d.ts"],
      exports,
    },
    null,
    2,
  )}\n`;
}

export async function generateIconPackage(rootDirectory = process.cwd()) {
  const validation = await validateSvgIcons(rootDirectory);
  const icons = await collectIconEntries(rootDirectory);
  const rootPackage = JSON.parse(
    await readFile(resolve(rootDirectory, "package.json"), "utf8"),
  );

  if (icons.length !== validation.pairCount) {
    throw new Error(
      `Expected ${validation.pairCount} icon exports, received ${icons.length}`,
    );
  }

  return {
    declaration: generateAssetDeclaration(),
    icons,
    manifest: generateManifest(icons),
    packageManifest: generatePackageManifest(rootPackage.version, icons),
    validation,
  };
}

export async function writeIconPackage(rootDirectory = process.cwd()) {
  const result = await generateIconPackage(rootDirectory);
  const outputDirectory = resolve(rootDirectory, "dist", "icons");
  const noPaddingOutputDirectory = join(outputDirectory, "no-padding");

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(noPaddingOutputDirectory, { recursive: true });

  for (let index = 0; index < result.icons.length; index += copyChunkSize) {
    const chunk = result.icons.slice(index, index + copyChunkSize);
    await Promise.all(
      chunk.flatMap(({ category, exportName, fileName }) => [
        copyFile(
          resolve(
            rootDirectory,
            "assets",
            "icons",
            "padding",
            category,
            fileName,
          ),
          join(outputDirectory, `${exportName}.svg`),
        ),
        copyFile(
          resolve(
            rootDirectory,
            "assets",
            "icons",
            "no-padding",
            category,
            fileName,
          ),
          join(noPaddingOutputDirectory, `${exportName}.svg`),
        ),
      ]),
    );
  }

  const outputFiles = Object.fromEntries(
    Object.entries(iconPackageOutputPaths).map(([name, path]) => [
      name,
      resolve(rootDirectory, path),
    ]),
  );
  await Promise.all([
    writeFile(outputFiles.declaration, result.declaration, "utf8"),
    writeFile(outputFiles.manifest, result.manifest, "utf8"),
    writeFile(outputFiles.packageManifest, result.packageManifest, "utf8"),
  ]);

  return {
    ...result,
    outputDirectory,
    outputFiles,
    svgFileCount: result.icons.length * 2,
  };
}
