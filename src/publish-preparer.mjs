import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  npmRegistry,
  packageRepository,
  publishedPackages,
} from "./package-publish-config.mjs";

const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const commitShaPattern = /^[0-9a-f]{7,40}$/i;

function assertStableVersion(version) {
  if (!stableVersionPattern.test(version)) {
    throw new Error(`Root package version must be stable SemVer: ${version}`);
  }
}

export function createPublishPlan({
  channel,
  defaultBranch,
  refName,
  rootVersion,
  runNumber,
  sha,
}) {
  if (!new Set(["stable", "canary"]).has(channel)) {
    throw new Error(`Publish channel must be stable or canary: ${channel}`);
  }

  assertStableVersion(rootVersion);

  if (channel === "stable") {
    if (refName !== defaultBranch) {
      throw new Error(
        `Stable packages can only be published from ${defaultBranch}; received ${refName}`,
      );
    }
    if (rootVersion === "0.0.0") {
      throw new Error(
        "0.0.0 is a development version and cannot be published as stable",
      );
    }

    return {
      channel,
      npmTag: "latest",
      version: rootVersion,
    };
  }

  if (!/^[1-9]\d*$/.test(String(runNumber))) {
    throw new Error(`GitHub run number must be a positive integer: ${runNumber}`);
  }
  if (!commitShaPattern.test(sha)) {
    throw new Error(`GitHub commit SHA is invalid: ${sha}`);
  }

  return {
    channel,
    npmTag: "canary",
    version: `${rootVersion}-canary.${runNumber}.${sha.slice(0, 7).toLowerCase()}`,
  };
}

function assertRootVersions(rootPackage, packageLock) {
  const versions = [
    rootPackage.version,
    packageLock.version,
    packageLock.packages?.[""]?.version,
  ];
  if (versions.some((version) => version !== rootPackage.version)) {
    throw new Error(
      `package.json and package-lock.json versions must match: ${versions.join(", ")}`,
    );
  }
}

function assertPackageManifest(manifest, definition, rootVersion) {
  if (manifest.name !== definition.name) {
    throw new Error(
      `Expected ${definition.name} in ${definition.directory}, received ${manifest.name}`,
    );
  }
  if (manifest.version !== rootVersion) {
    throw new Error(
      `${definition.name} version ${manifest.version} does not match root ${rootVersion}`,
    );
  }
  if (
    manifest.publishConfig?.registry !== npmRegistry ||
    manifest.publishConfig?.access !== "restricted"
  ) {
    throw new Error(`${definition.name} is not configured for private GitHub Packages`);
  }
  if (
    manifest.repository?.type !== packageRepository.type ||
    manifest.repository?.url !== packageRepository.url
  ) {
    throw new Error(`${definition.name} is not linked to the source repository`);
  }
}

function assertStableChangelog(changelog, version) {
  const escapedVersion = version.replaceAll(".", "\\.");
  const releaseHeading = new RegExp(
    `^## \\[${escapedVersion}\\] - \\d{4}-\\d{2}-\\d{2}$`,
    "m",
  );
  if (!releaseHeading.test(changelog)) {
    throw new Error(`CHANGELOG.md has no dated ${version} release section`);
  }
}

export async function preparePublish(
  rootDirectory = process.cwd(),
  context,
) {
  const [rootPackage, packageLock] = await Promise.all(
    ["package.json", "package-lock.json"].map(async (fileName) =>
      JSON.parse(await readFile(resolve(rootDirectory, fileName), "utf8")),
    ),
  );
  assertRootVersions(rootPackage, packageLock);

  const plan = createPublishPlan({
    ...context,
    rootVersion: rootPackage.version,
  });
  const packages = [];

  for (const definition of publishedPackages) {
    const directory = resolve(rootDirectory, definition.directory);
    const manifestPath = resolve(directory, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    assertPackageManifest(manifest, definition, rootPackage.version);

    if (plan.channel === "canary") {
      manifest.version = plan.version;
      await writeFile(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf8",
      );
    }

    packages.push({
      ...definition,
      directory,
      manifestPath,
    });
  }

  if (plan.channel === "stable") {
    const changelog = await readFile(
      resolve(rootDirectory, "CHANGELOG.md"),
      "utf8",
    );
    assertStableChangelog(changelog, plan.version);
  }

  return {
    ...plan,
    packages,
  };
}
