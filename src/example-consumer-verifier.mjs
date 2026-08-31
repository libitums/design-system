import { readFile, readdir, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { createRspeedy, loadConfig } from "@lynx-js/rspeedy";

import { buildPackages } from "./build-pipeline.mjs";
import { assertSuccessfulBuildStats } from "./icon-bundle-verifier.mjs";
import { publishedPackages } from "./package-publish-config.mjs";
import { isExportedSubpath, subpathFromSpecifier } from "./workspace-layout.mjs";

export const exampleConsumerPolicy = Object.freeze({
  directory: "examples/lynx-consumer",
  packageName: "@libitums/example-lynx-consumer",
  sourceDirectory: "src",
  // fixture가 실제로 화면에 넣는 값들입니다. 하나라도 산출물에서 사라지면
  // 소비 경로가 끊어진 것이므로 실패로 봅니다.
  requiredMarkers: Object.freeze([
    Object.freeze({
      name: "padding icon XML",
      source: { package: "@libitums/icons", file: "dist/lynx/heart.js" },
      kind: "path-data",
    }),
    Object.freeze({
      name: "no-padding icon XML",
      source: {
        package: "@libitums/icons",
        file: "dist/lynx/no-padding/heart.js",
      },
      kind: "path-data",
    }),
  ]),
  requiredLiterals: Object.freeze([
    Object.freeze({ name: "brand color token", value: "#F46B18" }),
    Object.freeze({ name: "icon size CSS variable", value: "--libitum-icon-size-md" }),
    Object.freeze({
      name: "typography CSS variable",
      value: "--libitum-typography-heading-s-font-size",
    }),
  ]),
});

const importPattern = /(?:^|[\s;(])(?:import|export)[^"']*?["']([^"']+)["']/gm;

export class ExampleConsumerVerificationError extends Error {
  constructor(errors) {
    super(
      [
        `Example consumer verification failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${error}`),
      ].join("\n"),
    );
    this.name = "ExampleConsumerVerificationError";
    this.errors = errors;
  }
}

export function extractPackageSpecifiers(source) {
  const specifiers = new Set();
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith("@libitums/")) {
      specifiers.add(specifier);
    }
  }
  return [...specifiers].sort();
}

export function classifySpecifiers(specifiers, manifests) {
  const publicSpecifiers = [];
  const privateSpecifiers = [];

  for (const specifier of specifiers) {
    const owner = manifests.find(
      (manifest) => subpathFromSpecifier(specifier, manifest.name) !== undefined,
    );
    if (owner === undefined) {
      privateSpecifiers.push(`${specifier} is not owned by a published package`);
      continue;
    }

    const subpath = subpathFromSpecifier(specifier, owner.name);
    if (isExportedSubpath(subpath, owner.exports)) {
      publicSpecifiers.push(specifier);
    } else {
      privateSpecifiers.push(
        `${specifier} is not an export of ${owner.name}`,
      );
    }
  }

  return { publicSpecifiers, privateSpecifiers };
}

function pathData(module) {
  const match = /\sd=\\"([^"\\]+)\\"/.exec(module);
  if (match === null) {
    throw new Error("Lynx icon module has no path data to use as a marker");
  }
  return match[1];
}

async function listFiles(directory) {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

async function readSourceFiles(sourceDirectory) {
  const files = await listFiles(sourceDirectory);
  return Promise.all(
    files.map(async (file) => ({
      path: file,
      contents: await readFile(file, "utf8"),
    })),
  );
}

export function evaluateExampleConsumerMeasurement(measurement) {
  const { emittedFiles, missingMarkers, privateSpecifiers, publicSpecifiers } =
    measurement;
  const errors = [];

  if (publicSpecifiers.length === 0) {
    errors.push("fixture must import at least one design-system package path");
  }
  for (const reason of privateSpecifiers) {
    errors.push(`fixture uses a non-public path: ${reason}`);
  }
  for (const marker of missingMarkers) {
    errors.push(`build output is missing the ${marker}`);
  }
  if (emittedFiles.length === 0) {
    errors.push("build emitted no files");
  }

  if (errors.length > 0) {
    throw new ExampleConsumerVerificationError(errors);
  }

  return measurement;
}

export async function measureExampleConsumer(rootDirectory = process.cwd()) {
  await buildPackages(rootDirectory);

  const fixtureDirectory = resolve(
    rootDirectory,
    exampleConsumerPolicy.directory,
  );
  const outputDirectory = join(fixtureDirectory, "dist");
  const manifests = await Promise.all(
    publishedPackages.map(async (definition) =>
      JSON.parse(
        await readFile(
          resolve(rootDirectory, definition.directory, "package.json"),
          "utf8",
        ),
      ),
    ),
  );

  const sourceFiles = await readSourceFiles(
    join(fixtureDirectory, exampleConsumerPolicy.sourceDirectory),
  );
  const specifiers = extractPackageSpecifiers(
    sourceFiles.map((file) => file.contents).join("\n"),
  );
  const { publicSpecifiers, privateSpecifiers } = classifySpecifiers(
    specifiers,
    manifests,
  );

  const markers = await Promise.all(
    exampleConsumerPolicy.requiredMarkers.map(async (marker) => {
      const definition = publishedPackages.find(
        (candidate) => candidate.name === marker.source.package,
      );
      const module = await readFile(
        resolve(rootDirectory, definition.directory, marker.source.file),
        "utf8",
      );
      return { name: marker.name, value: pathData(module) };
    }),
  );

  await rm(outputDirectory, { recursive: true, force: true });

  const { content: rspeedyConfig } = await loadConfig({ cwd: fixtureDirectory });
  const rspeedy = await createRspeedy({
    cwd: fixtureDirectory,
    loadEnv: false,
    callerName: "libitum-example-consumer-verifier",
    rspeedyConfig: { ...rspeedyConfig, mode: "production" },
  });

  const build = await rspeedy.build();
  try {
    assertSuccessfulBuildStats(build?.stats, exampleConsumerPolicy.packageName);

    const emittedFiles = [];
    let outputText = "";
    for (const file of await listFiles(outputDirectory)) {
      const contents = await readFile(file);
      outputText += contents.toString("utf8");
      emittedFiles.push({
        path: relative(outputDirectory, file),
        rawBytes: contents.length,
      });
    }

    const missingMarkers = [
      ...markers,
      ...exampleConsumerPolicy.requiredLiterals,
    ]
      .filter(({ value }) => !outputText.includes(value))
      .map(({ name }) => name);

    return {
      emittedFiles,
      missingMarkers,
      privateSpecifiers,
      publicSpecifiers,
    };
  } finally {
    await build?.close?.();
  }
}

export async function verifyExampleConsumer(rootDirectory = process.cwd()) {
  return evaluateExampleConsumerMeasurement(
    await measureExampleConsumer(rootDirectory),
  );
}
