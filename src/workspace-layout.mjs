import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

import { publishedPackages } from "./package-publish-config.mjs";

export const workspaceGlobs = Object.freeze(["packages/*", "examples/*"]);

export const layerOrder = Object.freeze([
  "source",
  "tooling",
  "packages",
  "examples",
]);

export const workspaceDirectories = Object.freeze([
  Object.freeze({
    path: "foundations",
    layer: "source",
    responsibility: "원본 토큰·정책",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "components",
    layer: "source",
    responsibility: "원본 컴포넌트 스펙",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "assets",
    layer: "source",
    responsibility: "원본 아이콘·폰트",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "src",
    plannedPath: "tooling",
    layer: "tooling",
    responsibility: "generator·validator·release 도구",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "scripts",
    layer: "tooling",
    responsibility: "루트 명령 진입점",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "test",
    layer: "tooling",
    responsibility: "저장소 단위 검증",
    workspace: false,
    publishable: false,
  }),
  Object.freeze({
    path: "packages",
    layer: "packages",
    responsibility: "배포 가능한 플랫폼별 package",
    workspace: true,
    publishable: true,
  }),
  Object.freeze({
    path: "examples",
    layer: "examples",
    responsibility: "design-system 소유 private 소비 fixture·Host",
    workspace: true,
    publishable: false,
  }),
]);

export class WorkspaceLayoutValidationError extends Error {
  constructor(errors) {
    super(
      ["Workspace layout contract is violated:", ...errors.map((error) => `- ${error}`)].join(
        "\n",
      ),
    );
    this.name = "WorkspaceLayoutValidationError";
    this.errors = errors;
  }
}

export function layerRank(layer) {
  const rank = layerOrder.indexOf(layer);
  if (rank === -1) {
    throw new Error(`Unknown workspace layer: ${layer}`);
  }
  return rank;
}

export function isAllowedDependency(fromLayer, toLayer) {
  return layerRank(toLayer) <= layerRank(fromLayer);
}

export function assertDependencyDirection(fromLayer, toLayer) {
  if (!isAllowedDependency(fromLayer, toLayer)) {
    throw new Error(
      `Reverse dependency is not allowed: ${fromLayer} must not depend on ${toLayer}`,
    );
  }
}

export function workspaceDirectory(path) {
  return workspaceDirectories.find((directory) => directory.path === path);
}

export function subpathFromSpecifier(specifier, packageName) {
  if (specifier === packageName) {
    return ".";
  }
  if (!specifier.startsWith(`${packageName}/`)) {
    return undefined;
  }
  return `./${specifier.slice(packageName.length + 1)}`;
}

export function isExportedSubpath(subpath, exportsField) {
  if (exportsField === undefined) {
    return subpath === ".";
  }
  if (typeof exportsField === "string") {
    return subpath === ".";
  }
  if (exportsField === null || typeof exportsField !== "object") {
    return false;
  }

  for (const pattern of Object.keys(exportsField)) {
    if (pattern === subpath) {
      return true;
    }

    const wildcardIndex = pattern.indexOf("*");
    if (wildcardIndex === -1) {
      continue;
    }

    const prefix = pattern.slice(0, wildcardIndex);
    const suffix = pattern.slice(wildcardIndex + 1);
    if (
      subpath.length > prefix.length + suffix.length &&
      subpath.startsWith(prefix) &&
      subpath.endsWith(suffix)
    ) {
      return true;
    }
  }

  return false;
}

