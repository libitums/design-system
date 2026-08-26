import { gzipSync } from "node:zlib";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

import { createRspeedy } from "@lynx-js/rspeedy";

import { writeIconPackage } from "./icon-package-generator.mjs";

export const iconBundlePolicy = Object.freeze({
  gzipWrapperBudgetBytes: 128,
  rawWrapperBudgetBytes: 128,
  representativeIcon: "heart",
  unusedIcon: "arrow-down",
});

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function listFiles(directory) {
  const files = [];

  async function visit(currentDirectory) {
    const entries = (await readdir(currentDirectory, { withFileTypes: true })).sort(
      (left, right) => compareStrings(left.name, right.name),
    );
    for (const entry of entries) {
      const path = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile()) {
        files.push(path);
      }
    }
  }

  await visit(directory);
  return files;
}

function collectSvgModules(stats) {
  const statsItems = Array.isArray(stats.stats) ? stats.stats : [stats];
  return statsItems
    .flatMap((item) => {
      const modules = item.compilation?.modules;
      if (modules === undefined) {
        throw new Error("Rspack compilation modules are unavailable");
      }

      return [...modules]
        .map((module) => module.identifier().replaceAll("\\", "/"))
        .filter((identifier) => identifier.includes(".svg"));
    })
    .sort(compareStrings);
}

export function assertSuccessfulBuildStats(stats, name) {
  if (stats === undefined) {
    throw new Error(`Rspeedy did not return build stats for ${name}`);
  }
  if (stats.hasErrors()) {
    throw new Error(
      `Rspeedy build failed for ${name}:\n${stats.toString({
        all: false,
        colors: false,
        errors: true,
      })}`,
    );
  }
}

async function buildFixture(
  temporaryRoot,
  name,
  source,
  iconPackageDirectory,
  assetPayloads,
) {
  const rootDirectory = join(temporaryRoot, name);
  const sourceDirectory = join(rootDirectory, "src");
  const outputDirectory = join(rootDirectory, "dist");
  const installedIconPackage = join(
    rootDirectory,
    "node_modules",
    "@libitums",
    "icons",
  );
  await mkdir(sourceDirectory, { recursive: true });
  await cp(iconPackageDirectory, installedIconPackage, { recursive: true });
  await writeFile(join(rootDirectory, "package.json"), '{"type":"module"}\n');
  await writeFile(join(sourceDirectory, "index.js"), source, "utf8");

  const rspeedy = await createRspeedy({
    cwd: rootDirectory,
    loadEnv: false,
    callerName: "libitum-icon-bundle-verifier",
    rspeedyConfig: {
      mode: "production",
      output: {
        cleanDistPath: true,
        distPath: { root: outputDirectory },
        filenameHash: false,
        sourceMap: false,
      },
      performance: {
        printFileSize: false,
      },
      source: {
        entry: { main: "./src/index.js" },
      },
    },
  });

  const build = await rspeedy.build();
  try {
    const stats = build?.stats;
    assertSuccessfulBuildStats(stats, name);

    const files = [];
    let outputText = "";
    for (const file of await listFiles(outputDirectory)) {
      const contents = await readFile(file);
      outputText += contents.toString("utf8");
      files.push({
        path: relative(outputDirectory, file),
        rawBytes: contents.length,
        gzipBytes: gzipSync(contents).length,
      });
    }

    return {
      containsRepresentativePayload: outputText.includes(
        assetPayloads.representative,
      ),
      containsUnusedPayload: outputText.includes(assetPayloads.unused),
      files,
      gzipBytes: files.reduce((sum, file) => sum + file.gzipBytes, 0),
      rawBytes: files.reduce((sum, file) => sum + file.rawBytes, 0),
      svgModules: collectSvgModules(stats),
    };
  } finally {
    await build?.close?.();
  }
}

export function calculateIconBundleBudgets(sourceBytes) {
  return {
    gzipBytes: sourceBytes + iconBundlePolicy.gzipWrapperBudgetBytes,
    rawBytes:
      Math.ceil(sourceBytes / 3) * 4 +
      iconBundlePolicy.rawWrapperBudgetBytes,
  };
}

