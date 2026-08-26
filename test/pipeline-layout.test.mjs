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

test("PR과 main에서 검증 종류별 CI job을 실행한다", async () => {
  const workflow = await readFile(
    join(repositoryRoot, ".github", "workflows", "validate.yml"),
    "utf8",
  );

  assert.match(workflow, /^on:\n  pull_request:\n  push:\n    branches:\n      - main$/m);
  assert.match(workflow, /^permissions:\n  contents: read$/m);
  assert.match(workflow, /^  group: validate-.*github\.workflow.*github\.ref.*$/m);
  assert.match(workflow, /^  cancel-in-progress: true$/m);
  assert.match(workflow, /^    name: \$\{\{ matrix\.name \}\}$/m);
  assert.match(workflow, /^    runs-on: ubuntu-24\.04$/m);
  assert.match(workflow, /^      fail-fast: false$/m);
  assert.match(workflow, /^        uses: actions\/checkout@v6$/m);
  assert.match(workflow, /^        uses: actions\/setup-node@v6$/m);
  assert.match(workflow, /^          node-version-file: \.node-version$/m);
  assert.match(workflow, /^          cache: npm$/m);
  assert.match(workflow, /^          cache-dependency-path: package-lock\.json$/m);
  assert.match(workflow, /^        run: npm install --global npm@11\.16\.0$/m);
  assert.match(workflow, /^        run: npm ci$/m);

  for (const command of [
    "npm run validate",
    "npm test",
    "npm run build",
    "npm run check:generated",
    "npm run check:icon-bundle",
  ]) {
    assert.match(workflow, new RegExp(`^            command: ${command}$`, "m"));
  }
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