export function assertPublicPackageSpecifier(specifier, manifest) {
  const subpath = subpathFromSpecifier(specifier, manifest.name);
  if (subpath === undefined) {
    return;
  }
  if (!isExportedSubpath(subpath, manifest.exports)) {
    throw new Error(
      `Private path import is not allowed: ${specifier} is not an export of ${manifest.name}`,
    );
  }
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

async function readJsonFile(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function listWorkspaceMembers(rootDirectory, directory) {
  const directoryPath = resolve(rootDirectory, directory.path);
  const members = [];

  let entries;
  try {
    entries = await readdir(directoryPath, { withFileTypes: true });
  } catch {
    return members;
  }

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (!entry.isDirectory()) {
      continue;
    }

    const memberPath = `${directory.path}/${entry.name}`;
    const manifest = await readJsonFile(
      resolve(rootDirectory, memberPath, "package.json"),
    );
    if (manifest === null || typeof manifest !== "object") {
      continue;
    }

    members.push({
      directory,
      layer: directory.layer,
      manifest,
      path: memberPath,
    });
  }

  return members;
}

export async function listWorkspacePackages(rootDirectory = process.cwd()) {
  const members = [];

  for (const directory of workspaceDirectories.filter(
    (candidate) => candidate.workspace,
  )) {
    members.push(...(await listWorkspaceMembers(rootDirectory, directory)));
  }

  return members;
}

export function validateWorkspaceDependencies(members) {
  const byName = new Map(members.map((member) => [member.manifest.name, member]));
  const errors = [];

  for (const member of members) {
    const dependencies = {
      ...member.manifest.dependencies,
      ...member.manifest.devDependencies,
      ...member.manifest.peerDependencies,
    };

    for (const name of Object.keys(dependencies)) {
      const target = byName.get(name);
      if (target === undefined) {
        continue;
      }
      if (!isAllowedDependency(member.layer, target.layer)) {
        errors.push(
          `${member.path} (${member.layer}) must not depend on ${target.path} (${target.layer})`,
        );
      }
    }
  }

  return errors;
}

function validateWorkspaceMembers(members) {
  const errors = [];

  for (const member of members) {
    const { directory } = member;

    if (!directory.publishable && member.manifest.private !== true) {
      errors.push(`${member.path} must set "private": true`);
    }
    if (directory.publishable && member.manifest.private === true) {
      errors.push(`${member.path} is publishable and must not set "private": true`);
    }
  }

  return errors;
}

export function validatePublishAllowlist(packages = publishedPackages) {
  const errors = [];

  if (packages.length === 0) {
    errors.push("Publish allowlist must name at least one package");
  }

  for (const definition of packages) {
    const root = definition.directory.split("/")[0];
    const directory = workspaceDirectory(root);

    if (directory === undefined) {
      errors.push(
        `Publish allowlist must not include an unrecognized directory: ${definition.directory}`,
      );
      continue;
    }
    if (!directory.publishable) {
      errors.push(
        `Publish allowlist must not include ${definition.directory} from the ${directory.layer} layer`,
      );
    }
  }

  return errors;
}

async function validateRootManifest(rootDirectory) {
  const errors = [];
  const manifest = await readJsonFile(resolve(rootDirectory, "package.json"));

  if (manifest === null || typeof manifest !== "object") {
    errors.push("Root package.json is missing or is not an object");
    return errors;
  }
  if (manifest.private !== true) {
    errors.push('Root package.json must set "private": true');
  }

  const declared = manifest.workspaces;
  if (
    !Array.isArray(declared) ||
    declared.length !== workspaceGlobs.length ||
    declared.some((glob, index) => glob !== workspaceGlobs[index])
  ) {
    const received = Array.isArray(declared)
      ? declared.join(", ")
      : JSON.stringify(declared);
    errors.push(
      `Root package.json must declare workspaces ${workspaceGlobs.join(", ")}; received ${received || "(none)"}`,
    );
  }

  return errors;
}

export async function validateWorkspaceLayout(rootDirectory = process.cwd()) {
  const errors = [...(await validateRootManifest(rootDirectory))];

  for (const directory of workspaceDirectories) {
    if (!(await isDirectory(resolve(rootDirectory, directory.path)))) {
      errors.push(`Workspace path must be a directory: ${directory.path}`);
    }
  }

  const members = await listWorkspacePackages(rootDirectory);
  errors.push(...validateWorkspaceMembers(members));
  errors.push(...validateWorkspaceDependencies(members));
  errors.push(...validatePublishAllowlist());

  if (errors.length > 0) {
    throw new WorkspaceLayoutValidationError(errors);
  }

  return {
    directoryCount: workspaceDirectories.length,
    packageCount: members.filter((member) => member.layer === "packages").length,
    exampleCount: members.filter((member) => member.layer === "examples").length,
    publishedPackageCount: publishedPackages.length,
  };
}
