import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

import { validateSvgIcons } from "./svg-icon-validator.mjs";

const copyChunkSize = 64;

export const iconPackageOutputPaths = Object.freeze({
  declaration: "packages/icons/dist/svg.d.ts",
  lynxDeclaration: "packages/icons/dist/lynx/svg-content.d.ts",
  lynxHelper: "packages/icons/dist/lynx/index.js",
  lynxHelperDeclaration: "packages/icons/dist/lynx/index.d.ts",
  manifest: "packages/icons/dist/manifest.json",
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
  const filesByCategory = await Promise.all(
    categories.map(async (category) => {
      const categoryDirectory = join(paddingDirectory, category);
      const fileNames = (await readdir(categoryDirectory, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
        .map((entry) => entry.name)
        .sort(compareStrings);

      return { category, fileNames };
    }),
  );
  const icons = [];
  const exportNames = new Map();

  for (const { category, fileNames } of filesByCategory) {
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

function generateLynxDeclaration() {
  return [
    "/* Generated for Lynx SVG XML exports. Do not edit directly. */",
    "declare const content: string;",
    "export default content;",
    "",
  ].join("\n");
}

function generateLynxHelper() {
  return [
    "/* Generated Lynx icon helpers. Do not edit directly. */",
    "const currentColorPattern = /currentColor/gi;",
    "",
    "export function withIconColor(content, color) {",
    "  if (typeof content !== \"string\") {",
    "    throw new TypeError(\"Icon content must be a string\");",
    "  }",
    "  if (typeof color !== \"string\" || color === \"\") {",
    "    throw new TypeError(\"Icon color must be a non-empty string\");",
    "  }",
    "  return content.replace(currentColorPattern, () => color);",
    "}",
    "",
  ].join("\n");
}

function generateLynxHelperDeclaration() {
  return [
    "/* Generated Lynx icon helpers. Do not edit directly. */",
    "export declare function withIconColor(content: string, color: string): string;",
    "",
  ].join("\n");
}

export function generateLynxModule(svgContent) {
  return `export default ${JSON.stringify(svgContent)};\n`;
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

export async function generateIconPackage(rootDirectory = process.cwd()) {
  const validation = await validateSvgIcons(rootDirectory);
  const icons = await collectIconEntries(rootDirectory);

  if (icons.length !== validation.pairCount) {
    throw new Error(
      `Expected ${validation.pairCount} icon exports, received ${icons.length}`,
    );
  }

  return {
    declaration: generateAssetDeclaration(),
    icons,
    lynxDeclaration: generateLynxDeclaration(),
    lynxHelper: generateLynxHelper(),
    lynxHelperDeclaration: generateLynxHelperDeclaration(),
    manifest: generateManifest(icons),
    validation,
  };
}

export async function writeIconPackage(rootDirectory = process.cwd()) {
  const result = await generateIconPackage(rootDirectory);
  const packageDirectory = resolve(rootDirectory, "packages", "icons");
  const outputDirectory = resolve(packageDirectory, "dist");
  const noPaddingOutputDirectory = join(outputDirectory, "no-padding");
  const lynxOutputDirectory = join(outputDirectory, "lynx");
  const lynxNoPaddingOutputDirectory = join(lynxOutputDirectory, "no-padding");

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(noPaddingOutputDirectory, { recursive: true });
  await mkdir(lynxNoPaddingOutputDirectory, { recursive: true });

  for (let index = 0; index < result.icons.length; index += copyChunkSize) {
    const chunk = result.icons.slice(index, index + copyChunkSize);
    await Promise.all(
      chunk.flatMap(({ category, exportName, fileName }) =>
        [
          ["padding", outputDirectory, lynxOutputDirectory],
          ["no-padding", noPaddingOutputDirectory, lynxNoPaddingOutputDirectory],
        ].map(async ([variant, assetDirectory, lynxDirectory]) => {
          const svg = await readFile(
            resolve(rootDirectory, "assets", "icons", variant, category, fileName),
            "utf8",
          );

          await Promise.all([
            writeFile(join(assetDirectory, `${exportName}.svg`), svg, "utf8"),
            writeFile(
              join(lynxDirectory, `${exportName}.js`),
              generateLynxModule(svg),
              "utf8",
            ),
          ]);
        }),
      ),
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
    writeFile(outputFiles.lynxDeclaration, result.lynxDeclaration, "utf8"),
    writeFile(outputFiles.lynxHelper, result.lynxHelper, "utf8"),
    writeFile(
      outputFiles.lynxHelperDeclaration,
      result.lynxHelperDeclaration,
      "utf8",
    ),
  ]);

  return {
    ...result,
    outputDirectory,
    outputFiles,
    lynxModuleCount: result.icons.length * 2,
    packageDirectory,
    svgFileCount: result.icons.length * 2,
  };
}
