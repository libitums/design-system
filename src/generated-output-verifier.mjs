import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

import { buildPackages } from "./build-pipeline.mjs";

const execFileAsync = promisify(execFile);

const workspaceInputs = Object.freeze([
  "assets",
  "components",
  "foundations",
  "package.json",
]);

async function listFiles(directory) {
  const files = [];

  async function visit(currentDirectory) {
    const entries = (await readdir(currentDirectory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      const entryPath = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  await visit(directory);
  return files;
}

function portablePath(path) {
  return path.split(sep).join("/");
}

export async function snapshotGeneratedOutput(outputDirectory) {
  const files = await listFiles(outputDirectory);
  const snapshot = new Map();

  for (const file of files) {
    const contents = await readFile(file);
    const path = portablePath(relative(outputDirectory, file));
    snapshot.set(path, createHash("sha256").update(contents).digest("hex"));
  }

  return snapshot;
}

export class GeneratedOutputMismatchError extends Error {
  constructor(differences) {
    super(
      [
        "Generated output is not deterministic:",
        ...differences.map((difference) => `- ${difference}`),
      ].join("\n"),
    );
    this.name = "GeneratedOutputMismatchError";
    this.differences = differences;
  }
}

export function compareGeneratedSnapshots(first, second) {
  const paths = [...new Set([...first.keys(), ...second.keys()])].sort();
  const differences = [];

  for (const path of paths) {
    if (!first.has(path)) {
      differences.push(`only in second build: ${path}`);
    } else if (!second.has(path)) {
      differences.push(`only in first build: ${path}`);
    } else if (first.get(path) !== second.get(path)) {
      differences.push(`content changed: ${path}`);
    }
  }

  if (differences.length > 0) {
    throw new GeneratedOutputMismatchError(differences);
  }

  return {
    fileCount: paths.length,
    files: paths,
  };
}

async function copyWorkspace(sourceRoot, targetRoot) {
  for (const input of workspaceInputs) {
    await cp(resolve(sourceRoot, input), resolve(targetRoot, input), {
      recursive: true,
    });
  }
}

export async function verifyGeneratedOutputDeterminism(
  rootDirectory = process.cwd(),
) {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "libitum-generated-output-"),
  );

  try {
    await copyWorkspace(rootDirectory, temporaryRoot);
    await buildPackages(temporaryRoot);
    const first = await snapshotGeneratedOutput(
      resolve(temporaryRoot, "dist"),
    );

    await buildPackages(temporaryRoot);
    const second = await snapshotGeneratedOutput(
      resolve(temporaryRoot, "dist"),
    );

    return compareGeneratedSnapshots(first, second);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function gitStatus(rootDirectory) {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: rootDirectory },
  );
  return stdout;
}

export class GeneratedWorktreeMutationError extends Error {
  constructor(before, after) {
    super(
      [
        "Build created uncommitted worktree changes.",
        `Before: ${before === "" ? "(clean)" : before.trimEnd()}`,
        `After: ${after === "" ? "(clean)" : after.trimEnd()}`,
      ].join("\n"),
    );
    this.name = "GeneratedWorktreeMutationError";
    this.before = before;
    this.after = after;
  }
}

export async function assertGitWorktreeUnchanged(
  rootDirectory,
  action = () => buildPackages(rootDirectory),
) {
  const before = await gitStatus(rootDirectory);
  await action();
  const after = await gitStatus(rootDirectory);

  if (before !== after) {
    throw new GeneratedWorktreeMutationError(before, after);
  }
}

export async function verifyGeneratedOutputs(rootDirectory = process.cwd()) {
  await assertGitWorktreeUnchanged(rootDirectory);
  return verifyGeneratedOutputDeterminism(rootDirectory);
}
