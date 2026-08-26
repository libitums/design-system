import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  outputPackages,
  prepareOutputLayout,
  sourceDirectories,
  validateSourceLayout,
} from "../src/pipeline-layout.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function createWorkspace(t) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-design-system-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await Promise.all(
    sourceDirectories.map((directory) =>
      mkdir(join(rootDirectory, directory), { recursive: true }),
    ),
  );

  return rootDirectory;
}

test("source와 output package 경계를 고정한다", () => {
  assert.deepEqual(sourceDirectories, ["foundations", "components", "assets"]);
  assert.deepEqual(outputPackages, ["design-tokens", "icons"]);
});

test("private tooling package와 지원 runtime을 고정한다", async () => {
  const packageJson = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8"),
  );
  const nodeVersion = await readFile(
    join(repositoryRoot, ".node-version"),
    "utf8",
  );

  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, "module");
  assert.equal(packageJson.engines.node, ">=24 <25");
  assert.equal(packageJson.engines.npm, ">=11 <12");
  assert.deepEqual(packageJson.scripts, {
    build: "node scripts/build.mjs",
    "check:generated": "node scripts/check-generated.mjs",
    "check:icon-bundle": "node scripts/check-icon-bundle.mjs",
    validate: "node scripts/validate.mjs",
    test: "node --test",
  });
  assert.equal(nodeVersion.trim(), "24");
});

test("필수 source 디렉터리를 검증한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  const sourcePaths = await validateSourceLayout(rootDirectory);

  assert.equal(sourcePaths.length, sourceDirectories.length);
});

test("필수 source 디렉터리가 없으면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await rm(join(rootDirectory, "foundations"), { recursive: true });

  await assert.rejects(() => validateSourceLayout(rootDirectory));
});

test("두 배포 package의 dist 디렉터리를 준비한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  const outputPaths = await prepareOutputLayout(rootDirectory);

  assert.equal(outputPaths.length, outputPackages.length);
  await Promise.all(outputPaths.map((outputPath) => access(outputPath)));
});