export class IconBundleVerificationError extends Error {
  constructor(errors) {
    super(
      [
        `Icon bundle verification failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${error}`),
      ].join("\n"),
    );
    this.name = "IconBundleVerificationError";
    this.errors = errors;
  }
}

export function evaluateIconBundleMeasurement(measurement) {
  const { baseline, budgets, delta, singleIcon } = measurement;
  const errors = [];
  const expectedModuleSuffix = `/@libitums/icons/${iconBundlePolicy.representativeIcon}.svg`;

  if (baseline.svgModules.length !== 0) {
    errors.push(
      `baseline must contain 0 SVG modules, received ${baseline.svgModules.length}`,
    );
  }
  if (
    singleIcon.svgModules.length !== 1 ||
    !singleIcon.svgModules[0].endsWith(expectedModuleSuffix)
  ) {
    errors.push(
      `single icon build must contain only ${iconBundlePolicy.representativeIcon}.svg, received: ${singleIcon.svgModules.join(", ") || "(none)"}`,
    );
  }
  if (!singleIcon.containsRepresentativePayload) {
    errors.push("single icon build does not contain the representative SVG payload");
  }
  if (singleIcon.containsUnusedPayload) {
    errors.push(`single icon build contains unused ${iconBundlePolicy.unusedIcon}.svg`);
  }
  for (const [buildName, build] of [
    ["baseline", baseline],
    ["single icon", singleIcon],
  ]) {
    if (
      build.files.length !== 1 ||
      build.files[0].path !== "static/js/main.js"
    ) {
      errors.push(
        `${buildName} build must emit only static/js/main.js, received: ${build.files.map((file) => file.path).join(", ") || "(none)"}`,
      );
    }
  }
  if (delta.rawBytes > budgets.rawBytes) {
    errors.push(
      `raw bundle delta ${delta.rawBytes}B exceeds ${budgets.rawBytes}B`,
    );
  }
  if (delta.gzipBytes > budgets.gzipBytes) {
    errors.push(
      `gzip bundle delta ${delta.gzipBytes}B exceeds ${budgets.gzipBytes}B`,
    );
  }

  if (errors.length > 0) {
    throw new IconBundleVerificationError(errors);
  }

  return measurement;
}

export async function measureIconBundle(rootDirectory = process.cwd()) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "libitum-icon-bundle-"));

  try {
    const iconPackage = await writeIconPackage(rootDirectory);
    const representativeFile = resolve(
      iconPackage.outputDirectory,
      `${iconBundlePolicy.representativeIcon}.svg`,
    );
    const unusedFile = resolve(
      iconPackage.outputDirectory,
      `${iconBundlePolicy.unusedIcon}.svg`,
    );
    const [representativeSource, unusedSource] = await Promise.all([
      readFile(representativeFile),
      readFile(unusedFile),
    ]);
    const assetPayloads = {
      representative: representativeSource.toString("base64"),
      unused: unusedSource.toString("base64"),
    };
    const baseline = await buildFixture(
      temporaryRoot,
      "baseline",
      'globalThis.__libitumIcon = "";\n',
      iconPackage.outputDirectory,
      assetPayloads,
    );
    const singleIcon = await buildFixture(
      temporaryRoot,
      "single-icon",
      `import icon from "@libitums/icons/${iconBundlePolicy.representativeIcon}";\nglobalThis.__libitumIcon = icon;\n`,
      iconPackage.outputDirectory,
      assetPayloads,
    );
    const sourceBytes = representativeSource.length;

    return {
      baseline,
      budgets: calculateIconBundleBudgets(sourceBytes),
      delta: {
        gzipBytes: singleIcon.gzipBytes - baseline.gzipBytes,
        rawBytes: singleIcon.rawBytes - baseline.rawBytes,
      },
      singleIcon,
      sourceBytes,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

export async function verifyIconBundle(rootDirectory = process.cwd()) {
  return evaluateIconBundleMeasurement(await measureIconBundle(rootDirectory));
}
