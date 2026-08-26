import { execFile } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";

import { npmRegistry, publishedPackages } from "./package-publish-config.mjs";

const execFileAsync = promisify(execFile);

async function executeNpm(arguments_, options = {}) {
  return execFileAsync("npm", arguments_, {
    ...options,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function commandOutput(error) {
  return `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
}

export async function packageVersionExists(
  name,
  version,
  { execute = executeNpm, registry = npmRegistry } = {},
) {
  try {
    const { stdout } = await execute([
      "view",
      `${name}@${version}`,
      "version",
      "--json",
      `--registry=${registry}`,
    ]);
    const publishedVersion = JSON.parse(stdout.trim());
    if (publishedVersion !== version) {
      throw new Error(
        `Registry returned unexpected version for ${name}@${version}: ${publishedVersion}`,
      );
    }
    return true;
  } catch (error) {
    const output = commandOutput(error);
    if (/\bE404\b|404 Not Found/i.test(output)) {
      return false;
    }
    throw new Error(`Could not check ${name}@${version} in ${registry}`, {
      cause: error,
    });
  }
}

export async function publishPackages({
  npmTag,
  packages = publishedPackages,
  registry = npmRegistry,
  rootDirectory = process.cwd(),
  version,
  execute = executeNpm,
}) {
  const existence = await Promise.all(
    packages.map(async (package_) => ({
      package_,
      exists: await packageVersionExists(package_.name, version, {
        execute,
        registry,
      }),
    })),
  );
  const results = [];

  for (const { exists, package_ } of existence) {
    if (exists) {
      results.push({ ...package_, status: "already-published" });
      continue;
    }

    await execute([
      "publish",
      isAbsolute(package_.directory)
        ? package_.directory
        : resolve(rootDirectory, package_.directory),
      `--tag=${npmTag}`,
      `--registry=${registry}`,
      "--access=restricted",
    ]);
    results.push({ ...package_, status: "published" });
  }

  return results;
}

export function packagePageUrl(owner, package_) {
  if (!/^[A-Za-z0-9-]+$/.test(owner)) {
    throw new Error(`Invalid GitHub repository owner: ${owner}`);
  }
  return `https://github.com/orgs/${owner}/packages/npm/package/${package_.pageSlug}`;
}

export function publishSummary({ channel, npmTag, owner, results, version }) {
  return [
    "## npm package publish",
    "",
    `- Channel: \`${channel}\``,
    `- Version: \`${version}\``,
    `- dist-tag: \`${npmTag}\``,
    "",
    "| Package | Result | URL |",
    "|---|---|---|",
    ...results.map(
      (result) =>
        `| \`${result.name}\` | ${result.status} | [GitHub Packages](${packagePageUrl(owner, result)}) |`,
    ),
    "",
  ].join("\n");
}
